'use client';

import { useState } from 'react';
import Table from '@/app/(admin)/_components/Table';
import { SBadge, Mono, SBtn, SField, SInput, SSelect } from '../_components/ui';
import type { STone } from '../_components/ui';
import { SFormModal } from '../_components/overlays';
import { useSa } from '../_components/SaProvider';
import { useFetch } from '@/app/helpers/hooks';
import {
  fetchAdminSubscriptionMetrics,
  postAdminSubscriptionMetric,
  patchAdminSubscriptionMetric,
  deleteAdminSubscriptionMetric,
} from '@/app/helpers/backend';

/* Enforcement mode code → badge tone */
const ENFORCEMENT_TONE: Record<string, STone> = {
  HARD_BLOCK: 'bad',
  SOFT_WARNING: 'info',
  AUTO_OVERAGE: 'warn',
  MANUAL_APPROVAL: 'brand',
  GRACE_OVERAGE: 'gold',
};

type EnforcementMode = { code: string; label: string; description: string };

const emptyForm = {
  title: '',
  code: '',
  unit_label: '',
  default_enforcement_mode: 'AUTO_OVERAGE',
  default_overage_unit_price: '',
  description: '',
};

export default function Page() {
  const { toast, confirm } = useSa();
  const { data, setQueryParams, isPending, refetch } = useFetch(
    ['admin-metrics'],
    fetchAdminSubscriptionMetrics,
  );

  const metrics: any[] = data?.results ?? data?.metrics ?? [];
  const enforcementModes: EnforcementMode[] = data?.enforcement_modes ?? [];

  const [open, setOpen] = useState(false);
  const [editUid, setEditUid] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const modeLabel = (code: string) =>
    enforcementModes.find(m => m.code === code)?.label ?? code;

  const Columns = [
    { text: 'Metric', dataField: 'title' },
    { text: 'Code', dataField: 'code', formatter: (v: any) => <Mono>{v}</Mono> },
    { text: 'Unit', dataField: 'unit_label' },
    {
      text: 'Enforcement',
      dataField: 'default_enforcement_mode',
      formatter: (v: any) => <SBadge tone={ENFORCEMENT_TONE[v] ?? 'mute'}>{modeLabel(v)}</SBadge>,
    },
    {
      text: 'Overage Rate',
      dataField: 'default_overage_unit_price',
      formatter: (v: any, row: any) => {
        const p = Number(v ?? 0);
        return <Mono>{p ? `$${p.toFixed(2)} / ${row?.unit_label || 'unit'}` : '—'}</Mono>;
      },
    },
    {
      text: 'Status',
      dataField: 'is_active',
      formatter: (v: any) => <SBadge tone={v ? 'good' : 'mute'}>{v ? 'Active' : 'Inactive'}</SBadge>,
    },
  ];

  const openCreate = () => {
    setEditUid(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (row: any) => {
    setEditUid(row.uid);
    setForm({
      title: row.title ?? '',
      code: row.code ?? '',
      unit_label: row.unit_label ?? '',
      default_enforcement_mode: row.default_enforcement_mode ?? 'AUTO_OVERAGE',
      default_overage_unit_price: String(row.default_overage_unit_price ?? ''),
      description: row.description ?? '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.code.trim()) {
      toast('Missing fields', 'Metric name and code are required.', 'bad');
      return;
    }
    const payload = {
      title: form.title.trim(),
      code: form.code.trim().toUpperCase().replace(/\s+/g, '_'),
      unit_label: form.unit_label.trim(),
      description: form.description.trim(),
      default_enforcement_mode: form.default_enforcement_mode,
      default_overage_unit_price: form.default_overage_unit_price || '0',
    };
    setSaving(true);
    try {
      if (editUid) {
        await patchAdminSubscriptionMetric(editUid, payload);
        toast('Metric updated', `${payload.title} saved.`, 'good');
      } else {
        await postAdminSubscriptionMetric(payload);
        toast('Metric created', `${payload.title} added to billable metrics.`, 'good');
      }
      setOpen(false);
      setForm(emptyForm);
      setEditUid(null);
      refetch();
    } catch (e: any) {
      toast('Save failed', e?.response?.data?.message || 'Could not save metric.', 'bad');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (row: any) => {
    confirm({
      title: 'Delete metric?',
      message: `${row.title} will be removed from billable metrics. This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        try {
          await deleteAdminSubscriptionMetric(row.uid);
          toast('Metric deleted', `${row.title} removed.`, 'good');
          refetch();
        } catch (e: any) {
          toast('Delete failed', e?.response?.data?.message || 'Could not delete metric.', 'bad');
        }
      },
    });
  };

  return (
    <div>
      <Table
        columns={Columns}
        data={{
          count: data?.count ?? metrics.length,
          next: data?.next ?? null,
          previous: data?.previous ?? null,
          results: metrics,
        }}
        setParams={setQueryParams}
        loading={isPending}
        title="Billable Metrics"
        isCheckbox={false}
        isSearch={false}
        isSettings={false}
        isPdfExcel={false}
        pagination={true}
        isScreen={false}
        onEdit={openEdit}
        onDelete={handleDelete}
      >
        <SBtn onClick={openCreate}>New Metric</SBtn>
      </Table>

      <div className="mt-6 px-1">
        <h2 className="mb-4 text-[15px] font-bold text-[#0B1020]">Enforcement Models</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enforcementModes.map(model => (
            <div
              key={model.code}
              className="rounded-2xl border border-[#E7E8F2] bg-white p-4 shadow-[0_1px_3px_rgba(16,22,46,.05)]"
            >
              <div className="mb-2">
                <SBadge tone={ENFORCEMENT_TONE[model.code] ?? 'mute'}>{model.label}</SBadge>
              </div>
              <p className="text-[13px] leading-relaxed text-[#5B6478]">{model.description}</p>
            </div>
          ))}
        </div>
      </div>

      <SFormModal
        open={open}
        onClose={() => setOpen(false)}
        title={editUid ? 'Edit Metric' : 'New Metric'}
        subtitle="Define a billable usage metric"
        width={560}
        footer={
          <div className="flex justify-end gap-2">
            <SBtn variant="ghost" onClick={() => setOpen(false)}>Cancel</SBtn>
            <SBtn onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving…' : editUid ? 'Save Changes' : 'Create Metric'}
            </SBtn>
          </div>
        }
      >
        <div className="space-y-4">
          <SField label="Metric name">
            <SInput value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Active Employees" />
          </SField>
          <SField label="Code">
            <SInput value={form.code} onChange={v => setForm(f => ({ ...f, code: v }))} placeholder="EMPLOYEE" mono />
          </SField>
          <SField label="Unit label">
            <SInput value={form.unit_label} onChange={v => setForm(f => ({ ...f, unit_label: v }))} placeholder="employee" />
          </SField>
          <SField label="Enforcement model">
            <SSelect
              value={form.default_enforcement_mode}
              onChange={v => setForm(f => ({ ...f, default_enforcement_mode: v }))}
              options={enforcementModes.map(m => ({ value: m.code, label: m.label }))}
            />
          </SField>
          <SField label="Overage unit price">
            <SInput value={form.default_overage_unit_price} onChange={v => setForm(f => ({ ...f, default_overage_unit_price: v }))} placeholder="6.000" mono />
          </SField>
          <SField label="Description">
            <SInput value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} placeholder="Optional" />
          </SField>
        </div>
      </SFormModal>
    </div>
  );
}
