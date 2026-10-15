'use client';

import * as React from 'react';
import { BookOpen, CreditCard, Eye, FileText, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, VioletButton } from '@/components/violet';
import { toast } from '@/lib/ToastService';
import * as api from '../api';
import { useDocuments, useEmployeeMutation } from '../hooks';
import { useLang } from '../i18n';
import type { DocumentContent, DocumentKind, DocumentSummary, TabId } from '../types';
import { Chip, ErrorBlock, LoadingBlock, Note, Section } from '../ui';

const ICONS: Record<DocumentKind['kind'], React.ReactNode> = {
  SERVICE_BOOK: <BookOpen className="h-4 w-4" />,
  APPOINTMENT_LETTER: <FileText className="h-4 w-4" />,
  ID_CARD: <CreditCard className="h-4 w-4" />,
};

/** Which tab holds each field a document needs. */
const FIELD_TAB: Record<string, TabId> = {
  'f-fatherName': 'personal',
  'f-motherName': 'personal',
  'f-nid': 'personal',
  'f-permAddr': 'personal',
  'f-photo': 'personal',
  'f-doj': 'employment',
  'f-designation': 'employment',
  salary: 'salary',
};

export function DocumentsTab({ code, goTo }: { code: string; goTo: (tab: TabId, field?: string | null) => void }) {
  const { date, n } = useLang();
  const docs = useDocuments(code);
  const issue = useEmployeeMutation(code, (kind: DocumentKind['kind']) => api.issueDocument(code, kind));
  const [viewing, setViewing] = React.useState<DocumentSummary | null>(null);

  if (docs.isPending) return <LoadingBlock />;
  if (docs.isError) return <ErrorBlock error={docs.error} onRetry={() => void docs.refetch()} />;

  const run = async (kind: DocumentKind) => {
    try {
      const doc = await issue.mutateAsync(kind.kind);
      toast.success(`${kind.label} ${kind.issued ? 'reissued' : 'issued'} (version ${doc.version})`);
      setViewing(doc);
    } catch (err) {
      if (err instanceof api.ApiError) toast.error(err.errors.flatMap((x) => x.messages).join(' ') || err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {docs.data.kinds.map((k) => (
          <div key={k.kind} className="bd-section flex flex-col">
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className={cn('flex h-9 w-9 items-center justify-center rounded-xl', k.issued ? 'bg-[rgba(124,77,255,0.12)] text-[#6B3FE8]' : 'bg-[rgba(244,63,94,0.1)] text-[#E11D48]')}>
                {ICONS[k.kind]}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="bd-section-title">{k.label}</h2>
                <div className="text-[11.5px] text-[#6E6883]">
                  {k.latest ? `Version ${n(k.latest.version)} · ${date(k.latest.issuedOn)} · ${k.latest.issuedBy || '—'}` : 'Not issued'}
                </div>
              </div>
              <Chip tone={k.issued ? 'ok' : 'blocked'} dot>
                {k.issued ? 'Issued' : 'Missing'}
              </Chip>
            </div>
            {k.missing.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="bd-colhead">Needed first</div>
                {k.missing.map((m) => (
                  <button
                    key={m.field + m.message}
                    type="button"
                    onClick={() => goTo(FIELD_TAB[m.field] ?? 'personal', m.field)}
                    className="block w-full rounded-lg px-2 py-1 text-left text-[12px] font-semibold text-[#E11D48] hover:bg-[rgba(244,63,94,0.06)]"
                  >
                    {m.message} →
                  </button>
                ))}
              </div>
            )}
            <span className="flex-1" />
            <div className="mt-4 flex gap-2">
              <VioletButton size="sm" disabled={!k.ready || issue.isPending} onClick={() => void run(k)}>
                {k.issued ? 'Reissue' : 'Issue'}
              </VioletButton>
              {k.latest && (
                <VioletButton
                  variant="outline"
                  size="sm"
                  leftIcon={<Eye className="h-3.5 w-3.5" />}
                  onClick={() => setViewing(docs.data.documents.find((d) => d.uid === k.latest!.uid) ?? null)}
                >
                  View
                </VioletButton>
              )}
            </div>
          </div>
        ))}
      </div>

      <Section title="Issued documents" desc="Every version as it was issued. A reissue is a new version; the old one is kept.">
        {docs.data.documents.length === 0 ? (
          <div className="py-6 text-center text-[12.5px] text-[#6E6883]">Nothing issued yet.</div>
        ) : (
          <div className="divide-y divide-[rgba(22,23,42,0.06)]">
            {docs.data.documents.map((d) => (
              <div key={d.uid} className="flex items-center gap-3 py-2.5 text-[12.5px]">
                <span aria-hidden="true" className="text-[#6E6883]">{ICONS[d.kind as DocumentKind['kind']]}</span>
                <span className="font-semibold text-v-ink900">{d.content?.titleEn ?? d.kind}</span>
                <Chip tone="neutral" className="!px-2 !py-0 !text-[10px]">
                  v{n(d.version)}
                </Chip>
                <span className="text-[#6F6A85]">
                  <span className="bd-mono">{date(d.issuedOn)}</span> · {d.issuedBy || '—'}
                </span>
                <span className="flex-1" />
                <VioletButton variant="ghost" size="sm" onClick={() => setViewing(d)}>
                  View
                </VioletButton>
              </div>
            ))}
          </div>
        )}
      </Section>

      {viewing?.content && <DocumentViewer doc={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function Pair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 border-b border-[rgba(22,23,42,0.05)] py-1.5 text-[12.5px]">
      <span className="w-40 shrink-0 text-v-ink500">{label}</span>
      <span className="min-w-0 flex-1 font-semibold text-v-ink900">{value || '—'}</span>
    </div>
  );
}

const shown = (v: unknown): string => {
  if (v && typeof v === 'object' && 'display' in (v as Record<string, unknown>)) {
    return ((v as { display: { en: string } }).display?.en ?? '—') as string;
  }
  return v === null || v === undefined || v === '' ? '—' : String(v);
};

export function DocumentViewer({ doc, onClose }: { doc: DocumentSummary; onClose: () => void }) {
  const { lang, n, money } = useLang();
  const c = doc.content as DocumentContent;
  const e = c.employee as Record<string, unknown>;
  const job = (c.employment ?? {}) as Record<string, unknown>;

  return (
    <Modal
      open
      onClose={onClose}
      width={760}
      title={lang === 'bn' ? c.titleBn : c.titleEn}
      sub={`Version ${n(doc.version)} · issued ${c.issuedOn.display[lang]} · ${c.citation ?? ''}`}
      footer={
        <>
          <span className="flex-1 text-[11.5px] text-[#6E6883]">Frozen as issued. Reissue to reflect later changes.</span>
          <VioletButton variant="outline" size="sm" leftIcon={<Printer className="h-3.5 w-3.5" />} onClick={() => window.print()}>
            Print
          </VioletButton>
        </>
      }
    >
      {!c.verified && (
        <Note tone="warn" className="mb-3">
          This layout has not yet been verified against the gazette form.
        </Note>
      )}
      <div className="mb-3 rounded-xl bg-v-wash px-3.5 py-2.5">
        <div className="text-[14px] font-bold text-v-ink900">{c.employer.name}</div>
        {c.employer.address && <div className="text-[12px] text-v-ink500">{c.employer.address}</div>}
      </div>

      {c.template === 'ID_CARD' ? (
        <div className="mx-auto flex max-w-sm gap-4 rounded-2xl border border-[rgba(22,23,42,0.1)] p-4">
          {c.employee.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.employee.photo} alt="" className="h-28 w-24 rounded-xl object-cover" />
          ) : (
            <div className="flex h-28 w-24 items-center justify-center rounded-xl bg-v-wash2 text-[11px] text-[#6E6883]">No photo</div>
          )}
          <div className="min-w-0 text-[12.5px]">
            <div className="text-[15px] font-bold text-v-ink900">{c.employee.nameEn}</div>
            {c.employee.nameBn && (
              <div lang="bn" className="text-[13px] text-v-ink700">
                {c.employee.nameBn}
              </div>
            )}
            <div className="mt-1 bd-mono text-v-ink700">{c.employee.code}</div>
            <div className="mt-1 text-v-ink500">{shown(job.designation)}</div>
            <div className="text-v-ink500">{shown(job.department)}</div>
            <div className="mt-1 text-v-ink500">Blood: {shown(e.blood)}</div>
            {c.emergency && (
              <div className="text-v-ink500">
                Emergency: {c.emergency.name || '—'} {c.emergency.phone}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <Pair label="Name" value={c.employee.nameEn} />
            {c.employee.nameBn && <Pair label="Name (Bangla)" value={<span lang="bn">{c.employee.nameBn}</span>} />}
            <Pair label="Code" value={c.employee.code} />
            <Pair label="Father's name" value={shown(e.fatherName)} />
            <Pair label="Mother's name" value={shown(e.motherName)} />
            <Pair label="Date of birth" value={shown(e.dob)} />
            <Pair label="National ID" value={shown(e.nid)} />
            <Pair label="Permanent address" value={shown(e.permanentAddress)} />
            <Pair label="Designation" value={shown(job.designation)} />
            <Pair label="Department" value={shown(job.department)} />
            <Pair label="Classification" value={shown(job.classification)} />
            <Pair label="Date of joining" value={shown(job.doj)} />
            {c.noticeDays && <Pair label="Notice period" value={`${n(c.noticeDays.value)} days`} />}
          </div>
          {c.wage && (
            <div className="mb-3 rounded-2xl border border-[rgba(22,23,42,0.08)] p-3.5">
              <div className="mb-1.5 text-[12.5px] font-bold text-v-ink900">Wage (from {c.wage.effectiveFrom.display[lang]})</div>
              {c.wage.components.map((w) => (
                <div key={w.code} className="grid grid-cols-[1.3fr_1fr_1fr] py-1 text-[12px]">
                  <span className="text-v-ink700">{w.name}</span>
                  <span className="text-v-ink500">{w.basis}</span>
                  <span className="text-right font-semibold bd-mono text-v-ink900">{money(w.amount)}</span>
                </div>
              ))}
              <div className="mt-1 flex justify-between border-t border-[rgba(22,23,42,0.1)] pt-1.5 text-[13px] font-bold">
                <span>Gross</span>
                <span className="bd-mono">{c.wage.gross.display[lang]}</span>
              </div>
              <div lang={lang} className="mt-1 text-[12px] font-semibold text-v-ink700">
                {c.wage.gross.words[lang]}
              </div>
            </div>
          )}
          {c.entries && (
            <div className="rounded-2xl border border-[rgba(22,23,42,0.08)] p-3.5">
              <div className="mb-1.5 text-[12.5px] font-bold text-v-ink900">Service record</div>
              {c.entries.length === 0 && <div className="text-[12px] text-[#6E6883]">No changes recorded.</div>}
              {c.entries.map((x) => (
                <div key={x.serial} className="grid grid-cols-[28px_1fr_1fr_1.6fr] gap-2 border-b border-[rgba(22,23,42,0.05)] py-1.5 text-[11.5px]">
                  <span className="text-[#6E6883]">{n(x.serial)}</span>
                  <span className="font-semibold text-v-ink900">{x.particular}</span>
                  <span className="text-v-ink500">{x.effectiveFrom.display[lang]}</span>
                  <span className="text-v-ink700">
                    {x.from} → {x.to}
                    {x.reason && <span className="block text-[#6E6883]">{x.reason}</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
