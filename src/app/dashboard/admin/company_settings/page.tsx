'use client';
import React, { useState, useEffect, useRef, useMemo, ChangeEvent } from 'react';
import Image from 'next/image';
import {
  Pencil,
  Upload,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Globe,
  Clock,
  MapPin,
  ShieldCheck,
  User,
  Scale,
  Tags,
  Check,
  Copy,
  Info as InfoIcon,
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import TimezoneSelect from 'react-timezone-select';
import Notifications from '@/components/Company_Setting/Notifications';
import Reports from '@/components/Company_Setting/Reports';
import AccountingPolicy from '@/components/Company_Setting/Accounting';
import Sales from '@/components/Company_Setting/Sales';
import Expenses from '@/components/Company_Setting/Expenses';
import Advanced from '@/components/Company_Setting/Advanced';
import { GetData, Patch, PatchMultipart } from '@/services/FetchMethods';
import { useAppDispatch } from '@/app/redux/store';
import { setCompanySettingsData } from '@/app/redux/CompanyData/CompanyData';
import { industries } from '@/lib/helpers/companyChoices';
import { toast } from '@/lib/ToastService';
import MainLoader from '@/components/MainLoader/MainLoader';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  Chip,
  IconChip,
  Toggle,
  VioletButton,
  VioletInput,
  VioletSelect,
  VioletTextarea,
  type VioletTone,
} from '@/components/violet';

/** Circumference of the completeness ring (r = 26). */
const RING_C = 163.36;

const Page = () => {
  const [tab, setTab] = useState(0);

  const items = [
    { id: 1, title: 'Company', content: <Company /> },
    { id: 2, title: 'Notifications', content: <Notifications /> },
    { id: 3, title: 'Reports', content: <Reports /> },
    { id: 4, title: 'Accounting', content: <AccountingPolicy /> },
    { id: 5, title: 'Sales', content: <Sales /> },
    { id: 6, title: 'Expenses', content: <Expenses /> },
    { id: 7, title: 'Advanced', content: <Advanced /> },
  ];

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin', href: '#' },
          { label: 'Company Settings' },
        ]}
      />
      <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
        Company Settings
      </h1>

      <div className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(index)}
            className={cn(
              'rounded-full px-4 py-2 text-[13px] font-bold transition-colors',
              tab === index
                ? 'bg-v-ink900 text-white shadow-v-btn'
                : 'border border-v-border bg-white text-v-ink500 hover:text-v-ink900'
            )}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="mt-1">{items[tab].content}</div>
    </div>
  );
};

const Company = () => {
  const [editSection, setEditSection] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const [token, setToken] = useState('');
  const { data, isPending, refetch } = useQuery({
    queryKey: ['company_data'],
    queryFn: async () => {
      const response = await GetData(`we`, token);
      dispatch(setCompanySettingsData(response));
      return response;
    },
  });

  const [companySettings, setCompanySettings] = useState<any>({
    preffered_first_financial_month: '',
    preffered_first_tax_month: '',
    accounting_method: '',
    preffered_tax: '',
    tax_form: '',
    is_chart_of_account: '',
    is_track_classes: '',
    is_track_location: '',
    prefill_forms: '',
    auto_invoice_unbilled_activity: '',
    auto_apply_bill_payments: '',
    is_organized_job_related_activity: '',
    home_currency: '',
    multi_currency: '',
    is_warn_duplicate_cheque_number: '',
    is_warn_duplicate_bill_number: '',
    is_warn_duplicate_journal_number: '',
    sing_me_out: '',
    tax_id: '',
    preffered_first_day: '',
    is_service_field: '',
    is_allow_time_to_billable: '',
  });
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    legal_name: '',
    kind: '',
    status: '',
    business_id_no: '',
    vat_number: '',
    time_zone: '',
    email: '',
    phone: '',
    website: '',
    customer_facing_address: '',
    legal_address: '',
    logo: '',
  });
  const [companyAddress, setCompanyAddress] = useState({
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
  });

  const [imageSrc, setImageSrc] = useState<string>('');
  const [file, setFile] = useState<any>();

  const {
    data: settings,
    isPending: isSettingsPending,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ['company_settings'],
    queryFn: async () => {
      const response = await GetData(`we/settings`, token);
      return response;
    },
  });

  useEffect(() => {
    const fn = async () => {
      if (data) {
        setCompanyInfo({
          name: data?.name,
          legal_name: data?.legal_name,
          kind: data?.kind,
          status: data?.status,
          business_id_no: data?.business_id_no,
          vat_number: data?.vat_number,
          time_zone: data?.time_zone,
          email: data?.email,
          phone: data?.phone,
          website: data?.website,
          customer_facing_address: data?.customer_facing_address,
          legal_address: data?.legal_address,
          logo: data?.logo?.original,
        });
        setImageSrc(data.logo?.original);
        setCompanyAddress(
          data?.company_addresses || {
            address: '',
            city: '',
            state: '',
            country: '',
            zip_code: '',
          }
        );
      }
      if (!isSettingsPending) {
        setCompanySettings({
          preffered_first_financial_month: settings?.preffered_first_financial_month,
          preffered_first_tax_month: settings?.preffered_first_tax_month,
          accounting_method: settings?.accounting_method,
          preffered_tax: settings?.preffered_tax,
          tax_form: settings?.tax_form,
          is_chart_of_account: settings?.is_chart_of_account,
          is_track_classes: settings?.is_track_classes,
          is_track_location: settings?.is_track_location,
          prefill_forms: settings?.prefill_forms,
          auto_invoice_unbilled_activity: settings?.auto_invoice_unbilled_activity,
          auto_apply_bill_payments: settings?.auto_apply_bill_payments,
          is_organized_job_related_activity: settings?.is_organized_job_related_activity,
          home_currency: settings?.home_currency,
          multi_currency: settings?.multi_currency,
          is_warn_duplicate_cheque_number: settings?.is_warn_duplicate_cheque_number,
          is_warn_duplicate_bill_number: settings?.is_warn_duplicate_bill_number,
          is_warn_duplicate_journal_number: settings?.is_warn_duplicate_journal_number,
          sing_me_out: settings?.sing_me_out,
          tax_id: settings?.tax_id,
          preffered_first_day: settings?.preffered_first_day,
          is_service_field: settings?.is_service_field,
          is_allow_time_to_billable: settings?.is_allow_time_to_billable,
        });
      }
    };
    fn();
  }, [data, settings, isSettingsPending, editSection]);

  /* Escape closes whichever section is open (edits revert — see effect above). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditSection(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleEditClick = (section: string) => {
    setEditSection(section === editSection ? null : section);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setCompanyInfo((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFile(files[0]);
    }
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setImageSrc(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelLogo = () => {
    setFile('');
    setImageSrc(data?.logo?.original || '');
    setEditSection(null);
  };

  const { mutate: Upload_, isPending: isUploading } = useMutation({
    mutationKey: ['update_company_logo'],
    mutationFn: async (data: any) => PatchMultipart(`we`, data, token),
    onSuccess: (res) => {
      toast.success('Company info updated.');
      setFile('');
      setEditSection(null);
      refetch();
    },
    onError: (res) => {
      toast.error('Something went wrong');
    },
  });

  const { mutate: UpdateSettings, isPending: isUpdating } = useMutation({
    mutationKey: ['update_company_settings'],
    mutationFn: async (data: any) => Patch(`we/settings`, data, token),
    onSuccess: (res) => {
      toast.success('Company info updated.');
      setEditSection(null);
      refetchSettings();
    },
    onError: (res) => {
      toast.error('Something went wrong.');
    },
  });

  const handleSave = () => {
    const data = new FormData();
    data.append('company_addresses', JSON.stringify(companyAddress));
    if (file) {
      if (file.size > 1025 * 10724) {
        return toast.warning("Image size can't be larger than 1 MB");
      }
      data.append('logo', file);
    }
    (Object.keys(companyInfo) as (keyof typeof companyInfo)[]).forEach((key) => {
      if (key !== 'logo') {
        data.append(key, companyInfo[key] as string);
      }
    });
    Upload_(data);
  };

  /* ── Derived display values ─────────────────────────────────────────── */

  const industryTitle = useMemo(
    () => industries.find((i) => i?.value === companyInfo.kind)?.title || '',
    [companyInfo.kind]
  );

  const heroLocation = useMemo(() => {
    const parts = [companyAddress?.city, companyAddress?.state].filter(Boolean);
    return parts.join(', ') || companyAddress?.country || '';
  }, [companyAddress]);

  const statusLabel = companyInfo.status
    ? companyInfo.status.charAt(0).toUpperCase() + companyInfo.status.slice(1).toLowerCase()
    : 'Active';
  const statusTone: VioletTone =
    !companyInfo.status || companyInfo.status === 'ACTIVE'
      ? 'success'
      : companyInfo.status === 'DRAFT'
        ? 'warn'
        : 'neutral';

  /* Profile completeness — every field this screen can fill in. */
  const { pct, hint } = useMemo(() => {
    const entries: [string, unknown][] = [
      ['name', companyInfo.name],
      ['industry', companyInfo.kind],
      ['email', companyInfo.email],
      ['phone number', companyInfo.phone],
      ['website', companyInfo.website],
      ['time zone', companyInfo.time_zone],
      ['legal name', companyInfo.legal_name],
      ['business ID', companyInfo.business_id_no],
      ['VAT number', companyInfo.vat_number],
      ['legal address', companyInfo.legal_address],
      ['customer-facing address', companyInfo.customer_facing_address],
      ['street address', companyAddress?.address],
      ['city', companyAddress?.city],
      ['state', companyAddress?.state],
      ['country', companyAddress?.country],
      ['ZIP code', companyAddress?.zip_code],
    ];
    const missing = entries.filter(([, v]) => !String(v ?? '').trim()).map(([label]) => label);
    const filled = entries.length - missing.length;
    return {
      pct: Math.round((filled / entries.length) * 100),
      hint: missing.length
        ? `Add your ${missing.slice(0, 2).join(' and ')}${missing.length > 2 ? ' to finish.' : '.'}`
        : 'Your company profile is complete.',
    };
  }, [companyInfo, companyAddress]);

  if (isPending || isSettingsPending) {
    return <MainLoader color="#9ca3af" className="h-[50vh]" />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Hero: logo, identity, completeness ─────────────────────────── */}
      <section className="relative animate-v-rise overflow-hidden rounded-v-card border border-v-border bg-[linear-gradient(120deg,#FFFFFF_0%,#F5F1FF_100%)] p-6 shadow-v-card">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#7C4DFF,#A78BFF_45%,#5B3BC4)]" />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-5">
          {/* Logo */}
          <div className="relative shrink-0">
            {imageSrc ? (
              <Image
                src={imageSrc}
                width={400}
                height={400}
                alt="Company logo"
                className="h-[92px] w-[92px] rounded-[20px] border border-v-border bg-white object-contain shadow-[0_10px_26px_-12px_rgba(22,23,42,0.4)]"
                priority
                {...(companyInfo.logo
                  ? { placeholder: 'blur' as const, blurDataURL: companyInfo.logo }
                  : {})}
              />
            ) : (
              <div className="flex h-[92px] w-[92px] items-center justify-center rounded-[20px] border border-dashed border-v-border bg-v-tint100 text-v-primary">
                <Building2 className="h-8 w-8" />
              </div>
            )}
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <label
              htmlFor="logo-upload"
              title="Upload a new logo"
              className="absolute -bottom-1.5 -right-1.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-v-border bg-white text-v-primary shadow-v-card transition-colors hover:bg-v-tint150"
            >
              <Upload className="h-4 w-4" />
            </label>
          </div>

          {/* Identity */}
          <div className="min-w-[220px] flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="m-0 text-[26px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
                {companyInfo.name || 'Your company'}
              </h2>
              <Chip tone={statusTone} dot>
                {statusLabel}
              </Chip>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[13px] text-v-ink500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-v-primary" />
                {heroLocation || <span className="text-v-ink400">Add location</span>}
              </span>
              <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-v-ink300" />
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 shrink-0 text-v-primary" />
                <span className="truncate">
                  {companyInfo.email || <span className="text-v-ink400">Add email</span>}
                </span>
              </span>
              {industryTitle && (
                <span className="rounded-full bg-v-wash2 px-2.5 py-1 text-[11.5px] font-semibold text-v-ink500">
                  {industryTitle}
                </span>
              )}
            </div>

            {file?.name && (
              <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                <span className="max-w-[220px] truncate text-[12px] font-semibold text-v-ink500">
                  {file.name}
                </span>
                <Actions onSave={handleSave} onCancel={cancelLogo} loading={isUploading} />
              </div>
            )}
          </div>

          {/* Completeness ring */}
          <div className="flex items-center gap-4 border-v-border pl-0 sm:border-l sm:pl-6">
            <div className="relative h-[72px] w-[72px] shrink-0">
              <svg width="72" height="72" viewBox="0 0 60 60" className="-rotate-90">
                <circle cx="30" cy="30" r="26" fill="none" stroke="#EDE9F9" strokeWidth="7" />
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="#7C4DFF"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={(RING_C * (1 - pct / 100)).toFixed(1)}
                  style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.22,1,0.36,1)' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[15px] font-extrabold tabular-nums text-v-ink900">
                {pct}%
              </div>
            </div>
            <div className="max-w-[190px]">
              <div className="text-[13px] font-bold text-v-ink900">Profile completeness</div>
              <div className="mt-1 text-[12px] leading-[1.45] text-v-ink500">{hint}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Company info ───────────────────────────────────────────────── */}
      <SettingsCard
        icon={<Building2 />}
        title="Company info"
        sub="Used across Balanzify and on everything you send."
        isEditing={editSection === 'companyInfo'}
        onEditClick={() => handleEditClick('companyInfo')}
        delay="0.06s"
      >
        {editSection === 'companyInfo' ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <VioletInput label="Name" name="name" value={companyInfo.name} onChange={handleChange} />
              <VioletSelect
                label="Industry"
                value={companyInfo.kind}
                onChange={(e) => setCompanyInfo({ ...companyInfo, kind: e.target.value })}
              >
                <option value="">Select an industry</option>
                {industries?.map((industry) => (
                  <option key={industry?.value} value={industry?.value}>
                    {industry?.title}
                  </option>
                ))}
              </VioletSelect>
              <VioletInput
                label="Email"
                name="email"
                type="email"
                value={companyInfo.email}
                onChange={handleChange}
              />
              <VioletInput label="Phone" name="phone" value={companyInfo.phone} onChange={handleChange} />
              <VioletInput
                label="Website"
                name="website"
                placeholder="https://"
                value={companyInfo.website}
                onChange={handleChange}
              />
              <div className="font-jakarta">
                <label className="mb-1.5 block text-xs font-semibold text-v-ink700">Time Zone</label>
                <TimezoneSelect
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      borderColor: '#D8D2EC',
                      borderRadius: '11px',
                      minHeight: '42px',
                      background: '#fff',
                      boxShadow: 'none',
                    }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  value={parseTz(companyInfo?.time_zone)}
                  onChange={(e) =>
                    setCompanyInfo({
                      ...companyInfo,
                      time_zone: JSON.stringify(e),
                    })
                  }
                />
              </div>
            </div>
            <Actions
              onSave={handleSave}
              onCancel={() => setEditSection(null)}
              loading={isUploading}
              align="end"
            />
          </>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FieldTile icon={<Building2 />} label="Name" value={companyInfo.name} placeholder="Add name" />
            <FieldTile
              icon={<Briefcase />}
              label="Industry"
              value={industryTitle}
              placeholder="Add industry"
            />
            <FieldTile
              icon={<Mail />}
              tone="warn"
              label="Email"
              value={companyInfo.email}
              placeholder="Add email"
              action={<CopyButton value={companyInfo.email} label="email" />}
            />
            <FieldTile
              icon={<Phone />}
              label="Phone"
              value={companyInfo.phone}
              placeholder="Add phone"
              mono
            />
            <FieldTile
              icon={<Globe />}
              label="Website"
              value={companyInfo.website}
              placeholder="Add website"
            />
            <FieldTile
              icon={<Clock />}
              label="Time Zone"
              value={tzLabel(companyInfo?.time_zone)}
              placeholder="Add time zone"
            />
          </div>
        )}
      </SettingsCard>

      {/* ── Legal info · Customer contact ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SettingsCard
          icon={<ShieldCheck />}
          tone="warn"
          title="Legal info"
          sub="For tax filings and compliance."
          isEditing={editSection === 'legal'}
          onEditClick={() => handleEditClick('legal')}
          delay="0.12s"
        >
          {editSection === 'legal' ? (
            <>
              <div className="flex flex-col gap-4">
                <VioletInput
                  label="Legal business name"
                  value={companyInfo.legal_name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, legal_name: e.target.value })}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <VioletInput
                    label="Business ID"
                    name="business_id"
                    value={companyInfo.business_id_no}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, business_id_no: e.target.value })}
                  />
                  <VioletInput
                    label="VAT Number"
                    name="vat_number"
                    value={companyInfo.vat_number}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, vat_number: e.target.value })}
                  />
                </div>
                <VioletTextarea
                  label="Legal address"
                  name="legal_address"
                  rows={2}
                  placeholder="Street, city, state, ZIP"
                  value={companyInfo.legal_address}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, legal_address: e.target.value })}
                />
              </div>
              <Actions
                onSave={handleSave}
                onCancel={() => setEditSection(null)}
                loading={isUploading}
                align="end"
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col gap-4">
              <StackRow
                label="Legal business name"
                value={companyInfo.legal_name}
                placeholder="Add legal name"
              />
              <StackRow
                label="Business ID"
                value={companyInfo.business_id_no}
                placeholder="Add business ID"
                mono
                action={<CopyButton value={companyInfo.business_id_no} label="business ID" />}
              />
              <StackRow
                label="VAT Number"
                value={companyInfo.vat_number}
                placeholder="Add VAT number"
                mono
              />
              <StackRow
                className="mt-auto"
                label="Legal address"
                value={companyInfo.legal_address}
                placeholder="Add legal address"
                preLine
              />
            </div>
          )}
        </SettingsCard>

        <SettingsCard
          icon={<User />}
          title="Customer contact"
          sub="How customers reach you."
          isEditing={editSection === 'contact'}
          onEditClick={() => handleEditClick('contact')}
          delay="0.18s"
        >
          {editSection === 'contact' ? (
            <>
              <VioletTextarea
                label="Customer facing address"
                name="customer_facing_address"
                rows={2}
                placeholder="Street, city, state, ZIP"
                value={companyInfo.customer_facing_address}
                onChange={(e) =>
                  setCompanyInfo({ ...companyInfo, customer_facing_address: e.target.value })
                }
              />
              <Actions
                onSave={handleSave}
                onCancel={() => setEditSection(null)}
                loading={isUploading}
                align="end"
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col gap-4">
              <StackRow
                label="Customer email"
                value={companyInfo.email}
                placeholder="Add email"
                action={<CopyButton value={companyInfo.email} label="email" />}
              />
              <StackRow
                label="Customer facing address"
                value={companyInfo.customer_facing_address}
                placeholder="Add customer facing address"
                preLine
              />
              <div className="mt-auto flex items-start gap-2.5 rounded-v-input bg-v-wash2 px-3.5 py-3 text-[12px] leading-[1.45] text-v-ink500">
                <InfoIcon className="mt-px h-3.5 w-3.5 shrink-0 text-v-warn-fg" />
                This shows on invoices and customer emails.
              </div>
            </div>
          )}
        </SettingsCard>
      </div>

      {/* ── Company address · Accounting ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SettingsCard
          icon={<MapPin />}
          title="Company address"
          sub="Where your business is registered."
          isEditing={editSection === 'companyAddress'}
          onEditClick={() => handleEditClick('companyAddress')}
          delay="0.24s"
        >
          {editSection === 'companyAddress' ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <VioletInput
                  wrapClassName="sm:col-span-2"
                  label="Address"
                  name="company_address"
                  value={companyAddress.address}
                  onChange={(e) => setCompanyAddress({ ...companyAddress, address: e.target.value })}
                />
                <VioletInput
                  label="City"
                  name="company_city"
                  value={companyAddress.city}
                  onChange={(e) => setCompanyAddress({ ...companyAddress, city: e.target.value })}
                />
                <VioletInput
                  label="State"
                  name="company_state"
                  value={companyAddress.state}
                  onChange={(e) => setCompanyAddress({ ...companyAddress, state: e.target.value })}
                />
                <VioletInput
                  label="Country"
                  name="company_country"
                  value={companyAddress.country}
                  onChange={(e) => setCompanyAddress({ ...companyAddress, country: e.target.value })}
                />
                <VioletInput
                  label="Zip Code"
                  name="company_zip"
                  value={companyAddress.zip_code}
                  onChange={(e) => setCompanyAddress({ ...companyAddress, zip_code: e.target.value })}
                />
              </div>
              <Actions
                onSave={handleSave}
                onCancel={() => setEditSection(null)}
                loading={isUploading}
                align="end"
              />
            </>
          ) : (
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <StackRow
                className="sm:col-span-2"
                label="Address"
                value={companyAddress.address}
                placeholder="Add address"
                preLine
              />
              <StackRow label="City" value={companyAddress.city} placeholder="Add city" />
              <StackRow label="State" value={companyAddress.state} placeholder="Add state" />
              <StackRow label="Country" value={companyAddress.country} placeholder="Add country" />
              <StackRow
                label="Zip Code"
                value={companyAddress.zip_code}
                placeholder="Add ZIP code"
                mono
              />
            </div>
          )}
        </SettingsCard>

        <div className="flex flex-col gap-5">
          <SettingsCard
            icon={<Scale />}
            title="Accounting method"
            sub="How income and expenses are recognised."
            isEditing={editSection === 'accountingMethod'}
            onEditClick={() => handleEditClick('accountingMethod')}
            delay="0.3s"
          >
            {editSection === 'accountingMethod' ? (
              <>
                <VioletSelect
                  label="Method"
                  value={companySettings.accounting_method}
                  onChange={(e) =>
                    setCompanySettings({ ...companySettings, accounting_method: e.target.value })
                  }
                >
                  <option value="ACCRUAL">Accrual</option>
                  <option value="CASH">Cash</option>
                </VioletSelect>
                <Actions
                  onSave={() =>
                    UpdateSettings({ accounting_method: companySettings?.accounting_method })
                  }
                  onCancel={() => setEditSection(null)}
                  loading={isUpdating}
                  align="end"
                />
              </>
            ) : (
              <FieldTile
                icon={<Scale />}
                label="Method"
                value={
                  companySettings.accounting_method
                    ? companySettings.accounting_method.charAt(0) +
                      companySettings.accounting_method.slice(1).toLowerCase()
                    : ''
                }
                placeholder="Add accounting method"
              />
            )}
          </SettingsCard>

          <SettingsCard
            icon={<Tags />}
            tone="warn"
            title="Categories"
            sub="Extra dimensions on every transaction."
            isEditing={editSection === 'categories'}
            onEditClick={() => handleEditClick('categories')}
            delay="0.36s"
          >
            {editSection === 'categories' ? (
              <>
                <div className="flex flex-col gap-3">
                  {[
                    { key: 'is_track_classes', label: 'Track Classes' },
                    { key: 'is_track_location', label: 'Track Locations' },
                  ].map((row) => (
                    <div
                      key={row.key}
                      className="flex items-center justify-between rounded-v-input border border-v-border bg-v-card-subtle px-3.5 py-2.5"
                    >
                      <span className="text-[13px] font-semibold text-v-ink900">{row.label}</span>
                      <Toggle
                        checked={!!companySettings[row.key]}
                        onChange={(next) =>
                          setCompanySettings({ ...companySettings, [row.key]: next })
                        }
                        aria-label={row.label}
                      />
                    </div>
                  ))}
                </div>
                <Actions
                  onSave={() =>
                    UpdateSettings({
                      is_track_location: companySettings?.is_track_location,
                      is_track_classes: companySettings?.is_track_classes,
                    })
                  }
                  onCancel={() => setEditSection(null)}
                  loading={isUpdating}
                  align="end"
                />
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <StatusTile label="Track Classes" on={!!companySettings.is_track_classes} />
                <StatusTile label="Track Locations" on={!!companySettings.is_track_location} />
              </div>
            )}
          </SettingsCard>
        </div>
      </div>
    </div>
  );
};

/* ── Presentational primitives ───────────────────────────────────────── */

/** `time_zone` is stored as a JSON string; never let a malformed value crash the page. */
const parseTz = (raw?: string): any => {
  if (!raw) return '';
  try {
    return JSON.parse(raw);
  } catch {
    return '';
  }
};

const tzLabel = (raw?: string): string => {
  const tz = parseTz(raw);
  return tz?.label || (typeof tz === 'string' ? tz : '') || '';
};

interface SettingsCardProps {
  icon: React.ReactNode;
  tone?: VioletTone;
  title: string;
  sub: string;
  isEditing: boolean;
  onEditClick: () => void;
  /** Stagger the rise-in animation. */
  delay?: string;
  className?: string;
  children: React.ReactNode;
}

const SettingsCard = ({
  icon,
  tone = 'violet',
  title,
  sub,
  isEditing,
  onEditClick,
  delay,
  className,
  children,
}: SettingsCardProps) => (
  <section
    className={cn(
      'flex animate-v-rise flex-col rounded-v-card bg-white shadow-v-card',
      className
    )}
    style={delay ? { animationDelay: delay } : undefined}
  >
    <div className="flex items-center gap-3 border-b border-v-border/70 px-5 py-4">
      <IconChip tone={tone} size="lg">
        {icon}
      </IconChip>
      <div className="min-w-0 flex-1">
        <h2 className="m-0 text-[15px] font-bold tracking-[-0.01em] text-v-ink900">{title}</h2>
        <p className="mt-0.5 text-[12px] text-v-ink400">{sub}</p>
      </div>
      {!isEditing && (
        <VioletButton
          variant="outline"
          size="sm"
          onClick={onEditClick}
          leftIcon={<Pencil className="h-3.5 w-3.5" />}
        >
          Edit
        </VioletButton>
      )}
    </div>
    <div className="flex flex-1 flex-col p-5">{children}</div>
  </section>
);

const Actions = ({
  onSave,
  onCancel,
  loading,
  align = 'start',
}: {
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
  align?: 'start' | 'end';
}) => (
  <div
    className={cn(
      'mt-5 flex items-center gap-2.5',
      align === 'end' && 'justify-end',
      align === 'start' && 'mt-0'
    )}
  >
    <VioletButton variant="outline" size="sm" onClick={onCancel}>
      Cancel
    </VioletButton>
    <VioletButton variant="primary" size="sm" onClick={onSave} disabled={loading}>
      {loading ? 'Saving…' : 'Save'}
    </VioletButton>
  </div>
);

interface FieldTileProps {
  icon: React.ReactNode;
  tone?: VioletTone;
  label: string;
  value?: string;
  placeholder: string;
  mono?: boolean;
  action?: React.ReactNode;
  className?: string;
}

/** Bordered tile: icon chip + uppercase label + value. */
const FieldTile = ({
  icon,
  tone = 'violet',
  label,
  value,
  placeholder,
  mono,
  action,
  className,
}: FieldTileProps) => {
  const filled = !!String(value ?? '').trim();
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-v-tile border border-v-border bg-v-card-subtle px-4 py-3.5',
        className
      )}
    >
      <IconChip tone={tone} size="lg">
        {icon}
      </IconChip>
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-v-ink400">
          {label}
        </div>
        <div
          title={filled ? value : undefined}
          className={cn(
            'mt-0.5 truncate text-[13.5px] font-semibold',
            mono && 'tabular-nums',
            filled ? 'text-v-ink900' : 'text-v-ink400'
          )}
        >
          {filled ? value : placeholder}
        </div>
      </div>
      {action}
    </div>
  );
};

interface StackRowProps {
  label: string;
  value?: string;
  placeholder: string;
  mono?: boolean;
  /** Preserve newlines (multi-line addresses). */
  preLine?: boolean;
  action?: React.ReactNode;
  className?: string;
}

/** Borderless label-over-value row used inside the paired cards. */
const StackRow = ({
  label,
  value,
  placeholder,
  mono,
  preLine,
  action,
  className,
}: StackRowProps) => {
  const filled = !!String(value ?? '').trim();
  return (
    <div className={cn('flex items-end justify-between gap-3', className)}>
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-v-ink400">
          {label}
        </div>
        <div
          className={cn(
            'mt-1 text-[13.5px] font-semibold',
            preLine ? 'whitespace-pre-line break-words leading-[1.55]' : 'truncate',
            mono && 'tabular-nums',
            filled ? 'text-v-ink900' : 'text-v-ink400'
          )}
        >
          {filled ? value : placeholder}
        </div>
      </div>
      {action}
    </div>
  );
};

/** On/off pill for the boolean settings. */
const StatusTile = ({ label, on }: { label: string; on: boolean }) => (
  <div className="flex items-center justify-between gap-3 rounded-v-tile border border-v-border bg-v-card-subtle px-4 py-3">
    <span className="text-[13px] font-semibold text-v-ink900">{label}</span>
    <Chip tone={on ? 'success' : 'neutral'} dot>
      {on ? 'On' : 'Off'}
    </Chip>
  </div>
);

const CopyButton = ({ value, label }: { value?: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!String(value ?? '').trim()) return null;

  const onCopy = () => {
    try {
      navigator.clipboard?.writeText(String(value));
    } catch {
      /* clipboard unavailable — nothing to recover from */
    }
    clearTimeout(timer.current);
    setCopied(true);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] transition-colors',
        copied ? 'text-v-success-fg' : 'text-v-ink400 hover:bg-v-wash2 hover:text-v-primary'
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
};

export default Page;
