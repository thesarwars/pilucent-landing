'use client';

import * as React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Chip, VioletButton } from '@/components/violet';
import { toast } from '@/lib/ToastService';
import * as api from '../api';
import { ENUMS } from '../enums';
import { useEmployeeMutation } from '../hooks';
import { useLang } from '../i18n';
import type { Nominee, Personal, Profile } from '../types';
import {
  DateInput,
  Field,
  FieldGrid,
  Note,
  SaveBar,
  Section,
  SelectInput,
  TextArea,
  TextInput,
  errs,
  focusField,
  inputClass,
  useSectionForm,
} from '../ui';
import { mobileValid, nidValid, shareTotal, sharesComplete } from '../validate';

function ageOn(dob: string | null, asOf: string): number | null {
  if (!dob) return null;
  const [y, m, d] = dob.split('-').map(Number);
  const [ty, tm, td] = asOf.split('-').map(Number);
  return ty - y - (tm < m || (tm === m && td < d) ? 1 : 0);
}

export function PersonalTab({ profile }: { profile: Profile }) {
  const { n } = useLang();
  const code = profile.code;
  // The photograph is uploaded from the profile header, not saved with this form.
  const server = React.useMemo(() => {
    const { photo, ...rest } = profile.personal;
    void photo;
    return rest;
  }, [profile.personal]);
  const mutation = useEmployeeMutation(code, (changes: Partial<Personal>) => api.patchSection(code, 'personal', changes));
  const form = useSectionForm(server, (changes) => mutation.mutateAsync(changes));
  const v = form.values;
  const set = form.set;
  const e = form.errors;
  const age = ageOn(v.dob, profile.asOf);

  return (
    <div className="space-y-4">
      <Section
        title="Identity"
        desc="Names, parentage and government identifiers. These print on the service book and the ID card."
      >
        <FieldGrid>
          <Field htmlFor="f-nameEn" label="Full name (English)" required span={3} errors={errs(e, 'nameEn')}>
            <TextInput id="f-nameEn" value={v.nameEn} onChange={(x) => set('nameEn', x)} invalid={!!e.nameEn} />
          </Field>
          <Field
            htmlFor="f-nameBn"
            label="Full name (Bangla)"
            span={3}
            errors={errs(e, 'nameBn')}
            help={v.nameBn ? '' : 'Bangla payslips and the leave register will show the English name.'}
          >
            <TextInput id="f-nameBn" lang="bn" value={v.nameBn} onChange={(x) => set('nameBn', x)} placeholder="বাংলায় নাম" />
          </Field>
          <Field htmlFor="f-fatherName" label="Father's name" required span={3} help="Required on the service book." errors={errs(e, 'fatherName')}>
            <TextInput id="f-fatherName" value={v.fatherName} onChange={(x) => set('fatherName', x)} />
          </Field>
          <Field htmlFor="f-motherName" label="Mother's name" required span={3} help="Required on the service book." errors={errs(e, 'motherName')}>
            <TextInput id="f-motherName" value={v.motherName} onChange={(x) => set('motherName', x)} />
          </Field>
          <Field htmlFor="f-dob" label="Date of birth" required span={2} errors={errs(e, 'dob')}>
            <DateInput id="f-dob" value={v.dob} onChange={(x) => set('dob', x)} />
            {age !== null && (
              <div className="mt-1.5 flex flex-wrap gap-1.5" aria-live="polite">
                <Chip tone="neutral">{n(age)} years old</Chip>
                {age >= 65 && <Chip tone="violet">Senior citizen (65+)</Chip>}
                {age < 18 && <Chip tone="warn">Adolescent worker — restricted hours</Chip>}
              </div>
            )}
          </Field>
          <Field
            htmlFor="f-gender"
            label="Gender"
            required
            span={2}
            help="Determines the tax-free threshold and maternity eligibility."
            errors={errs(e, 'gender')}
          >
            <SelectInput id="f-gender" value={v.gender} onChange={(x) => set('gender', x)} options={ENUMS.gender} />
          </Field>
          <Field htmlFor="f-marital" label="Marital status" span={2} errors={errs(e, 'marital')}>
            <SelectInput id="f-marital" value={v.marital} onChange={(x) => set('marital', x)} options={ENUMS.marital} />
          </Field>
          {v.marital === 'MARRIED' && (
            <Field htmlFor="f-spouse" label="Spouse name" span={2} errors={errs(e, 'spouseName')}>
              <TextInput id="f-spouse" value={v.spouseName} onChange={(x) => set('spouseName', x)} />
            </Field>
          )}
          <Field htmlFor="f-blood" label="Blood group" span={2} errors={errs(e, 'blood')}>
            <SelectInput id="f-blood" value={v.blood} onChange={(x) => set('blood', x)} options={ENUMS.blood} />
          </Field>
          <Field htmlFor="f-religion" label="Religion" span={2} help="Used to assign festival bonus events." errors={errs(e, 'religion')}>
            <SelectInput id="f-religion" value={v.religion} onChange={(x) => set('religion', x)} options={ENUMS.religion} />
          </Field>
          <Field
            htmlFor="f-nid"
            label="National ID (NID)"
            required
            span={2}
            errors={errs(e, 'nid').length ? errs(e, 'nid') : v.nid && !nidValid(v.nid) ? ['NID must be 10, 13 or 17 digits.'] : []}
          >
            <TextInput id="f-nid" inputMode="numeric" value={v.nid} onChange={(x) => set('nid', x)} invalid={!!v.nid && !nidValid(v.nid)} />
          </Field>
          <Field htmlFor="f-birthCert" label="Birth certificate no." span={2} errors={errs(e, 'birthCert')}>
            <TextInput id="f-birthCert" inputMode="numeric" value={v.birthCert} onChange={(x) => set('birthCert', x)} />
          </Field>
          <Field htmlFor="f-passport" label="Passport no." span={2} errors={errs(e, 'passport')}>
            <TextInput id="f-passport" value={v.passport} onChange={(x) => set('passport', x)} />
          </Field>
          <Field
            htmlFor="f-workPermit"
            label="Work permit"
            span={2}
            help="Required for a non-resident foreign taxpayer."
            errors={errs(e, 'workPermit')}
          >
            <TextInput id="f-workPermit" value={v.workPermit} onChange={(x) => set('workPermit', x)} />
          </Field>
        </FieldGrid>
      </Section>

      <Section title="Contact" desc="Where payroll notices, payslips and statutory correspondence go.">
        <FieldGrid>
          <Field
            htmlFor="f-mobile"
            label="Mobile"
            required
            span={2}
            help="Country code +880 is added automatically."
            errors={errs(e, 'mobile').length ? errs(e, 'mobile') : v.mobile && !mobileValid(v.mobile) ? ['Mobile must be 11 digits starting 01.'] : []}
          >
            <TextInput id="f-mobile" inputMode="tel" value={v.mobile} onChange={(x) => set('mobile', x)} placeholder="01XXXXXXXXX" invalid={!!v.mobile && !mobileValid(v.mobile)} />
          </Field>
          <Field htmlFor="f-email" label="Email" span={2} errors={errs(e, 'email')}>
            <TextInput id="f-email" type="email" value={v.email} onChange={(x) => set('email', x)} />
          </Field>
          <span className="hidden md:col-span-2 md:block" />
          <Field htmlFor="f-emgName" label="Emergency contact" required span={2} errors={errs(e, 'emergencyName')}>
            <TextInput id="f-emgName" value={v.emergencyName} onChange={(x) => set('emergencyName', x)} />
          </Field>
          <Field htmlFor="f-emgRel" label="Relationship" required span={2} errors={errs(e, 'emergencyRelation')}>
            <SelectInput id="f-emgRel" value={v.emergencyRelation} onChange={(x) => set('emergencyRelation', x)} options={ENUMS.relation} />
          </Field>
          <Field htmlFor="f-emgPhone" label="Emergency phone" required span={2} errors={errs(e, 'emergencyPhone')}>
            <TextInput id="f-emgPhone" inputMode="tel" value={v.emergencyPhone} onChange={(x) => set('emergencyPhone', x)} placeholder="01XXXXXXXXX" />
          </Field>
        </FieldGrid>
      </Section>

      <Section title="Address" desc="Present and permanent address. The permanent address appears on the service book.">
        <FieldGrid>
          <Field htmlFor="f-presAddr" label="Present address" required span={4} errors={errs(e, 'presentAddress')}>
            <TextArea id="f-presAddr" value={v.presentAddress} onChange={(x) => set('presentAddress', x)} />
          </Field>
          <Field htmlFor="f-presDiv" label="Division" required span={2} errors={errs(e, 'presentDivision')}>
            <SelectInput id="f-presDiv" value={v.presentDivision} onChange={(x) => set('presentDivision', x)} options={ENUMS.division} />
          </Field>
          <Field htmlFor="f-permSame" label="Permanent address" span={6}>
            <button
              id="f-permSame"
              type="button"
              role="checkbox"
              aria-checked={v.permanentSame}
              onClick={() => set('permanentSame', !v.permanentSame)}
              className="flex items-center gap-2 text-[12.5px] font-semibold text-v-ink700"
            >
              <span
                className={cn(
                  'flex h-[18px] w-[18px] items-center justify-center rounded-[6px] border-[1.5px] text-[11px] text-white',
                  v.permanentSame ? 'border-v-primary bg-v-primary' : 'border-[rgba(22,23,42,0.22)] bg-white'
                )}
              >
                {v.permanentSame ? '✓' : ''}
              </span>
              Same as present
            </button>
          </Field>
          {!v.permanentSame && (
            <>
              <Field htmlFor="f-permAddr" label="Permanent address" required span={4} errors={errs(e, 'permanentAddress')}>
                <TextArea id="f-permAddr" value={v.permanentAddress} onChange={(x) => set('permanentAddress', x)} />
              </Field>
              <Field htmlFor="f-permDiv" label="Division" required span={2} errors={errs(e, 'permanentDivision')}>
                <SelectInput id="f-permDiv" value={v.permanentDivision} onChange={(x) => set('permanentDivision', x)} options={ENUMS.division} />
              </Field>
            </>
          )}
        </FieldGrid>
      </Section>

      <SaveBar dirty={form.dirty} saving={form.saving} onSave={() => void form.submit()} onDiscard={form.reset} />

      <NomineesCard code={code} server={profile.nominees} />
    </div>
  );
}

/* ── nominees ─────────────────────────────────────────────────────── */

/** Row keys for editable lists; unique for the page's lifetime. */
let lastKey = 0;
const newKey = () => ++lastKey;

type Row = Nominee & { key: number };

function NomineesCard({ code, server }: { code: string; server: Nominee[] }) {
  const { n } = useLang();
  const fromServer = React.useCallback(
    (list: Nominee[]): Row[] => list.map((x) => ({ ...x, key: newKey() })),
    []
  );
  const serverJson = JSON.stringify(server);
  const [rows, setRows] = React.useState<Row[]>(() => fromServer(server));
  const [errors, setErrors] = React.useState<string[]>([]);
  const dirty = JSON.stringify(fromServerPlain(rows)) !== JSON.stringify(fromServerPlain(server));

  React.useEffect(() => {
    if (!dirty) setRows(fromServer(server));
     
  }, [serverJson]);

  const mutation = useEmployeeMutation(code, (list: Nominee[]) => api.putNominees(code, list));
  const total = shareTotal(rows.map((r) => r.share));
  const complete = sharesComplete(total);
  const update = (key: number, patch: Partial<Nominee>) =>
    setRows((list) => list.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const save = async () => {
    try {
      await mutation.mutateAsync(rows);
      setErrors([]);
      toast.success('Nominees saved');
    } catch (err) {
      if (err instanceof api.ApiError) {
        setErrors(err.errors.flatMap((x) => x.messages).length ? err.errors.flatMap((x) => x.messages) : [err.message]);
        focusField('f-nominee');
      }
    }
  };

  return (
    <Section
      id="f-nominee"
      title="Nominees"
      desc="Nominees receive provident fund, group insurance and death benefits. Shares must total 100%."
      right={
        <div
          aria-live="polite"
          className={cn(
            'flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold tabular-nums',
            rows.length === 0 || complete
              ? 'border-[rgba(31,169,122,0.3)] bg-[rgba(31,169,122,0.12)] text-[#157A5B]'
              : 'border-[rgba(244,63,94,0.3)] bg-[rgba(244,63,94,0.1)] text-[#E11D48]'
          )}
        >
          <span className="font-semibold opacity-70">Total</span>
          {n(String(total))}%
        </div>
      }
    >
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[2fr_1.2fr_1.6fr_0.9fr_36px] gap-2 border-b border-[rgba(22,23,42,0.07)] pb-2 text-[11px] font-bold uppercase tracking-[0.05em] text-v-ink400">
            <span>Name</span>
            <span>Relationship</span>
            <span>NID</span>
            <span>Share</span>
            <span />
          </div>
          {rows.length === 0 && (
            <div className="py-5 text-[12.5px] text-v-ink400">
              No nominee on file. Required before provident fund or gratuity is paid out.
            </div>
          )}
          {rows.map((r) => (
            <div key={r.key} className="grid grid-cols-[2fr_1.2fr_1.6fr_0.9fr_36px] items-center gap-2 py-1.5">
              <input
                aria-label="Nominee name"
                className={inputClass()}
                value={r.name}
                onChange={(ev) => update(r.key, { name: ev.target.value })}
                placeholder="Full name"
              />
              <select
                aria-label="Relationship"
                className={cn(inputClass(), 'cursor-pointer')}
                value={r.relation}
                onChange={(ev) => update(r.key, { relation: ev.target.value })}
              >
                {ENUMS.relation.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                aria-label="Nominee NID"
                inputMode="numeric"
                className={inputClass(!!r.nid && !nidValid(r.nid))}
                value={r.nid}
                onChange={(ev) => update(r.key, { nid: ev.target.value })}
                placeholder="10, 13 or 17 digits"
              />
              <div className="relative">
                <input
                  aria-label="Share percent"
                  inputMode="decimal"
                  className={cn(inputClass(rows.length > 0 && !complete), 'pr-7 text-right tabular-nums')}
                  value={r.share}
                  onChange={(ev) => update(r.key, { share: ev.target.value.replace(/[^0-9.]/g, '') })}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-v-ink400">%</span>
              </div>
              <button
                type="button"
                aria-label="Remove nominee"
                title="Remove nominee"
                onClick={() => setRows((list) => list.filter((x) => x.key !== r.key))}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-v-ink400 hover:bg-v-danger-bg hover:text-v-danger-fg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <VioletButton
        variant="soft"
        size="sm"
        className="mt-3"
        leftIcon={<Plus className="h-3.5 w-3.5" />}
        onClick={() =>
          setRows((list) => [...list, { key: newKey(), name: '', relation: 'OTHER', nid: '', share: '' }])
        }
      >
        Add nominee
      </VioletButton>
      {rows.length > 0 && !complete && (
        <Note tone="danger" className="mt-3">
          Nominee shares total {n(String(total))}%. Adjust the shares so they add up to exactly 100% before saving.
        </Note>
      )}
      {errors.length > 0 && (
        <Note tone="danger" className="mt-3">
          {errors.join(' ')}
        </Note>
      )}
      <SaveBar
        dirty={dirty}
        saving={mutation.isPending}
        label="Unsaved nominee changes"
        onSave={() => void save()}
        onDiscard={() => {
          setRows(fromServer(server));
          setErrors([]);
        }}
      />
    </Section>
  );
}

function fromServerPlain(list: Nominee[]) {
  return list.map(({ name, relation, nid, share }) => ({ name, relation, nid, share }));
}
