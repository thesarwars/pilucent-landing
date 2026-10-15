'use client';

/**
 * The navigation rail — docs/frontend/sidebar-prompt.md.
 *
 * A floating glass card: 316px expanded, 76px collapsed, nothing in between
 * (no hover-peek, no overlay). An Accounting group, the spec's three groups of
 * BD modules, a language switch, a collapse control and the compliance badge.
 *
 * Departures from the prototype, each deliberate:
 * - Modules without a page in this app yet are shown but inert, with a
 *   "Soon" tag in the batch-tag slot. Batch tags themselves are off
 *   (`SHOW_BATCH`), as the spec requires before release.
 * - Collapsed, the header stacks vertically. In a row its logo, language and
 *   collapse buttons are wider than the collapsed card, which clips them —
 *   including the button that expands the rail again.
 * - Under 768px the rail stays collapsed: an expanded 316px rail leaves no
 *   room for the page on a phone, and the spec allows no overlay mode.
 * - The spec's own open items are closed: a <nav aria-label="Main"> landmark,
 *   aria-hidden icons, and #6E6883 for the muted ink (#8A83A6 fails 4.5:1).
 * - Accounting (not in the spec) leads the rail, permission-filtered as the
 *   old sidebar was, with react-icons (Lucide) icons. A section with
 *   sub-pages folds behind a chevron and opens itself while one of its pages
 *   is open. With it the rail passes the spec's ~30 rows, so group headings
 *   fold too (spec §14.4). Sales tax and economic nexus stay out of the rail,
 *   as in the prototype's BD compliance mode.
 */

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { IconType } from 'react-icons';
import {
  LuArrowLeftRight,
  LuChartColumn,
  LuChevronDown,
  LuLayoutDashboard,
  LuListTree,
  LuPercent,
  LuShoppingCart,
  LuWallet,
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/app/redux/store';
import { useLang } from '@/app/dashboard/hris/employee/employees/_bd/i18n';

type GroupId = 'people' | 'pay' | 'compliance';

/** `[groupId, moduleId, label, batchTag, svgPath]` — spec §10, in order. */
const MODULES: [GroupId, string, string, string, string][] = [
  [
    'people',
    'employee',
    'Employee profile',
    'B1',
    'M16 20v-2a4 4 0 0 0-8 0v2M12 12.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8',
  ],
  [
    'people',
    'salary',
    'Salary profile',
    'B2A',
    'M12 3.5v17M16.5 7.5H10a2.6 2.6 0 0 0 0 5.2h3.8a2.6 2.6 0 0 1 0 5.3H7',
  ],
  [
    'people',
    'attendance',
    'Attendance',
    'B3',
    'M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7A1.5 1.5 0 0 1 5 5.5M8 3.5v4M16 3.5v4M3.5 10.5h17M8 14.5h.01M12 14.5h.01M16 14.5h.01',
  ],
  [
    'people',
    'leaveconsole',
    'Leave',
    'LV',
    'M12 21s-7-4.6-7-10a7 7 0 0 1 14 0c0 5.4-7 10-7 10M12 8.5v4l2.5 1.5',
  ],
  [
    'people',
    'idcards',
    'ID cards',
    'IDC',
    'M4.5 5.5h15a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17V7a1.5 1.5 0 0 1 1.5-1.5M13.5 10h4M13.5 13.5h4M9.6 11.2a1.9 1.9 0 1 1-3.8 0 1.9 1.9 0 0 1 3.8 0M6 15.6c.4-1 1-1.5 1.7-1.5s1.3.5 1.7 1.5',
  ],
  [
    'people',
    'intake',
    'Attendance intake',
    'P3',
    'M12 15.5V4M8 8l4-4 4 4M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15',
  ],
  [
    'people',
    'portal',
    'Self service',
    'P3',
    'M7 3.5h10a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1M10.5 18h3',
  ],

  [
    'pay',
    'library',
    'Components & structures',
    'B2',
    'M4.5 7h15M4.5 12h15M4.5 17h9M17 15v4M15 17h4',
  ],
  [
    'pay',
    'payroll',
    'Payroll settings',
    'B2',
    'M4 6.5h16M4 12h16M4 17.5h10M18.5 15.5v4M16.5 17.5h4',
  ],
  [
    'pay',
    'runpayroll',
    'Run payroll',
    'RP',
    'M4.5 7.5h15a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1M3.5 11.5h17M7.5 15h3',
  ],
  [
    'pay',
    'payslip',
    'Payslip & compliance',
    'PS',
    'M7 3.5h10a1 1 0 0 1 1 1v16l-2.5-1.6L13 20.5l-2.5-1.6L8 20.5 6 19V4.5a1 1 0 0 1 1-1M9.5 8h5M9.5 11.5h5M9.5 15h3',
  ],
  [
    'pay',
    'taxsettlement',
    'Tax settlement',
    'TS',
    'M12 3.5v17M8 7.5h5.5a2.5 2.5 0 0 1 0 5H9a2.5 2.5 0 0 0 0 5h6',
  ],
  [
    'pay',
    'payrollrun',
    'Payroll register',
    'B5',
    'M6.5 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V5a1.5 1.5 0 0 1 1.5-1.5M8.5 8h7M8.5 12h7M8.5 16h4',
  ],
  [
    'pay',
    'bonusrules',
    'Bonus rules',
    'FB',
    'M12 3.5 14.3 8.4l5.4.8-3.9 3.8.9 5.3-4.7-2.5-4.7 2.5.9-5.3-3.9-3.8 5.4-.8Z',
  ],
  [
    'pay',
    'engine',
    'Payroll engine',
    'D5',
    'M12 3.5v17M8.2 6.8H14a2.7 2.7 0 0 1 0 5.4h-4a2.7 2.7 0 0 0 0 5.4h5.8',
  ],

  [
    'compliance',
    'gates',
    'Compliance gates',
    'CG',
    'M12 3.5 4.5 7v5.5c0 4.2 3.1 7.4 7.5 8.5 4.4-1.1 7.5-4.3 7.5-8.5V7L12 3.5ZM9 12l2.2 2.2L15.5 10',
  ],
  [
    'compliance',
    'determinism',
    'Determinism',
    'DT',
    'M5 12a7 7 0 0 1 11.9-5M19 12a7 7 0 0 1-11.9 5M16 4.5v3h-3M8 19.5v-3h3',
  ],
  [
    'compliance',
    'declarations',
    'Declarations',
    'ID',
    'M7 4.5h7l3.5 3.5V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1M9.5 12h5M9.5 15.5h3',
  ],
  [
    'compliance',
    'depositchain',
    'Deposit chain',
    'DC',
    'M12 3.5v9M8.5 9 12 12.5 15.5 9M4.5 15v3.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V15',
  ],
  [
    'compliance',
    'filings',
    'Statutory filings',
    'B5',
    'M14 3.2H7A1.8 1.8 0 0 0 5.2 5v14A1.8 1.8 0 0 0 7 20.8h10a1.8 1.8 0 0 0 1.8-1.8V8M14 3.2V8h4.8M8.6 12.5h6.8M8.6 16h4.4',
  ],
  [
    'compliance',
    'settlement',
    'Settlement',
    'B6',
    'M4.5 6.5h15M7.5 3.5v3M16.5 3.5v3M4.5 6.5v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-13M8.5 14l2.2 2.2L16 11',
  ],
  [
    'compliance',
    'vat',
    'VAT & Mushak',
    'B7',
    'M8 3.5h8a1.5 1.5 0 0 1 1.5 1.5v15l-3-2-2.5 2-2.5-2-3 2V5A1.5 1.5 0 0 1 8 3.5M10 8h4M10 12h4',
  ],
  [
    'compliance',
    'documents',
    'Documents & payments',
    'P2',
    'M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1M13.5 3.5v4.5H18M9 13h6M9 16.5h4',
  ],
  [
    'compliance',
    'rulebook',
    'Rule book',
    'RB',
    'M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v13.5H6.5A1.5 1.5 0 0 0 5 19V4.5ZM5 19a1.5 1.5 0 0 0 1.5 1.5H19M9 7.5h6M9 11h6',
  ],
  [
    'compliance',
    'forms',
    'Forms & filings',
    'D6',
    'M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1M13.5 3.5v4.5H18M9 12.5h6M9 16h4',
  ],
  [
    'compliance',
    'buildplan',
    'Build plan',
    'D4',
    'M4.5 6.5h6M4.5 12h9M4.5 17.5h5M16.5 15.5l2 2 3.5-3.8M17 3.5v7M13.5 7h7',
  ],
  [
    'compliance',
    'lifecycle',
    'Lifecycle',
    'D3',
    'M12 3.2a8.8 8.8 0 1 1-6.2 2.6M5.8 5.8V2.4M5.8 5.8h3.4M12 7.5v5l3 2',
  ],
  [
    'compliance',
    'datamodel',
    'Data model',
    'D2',
    'M4.5 6.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3ZM4.5 6.5v11c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-11M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3',
  ],
  [
    'compliance',
    'audit',
    'Audit journal',
    'A2',
    'M12 3.2 4.5 6v6.2c0 4.3 3.1 7.6 7.5 8.6 4.4-1 7.5-4.3 7.5-8.6V6L12 3.2ZM9.2 12.1l2 2 3.6-3.9',
  ],
];

const GROUPS: [GroupId, string][] = [
  ['people', 'People'],
  ['pay', 'Pay & benefits'],
  ['compliance', 'Statutory & tax'],
];

interface Page {
  label: string;
  href: string;
  permission?: string;
  /** Shown whatever the permissions say (the old sidebar's `show`). */
  show?: boolean;
}

interface Section {
  id: string;
  label: string;
  icon: IconType;
  /** The first visible page is where the row goes; the rest list beneath it. */
  pages: Page[];
  /** Active only on exactly this path (the dashboard is a prefix of everything). */
  exact?: boolean;
}

/** The accounting pages, as the old sidebar reached them. */
const ACCOUNTING: Section[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LuLayoutDashboard,
    pages: [{ label: 'Dashboard', href: '/dashboard', permission: 'view_dashboard' }],
    exact: true,
  },
  {
    id: 'coa',
    label: 'Chart of accounts',
    icon: LuListTree,
    pages: [
      {
        label: 'Chart of accounts',
        href: '/dashboard/transactions/chart-of-accounts',
        permission: 'view_chartofaccount',
      },
      {
        label: 'COA tree',
        href: '/dashboard/transactions/coa_tree',
        permission: 'view_chartofaccount',
      },
    ],
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: LuArrowLeftRight,
    pages: [
      {
        label: 'Bank transactions',
        href: '/dashboard/transactions/banking',
        permission: 'view_bankdeposit',
      },
      {
        label: 'Reconcile',
        href: '/dashboard/transactions/reconcile',
        permission: 'view_bankreconciliation',
      },
      {
        label: 'Journal entries',
        href: '/dashboard/transactions/journal',
        permission: 'view_journalentry',
      },
      // The backend does not emit `view_recurring` yet; the old sidebar force-showed it.
      { label: 'Recurring transactions', href: '/dashboard/transactions/recurring', show: true },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: LuShoppingCart,
    pages: [
      { label: 'All sales', href: '/dashboard/sales/all_sales', permission: 'view_sale' },
      { label: 'Customers', href: '/dashboard/sales/customers', permission: 'view_customer' },
      {
        label: 'Products & services',
        href: '/dashboard/sales/product_services',
        permission: 'view_product',
      },
      {
        label: 'Warehouse locations',
        href: '/dashboard/sales/warehouse_location',
        permission: 'view_warehouse',
      },
    ],
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: LuWallet,
    pages: [
      { label: 'Expenses', href: '/dashboard/expenses/expenses', permission: 'view_expense' },
      { label: 'Suppliers', href: '/dashboard/expenses/suppliers', permission: 'view_supplier' },
    ],
  },
  {
    id: 'taxes',
    label: 'Taxes',
    icon: LuPercent,
    pages: [
      {
        label: 'Taxes & agencies',
        href: '/dashboard/taxes/taxes_agencies',
        permission: 'view_agency',
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: LuChartColumn,
    pages: [{ label: 'Reports', href: '/dashboard/reports', permission: 'view_reports' }],
  },
];

/** Modules that have a page in this app. Add one here when its page lands. */
const ROUTES: Record<string, string> = {
  employee: '/dashboard/hris/employee/employees',
};

/** Development scaffolding (spec §8.4): off before any customer sees the rail. */
const SHOW_BATCH = false;

const STORAGE_KEY = 'pilucent.rail.expanded';
const FOLDED_KEY = 'pilucent.rail.folded';
const INK_MUTED = '#6E6883'; // spec §3.2 / §15 #1: #8A83A6 measures 3.57:1

function useNarrowScreen() {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return narrow;
}

function Icon({ d, size = 18, stroke = 1.75 }: { d: string; size?: number; stroke?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

const SMALL_BUTTON =
  'flex h-7 shrink-0 items-center justify-center rounded-[9px] border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C4DFF]';

export default function SideBar() {
  const path = usePathname();
  const narrow = useNarrowScreen();
  const { lang, setLang } = useLang();
  const [expandedPref, setExpandedPref] = React.useState(true);
  const expanded = expandedPref && !narrow;
  const isBangla = lang === 'bn';
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const { UserData: user } = useAppSelector((state) => state.userData);
  const [folded, setFolded] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) setExpandedPref(saved === 'true');
      const savedFolded = JSON.parse(localStorage.getItem(FOLDED_KEY) || '[]');
      if (Array.isArray(savedFolded)) setFolded(savedFolded.filter((x) => typeof x === 'string'));
    } catch {
      /* storage blocked: start expanded, nothing folded */
    }
  }, []);

  const toggleGroup = (id: string) => {
    const next = folded.includes(id) ? folded.filter((x) => x !== id) : [...folded, id];
    setFolded(next);
    try {
      localStorage.setItem(FOLDED_KEY, JSON.stringify(next));
    } catch {
      /* the preference lasts for this page only */
    }
  };

  // The old sidebar's rule: a page shows when it needs no permission, the
  // user holds it, or it is forced visible; a section shows when any page does.
  const visible = (page: Page) =>
    page.show ||
    !page.permission ||
    (Permissions as string[] | undefined)?.includes(page.permission) ||
    (page.href === '/dashboard' && (!user?.is_employee || user?.is_admin));
  const accounting = ACCOUNTING.map((section) => ({
    ...section,
    pages: section.pages.filter(visible),
  })).filter((section) => section.pages.length > 0);

  // Sections with sub-pages fold. The one holding the open page opens itself.
  const [openSections, setOpenSections] = React.useState<string[]>([]);
  const currentSection = accounting.find((section) => sectionContains(section, path ?? ''))?.id;
  React.useEffect(() => {
    if (currentSection) {
      setOpenSections((open) => (open.includes(currentSection) ? open : [...open, currentSection]));
    }
  }, [currentSection]);
  const toggleSection = (id: string) =>
    setOpenSections((open) => (open.includes(id) ? open.filter((x) => x !== id) : [...open, id]));

  const toggleRail = () => {
    const next = !expandedPref;
    setExpandedPref(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      /* the preference lasts for this page only */
    }
  };

  const activeId = Object.entries(ROUTES).find(([, href]) => path?.startsWith(href))?.[0];
  const langTitle = isBangla
    ? 'Switch to English'
    : 'বাংলায় দেখুন — switch the interface to Bangla';
  const railTitle = expanded ? 'Collapse menu' : 'Expand menu';

  return (
    <div
      className="flex shrink-0 py-4 pl-4"
      style={{ width: expanded ? 316 : 76, transition: 'width 0.22s ease' }}
    >
      <nav
        aria-label="Main"
        className="flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden rounded-[22px] border border-[rgba(255,255,255,0.78)] bg-[rgba(255,255,255,0.46)] px-2.5 pb-3 pt-4 font-jakarta text-[#16172A] shadow-[0_24px_60px_-36px_rgba(22,23,42,0.5)] backdrop-blur-[24px]"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Header: logo → wordmark → language → collapse. Stacked when collapsed. */}
        <div
          className={cn(
            'flex min-w-0 items-center',
            expanded ? 'gap-2.5 px-1 pb-4' : 'flex-col gap-2 pb-3'
          )}
        >
          <div
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[11px] text-[17px] font-bold text-white shadow-[0_8px_22px_-8px_rgba(124,77,255,0.7)]"
            style={{ background: 'linear-gradient(140deg, #7C4DFF, #5A2BE0)' }}
          >
            b
          </div>
          {expanded && (
            <div className="min-w-0 flex-1">
              <div className="whitespace-nowrap text-[15.5px] font-bold tracking-[-0.01em]">
                Balanzify
              </div>
              <div
                className="mt-px whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.05em]"
                style={{ color: INK_MUTED }}
              >
                Bangladesh
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setLang(isBangla ? 'en' : 'bn')}
            title={langTitle}
            aria-label={langTitle}
            aria-pressed={isBangla}
            lang={isBangla ? 'bn' : undefined}
            className={cn(
              SMALL_BUTTON,
              'px-[9px] text-[11px] font-extrabold tracking-[0.04em] hover:border-[rgba(124,77,255,0.5)]',
              isBangla
                ? 'border-[rgba(124,77,255,0.4)] bg-[rgba(124,77,255,0.14)] text-[#6B3FE8]'
                : 'border-[rgba(255,255,255,0.75)] bg-[rgba(255,255,255,0.75)] text-[#44405C]'
            )}
            style={{ lineHeight: 1, fontFamily: 'inherit' }}
          >
            {isBangla ? 'বাং' : 'EN'}
          </button>
          {!narrow && (
            <button
              type="button"
              onClick={toggleRail}
              title={railTitle}
              aria-label={railTitle}
              style={{ fontFamily: 'inherit' }}
              className={cn(
                SMALL_BUTTON,
                'w-7 border-[rgba(255,255,255,0.75)] bg-[rgba(255,255,255,0.55)] text-[#6F6A85] hover:bg-[rgba(255,255,255,0.9)] hover:text-[#7C4DFF]'
              )}
            >
              <span style={{ display: 'flex', transform: expanded ? 'none' : 'rotate(180deg)' }}>
                <Icon d="M11 17l-5-5 5-5M18 17l-5-5 5-5" size={13} stroke={2.2} />
              </span>
            </button>
          )}
        </div>

        {accounting.length > 0 && (
          <div className="mb-2 flex flex-col gap-[3px]">
            <GroupHeading
              id="accounting"
              label="Accounting"
              expanded={expanded}
              open={!folded.includes('accounting')}
              onToggle={toggleGroup}
            />
            {(!expanded || !folded.includes('accounting')) &&
              accounting.map((section) => (
                <SectionRow
                  key={section.id}
                  section={section}
                  path={path ?? ''}
                  expanded={expanded}
                  open={openSections.includes(section.id)}
                  onToggle={toggleSection}
                />
              ))}
          </div>
        )}

        {GROUPS.map(([groupId, groupLabel]) => (
          <div key={groupId} className="mb-2 flex flex-col gap-[3px]">
            <GroupHeading
              id={groupId}
              label={groupLabel}
              expanded={expanded}
              open={!folded.includes(groupId)}
              onToggle={toggleGroup}
            />
            {(!expanded || !folded.includes(groupId)) &&
              MODULES.filter(([g]) => g === groupId).map(([, id, label, batch, d]) => (
                <ModuleRow
                  key={id}
                  label={label}
                  batch={batch}
                  d={d}
                  href={ROUTES[id]}
                  active={id === activeId}
                  expanded={expanded}
                />
              ))}
          </div>
        ))}

        <span className="flex-1" />

        {expanded ? (
          <div className="min-w-0 rounded-2xl border border-[rgba(34,211,238,0.28)] bg-[rgba(34,211,238,0.09)] px-3 py-[13px]">
            <div className="flex items-center gap-[7px]">
              <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#22D3EE]" />
              <span className="whitespace-nowrap text-[10.5px] font-extrabold uppercase tracking-[0.06em] text-[#0E7490]">
                BD compliance mode
              </span>
            </div>
            <div className="mt-[7px] text-[11px] leading-[1.5] text-[#0E5A70]">
              Statutory figures load from the rules module. Draft values need compliance sign-off
              before release.
            </div>
          </div>
        ) : (
          <div
            title="Bangladesh compliance mode"
            className="mx-auto flex h-[30px] w-9 items-center justify-center rounded-full border border-[rgba(34,211,238,0.36)] bg-[rgba(34,211,238,0.14)] text-[10.5px] font-extrabold tracking-[0.04em] text-[#0E7490]"
          >
            BD
          </div>
        )}
      </nav>
    </div>
  );
}

function ModuleRow({
  label,
  batch,
  d,
  href,
  active,
  expanded,
}: {
  label: string;
  batch: string;
  d: string;
  href?: string;
  active: boolean;
  expanded: boolean;
}) {
  const built = !!href;
  const tag = built ? (SHOW_BATCH ? batch : null) : 'Soon';
  const className = cn(
    'flex w-full min-w-0 items-center gap-[11px] rounded-[13px] px-2.5 py-[11px] text-left text-[13.5px] outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C4DFF] focus-visible:[outline-offset:-2px]',
    active
      ? 'bg-[rgba(255,255,255,0.95)] font-bold text-[#6B3FE8] shadow-[0_6px_18px_-10px_rgba(22,23,42,0.45)]'
      : built
        ? 'font-medium text-[#44405C] hover:bg-[rgba(255,255,255,0.62)]'
        : 'cursor-default font-medium',
    !expanded && 'justify-center'
  );
  const content = (
    <>
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center"
        style={{ color: active ? '#7C4DFF' : built ? '#6F6A85' : '#9A94AE' }}
      >
        <Icon d={d} />
      </span>
      {expanded && (
        <span
          className="min-w-0 flex-1 truncate"
          style={built || active ? undefined : { color: INK_MUTED }}
        >
          {label}
        </span>
      )}
      {expanded && tag && (
        <span
          className="shrink-0 rounded-md border px-1.5 py-0.5 text-[9.5px] font-bold"
          style={{
            fontFamily: "var(--font-jbmono), 'JetBrains Mono', monospace",
            color: active ? '#6B3FE8' : INK_MUTED,
            background: active ? 'rgba(124,77,255,0.12)' : 'rgba(22,23,42,0.05)',
            borderColor: active ? 'rgba(124,77,255,0.26)' : 'rgba(22,23,42,0.09)',
          }}
        >
          {tag}
        </span>
      )}
    </>
  );

  // `title` is load-bearing: collapsed, it is the only name a row has (spec §8.3).
  if (built) {
    return (
      <Link
        href={href}
        title={label}
        aria-current={active ? 'page' : 'false'}
        className={className}
      >
        {content}
      </Link>
    );
  }
  return (
    <span
      role="link"
      aria-disabled="true"
      tabIndex={-1}
      title={`${label} — not built yet`}
      className={className}
    >
      {content}
    </span>
  );
}

/** Expanded: a heading that folds its group. Collapsed: the spec's 1px rule. */
function GroupHeading({
  id,
  label,
  expanded,
  open,
  onToggle,
}: {
  id: string;
  label: string;
  expanded: boolean;
  open: boolean;
  onToggle: (id: string) => void;
}) {
  if (!expanded) return <div className="mx-2 my-1.5 h-px bg-[rgba(22,23,42,0.09)]" />;
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      aria-expanded={open}
      style={{ fontFamily: 'inherit' }}
      className="group flex w-full items-center gap-1 whitespace-nowrap rounded-lg px-[11px] pb-1 pt-2 text-left text-[10px] font-extrabold uppercase tracking-[0.09em] text-[#9A94AE] outline-none hover:text-[#6E6883] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C4DFF] focus-visible:[outline-offset:-2px]"
    >
      <span className="min-w-0 flex-1">{label}</span>
      <span
        className="flex opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ transform: open ? 'none' : 'rotate(-90deg)' }}
      >
        <LuChevronDown size={12} strokeWidth={2.4} aria-hidden="true" />
      </span>
    </button>
  );
}

function sectionContains(section: Section, path: string) {
  return section.exact
    ? path === section.pages[0].href
    : section.pages.some((page) => path.startsWith(page.href));
}

const ROW =
  'flex w-full min-w-0 items-center gap-[11px] rounded-[13px] px-2.5 py-[11px] text-left text-[13.5px] outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C4DFF] focus-visible:[outline-offset:-2px]';
const LIFTED =
  'bg-[rgba(255,255,255,0.95)] font-bold text-[#6B3FE8] shadow-[0_6px_18px_-10px_rgba(22,23,42,0.45)]';

/**
 * An accounting section. With sub-pages (expanded rail) it is a toggle with a
 * chevron, and its pages hang beneath it on a guide line. Without them — or
 * in the collapsed rail, where there is no room for the list — the row goes
 * straight to the section's first page.
 */
function SectionRow({
  section,
  path,
  expanded,
  open,
  onToggle,
}: {
  section: Section;
  path: string;
  expanded: boolean;
  open: boolean;
  onToggle: (id: string) => void;
}) {
  const SectionIcon = section.icon;
  const inSection = sectionContains(section, path);
  const foldable = expanded && section.pages.length > 1;
  const activePage = section.pages.find((page) => path.startsWith(page.href))?.href;
  const icon = (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center"
      style={{ color: inSection ? '#7C4DFF' : '#6F6A85' }}
    >
      <SectionIcon size={18} strokeWidth={1.75} aria-hidden="true" />
    </span>
  );

  if (!foldable) {
    return (
      <Link
        href={section.pages[0].href}
        // Collapsed, the tooltip is the row's only name (spec §8.3).
        title={expanded ? undefined : section.label}
        aria-current={inSection ? 'page' : 'false'}
        className={cn(
          ROW,
          inSection ? LIFTED : 'font-medium text-[#44405C] hover:bg-[rgba(255,255,255,0.62)]',
          !expanded && 'justify-center'
        )}
      >
        {icon}
        {expanded && <span className="min-w-0 flex-1 truncate">{section.label}</span>}
      </Link>
    );
  }

  const listId = `rail-section-${section.id}`;
  return (
    <>
      <button
        type="button"
        onClick={() => onToggle(section.id)}
        aria-expanded={open}
        aria-controls={listId}
        style={{ fontFamily: 'inherit' }}
        className={cn(
          ROW,
          // Folded with the open page inside: lift the section so the place still shows.
          inSection && !open
            ? LIFTED
            : inSection
              ? 'font-bold text-[#6B3FE8] hover:bg-[rgba(255,255,255,0.62)]'
              : 'font-medium text-[#44405C] hover:bg-[rgba(255,255,255,0.62)]'
        )}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate">{section.label}</span>
        <LuChevronDown
          size={15}
          strokeWidth={2}
          aria-hidden="true"
          className="shrink-0 transition-transform duration-200"
          style={{
            transform: open ? 'none' : 'rotate(-90deg)',
            color: inSection ? '#7C4DFF' : '#9A94AE',
          }}
        />
      </button>
      {open && (
        <div
          id={listId}
          className="mb-1 ml-[19px] flex flex-col gap-[2px] border-l border-[rgba(22,23,42,0.1)] pl-2"
        >
          {section.pages.map((page) => {
            const active = page.href === activePage;
            return (
              <Link
                key={page.href}
                href={page.href}
                aria-current={active ? 'page' : 'false'}
                className={cn(
                  'block min-w-0 truncate rounded-[11px] px-3 py-[7px] text-[13px] outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#7C4DFF] focus-visible:[outline-offset:-2px]',
                  active ? LIFTED : 'font-medium text-[#44405C] hover:bg-[rgba(255,255,255,0.62)]'
                )}
              >
                {page.label}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
