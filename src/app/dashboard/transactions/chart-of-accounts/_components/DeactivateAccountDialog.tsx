'use client';

/**
 * "Make inactive" flow for `POST /we/chart-of-accounts/{uid}/deactivate`.
 *
 * Per the COA API spec (§5, corrected by §10.1): the refusal gate is the
 * account's `system_key`, which the client never sees — NOT `is_fixed`. So
 * this dialog is offered on every non-fixed-looking... no: it is offered
 * unconditionally (even on accounts the list marks `is_fixed`, since most
 * `is_fixed` accounts are NOT control accounts and CAN be deactivated) and the
 * four refusal codes (COA-150/151/152/153) are handled after the attempt,
 * never predicted beforehand.
 */

import * as React from 'react';
import { AlertTriangle, Ban, Layers, Loader2, Wallet } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { postDeactivateAccount } from '@/app/helpers/backend';
import { parseDeactivateError, type ParsedDeactivateError } from '@/lib/helpers/apiErrors';
import { Modal, VioletButton, money } from '@/components/violet';

export interface DeactivateAccountDialogProps {
  open: boolean;
  onClose: () => void;
  uid: string;
  title: string;
  onDone?: () => void;
}

export function DeactivateAccountDialog({
  open,
  onClose,
  uid,
  title,
  onDone,
}: DeactivateAccountDialogProps) {
  const [refusal, setRefusal] = React.useState<ParsedDeactivateError | null>(null);

  const run = useMutation({
    mutationFn: (cascade: boolean) => postDeactivateAccount(uid, cascade ? { cascade: true } : {}),
    onSuccess: () => {
      toast.success(`${title} is now inactive.`);
      onDone?.();
      onClose();
    },
    onError: (err: any) => {
      setRefusal(parseDeactivateError(err?.response?.data));
    },
  });

  // Reset per-open so a previous refusal doesn't flash on the next account.
  React.useEffect(() => {
    if (open) setRefusal(null);
  }, [open, uid]);

  const busy = run.isPending;

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      icon={<Ban />}
      iconTone={refusal ? 'warn' : 'violet'}
      title="Make inactive"
      sub={title}
      width={460}
      footer={
        !refusal ? (
          <>
            <VioletButton variant="outline" className="flex-1" onClick={onClose} disabled={busy}>
              Cancel
            </VioletButton>
            <VioletButton
              className="flex-1"
              onClick={() => run.mutate(false)}
              disabled={busy}
              leftIcon={busy ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              {busy ? 'Deactivating…' : 'Make inactive'}
            </VioletButton>
          </>
        ) : refusal.code === 'COA-152' && refusal.children?.length ? (
          <>
            <VioletButton variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </VioletButton>
            <VioletButton
              className="flex-1"
              onClick={() => run.mutate(true)}
              disabled={busy}
              leftIcon={busy ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              {busy ? 'Deactivating…' : `Deactivate with ${refusal.children.length} sub-account${refusal.children.length === 1 ? '' : 's'}`}
            </VioletButton>
          </>
        ) : (
          <VioletButton variant="outline" className="flex-1" onClick={onClose}>
            Close
          </VioletButton>
        )
      }
    >
      {!refusal ? (
        <p className="text-[13.5px] leading-relaxed text-v-ink700">
          <strong>{title}</strong> will be hidden from new documents. Its balance, history and
          place in every report are kept, and you can make it active again at any time.
        </p>
      ) : (
        <RefusalBody refusal={refusal} />
      )}
    </Modal>
  );
}

function RefusalBody({ refusal }: { refusal: ParsedDeactivateError }) {
  if (refusal.code === 'COA-150') {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 rounded-v-input border border-v-warn-bg bg-v-warn-bg px-3.5 py-3">
          <Wallet className="h-4 w-4 shrink-0 text-v-warn-fg" />
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-v-warn-fg">Still holds a balance</div>
            {typeof refusal.balance === 'number' && (
              <div className="text-[13px] tabular-nums text-v-ink700">{money(refusal.balance)}</div>
            )}
          </div>
        </div>
        <p className="text-[13px] leading-relaxed text-v-ink500">
          Clear this account's balance before deactivating it.
        </p>
      </div>
    );
  }

  if (refusal.code === 'COA-151') {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[13px] text-v-ink500">
          Live settings still point at this account. Repoint each of these before deactivating:
        </p>
        <div className="flex flex-col gap-2">
          {(refusal.references ?? []).map((r, i) => (
            <div key={i} className="rounded-v-input border border-v-border bg-v-card-subtle px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-v-ink900">{r.label}</span>
                <span className="text-[11.5px] font-bold tabular-nums text-v-ink400">{r.count}</span>
              </div>
              {r.sample?.length > 0 && (
                <div className="mt-1 truncate text-[11.5px] text-v-ink400">{r.sample.join(', ')}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (refusal.code === 'COA-152') {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[13px] text-v-ink500">
          This account has active sub-accounts. Deactivating it can retire them too — children
          are always retired before their parent, so the tree is never left inconsistent.
        </p>
        <div className="flex flex-col gap-1.5">
          {(refusal.children ?? []).map((c) => (
            <div
              key={c.uid}
              className="flex items-center gap-2 rounded-v-input border border-v-border bg-v-card-subtle px-3.5 py-2"
            >
              <Layers className="h-3.5 w-3.5 shrink-0 text-v-ink400" />
              <span className="truncate text-[13px] text-v-ink900">{c.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (refusal.code === 'COA-153') {
    return (
      <div className="flex items-start gap-2.5 rounded-v-input border border-v-danger-bg bg-v-danger-bg px-3.5 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-v-danger-fg" />
        <p className="text-[13px] leading-relaxed text-v-danger-fg">
          This is a control account the ledger posts to — it can never be retired.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 rounded-v-input border border-v-danger-bg bg-v-danger-bg px-3.5 py-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-v-danger-fg" />
      <p className="text-[13px] leading-relaxed text-v-danger-fg">{refusal.message}</p>
    </div>
  );
}
