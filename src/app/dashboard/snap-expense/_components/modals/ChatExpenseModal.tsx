'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import moment from 'moment';
import { FileText } from 'lucide-react';
import { postAttachment, postOCR } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import { generateBillNumber } from '@/utils/GenerateNumber';
import SupplierSelectDropDown from '@/components/ui/ScrollSelectDropDowns/SupplierSelectDropDown';
import Loader from '@/app/helpers/animations/Loader-2.json';
import Lottie from 'lottie-react';
import { SnapModalPortal } from './SnapModalPortal';
import { useSnapExpense } from '../context/SnapExpense.Context';
import { cn } from '@/lib/utils';
import Button from '../ui/Button';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';

const DRAFT_KEY = 'snap-expense-chat-expense-draft';

type ChatExpenseModalProps = {
  open: boolean;
  onClose: () => void;
};

function mapOcrItemsToCategoryItems(items: any[]): {
  formatted: any[];
  total: number;
  categoryTitle: string;
} {
  if (!items?.length) return { formatted: [], total: 0, categoryTitle: '' };
  const formatted = items.map((d: any) => ({
    type: 'category',
    category: d?.category?.title,
    category_uid: d?.category?.uid,
    description: d?.description,
    amount: d?.amount,
    tax: 0,
    productTaxInfo: { rate: 0, title: '', uid: '' },
    productTaxRate: 0,
    productTaxType: 'NO_TAX',
    isPopupOpen: false,
  }));
  const total = formatted.reduce((s, row) => s + Number(row.amount || 0), 0);
  const categoryTitle =
    formatted
      .map((r) => r.category)
      .filter(Boolean)
      .join(', ') || '';
  return { formatted, total, categoryTitle };
}

export function ChatExpenseModal({ open, onClose }: ChatExpenseModalProps) {
  const { token, sendRoomAction, isGroupChatView } = useSnapExpense();
  const [files, setFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>({
    uid: '',
    title: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrPending, setOcrPending] = useState(false);
  const [amountStr, setAmountStr] = useState('0.00');
  const [description, setDescription] = useState('');
  const [fileURL, setFileURL] = useState<string | null>(null);
  const [categoryDisplay, setCategoryDisplay] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => moment().format('YYYY-MM-DD'));
  const [selectedSupplier, setSelectedSupplier] = useState<any>();
  const [data, setData] = useState<any>({
    reference_no: '',
    billing_address: '',
  });

  const [editFieldsMode, setEditFieldsMode] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nowLabel, setNowLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setNowLabel(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [open]);

  const inputsLocked = !editFieldsMode;

  const applyOcrToForm = useCallback((formatted: any[], total: number, categoryTitle: string) => {
    setAmountStr(Number(total).toFixed(2));
    setCategoryDisplay(categoryTitle);
    const desc = formatted
      .map((r: any) => r.description)
      .filter(Boolean)
      .join('; ');
    if (desc) setDescription(desc);
  }, []);

  const runOcrOnFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image receipt (PNG, JPEG).');
      return;
    }
    setFiles((prev) => [...prev, file]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const r = e.target?.result;
      if (typeof r === 'string') setImagePreview(r);
    };
    reader.readAsDataURL(file);

    try {
      setOcrPending(true);
      const fileFormData = new FormData();
      fileFormData.append('file', file);
      const fileData = await postAttachment(fileFormData);
      if (fileData?.success) {
        setFileURL(fileData?.file);
      }
      if (!fileData?.success) {
        toast.error('Could not upload receipt. Try another image.');
        setOcrPending(false);
        return;
      }
      const formData = new FormData();
      formData.append('image', file);
      const res = await postOCR(formData);
      if (res?.success && res?.data?.items?.length) {
        const category = res?.data?.items?.find((item: any) => item?.category?.uid);
        setSelectedCategory(category?.category);
        const { formatted, total, categoryTitle } = mapOcrItemsToCategoryItems(res.data.items);
        applyOcrToForm(formatted, total, categoryTitle);
        toast.success('Receipt scanned — review fields before submitting.');
      } else {
        toast.info('No line items detected — fill the form manually.');
      }
    } catch {
      toast.error('Could not read receipt. Try another image.');
    } finally {
      setOcrPending(false);
    }
  };

  const onSupplierSelect = (supplier: any) => {
    const number = generateBillNumber(supplier?.first_name || '');
    setData((prev: any) => ({
      ...prev,
      mailing_address:
        !supplier?.address?.province && !supplier?.address?.city && !supplier?.address?.street
          ? ''
          : [supplier?.address?.street, supplier?.address?.city, supplier?.address?.province]
              .filter(Boolean)
              .join(' '),
      bill_no: number,
    }));
  };

  const handleSubmit = async (status: string) => {
    if (!selectedSupplier?.uid) {
      toast.error('Select a vendor / supplier.');
      return;
    }
    if (!isGroupChatView) {
      toast.error('Expense reports can only be sent inside a group chat.');
      return;
    }

    setSubmitting(true);
    try {
      const n = parseFloat(amountStr.replace(/[^0-9.-]/g, '')) || 0;

      // const currencyCode =
      //   (typeof selectedSupplier?.currency === 'string' && selectedSupplier.currency) ||
      //   (typeof selectedSupplier?.currency_kind === 'string' && selectedSupplier.currency_kind) ||
      //   'USD';

      const payLoadData: any = {
        amount: n,
        currency: "USD",
        description: description?.trim() || undefined,
        expense_date: expenseDate,
        status: status,
        supplier: selectedSupplier.uid,
        reference_number: data?.reference_no || undefined,
      };
      if (selectedCategory?.uid) {
        payLoadData.category = selectedCategory?.uid;
      }

      payLoadData.file_path = fileURL;

      const ok = sendRoomAction({
        action: 'save_expense_report',
        data: payLoadData,
      });

      if (!ok) {
        toast.error('Could not send expense report. Reconnect and try again.');
        return;
      }

      toast.success('Expense report sent.');
      onClose();
    } catch (error: any) {
      try {
        const errors = error?.message ? JSON.parse(error.message) : null;
        if (errors && typeof errors === 'object') {
          Object.keys(errors).forEach((key) => {
            errors[key]?.forEach((msg: string) => {
              toast.error(`${key.replace(/_/g, ' ')}: ${msg}`);
            });
          });
        } else {
          toast.error('Something went wrong.');
        }
      } catch {
        toast.error('Something went wrong.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = () => {
    try {
      const payload = {
        amountStr,
        description,
        categoryDisplay,
        expenseDate,
        // categoryItems,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      toast.success('Draft saved.');
    } catch {
      toast.error('Could not save draft.');
    }
  };

  const uploadReceiptClick = () => fileInputRef.current?.click();

  useEffect(() => {
    if (ocrPending) return;
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;

      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            runOcrOnFile(blob);
          }
        }
      }
    };

    // Attach globally so focus isn't needed
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  useEffect(() => {
    if (dropRef.current) dropRef.current.focus();
  }, []);
  const statusLine = useMemo(() => {
    if (ocrPending) return 'OCR Processing...';
    if (selectedCategory?.uid) return 'Ready — review amounts and vendor.';
    return 'Upload a receipt to autofill.';
  }, [ocrPending, selectedCategory?.uid]);

  return (
    <SnapModalPortal
      isOpen={open}
      onClose={onClose}
      hideHeader
      disableClose={submitting}
      widthClass="w-full max-w-[1180px]"
      classNames="bg-white shadow-2xl"
    >
      <div className="relative flex max-h-[85vh] flex-col gap-0 overflow-y-auto p-0 font-inter md:flex-row">
        {ocrPending && (
          <div className="absolute bottom-0 left-0 right-0 top-0 z-[1000] flex items-center justify-center bg-[#ffffff75]">
            <div className="h-80 w-80">
              <Lottie animationData={Loader} loop={true} />
            </div>
          </div>
        )}
        {/* Left: draft / receipt visual */}
        <div className="relative flex min-h-[200px] flex-1 items-center justify-center bg-[#F3F4F6] p-8 md:max-w-[380px]">
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Receipt"
              width={400}
              height={560}
              className="max-h-[min(70vh,560px)] w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-[#9CA3AF]">
              <FileText className="h-24 w-24 stroke-1" />
              <p className="text-sm">Receipt preview</p>
            </div>
          )}
        </div>

        {/* Right: form card */}
        <div className="relative flex flex-1 flex-col border-l border-[#d7d7d7] bg-white">
          <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5">
            <h2 className="text-base font-normal text-[#685f5f]">Expense Report</h2>
            <span className="mr-10 rounded-lg bg-[#eab308] px-5 py-2.5 text-base text-[#373737]">
              Draft
            </span>
          </div>

          <div
            ref={dropRef}
            className={cn(
              'mx-6 mt-4 rounded-2xl border-2 border-dashed p-4 transition-colors',
              dragActive ? 'border-[#3462FA] bg-blue-50/50' : 'border-transparent'
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const f = e.dataTransfer.files?.[0];
              if (f) runOcrOnFile(f);
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-2xl bg-[#E5E7EB] text-sm text-[#685f5f]">
                Receipt
              </div>
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  className="text-xs font-medium text-[#315dd9] hover:underline"
                  onClick={uploadReceiptClick}
                  disabled={inputsLocked || submitting}
                >
                  View Receipt
                </button>
                <p className="mt-1 text-base text-[#685f5f]">{statusLine}</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) runOcrOnFile(f);
                e.target.value = '';
              }}
            />
          </div>

          <div className="flex flex-col gap-4 px-6 pb-6 pt-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-base text-[#685f5f]">Amount</label>
                <input
                  type="text"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  disabled={inputsLocked || submitting}
                  className="h-11 w-full border border-[#d7d7d7] px-3.5 text-base text-[#685f5f] outline-none focus:border-[#3462FA]"
                  placeholder="$0.00"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base text-[#685f5f]">Vendor/Supplier</label>
                <div className="relative min-h-[44px]">
                  <SupplierSelectDropDown
                    ClassName="border border-[#d7d7d7] focus:border-[#3462FA]"
                    parentClassName="w-full"
                    setValue={setSelectedSupplier}
                    value={selectedSupplier}
                    OnSelect={onSupplierSelect}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-base text-[#685f5f]">Expense Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  disabled={inputsLocked || submitting}
                  className="h-11 w-full border border-[#d7d7d7] px-3 text-base text-[#685f5f] outline-none focus:border-[#3462FA]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-base text-[#685f5f]">Category</label>
                <AccountSelectDropDown
                  setValue={setSelectedCategory}
                  value={selectedCategory}
                  ClassName="h-11 w-full border border-[#d7d7d7] px-3.5 text-base text-[#685f5f] outline-none focus:border-[#3462FA]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-base text-[#685f5f]">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={inputsLocked || submitting}
                rows={4}
                className="w-full resize-none border border-[#d7d7d7] px-3.5 py-3 text-base text-[#685f5f] outline-none focus:border-[#3462FA]"
              />
              <p className="flex items-center gap-1 text-xs text-[#315dd9]">
                <span className="inline-block h-1 w-1 rounded-full bg-[#315dd9]" />
                Optional
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-col items-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
            <div className="flex w-full flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={uploadReceiptClick}
                disabled={submitting}
                className="rounded-lg bg-[#e5e7eb] px-5 py-2.5 text-base text-[#685f5f] transition hover:bg-[#d1d5db]"
              >
                Upload Receipt
              </button>
              <button
                type="button"
                onClick={() => setEditFieldsMode((v) => !v)}
                disabled={submitting}
                className="rounded-lg bg-[#e5e7eb] px-5 py-2.5 text-base text-[#685f5f] transition hover:bg-[#d1d5db]"
              >
                {editFieldsMode ? 'Lock fields' : 'Edit Fields'}
              </button>
              <Button
                size="medium"
                className="bg-[#3b82f6] px-5 text-white hover:bg-[#2563eb]"
                disabled={submitting}
                onClick={() => handleSubmit('SUBMITTED')}
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </Button>
            </div>
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleSubmit('DRAFT')}
                disabled={submitting}
                className="rounded-lg bg-[#e5e7eb] px-5 py-2.5 text-base text-[#685f5f] transition hover:bg-[#d1d5db]"
              >
                {submitting ? 'Saving Draft…' : 'Save Draft'}
              </button>
              <span className="text-sm text-[#685f5f]">{nowLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </SnapModalPortal>
  );
}

export default ChatExpenseModal;
