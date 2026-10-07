'use client';

import type React from 'react';

import { useState } from 'react';
import {
  FileText,
  Users,
  Download,
  Plus,
  Edit3,
  Eye,
  Share2,
  Trash2,
  Archive,
  LayoutTemplateIcon as Template,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Avatar,
  Breadcrumb,
  Chip,
  StatTile,
  VioletButton,
  VioletCard,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';

type PageType = 'documents' | 'shared' | 'templates' | 'bulk-downloads';

const TABS: { id: PageType; label: string; icon: typeof FileText }[] = [
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'shared', label: 'Shared', icon: Users },
  { id: 'templates', label: 'Templates', icon: Template },
  { id: 'bulk-downloads', label: 'Bulk downloads', icon: Download },
];

const ACTION: Record<PageType, string> = {
  documents: 'Upload document',
  shared: 'Add document',
  templates: 'Create template',
  'bulk-downloads': 'Create archive',
};

const typeTone = (type: string): VioletTone => {
  switch (type) {
    case 'form':
      return 'violet';
    case 'tax':
      return 'success';
    case 'banking':
      return 'teal';
    case 'HR':
      return 'rose';
    case 'Legal':
      return 'warn';
    default:
      return 'neutral';
  }
};

const statusTone = (status: string): VioletTone => {
  switch (status) {
    case 'active':
    case 'completed':
      return 'success';
    case 'processing':
      return 'warn';
    case 'inactive':
    case 'failed':
      return 'danger';
    default:
      return 'neutral';
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'active':
    case 'completed':
      return <CheckCircle className="h-3.5 w-3.5" />;
    case 'processing':
      return <Clock className="h-3.5 w-3.5" />;
    case 'inactive':
    case 'failed':
      return <XCircle className="h-3.5 w-3.5" />;
    default:
      return <AlertCircle className="h-3.5 w-3.5" />;
  }
};

// Sample data
const documents = [
  {
    id: 1,
    name: 'Employment eligibility (Form I-9)',
    description:
      "Verifies your employee's identity and work eligibility (must be completed onsite)",
    uploader: 'Gusto',
    status: 'active',
    type: 'form',
    date: '2024-01-15',
  },
  {
    id: 2,
    name: 'Tax withholding (Form W-4)',
    description: "Records your employee's federal withholding allowance",
    uploader: 'Gusto',
    status: 'active',
    type: 'tax',
    date: '2024-01-14',
  },
  {
    id: 3,
    name: 'Direct deposit authorization',
    description: 'Lets you pay your employee via direct deposit',
    uploader: 'Gusto',
    status: 'active',
    type: 'banking',
    date: '2024-01-13',
  },
  {
    id: 4,
    name: 'Taxpayer Identification (Form W-9)',
    description: "Verifies your contractor's identity for tax purposes",
    uploader: 'Gusto',
    status: 'active',
    type: 'tax',
    date: '2024-01-12',
  },
];

const templates = [
  {
    id: 1,
    name: 'Employee Onboarding Checklist',
    description: 'Complete checklist for new employee setup',
    category: 'HR',
    uses: 45,
    lastModified: '2024-01-10',
  },
  {
    id: 2,
    name: 'Contractor Agreement Template',
    description: 'Standard contractor agreement with customizable terms',
    category: 'Legal',
    uses: 23,
    lastModified: '2024-01-08',
  },
  {
    id: 3,
    name: 'Performance Review Form',
    description: 'Annual performance evaluation template',
    category: 'HR',
    uses: 67,
    lastModified: '2024-01-05',
  },
];

const bulkDownloads = [
  {
    id: 1,
    name: 'Q4 2023 Employee Documents',
    fileCount: 156,
    size: '45.2 MB',
    status: 'completed',
    createdAt: '2024-01-15',
    downloadUrl: '#',
  },
  {
    id: 2,
    name: 'Tax Forms Archive',
    fileCount: 89,
    size: '23.7 MB',
    status: 'processing',
    createdAt: '2024-01-14',
    progress: 65,
  },
  {
    id: 3,
    name: 'Contractor Agreements',
    fileCount: 34,
    size: '12.1 MB',
    status: 'failed',
    createdAt: '2024-01-13',
    error: 'Access denied for some files',
  },
];

const RowAction = ({
  icon,
  label,
  tone = 'violet',
}: {
  icon: React.ReactNode;
  label: string;
  tone?: 'violet' | 'danger';
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cn(
      'flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors',
      tone === 'danger'
        ? 'hover:bg-v-danger-bg hover:text-v-danger-fg'
        : 'hover:bg-v-tint100 hover:text-v-primary'
    )}
  >
    {icon}
  </button>
);

const Page = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('documents');

  /* ── Documents ─────────────────────────────────────────────────────── */
  const documentColumns: VListColumn[] = [
    {
      key: 'name',
      label: 'Name',
      w: 'minmax(0,2fr)',
      locked: true,
      render: (row) => (
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold text-v-ink900">{row.name}</div>
          <div className="truncate text-[11.5px] text-v-ink400">{row.description}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      w: '130px',
      render: (row) => (
        <Chip tone={typeTone(row.type)} icon={<Edit3 className="h-3 w-3" />}>
          {row.type}
        </Chip>
      ),
    },
    {
      key: 'date',
      label: 'Modified',
      w: '130px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">{row.date}</span>
      ),
    },
  ];

  const documentActions = () => (
    <>
      <RowAction icon={<Eye className="h-4 w-4" />} label="View" />
      <RowAction icon={<Download className="h-4 w-4" />} label="Download" />
      <RowAction icon={<Share2 className="h-4 w-4" />} label="Share" />
    </>
  );

  /* ── Shared ────────────────────────────────────────────────────────── */
  const sharedColumns: VListColumn[] = [
    {
      key: 'name',
      label: 'Name',
      w: 'minmax(0,2fr)',
      locked: true,
      render: (row) => (
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <Chip tone={typeTone(row.type)} icon={<Edit3 className="h-3 w-3" />}>
              {row.type}
            </Chip>
            <span className="truncate text-[13px] font-bold text-v-ink900">{row.name}</span>
          </div>
          <p className="truncate text-[11.5px] text-v-ink400">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'uploader',
      label: 'Uploaded by',
      w: 'minmax(0,1fr)',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={row.uploader || '?'} size={28} />
          <span className="truncate text-[12.5px] font-semibold text-v-ink900">
            {row.uploader}
          </span>
        </div>
      ),
    },
  ];

  /* ── Bulk downloads ────────────────────────────────────────────────── */
  const bulkColumns: VListColumn[] = [
    {
      key: 'name',
      label: 'Archive name',
      w: 'minmax(0,1.6fr)',
      locked: true,
      render: (row) => (
        <div className="min-w-0">
          <div className="truncate text-[13px] font-bold text-v-ink900">{row.name}</div>
          <div className="text-[11.5px] text-v-ink400">Created {row.createdAt}</div>
        </div>
      ),
    },
    {
      key: 'fileCount',
      label: 'Files',
      w: '90px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">{row.fileCount}</span>
      ),
    },
    {
      key: 'size',
      label: 'Size',
      w: '110px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">{row.size}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      w: '170px',
      render: (row) => (
        <div className="min-w-0">
          <Chip tone={statusTone(row.status)} icon={statusIcon(row.status)} className="capitalize">
            {row.status}
          </Chip>
          {row.status === 'processing' && typeof row.progress === 'number' && (
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-v-wash2">
              <div
                className="h-full origin-left animate-v-grow rounded-full bg-v-warn-fg"
                style={{ width: `${row.progress}%` }}
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  const bulkActions = (row: any) => (
    <>
      {row.status === 'completed' && (
        <RowAction icon={<Download className="h-4 w-4" />} label="Download archive" />
      )}
      <RowAction icon={<Trash2 className="h-4 w-4" />} label="Delete archive" tone="danger" />
    </>
  );

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {/* header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Admin', href: '#' },
            { label: 'Documents' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Doc Manager
          </h1>
          <span className="flex-1" />
          <VioletButton variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
            {ACTION[currentPage]}
          </VioletButton>
        </div>
      </div>

      {/* section tabs */}
      <div className="flex flex-wrap items-center gap-1 self-start rounded-full bg-v-wash2 p-1">
        {TABS.map((t) => {
          const active = currentPage === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setCurrentPage(t.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
                active ? 'bg-white text-v-primary shadow-sm' : 'text-v-ink500 hover:text-v-ink900'
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* documents */}
      {currentPage === 'documents' && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile icon={<FileText />} tone="violet" value="156" label="Total documents" delay={0} />
            <StatTile icon={<Users />} tone="teal" value="89" label="Shared" delay={0.05} />
            <StatTile icon={<Template />} tone="success" value="23" label="Templates" delay={0.1} />
            <StatTile icon={<Archive />} tone="warn" value="44" label="Archives" delay={0.15} />
          </div>

          <VioletListTable
            icon={<FileText />}
            title="All documents"
            subtitle={(shown, total) => `${shown} of ${total} ${total === 1 ? 'document' : 'documents'}`}
            data={{ results: documents }}
            clientSide
            searchFn={(row, q) =>
              `${row.name} ${row.description} ${row.type}`.toLowerCase().includes(q.toLowerCase())
            }
            columns={documentColumns}
            renderActions={documentActions}
            actionLabel="Actions"
            actionWidth="120px"
            searchPlaceholder="Search documents"
            emptyIcon={<FileText className="h-[19px] w-[19px]" />}
            emptyTitle="No documents yet"
            emptySub="Upload a document or adjust your search to see results here."
          />
        </>
      )}

      {/* shared */}
      {currentPage === 'shared' && (
        <VioletListTable
          icon={<Users />}
          title="Shared documents"
          subtitle={(shown, total) => `${shown} of ${total} shared`}
          data={{ results: documents }}
          clientSide
          searchFn={(row, q) =>
            `${row.name} ${row.description} ${row.uploader}`.toLowerCase().includes(q.toLowerCase())
          }
          columns={sharedColumns}
          searchPlaceholder="Search shared documents"
          emptyIcon={<Users className="h-[19px] w-[19px]" />}
          emptyTitle="Nothing shared yet"
          emptySub="Shared documents will appear here."
        />
      )}

      {/* templates */}
      {currentPage === 'templates' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, i) => (
            <VioletCard
              key={template.id}
              className="animate-v-pop flex flex-col gap-3 p-5 transition-shadow hover:shadow-v-tile-hover"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <Chip tone={typeTone(template.category)}>{template.category}</Chip>
                <div className="flex items-center gap-1">
                  <RowAction icon={<Eye className="h-4 w-4" />} label="Preview" />
                  <RowAction icon={<Share2 className="h-4 w-4" />} label="Share" />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-extrabold tracking-[-0.01em] text-v-ink900">
                  {template.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-[12.5px] text-v-ink500">
                  {template.description}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-[rgba(22,23,42,0.06)] pt-3 text-[11.5px] font-semibold text-v-ink400">
                <span className="tabular-nums">Used {template.uses} times</span>
                <span className="tabular-nums">Modified {template.lastModified}</span>
              </div>
            </VioletCard>
          ))}
        </div>
      )}

      {/* bulk downloads */}
      {currentPage === 'bulk-downloads' && (
        <VioletListTable
          icon={<Download />}
          title="Bulk downloads"
          subtitle={(shown, total) => `${shown} of ${total} ${total === 1 ? 'archive' : 'archives'}`}
          data={{ results: bulkDownloads }}
          clientSide
          searchFn={(row, q) => `${row.name}`.toLowerCase().includes(q.toLowerCase())}
          columns={bulkColumns}
          renderActions={bulkActions}
          actionLabel="Actions"
          actionWidth="100px"
          searchPlaceholder="Search archives"
          emptyIcon={<FolderOpen className="h-[19px] w-[19px]" />}
          emptyTitle="No archives yet"
          emptySub="Create an archive to download multiple documents at once."
        />
      )}
    </div>
  );
};

export default Page;
