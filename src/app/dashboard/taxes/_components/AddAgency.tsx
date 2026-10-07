'use client';

import { FormEvent, useEffect, useState } from 'react';
import { fetchAgency, patchAgency, postAgency } from '@/app/helpers/backend';
import { fillFreqOptions, Months } from '@/lib/helpers/TaxesAndAgencies';
import { USStates } from '@/lib/helpers/UsaStates';
import { toast } from '@/lib/ToastService';
import { VioletButton, VioletInput, VioletSelect } from '@/components/violet';

const AddAgency = ({
  uid,
  onSuccess,
  setIsOpen,
  refetch,
}: {
  refetch?: any;
  uid?: string;
  onSuccess?: any;
  setIsOpen?: any;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [agencyData, setAgencyData] = useState({
    title: '',
    filling_frequency: '',
    start_of_period: '',
    date: '',
    reporting_method: '',
    state: '',
  });

  useEffect(() => {
    if (uid) {
      const fn = async () => {
        try {
          const res = await fetchAgency(uid);
          if (res?.uid) {
            const loadedState = res?.state || '';
            let loadedTitle = res?.title;

            // Auto-set title for NY and MN states
            if (loadedState === 'NY') {
              loadedTitle = 'NYC Department of Taxation and Finance';
            } else if (loadedState === 'MN') {
              loadedTitle = 'Minnesota Department of Revenue';
            }

            setAgencyData({
              ...agencyData,
              title: loadedTitle,
              filling_frequency: res?.filling_frequency,
              start_of_period: res?.start_of_period,
              date: res?.date,
              reporting_method: res?.reporting_method,
              state: loadedState,
            });
          }
        } catch (error) {
          toast.error('Error occurred while getting data');
        }
      };
      fn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const handleSubmit = async (e: FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    e.stopPropagation();
    try {
      if (uid) {
        const result = await patchAgency(uid, agencyData);
        if (result.success) {
          toast.success('Agency Updated');
          setIsOpen(false);
          refetch && refetch();
        }
      } else {
        const result = await postAgency(agencyData);
        if (result.success) {
          setAgencyData({
            title: '',
            filling_frequency: 'DAILY',
            start_of_period: '',
            date: '',
            reporting_method: 'ACCRUAL',
            state: '',
          });
          toast.success('Agency Created');
          setIsOpen(false);
          refetch && refetch();
          onSuccess && onSuccess(result);
        }
      }
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (uid) return;
    setAgencyData({
      title: '',
      filling_frequency: 'DAILY',
      start_of_period: '',
      date: '',
      reporting_method: 'ACCRUAL',
      state: '',
    });
  }, [uid]);

  // Auto-set agency name based on state selection
  useEffect(() => {
    if (agencyData.state === 'NY') {
      setAgencyData((prev) => ({ ...prev, title: 'NYC Department of Taxation and Finance' }));
    } else if (agencyData.state === 'MN') {
      setAgencyData((prev) => ({ ...prev, title: 'Minnesota Department of Revenue' }));
    } else if (agencyData.state && agencyData.state !== '') {
      setAgencyData((prev) => ({ ...prev, title: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyData.state]);

  const isAgencyNameDisabled = agencyData.state === 'NY' || agencyData.state === 'MN';

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <VioletSelect
          label="State"
          required
          value={agencyData.state || ''}
          onChange={(e) => setAgencyData({ ...agencyData, state: e.target.value })}
        >
          <option value="">Select</option>
          {USStates?.map((state) => (
            <option key={state.value} value={state.value}>
              {state.title}
            </option>
          ))}
        </VioletSelect>
      </div>

      <div className="col-span-2">
        <VioletInput
          label="Agency name"
          required
          disabled={isAgencyNameDisabled}
          value={agencyData.title}
          onChange={(e) => setAgencyData((prev) => ({ ...prev, title: e.target.value }))}
          className={isAgencyNameDisabled ? 'cursor-not-allowed bg-v-wash2' : undefined}
          hint={
            isAgencyNameDisabled
              ? `Automatically set for ${agencyData.state === 'NY' ? 'New York' : 'Minnesota'}.`
              : undefined
          }
        />
      </div>

      <VioletSelect
        label="Filing frequency"
        required
        value={agencyData.filling_frequency}
        onChange={(e) => setAgencyData((prev) => ({ ...prev, filling_frequency: e.target.value }))}
      >
        <option value="">Choose frequency</option>
        {fillFreqOptions.map((freq) => (
          <option key={freq.value} value={freq.value}>
            {freq.title}
          </option>
        ))}
      </VioletSelect>

      <VioletSelect
        label="Start of tax period"
        required
        value={agencyData.start_of_period}
        onChange={(e) => setAgencyData((prev) => ({ ...prev, start_of_period: e.target.value }))}
      >
        <option value="">Choose month</option>
        {Months.map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </VioletSelect>

      <VioletInput
        label="Start date"
        required
        type="date"
        value={agencyData.date}
        onChange={(e) => setAgencyData((prev) => ({ ...prev, date: e.target.value }))}
      />

      <VioletSelect
        label="Reporting method"
        required
        value={agencyData.reporting_method}
        onChange={(e) => setAgencyData((prev) => ({ ...prev, reporting_method: e.target.value }))}
      >
        <option value="">Choose method</option>
        <option value="ACCRUAL">Accrual</option>
        <option value="CASH">Cash</option>
      </VioletSelect>

      <div className="col-span-2 mt-2 flex items-center gap-2.5">
        <VioletButton
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => setIsOpen && setIsOpen(false)}
        >
          Cancel
        </VioletButton>
        <VioletButton type="submit" variant="primary" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Save agency'}
        </VioletButton>
      </div>
    </form>
  );
};

export default AddAgency;
