import PDFModal from '@/app/dashboard/reports/_components/PDFModal';
import {
  fetchStateTaxSettings,
  patchStateTaxSettings,
  postStateTaxSettings,
} from '@/app/helpers/backend';
import Button from '@/components/ui/RawButton';
import { toast } from '@/lib/ToastService';
import { Info, Pencil, TriangleAlert } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DotSpinner from '../../../employee/employees/_components/dot-spinner';
import UITable from './StateTaxTables/UITable';
import RSTable from './StateTaxTables/RSTable';

const EAFRateOptions = [
  { value: 0, label: '0%' },
  { value: 0.02, label: '0.02%' },
  { value: 0.03, label: '0.03%' },
];

const PFMLRateChoices = [
  { value: 'EMPLOYEE_7143_EMPLOYER_0', title: 'Employee: 71.43%, Employer: 0%' },
  { value: 'EMPLOYEE_0_EMPLOYER_100', title: 'Employee: 0%, Employer: 100%' },
  { value: 'EMPLOYEE_7143_EMPLOYER_2857', title: 'Employee: 71.43%, Employer: 28.57%' },
  { value: 'EMPLOYEE_0_EMPLOYER_7143', title: 'Employee: 0%, Employer: 71.43%' },
];

const WashingtonTaxSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [EAFData, setEAFData] = useState<any>({});
  const [UIData, setUIData] = useState<any>({});
  const [RenderAgain, setRenderAgain] = useState(false);
  const [data, setData] = useState({
    uid: '',
    state: 'WA',
    win_number: '',
    ui_registration_number: '',
    workers_comp_account_id: '',
    wa_cares_premium_payer: '',
    pfml_contribution_rate: '',
    unemployment_insurance: [],
    reemployment_service_funds: [],
  });

  const handleSubmit = async () => {
    try {
      setIsPending(true);
      const payloadData = {
        state: 'WA',
        win_number: data.win_number,
        ui_registration_number: data.ui_registration_number,
        workers_comp_account_id: data.workers_comp_account_id,
        wa_cares_premium_payer: data.wa_cares_premium_payer,
        pfml_contribution_rate: data.pfml_contribution_rate,
        unemployment_insurance_list: [UIData],
        reemployment_service_funds_list: [EAFData],
      };
      if (data?.uid) {
        const res = await patchStateTaxSettings(data?.uid, payloadData);
        if (res?.success) {
          toast.success('Washington tax settings updated.');
          setRenderAgain(!RenderAgain);
          setData({ ...data, ...res });
          setIsOpen(false);
        }
      } else {
        const res = await postStateTaxSettings(payloadData);
        if (res?.success) {
          toast.success('Washington tax settings created.');
          setRenderAgain(!RenderAgain);
          setData({ ...data, ...res });
          setIsOpen(false);
        }
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    const fn = async () => {
      try {
        setIsLoading(true);
        const res = await fetchStateTaxSettings({ state: 'WA' });
        if (res?.results?.[0]?.uid) {
          setData({ ...data, ...res?.results?.[0] });
        }
      } catch (error) {
        //err
      } finally {
        setIsLoading(false);
      }
    };
    fn();
  }, [RenderAgain]);

  return (
    <div>
      <div className="border-b border-gray-200 bg-white/60 transition-all duration-300 hover:border-accent_soft_blue hover:bg-gray-100">
        <div className="grid grid-cols-2 px-4 py-7">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-accent_soft_black">Washington Tax</h2>
            <p className="flex-1 text-sm text-accent_soft_black">
              ESD number, unemployment insurance rates, WA Cares, Paid Family and Medical Leave and
              workers' compensation
            </p>
          </div>
          <div className="flex items-end justify-end">
            <Button
              onClick={() => setIsOpen(true)}
              className="px-3 py-3 text-accent_soft_black hover:bg-gray-100"
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
        title="State Tax Settings"
        bgClass="bg-accent_bluish_gray"
      >
        {(isLoading || isPending) && (
          <div className="absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center bg-white/60 bg-opacity-50">
            <DotSpinner />
          </div>
        )}{' '}
        <div className="text-sm">
          <div className="px-7 py-7">
            {' '}
            <h2 className="text-3xl font-semibold text-accent_soft_black">Washington tax info</h2>
            <p className="text-sm text-accent_soft_black">
              We're using the following info to correctly pay and file your state payroll taxes
              based on where your employees live and work. You can find what you need in emails or
              letters you’ve received from the state.
            </p>
          </div>
          <div className="flex flex-col rounded-lg bg-white/60 shadow">
            <div className="h-full flex-1 overflow-y-auto px-8 lg:pl-16">
              <div className="mb-4 py-2">
                <h2 className="mb-4 text-xl font-medium text-accent_soft_black">
                  Unemployment Insurance (UI)
                </h2>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1 text-accent_soft_black">
                    <span className="text-xs text-gray-700">ESD Number</span>
                    <span className="text-base text-red-500">*</span>
                    <Info
                      className="size-3.5 text-gray-500"
                      aria-label="Your Employment Security Department account number, e.g. 000123456-78 9"
                    />
                  </label>
                  <input
                    maxLength={20}
                    type="text"
                    placeholder="000123456-78 9"
                    value={data?.ui_registration_number}
                    onChange={(e) => setData({ ...data, ui_registration_number: e.target.value })}
                    required
                    className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                  <a
                    href="https://secure.esd.wa.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm text-accent_soft_blue hover:underline"
                  >
                    Don't have an account number? Register here
                  </a>
                </div>
                <RSTable
                  title="Employment Administrative Fund rate"
                  rateOptions={EAFRateOptions}
                  RenderAgain={RenderAgain}
                  setRenderAgain={setRenderAgain}
                  uid={data?.uid}
                  rows={data?.reemployment_service_funds}
                  data={EAFData}
                  setData={setEAFData}
                />
                <UITable
                  RenderAgain={RenderAgain}
                  setRenderAgain={setRenderAgain}
                  uid={data?.uid}
                  rows={data.unemployment_insurance}
                  data={UIData}
                  setData={setUIData}
                  minRate={0}
                  maxRate={100}
                />
                <div className="my-4 flex flex-col gap-3 py-2">
                  <p className="font-light text-gray-900">WA Cares Fund rate</p>
                  <label className="flex cursor-pointer items-center gap-3 text-accent_soft_black">
                    <input
                      type="radio"
                      name="wa_cares_premium_payer"
                      value="EMPLOYEE"
                      checked={data?.wa_cares_premium_payer === 'EMPLOYEE'}
                      onChange={(e) =>
                        setData({ ...data, wa_cares_premium_payer: e.target.value })
                      }
                      className="size-4 accent-accent_soft_black"
                    />
                    0.58% - My employees will pay the premium
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 text-accent_soft_black">
                    <input
                      type="radio"
                      name="wa_cares_premium_payer"
                      value="EMPLOYER"
                      checked={data?.wa_cares_premium_payer === 'EMPLOYER'}
                      onChange={(e) =>
                        setData({ ...data, wa_cares_premium_payer: e.target.value })
                      }
                      className="size-4 accent-accent_soft_black"
                    />
                    0.58% — I will pay the premium for my employees
                  </label>
                  <p className="text-accent_soft_black">
                    Need help deciding?{' '}
                    <a
                      href="https://wacaresfund.wa.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent_soft_blue hover:underline"
                    >
                      Learn more
                    </a>
                  </p>
                </div>
              </div>

              <div className="mb-4 border-t py-4">
                <h2 className="mb-4 text-xl font-medium text-accent_soft_black">
                  Paid Family and Medical Leave
                </h2>
                {!data?.pfml_contribution_rate && (
                  <div className="mb-4 flex max-w-2xl items-center gap-3 rounded border border-red-500 px-4 py-3">
                    <TriangleAlert className="size-5 shrink-0 text-red-600" />
                    <p className="text-accent_soft_black">
                      You need to update your PFML rate to the 2026 rate to run payroll.
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1 text-accent_soft_black">
                    Paid Family and Medical Leave Contribution rate
                    <Info
                      className="size-3.5 text-gray-500"
                      aria-label="How the PFML premium is split between you and your employees"
                    />
                  </label>
                  <select
                    value={data?.pfml_contribution_rate}
                    onChange={(e) => setData({ ...data, pfml_contribution_rate: e.target.value })}
                    className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  >
                    <option value="">Select one</option>
                    {PFMLRateChoices?.map((option) => (
                      <option value={option.value} key={option.value}>
                        {option.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4 border-t py-4">
                <h2 className="mb-4 text-xl font-medium text-accent_soft_black">
                  Workers' Compensation
                </h2>
                <div className="mb-6 flex flex-col gap-2">
                  <label className="flex items-center gap-1 text-accent_soft_black">
                    <span className="text-xs text-gray-700">
                      Unified Business Identifier (UBI) Number
                    </span>
                    <Info
                      className="size-3.5 text-gray-500"
                      aria-label="Your 9-digit UBI number, e.g. 123 456 789"
                    />
                  </label>
                  <input
                    maxLength={20}
                    type="text"
                    placeholder="123 456 789"
                    value={data?.win_number}
                    onChange={(e) => setData({ ...data, win_number: e.target.value })}
                    className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                  <a
                    href="https://dor.wa.gov/open-business"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm text-accent_soft_blue hover:underline"
                  >
                    Don't have an account number? Register here
                  </a>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1 text-accent_soft_black">
                    <span className="text-xs text-gray-700">Account ID</span>
                    <Info
                      className="size-3.5 text-gray-500"
                      aria-label="Your L&I workers' compensation account ID, e.g. 123456-78"
                    />
                  </label>
                  <input
                    maxLength={20}
                    type="text"
                    placeholder="123456-78"
                    value={data?.workers_comp_account_id}
                    onChange={(e) => setData({ ...data, workers_comp_account_id: e.target.value })}
                    className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                  <a
                    href="https://lni.wa.gov/insurance/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm text-accent_soft_blue hover:underline"
                  >
                    Don't have an account number? Register here
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.1)' }}
          className="sticky bottom-0 left-0 right-0 mt-0 flex w-full justify-between space-x-4 border-t bg-white/60 px-7 py-4"
        >
          <Button
            type="button"
            className="rounded border border-accent_soft_black px-12 py-2 text-accent_soft_black transition-all hover:bg-accent_soft_black hover:text-white"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            isLoading={isPending}
            disabled={isPending}
            onClick={() => handleSubmit()}
            className="rounded bg-accent_soft_black px-12 py-2 text-white"
          >
            Save
          </Button>
        </div>
      </PDFModal>
    </div>
  );
};

export default WashingtonTaxSettings;
