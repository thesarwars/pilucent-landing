'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import moment from 'moment';
import { useMutation } from '@tanstack/react-query';
import { Download, Pencil, Trash2, Paperclip, ImageIcon, FileText, Loader2, X } from 'lucide-react';
import { fetchAttachments, patchAttachment } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { DeleteData } from '@/services/FetchMethods';
import { toast } from '@/lib/ToastService';
import 'react-toastify/dist/ReactToastify.css';
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import Upload from './_components/Upload';

const isImage = (k?: string) => `${k || ''}`.toUpperCase() === 'IMAGE';

const Page = () => {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [updateUID, setUpdateUID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);

  const { data, isPending, refetch, setQueryParams } = useFetch(['attachment'], fetchAttachments);

  const rows: any[] = data?.results || data?.data || [];
  const count = data?.count ?? rows.length;

  const stats = useMemo(() => {
    const images = rows.filter((r) => isImage(r?.kind)).length;
    return { images, docs: rows.length - images };
  }, [rows]);

  const handleDownload = async (FileURL: any) => {
    try {
      const response = await fetch(FileURL.replace('http', 'https'));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = FileURL?.split('/').pop() || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  const { mutate: DeleteAttachment, isPending: isDeleting } = useMutation({
    mutationFn: async (uid: string) => {
      const res = await DeleteData(`we/attachments/${uid}`, '');
      return res;
    },
    onSuccess: () => {
      toast.success('Attachment deleted.');
      refetch();
    },
    onError: () => {
      setFile(null);
      toast.error('Something went wrong!');
    },
  });

  const handleUpdate = async (files: any) => {
    try {
      setIsLoading(true);
      if (files[0]?.size > 500 * 1024 * 1024) return toast.info('Max upload size is 500 MB');

      setShowUploadPopup(false);
      const formData = new FormData();
      formData.append('file', files[0]);

      const result = await patchAttachment(updateUID, formData, {
        timeout: 600000,
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(percentCompleted);
        },
      });
      if (result?.success) {
        refetch();
        setFile(null);
      }
    } catch (error) {
      // noop
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (deleteId: any) => {
    if (deleteId) DeleteAttachment(deleteId);
  };

  const handleEdit = (uid: any) => {
    setUpdateUID(uid);
    setShowUploadPopup(true);
  };

  const Kpi = ({
    icon,
    tone,
    value,
    label,
    bar,
    delay,
  }: {
    icon: React.ReactNode;
    tone: VioletTone;
    value: React.ReactNode;
    label: string;
    bar: string;
    delay: number;
  }) => (
    <div
      className="group relative animate-v-rise overflow-hidden rounded-[18px] bg-white p-[18px] shadow-v-card transition-shadow hover:shadow-v-tile-hover"
      style={{ animationDelay: `${delay}s` }}
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px] origin-top animate-v-grow-y"
        style={{ backgroundColor: bar }}
      />
      <IconChip tone={tone} size="lg">
        {icon}
      </IconChip>
      <div className="mt-3 truncate text-[22px] font-extrabold tabular-nums tracking-[-0.02em] text-v-ink900">
        {value}
      </div>
      <div className="text-[12px] font-medium text-v-ink500">{label}</div>
    </div>
  );

  const columns: VListColumn[] = [
    {
      key: 'file',
      label: 'Attachment',
      w: 'minmax(0,1.6fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          {isImage(row?.kind) && row?.file ? (
            <Image
              src={row.file}
              alt={row?.title || 'Thumbnail'}
              width={80}
              height={80}
              className="h-10 w-10 shrink-0 rounded-[10px] object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-v-tint100 text-v-primary">
              <FileText className="h-[18px] w-[18px]" />
            </span>
          )}
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold text-v-ink900">{row?.title || '—'}</div>
            <div className="truncate text-[11px] text-v-ink400">{row?.description || 'No note'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'kind',
      label: 'Type',
      w: '120px',
      render: (row) => (
        <Chip tone={isImage(row?.kind) ? 'teal' : 'violet'} dot>
          {row?.kind || '—'}
        </Chip>
      ),
    },
    {
      key: 'created_at',
      label: 'Uploaded',
      w: '180px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink500">
          {row?.created_at ? moment(row.created_at).format('DD MMM YYYY, HH:mm') : '—'}
        </span>
      ),
    },
    {
      key: 'link',
      label: 'Link',
      w: '90px',
      render: (row) =>
        row?.file ? (
          <a
            className="text-[12.5px] font-semibold text-v-primary hover:underline"
            href={row.file}
            target="_blank"
            rel="noreferrer"
          >
            Open
          </a>
        ) : (
          <span className="text-[12.5px] text-v-ink400">—</span>
        ),
    },
  ];

  const renderActions = (row: any) => (
    <>
      <button
        type="button"
        aria-label="Download"
        onClick={() => handleDownload(row?.file)}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
      >
        <Download className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Edit"
        onClick={() => handleEdit(row?.uid)}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete"
        disabled={isDeleting}
        onClick={() => handleDelete(row?.uid)}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg disabled:opacity-50"
      >
        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </>
  );

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {/* upload progress overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-v-card bg-white p-6 shadow-v-card">
            <h3 className="mb-4 text-[15px] font-bold text-v-ink900">Uploading…</h3>
            <div className="h-2.5 overflow-hidden rounded-full bg-v-wash2">
              <div
                className="h-full rounded-full bg-v-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="mt-2 text-center text-[12px] text-v-ink500">{uploadProgress}% complete</div>
          </div>
        </div>
      )}

      {/* header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Attachments' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            Attachments
          </h1>
          <Chip tone="violet">
            {count} {count === 1 ? 'file' : 'files'}
          </Chip>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Kpi
          icon={<Paperclip />}
          tone="violet"
          value={count}
          label="Total attachments"
          bar="#7C4DFF"
          delay={0.06}
        />
        <Kpi
          icon={<ImageIcon />}
          tone="teal"
          value={stats.images}
          label="Images"
          bar="#0E9F9F"
          delay={0.1}
        />
        <Kpi
          icon={<FileText />}
          tone="warn"
          value={stats.docs}
          label="Documents"
          bar="#B97608"
          delay={0.14}
        />
      </div>

      {/* uploader */}
      <Upload refetch={refetch} file={file} setFile={setFile} />

      {/* table */}
      <VioletListTable
        icon={<Paperclip />}
        title="All attachments"
        subtitle={(_shown, total) => `${total} ${total === 1 ? 'file' : 'files'}`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search attachments"
        renderActions={renderActions}
        actionLabel="Action"
        actionWidth="120px"
        emptyIcon={<Paperclip className="h-[19px] w-[19px]" />}
        emptyTitle="No attachments yet"
        emptySub="Upload a document or image to get started."
      />

      {/* edit-upload popup */}
      {showUploadPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
          <div className="relative w-full max-w-md rounded-v-card bg-white p-5 shadow-v-card">
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 text-v-ink400 transition-colors hover:text-v-ink900"
              onClick={() => setShowUploadPopup(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="mb-1 text-[16px] font-extrabold text-v-ink900">Replace file</h3>
            <p className="mb-4 text-[12.5px] text-v-ink400">
              Upload a new file to replace this attachment.
            </p>
            <div className="rounded-v-input border border-dashed border-v-primary bg-v-wash p-4">
              <p className="text-[12.5px] text-v-ink500">Click to browse and select a file.</p>
              <label
                htmlFor="file-update"
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-v-input border border-v-border bg-white px-3 py-2 text-[12.5px] font-semibold text-v-ink700 transition-colors hover:border-v-primary hover:text-v-primary"
              >
                Browse files
              </label>
              <input
                id="file-update"
                type="file"
                className="hidden"
                onChange={(e) => handleUpdate(e.target.files)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
