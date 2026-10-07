/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { useAppSelector } from '@/app/redux/store';
import { toast } from '@/lib/ToastService';
import TaxSelectDropDown from '@/components/ui/ScrollSelectDropDowns/TaxSelectDropdown';
import { money } from '@/components/violet';
import { cn } from '@/lib/utils';

const fieldCls =
  'rounded-v-input border border-v-border bg-white px-3 py-2 text-[13px] tabular-nums text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';

/**
 * The invoice calculation summary — discount / shipping / sales-tax-rate / deposit
 * controls plus the running totals. Owns the totals engine (writes
 * sub_total / total_tax / total / due_total into invoiceData), so it must be the
 * ONLY place that engine runs on a given page (InvoiceTable gates its copy off
 * via `showSummary={false}`).
 */
const InvoiceSummary = ({
  invoiceData,
  setInvoiceData,
  invoiceItems,
  storedAutoTax,
  setIsCalculation,
  isDepositShow = true,
  showTotals = true,
}: {
  invoiceData: any;
  setInvoiceData: React.Dispatch<React.SetStateAction<any>>;
  invoiceItems: any[];
  storedAutoTax?: any;
  setIsCalculation?: any;
  isDepositShow?: boolean;
  /** Render the final Total / Balance-due rows. Set false when the page shows its own custom total (e.g. "Total credit"). */
  showTotals?: boolean;
}) => {
  const [discount, setDiscount] = useState<any>('');
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState<any>('');
  const [isInitial, setIsInitial] = useState(true);
  const { SalesSettingsData } = useAppSelector((state) => state.SalesSettingsData);

  // totals engine — mirrors the legacy InvoiceTable summary
  useEffect(() => {
    const InvoiceSubtotal = invoiceItems.reduce((acc: any, row: any) => acc + Number(row.amount), 0);
    const TotalTax = invoiceItems.reduce((prev: any, row: any) => {
      if (row?.is_tax) {
        return prev + (Number(row?.amount || 0) / 100) * Number(invoiceData?.sales_tax?.total_rate || 0);
      }
      return prev;
    }, 0);

    const InvoiceTotal = Number(InvoiceSubtotal) + Number(TotalTax);
    const total = Number(
      (Number(InvoiceTotal) + Number(invoiceData?.shipping || 0) - Number(discountAmount)).toFixed(3)
    );
    const dueTotal = total - Number(invoiceData?.deposit);

    setSubtotal(Number(InvoiceSubtotal));
    setInvoiceData({
      ...invoiceData,
      total_tax: Number(TotalTax.toFixed(3)),
      due_total: dueTotal,
      total: total,
      sub_total: Number(InvoiceSubtotal),
    });
  }, [invoiceItems, invoiceData?.sales_tax, discountAmount, invoiceData?.shipping, invoiceData?.deposit]);

  // seed the discount input from existing invoiceData (e.g. when loading an estimate)
  useEffect(() => {
    if (isInitial && Number(subtotal) > 0) {
      if (
        invoiceData?.discount_kind == 'PERCENTAGE' &&
        Number(invoiceData?.discount_amount) > 0 &&
        subtotal > 0
      ) {
        setDiscount(Number((invoiceData?.discount_amount / subtotal) * 100).toFixed(3));
      }
      if (invoiceData?.discount_kind == 'FLAT' && Number(invoiceData?.discount_amount) > 0) {
        setDiscount(invoiceData?.discount_amount);
      }
      setIsInitial(false);
    }
  }, [subtotal]);

  const handleDiscountChange = (value: any) => {
    if (invoiceData.discount_kind === 'PERCENTAGE') {
      setDiscount(value);
      if (value > 100) {
        toast.warning("Discount percentage can't be greater than 100");
        setDiscount('');
        setDiscountAmount('');
        setInvoiceData({ ...invoiceData, discount_amount: '', deposit: '' });
        return;
      }
      const amt = Number(subtotal / 100) * Number(value);
      setDiscountAmount(amt);
      setInvoiceData({ ...invoiceData, discount_amount: amt, deposit: '' });
    } else if (invoiceData.discount_kind === 'FLAT') {
      setDiscount(value);
      if (value > subtotal) {
        toast.warning("Discount can't be greater than subtotal");
        setDiscountAmount('');
        setDiscount('');
        setInvoiceData({ ...invoiceData, discount_amount: '', deposit: '' });
        return;
      }
      setDiscountAmount(value);
      setInvoiceData({ ...invoiceData, discount_amount: value, deposit: '' });
    }
  };

  const handleDepositChange = (value: any) => {
    if (value > invoiceData?.total) {
      toast.warning("Deposit can't be greater than Total");
      setInvoiceData({ ...invoiceData, deposit: '' });
      return;
    }
    setInvoiceData({
      ...invoiceData,
      deposit: Number(value),
      due_total: invoiceData?.total - Number(value),
    });
  };

  const displaySubtotal =
    invoiceData?.tax_kind == 'INCLUSIVE'
      ? Number(subtotal) - Number(invoiceData.total_tax)
      : Number(subtotal);

  return (
    <div className="flex flex-col gap-3">
      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-v-ink500">Subtotal</span>
        <span className="text-[13px] font-semibold tabular-nums text-v-ink900">
          {money(displaySubtotal || 0)}
        </span>
      </div>

      {/* Discount */}
      {SalesSettingsData?.is_discount && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <select
              value={invoiceData.discount_kind}
              onChange={(e) => setInvoiceData({ ...invoiceData, discount_kind: e.target.value })}
              className={cn(fieldCls, 'min-w-0 flex-1 cursor-pointer px-2')}
            >
              <option value="PERCENTAGE">Discount %</option>
              <option value="FLAT">Discount $</option>
            </select>
            <input
              type="number"
              value={discount}
              onChange={(e) => handleDiscountChange(e.target.value)}
              placeholder="0"
              className={cn(fieldCls, 'w-14 text-right')}
            />
          </div>
          <span className="w-16 shrink-0 text-right text-[13px] font-semibold tabular-nums text-v-ink900">
            −{money(Number(invoiceData.discount_amount) || 0)}
          </span>
        </div>
      )}

      {/* Shipping */}
      {SalesSettingsData?.is_shipping && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] text-v-ink500">Shipping</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={invoiceData?.shipping || ''}
              onChange={(e) => setInvoiceData({ ...invoiceData, shipping: e.target.value })}
              placeholder="0"
              className={cn(fieldCls, 'w-20 text-right')}
            />
            <span className="w-16 text-right text-[13px] font-semibold tabular-nums text-v-ink900">
              +{money(Number(invoiceData?.shipping) || 0)}
            </span>
          </div>
        </div>
      )}

      {/* Sales tax rate */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] text-v-ink500">Sales tax rate</span>
        <TaxSelectDropDown
          parentClassName="flex-1"
          ClassName="rounded-v-input border border-v-border focus:border-v-primary"
          value={invoiceData?.sales_tax}
          setValue={(e: any) => setInvoiceData({ ...invoiceData, sales_tax: e })}
          storedAutoTax={storedAutoTax}
        />
        {invoiceData?.sales_tax?.auto_calculated && (
          <p className="text-[11px] font-medium text-v-success-fg">
            ✓ Auto-calculated based on customer address
          </p>
        )}
      </div>

      {/* Total sales tax */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-v-ink500">Total sales tax</span>
        <span className="text-[13px] font-semibold tabular-nums text-v-ink900">
          {money(Number(invoiceData?.total_tax) || 0)}
        </span>
      </div>

      {invoiceData?.sales_tax && (
        <button
          type="button"
          onClick={() => setIsCalculation && setIsCalculation(true)}
          className="inline-flex items-center gap-1 self-end text-[12px] font-semibold text-v-primary hover:underline"
        >
          See math
          <Info className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Deposit */}
      {SalesSettingsData?.is_deposit && isDepositShow && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] text-v-ink500">Deposit</span>
          <input
            type="number"
            value={invoiceData?.deposit}
            onChange={(e) => handleDepositChange(e.target.value)}
            placeholder="0.00"
            className={cn(fieldCls, 'w-28 text-right')}
          />
        </div>
      )}

      {showTotals && (
        <>
          <div className="my-0.5 border-t border-[rgba(22,23,42,0.07)]" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-v-ink900">Total</span>
            <span className="text-[14px] font-extrabold tabular-nums text-v-ink900">
              {money(Number(invoiceData?.total) || 0)}
            </span>
          </div>

          {/* Balance due */}
          {isDepositShow && (
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-v-primary">Balance due</span>
              <span className="text-[14px] font-extrabold tabular-nums text-v-primary">
                {money(Number(invoiceData?.due_total ?? invoiceData?.total) || 0)}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InvoiceSummary;
