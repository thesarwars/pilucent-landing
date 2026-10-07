'use client';
import React, { FormEvent, useMemo, useState } from 'react';
import { MultipleRoleSelectDropdown } from '@/components/ui/ScrollSelectDropDowns/RoleSelectDropdown';
import { postEmployee } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import { IconChip } from '@/components/violet';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  X,
  UserPlus,
  Check,
  Loader2,
  Plus,
  Trash2,
  Building2,
  Pencil,
  Camera,
  Landmark,
  ShieldCheck,
} from 'lucide-react';

/* ── styles ──────────────────────────────────────────────────────────── */
const FIELD =
  'w-full min-w-0 rounded-[11px] border border-v-border bg-white px-3.5 py-2.5 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const RO = 'cursor-not-allowed bg-[#F7F5FC] text-v-ink500';
const LABEL = 'mb-1.5 block text-[12px] font-semibold text-v-ink600';
const CARD = 'rounded-[18px] bg-white p-[20px_24px] shadow-v-card';
const GRID3 = 'grid grid-cols-1 gap-[13px] sm:grid-cols-2 lg:grid-cols-3';
const REQ = <span className="text-v-primary">*</span>;
const ADD_PILL =
  'inline-flex items-center gap-1.5 rounded-full bg-[#F5F1FF] px-3 py-1.5 text-[12px] font-bold text-v-primary transition-colors hover:bg-v-tint150';
const RM_BTN =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-v-ink400 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg';

const STEPS = [
  'Overview',
  'Joining',
  'Address & Contact',
  'Payment',
  'Attendance',
  'Tax Info',
  'Payroll Info',
  'Education',
  'Documentation',
];

const money = (n: number) =>
  '$' + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 0 });

/* small field wrapper */
const Field = ({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn('min-w-0', className)}>
    <label className={LABEL}>
      {label} {required && REQ}
    </label>
    {children}
  </div>
);

/* section card with an icon-chip header */
const Section = ({
  icon,
  tone,
  eyebrow,
  title,
  children,
  divider,
}: {
  icon: React.ReactNode;
  tone: 'violet' | 'teal' | 'warn' | 'success' | 'danger';
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  divider?: boolean;
}) => (
  <div className={divider ? 'mt-5 border-t border-v-border pt-5' : ''}>
    <div className="mb-3.5 flex items-center gap-2.5">
      <IconChip tone={tone} size="sm">
        {icon}
      </IconChip>
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-v-ink400">
          {eyebrow}
        </div>
        <div className="text-[13px] font-extrabold text-v-ink900">{title}</div>
      </div>
    </div>
    {children}
  </div>
);

/* ── add-able sub-table ──────────────────────────────────────────────── */
function SubTable({
  title,
  rows,
  onAdd,
  onRemove,
  render,
  divider,
}: {
  title: string;
  rows: any[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  render: (row: any, i: number) => React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div className={divider ? 'mt-5 border-t border-v-border pt-5' : ''}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="text-[13px] font-extrabold text-v-ink900">{title}</span>
        <span className="flex-1" />
        <button type="button" onClick={onAdd} className={ADD_PILL}>
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-[12px] bg-v-wash px-3.5 py-3 text-[12px] text-v-ink400">
          No {title.toLowerCase()} added yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="flex animate-v-pop items-center gap-2">
              {render(row, i)}
              <button type="button" aria-label="Remove" onClick={() => onRemove(i)} className={RM_BTN}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const EmployeeOnboardWizard = ({
  isOpen,
  setIsOpen,
  refetch,
  onboardingKind,
}: {
  isOpen: boolean;
  setIsOpen: any;
  refetch?: any;
  onboardingKind: string;
  setOnboardingKind?: any;
}) => {
  const [step, setStep] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);

  /* core API fields (the only ones persisted) + UI-only extras */
  const [data, setData] = useState<any>({
    // persisted
    first_name: '',
    middle_name: '',
    last_name: '',
    confirmation_date: '',
    personal_email: '',
    // UI-only
    employee_id: '',
    gender: '',
    salutation: '',
    dob: '',
    ssn: '',
    department: '',
    designation: '',
    reports_to: '',
    employee_type: '',
    work_phone: '',
    work_email: '',
    offer_date: '',
    notice_days: '',
    contract_end: '',
    termination_date: '',
    last_worked: '',
    termination_type: '',
    termination_desc: '',
    phone: '',
    home_phone: '',
    address_line: '',
    state: '',
    city: '',
    zip: '',
    mailing_same: true,
    emergency_name: '',
    emergency_relation: '',
    emergency_phone: '',
    payment_method: 'BANK_TRANSFER',
    device_id: '',
    holiday_calendar: '',
    shift: '',
    // tax
    live_state: 'NY',
    marital: 'SINGLE',
    allowances: '',
    state_additional: '',
    works_in_state: 'YES',
    state_exempt: 'NO',
    which_w4: '2020+',
    w4_status: 'SINGLE',
    multiple_jobs: false,
    qualifying_children: '',
    other_dependents: '',
    other_income: '',
    deductions: '',
    extra_withholding: '',
    // payroll
    pay_schedule: '',
    pay_mode: 'SALARY',
    frequency: 'MONTHLY',
    salary: '',
    rate_hour: '',
    hours_day: '8',
    days_week: '5',
    flag_ot: false,
    flag_double_ot: false,
    flag_holiday: false,
    flag_bonus: false,
  });

  const [earnings, setEarnings] = useState<any[]>([]);
  const [deductions, setDeductions] = useState<any[]>([]);
  const [garnishments, setGarnishments] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [signed, setSigned] = useState(false);

  const set = (k: string, v: any) => setData((p: any) => ({ ...p, [k]: v }));

  const fullName =
    [data.first_name, data.middle_name, data.last_name].filter(Boolean).join(' ') || 'New employee';
  const inits =
    [data.first_name, data.last_name]
      .filter(Boolean)
      .map((s) => s[0])
      .join('')
      .toUpperCase() || 'NE';

  const step3Total = useMemo(
    () => (Number(data.qualifying_children) || 0) * 2000 + (Number(data.other_dependents) || 0) * 500,
    [data.qualifying_children, data.other_dependents],
  );

  const w4Done =
    data.qualifying_children !== '' || data.other_dependents !== '' || data.allowances !== '';

  /* ── submit (UNCHANGED payload — only persisted fields are sent) ──────── */
  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!data.first_name || !data.last_name || !data.confirmation_date || !data.personal_email) {
      toast.info('Please complete name, confirmation date and email (Overview & Joining).');
      return;
    }
    try {
      const formData = new FormData();
      const persisted = ['first_name', 'middle_name', 'last_name', 'confirmation_date', 'personal_email'];
      persisted.forEach((field) => formData.append(field, data[field] ?? ''));
      selectedRoles?.map((role: any) => formData.append('company_role_uids', role?.uid));
      formData.append('on_boarding_kind', onboardingKind);
      formData.append('preferred_email', data.personal_email);
      formData.append('company_email', data.personal_email);
      setIsPending(true);
      const res = await postEmployee(formData);
      if (res?.success) {
        toast.success('Employee added and invitation has ben sent to the mail.');
        refetch && refetch();
        setIsOpen(false);
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  const next = () => (step >= STEPS.length - 1 ? handleSubmit() : setStep((s) => s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] overflow-y-auto font-jakarta text-v-ink900"
      style={{ backgroundImage: 'linear-gradient(180deg,#F5F3FB,#ECE9F4)' }}
    >
      <div className="mx-auto max-w-[1180px] px-5 py-6">
        {/* header */}
        <div className="flex animate-v-rise items-center gap-3">
          <button
            type="button"
            aria-label="Back to employees"
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-v-border bg-white/70 text-v-ink500 backdrop-blur transition-colors hover:border-v-primary hover:text-v-primary"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-white"
            style={{ backgroundImage: 'linear-gradient(140deg,#7C4DFF,#A78BFF)' }}
          >
            <UserPlus className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <h1 className="m-0 text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
              Employee onboarding
            </h1>
            <p className="text-[12px] text-v-ink400">
              Manual entry · Step {step + 1} of {STEPS.length} · {STEPS[step]}
            </p>
          </div>
          <span className="flex-1" />
          <button
            type="button"
            aria-label="Close"
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-v-border bg-white/70 text-v-ink500 backdrop-blur transition-colors hover:border-v-danger-fg hover:text-v-danger-fg"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {/* stepper */}
        <div className="mt-4 animate-v-rise rounded-[18px] bg-white p-4 shadow-v-card">
          <div className="flex items-start">
            {STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <React.Fragment key={label}>
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                  >
                    <span
                      className={cn(
                        'flex h-[30px] w-[30px] items-center justify-center rounded-full text-[12px] font-extrabold transition-all',
                        active && 'bg-v-primary text-white shadow-[0_6px_16px_-6px_rgba(124,77,255,0.7)]',
                        done && 'bg-v-success-solid text-white',
                        !active && !done && 'bg-[#EDEAF4] text-v-ink400',
                      )}
                    >
                      {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        'hidden text-center text-[11px] font-bold leading-tight sm:block',
                        active ? 'text-v-primary' : done ? 'text-v-ink700' : 'text-v-ink400',
                      )}
                    >
                      {label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <span
                      className="mt-[14px] h-[2px] flex-1 rounded-full transition-colors"
                      style={{ backgroundColor: i < step ? '#1FA97A' : '#E2DDF0' }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* step body */}
        <div className="mt-4 flex flex-col gap-4">
          {step === 0 && (
            <div className={CARD}>
              {/* card eyebrow */}
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet" size="sm">
                  <UserPlus />
                </IconChip>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-v-ink400">
                  Profile &amp; personal
                </span>
              </div>

              {/* identity hero (nested) */}
              <div
                className="relative animate-v-pop overflow-hidden rounded-[20px] p-[22px] text-white"
                style={{ backgroundImage: 'linear-gradient(120deg,#211B38,#463481,#6E4BE0)' }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-[50px] -top-[60px] h-[180px] w-[180px] animate-v-float rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(167,139,255,0.45), transparent 70%)' }}
                />
                <div className="relative flex flex-wrap items-center gap-4">
                  <div className="relative">
                    <button
                      type="button"
                      className="flex h-[84px] w-[84px] items-center justify-center rounded-full text-white"
                      style={{ backgroundImage: 'linear-gradient(140deg,#7C4DFF,#A78BFF)' }}
                    >
                      {inits === 'NE' ? <Plus className="h-8 w-8" /> : <span className="text-[28px] font-extrabold">{inits}</span>}
                    </button>
                    <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-v-primary shadow">
                      <Pencil className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[19px] font-extrabold">{fullName}</div>
                    <div className="text-[12.5px] text-white/65">
                      {data.designation || 'Designation not set'} · {data.department || 'No department yet'}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#6EE7B7]" /> New hire
                      </span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white/80">
                        {data.employee_id ? `ID ${data.employee_id}` : 'ID auto-generated'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button type="button" className="inline-flex items-center gap-1.5 rounded-[10px] bg-white px-3.5 py-2 text-[12px] font-bold text-v-ink900 transition-colors hover:bg-white/90">
                      <Camera className="h-3.5 w-3.5" /> Upload photo
                    </button>
                    <button type="button" className="rounded-[10px] bg-white/12 px-3 py-1.5 text-[11.5px] font-semibold text-white/80 transition-colors hover:bg-white/20">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal details */}
              <div className="mt-5">
                <div className="mb-3.5 flex items-center gap-2">
                  <IconChip tone="violet" size="sm">
                    <UserPlus />
                  </IconChip>
                  <span className="text-[13px] font-extrabold text-v-ink900">Personal details</span>
                </div>
                <div className={GRID3}>
                  <Field label="Employee ID">
                    <input className={cn(FIELD, 'tabular-nums')} placeholder="Auto-generated" value={data.employee_id} onChange={(e) => set('employee_id', e.target.value)} />
                  </Field>
                  <Field label="First name" required>
                    <input className={FIELD} placeholder="Jane" required value={data.first_name} onChange={(e) => set('first_name', e.target.value)} />
                  </Field>
                  <Field label="Middle name">
                    <input className={FIELD} value={data.middle_name} onChange={(e) => set('middle_name', e.target.value)} />
                  </Field>
                  <Field label="Last name" required>
                    <input className={FIELD} placeholder="Doe" required value={data.last_name} onChange={(e) => set('last_name', e.target.value)} />
                  </Field>
                  <Field label="Gender">
                    <select className={cn(FIELD, 'cursor-pointer')} value={data.gender} onChange={(e) => set('gender', e.target.value)}>
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </Field>
                  <Field label="Salutation">
                    <select className={cn(FIELD, 'cursor-pointer')} value={data.salutation} onChange={(e) => set('salutation', e.target.value)}>
                      <option value="">Ms. / Mr. / Mx.</option>
                      <option>Mr</option>
                      <option>Ms</option>
                      <option>Mrs</option>
                      <option>Dr</option>
                    </select>
                  </Field>
                  <Field label="Date of birth" required>
                    <input type="date" className={cn(FIELD, 'tabular-nums')} value={data.dob} onChange={(e) => set('dob', e.target.value)} />
                  </Field>
                  <Field label="Role">
                    <MultipleRoleSelectDropdown
                      kind="EMPLOYEE"
                      setValue={setSelectedRoles}
                      value={selectedRoles}
                      ClassName="rounded-[11px] border border-v-border focus:border-v-primary"
                    />
                  </Field>
                  <Field label="SSN">
                    <input className={cn(FIELD, 'tabular-nums')} placeholder="XXX-XX-XXXX" value={data.ssn} onChange={(e) => set('ssn', e.target.value)} />
                  </Field>
                </div>
              </div>

              {/* Company details */}
              <Section icon={<Building2 />} tone="teal" eyebrow="Company" title="Company details" divider>
                <div className={GRID3}>
                  <Field label="Company">
                    <input className={cn(FIELD, RO)} readOnly value="Your company" />
                  </Field>
                  <Field label="Department">
                    <input className={FIELD} value={data.department} onChange={(e) => set('department', e.target.value)} />
                  </Field>
                  <Field label="Designation">
                    <input className={FIELD} value={data.designation} onChange={(e) => set('designation', e.target.value)} />
                  </Field>
                  <Field label="Reports to">
                    <input className={FIELD} value={data.reports_to} onChange={(e) => set('reports_to', e.target.value)} />
                  </Field>
                  <Field label="Employee type">
                    <select className={cn(FIELD, 'cursor-pointer')} value={data.employee_type} onChange={(e) => set('employee_type', e.target.value)}>
                      <option value="">Select</option>
                      <option value="FULL_TIME">Full time</option>
                      <option value="PART_TIME">Part time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERN">Intern</option>
                    </select>
                  </Field>
                  <Field label="Work phone">
                    <input className={cn(FIELD, 'tabular-nums')} value={data.work_phone} onChange={(e) => set('work_phone', e.target.value)} />
                  </Field>
                  <Field label="Work email" className="sm:col-span-2 lg:col-span-3">
                    <input type="email" className={FIELD} value={data.work_email} onChange={(e) => set('work_email', e.target.value)} />
                  </Field>
                </div>
              </Section>
            </div>
          )}

          {step === 1 && (
            <div className={CARD}>
              <Section icon={<Check />} tone="violet" eyebrow="Joining" title="Hiring info">
                <div className={GRID3}>
                  <Field label="Confirmation date" required>
                    <input type="date" className={cn(FIELD, 'tabular-nums')} value={data.confirmation_date} onChange={(e) => set('confirmation_date', e.target.value)} />
                  </Field>
                  <Field label="Offer date">
                    <input type="date" className={cn(FIELD, 'tabular-nums')} value={data.offer_date} onChange={(e) => set('offer_date', e.target.value)} />
                  </Field>
                  <Field label="Notice period (days)">
                    <input type="number" className={cn(FIELD, 'tabular-nums')} value={data.notice_days} onChange={(e) => set('notice_days', e.target.value)} />
                  </Field>
                  <Field label="Contract end date">
                    <input type="date" className={cn(FIELD, 'tabular-nums')} value={data.contract_end} onChange={(e) => set('contract_end', e.target.value)} />
                  </Field>
                </div>
              </Section>
              <Section icon={<X />} tone="danger" eyebrow="Termination" title="Termination (leave blank for active)" divider>
                <div className={GRID3}>
                  <Field label="Termination date">
                    <input type="date" className={cn(FIELD, 'tabular-nums')} value={data.termination_date} onChange={(e) => set('termination_date', e.target.value)} />
                  </Field>
                  <Field label="Last worked date">
                    <input type="date" className={cn(FIELD, 'tabular-nums')} value={data.last_worked} onChange={(e) => set('last_worked', e.target.value)} />
                  </Field>
                  <Field label="Termination type">
                    <select className={cn(FIELD, 'cursor-pointer')} value={data.termination_type} onChange={(e) => set('termination_type', e.target.value)}>
                      <option value="">Select</option>
                      <option value="VOLUNTARY">Voluntary</option>
                      <option value="INVOLUNTARY">Involuntary</option>
                      <option value="RETIREMENT">Retirement</option>
                    </select>
                  </Field>
                  <Field label="Description" className="sm:col-span-2 lg:col-span-3">
                    <input className={FIELD} value={data.termination_desc} onChange={(e) => set('termination_desc', e.target.value)} />
                  </Field>
                </div>
              </Section>
            </div>
          )}

          {step === 2 && (
            <div className={CARD}>
              <Section icon={<UserPlus />} tone="violet" eyebrow="Contact" title="Contact details">
                <div className={GRID3}>
                  <Field label="Phone"><input className={cn(FIELD, 'tabular-nums')} value={data.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
                  <Field label="Home phone"><input className={cn(FIELD, 'tabular-nums')} value={data.home_phone} onChange={(e) => set('home_phone', e.target.value)} /></Field>
                  <Field label="Preferred email" required><input type="email" className={FIELD} value={data.personal_email} onChange={(e) => set('personal_email', e.target.value)} /></Field>
                </div>
              </Section>
              <Section icon={<Building2 />} tone="teal" eyebrow="Address" title="Home address" divider>
                <div className={GRID3}>
                  <Field label="Address line" className="sm:col-span-2 lg:col-span-3"><input className={FIELD} value={data.address_line} onChange={(e) => set('address_line', e.target.value)} /></Field>
                  <Field label="State"><input className={FIELD} value={data.state} onChange={(e) => set('state', e.target.value)} /></Field>
                  <Field label="City"><input className={FIELD} value={data.city} onChange={(e) => set('city', e.target.value)} /></Field>
                  <Field label="Zip"><input className={cn(FIELD, 'tabular-nums')} value={data.zip} onChange={(e) => set('zip', e.target.value)} /></Field>
                </div>
                <label className="mt-3 flex cursor-pointer items-center gap-2.5">
                  <span
                    onClick={() => set('mailing_same', !data.mailing_same)}
                    className={cn('flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px]', data.mailing_same ? 'border-v-primary bg-v-primary text-white' : 'border-v-border bg-white')}
                  >
                    {data.mailing_same && <Check className="h-3 w-3" strokeWidth={3.2} />}
                  </span>
                  <span className="text-[12.5px] font-semibold text-v-ink700">Mailing address same as above</span>
                </label>
              </Section>
              <Section icon={<ShieldCheck />} tone="warn" eyebrow="Emergency" title="Emergency contact" divider>
                <div className={GRID3}>
                  <Field label="Name"><input className={FIELD} value={data.emergency_name} onChange={(e) => set('emergency_name', e.target.value)} /></Field>
                  <Field label="Relationship"><input className={FIELD} value={data.emergency_relation} onChange={(e) => set('emergency_relation', e.target.value)} /></Field>
                  <Field label="Phone"><input className={cn(FIELD, 'tabular-nums')} value={data.emergency_phone} onChange={(e) => set('emergency_phone', e.target.value)} /></Field>
                </div>
              </Section>
            </div>
          )}

          {step === 3 && (
            <div className={CARD}>
              <Section icon={<Landmark />} tone="violet" eyebrow="Payment" title="Payment method">
                <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2">
                  <Field label="Payment method">
                    <select className={cn(FIELD, 'cursor-pointer')} value={data.payment_method} onChange={(e) => set('payment_method', e.target.value)}>
                      <option value="BANK_TRANSFER">Bank transfer</option>
                      <option value="CHECK">Check</option>
                      <option value="CASH">Cash</option>
                    </select>
                  </Field>
                </div>
                <div className="mt-3 flex items-start gap-2.5 rounded-[12px] bg-[#F7F5FC] px-3.5 py-3 text-[12px] text-v-ink500">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-v-primary" />
                  Bank details are collected securely during the employee&apos;s self-onboarding and are encrypted at rest.
                </div>
              </Section>
            </div>
          )}

          {step === 4 && (
            <div className={CARD}>
              <Section icon={<Check />} tone="teal" eyebrow="Attendance" title="Attendance setup">
                <div className={GRID3}>
                  <Field label="Attendance device ID"><input className={cn(FIELD, 'tabular-nums')} value={data.device_id} onChange={(e) => set('device_id', e.target.value)} /></Field>
                  <Field label="Holiday calendar">
                    <select className={cn(FIELD, 'cursor-pointer')} value={data.holiday_calendar} onChange={(e) => set('holiday_calendar', e.target.value)}>
                      <option value="">Select</option>
                      <option>Default calendar</option>
                    </select>
                  </Field>
                  <Field label="Shift">
                    <select className={cn(FIELD, 'cursor-pointer')} value={data.shift} onChange={(e) => set('shift', e.target.value)}>
                      <option value="">Select</option>
                      <option>Day</option>
                      <option>Evening</option>
                      <option>Night</option>
                    </select>
                  </Field>
                </div>
              </Section>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5 rounded-[18px] bg-white p-4 shadow-v-card">
                <IconChip tone={w4Done ? 'success' : 'danger'} size="sm">
                  <ShieldCheck />
                </IconChip>
                <div className="flex-1 text-[13px] font-bold text-v-ink900">Tax profile</div>
                {w4Done ? (
                  <span className="rounded-full bg-v-success-bg px-2.5 py-1 text-[11px] font-bold text-v-success-fg">Federal W-4 in progress</span>
                ) : (
                  <span className="rounded-full bg-v-danger-bg px-2.5 py-1 text-[11px] font-bold text-v-danger-fg">Federal W-4 missing</span>
                )}
              </div>

              <div className={CARD}>
                <Section icon={<Landmark />} tone="teal" eyebrow="State" title="State withholding">
                  <div className={GRID3}>
                    <Field label="State where employee lives">
                      <select className={cn(FIELD, 'cursor-pointer')} value={data.live_state} onChange={(e) => set('live_state', e.target.value)}>
                        <option value="NY">New York</option>
                        <option value="MN">Minnesota</option>
                        <option value="CA">California</option>
                      </select>
                    </Field>
                    <Field label="Marital status">
                      <select className={cn(FIELD, 'cursor-pointer')} value={data.marital} onChange={(e) => set('marital', e.target.value)}>
                        <option value="SINGLE">Single</option>
                        <option value="MARRIED">Married</option>
                        <option value="HEAD">Head of household</option>
                      </select>
                    </Field>
                    <Field label="Total allowances (box f)"><input type="number" className={cn(FIELD, 'tabular-nums')} value={data.allowances} onChange={(e) => set('allowances', e.target.value)} /></Field>
                    <Field label="Additional withholding"><input type="number" className={cn(FIELD, 'tabular-nums')} value={data.state_additional} onChange={(e) => set('state_additional', e.target.value)} /></Field>
                    <Field label="Works in this state?">
                      <select className={cn(FIELD, 'cursor-pointer')} value={data.works_in_state} onChange={(e) => set('works_in_state', e.target.value)}>
                        <option value="YES">Yes</option>
                        <option value="NO">No</option>
                      </select>
                    </Field>
                    <Field label="Exempt from state tax?">
                      <select className={cn(FIELD, 'cursor-pointer')} value={data.state_exempt} onChange={(e) => set('state_exempt', e.target.value)}>
                        <option value="NO">No</option>
                        <option value="YES">Yes</option>
                      </select>
                    </Field>
                  </div>
                  <p className="mt-3 text-[11.5px] text-v-ink400">
                    Note: the federal Form W-4 does not replace the state withholding certificate.
                  </p>
                </Section>

                <Section icon={<ShieldCheck />} tone="violet" eyebrow="Federal" title="Federal W-4" divider>
                  <div className={GRID3}>
                    <Field label="Which W-4">
                      <select className={cn(FIELD, 'cursor-pointer')} value={data.which_w4} onChange={(e) => set('which_w4', e.target.value)}>
                        <option value="2020+">2020 or later</option>
                        <option value="2019-">2019 or earlier</option>
                      </select>
                    </Field>
                    <Field label="Withholding status (Step 1c)">
                      <select className={cn(FIELD, 'cursor-pointer')} value={data.w4_status} onChange={(e) => set('w4_status', e.target.value)}>
                        <option value="SINGLE">Single or married filing separately</option>
                        <option value="MARRIED">Married filing jointly</option>
                        <option value="HEAD">Head of household</option>
                      </select>
                    </Field>
                    <Field label="Multiple jobs (Step 2c)">
                      <label className="flex h-[42px] cursor-pointer items-center gap-2.5 rounded-[11px] border border-v-border bg-white px-3.5">
                        <span
                          onClick={() => set('multiple_jobs', !data.multiple_jobs)}
                          className={cn('flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px]', data.multiple_jobs ? 'border-v-primary bg-v-primary text-white' : 'border-v-border')}
                        >
                          {data.multiple_jobs && <Check className="h-3 w-3" strokeWidth={3.2} />}
                        </span>
                        <span className="text-[12.5px] text-v-ink700">Two jobs / spouse works</span>
                      </label>
                    </Field>
                  </div>

                  <div className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-v-ink400">
                    Step 3 — Dependents
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-[13px] sm:grid-cols-3">
                    <Field label="Qualifying children under 17"><input type="number" className={cn(FIELD, 'tabular-nums')} value={data.qualifying_children} onChange={(e) => set('qualifying_children', e.target.value)} /></Field>
                    <Field label="Other dependents"><input type="number" className={cn(FIELD, 'tabular-nums')} value={data.other_dependents} onChange={(e) => set('other_dependents', e.target.value)} /></Field>
                    <Field label="Step 3 total (auto)">
                      <input readOnly className="w-full rounded-[11px] border border-[#E7DEFB] bg-[#F5F1FF] px-3.5 py-2.5 text-[13px] font-extrabold tabular-nums text-[#5B3BC4] outline-none" value={money(step3Total)} />
                    </Field>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-[13px] sm:grid-cols-3">
                    <Field label="Step 4a — Other income"><input type="number" className={cn(FIELD, 'tabular-nums')} value={data.other_income} onChange={(e) => set('other_income', e.target.value)} /></Field>
                    <Field label="Step 4b — Deductions"><input type="number" className={cn(FIELD, 'tabular-nums')} value={data.deductions} onChange={(e) => set('deductions', e.target.value)} /></Field>
                    <Field label="Step 4c — Extra withholding"><input type="number" className={cn(FIELD, 'tabular-nums')} value={data.extra_withholding} onChange={(e) => set('extra_withholding', e.target.value)} /></Field>
                  </div>
                </Section>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className={CARD}>
              <Section icon={<Landmark />} tone="violet" eyebrow="Payroll" title="Pay setup">
                <div className="grid grid-cols-1 items-end gap-[13px] sm:grid-cols-2">
                  <Field label="Pay schedule">
                    <select className={cn(FIELD, 'cursor-pointer')} value={data.pay_schedule} onChange={(e) => set('pay_schedule', e.target.value)}>
                      <option value="">Select</option>
                      <option>Monthly salaried</option>
                      <option>Bi-weekly</option>
                    </select>
                  </Field>
                  <div className="flex items-center gap-1 rounded-full bg-v-wash2 p-1">
                    {(['SALARY', 'HOURLY'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => set('pay_mode', m)}
                        className={cn('flex-1 rounded-full px-3 py-2 text-[12.5px] font-bold capitalize transition-colors', data.pay_mode === m ? 'bg-white text-v-primary shadow-sm' : 'text-v-ink500')}
                      >
                        {m.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2.5">
                  {[
                    ['flag_ot', 'Overtime'],
                    ['flag_double_ot', 'Double OT'],
                    ['flag_holiday', 'Holiday'],
                    ['flag_bonus', 'Bonus'],
                  ].map(([k, lbl]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => set(k, !data[k])}
                      className={cn('inline-flex items-center gap-2 rounded-[10px] border-[1.5px] px-3 py-2 text-[12.5px] font-semibold transition-colors', data[k] ? 'border-v-primary bg-[#F8F5FF] text-v-primary' : 'border-v-border text-v-ink600')}
                    >
                      <span className={cn('flex h-[16px] w-[16px] items-center justify-center rounded-[4px] border-[1.5px]', data[k] ? 'border-v-primary bg-v-primary text-white' : 'border-v-border')}>
                        {data[k] && <Check className="h-2.5 w-2.5" strokeWidth={3.4} />}
                      </span>
                      {lbl}
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-[13px] sm:grid-cols-2 lg:grid-cols-4">
                  {data.pay_mode === 'SALARY' ? (
                    <>
                      <Field label="Frequency">
                        <select className={cn(FIELD, 'cursor-pointer')} value={data.frequency} onChange={(e) => set('frequency', e.target.value)}>
                          <option value="MONTHLY">Monthly</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="BIWEEKLY">Bi-weekly</option>
                        </select>
                      </Field>
                      <Field label="Salary"><input type="number" className={cn(FIELD, 'tabular-nums')} value={data.salary} onChange={(e) => set('salary', e.target.value)} /></Field>
                    </>
                  ) : (
                    <Field label="Rate / hour"><input type="number" className={cn(FIELD, 'tabular-nums')} value={data.rate_hour} onChange={(e) => set('rate_hour', e.target.value)} /></Field>
                  )}
                  <Field label="Hours / day"><input type="number" className={cn(FIELD, 'tabular-nums')} value={data.hours_day} onChange={(e) => set('hours_day', e.target.value)} /></Field>
                  <Field label="Days / week"><input type="number" className={cn(FIELD, 'tabular-nums')} value={data.days_week} onChange={(e) => set('days_week', e.target.value)} /></Field>
                </div>
              </Section>

              <SubTable
                title="Earnings"
                rows={earnings}
                onAdd={() => setEarnings((p) => [...p, { type: '', desc: '', amount: '' }])}
                onRemove={(i) => setEarnings((p) => p.filter((_, x) => x !== i))}
                divider
                render={(row, i) => (
                  <>
                    <input className={cn(FIELD, 'flex-1')} placeholder="Pay type" value={row.type} onChange={(e) => setEarnings((p) => p.map((r, x) => (x === i ? { ...r, type: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'flex-1')} placeholder="Description" value={row.desc} onChange={(e) => setEarnings((p) => p.map((r, x) => (x === i ? { ...r, desc: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-32 tabular-nums')} placeholder="Amount" type="number" value={row.amount} onChange={(e) => setEarnings((p) => p.map((r, x) => (x === i ? { ...r, amount: e.target.value } : r)))} />
                  </>
                )}
              />

              <SubTable
                title="Deductions & contributions"
                rows={deductions}
                onAdd={() => setDeductions((p) => [...p, { name: '', employee: '', tax: '', company: '' }])}
                onRemove={(i) => setDeductions((p) => p.filter((_, x) => x !== i))}
                render={(row, i) => (
                  <>
                    <input className={cn(FIELD, 'flex-1')} placeholder="Name" value={row.name} onChange={(e) => setDeductions((p) => p.map((r, x) => (x === i ? { ...r, name: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-28 tabular-nums')} placeholder="Employee" value={row.employee} onChange={(e) => setDeductions((p) => p.map((r, x) => (x === i ? { ...r, employee: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-28')} placeholder="Tax option" value={row.tax} onChange={(e) => setDeductions((p) => p.map((r, x) => (x === i ? { ...r, tax: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-28 tabular-nums')} placeholder="Company" value={row.company} onChange={(e) => setDeductions((p) => p.map((r, x) => (x === i ? { ...r, company: e.target.value } : r)))} />
                  </>
                )}
              />

              <SubTable
                title="Garnishment"
                rows={garnishments}
                onAdd={() => setGarnishments((p) => [...p, { type: '', desc: '', amount: '', maxPct: '' }])}
                onRemove={(i) => setGarnishments((p) => p.filter((_, x) => x !== i))}
                render={(row, i) => (
                  <>
                    <input className={cn(FIELD, 'w-32')} placeholder="Type" value={row.type} onChange={(e) => setGarnishments((p) => p.map((r, x) => (x === i ? { ...r, type: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'flex-1')} placeholder="Description" value={row.desc} onChange={(e) => setGarnishments((p) => p.map((r, x) => (x === i ? { ...r, desc: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-28 tabular-nums')} placeholder="Amount" type="number" value={row.amount} onChange={(e) => setGarnishments((p) => p.map((r, x) => (x === i ? { ...r, amount: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-32 tabular-nums')} placeholder="Max % disp." type="number" value={row.maxPct} onChange={(e) => setGarnishments((p) => p.map((r, x) => (x === i ? { ...r, maxPct: e.target.value } : r)))} />
                  </>
                )}
              />
            </div>
          )}

          {step === 7 && (
            <div className={CARD}>
              <SubTable
                title="Education"
                rows={education}
                onAdd={() => setEducation((p) => [...p, { institution: '', degree: '', level: '', year: '', grade: '' }])}
                onRemove={(i) => setEducation((p) => p.filter((_, x) => x !== i))}
                render={(row, i) => (
                  <>
                    <input className={cn(FIELD, 'flex-1')} placeholder="Institution" value={row.institution} onChange={(e) => setEducation((p) => p.map((r, x) => (x === i ? { ...r, institution: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-32')} placeholder="Degree" value={row.degree} onChange={(e) => setEducation((p) => p.map((r, x) => (x === i ? { ...r, degree: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-28')} placeholder="Level" value={row.level} onChange={(e) => setEducation((p) => p.map((r, x) => (x === i ? { ...r, level: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-24 tabular-nums')} placeholder="Year" value={row.year} onChange={(e) => setEducation((p) => p.map((r, x) => (x === i ? { ...r, year: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-24 tabular-nums')} placeholder="Grade" value={row.grade} onChange={(e) => setEducation((p) => p.map((r, x) => (x === i ? { ...r, grade: e.target.value } : r)))} />
                  </>
                )}
              />
              <SubTable
                title="Work experience"
                rows={experience}
                divider
                onAdd={() => setExperience((p) => [...p, { company: '', designation: '', start: '', end: '', salary: '' }])}
                onRemove={(i) => setExperience((p) => p.filter((_, x) => x !== i))}
                render={(row, i) => (
                  <>
                    <input className={cn(FIELD, 'flex-1')} placeholder="Company" value={row.company} onChange={(e) => setExperience((p) => p.map((r, x) => (x === i ? { ...r, company: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-36')} placeholder="Designation" value={row.designation} onChange={(e) => setExperience((p) => p.map((r, x) => (x === i ? { ...r, designation: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-32 tabular-nums')} type="date" value={row.start} onChange={(e) => setExperience((p) => p.map((r, x) => (x === i ? { ...r, start: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-32 tabular-nums')} type="date" value={row.end} onChange={(e) => setExperience((p) => p.map((r, x) => (x === i ? { ...r, end: e.target.value } : r)))} />
                    <input className={cn(FIELD, 'w-28 tabular-nums')} placeholder="Salary" type="number" value={row.salary} onChange={(e) => setExperience((p) => p.map((r, x) => (x === i ? { ...r, salary: e.target.value } : r)))} />
                  </>
                )}
              />
            </div>
          )}

          {step === 8 && (
            <div className={CARD}>
              <Section icon={<Pencil />} tone="violet" eyebrow="Documentation" title="Employee signature">
                <button
                  type="button"
                  onClick={() => setSigned(true)}
                  className={cn(
                    'flex h-40 w-full items-center justify-center rounded-[14px] border-2 border-dashed transition-colors',
                    signed ? 'border-v-primary bg-[#F8F5FF]' : 'border-v-border bg-v-wash hover:border-[#B49AFF]',
                  )}
                >
                  {signed ? (
                    <span className="text-[34px] italic text-[#5B3BC4]" style={{ fontFamily: 'cursive' }}>
                      {fullName}
                    </span>
                  ) : (
                    <span className="text-[13px] text-v-ink400">Click to sign as {fullName}</span>
                  )}
                </button>
                {signed && (
                  <button type="button" onClick={() => setSigned(false)} className="mt-2.5 text-[12px] font-semibold text-v-primary hover:underline">
                    Clear signature
                  </button>
                )}
              </Section>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-white px-5 py-3.5 shadow-v-card">
          {step > 0 ? (
            <button
              type="button"
              onClick={prev}
              className="rounded-[11px] border border-v-border bg-white px-4 py-2.5 text-[13px] font-bold text-v-ink700 transition-colors hover:border-v-primary hover:text-v-primary"
            >
              Previous
            </button>
          ) : (
            <span />
          )}
          <span className="flex-1 text-center text-[12.5px] font-semibold tabular-nums text-v-ink400">
            Step {step + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            onClick={next}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-[11px] bg-v-primary px-5 py-2.5 text-[13px] font-bold text-white shadow-v-btn transition-colors hover:bg-v-primary-hover disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {step >= STEPS.length - 1 ? (isPending ? 'Finishing…' : 'Finish onboarding') : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOnboardWizard;
