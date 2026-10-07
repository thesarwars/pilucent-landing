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

const ALFrequencyChoices = [
  { value: 'QUARTERLY', title: 'Quarterly' },
  { value: 'MONTHLY', title: 'Monthly' },
];

const AlabamaTaxSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [UIData, setUIData] = useState<any>({});
  const [RenderAgain, setRenderAgain] = useState(false);
  const [NewPaySchedule, setNewPaySchedule] = useState<any>({});
  const [data, setData] = useState({
    uid: '',
    state: 'AL',
    win_number: '',
    ui_registration_number: '',
    payment_schedules: [],
    unemployment_insurance: [],
  });

  const handleSubmit = async () => {
    try {
      setIsPending(true);
      const payloadData = {
        state: 'AL',
        win_number: data.win_number,
        ui_registration_number: data.ui_registration_number,
        payment_schedules_list: [NewPaySchedule],
        unemployment_insurance_list: [UIData],
      };
      if (data?.uid) {
        const res = await patchStateTaxSettings(data?.uid, payloadData);
        if (res?.success) {
          toast.success('Alabama tax settings updated.');
          setRenderAgain(!RenderAgain);
          setData({ ...data, ...res });
          setIsOpen(false);
        }
      } else {
        const res = await postStateTaxSettings(payloadData);
        if (res?.success) {
          toast.success('Alabama tax settings created.');
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
        const res = await fetchStateTaxSettings({ state: 'AL' });
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
            <h2 className="text-lg font-medium text-accent_soft_black">Alabama Tax</h2>
            <p className="flex-1 text-sm text-accent_soft_black">
              Withholding Tax Account Number, Deposit schedule and state un-employment insurance
              rate
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
            <h2 className="text-3xl font-semibold text-accent_soft_black">Alabama tax info</h2>
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
                    <span className="text-xs text-gray-700">Withholding Tax Account No.</span>
                    <span className="text-base text-red-500">*</span>
                    <Info
                      className="size-3.5 text-gray-500"
                      aria-label="Your Alabama withholding tax account number from the Department of Revenue"
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
                  <p className="text-sm text-gray-500">0000123456, R000123456, or R123456789</p>
                  <a
                    href="https://myalabamataxes.alabama.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm text-accent_soft_blue hover:underline"
                  >
                    Don't have an account number? Register here
                  </a>
                </div>
                <PaySchedulesTable
                  uid={data?.uid}
                  RenderAgain={RenderAgain}
                  setRenderAgain={setRenderAgain}
                  newRow={NewPaySchedule}
                  setNewRow={setNewPaySchedule}
                  rows={data?.payment_schedules}
                  frequencyChoices={ALFrequencyChoices}
                />
              </div>

              <div>
                <h2 className="mb-4 text-xl font-medium text-accent_soft_black">
                  Unemployment Insurance (UI)
                </h2>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1 text-accent_soft_black">
                    Employer Account Number
                    <span className="text-base text-red-500">*</span>
                    <Info
                      className="size-3.5 text-gray-500"
                      aria-label="Your 10-digit Alabama Department of Labor employer account number, e.g. 0123456700"
                    />
                  </label>
                  <input
                    maxLength={20}
                    placeholder="0123456700"
                    value={data?.ui_registration_number}
                    onChange={(e) =>
                      setData({
                        ...data,
                        ui_registration_number: e.target.value,
                      })
                    }
                    required
                    className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                  />
                  <a
                    href="https://labor.alabama.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm text-accent_soft_blue hover:underline"
                  >
                    Don't have an account number? Register here
                  </a>
                </div>
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

export default AlabamaTaxSettings;
