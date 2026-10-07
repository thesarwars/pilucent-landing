'use client';
import { useEffect, useState } from 'react';
import { FileText, Eye, X } from 'lucide-react';

/**
 * Renders the `files` array a recurring template returns on the details API
 * (`[{ uid, title, file }]`) as a list of view/remove chips. `onRemove` lets the
 * user drop a previously-uploaded file before saving; omit it for a read-only list.
 *
 * "View" opens the file in an in-app modal (iframe) instead of navigating to the
 * raw S3 link — so the browser stays on our own domain and the storage URL is
 * never surfaced in the address bar.
 */
const SavedAttachments = ({
  files,
  onRemove,
}: {
  files: any[];
  onRemove?: (uid: string) => void;
}) => {
  const [viewer, setViewer] = useState<any>(null);

  /* close on Escape and lock background scroll while the viewer is open */
  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setViewer(null);
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [viewer]);

  if (!files?.length) return null;

  return (
    <>
      <div className="mt-2 flex flex-col gap-1.5">
        {files.map((f: any) => (
          <div
            key={f.uid}
            className="flex items-center gap-2 rounded-v-input border border-v-border bg-v-wash2/50 px-2.5 py-1.5"
          >
            <FileText className="h-3.5 w-3.5 shrink-0 text-v-primary" />
            <span className="min-w-0 flex-1 truncate text-[12px] text-v-ink700">
              {f.title || 'Attachment'}
            </span>
            <button
              type="button"
              onClick={() => setViewer(f)}
              className="flex items-center gap-1 text-[11.5px] font-semibold text-v-primary transition-colors hover:text-v-primary-deep"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </button>
            {onRemove && (
              <button
                type="button"
                aria-label="Remove attachment"
                onClick={() => onRemove(f.uid)}
                className="flex h-6 w-6 items-center justify-center rounded-[7px] text-v-ink400 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {viewer && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setViewer(null)}
        >
          <div
            className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-v-card bg-white shadow-v-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-v-border px-4 py-2.5">
              <span className="flex min-w-0 items-center gap-2 text-[13px] font-semibold text-v-ink900">
                <FileText className="h-4 w-4 shrink-0 text-v-primary" />
                <span className="truncate">{viewer.title || 'Attachment'}</span>
              </span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setViewer(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-wash2 hover:text-v-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <iframe
              title={viewer.title || 'Attachment'}
              src={viewer.file}
              className="h-full w-full flex-1 border-0 bg-v-wash2"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SavedAttachments;
