import PDFModal from '@/app/dashboard/reports/_components/PDFModal';
import Button from '@/components/ui/RawButton';
import { Pencil } from 'lucide-react';
import React, { useState } from 'react';
import DotSpinner from '../../../employee/employees/_components/dot-spinner';
import BusinessForm from './BankAccounts/business-form';
const BankAccounts = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <div className="border-b border-gray-200 bg-white/60 transition-all duration-300 hover:border-accent_soft_blue hover:bg-gray-100">
        <div className="grid grid-cols-2 px-4 py-7">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-accent_soft_black">Bank Account</h2>
            <p className="mt-1 flex-1 text-xs text-accent_soft_black">
              Account Number : ********8788
            </p>
          </div>
          <div className="flex items-end justify-end">
            <Button
              onClick={() => setIsOpen(true)}
              className="px-3 py-3 text-accent_soft_black hover:bg-gray-200"
            >
              <Pencil className="size-[18px]" />
            </Button>
          </div>
        </div>
      </div>
      <PDFModal
        isPadding={false}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Balanzify Payroll"
        bgClass="bg-accent_bluish_gray"
      >
        {/* {(isLoading || isPending) && (
          <div className="absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center bg-white/60 bg-opacity-50">
            <DotSpinner />
          </div>
        )}{" "} */}
        <div className="mb-7 text-sm">
          <div className="px-7 py-7 text-center">
            {' '}
            <h2 className="text-3xl font-semibold text-accent_soft_black">
              Setup Your Direct Deposit
            </h2>
            <p className="text-sm text-accent_soft_black">
              Make transaction more easier than ever.
            </p>
          </div>
          <div className="mx-auto flex h-screen max-w-3xl flex-col">
            {isOpen && <BusinessForm />}
          </div>
        </div>
      </PDFModal>
    </div>
  );
};

export default BankAccounts;
