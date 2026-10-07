'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { SConfirmModal, SToast, type ConfirmConfig, type ToastData } from './overlays';

interface SaContextValue {
  toast: (title: string, msg?: string, tone?: ToastData['tone']) => void;
  confirm: (config: Omit<ConfirmConfig, 'onConfirm'> & { onConfirm: () => void }) => void;
  exportCsv: (filename: string, headers: string[], rows: string[][]) => void;
}

const SaContext = createContext<SaContextValue | null>(null);

export function useSa() {
  const ctx = useContext(SaContext);
  if (!ctx) throw new Error('useSa must be used within SaProvider');
  return ctx;
}

export function SaProvider({ children }: { children: React.ReactNode }) {
  const [toastData, setToastData] = useState<ToastData | null>(null);
  const [confirmData, setConfirmData] = useState<ConfirmConfig | null>(null);

  const toast = useCallback((title: string, msg?: string, tone?: ToastData['tone']) => {
    setToastData({ title, msg, tone: tone ?? 'brand' });
  }, []);

  const confirm = useCallback((config: ConfirmConfig) => {
    setConfirmData(config);
  }, []);

  const exportCsv = useCallback((filename: string, headers: string[], rows: string[][]) => {
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast('Export complete', `${filename} downloaded`, 'good');
  }, [toast]);

  return (
    <SaContext.Provider value={{ toast, confirm, exportCsv }}>
      {children}
      <SToast data={toastData} onClose={() => setToastData(null)} />
      <SConfirmModal config={confirmData} onClose={() => setConfirmData(null)} />
    </SaContext.Provider>
  );
}
