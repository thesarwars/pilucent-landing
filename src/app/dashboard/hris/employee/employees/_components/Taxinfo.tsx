import { USStates, US_STATES_SELECTABLE_IN_TAX_INFO } from "@/lib/helpers/UsaStates";
import {
  BADGE_TONE_CLASS,
  getFederalExemptExpiry,
  getStateAdapter,
  getTaxProfileBadges,
  isFederalExempt,
  resolveTaxLocation,
  STATE_NOTE_CLASS,
  StateExtraField,
} from "@/lib/helpers/w4TaxConfig";
import React, { FormEvent } from "react";

const holdingChoices = [
  {
    title: "Single Or Married Filing Separatley",
    value: "SINGLE_OR_MARRIED_FILING_SEPARATLEY",
  },
  {
    title: "Married Filing Jointly Or Qualifying Widow",
    value: "MARRIED_FILING_JOINTLY_OR_QUALIYING_WIDOW",
  },
  {
    title: "Head Of Houshold",
    value: "HEAD_OF_HOUSHOLD",
  },
  {
    title: "Exempt",
    value: "EXEMPT",
  },
];

const inputCls =
  "rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black disabled:bg-gray-50 disabled:text-gray-500";

/* USD formatter for the auto-calculated Step 3 credit amounts. */
const money = (n: number) =>
  Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

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
  setStateTaxInfo,
  stateTaxInfo,
  setFederalTaxInfo,
  federalTaxInfo,
  prev,
  next,
  currentStep,
  steps,
  onSkipForNow,
  onTaxInteraction,
}: {
  setStateTaxInfo: any;
  stateTaxInfo: any;
  setFederalTaxInfo: any;
  federalTaxInfo: any;
  prev: any;
  next: any;
  currentStep: any;
  steps: any;
  onSkipForNow?: () => void;
  onTaxInteraction?: () => void;
}) => {
  const handleNext = (e: FormEvent) => {
    e.preventDefault();
  };

  /* ── Derived, rule-driven values (compliance doc sections 3, 7) ── */
  const location = resolveTaxLocation(null, stateTaxInfo);
  const adapter = getStateAdapter(stateTaxInfo.state);
  const badges = getTaxProfileBadges({
    federalTax: federalTaxInfo,
    stateTax: stateTaxInfo,
    location,
  });
  const fedExempt = isFederalExempt(federalTaxInfo);
  const exemptInfo = getFederalExemptExpiry(federalTaxInfo);
  const isLegacyW4 = federalTaxInfo.employee_W_4_kind === "YEAR_2019_OR_EARLY";

  const stateLabels = {
    martial_status: adapter?.labels.martial_status || "Marital Status",
    total_allowance:
      adapter?.labels.total_allowance || "Total number of allowances (box f)",
    additional_with_holdings:
      adapter?.labels.additional_with_holdings ||
      "Additional with holding (Line 2)",
    total: adapter?.labels.total || "Amount",
    exempt: adapter?.labels.exempt || "Exempt from with holding (section 2)",
  };

  /* ── Dynamic state-adapter extra field renderer ── */
  const renderExtraField = (field: StateExtraField) => {
    if (field.nycResidentOnly && !location.nycResident) return null;
    if (field.yonkersOnly && !location.yonkersInvolved) return null;

    const raw = stateTaxInfo[field.key];
    const value =
      field.type === "select" && (raw === true || raw === false)
        ? String(raw)
        : raw ?? "";
    const onChange = (val: any) =>
      setStateTaxInfo({ ...stateTaxInfo, [field.key]: val });

    return (
      <div key={field.key} className="flex flex-col gap-2">
        <FieldLabel required={field.required} help={field.help}>
          {field.label}
        </FieldLabel>
        {field.type === "select" ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
            required={field.required}
          >
            {!field.options?.some((o) => o.value === "") && (
              <option value="">Select</option>
            )}
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.title}
              </option>
            ))}
          </select>
        ) : (
          <input
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

  /* ── State-driven tax exemptions (compliance doc — dynamic per state) ── */
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
  const isProgramOn = (v: any) => v === true || v === "true";

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

  return (
    <form
      onSubmit={handleNext}
      onInput={() => onTaxInteraction?.()}
      className="text-sm"
    >
      {/* ── Tax Profile Summary badges ── */}
      <div className="mb-5 rounded-lg border bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-accent_soft_black">
          Tax Profile Summary
        </h2>
        <div className="flex flex-wrap gap-2">
          {badges.map((b, i) => (
            <span
              key={i}
              title={b.hint}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${BADGE_TONE_CLASS[b.tone]}`}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── State withholding (rule-driven by state adapter) ── */}
      <div className="rounded-lg border bg-white p-7">
        <h1 className="mb-2 text-xl font-medium">
          State Withholding
          {adapter && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              — {adapter.name} ({adapter.certificateForms})
            </span>
          )}
        </h1>
        <p className="my-2 mb-4 text-[13px]">
          State withholding is captured on a state-specific certificate. Federal
          Form W-4 does not replace it. See the{" "}
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
            <FieldLabel required>State where the employee lives</FieldLabel>
            <select
              value={stateTaxInfo.state}
              onChange={(e) => {
                const nextState = e.target.value;
                const fpl = stateTaxInfo.is_employee_exempt_from_family_paid_leave;
                const needsDefaultMn =
                  nextState === "MN" &&
                  (fpl === undefined || fpl === null || fpl === "");
                setStateTaxInfo({
                  ...stateTaxInfo,
                  state: nextState,
                  // Reset state-specific exemptions: each state exposes its own list.
                  tax_exemptions: [],
                  ...(needsDefaultMn
                    ? { is_employee_exempt_from_family_paid_leave: "false" }
                    : {}),
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
              value={stateTaxInfo.martial_status}
              onChange={(e) =>
                setStateTaxInfo({
                  ...stateTaxInfo,
                  martial_status: e.target.value,
                })
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
              maxLength={40}
              value={stateTaxInfo.total_allowance}
              onChange={(e) =>
                setStateTaxInfo({
                  ...stateTaxInfo,
                  total_allowance: e.target.value,
                })
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
              maxLength={40}
              type="number"
              value={stateTaxInfo.total}
              onChange={(e) =>
                setStateTaxInfo({ ...stateTaxInfo, total: e.target.value })
              }
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel required help={adapter?.help?.exempt}>
              {stateLabels.exempt}
            </FieldLabel>
            <select
              value={stateTaxInfo.exempt}
              onChange={(e) =>
                setStateTaxInfo({ ...stateTaxInfo, exempt: e.target.value })
              }
              className={inputCls}
              required
            >
              <option value="">Select</option>
              <option value="EXEMPT">Exempt</option>
              <option value="NOT_EXEMPT">Not Exempt</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel>
              Does the employee work in the state where they live?
            </FieldLabel>
            <select
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
              <option value={"true"}>YES</option>
              <option value={"false"}>NO</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel>Is this employee exempt from any state taxes</FieldLabel>
            <select
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
              <option value={"false"}>NO</option>
              <option value={"true"}>YES</option>
            </select>
          </div>

          {/* State-specific fields from the adapter registry */}
          {adapter?.extraFields.map(renderExtraField)}
        </div>

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
                    className="flex cursor-pointer items-center gap-2.5 rounded-md border border-gray-200 px-4 py-2.5"
                  >
                    <input
                      type="checkbox"
                      checked={isProgramOn(stateTaxInfo[c.key])}
                      onChange={(e) =>
                        setStateTaxInfo({
                          ...stateTaxInfo,
                          [c.key]: e.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-indigo-600"
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
      </div>

      {/* ── Tax exemptions (rule-driven by state adapter) ── */}
      {adapter && (
        <div className="mt-7 rounded-lg border bg-white p-7">
          <h1 className="mb-2 text-xl font-medium">
            Tax Exemptions
            <span className="ml-2 text-sm font-normal text-gray-500">
              — {adapter.name}
            </span>
          </h1>
          <p className="my-2 mb-4 text-[13px]">
            These are not common — certain government criteria must be met to
            take these exemptions. Select the taxes this employee is exempt
            from. Not sure? Contact a tax expert or the applicable tax agency.
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {adapter.taxExemptions.map((item) => (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-2.5 rounded-md border border-gray-200 px-4 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={selectedExemptions.includes(item)}
                  onChange={() => toggleExemption(item)}
                  className="h-4 w-4 accent-indigo-600"
                />
                <span className="text-accent_soft_black">{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Federal withholding (Form W-4) ── */}
      <div className="mt-7 rounded-lg border bg-white p-7">
        <h1 className="mb-2 text-xl font-medium">
          Federal Withholding — Form W-4
        </h1>
        <p className="my-2 mb-4 text-[13px]">
          All employees must complete a{" "}
          <a
            target="_blank"
            href="https://www.irs.gov/pub/irs-pdf/fw4.pdf"
            className="border-b border-accent_soft_blue text-accent_soft_blue"
          >
            W-4 Form
          </a>
          . This helps calculate how much to withhold from each paycheck for
          federal income tax.
        </p>

        {/* Federal exempt notice (compliance doc 5.2) */}
        {fedExempt && (
          <div
            className={`mb-4 rounded-md border p-3 text-[12px] ${
              exemptInfo?.expired
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            Federal income tax withholding is set to $0 while the exemption is
            active. Social Security and Medicare still apply. Step 2/3/4 entries
            stay editable and are kept on file, but do not affect withholding
            while the exemption is active.
            {exemptInfo && (
              <>
                {" "}
                Exemption {exemptInfo.expired ? "expired" : "expires"} on{" "}
                <span className="font-semibold">{exemptInfo.label}</span> and must
                be renewed by February 15.
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
                setFederalTaxInfo({
                  ...federalTaxInfo,
                  employee_W_4_kind: e.target.value,
                })
              }
              className={inputCls}
              required
            >
              <option value={"YEAR_2019_OR_EARLY"}>Year 2019 Or Earlier</option>
              <option value={"YEAR_2020_OR_LETTER"}>Year 2020 Or Later</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel required>
              Withholding status (Step 1c)
            </FieldLabel>
            <select
              value={federalTaxInfo.holding_status}
              onChange={(e) =>
                setFederalTaxInfo({
                  ...federalTaxInfo,
                  holding_status: e.target.value,
                })
              }
              className={inputCls}
              required
            >
              <option value={""}>Select</option>
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
                maxLength={40}
                type="number"
                value={federalTaxInfo.legacy_allowances || ""}
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
                <option value={"true"}>YES</option>
                <option value={"false"}>NO</option>
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
                  type="number"
                  min="0"
                  step="1"
                  value={federalTaxInfo.step3_children ?? ""}
                  onChange={(e) => setStep3({ step3_children: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel help="Number of other dependents. Each one adds $500 to the Step 3 credit.">
                  Other dependents
                </FieldLabel>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={federalTaxInfo.step3_other_dependents ?? ""}
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
                  type="number"
                  min="0"
                  step="0.01"
                  value={federalTaxInfo.step3_other_credits ?? ""}
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
                  maxLength={40}
                type="number"
                value={federalTaxInfo.deduction}
                onChange={(e) =>
                  setFederalTaxInfo({
                    ...federalTaxInfo,
                    deduction: e.target.value,
                  })
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
            <FieldLabel required>
              Is this employee exempt from federal tax
            </FieldLabel>
            <select
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
              <option value={"false"}>NO</option>
              <option value={"true"}>YES</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={prev}
          disabled={currentStep === 1}
          className={`rounded-md border px-6 py-2 ${
            currentStep === 1
              ? "cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400"
              : "border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50"
          } `}
        >
          Previous
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {onSkipForNow && (
            <button
              type="button"
              onClick={onSkipForNow}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Skip for now
            </button>
          )}
          <button
            type="submit"
            onClick={next}
            className="rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
          >
            {currentStep === steps.length ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TaxInfo;
