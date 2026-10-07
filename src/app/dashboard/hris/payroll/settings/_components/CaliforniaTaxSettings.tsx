import PDFModal from '@/app/dashboard/reports/_components/PDFModal';
import {
  fetchStateTaxSettings,
  patchStateTaxSettings,
  postStateTaxSettings,
} from '@/app/helpers/backend';
import Button from '@/components/ui/RawButton';
import { toast } from '@/lib/ToastService';
import { Info, Pencil } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DotSpinner from '../../../employee/employees/_components/dot-spinner';
import PaySchedulesTable from './StateTaxTables/PaySchedulesTable';
import UITable from './StateTaxTables/UITable';
import RSTable from './StateTaxTables/RSTable';

const CAFrequencyChoices = [
  { value: 'QUARTERLY', title: 'Quarterly' },
  { value: 'MONTHLY', title: 'Monthly' },
  { value: 'SEMI_WEEKLY', title: 'Semi-Weekly' },
];

const ETTRateOptions = [
  { value: 0, label: '0%' },
  { value: 0.1, label: '0.1%' },
];

const CaliforniaTaxSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [ETTData, setETTData] = useState<any>({});
  const [UIData, setUIData] = useState<any>({});
  const [RenderAgain, setRenderAgain] = useState(false);
  const [NewPaySchedule, setNewPaySchedule] = useState<any>({});
  const [data, setData] = useState({
    uid: '',
    state: 'CA',
    win_number: '',
    payment_schedules: [],
    unemployment_insurance: [],
    reemployment_service_funds: [],
  });

  const handleSubmit = async () => {
    try {
      setIsPending(true);
      const payloadData = {
        state: 'CA',
        win_number: data.win_number,
        payment_schedules_list: [NewPaySchedule],
        unemployment_insurance_list: [UIData],
        reemployment_service_funds_list: [ETTData],
      };
      if (data?.uid) {
        const res = await patchStateTaxSettings(data?.uid, payloadData);
        if (res?.success) {
          toast.success('California tax settings updated.');
          setRenderAgain(!RenderAgain);
          setData({ ...data, ...res });
          setIsOpen(false);
        }
      } else {
        const res = await postStateTaxSettings(payloadData);
        if (res?.success) {
          toast.success('California tax settings created.');
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
        const res = await fetchStateTaxSettings({ state: 'CA' });
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
            <h2 className="text-lg font-medium text-accent_soft_black">California Tax</h2>
            <p className="flex-1 text-sm text-accent_soft_black">
              EDD Employer Payroll Tax Account Number, Deposit schedule and state un-employment
              insurance rate
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
            <h2 className="text-3xl font-semibold text-accent_soft_black">California tax info</h2>
            <p className="text-sm text-accent_soft_black">
              We're using the following info to correctly pay and file your state payroll taxes
              based on where your employees live and work. You can find what you need in emails or
              letters you’ve received from the state.
            </p>
          </div>
          <div className="flex flex-col rounded-lg bg-white/60 shadow">
            <div className="h-full flex-1 overflow-y-auto px-8 lg:pl-16">
              <div className="mb-4 py-2">
                <h2 className="mb-4 text-xl font-medium text-accent_soft_black">Withholding</h2>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1 text-accent_soft_black">
                    <span className="text-xs text-gray-700">
                      EDD Employer Payroll Tax Account Number
                    </span>
                    <span className="text-base text-red-500">*</span>
                    <Info
                      className="size-3.5 text-gray-500"
                      aria-label="Your 8-digit EDD employer payroll tax account number, e.g. 123-4567-8"
                    />
                  </label>
                  <input
                    maxLength={20}
                    type="text"
                    value={data?.win_number}
                    onChange={(e) => setData({ ...data, win_number: e.target.value })}
                    required
                    className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                  <a
                    href="https://edd.ca.gov/en/payroll_taxes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm text-accent_soft_blue hover:underline"
                  >
                    Learn about state tax IDs
                  </a>
                </div>
                <PaySchedulesTable
                  uid={data?.uid}
                  RenderAgain={RenderAgain}
                  setRenderAgain={setRenderAgain}
                  newRow={NewPaySchedule}
                  setNewRow={setNewPaySchedule}
                  rows={data?.payment_schedules}
                  frequencyChoices={CAFrequencyChoices}
                />
              </div>

              <div>
                <h2 className="mb-4 text-xl font-medium text-accent_soft_black">
                  Unemployment Insurance (UI)
                </h2>
                <RSTable
                  title="Employment Training Tax rate"
                  rateOptions={ETTRateOptions}
                  RenderAgain={RenderAgain}
                  setRenderAgain={setRenderAgain}
                  uid={data?.uid}
                  rows={data?.reemployment_service_funds}
                  data={ETTData}
                  setData={setETTData}
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

                {/* Buttons */}
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

export default CaliforniaTaxSettings;
