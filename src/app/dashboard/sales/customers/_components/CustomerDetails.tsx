'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { GetData } from '@/services/FetchMethods';
import { useRouter } from 'next/navigation';
import MainLoader from '@/components/MainLoader/MainLoader';
import Modal from '@/app/(admin)/_components/Modal';
import CreateCustomer from './CreateCustomer';
import TransactionsTable from './TransactionsTable';
import { encryptData } from '@/app/helpers/crypto';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  Chip,
  StatTile,
  VioletButton,
  money,
  avatarGradient,
  initials,
  type VioletTone,
} from '@/components/violet';
import {
  ArrowLeft,
  Plus,
  Pencil,
  CreditCard,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  StickyNote,
  Copy,
  Check,
  Receipt,
} from 'lucide-react';

function customerStatusMeta(status: string): { tone: VioletTone; label: string } {
  if (status === 'ACTIVE') return { tone: 'success', label: 'Active' };
  if (status === 'PENDING') return { tone: 'warn', label: 'On hold' };
  return { tone: 'neutral', label: 'Inactive' };
}

/* copyable contact row — clipboard write wrapped so an unfocused-iframe rejection is swallowed */
function CopyRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  const [copied, setCopied] = useState(false);
  const clean = (value || '').trim();
  const canCopy = !!clean && clean !== '—';
  const onCopy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(clean);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* swallow clipboard rejection (e.g. unfocused iframe) */
    }
  };
  return (
    <div className="group flex items-start gap-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink500">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-v-ink400">
          {label}
        </div>
        <div className="break-words text-[13px] font-medium text-v-ink900">{clean || '—'}</div>
      </div>
      {canCopy && (
        <button
          type="button"
          onClick={onCopy}
          title="Copy"
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-v-ink400 opacity-0 transition-all hover:bg-v-tint100 hover:text-v-primary group-hover:opacity-100"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-v-success-fg" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  );
}

const CustomerDetails = ({ id }: { id: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const {
    data: Customer,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['customer_details', id],
    queryFn: () => GetData(`we/customers/${id}`, ''),
  });

  if (isPending) {
    return <MainLoader color="#9ca3af" />;
  }

  const name = `${Customer?.first_name || ''} ${Customer?.middle_name || ''} ${
    Customer?.last_name || ''
  }`
    .replace(/\s+/g, ' ')
    .trim();
  const status = customerStatusMeta(Customer?.status);
  const openBalance = Number(Customer?.opening_balance) || 0;
  const addressLine = [
    Customer?.address?.street,
    Customer?.address?.city,
    Customer?.address?.province,
    Customer?.address?.postal_code,
    Customer?.address?.country,
  ]
    .filter(Boolean)
    .join(', ');

  const routeWithCustomer = (path: string) => {
    const enc = encryptData({
      uid: Customer?.uid,
      address: Customer?.address,
      first_name: Customer?.first_name,
      middle_name: Customer?.middle_name || '',
      last_name: Customer?.last_name || '',
      email: Customer?.email || '',
      currency: Customer?.currency || '',
    });
    router.push(`${path}?c=${enc}`);
  };

  return (
    <div className="font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sales', href: '/dashboard/sales/all_sales' },
          { label: 'Customers', href: '/dashboard/sales/customers' },
          { label: name || 'Customer' },
        ]}
      />

      {/* header */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink500 backdrop-blur-md transition-colors hover:text-v-primary"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          {name || 'Customer'}
        </h1>
        <Chip tone={status.tone}>{status.label}</Chip>

        <span className="flex-1" />

        <VioletButton
          variant="outline"
          leftIcon={<Pencil className="h-4 w-4" />}
          onClick={() => setIsOpen(true)}
        >
          Edit
        </VioletButton>
        <VioletButton
          variant="outline"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => routeWithCustomer('/dashboard/sales/all_sales/invoice')}
        >
          New invoice
        </VioletButton>
        <VioletButton
          variant="primary"
          leftIcon={<CreditCard className="h-4 w-4" />}
          onClick={() => routeWithCustomer('/dashboard/sales/all_sales/payment')}
        >
          Receive payment
        </VioletButton>
      </div>

      {/* two-column body */}
      <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* LEFT — sticky rail */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-0">
          {/* profile card */}
          <div className="animate-v-rise rounded-v-card bg-white p-5 shadow-v-card">
            <div className="flex flex-col items-center text-center">
              {Customer?.image ? (
                <Image
                  src={Customer.image}
                  width={160}
                  height={160}
                  alt={name}
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-white"
                />
              ) : (
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-full text-[20px] font-extrabold text-white ring-4 ring-white"
                  style={{ backgroundImage: avatarGradient(name || Customer?.uid || '?') }}
                >
                  {initials(name || '?')}
                </span>
              )}
              <div className="mt-3 text-[16px] font-extrabold text-v-ink900">{name || '—'}</div>
              {Customer?.company_name && (
                <div className="text-[12px] text-v-ink400">{Customer.company_name}</div>
              )}
            </div>

            <div className="my-4 border-t border-[rgba(22,23,42,0.07)]" />

            <div className="flex flex-col gap-3.5">
              <CopyRow icon={<Mail className="h-4 w-4" />} label="Email" value={Customer?.email} />
              <CopyRow icon={<Phone className="h-4 w-4" />} label="Phone" value={Customer?.mobile_number} />
              <CopyRow icon={<Globe className="h-4 w-4" />} label="Website" value={Customer?.website} />
              <CopyRow icon={<MapPin className="h-4 w-4" />} label="Address" value={addressLine} />
              <CopyRow
                icon={<Building2 className="h-4 w-4" />}
                label="Company"
                value={Customer?.company_name}
              />
              <CopyRow
                icon={<StickyNote className="h-4 w-4" />}
                label="Notes"
                value={Customer?.description}
              />
            </div>
          </div>

          {/* quick details */}
          <div className="animate-v-rise rounded-v-card bg-white p-5 shadow-v-card">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
              Quick details
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { label: 'Currency', value: Customer?.currency || '—' },
                { label: 'Open balance', value: money(openBalance) },
                { label: 'Country', value: Customer?.address?.country || '—' },
                { label: 'Status', value: status.label },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-2">
                  <span className="text-[12px] text-v-ink400">{row.label}</span>
                  <span className="text-right text-[13px] font-bold tabular-nums text-v-ink900">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — main */}
        <div className="flex min-w-0 flex-col gap-4">
          {/* position stats */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <StatTile
              tone="danger"
              icon={<CreditCard />}
              value={money(openBalance)}
              label="Open balance"
              sub="What they owe you"
              delay={0}
            />
            <StatTile
              tone="teal"
              icon={<Globe />}
              value={Customer?.currency || '—'}
              label="Currency"
              sub="Billing currency"
              delay={0.05}
            />
            <StatTile
              tone={status.tone}
              icon={<Receipt />}
              value={status.label}
              label="Account status"
              sub="Current standing"
              delay={0.1}
            />
          </div>

          {/* transactions ledger */}
          <TransactionsTable customer={Customer} uid={id} />
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        widthClass="w-full md:w-[700px]"
        title="Edit Customer"
      >
        <CreateCustomer setIsOpen={setIsOpen} uid={Customer?.uid} refetch={refetch} />
      </Modal>
    </div>
  );
};

export default CustomerDetails;
