'use client';

import { useMemo, useState } from 'react';
import Table from '@/app/(admin)/_components/Table';
import {
  SBadge,
  Mono,
  SBtn,
  SField,
  SInput,
  SSelect,
  STextarea,
  SCheckbox,
  type STone,
} from '../_components/ui';
import { SFormModal } from '../_components/overlays';
import { useSa } from '../_components/SaProvider';
import { useFetch } from '@/app/helpers/hooks';
import {
  fetchAdminSubscriptionAddons,
  postAdminSubscriptionAddon,
  patchAdminSubscriptionAddon,
  deleteAdminSubscriptionAddon,
  fetchSubscriptions,
} from '@/app/helpers/backend';


const PRICING_OPTIONS = [
  { value: 'RECURRING', label: 'Recurring' },
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'USAGE_BASED', label: 'Usage-based' },
];

const FREQUENCY_OPTIONS = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half-yearly' },
  { value: 'YEARLY', label: 'Yearly' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DISABLED', label: 'Disabled' },
];

const METRIC_OPTIONS = [
  { value: '', label: 'No metric' },
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'USER', label: 'User' },
  { value: 'BRANCH', label: 'Branch' },
  { value: 'STORAGE', label: 'Storage' },
  { value: 'PAYROLL_RUN', label: 'Payroll run' },
  { value: 'AI_CREDIT', label: 'AI credit' },
];

const labelFromOptions = (options: { value: string; label: string }[], value?: string) =>
  options.find(o => o.value === value)?.label ?? value ?? '—';


const fmtPrice = (v: any, currency = 'USD') => {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  return Number.isFinite(n)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
    : String(v);
};

/** linked_plans is `{ count, applies_to_all, plans: [{uid,title,slug}] }` */
const linkedPlans = (r: any): string => {
  const lp = r?.linked_plans;
  if (!lp || typeof lp !== 'object') return '—';
  if (lp.applies_to_all) return 'All plans';
  const names = Array.isArray(lp.plans)
    ? lp.plans.map((p: any) => p?.title || p?.slug).filter(Boolean)
    : [];
  if (names.length === 0) return `${lp.count ?? 0} plans`;
  return names.length <= 2 ? names.join(', ') : `${lp.count ?? names.length} plans`;
};

const statusTone = (status?: string): STone => {
  const key = (status ?? '').toUpperCase();
  if (key === 'ACTIVE') return 'good';
  if (key === 'DISABLED') return 'bad';
  return 'mute';
};

const prettyStatus = (status?: string) => {
  if (!status) return '—';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

interface AddonFormState {
  code: string;
  title: string;
  description: string;
  pricing_model: string;
  price: string;
  billing_frequency: string;
  currency: string;
  status: string;
  metric_code: string;
  unit_label: string;
  stripe_price_id: string;
  plan_uids: string[];
}

const emptyForm = (): AddonFormState => ({
  code: '',
  title: '',
  description: '',
  pricing_model: 'RECURRING',
  price: '',
  billing_frequency: 'MONTHLY',
  currency: 'USD',
  status: 'DRAFT',
  metric_code: '',
  unit_label: '',
  stripe_price_id: '',
  plan_uids: [],
});

export default function Page() {
  const { toast, confirm } = useSa();
  const { data, setQueryParams, isPending, refetch } = useFetch(
    ['admin-addons'],
    fetchAdminSubscriptionAddons,
  );
  const { data: plansData } = useFetch(['subscriptionData'], fetchSubscriptions);

  const addons: any[] = useMemo(
    () => (Array.isArray(data) ? data : (data?.results ?? data?.addons ?? [])),
    [data],
  );

  const plans = useMemo(() => {
    const list = plansData?.results ?? plansData?.data ?? (Array.isArray(plansData) ? plansData : []);
    return Array.isArray(list) ? list : [];
  }, [plansData]);

  const [open, setOpen] = useState(false);
  const [editUid, setEditUid] = useState<string | null>(null);
  const [form, setForm] = useState<AddonFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const isRecurring = form.pricing_model === 'RECURRING';

  const Columns = [
    { text: 'Add-on', dataField: 'title', formatter: (v: any, r: any) => v || r?.code || '—' },
    { text: 'Code', dataField: 'code', formatter: (v: any) => <Mono>{v || '—'}</Mono> },
    {
      text: 'Pricing Model',
      dataField: 'pricing_model',
      formatter: (v: any) => labelFromOptions(PRICING_OPTIONS, v),
    },
    {
      text: 'Price',
      dataField: 'price',
      formatter: (v: any, r: any) => <Mono>{fmtPrice(v, r?.currency)}</Mono>,
    },
    // {
    //   text: 'Frequency',
    //   dataField: 'billing_frequency',
    //   formatter: (v: any) => (v ? labelFromOptions(FREQUENCY_OPTIONS, v) : '—'),
    // },
    // {
    //   text: 'Metric',
    //   dataField: 'metric_code',
    //   formatter: (v: any, r: any) =>
    //     v ? `${labelFromOptions(METRIC_OPTIONS, v)}${r?.unit_label ? ` (${r.unit_label})` : ''}` : '—',
    // },
    { text: 'Linked Plans', dataField: 'linked_plans', formatter: (_: any, r: any) => linkedPlans(r) },
    {
      text: 'Status',
      dataField: 'status',
      formatter: (v: any) => <SBadge tone={statusTone(v)}>{prettyStatus(v)}</SBadge>,
    },
  ];

  const togglePlanUid = (uid: string) => {
    setForm(f => ({
      ...f,
      plan_uids: f.plan_uids.includes(uid)
        ? f.plan_uids.filter(id => id !== uid)
        : [...f.plan_uids, uid],
    }));
  };

  const openCreate = () => {
    setEditUid(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (row: any) => {
    setEditUid(row.uid);
    setForm({
      code: row.code ?? '',
      title: row.title ?? '',
      description: row.description ?? '',
      pricing_model: (row.pricing_model ?? 'RECURRING').toUpperCase(),
      price: row.price != null ? String(row.price) : '',
      billing_frequency: row.billing_frequency ?? 'MONTHLY',
      currency: row.currency ?? 'USD',
      status: (row.status ?? 'DRAFT').toUpperCase(),
      metric_code: row.metric_code ?? '',
      unit_label: row.unit_label ?? '',
      stripe_price_id: row.stripe_price_id ?? '',
      plan_uids: Array.isArray(row?.linked_plans?.plans)
        ? row.linked_plans.plans.map((p: any) => p.uid).filter(Boolean)
        : [],
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) {
      toast('Missing fields', 'Add-on code is required.', 'bad');
      return;
    }
    if (isRecurring && !form.billing_frequency) {
      toast('Missing fields', 'Billing frequency is required for recurring add-ons.', 'bad');
      return;
    }

    const payload: Record<string, unknown> = {
      code: form.code.trim().toUpperCase().replace(/\s+/g, '_'),
      title: form.title.trim() || undefined,
      description: form.description.trim(),
      pricing_model: form.pricing_model,
      price: form.price.toString().trim() || '0',
      currency: form.currency.trim() || 'USD',
      status: form.status,
      billing_frequency: isRecurring ? form.billing_frequency : null,
      metric_code: form.metric_code || null,
      unit_label: form.unit_label.trim(),
      applies_to_subscription_uids: form.plan_uids,
    };
    if (form.stripe_price_id.trim()) payload.stripe_price_id = form.stripe_price_id.trim();

    setSaving(true);
    try {
      const displayName = payload.title || payload.code;
      if (editUid) {
        await patchAdminSubscriptionAddon(editUid, payload);
        toast('Add-on updated', `${displayName} saved.`, 'good');
      } else {
        await postAdminSubscriptionAddon(payload);
        toast('Add-on created', `${displayName} added to catalog.`, 'good');
      }
      setOpen(false);
      setForm(emptyForm());
      setEditUid(null);
      refetch();
    } catch (e: any) {
      toast(
        'Save failed',
        e?.response?.data?.error || e?.response?.data?.message || 'Could not save add-on.',
        'bad',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (row: any) => {
    const displayName = row?.title || row?.code || 'this add-on';
    confirm({
      title: 'Disable add-on?',
      message: `${displayName} will be retired from the catalog (soft delete).`,
      confirmLabel: 'Disable',
      danger: true,
      onConfirm: async () => {
        try {
          await deleteAdminSubscriptionAddon(row.uid);
          toast('Add-on disabled', `${displayName} removed from catalog.`, 'good');
          refetch();
        } catch (e: any) {
          toast(
            'Delete failed',
            e?.response?.data?.error || e?.response?.data?.message || 'Could not delete add-on.',
            'bad',
          );
        }
      },
    });
  };

  return (
    <div className="space-y-5">
      <Table
        columns={Columns}
        data={{
          count: data?.count ?? addons.length,
          next: data?.next ?? null,
          previous: data?.previous ?? null,
          results: addons,
        }}
        setParams={setQueryParams}
        loading={isPending}
        title="Add-on Catalog"
        isCheckbox={true}
        isSearch={true}
        isSettings={false}
        isPdfExcel={false}
        pagination={true}
        isScreen={false}
        isView={false}
        onEdit={openEdit}
        onDelete={handleDelete}
      >
        <SBtn onClick={openCreate}>New Add-on</SBtn>
      </Table>

      <SFormModal
        open={open}
        onClose={() => setOpen(false)}
        title={editUid ? 'Edit Add-on' : 'New Add-on'}
        subtitle="Catalog add-on for the subscription engine"
        width={620}
        footer={
          <div className="flex justify-end gap-2">
            <SBtn variant="ghost" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </SBtn>
            <SBtn onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : editUid ? 'Save Changes' : 'Create Add-on'}
            </SBtn>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SField label="Code" hint="Unique, stored uppercase">
              <SInput
                value={form.code}
                onChange={v => setForm(f => ({ ...f, code: v }))}
                placeholder="ADDON_EMP"
                mono
              />
            </SField>
            <SField label="Title" hint="Defaults to code if empty">
              <SInput
                value={form.title}
                onChange={v => setForm(f => ({ ...f, title: v }))}
                placeholder="Extra Employee Capacity"
              />
            </SField>
          </div>

          <SField label="Description">
            <STextarea
              value={form.description}
              onChange={v => setForm(f => ({ ...f, description: v }))}
              placeholder="Additional billable employees beyond plan included quantity"
            />
          </SField>

          <div className="grid gap-4 sm:grid-cols-2">
            <SField label="Pricing model">
              <SSelect
                value={form.pricing_model}
                onChange={v => setForm(f => ({ ...f, pricing_model: v }))}
                options={PRICING_OPTIONS}
              />
            </SField>
            <SField label="Status">
              <SSelect
                value={form.status}
                onChange={v => setForm(f => ({ ...f, status: v }))}
                options={STATUS_OPTIONS}
              />
            </SField>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <SField label="Price">
              <SInput
                value={form.price}
                onChange={v => setForm(f => ({ ...f, price: v }))}
                placeholder="6.000"
                mono
              />
            </SField>
            <SField label="Currency">
              <SInput
                value={form.currency}
                onChange={v => setForm(f => ({ ...f, currency: v }))}
                placeholder="USD"
                mono
              />
            </SField>
            <SField label="Billing frequency" hint={isRecurring ? 'Required' : 'Recurring only'}>
              <SSelect
                value={form.billing_frequency}
                onChange={v => setForm(f => ({ ...f, billing_frequency: v }))}
                options={FREQUENCY_OPTIONS}
              />
            </SField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SField label="Metric code">
              <SSelect
                value={form.metric_code}
                onChange={v => setForm(f => ({ ...f, metric_code: v }))}
                options={METRIC_OPTIONS}
              />
            </SField>
            <SField label="Unit label">
              <SInput
                value={form.unit_label}
                onChange={v => setForm(f => ({ ...f, unit_label: v }))}
                placeholder="per employee"
              />
            </SField>
          </div>

          <SField label="Stripe price ID" hint="Optional — Stripe Price ID for WE checkout">
            <SInput
              value={form.stripe_price_id}
              onChange={v => setForm(f => ({ ...f, stripe_price_id: v }))}
              placeholder="price_1Example"
              mono
            />
          </SField>

          <SField label="Applies to subscription plans" hint="Leave empty to apply to all plans">
            <div className="max-h-40 space-y-2 overflow-y-auto rounded-[11px] border border-[#E7E8F2] bg-white p-3">
              {plans.length === 0 ? (
                <p className="text-[12px] text-[#9AA0BF]">No plans loaded</p>
              ) : (
                plans.map((plan: { uid: string; title: string }) => (
                  <SCheckbox
                    key={plan.uid}
                    checked={form.plan_uids.includes(plan.uid)}
                    onChange={() => togglePlanUid(plan.uid)}
                    label={plan.title}
                  />
                ))
              )}
            </div>
          </SField>
        </div>
      </SFormModal>
    </div>
  );
}
