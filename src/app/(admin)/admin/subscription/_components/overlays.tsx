'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SBtn } from './ui';

export type ToastTone = 'good' | 'bad' | 'brand' | 'info';

export interface ToastData {
  title: string;
  msg?: string;
  tone?: ToastTone;
}

const toastIcon = {
  good: CheckCircle2,
  bad: AlertTriangle,
  brand: Info,
  info: Info,
};

const toastTint: Record<ToastTone, string> = {
  good: 'bg-[#0FB67A]/20 text-[#0FB67A]',
  bad: 'bg-[#F2415A]/20 text-[#F2415A]',
  brand: 'bg-[#5B5BF0]/20 text-[#5B5BF0]',
  info: 'bg-[#2E8FF2]/20 text-[#2E8FF2]',
};

export function SToast({ data, onClose }: { data: ToastData | null; onClose: () => void }) {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [data, onClose]);

  if (!mounted || !data) return null;
  const tone = data.tone ?? 'brand';
  const Icon = toastIcon[tone];

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[3000] flex justify-center px-4">
      <div className="pointer-events-auto flex min-w-[340px] max-w-[440px] items-center gap-3 rounded-full bg-[#111935] px-4 py-3 text-white shadow-[0_20px_50px_-12px_rgba(0,0,0,.45)]">
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', toastTint[tone])}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="flex-1">
          <p className="text-[13.5px] font-semibold leading-tight">{data.title}</p>
          {data.msg && <p className="mt-0.5 text-[12px] leading-snug text-white/60">{data.msg}</p>}
        </div>
        <button type="button" onClick={onClose} className="text-white/50 transition-colors hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
}

export function SConfirmModal({
  config,
  onClose,
}: {
  config: ConfirmConfig | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !config) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2800] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[rgba(11,16,32,.5)] backdrop-blur-[4px]" onClick={onClose} />
      <div className="relative w-full max-w-[440px] rounded-3xl bg-white p-6 shadow-2xl">
        <div
          className={cn(
            'mb-4 flex h-11 w-11 items-center justify-center rounded-xl',
            config.danger ? 'bg-[#FDE5E9] text-[#F2415A]' : 'bg-[#ECECFE] text-[#5B5BF0]'
          )}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 className="text-[16px] font-bold text-[#0B1020]">{config.title}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-[#6B7090]">{config.message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <SBtn variant="ghost" onClick={onClose}>
            Cancel
          </SBtn>
          <SBtn
            variant={config.danger ? 'danger' : 'primary'}
            onClick={() => {
              config.onConfirm();
              onClose();
            }}
          >
            {config.confirmLabel ?? 'Confirm'}
          </SBtn>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function SFormModal({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
  width = 620,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}) {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[rgba(11,16,32,.5)] backdrop-blur-[4px]" onClick={onClose} />
      <div
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        style={{ maxWidth: width }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E7E8F2] px-6 py-5">
          <div>
            <h2 className="text-[16px] font-bold text-[#0B1020]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[12.5px] text-[#6B7090]">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#6B7090] hover:bg-[#EEF0F6]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-[#E7E8F2] px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function SDrawer({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
  width = 580,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}) {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={cn('fixed inset-0 z-[2700]', open ? '' : 'pointer-events-none')}>
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-[rgba(11,16,32,.5)] backdrop-blur-[4px] transition-opacity',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        className="absolute right-0 top-0 flex h-full max-w-[92vw] flex-col bg-[#F5F6FB] shadow-2xl transition-transform duration-300"
        style={{ width, transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E7E8F2] bg-white px-6 py-5">
          <div>
            <h2 className="text-[16px] font-bold text-[#0B1020]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[12.5px] text-[#6B7090]">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#6B7090] hover:bg-[#EEF0F6]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-[#E7E8F2] bg-white px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
