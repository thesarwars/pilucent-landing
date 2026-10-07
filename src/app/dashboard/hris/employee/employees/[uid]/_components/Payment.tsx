import { patchEmployeeBank, postEmployeeBank } from '@/app/helpers/backend';
import LogoLoader from '@/components/MainLoader/logo-loader';
import Button from '@/components/ui/RawButton';
import { toast } from '@/lib/ToastService';
import React, { FormEvent, useEffect, useState } from 'react';
import { FiEdit } from 'react-icons/fi';
import EmployeePaymentAccount from './ReviewAndPay';
const EmployeeBankingInformationKindChoices = [
  { value: 'PAPER_CHECK', title: 'Paper Check' },
  { value: 'BANK_TRANSFER', title: 'Bank Transfer' },
  { value: 'CASH', title: 'Cash' },
  // { value: "CREDIT_CARD", title: "Credit Card" },
  // { value: "DEBIT_CARD", title: "Debit Card" },
  // { value: "MOBILE_PAYMENT", title: "Mobile Payment" },
  // { value: "DIGITAL_WALLET", title: "Digital Wallet" },
];

const Payment = ({
  view = false,
  Employee,
  isPending,
  refetch,
  uid = '',
}: {
  view?: boolean;
  Employee: any;
  isPending?: boolean;
  refetch?: any;
  uid?: string;
}) => {
  const [paymentInfo, setPaymentInfo] = useState<any>({});
  const [isDisabled, setIsDisabled] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [RenderAgain, setRenderAgain] = useState(false);

  useEffect(() => {
    if (!isPending && Employee) {
      if (Employee?.banaking_informations?.[0]) {
        setPaymentInfo(Employee?.banaking_informations?.[0]);
      }
    }
  }, [isPending, Employee, RenderAgain]);

  const handleSavePayment = async () => {
    try {
      setIsUpdating(true);
      if (!paymentInfo?.uid) {
        const res = await postEmployeeBank(uid, paymentInfo);
        if (res?.success) {
          setIsDisabled(true);
          refetch && refetch();
          toast.success('Payment info updated.');
        }
      } else {
        const res = await patchEmployeeBank(uid, paymentInfo, paymentInfo?.uid);
        if (res?.success) {
          setIsDisabled(true);
          refetch && refetch();
          toast.success('Payment info updated.');
        }
      }
    } catch (error) {
      //err
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemovePaymentInfo = async () => {
    try {
      const res = await patchEmployeeBank(
        uid,
        {
          bank_name: '',
          bank_account_number: '',
          routing_number: '',
        },
        paymentInfo?.uid
      );
      if (res?.success) {
        setIsDisabled(true);
        refetch && refetch();
        // toast.success("Payment info updated.");
      }
    } catch (error) {
      //err
    } finally {
    }
  };

  if (isPending) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LogoLoader size={120} color={'#16151c'} />
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="rounded-lg border bg-white/60 p-7">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-xl font-medium">Payment Info</h1>
          {isDisabled && !view && (
            <Button
              onClick={() => {
                setIsDisabled(false);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Payment method</label>
            <select
              value={paymentInfo?.kind}
              onChange={(e) =>
                setPaymentInfo({
                  ...paymentInfo,
                  kind: e.target.value,
                })
              }
              disabled={isDisabled}
              required
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Select</option>
              {EmployeeBankingInformationKindChoices?.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          {paymentInfo?.kind == 'BANK_TRANSFER' && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">Bank Name</label>
                <input
                  disabled={isDisabled}
                  value={paymentInfo?.bank_name}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      bank_name: e.target.value,
                    })
                  }
                  required
                  maxLength={40}
                  type="text"
                  className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">Bank Account Number</label>
                <input
                  disabled={isDisabled}
                  maxLength={40}
                  value={paymentInfo?.bank_account_number}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      bank_account_number: e.target.value,
                    })
                  }
                  required
                  type="text"
                  className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">Account Type</label>

                <select
                  disabled={isDisabled}
                  value={paymentInfo?.bank_account_type}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      bank_account_type: e.target.value,
                    })
                  }
                  required
                  className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                >
                  <option value="">Select</option>
                  <option value="SAVINGS">Saving</option>
                  <option value="CHECKING">Checking</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">Routing Number</label>
                <input
                  disabled={isDisabled}
                  maxLength={40}
                  value={paymentInfo?.routing_number}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      routing_number: e.target.value,
                    })
                  }
                  required
                  type="text"
                  className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                />
              </div>{' '}
            </>
          )}
        </div>
        {!isDisabled && (
          <div className="items mt-4 flex gap-4">
            <Button
              isLoading={isUpdating}
              onClick={handleSavePayment}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled(true);
                setRenderAgain(!RenderAgain);
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
            >
              Cancel
            </Button>``
          </div>
        )}
      </div>
      {Employee?.banaking_informations?.[0]?.kind == 'BANK_TRANSFER' && (
        <div className="mt-7 rounded-lg border bg-white/60 p-7">
          <div className="flex items-center justify-center">
            <h1 className="mb-4 text-center text-xl font-medium">Link Account to Direct Deposit</h1>
          </div>

          <div className="mx-auto max-w-xl">
            <EmployeePaymentAccount
              employee={Employee}
              handleRemovePaymentInfo={handleRemovePaymentInfo}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
