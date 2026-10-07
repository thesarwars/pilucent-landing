'use client';

import * as React from 'react';
import {
  Search,
  Plus,
  Download,
  MoreVertical,
  Columns3,
  Wallet,
  TrendingUp,
  Clock,
  FileText,
  Building2,
  Receipt,
  Users,
  Sparkles,
  ArrowUpRight,
  Banknote,
  Calendar,
} from 'lucide-react';
import {
  VioletSurface,
  PageHeader,
  DarkHero,
  StatTile,
  VioletCard,
  VioletCardHeader,
  VioletCardDivider,
  VTable,
  VTableHead,
  VTableHeadCell,
  VTableRow,
  VTableCell,
  VTableEmpty,
  VioletButton,
  Chip,
  IconChip,
  Avatar,
  AvatarStack,
  Toggle,
  VioletInput,
  VioletSelect,
  VioletTextarea,
  Modal,
  Drawer,
  FloatingActionBar,
  money,
  type VioletTone,
} from '@/components/violet';

type Account = {
  id: number;
  name: string;
  type: string;
  tone: VioletTone;
  cat: 'assets' | 'liabilities' | 'income' | 'expenses';
  balance: number;
};

const ACCOUNTS: Account[] = [
  { id: 1, name: 'Business Checking', type: 'Bank', tone: 'success', cat: 'assets', balance: 142309.18 },
  { id: 2, name: 'Accounts Receivable', type: 'A/R', tone: 'teal', cat: 'assets', balance: 38920.5 },
  { id: 3, name: 'Office Equipment', type: 'Fixed Assets', tone: 'teal', cat: 'assets', balance: 23750 },
  { id: 4, name: 'Accounts Payable', type: 'A/P', tone: 'warn', cat: 'liabilities', balance: -12480 },
  { id: 5, name: 'Sales Revenue', type: 'Income', tone: 'violet', cat: 'income', balance: 312640.9 },
  { id: 6, name: 'Software Subscriptions', type: 'Expenses', tone: 'rose', cat: 'expenses', balance: -6732.45 },
  { id: 7, name: 'Rent Expense', type: 'Expenses', tone: 'rose', cat: 'expenses', balance: -24000 },
];

const STATS: {
  key: Account['cat'];
  label: string;
  tone: VioletTone;
  icon: React.ReactNode;
  value: number;
  share: string;
  bar: number;
  sub: string;
}[] = [
  { key: 'assets', label: 'Assets', tone: 'success', icon: <Wallet />, value: 204979, share: '58%', bar: 58, sub: '3 accounts' },
  { key: 'liabilities', label: 'Liabilities', tone: 'warn', icon: <Receipt />, value: 12480, share: '12%', bar: 12, sub: '1 account' },
  { key: 'income', label: 'Income', tone: 'violet', icon: <TrendingUp />, value: 312640, share: '55%', bar: 55, sub: '1 account' },
  { key: 'expenses', label: 'Expenses', tone: 'rose', icon: <Clock />, value: 30732, share: '18%', bar: 18, sub: '2 accounts' },
];

const TONES: VioletTone[] = ['violet', 'success', 'warn', 'danger', 'rose', 'teal', 'neutral'];

const COLS = 'minmax(0,2fr) 150px 96px minmax(0,1fr) 120px 150px';

export default function VioletShowcasePage() {
  const [filter, setFilter] = React.useState<Account['cat'] | null>(null);
  const [query, setQuery] = React.useState('');
  const [menuRow, setMenuRow] = React.useState<number | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [autoTax, setAutoTax] = React.useState(true);
  const [recurring, setRecurring] = React.useState(false);

  const rows = ACCOUNTS.filter(
    (a) =>
      (!filter || a.cat === filter) &&
      (!query || a.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <VioletSurface className="min-h-screen">
      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-8">
        <PageHeader
          crumbs={[{ label: 'Dashboard' }, { label: 'Transactions' }, { label: 'Chart of Accounts' }]}
          title="Chart of Accounts"
          chips={
            <>
              <Chip tone="violet">Violet Suite</Chip>
              <Chip tone="success" dot>
                Live demo
              </Chip>
            </>
          }
          right={
            <div className="flex items-center gap-2.5">
              <VioletButton variant="secondary" size="sm" leftIcon={<Download className="h-[15px] w-[15px]" />}>
                Export
              </VioletButton>
              <VioletButton size="sm" leftIcon={<Plus className="h-[15px] w-[15px]" />} onClick={() => setDrawerOpen(true)}>
                Add new
              </VioletButton>
            </div>
          }
          sub="Every primitive in the Violet Suite kit, rendered with real ledger content."
        />

        {/* Overview: dark hero + stat tiles */}
        <div className="mt-[18px] grid grid-cols-1 gap-3.5 lg:grid-cols-[320px_1fr]">
          <DarkHero
            label="NET WORTH"
            value={money(192499)}
            caption="Assets less liabilities · live"
            badge={<Chip tone="success" className="bg-white/15 text-white" dot>LIVE</Chip>}
            rows={[
              { label: 'Total assets', value: money(204979), tone: 'pos' },
              { label: 'Total liabilities', value: money(-12480), tone: 'neg' },
            ]}
            progress={{ value: 84, label: '84% of accounts reconciled this month' }}
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {STATS.map((s, i) => (
              <StatTile
                key={s.key}
                icon={s.icon}
                tone={s.tone}
                value={money(s.value)}
                label={s.label}
                sub={s.sub}
                share={s.share}
                bar={s.bar}
                delay={0.08 + i * 0.06}
                active={filter === s.key}
                onClick={() => setFilter((f) => (f === s.key ? null : s.key))}
              />
            ))}
          </div>
        </div>

        {/* Table card */}
        <VioletCard className="mt-4 overflow-hidden">
          <VioletCardHeader
            icon={<FileText />}
            title="Ledger accounts"
            sub={filter ? `Filtered to ${filter}` : 'Click a stat tile above to filter'}
            right={
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-v-ink400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search accounts…"
                    className="w-[220px] rounded-v-input border border-v-border bg-v-card-subtle py-2 pl-9 pr-3 text-[13px] font-medium text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
                  />
                </div>
                <VioletButton variant="outline" size="sm" leftIcon={<Columns3 className="h-[14px] w-[14px]" />}>
                  Columns
                </VioletButton>
              </div>
            }
          />
          <VTable cols={COLS} className="rounded-none shadow-none">
            <VTableHead>
              <VTableHeadCell>Account</VTableHeadCell>
              <VTableHeadCell>Type</VTableHeadCell>
              <VTableHeadCell>Currency</VTableHeadCell>
              <VTableHeadCell align="right">Balance</VTableHeadCell>
              <VTableHeadCell>Status</VTableHeadCell>
              <VTableHeadCell align="right">Actions</VTableHeadCell>
            </VTableHead>

            {rows.map((a, i) => (
              <VTableRow key={a.id} index={i} active={menuRow === a.id}>
                <VTableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={a.name} seed={a.id} size={34} square />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-bold text-v-ink900">{a.name}</div>
                      <div className="truncate text-[11.5px] text-v-ink400">{a.cat}</div>
                    </div>
                  </div>
                </VTableCell>
                <VTableCell>
                  <Chip tone={a.tone} dot>
                    {a.type}
                  </Chip>
                </VTableCell>
                <VTableCell>
                  <span className="rounded-md bg-v-wash2 px-1.5 py-0.5 text-[11px] font-bold text-v-ink500">USD</span>
                </VTableCell>
                <VTableCell align="right">
                  <span
                    className={
                      'text-[13px] font-bold tabular-nums ' +
                      (a.balance < 0 ? 'text-v-danger-fg' : 'text-v-ink900')
                    }
                  >
                    {money(a.balance)}
                  </span>
                </VTableCell>
                <VTableCell>
                  <Chip tone="success" dot>
                    Active
                  </Chip>
                </VTableCell>
                <VTableCell align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <VioletButton variant="soft" size="sm">
                      History
                    </VioletButton>
                    <VioletButton
                      variant="outline"
                      size="icon"
                      className="h-[30px] w-[30px]"
                      onClick={() => setMenuRow((m) => (m === a.id ? null : a.id))}
                      aria-label="More"
                    >
                      <MoreVertical className="h-[15px] w-[15px]" />
                    </VioletButton>
                  </div>
                </VTableCell>
              </VTableRow>
            ))}

            {rows.length === 0 && (
              <VTableEmpty
                icon={<IconChip tone="neutral"><Search /></IconChip>}
                title="No accounts match"
                sub="Try a different search term or filter."
              />
            )}
          </VTable>
        </VioletCard>

        {/* Component gallery */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Buttons + chips + avatars */}
          <VioletCard>
            <VioletCardHeader icon={<Sparkles />} title="Buttons, chips & avatars" sub="Variants and tones" />
            <VioletCardDivider />
            <div className="space-y-4 p-[22px]">
              <div className="flex flex-wrap items-center gap-2.5">
                <VioletButton>Primary</VioletButton>
                <VioletButton variant="secondary">Secondary</VioletButton>
                <VioletButton variant="outline">Outline</VioletButton>
                <VioletButton variant="soft" size="sm">
                  Soft pill
                </VioletButton>
                <VioletButton variant="dark" size="sm">
                  Dark
                </VioletButton>
                <VioletButton variant="ghost" size="sm">
                  Ghost
                </VioletButton>
                <VioletButton variant="danger" size="sm">
                  Danger
                </VioletButton>
                <VioletButton disabled size="sm">
                  Disabled
                </VioletButton>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {TONES.map((t) => (
                  <Chip key={t} tone={t} dot>
                    {t}
                  </Chip>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                {TONES.map((t) => (
                  <IconChip key={t} tone={t}>
                    <Building2 />
                  </IconChip>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Avatar name="Amara Osei" />
                <Avatar name="Daniel Kim" square />
                <AvatarStack
                  items={[{ name: 'Amara Osei' }, { name: 'Daniel Kim' }, { name: 'Priya Sharma' }]}
                />
                <span className="text-[12px] text-v-ink400">+ stack</span>
              </div>
            </div>
          </VioletCard>

          {/* Form controls */}
          <VioletCard>
            <VioletCardHeader icon={<Banknote />} title="Form controls" sub="Inputs, selects, toggles" />
            <VioletCardDivider />
            <div className="space-y-3.5 p-[22px]">
              <div className="grid grid-cols-2 gap-3">
                <VioletInput label="Account name" required placeholder="e.g. Petty Cash" />
                <VioletInput label="Opening balance" money placeholder="0.00" defaultValue="1250.00" />
              </div>
              <VioletSelect label="Account type" required defaultValue="Bank">
                <option>Bank</option>
                <option>Accounts Receivable (A/R)</option>
                <option>Fixed Assets</option>
                <option>Income</option>
                <option>Expenses</option>
              </VioletSelect>
              <VioletTextarea label="Description" placeholder="What is this account used for?" />
              <div className="flex items-center justify-between rounded-v-input bg-v-wash px-3.5 py-2.5">
                <span className="text-[13px] font-semibold text-v-ink700">Auto-calculate sales tax</span>
                <Toggle checked={autoTax} onChange={setAutoTax} aria-label="Auto tax" />
              </div>
              <div className="flex items-center justify-between rounded-v-input bg-v-wash px-3.5 py-2.5">
                <span className="text-[13px] font-semibold text-v-ink700">Make recurring</span>
                <Toggle checked={recurring} onChange={setRecurring} aria-label="Recurring" />
              </div>
            </div>
          </VioletCard>
        </div>

        {/* Hero tone variants + overlays */}
        <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-3">
          <DarkHero tone="amber" label="CREDIT NOTE" value={money(-432)} caption="Reduces customer balance" badge={<Chip className="bg-[#F5B22E] text-v-ink900">CREDIT</Chip>} />
          <DarkHero tone="green" label="TOTAL COLLECTED" value={money(4904.74)} caption="Paid in full" badge={<Chip className="bg-white/15 text-[#5EDEB2]">PAID</Chip>} />
          <DarkHero tone="rose" label="AMOUNT REFUNDED" value={money(-150)} caption="Money out" badge={<Chip className="bg-white/15 text-[#F49696]">REFUNDED</Chip>} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <VioletButton onClick={() => setModalOpen(true)}>Open modal</VioletButton>
          <VioletButton variant="outline" onClick={() => setDrawerOpen(true)}>
            Open drawer
          </VioletButton>
          <span className="text-[13px] text-v-ink500">— both portal to <code>#modal-root</code>, lock scroll, and close on Esc / scrim.</span>
        </div>

        {/* Floating action bar */}
        <FloatingActionBar label="SELECTED" value={money(rows.reduce((t, r) => t + r.balance, 0))} className="mt-6">
          <VioletButton variant="ghost" size="sm" className="text-white/65 hover:text-white">
            Clear
          </VioletButton>
          <VioletButton size="sm" rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}>
            Reconcile
          </VioletButton>
        </FloatingActionBar>
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        icon={<Receipt />}
        title="Run June payroll?"
        sub="Every month · pays Jun 19, 2026"
        footer={
          <>
            <VioletButton variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>
              Go back
            </VioletButton>
            <VioletButton className="flex-[1.4]" onClick={() => setModalOpen(false)}>
              Confirm &amp; run
            </VioletButton>
          </>
        }
      >
        <div className="rounded-v-input bg-v-wash p-4">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-bold text-v-primary-deep">Total payroll cost</span>
            <span className="text-[17px] font-extrabold tabular-nums text-v-primary-deep">{money(14820)}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-v-input bg-v-warn-bg px-3 py-2 text-[11.5px] text-v-warn-deep">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          Deposits leave Business checking ·· 8441 within 1 business day.
        </div>
      </Modal>

      {/* Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        icon={<Plus />}
        title="Create account"
        sub="Add a new ledger account"
        footer={
          <>
            <VioletButton variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </VioletButton>
            <span className="flex-1" />
            <VioletButton onClick={() => setDrawerOpen(false)}>Save account</VioletButton>
          </>
        }
      >
        <div className="space-y-3.5">
          <VioletInput label="Account name" required placeholder="e.g. Business Checking" />
          <div className="grid grid-cols-2 gap-3">
            <VioletInput label="Account code" placeholder="1010" />
            <VioletSelect label="Account type" required defaultValue="">
              <option value="">Select type</option>
              <option>Bank</option>
              <option>Fixed Assets</option>
              <option>Income</option>
              <option>Expenses</option>
            </VioletSelect>
          </div>
          <VioletInput label="Opening balance" money placeholder="0.00" />
          <div className="flex items-center gap-2 text-[12px] text-v-ink500">
            <Calendar className="h-3.5 w-3.5" /> As of Jun 13, 2026
          </div>
          <div className="flex items-center justify-between rounded-v-input bg-v-wash px-3.5 py-3">
            <div>
              <div className="text-[13px] font-semibold text-v-ink900">Make this a sub-account</div>
              <div className="text-[11.5px] text-v-ink400">Nest it under a parent account</div>
            </div>
            <Toggle checked={recurring} onChange={setRecurring} aria-label="Sub-account" />
          </div>
          <div className="flex items-center gap-2 pt-1 text-[12px] text-v-ink400">
            <Users className="h-3.5 w-3.5" /> Visible to everyone with ledger access.
          </div>
        </div>
      </Drawer>
    </VioletSurface>
  );
}
