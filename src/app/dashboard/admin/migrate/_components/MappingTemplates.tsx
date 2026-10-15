'use client';

import React, { useMemo, useState } from 'react';
import {
  Search,
  ChevronDown,
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
  Lock,
  BarChart3,
  History,
  DollarSign,
} from 'lucide-react';
import { ApiDataType, DataTypeOption, ImpactLevel } from './types';
import { useFetch } from '@/app/helpers/hooks';
import { fetchMigrationDataTypes } from '@/app/helpers/backend';

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
  opening_balances: <BarChart3 className="h-5 w-5 text-accent_soft_blue" />,
  open_transactions: <DollarSign className="h-5 w-5 text-accent_soft_blue" />,
  historical_transactions: <History className="h-5 w-5 text-accent_soft_blue" />,
};

const toUiDataType = (dt: ApiDataType): DataTypeOption & { apiCategory: string } => {
  const badges: DataTypeOption['badges'] = [];
  if (dt.has_gl_impact) badges.push('GL Impact');
  if (dt.is_posting_transaction) badges.push('Posting');
  if (!dt.is_posting_transaction && !dt.has_gl_impact) badges.push('Non-posting');

  return {
    id: dt.data_type,
    title: dt.label || dt.data_type,
    description: dt.description || '',
    category: dt.category as DataTypeOption['category'],
    badges,
    icon: dt.data_type,
    importAvailable: dt.import_available,
    templateAvailable: dt.template_available,
    apiCategory: dt.category,
  };
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

const MappingTemplates: React.FC = () => {
  const { data: rawTemplates, isPending } = useFetch(['migration', 'templates'], fetchMigrationDataTypes);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [impactFilter, setImpactFilter] = useState('All');

  const dataTypes = useMemo(() => {
    const raw: ApiDataType[] = Array.isArray(rawTemplates)
      ? rawTemplates
      : Array.isArray((rawTemplates as any)?.results)
        ? (rawTemplates as any).results
        : [];
    return raw.map(toUiDataType);
  }, [rawTemplates]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    dataTypes.forEach((d) => {
      if (d.apiCategory) seen.add(d.apiCategory);
    });
    return Array.from(seen);
  }, [dataTypes]);

  const filtered = useMemo(
    () =>
      dataTypes.filter((d) => {
        const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || d.apiCategory === categoryFilter;
        const matchesImpact =
          impactFilter === 'All' || d.badges.includes(impactFilter as ImpactLevel);
        return matchesSearch && matchesCategory && matchesImpact;
      }),
    [dataTypes, search, categoryFilter, impactFilter],
  );

  return (
    <div className="space-y-5 pb-8 font-lexend">
      <div>
        <h2 className="text-2xl font-semibold text-accent_text_black">Template</h2>
        <p className="mt-1 text-sm text-accent_text_gray">
          Choose the Template of data you want to import into Pilucent.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
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
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
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

      {isPending && (
        <div className="mt-6 rounded-xl border border-dashed border-accent_border_gray bg-accent_bg_gray/30 p-6 text-center text-sm text-accent_text_gray">
          Loading data types…
        </div>
      )}

      {!isPending && !dataTypes.length && (
        <div className="mt-6 rounded-xl border border-dashed border-accent_border_gray bg-accent_bg_gray/30 p-6 text-center text-sm text-accent_text_gray">
          No data types available.
        </div>
      )}

      <div className="mt-6 space-y-7">
        {categories.map((category) => {
          const items = filtered.filter((d) => d.apiCategory === category);
          if (!items.length) return null;
          return (
            <div key={category}>
              <h3 className="text-base font-semibold text-accent_text_black">{category}</h3>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((option) => {
                  const isDisabled = option.importAvailable === false;
                  return (
                    <div
                      key={option.id}
                      className="flex flex-col gap-2 rounded-xl border border-accent_border_gray bg-white p-4 transition hover:border-accent_soft_blue hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        {DATA_TYPE_ICON[option.id] || (
                          <FileText className="h-5 w-5 text-accent_soft_blue" />
                        )}
                        <span className="text-sm font-semibold text-accent_soft_blue">
                          {option.title}
                        </span>
                        {isDisabled && (
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
                    </div>
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

export default MappingTemplates;
