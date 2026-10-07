import { patchEmployeeTaxes, postEmployeeTaxes } from '@/app/helpers/backend';
import LogoLoader from '@/components/MainLoader/logo-loader';
import Button from '@/components/ui/RawButton';
import { USStates, US_STATES_SELECTABLE_IN_TAX_INFO } from '@/lib/helpers/UsaStates';
import {
  BADGE_TONE_CLASS,
  buildExemptFields,
  getFederalExemptExpiry,
  getStateAdapter,
  getTaxProfileBadges,
  isFederalExempt,
  parseExemptFields,
  resolveTaxLocation,
  STATE_NOTE_CLASS,
  StateExtraField,
} from '@/lib/helpers/w4TaxConfig';
import { toast } from '@/lib/ToastService';
import { calculateNYStateTax } from '@/utils/SalaryProcess';
import React, { useEffect, useMemo, useState } from 'react';
import { FiEdit } from 'react-icons/fi';

const holdingChoices = [
  {
    title: 'Single Or Married Filing Separatley',
    value: 'SINGLE_OR_MARRIED_FILING_SEPARATLEY',
  },
  {
    title: 'Married Filing Jointly Or Qualifying Widow',
    value: 'MARRIED_FILING_JOINTLY_OR_QUALIYING_WIDOW',
  },
  {
    title: 'Head Of Houshold',
    value: 'HEAD_OF_HOUSHOLD',
  },
  {
    title: 'Exempt',
    value: 'EXEMPT',
  },
];

const inputCls =
  'rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black disabled:bg-gray-50 disabled:text-gray-500';

/* USD formatter for the auto-calculated Step 3 credit amounts. */
const money = (n: number) =>
  Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/* Maps a saved tax record from the API back onto the form's working fields:
   - exempt_fields (object) → tax_exemptions (checked exemptions) + the
     NY PFL / SDI program checkboxes (restored onto their own fields)
   - children_under_17 / other_dependents / other_tax_credits / total_credits
     → the Step 3 inputs.
   `stateOverride` lets the work location drive the jurisdiction. */
const hydrateTaxRecord = (tax: any, stateOverride?: string) => {
  const exemptFields = parseExemptFields(tax?.exempt_fields);
  const effectiveState = stateOverride || tax?.state || '';
  const adapter = getStateAdapter(effectiveState);
  /* Restore the payroll-program exemption checkboxes (NY PFL / SDI …) from
     exempt_fields onto their own top-level fields so the checkmarks reflect
     the saved record. */
  const programState = (adapter?.programs?.checkboxes ?? []).reduce(
    (acc, c) => ({ ...acc, [c.key]: exemptFields[c.key] === true }),
    {} as Record<string, boolean>
  );
  return {
    ...tax,
    ...programState,
    state: effectiveState || tax?.state,
    /* Federal exemption defaults to NO when the record doesn't specify it. */
    is_employee_exempt_from_federal_tax:
      tax?.is_employee_exempt_from_federal_tax ?? 'false',
    /* Only the "Tax exemptions" checklist labels feed tax_exemptions — the
       program exemption keys are kept on their own fields (above). */
    tax_exemptions: (adapter?.taxExemptions ?? []).filter(
      (label) => exemptFields[label]
    ),
    /* NYC residency override is stored inside exempt_fields JSON on the
       backend. Restore it onto the top-level form state so the dropdown
       renders with the correct saved value. Fall back to any legacy
       top-level field for backward compatibility. */
    nyc_residency_override:
      String(exemptFields?.nyc_residency_override ?? tax?.nyc_residency_override ?? ''),
    step3_children: tax?.children_under_17 ?? '',
    step3_other_dependents: tax?.other_dependents ?? '',
    step3_other_credits: tax?.other_tax_credits ?? '',
    step3_dependents_amount: tax?.total_credits ?? '',
  };
};

/* ── Read-only derived field (Location & Jurisdiction panel) ── */
const DerivedField = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-[#687588]">{label}</span>
    <span className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-[#111827]">
      {value || '—'}
    </span>
  </div>
);

/* ── Label with optional required marker and hover-tooltip help ── */
const FieldLabel = ({
  children,
  required,
  help,
}: {
  children: React.ReactNode;
  required?: boolean;
  help?: string;
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <label className="text-accent_soft_black">
      {children}
      {required && <span className="text-base text-red-500"> *</span>}
    </label>
    {help && (
      <span className="group relative inline-flex">
        <span
          tabIndex={0}
          className="flex h-[15px] w-[15px] cursor-help items-center justify-center rounded-full border border-gray-400 text-[10px] font-semibold leading-none text-gray-500 outline-none hover:border-accent_soft_black hover:text-accent_soft_black focus-visible:border-accent_soft_black"
        >
          ?
        </span>
        <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-60 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-[11px] font-normal leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          {help}
        </span>
      </span>
    )}
  </div>
);

const TaxInfo = ({
  view = false,
  Employee,
  isPending,
  refetch,
  uid = '',
}: {
  view?: boolean;
  Employee: any;
  isPending?: boolean;
  refetch?: any;
  uid?: string;
}) => {
  const [isDisabled1, setIsDisabled1] = useState(true);
  const [isDisabled2, setIsDisabled2] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stateTaxInfo, setStateTaxInfo] = useState<any>({});
  const [federalTaxInfo, setFederalTaxInfo] = useState<any>({});
  const [RenderAgain, setRenderAgain] = useState(false);

  /* Work location is the source of truth for the state tax jurisdiction. */
  const workLocationState = Employee?.work_locations?.location_state || '';

  /* Used to personalise the Local taxes helper text. */
  const employeeName =
    [Employee?.user?.first_name, Employee?.user?.last_name]
      .filter(Boolean)
      .join(' ') || 'this employee';

  useEffect(() => {
    if (isPending) return;
    const taxes = Employee?.taxes;
    if (Array.isArray(taxes)) {
      taxes.forEach((tax: any) => {
        if (tax?.is_the_state_other_income_tax) {
          setStateTaxInfo(hydrateTaxRecord(tax, workLocationState));
        } else {
          setFederalTaxInfo(hydrateTaxRecord(tax));
        }
      });
    } else if (taxes && typeof taxes === 'object') {
      if (taxes.is_the_state_other_income_tax) {
        setStateTaxInfo(hydrateTaxRecord(taxes, workLocationState));
      }
      setFederalTaxInfo(hydrateTaxRecord(taxes));
    }
    /* Keep the state in sync with the work location even with no tax record. */
    if (workLocationState) {
      setStateTaxInfo((prev: any) =>
        prev?.state === workLocationState
          ? prev
          : { ...prev, state: workLocationState }
      );
    }
  }, [Employee, isPending, RenderAgain, workLocationState]);

  /* ── Derived, rule-driven values (compliance doc sections 3, 4, 7) ── */
  const location = resolveTaxLocation(Employee, stateTaxInfo);
  const adapter = getStateAdapter(stateTaxInfo.state);
  const badges = getTaxProfileBadges({
    federalTax: federalTaxInfo,
    stateTax: stateTaxInfo,
    location,
  });
  const fedExempt = isFederalExempt(federalTaxInfo);
  const exemptInfo = getFederalExemptExpiry(federalTaxInfo);
  const isLegacyW4 = federalTaxInfo.employee_W_4_kind === 'YEAR_2019_OR_EARLY';

  /* ── Estimated NY / NYC per-paycheck withholding preview ─────────────────
     Recalculates whenever the state tax form fields change so the user can
     immediately see the impact of each edit (allowances, filing status, etc.).
     - nyStateAmount  : pure NY State income tax (NYS-50-T-NYS Method II)
     - nycResidentAmount : NYC Resident income tax — $0 when NOT a NYC resident
     nycResident comes from resolveTaxLocation → reads the employee's HOME
     address city. If the city is a NYC borough (Manhattan, Brooklyn, Bronx,
     Queens, Staten Island) AND state = NY, it returns true.
  ── */
  const nyWithholdingPreview = useMemo(() => {
    if (adapter?.code !== 'NY') return null;
    const gross =
      parseFloat(Employee?.total_salary ?? Employee?.salary ?? '0') || 0;
    if (!gross) return null;
    const payFreq = (
      Employee?.pay_schedule?.pay_frequency ??
      Employee?.pay_frequency ??
      'EVERY_MONTH'
    ) as 'EVERY_WEEK' | 'EVERY_BIWEEK' | 'EVERY_SEMIMONTH' | 'EVERY_MONTH' | 'EVERY_YEAR';
    const fs =
      stateTaxInfo.martial_status === 'MARRIED' ? 'married' : 'single';
    const allow = Math.max(0, parseInt(stateTaxInfo.total_allowance) || 0);

    /* NYC residency: respect the manual override first, then fall back to
       the address-based detection (`location.nycResident`).
       nyc_residency_override is saved on the state tax record; the same
       logic lives in detectNycResidentFromEmployee in SalaryProcess.ts. */
    const override = String(stateTaxInfo?.nyc_residency_override ?? '').toLowerCase().trim();
    let effectiveNycResident: boolean;
    let overrideSource: 'forced' | 'exempt' | 'auto';
    if (override === 'none') {
      effectiveNycResident = false;
      overrideSource = 'exempt';
    } else if (override === 'nyc') {
      effectiveNycResident = true;
      overrideSource = 'forced';
    } else {
      effectiveNycResident = location.nycResident;
      overrideSource = 'auto';
    }

    const { nyStateTax, nycTax } = calculateNYStateTax({
      gross,
      payFrequency: payFreq,
      state: 'NY',
      filingStatus: fs,
      allowances: allow,
      residentCity: effectiveNycResident ? 'nyc' : null,
    });
    return {
      nyStateAmount: Number(nyStateTax),
      nycResidentAmount: Number(nycTax),
      isNycResident: effectiveNycResident,
      overrideSource,
      residentCity: location.residentCity,
      residentState: location.residentState,
    };
  }, [adapter, Employee, stateTaxInfo.martial_status, stateTaxInfo.total_allowance, stateTaxInfo.nyc_residency_override, location]);

  const stateLabels = {
    martial_status: adapter?.labels.martial_status || 'Marital Status',
    total_allowance:
      adapter?.labels.total_allowance || 'Total number of allowances (box f)',
    additional_with_holdings:
      adapter?.labels.additional_with_holdings || 'Additional with holding (Line 2)',
    total: adapter?.labels.total || 'Amount',
    exempt: adapter?.labels.exempt || 'Exempt from with holding (section 2)',
  };

  const buildStateTaxPayload = () => {
    const v = stateTaxInfo.is_employee_exempt_from_family_paid_leave;
    const yes = v === true || v === 'true';
    const familyPaidLeave = stateTaxInfo.state === 'MN' ? (yes ? 'true' : 'false') : 'false';
    return {
      ...stateTaxInfo,
      is_employee_exempt_from_family_paid_leave: familyPaidLeave,
      /* Every exemption the state exposes, sent with an explicit boolean:
         { "<exemption>": true | false }. */
      exempt_fields: buildExemptFields(adapter, stateTaxInfo),
    };
  };

  /* Federal payload: Step 3 counts + auto-calculated credit amounts. */
  const buildFederalTaxPayload = () => {
    const children = Number(federalTaxInfo.step3_children || 0);
    const otherDeps = Number(federalTaxInfo.step3_other_dependents || 0);
    const otherCredits = Number(federalTaxInfo.step3_other_credits || 0);
    return {
      ...federalTaxInfo,
      children_under_17: children,
      other_dependents: otherDeps,
      other_tax_credits: otherCredits,
      children_amount: children * 2000,
      dependent_amount: otherDeps * 500,
      total_credits: children * 2000 + otherDeps * 500 + otherCredits,
    };
  };

  const handleSaveTax = async (type: string) => {
    try {
      setIsUpdating(true);
      if (type == 'STATE') {
        const statePayload = buildStateTaxPayload();
        if (stateTaxInfo?.uid) {
          const res = await patchEmployeeTaxes(uid, statePayload, stateTaxInfo?.uid);
          if (res?.success) {
            setIsDisabled1(true);
            refetch && refetch();
            toast.success('State tax updated.');
          }
        } else {
          const res = await postEmployeeTaxes(uid, {
            ...statePayload,
            is_the_state_other_income_tax: true,
          });
          if (res?.success) {
            setIsDisabled1(true);
            refetch && refetch();
            toast.success('State tax updated.');
          }
        }
      } else {
        const federalPayload = buildFederalTaxPayload();
        if (federalTaxInfo?.uid) {
          const res = await patchEmployeeTaxes(uid, federalPayload, federalTaxInfo?.uid);
          if (res?.success) {
            setIsDisabled2(true);
            refetch && refetch();
            toast.success('Federal tax updated.');
          }
        } else {
          const res = await postEmployeeTaxes(uid, {
            ...federalPayload,
            is_the_state_other_income_tax: false,
          });
          if (res?.success) {
            setIsDisabled2(true);
            refetch && refetch();
            toast.success('Federal tax updated.');
          }
        }
      }
    } catch (error) {
      //err
    } finally {
      setIsUpdating(false);
    }
  };

  /* ── Dynamic state-adapter extra field renderer ── */
  const renderExtraField = (field: StateExtraField) => {
    if (field.nycResidentOnly && !location.nycResident) return null;
    if (field.yonkersOnly && !location.yonkersInvolved) return null;

    const raw = stateTaxInfo[field.key];
    const value =
      field.type === 'select' && (raw === true || raw === false)
        ? String(raw)
        : raw ?? '';
    const onChange = (val: any) =>
      setStateTaxInfo({ ...stateTaxInfo, [field.key]: val });

    return (
      <div key={field.key} className="flex flex-col gap-2">
        <FieldLabel required={field.required} help={field.help}>
          {field.label}
        </FieldLabel>
        {field.type === 'select' ? (
          <select
            disabled={isDisabled1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
            required={field.required}
          >
            {!field.options?.some((o) => o.value === '') && <option value="">Select</option>}
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.title}
              </option>
            ))}
          </select>
        ) : (
          <input
            disabled={isDisabled1}
            maxLength={40}
            type={field.type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          />
        )}
      </div>
    );
  };

  /* ── State-driven tax exemptions (dynamic per selected state) ── */
  const selectedExemptions: string[] = Array.isArray(stateTaxInfo.tax_exemptions)
    ? stateTaxInfo.tax_exemptions
    : [];
  const toggleExemption = (item: string) =>
    setStateTaxInfo({
      ...stateTaxInfo,
      tax_exemptions: selectedExemptions.includes(item)
        ? selectedExemptions.filter((x) => x !== item)
        : [...selectedExemptions, item],
    });

  /* ── State-specific payroll programs (PFL / SDI / PFML, …) ── */
  const isProgramOn = (v: any) => v === true || v === 'true';

  /* ── Local jurisdiction tax (NY MCTMT, …) — single value on local_tax ── */
  const toggleLocalTax = (value: string) =>
    setStateTaxInfo((prev: any) => ({
      ...prev,
      local_tax: prev?.local_tax === value ? '' : value,
    }));

  /* ── Step 3 dependent-credit auto-calculation (mirrors the W-4 generator) ── */
  const step3Children = Number(federalTaxInfo.step3_children || 0);
  const step3OtherDeps = Number(federalTaxInfo.step3_other_dependents || 0);
  const step3OtherCredits = Number(federalTaxInfo.step3_other_credits || 0);
  const step3ChildCredit = step3Children * 2000;
  const step3OtherDepCredit = step3OtherDeps * 500;
  const step3TotalCredits =
    step3ChildCredit + step3OtherDepCredit + step3OtherCredits;

  /* Updates a Step 3 input and recomputes the persisted Step 3 total. */
  const setStep3 = (patch: Record<string, string>) => {
    const next = { ...federalTaxInfo, ...patch };
    const children = Number(next.step3_children || 0);
    const otherDep = Number(next.step3_other_dependents || 0);
    const otherCred = Number(next.step3_other_credits || 0);
    setFederalTaxInfo({
      ...next,
      step3_dependents_amount: children * 2000 + otherDep * 500 + otherCred,
    });
  };

  if (isPending) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LogoLoader size={120} color={'#16151c'} />
      </div>
    );
  }

  return (
    <div className="mb-7 text-sm">
      
      {/* ── State withholding (rule-driven by state adapter) ── */}
      <div className="rounded-lg border bg-white/60 p-7">
        <div className="flex items-center justify-between">
          <h1 className="mb-2 text-xl font-medium">
            State Withholding
            {adapter && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                — {adapter.name} ({adapter.certificateForms})
              </span>
            )}
          </h1>
          {isDisabled1 && !view && (
            <Button
              onClick={() => {
                setIsDisabled1(false);
                setIsDisabled2(true);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
        <p className="my-2 mb-4 text-[13px]">
          State withholding is captured on a state-specific certificate. Federal
          Form W-4 does not replace it. See the{' '}
          <a
            target="_blank"
            href="https://www.irs.gov/pub/irs-pdf/fw4.pdf"
            className="border-b border-accent_soft_blue text-accent_soft_blue"
          >
            W-4 Form
          </a>
          .
        </p>

        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <FieldLabel
              required
              help={
                workLocationState
                  ? 'Set from the assigned work location. Change it on the Overview tab.'
                  : undefined
              }
            >
              State where the employee lives
            </FieldLabel>
            <select
              disabled={isDisabled1 || Boolean(workLocationState)}
              value={stateTaxInfo.state}
              onChange={(e) => {
                const nextState = e.target.value;
                setStateTaxInfo((prev: any) => {
                  const fpl = prev.is_employee_exempt_from_family_paid_leave;
                  const needsDefaultMn =
                    nextState === 'MN' &&
                    (fpl === undefined || fpl === null || fpl === '');
                  return {
                    ...prev,
                    state: nextState,
                    // Reset state-specific exemptions: each state exposes its own list.
                    tax_exemptions: [],
                    // Local taxes are per-state too (e.g. NY MCTMT).
                    local_tax: '',
                    ...(needsDefaultMn
                      ? { is_employee_exempt_from_family_paid_leave: 'false' }
                      : {}),
                  };
                });
              }}
              className={inputCls}
            >
              <option value="">Select</option>
              {USStates?.map((state) => (
                <option
                  key={state.value}
                  value={state.value}
                  disabled={!US_STATES_SELECTABLE_IN_TAX_INFO.has(state.value)}
                >
                  {state.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel required>
              {stateLabels.martial_status}
            </FieldLabel>
            <select
              disabled={isDisabled1}
              value={stateTaxInfo.martial_status}
              onChange={(e) =>
                setStateTaxInfo({ ...stateTaxInfo, martial_status: e.target.value })
              }
              className={inputCls}
            >
              <option value="">Select</option>
              <option value="MARRIED">Married</option>
              <option value="UN_MARRIED">Unmarried</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel help={adapter?.help?.total_allowance}>
              {stateLabels.total_allowance}
            </FieldLabel>
            <input
              disabled={isDisabled1}
              maxLength={40}
              value={stateTaxInfo.total_allowance}
              onChange={(e) =>
                setStateTaxInfo({ ...stateTaxInfo, total_allowance: e.target.value })
              }
              type="number"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel>
              {stateLabels.additional_with_holdings}
            </FieldLabel>
            <input
              disabled={isDisabled1}
              maxLength={40}
              value={stateTaxInfo.additional_with_holdings}
              onChange={(e) =>
                setStateTaxInfo({
                  ...stateTaxInfo,
                  additional_with_holdings: e.target.value,
                })
              }
              type="text"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel>
              {stateLabels.total}
            </FieldLabel>
            <input
              disabled={isDisabled1}
              maxLength={40}
              type="number"
              value={stateTaxInfo.total}
              onChange={(e) => setStateTaxInfo({ ...stateTaxInfo, total: e.target.value })}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel required help={adapter?.help?.exempt}>
              {stateLabels.exempt}
            </FieldLabel>
            <select
              disabled={isDisabled1}
              value={stateTaxInfo.exempt}
              onChange={(e) => setStateTaxInfo({ ...stateTaxInfo, exempt: e.target.value })}
              className={inputCls}
              required
            >
              <option value="">Select</option>
              <option value="EXEMPT">Exempt</option>
              <option value="NOT_EXEMPT">Not Exempt</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel>Does the employee work in the state where they live?</FieldLabel>
            <select
              disabled={isDisabled1}
              value={stateTaxInfo.is_the_employee_work_in_the_state_where_live}
              onChange={(e) =>
                setStateTaxInfo({
                  ...stateTaxInfo,
                  is_the_employee_work_in_the_state_where_live: e.target.value,
                })
              }
              className={inputCls}
              required
            >
              <option value={'true'}>YES</option>
              <option value={'false'}>NO</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel>Is this employee exempt from any state taxes</FieldLabel>
            <select
              disabled={isDisabled1}
              value={stateTaxInfo.is_the_employee_exempt_from_any_state_taxes}
              onChange={(e) =>
                setStateTaxInfo({
                  ...stateTaxInfo,
                  is_the_employee_exempt_from_any_state_taxes: e.target.value,
                })
              }
              className={inputCls}
              required
            >
              <option value={'false'}>NO</option>
              <option value={'true'}>YES</option>
            </select>
          </div>

          {/* State-specific fields from the adapter registry */}
          {adapter?.extraFields.map(renderExtraField)}
        </div>

        {/* State default rule + local tax notes */}
        {adapter && (
          <div className="mt-4 rounded-md border border-blue-100 bg-blue-50/60 p-3">
            <p className="text-[12px] font-medium text-blue-800">
              {adapter.name} default rule
            </p>
            <p className="text-[12px] text-blue-700">{adapter.defaultRule}</p>
            {adapter.localTaxNotes.length > 0 && (
              <ul className="mt-1.5 list-disc pl-4 text-[11px] text-blue-700">
                {adapter.localTaxNotes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Local taxes (rule-driven by state adapter) */}
        {adapter?.localTaxes && (
          <div className="mt-6">
            <h2 className="mb-1 text-sm font-semibold text-accent_soft_black">
              {adapter.localTaxes.title}
            </h2>
            {adapter.localTaxes.learnMoreUrl && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={adapter.localTaxes.learnMoreUrl}
                className="text-[12px] text-accent_soft_blue underline"
              >
                Learn more
              </a>
            )}
            <p className="mb-3 mt-1 text-[12px] text-gray-500">
              {adapter.localTaxes.description.replace(/\{name\}/g, employeeName)}
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {adapter.localTaxes.options.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2.5 rounded-md border border-gray-200 px-4 py-2.5 ${
                    isDisabled1 ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={isDisabled1}
                    checked={stateTaxInfo.local_tax === opt.value}
                    onChange={() => toggleLocalTax(opt.value)}
                    className="h-4 w-4 accent-accent_soft_black"
                  />
                  <span className="text-accent_soft_black">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* State-specific payroll programs (rule-driven by state adapter) */}
        {adapter?.programs && (
          <div className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-accent_soft_black">
              {adapter.programs.title}
            </h2>
            {adapter.programs.checkboxes.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {adapter.programs.checkboxes.map((c) => (
                  <label
                    key={c.key}
                    className={`flex items-center gap-2.5 rounded-md border border-gray-200 px-4 py-2.5 ${
                      isDisabled1 ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer'
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={isDisabled1}
                      checked={isProgramOn(
                        stateTaxInfo[c.key] ??
                          parseExemptFields(stateTaxInfo.exempt_fields)[c.key]
                      )}
                      onChange={(e) =>
                        setStateTaxInfo({ ...stateTaxInfo, [c.key]: e.target.checked })
                      }
                      className="h-4 w-4 accent-accent_soft_black"
                    />
                    <span className="text-accent_soft_black">{c.label}</span>
                  </label>
                ))}
              </div>
            )}
            {adapter.programs.notes.map((n, i) => (
              <p
                key={i}
                className={`mt-3 rounded-md border p-3 text-[12px] ${STATE_NOTE_CLASS[n.tone]}`}
              >
                {n.text}
              </p>
            ))}
          </div>
        )}

        {/* Tax exemptions (rule-driven by state adapter) */}
        {adapter && (
          <div className="mt-6">
            <h2 className="mb-1 text-sm font-semibold text-accent_soft_black">
              Tax Exemptions — {adapter.name}
            </h2>
            <p className="mb-3 text-[12px] text-gray-500">
              These are not common — certain government criteria must be met to
              take these exemptions. Select the taxes this employee is exempt
              from. Not sure? Contact a tax expert or the applicable tax agency.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {adapter.taxExemptions.map((item) => (
                <label
                  key={item}
                  className={`flex items-center gap-2.5 rounded-md border border-gray-200 px-4 py-2.5 ${
                    isDisabled1 ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={isDisabled1}
                    checked={selectedExemptions.includes(item)}
                    onChange={() => toggleExemption(item)}
                    className="h-4 w-4 accent-accent_soft_black"
                  />
                  <span className="text-accent_soft_black">{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Estimated NY / NYC withholding breakdown ── */}
        {nyWithholdingPreview && (
          <div className="mt-6 rounded-md border border-indigo-100 bg-indigo-50/40 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              Estimated withholding per paycheck
            </h3>
            <div className="space-y-2 text-sm">
              {/* NY State Income Tax — always shown for NY employees */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">NY State Income Tax</span>
                <span className="font-semibold text-gray-900">
                  ${nyWithholdingPreview.nyStateAmount.toFixed(2)}
                </span>
              </div>

              {/* NYC Resident Tax — only if home address is in an NYC borough */}
              {nyWithholdingPreview.isNycResident ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">NYC Resident Tax</span>
                  <span className="font-semibold text-gray-900">
                    ${nyWithholdingPreview.nycResidentAmount.toFixed(2)}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  NYC resident tax not applied — employee home address is outside NYC.
                </p>
              )}

              {/* Total line — only when both taxes are non-zero */}
              {nyWithholdingPreview.isNycResident && nyWithholdingPreview.nycResidentAmount > 0 && (
                <div className="flex items-center justify-between border-t border-indigo-100 pt-2">
                  <span className="font-medium text-gray-700">Total (NY State + NYC)</span>
                  <span className="font-semibold text-gray-900">
                    ${(
                      nyWithholdingPreview.nyStateAmount +
                      nyWithholdingPreview.nycResidentAmount
                    ).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* ── NYC residency source info ── */}
            <div className={`mt-3 rounded border px-3 py-2 text-[11px] ${
              nyWithholdingPreview.overrideSource === 'exempt'
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : nyWithholdingPreview.overrideSource === 'forced'
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-indigo-100 bg-white/70 text-indigo-600'
            }`}>
              {nyWithholdingPreview.overrideSource === 'exempt' ? (
                <>
                  <span className="font-semibold">⚠ Manual override: NYC exempt.</span>{' '}
                  NYC resident tax suppressed by HR override regardless of home address.
                  Remove the override to restore auto-detection.
                </>
              ) : nyWithholdingPreview.overrideSource === 'forced' ? (
                <>
                  <span className="font-semibold">⚠ Manual override: Force NYC resident.</span>{' '}
                  NYC resident tax applied by HR override regardless of home address.
                  Remove the override to restore auto-detection.
                </>
              ) : nyWithholdingPreview.isNycResident ? (
                <>
                  <span className="font-semibold">NYC resident detected (auto).</span>{' '}
                  Home address city:{' '}
                  <span className="font-medium">
                    {nyWithholdingPreview.residentCity || '—'}
                  </span>
                  , state:{' '}
                  <span className="font-medium">
                    {nyWithholdingPreview.residentState || '—'}
                  </span>
                  . Use the NYC residency override to exempt if this employee
                  qualifies as a statutory non-resident.
                </>
              ) : (
                <>
                  <span className="font-semibold">Non-NYC resident (auto).</span>{' '}
                  Home address city:{' '}
                  <span className="font-medium">
                    {nyWithholdingPreview.residentCity || '(not set)'}
                  </span>
                  . Use the NYC residency override to force NYC resident tax if
                  the employee is actually a full-year NYC resident.
                </>
              )}
            </div>
          </div>
        )}

        {!isDisabled1 && (
          <div className="items mt-4 flex gap-4">
            <Button
              isLoading={isUpdating}
              onClick={() => handleSaveTax('STATE')}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled1(true);
                setRenderAgain(!RenderAgain);
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* ── Federal withholding (Form W-4) ── */}
      <div className="mt-7 rounded-lg border bg-white/60 p-7">
        <div className="flex items-center justify-between">
          <h1 className="mb-2 text-xl font-medium">Federal Withholding — Form W-4</h1>
          {isDisabled2 && !view && (
            <Button
              onClick={() => {
                setIsDisabled1(true);
                setIsDisabled2(false);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
        <p className="my-2 mb-4 text-[13px]">
          All employees must complete a{' '}
          <a
            target="_blank"
            href="https://www.irs.gov/pub/irs-pdf/fw4.pdf"
            className="border-b border-accent_soft_blue text-accent_soft_blue"
          >
            W-4 Form
          </a>
          . This helps calculate how much to withhold from each paycheck for federal
          income tax.
        </p>

        {/* Federal exempt notice (compliance doc 5.2) */}
        {fedExempt && (
          <div
            className={`mb-4 rounded-md border p-3 text-[12px] ${
              exemptInfo?.expired
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            Federal income tax withholding is set to $0 while the exemption is active.
            Social Security and Medicare still apply. Step 2/3/4 entries stay
            editable and are kept on file, but do not affect withholding while the
            exemption is active.
            {exemptInfo && (
              <>
                {' '}
                Exemption {exemptInfo.expired ? 'expired' : 'expires'} on{' '}
                <span className="font-semibold">{exemptInfo.label}</span> and must be
                renewed by February 15.
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <FieldLabel required>Which W-4 does the employee have</FieldLabel>
            <select
              value={federalTaxInfo.employee_W_4_kind}
              onChange={(e) =>
                setFederalTaxInfo({ ...federalTaxInfo, employee_W_4_kind: e.target.value })
              }
              disabled={isDisabled2}
              className={inputCls}
              required
            >
              <option value={'YEAR_2019_OR_EARLY'}>Year 2019 Or Earlier</option>
              <option value={'YEAR_2020_OR_LETTER'}>Year 2020 Or Later</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel required>
              Withholding status (Step 1c)
            </FieldLabel>
            <select
              disabled={isDisabled2}
              value={federalTaxInfo.holding_status}
              onChange={(e) =>
                setFederalTaxInfo({ ...federalTaxInfo, holding_status: e.target.value })
              }
              className={inputCls}
              required
            >
              <option value={''}>Select</option>
              {holdingChoices?.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.title}
                </option>
              ))}
            </select>
          </div>

          {isLegacyW4 && (
            <div className="flex flex-col gap-2">
              <FieldLabel help="Legacy 2019-or-earlier W-4 uses allowances. Use the legacy method or computational bridge.">
                Legacy allowances (2019 W-4)
              </FieldLabel>
              <input
                disabled={isDisabled2}
                maxLength={40}
                type="number"
                value={federalTaxInfo.legacy_allowances || ''}
                onChange={(e) =>
                  setFederalTaxInfo({
                    ...federalTaxInfo,
                    legacy_allowances: e.target.value,
                  })
                }
                className={inputCls}
              />
            </div>
          )}

          {!isLegacyW4 && (
            <div className="flex flex-col gap-2">
              <FieldLabel required>
                Multiple jobs or spouse works (Step 2c)
              </FieldLabel>
              <select
                disabled={isDisabled2}
                value={federalTaxInfo.is_multiple_jobs_or_spouse_works}
                onChange={(e) =>
                  setFederalTaxInfo({
                    ...federalTaxInfo,
                    is_multiple_jobs_or_spouse_works: e.target.value,
                  })
                }
                className={inputCls}
                required
              >
                <option value={'true'}>YES</option>
                <option value={'false'}>NO</option>
              </select>
            </div>
          )}

          {!isLegacyW4 && (
            <>
              <div className="md:col-span-2 xl:col-span-3">
                <h2 className="text-base font-medium text-accent_soft_black">
                  Step 3 — Claim dependents and other credits
                </h2>
                <p className="text-[12px] text-gray-500">
                  Enter the counts below. Child and dependent credit amounts and
                  the Step 3 total are calculated automatically ($2,000 per
                  qualifying child, $500 per other dependent).
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel help="Number of qualifying children under age 17. Each one adds $2,000 to the Step 3 credit.">
                  Qualifying children under age 17
                </FieldLabel>
                <input
                  disabled={isDisabled2}
                  type="number"
                  min="0"
                  step="1"
                  value={federalTaxInfo.step3_children ?? ''}
                  onChange={(e) => setStep3({ step3_children: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel help="Number of other dependents. Each one adds $500 to the Step 3 credit.">
                  Other dependents
                </FieldLabel>
                <input
                  disabled={isDisabled2}
                  type="number"
                  min="0"
                  step="1"
                  value={federalTaxInfo.step3_other_dependents ?? ''}
                  onChange={(e) =>
                    setStep3({ step3_other_dependents: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel help="Any other tax credits the employee expects. Added directly to the Step 3 total.">
                  Other tax credits
                </FieldLabel>
                <input
                  disabled={isDisabled2}
                  type="number"
                  min="0"
                  step="0.01"
                  value={federalTaxInfo.step3_other_credits ?? ''}
                  onChange={(e) =>
                    setStep3({ step3_other_credits: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel help="Auto-calculated: qualifying children × $2,000.">
                  Child credit amount
                </FieldLabel>
                <input
                  readOnly
                  value={money(step3ChildCredit)}
                  className={`${inputCls} bg-gray-50 text-gray-500`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel help="Auto-calculated: other dependents × $500.">
                  Other dependent credit amount
                </FieldLabel>
                <input
                  readOnly
                  value={money(step3OtherDepCredit)}
                  className={`${inputCls} bg-gray-50 text-gray-500`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel help="Auto-calculated total credits that feed Step 3 of the W-4.">
                  Step 3 total credits
                </FieldLabel>
                <input
                  readOnly
                  value={money(step3TotalCredits)}
                  className={`${inputCls} bg-gray-50 text-gray-500`}
                />
              </div>
            </>
          )}

          {!isLegacyW4 && (
            <div className="flex flex-col gap-2">
              <FieldLabel>
                Other income amount (Step 4a)
              </FieldLabel>
              <input
                disabled={isDisabled2}
                maxLength={40}
                type="number"
                value={federalTaxInfo.total_other_income}
                onChange={(e) =>
                  setFederalTaxInfo({
                    ...federalTaxInfo,
                    total_other_income: e.target.value,
                  })
                }
                className={inputCls}
              />
            </div>
          )}

          {!isLegacyW4 && (
            <div className="flex flex-col gap-2">
              <FieldLabel>
                Deductions (Step 4b)
              </FieldLabel>
              <input
                disabled={isDisabled2}
                maxLength={40}
                type="number"
                value={federalTaxInfo.deduction}
                onChange={(e) =>
                  setFederalTaxInfo({ ...federalTaxInfo, deduction: e.target.value })
                }
                className={inputCls}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <FieldLabel>
              Extra withholding (Step 4c)
            </FieldLabel>
            <input
              disabled={isDisabled2}
              maxLength={40}
              type="number"
              value={federalTaxInfo.extra_with_holding}
              onChange={(e) =>
                setFederalTaxInfo({
                  ...federalTaxInfo,
                  extra_with_holding: e.target.value,
                })
              }
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel required>
              Exempt from withholding
            </FieldLabel>
            <input
              disabled={isDisabled2}
              maxLength={40}
              type="text"
              value={federalTaxInfo.exempt_from_with_holding}
              onChange={(e) =>
                setFederalTaxInfo({
                  ...federalTaxInfo,
                  exempt_from_with_holding: e.target.value,
                })
              }
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel required>Is this employee exempt from federal tax</FieldLabel>
            <select
              disabled={isDisabled2}
              value={federalTaxInfo.is_employee_exempt_from_federal_tax}
              onChange={(e) =>
                setFederalTaxInfo({
                  ...federalTaxInfo,
                  is_employee_exempt_from_federal_tax: e.target.value,
                })
              }
              className={inputCls}
              required
            >
              <option value={'false'}>NO</option>
              <option value={'true'}>YES</option>
            </select>
          </div>
        </div>

        {!isDisabled2 && (
          <div className="items mt-4 flex gap-4">
            <Button
              isLoading={isUpdating}
              onClick={() => handleSaveTax('FEDERAL')}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled2(true);
                setRenderAgain(!RenderAgain);
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxInfo;
