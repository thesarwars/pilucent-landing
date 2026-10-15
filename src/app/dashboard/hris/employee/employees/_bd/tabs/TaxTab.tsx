'use client';

import * as React from 'react';
import { ChevronDown, Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VioletButton } from '@/components/violet';
import { toast } from '@/lib/ToastService';
import * as api from '../api';
import { ENUMS, enumLabel } from '../enums';
import { useEmployeeMutation, useTaxProjection } from '../hooks';
import { useLang } from '../i18n';
import { addMoney, parseAmount } from '../format';
import type { Investment, Profile, TaxProfile, TaxProjection } from '../types';
import {
  Citation,
  ConfidenceTag,
  DateInput,
  ErrorBlock,
  Field,
  FieldGrid,
  LoadingBlock,
  Note,
  SaveBar,
  Section,
  SelectInput,
  SwitchRow,
  TextInput,
  errs,
  focusField,
  Checkbox,
  inputClass,
  useSectionForm,
} from '../ui';
import { etinValid } from '../validate';

type Form = Omit<TaxProfile, 'categorySuggestion'>;

export function TaxTab({ profile }: { profile: Profile }) {
  const { n, money } = useLang();
  const code = profile.code;
  const { categorySuggestion, ...server } = profile.taxProfile;
  const projection = useTaxProjection(code);
  const mutation = useEmployeeMutation(code, (changes: Partial<Form>) => api.patchSection(code, 'tax-profile', changes));
  const form = useSectionForm<Form>(server, (changes) => mutation.mutateAsync(changes));
  const v = form.values;
  const set = form.set;
  const e = form.errors;
  const liability = projection.data?.available ? projection.data.liability : null;
  const owesTax = !!liability && Number(liability.value) > 0;
  const money2 = (x: string | null) => (x ? x : null);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <Section title="Taxpayer status" desc="Sets the tax-free threshold and the return-filing obligations for this employee.">
          <FieldGrid>
            <Field
              htmlFor="f-taxcat"
              label="Taxpayer category"
              span={3}
              suggested={!!categorySuggestion && v.category === categorySuggestion}
              errors={errs(e, 'category')}
              help={
                categorySuggestion && categorySuggestion !== v.category ? (
                  <button type="button" className="font-semibold text-v-primary hover:underline" onClick={() => set('category', categorySuggestion)}>
                    Suggested: {enumLabel('taxpayerCategory', categorySuggestion)} — accept
                  </button>
                ) : projection.data?.available && projection.data.threshold ? (
                  `Tax-free threshold: ${money(projection.data.threshold.value)} for income year ${projection.data.ruleSet}.`
                ) : undefined
              }
            >
              <SelectInput id="f-taxcat" value={v.category} onChange={(x) => set('category', x)} options={ENUMS.taxpayerCategory} placeholder={null} />
            </Field>
            <Field
              htmlFor="f-disabledkids"
              label="Disabled children"
              span={3}
              help="Each adds to the threshold. Claimable by one parent only where both are taxpayers."
              errors={errs(e, 'disabledChildren')}
            >
              <div className="flex items-center gap-2">
                <VioletButton variant="outline" size="icon" aria-label="Decrease" onClick={() => set('disabledChildren', Math.max(0, v.disabledChildren - 1))}>
                  <Minus className="h-3.5 w-3.5" />
                </VioletButton>
                <div id="f-disabledkids" className="w-10 text-center text-[15px] font-bold bd-mono">
                  {n(v.disabledChildren)}
                </div>
                <VioletButton variant="outline" size="icon" aria-label="Increase" onClick={() => set('disabledChildren', v.disabledChildren + 1)}>
                  <Plus className="h-3.5 w-3.5" />
                </VioletButton>
              </div>
            </Field>
            <Field
              htmlFor="f-etin"
              label="e-TIN"
              span={3}
              errors={
                errs(e, 'etin').length
                  ? errs(e, 'etin')
                  : v.etin && !etinValid(v.etin)
                    ? ['e-TIN must be 12 digits.']
                    : !v.etin && owesTax
                      ? ['Required — projected liability is above zero.']
                      : []
              }
            >
              <TextInput id="f-etin" inputMode="numeric" value={v.etin} onChange={(x) => set('etin', x)} placeholder="12 digits" className="bd-mono" invalid={(!!v.etin && !etinValid(v.etin)) || (!v.etin && owesTax)} />
            </Field>
            <Field htmlFor="f-psr" label="Proof of Submission of Return" span={3} errors={errs(e, 'psr', 'psrDate')}>
              <SwitchRow id="f-psr" checked={v.psr} onChange={(x) => set('psr', x)} label={v.psr ? 'On file' : 'Not on file'} />
              {v.psr && <DateInput id="f-psrdate" value={v.psrDate} onChange={(x) => set('psrDate', x)} className="mt-1" />}
            </Field>
          </FieldGrid>
        </Section>

        <Section title="Perquisites and prior employment" desc="Non-cash benefits and income already taxed this year both change the projection.">
          <FieldGrid>
            <Field htmlFor="f-vehicle" label="Company vehicle" span={3} errors={errs(e, 'vehicle')} help={projection.data?.perquisites ? projection.data.perquisites.basis : undefined}>
              <SelectInput id="f-vehicle" value={v.vehicle} onChange={(x) => set('vehicle', x)} options={ENUMS.vehicle} placeholder={null} />
            </Field>
            <Field htmlFor="f-accom" label="Employer accommodation" span={3}>
              <SwitchRow id="f-accom" checked={v.accommodation} onChange={(x) => set('accommodation', x)} label={v.accommodation ? 'Provided' : 'Not provided'} />
            </Field>
            {v.accommodation && (
              <Field htmlFor="f-accomval" label="Monthly rental value" span={3} help="The actual rental value is fully taxable." errors={errs(e, 'accommodationValue')}>
                <TextInput id="f-accomval" inputMode="decimal" value={v.accommodationValue} onChange={(x) => set('accommodationValue', money2(parseAmount(x)))} className="bd-mono" />
              </Field>
            )}
            <Field htmlFor="f-prior" label="Prior employer this income year" span={3} help="Without it a mid-year joiner is under-deducted." errors={errs(e, 'priorEmployer')}>
              <SwitchRow id="f-prior" checked={v.priorEmployer} onChange={(x) => set('priorEmployer', x)} label={v.priorEmployer ? 'Declared' : 'Not declared'} />
            </Field>
            <Field htmlFor="f-borne" label="Tax borne by employer" span={3} help={v.taxBorneByEmployer ? 'Tax borne by the employer is itself a taxable perquisite.' : undefined}>
              <SwitchRow id="f-borne" checked={v.taxBorneByEmployer} onChange={(x) => set('taxBorneByEmployer', x)} label={v.taxBorneByEmployer ? 'Yes' : 'No'} />
            </Field>
            {v.priorEmployer && (
              <>
                <Field htmlFor="f-priorname" label="Previous employer" span={2} errors={errs(e, 'priorName')}>
                  <TextInput id="f-priorname" value={v.priorName} onChange={(x) => set('priorName', x)} />
                </Field>
                <Field htmlFor="f-priorinc" label="Income received" span={2} errors={errs(e, 'priorIncome')}>
                  <TextInput id="f-priorinc" inputMode="decimal" value={v.priorIncome} onChange={(x) => set('priorIncome', money2(parseAmount(x)))} className="bd-mono" />
                </Field>
                <Field htmlFor="f-priortds" label="Tax deducted there" span={2} errors={errs(e, 'priorTds')}>
                  <TextInput id="f-priortds" inputMode="decimal" value={v.priorTds} onChange={(x) => set('priorTds', money2(parseAmount(x)))} className="bd-mono" />
                </Field>
              </>
            )}
          </FieldGrid>
        </Section>
        <SaveBar dirty={form.dirty} saving={form.saving} onSave={() => void form.submit()} onDiscard={form.reset} />

        <InvestmentsCard code={code} server={profile.investments} />
      </div>

      <div>
        {projection.isPending ? (
          <LoadingBlock />
        ) : projection.isError ? (
          <ErrorBlock error={projection.error} onRetry={() => void projection.refetch()} />
        ) : (
          <EstimatedTax projection={projection.data} etinMissing={!profile.taxProfile.etin} />
        )}
      </div>
    </div>
  );
}

function EstimatedTax({ projection: p, etinMissing }: { projection: TaxProjection; etinMissing: boolean }) {
  const { money, date, n } = useLang();
  const [trace, setTrace] = React.useState(false);
  if (!p.available) {
    return (
      <Section title="Estimated tax">
        <Note tone="neutral">{p.reason}</Note>
      </Section>
    );
  }
  const line = (label: string, f: TaxProjection['annualSalary'], o: { big?: boolean; neg?: boolean; sub?: string } = {}) =>
    f && (
      <div key={label} className={cn('flex items-baseline gap-3 py-2', o.big && 'border-t border-[rgba(22,23,42,0.12)] pt-2.5')}>
        <span className={cn('min-w-0 flex-1', o.big ? 'text-[13.5px] font-bold text-v-ink900' : 'text-[12.5px] text-v-ink500')}>
          {label}
          {o.sub && <span className="block text-[11px] text-[#6E6883]">{o.sub}</span>}
        </span>
        <span className={cn('bd-mono', o.big ? 'text-[14px] font-bold' : 'text-[12.5px] font-semibold', o.neg ? 'text-[#E11D48]' : 'text-v-ink900')}>
          {o.neg ? '−' : ''}
          {money(f.value)}
        </span>
      </div>
    );
  const minApplies = p.liability?.basis.startsWith('Minimum tax applies');
  const w = p.withholding;

  return (
    <Section
      title="Estimated tax"
      desc={`Income year ${p.ruleSet} · as of ${date(p.asOf)}`}
      right={<ConfidenceTag value={p.confidence} />}
    >
      {line('Projected annual salary', p.annualSalary)}
      {line('Festival bonuses', p.bonuses)}
      {line('Perquisites', p.perquisites)}
      {line('Employment income', p.employmentIncome, { big: true })}
      {line('Less: employment exemption', p.exemption, { neg: true, sub: 'Lower of one-third or the ceiling' })}
      {line('Taxable income', p.taxable, { big: true })}
      {line('Tax on slabs', p.slabTax, { sub: p.threshold ? `Above the ${money(p.threshold.value)} threshold` : undefined })}
      {line('Less: investment rebate', p.rebate, { neg: true })}
      {line('Annual liability', p.liability, { big: true })}
      {minApplies && (
        <Note tone="warn" className="my-2">
          Minimum tax applies — taxable income is above the threshold but tax after rebate is below the statutory floor.
        </Note>
      )}
      <div className="mt-2 rounded-2xl bg-[rgba(124,77,255,0.08)] px-4 py-3">
        <div className="flex items-baseline gap-3">
          <span className="min-w-0 flex-1 text-[12.5px] font-bold text-v-primary-deep">Deduction this period</span>
          <span className="text-[18px] font-extrabold bd-mono text-v-primary-deep">{money(p.periodDeduction?.value)}</span>
        </div>
        <div className="mt-0.5 text-[11.5px] text-v-ink500">
          {p.periodDeduction?.basis} — {n(String(p.remainingPeriods?.value ?? ''))} period(s) left.
        </div>
      </div>
      {etinMissing && p.liability && Number(p.liability.value) > 0 && (
        <Note tone="danger" className="mt-3">
          e-TIN is required once liability exceeds zero. Add it before the next payroll run.
        </Note>
      )}
      {w?.available && (
        <div className="mt-3 space-y-1.5 rounded-2xl border border-[rgba(22,23,42,0.08)] px-4 py-3 text-[12px]">
          <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#6E6883]">Withholding deadlines</div>
          <div className="flex justify-between gap-3">
            <span className="text-v-ink500">Deposit {w.period} deduction by</span>
            <span className="font-bold text-v-ink900">{date(w.depositDue?.value)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-v-ink500">Next quarterly return (quarter to {date(w.quarterlyReturn?.quarterEnds)})</span>
            <span className="font-bold text-v-ink900">{date(w.quarterlyReturn?.due)}</span>
          </div>
          <div className="text-[11px] leading-snug text-[#6E6883]">{w.lateDeposit?.basis}.</div>
          <Citation>{[w.depositDue?.citation, w.lateDeposit?.citation, w.quarterlyReturn?.citation].filter(Boolean).join(' · ')}</Citation>
        </div>
      )}
      {w && !w.available && <div className="mt-3 text-[11.5px] text-[#6E6883]">Withholding deadlines: {w.reason}</div>}
      {!p.productionSafe && (
        <div className="mt-3 text-[11px] text-[#6E6883]">Preview only: a rule below Verified feeds this figure. Final figures are calculated when payroll runs.</div>
      )}
      <button type="button" onClick={() => setTrace(!trace)} className="mt-3 flex items-center gap-1 text-[12px] font-bold text-v-primary">
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', trace && 'rotate-180')} />
        {trace ? 'Hide' : 'Show'} the full computation
      </button>
      {trace && (
        <ol className="mt-2 space-y-2">
          {p.trace?.map((s) => (
            <li key={s.n} className="rounded-xl bg-v-wash px-3 py-2">
              <div className="flex items-baseline gap-2 text-[12px]">
                <span className="font-bold text-[#6E6883]">{n(s.n)}.</span>
                <span className="min-w-0 flex-1 font-semibold text-v-ink900">{s.step}</span>
                <span className="bd-mono font-bold text-v-ink900">
                  {typeof s.value === 'number' ? n(s.value) : money(s.value)}
                </span>
                <ConfidenceTag value={s.confidence} />
              </div>
              <div className="mt-0.5 text-[11px] leading-snug text-v-ink500">{s.basis}</div>
              {s.citation && <div className="text-[10.5px] text-[#6E6883]">{s.citation}</div>}
            </li>
          ))}
          {p.slabWalk && p.slabWalk.length > 0 && (
            <li className="rounded-xl border border-[rgba(22,23,42,0.08)] px-3 py-2 text-[11.5px]">
              <div className="mb-1 font-bold text-v-ink700">Slab walk</div>
              {p.slabWalk.map((b) => (
                <div key={b.band} className="flex justify-between bd-mono text-v-ink500">
                  <span>
                    Band {n(b.band)}: {money(b.income)} × {b.rate}
                  </span>
                  <span className="font-semibold text-v-ink900">{money(b.tax, 2)}</span>
                </div>
              ))}
            </li>
          )}
        </ol>
      )}
    </Section>
  );
}

/** Row keys for editable lists; unique for the page's lifetime. */
let lastKey = 0;
const newKey = () => ++lastKey;

type Row = Investment & { key: number };

function InvestmentsCard({ code, server }: { code: string; server: Investment[] }) {
  const { money } = useLang();
  const plain = (list: Investment[]) => list.map(({ instrument, amount, proof }) => ({ instrument, amount, proof }));
  const toRows = (list: Investment[]): Row[] => list.map((x) => ({ ...x, key: newKey() }));
  const [rows, setRows] = React.useState<Row[]>(() => toRows(server));
  const [errors, setErrors] = React.useState<string[]>([]);
  const serverJson = JSON.stringify(plain(server));
  const dirty = JSON.stringify(plain(rows)) !== serverJson;
  React.useEffect(() => {
    if (!dirty) setRows(toRows(server));
     
  }, [serverJson]);
  const mutation = useEmployeeMutation(code, (list: Investment[]) => api.putInvestments(code, list));
  const update = (key: number, patch: Partial<Investment>) => setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const total = addMoney(...rows.map((r) => r.amount));

  const save = async () => {
    try {
      await mutation.mutateAsync(rows);
      setErrors([]);
      toast.success('Investments saved');
    } catch (err) {
      if (err instanceof api.ApiError) {
        setErrors(err.errors.flatMap((x) => x.messages).length ? err.errors.flatMap((x) => x.messages) : [err.message]);
        focusField('f-investments');
      }
    }
  };

  return (
    <Section
      id="f-investments"
      title="Declared investments"
      desc="Usually revised in the final quarter. Only an investment with proof earns the rebate."
      right={
        <div className="rounded-full bg-v-wash2 px-3 py-1 text-xs font-bold bd-mono text-v-ink700">
          Declared {money(total)}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="grid grid-cols-[1.8fr_1.2fr_0.7fr_36px] gap-2 border-b border-[rgba(22,23,42,0.07)] pb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-[#6E6883]">
            <span>Instrument</span>
            <span>Declared</span>
            <span>Proof</span>
            <span />
          </div>
          {rows.length === 0 && <div className="py-5 text-[12.5px] text-[#6E6883]">No investments declared.</div>}
          {rows.map((r) => (
            <div key={r.key} className="grid grid-cols-[1.8fr_1.2fr_0.7fr_36px] items-center gap-2 py-1.5">
              <select aria-label="Instrument" className={inputClass()} value={r.instrument} onChange={(ev) => update(r.key, { instrument: ev.target.value })}>
                {ENUMS.instrument.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input aria-label="Declared amount" inputMode="decimal" className={cn(inputClass(), 'text-right bd-mono')} value={r.amount} onChange={(ev) => update(r.key, { amount: parseAmount(ev.target.value) })} />
              <Checkbox checked={r.proof} onChange={(x) => update(r.key, { proof: x })}>
                Proof
              </Checkbox>
              <button
                type="button"
                aria-label="Remove investment"
                title="Remove investment"
                onClick={() => setRows((list) => list.filter((x) => x.key !== r.key))}
                className="bd-iconbtn"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="bd-btn-dashed mt-3"
        onClick={() => setRows((list) => [...list, { key: newKey(), instrument: 'OTHER', amount: '', proof: false }])}
      >
        <Plus aria-hidden="true" className="h-3.5 w-3.5" />
        Add investment
      </button>
      {errors.length > 0 && (
        <Note tone="danger" className="mt-3">
          {errors.join(' ')}
        </Note>
      )}
      <SaveBar dirty={dirty} saving={mutation.isPending} label="Unsaved investments" onSave={() => void save()} onDiscard={() => setRows(toRows(server))} />
    </Section>
  );
}
