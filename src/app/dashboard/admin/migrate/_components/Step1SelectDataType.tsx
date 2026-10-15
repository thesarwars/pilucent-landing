'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Select Data Type
//
// On mount, asks the parent to load the data types catalog from
// GET /we/data-migrations/data-types. The page-level root state caches the
// list, so re-mounts during back-navigation are cheap.
//
// Each DATA_TYPE_ICON maps the backend `data_type` slug to a lucide icon for
// nicer rendering. We don't depend on icons being present — anything we
// don't recognise falls back to the generic FileText icon.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Users,
  Briefcase,
  UserCircle,
  MapPin,
  Package,
  FileText,
  Receipt,
  ShoppingBag,
  Banknote,
  ClipboardList,
  Wallet,
  ShoppingCart,
  CheckSquare,
  PenSquare,
  Landmark,
  Clock,
  Search,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { DataTypeOption, ImpactLevel } from './types';
import { toast } from '@/lib/ToastService';
import { useRouter } from 'next/navigation';

const DATA_TYPE_ICON: Record<string, React.ReactNode> = {
  chart_of_accounts: <BookOpen className="h-5 w-5 text-accent_soft_blue" />,
  customers: <Users className="h-5 w-5 text-accent_soft_blue" />,
  vendors: <Briefcase className="h-5 w-5 text-accent_soft_blue" />,
  employees: <UserCircle className="h-5 w-5 text-accent_soft_blue" />,
  locations: <MapPin className="h-5 w-5 text-accent_soft_blue" />,
  products: <Package className="h-5 w-5 text-accent_soft_blue" />,
  estimates: <FileText className="h-5 w-5 text-accent_soft_blue" />,
  invoices: <Receipt className="h-5 w-5 text-accent_soft_blue" />,
  sales_receipts: <ShoppingBag className="h-5 w-5 text-accent_soft_blue" />,
  deposits: <Banknote className="h-5 w-5 text-accent_soft_blue" />,
  bills: <ClipboardList className="h-5 w-5 text-accent_soft_blue" />,
  expenses: <Wallet className="h-5 w-5 text-accent_soft_blue" />,
  purchase_orders: <ShoppingCart className="h-5 w-5 text-accent_soft_blue" />,
  checks: <CheckSquare className="h-5 w-5 text-accent_soft_blue" />,
  journal_entries: <PenSquare className="h-5 w-5 text-accent_soft_blue" />,
  bank_data: <Landmark className="h-5 w-5 text-accent_soft_blue" />,
  time_activities: <Clock className="h-5 w-5 text-accent_soft_blue" />,
};

const BadgePill = ({ label }: { label: ImpactLevel }) => {
  const map: Record<ImpactLevel, string> = {
    'GL Impact': 'bg-table_success_light text-table_success',
    Posting: 'bg-table_error_light text-table_error',
    'Non-posting': 'bg-accent_bg_cornsilk text-accent_sunset_orange',
  };
  return (
    <span className={`rounded px-2 py-0.5 text-[11px] font-medium ${map[label]}`}>{label}</span>
  );
};

interface Step1Props {
  dataTypes: DataTypeOption[];
  selectedId: string | null;
  onLoad: () => void | Promise<void>;
  onSelect: (option: DataTypeOption) => void;
}

const CATEGORIES: DataTypeOption['category'][] = [
  'Sales',
  'Expenses',
  // 'Purchases',
  'Accounting',
  'Payroll',
  'Settings',
  'Inventory',
  'Contacts',
  'Banking',
];

const Step1SelectDataType: React.FC<Step1Props> = ({ dataTypes, selectedId, onLoad, onSelect }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [impactFilter, setImpactFilter] = useState<string>('All');
  const router = useRouter();
  const GetIfAnotherWay = (id: string) => {
    if (id === 'customers') {
      return '/dashboard/sales/customers/import_customer';
    } else if (id === 'vendors') {
      return '/dashboard/expenses/suppliers/bulk-import';
    } else if (id === 'products') {
      return '/dashboard/sales/product_services/bulk_import';
    } else {
      return '';
    }
  };
  // Trigger one-shot load via the parent's cached fetcher.
  useEffect(() => {
    onLoad();
  }, [onLoad]);

  const filtered = useMemo(() => {
    return dataTypes.filter((d) => {
      const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || d.category === categoryFilter;
      const matchesImpact =
        impactFilter === 'All' || d.badges.includes(impactFilter as ImpactLevel);
      return matchesSearch && matchesCategory && matchesImpact;
    });
  }, [dataTypes, search, categoryFilter, impactFilter]);
  console.log(filtered, 'filtered');
  return (
    <div className="rounded-2xl border border-accent_border_gray bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-accent_text_black">Select Data Type</h2>
      <p className="mt-1 text-sm text-accent_text_gray">
        Choose the type of data you want to import into Pilucent.
      </p>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent_text_gray" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search data type..."
            className="w-full rounded-lg border border-accent_border_gray bg-white py-2.5 pl-9 pr-3 text-sm text-accent_text_black placeholder:text-accent_text_gray focus:border-accent_soft_blue focus:outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full appearance-none rounded-lg border border-accent_border_gray bg-white px-3 py-2.5 pr-9 text-sm text-accent_text_black focus:border-accent_soft_blue focus:outline-none md:w-44"
          >
            <option value="All">Filter by category</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent_text_gray" />
        </div>
        <div className="relative">
          <select
            value={impactFilter}
            onChange={(e) => setImpactFilter(e.target.value)}
            className="w-full appearance-none rounded-lg border border-accent_border_gray bg-white px-3 py-2.5 pr-9 text-sm text-accent_text_black focus:border-accent_soft_blue focus:outline-none md:w-44"
          >
            <option value="All">Filter by impact level</option>
            <option>GL Impact</option>
            <option>Posting</option>
            <option>Non-posting</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent_text_gray" />
        </div>
      </div>

      {!dataTypes.length && (
        <div className="mt-6 rounded-xl border border-dashed border-accent_border_gray bg-accent_bg_gray/30 p-6 text-center text-sm text-accent_text_gray">
          Loading data types…
        </div>
      )}

      <div className="mt-6 space-y-7">
        {CATEGORIES.map((category) => {
          const items = filtered.filter((d) => d.category === category);
          if (!items.length) return null;
          return (
            <div key={category}>
              <h3 className="text-base font-semibold text-accent_text_black">{category}</h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((option) => {
                  const isSelected = option.id === selectedId;
                  const isDisabled = option.importAvailable === false;
                  const link = GetIfAnotherWay(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        if (link) {
                          router.push(link);
                          return;
                        }
                        if (option.importAvailable === false) {
                          toast.warning(
                            'Import is not yet available for this data type. You can still download the template.'
                          );
                        }
                        onSelect(option);
                      }}
                      className={`group relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-accent_soft_blue bg-accent_bg_light_blue shadow-sm'
                          : 'border-accent_border_gray bg-white hover:border-accent_soft_blue hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {DATA_TYPE_ICON[option.id] || (
                          <FileText className="h-5 w-5 text-accent_soft_blue" />
                        )}
                        <span className="text-sm font-semibold text-accent_soft_blue">
                          {option.title}
                        </span>
                        {!link && isDisabled && (
                          <span className="ml-auto inline-flex items-center gap-1 rounded bg-accent_bg_gray px-1.5 py-0.5 text-[10px] font-medium text-accent_text_gray">
                            <Lock className="h-3 w-3" /> Soon
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-accent_text_gray">{option.description}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {option.badges.map((b) => (
                          <BadgePill key={b} label={b} />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Step1SelectDataType;
