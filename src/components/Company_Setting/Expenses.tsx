'use client';
import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { GetData, PatchMultipart } from '@/services/FetchMethods';
import GetToken from '@/hooks/getToken';
import { toast } from 'react-toastify';
import MainLoader from '../MainLoader/MainLoader';
import { cn } from '@/lib/utils';
import { Toggle, VioletButton } from '@/components/violet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ExpensesInfo {
  is_purchase_item: boolean;
  is_tag: boolean;
  is_track_expense_and_items_by_customer: boolean;
  is_expense_and_item_billable: boolean;
  is_purchase_order: boolean;
}

type SectionId = 'bills' | 'purchases';

interface FieldDef {
  key: keyof ExpensesInfo;
  label: string;
  hint: string;
}

const BILL_FIELDS: FieldDef[] = [
  {
    key: 'is_purchase_item',
    label: 'Show Items table on expense and purchase forms',
    hint: 'Adds an itemised products and services table to bills, expenses and purchase orders.',
  },
  {
    key: 'is_tag',
    label: 'Show Tags field on expense and purchase forms',
    hint: 'Lets you tag purchases so you can group and report on them later.',
  },
  {
    key: 'is_track_expense_and_items_by_customer',
    label: 'Track expenses and items by customer',
    hint: 'Adds a customer column to purchases so you can see what each customer costs you.',
  },
  {
    key: 'is_expense_and_item_billable',
    label: 'Make expenses and items billable',
    hint: 'Lets you mark a purchase as billable and pass it through to a customer invoice.',
  },
];

const PO_FIELDS: FieldDef[] = [
  {
    key: 'is_purchase_order',
    label: 'Use purchase orders',
    hint: 'Turns on purchase orders so you can send orders to suppliers before they bill you.',
  },
];

const EMPTY: ExpensesInfo = {
  is_purchase_item: false,
  is_tag: false,
  is_track_expense_and_items_by_customer: false,
  is_expense_and_item_billable: false,
  is_purchase_order: false,
};

const Expenses = () => {
  const [editSection, setEditSection] = useState<SectionId | null>(null);
  const token = GetToken();
  const { data, isPending, refetch } = useQuery({
    queryKey: ['expenses_settings'],
    queryFn: async () => {
      const response = await GetData(`we/purchases/settings`, token);
      return response;
    },
  });

  const [expensesInfo, setExpensesInfo] = useState<ExpensesInfo>(EMPTY);
  /** Edits live here until Save, so Cancel discards them. */
  const [draft, setDraft] = useState<ExpensesInfo>(EMPTY);

  useEffect(() => {
    if (data) {
      const next: ExpensesInfo = {
        is_purchase_item: !!data.is_purchase_item,
        is_tag: !!data.is_tag,
        is_track_expense_and_items_by_customer: !!data.is_track_expense_and_items_by_customer,
        is_expense_and_item_billable: !!data.is_expense_and_item_billable,
        is_purchase_order: !!data.is_purchase_order,
      };
      setExpensesInfo(next);
      setDraft(next);
    }
  }, [data]);

  /* Escape closes the open section. Edits are dropped either way — opening a
     section always re-seeds the draft from the committed values. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEditSection(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const closeSection = () => {
    setDraft(expensesInfo);
    setEditSection(null);
  };

  const handleEditClick = (section: SectionId) => {
    if (section === editSection) return closeSection();
    setDraft(expensesInfo);
    setEditSection(section);
  };

  const handleToggle = (key: keyof ExpensesInfo, next: boolean) => {
    setDraft((prev) => ({ ...prev, [key]: next }));
  };

  const { mutate: updateExpenses, isPending: isUpdating } = useMutation({
    mutationKey: ['update_expenses_settings'],
    mutationFn: async (data: any) => PatchMultipart(`we/purchases/settings`, data, token),
    onSuccess: () => {
      toast.success('Expenses settings updated!');
      setExpensesInfo(draft);
      refetch();
      setEditSection(null);
    },
    onError: () => {
      toast.error('An error occurred while updating expenses settings.');
    },
  });

  const handleSave = () => {
    const payload = new FormData();
    (Object.keys(draft) as (keyof ExpensesInfo)[]).forEach((key) => {
      payload.append(key, draft[key].toString());
    });
    updateExpenses(payload);
  };

  if (isPending) {
    return <MainLoader color="#9ca3af" className="h-[50vh]" />;
  }

  return (
    <div className="animate-v-rise rounded-v-card bg-white font-jakarta shadow-v-card">
      <SettingsRow
        first
        title="Bills and expenses"
        isEditing={editSection === 'bills'}
        onEditClick={() => handleEditClick('bills')}
      >
        {editSection === 'bills' ? (
          <>
            <ToggleList fields={BILL_FIELDS} draft={draft} onToggle={handleToggle} />
            <Actions onSave={handleSave} onCancel={closeSection} loading={isUpdating} />
          </>
        ) : (
          <StateList fields={BILL_FIELDS} values={expensesInfo} />
        )}
      </SettingsRow>

      <SettingsRow
        title="Purchase orders"
        isEditing={editSection === 'purchases'}
        onEditClick={() => handleEditClick('purchases')}
      >
        {editSection === 'purchases' ? (
          <>
            <ToggleList fields={PO_FIELDS} draft={draft} onToggle={handleToggle} />
            <Actions onSave={handleSave} onCancel={closeSection} loading={isUpdating} />
          </>
        ) : (
          <StateList fields={PO_FIELDS} values={expensesInfo} />
        )}
      </SettingsRow>
    </div>
  );
};

/* ── Presentational primitives ───────────────────────────────────────── */

interface SettingsRowProps {
  title: string;
  isEditing: boolean;
  onEditClick: () => void;
  /** Skips the top divider on the first row of the card. */
  first?: boolean;
  children: React.ReactNode;
}

/** One settings band: fixed label column · content · Edit. */
const SettingsRow = ({ title, isEditing, onEditClick, first, children }: SettingsRowProps) => (
  <div
    className={cn(
      'relative px-6 py-5 transition-colors first:rounded-t-v-card last:rounded-b-v-card',
      !first && 'border-t border-v-border',
      isEditing && 'bg-v-tint50'
    )}
  >
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
      <div className="shrink-0 text-[14px] font-bold text-v-ink900 sm:w-[170px]">{title}</div>
      <div className="min-w-0 flex-1">{children}</div>
      {!isEditing && (
        <VioletButton variant="soft" size="sm" onClick={onEditClick} className="shrink-0">
          Edit
        </VioletButton>
      )}
    </div>
  </div>
);

/** Read-only list: label · On/Off. */
const StateList = ({ fields, values }: { fields: FieldDef[]; values: ExpensesInfo }) => (
  <div>
    {fields.map((f, i) => (
      <div
        key={f.key}
        className={cn(
          'grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] items-center gap-4 py-2.5',
          i > 0 && 'border-t border-v-border/60'
        )}
      >
        <span className="text-[13.5px] text-v-ink500">{f.label}</span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-[13.5px] font-bold',
            values[f.key] ? 'text-v-success-fg' : 'text-v-ink400'
          )}
        >
          <span
            className={cn(
              'h-[5px] w-[5px] shrink-0 rounded-full',
              values[f.key] ? 'bg-v-success-solid' : 'bg-v-ink300'
            )}
          />
          {values[f.key] ? 'On' : 'Off'}
        </span>
      </div>
    ))}
  </div>
);

/** Edit list: label + hint · switch. */
const ToggleList = ({
  fields,
  draft,
  onToggle,
}: {
  fields: FieldDef[];
  draft: ExpensesInfo;
  onToggle: (key: keyof ExpensesInfo, next: boolean) => void;
}) => (
  <div className="animate-v-rise">
    {fields.map((f, i) => (
      <div
        key={f.key}
        className={cn(
          'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3',
          i > 0 && 'border-t border-v-border/60'
        )}
      >
        <span className="flex items-center gap-1.5 text-[13.5px] font-medium text-v-ink900">
          {f.label}
          <HintIcon hint={f.hint} />
        </span>
        <Toggle
          checked={draft[f.key]}
          onChange={(next) => onToggle(f.key, next)}
          aria-label={f.label}
        />
      </div>
    ))}
  </div>
);

const HintIcon = ({ hint }: { hint: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        aria-label={hint}
        className="shrink-0 text-v-ink300 transition-colors hover:text-v-primary"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-[260px] font-jakarta text-[11.5px] leading-snug">
      {hint}
    </TooltipContent>
  </Tooltip>
);

const Actions = ({
  onSave,
  onCancel,
  loading,
}: {
  onSave: () => void;
  onCancel: () => void;
  loading?: boolean;
}) => (
  <div className="mt-4 flex items-center gap-3">
    <VioletButton variant="outline" size="sm" onClick={onCancel}>
      Cancel
    </VioletButton>
    <VioletButton variant="primary" size="sm" onClick={onSave} disabled={loading}>
      {loading ? 'Saving…' : 'Save'}
    </VioletButton>
  </div>
);

export default Expenses;
