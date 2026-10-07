'use client';

import React, { createContext, useContext } from 'react';

export type Route =
  | 'overview'
  | 'plans'
  | 'addons'
  | 'referral'
  | 'invoices'
  | 'payment'
  | 'pastdue';

export type ModalName = 'downgrade' | 'cancellation' | null;

export interface ToastData {
  tone: 'success' | 'info' | 'error' | 'primary';
  icon?: any;
  title: string;
  msg?: string;
}

export interface NavApi {
  route: Route;
  go: (r: Route) => void;
  modal: ModalName;
  openModal: (m: ModalName) => void;
  closeModal: () => void;
  toast: (t: ToastData) => void;
  /** shared "upgrade target" so Plans → Billing Preview drawer can read it */
  upgradeTo: string | null;
  setUpgradeTo: (id: string | null) => void;
}

const NavCtx = createContext<NavApi | null>(null);

export const NavProvider = ({ value, children }: { value: NavApi; children: React.ReactNode }) => (
  <NavCtx.Provider value={value}>{children}</NavCtx.Provider>
);

export const useNav = (): NavApi => {
  const ctx = useContext(NavCtx);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
};
