'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Info, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToastData } from './nav';

/* ------------------------------------------------------------------ *
 * Toast — bottom-center dark pill.
 * ------------------------------------------------------------------ */
const toastIcon = { success: CheckCircle2, info: Info, error: AlertTriangle, primary: Sparkles };
const toastTint: Record<ToastData['tone'], string> = {
  success: 'bg-[#1FA97A]/20 text-[#5ee3b6]',
  info: 'bg-[#3B82F6]/20 text-[#93b9fb]',
  error: 'bg-[#EF4444]/20 text-[#f7a3a3]',
  primary: 'bg-[#7C4DFF]/25 text-[#c4abff]',
};

export const Toast = ({ data, onClose }: { data: ToastData | null; onClose: () => void }) => {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!data) return;
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [data, onClose]);

  if (!mounted || !data) return null;
  const Icon = data.icon || toastIcon[data.tone];

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[2000] flex justify-center px-4">
      <div className="pointer-events-auto flex min-w-[340px] max-w-[440px] items-center gap-3 rounded-2xl bg-[#0E1020] px-4 py-3.5 text-white shadow-[0_20px_50px_-12px_rgba(0,0,0,.5)] animate-[bzslideup_.32s_ease]">
        <span className={cn('flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl', toastTint[data.tone])}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="flex-1">
          <p className="text-[14.5px] font-bold leading-tight">{data.title}</p>
          {data.msg && <p className="mt-0.5 text-[12.5px] leading-snug text-white/60">{data.msg}</p>}
        </div>
        <button onClick={onClose} className="text-white/50 transition-colors hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
      <style>{`@keyframes bzslideup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>,
    document.body
  );
};

/* ------------------------------------------------------------------ *
 * Drawer — right-anchored sliding panel.
 * ------------------------------------------------------------------ */
export const Drawer = ({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
  width = 500,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}) => {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={cn('fixed inset-0 z-[1500]', open ? '' : 'pointer-events-none')}>
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-[rgba(14,16,32,.42)] backdrop-blur-[3px] transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        className="absolute right-0 top-0 flex h-full max-w-[92vw] flex-col bg-white shadow-2xl transition-transform duration-[.34s] [transition-timing-function:cubic-bezier(.3,.9,.3,1)]"
        style={{ width, transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(22,23,42,0.07)] px-6 py-5">
          <div>
            <h2 className="text-[21px] font-extrabold tracking-[-0.3px] text-[#16172A]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[13.5px] text-[#6F6A85]">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#6F6A85] transition-colors hover:bg-[#F4F1FF]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-[rgba(22,23,42,0.07)] px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

/* ------------------------------------------------------------------ *
 * Modal — centered dialog.
 * ------------------------------------------------------------------ */
export const Modal = ({
  open,
  onClose,
  children,
  width = 580,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) => {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1600] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-[rgba(14,16,32,.5)] backdrop-blur-[4px]" />
      <div
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl animate-[bzscalein_.3s_ease]"
        style={{ maxWidth: width }}
      >
        {children}
      </div>
      <style>{`@keyframes bzscalein{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>,
    document.body
  );
};
