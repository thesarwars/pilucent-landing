'use client';

import Modal from '@/app/(admin)/_components/Modal';
import Button from '@/components/ui/RawButton';
import { Pencil, PencilIcon } from 'lucide-react';
import { useState } from 'react';
import TaxesAndFormsModalForm from './TaxesAndFormsModalForm';

type TaxHandlingOption = 'quickbooks' | 'manual';

export default function TaxesAndForms() {
  const [activeTab, setActiveTab] = useState<'payment' | 'automated'>('automated');
  const [isOpen, setIsOpen] = useState(false);
  const [isAutomated, setIsAutomated] = useState(false);
  const [taxHandling, setTaxHandling] = useState<TaxHandlingOption>('quickbooks');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = () => {
    console.log({
      isAutomated,
      taxHandling,
    });
  };

  const handleCancel = () => {
    setIsAutomated(false);
    setTaxHandling('quickbooks');
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white/60 py-4 hover:bg-gray-100">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-12">
            <h1 className="text-lg font-medium text-gray-900">Taxes and forms</h1>
            <div className="flex gap-7">
              <p
                className={`border-b-2 border-transparent text-sm text-gray-500 transition-colors hover:text-gray-700`}
              >
                Payment and filing preference
              </p>
              <p
                className={`border-b-2 border-transparent text-sm text-gray-500 transition-colors hover:text-gray-700`}
              >
                Automated taxes and forms
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-end justify-end">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-2 text-accent_soft_black hover:bg-gray-200"
            >
              {isExpanded ? (
                <span className="font-light">Close</span>
              ) : (
                <Pencil className="size-[18px]" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border border-black px-6 py-8">
          {/* Info Section */}
          <div className="mb-8 border-b border-gray-200 pb-8">
            <p className="mb-3 text-sm leading-relaxed text-gray-700">
              You'll be responsible for paying and filing your federal and state payroll taxes
              (including year-end filings) beginning with tax periods ending on or after Saturday,
              November 01, 2025.
            </p>
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Find out more
            </a>
          </div>

          {/* Tax Handling Section */}
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              How you plan to handle taxes
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              Select how you plan on making your tax payments and filings.
            </p>

            {/* Radio Options */}
            <div className="mb-8 space-y-4">
              {/* Option 1 */}
              <label
                onClick={() => setIsOpen(true)}
                className="flex cursor-pointer items-start gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="tax-handling"
                  value="balanzify"
                  checked={taxHandling === 'quickbooks'}
                  onChange={(e) => setTaxHandling(e.target.value as TaxHandlingOption)}
                  className="mt-0.5 h-5 w-5 cursor-pointer accent-green-600"
                />
                <span className="text-sm text-gray-700">
                  I'll initiate payments and filings using Balanzify
                </span>
              </label>

              {/* Option 2 */}
              <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
                <input
                  type="radio"
                  name="tax-handling"
                  value="manual"
                  checked={taxHandling === 'manual'}
                  onChange={(e) => setTaxHandling(e.target.value as TaxHandlingOption)}
                  className="mt-0.5 h-5 w-5 cursor-pointer accent-green-600"
                />
                <span className="text-sm text-gray-700">
                  I'll pay and file the right agencies through their website or mail
                </span>
              </label>
            </div>

            <div className="flex w-full gap-7 border-t bg-white/60 px-7 py-4">
              <Button
                type="button"
                className="rounded-3xl border border-accent_soft_black px-7 py-1.5 text-accent_soft_black transition-all hover:bg-accent_soft_black hover:text-white"
                onClick={() => {
                  setIsExpanded(false);
                }}
              >
                Cancel
              </Button>
              <Button
                // isLoading={isPending}
                // disabled={isPending}
                // onClick={handleSubmit}
                className="rounded-3xl bg-accent_soft_black px-7 py-1.5 text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
      <Modal
        title="Taxes And Forms"
        widthClass="w-full md:max-w-[590px]"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="p-">
          <TaxesAndFormsModalForm />
        </div>
      </Modal>
    </div>
  );
}
