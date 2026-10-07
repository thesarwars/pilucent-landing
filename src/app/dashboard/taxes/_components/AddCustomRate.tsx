'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import AgencySelectDropDown from '../../../../components/ui/ScrollSelectDropDowns/AgencySelectDropDown';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import { postTaxRate } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import { VioletButton, VioletInput } from '@/components/violet';
import { cn } from '@/lib/utils';

const fieldLabel = 'mb-1.5 block text-xs font-semibold text-v-ink700';

const AddCustomRate = ({
  data,
  onSuccess,
  setIsOpen,
  refetch,
}: {
  refetch?: any;
  data?: any;
  onSuccess?: any;
  setIsOpen?: any;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [taxData, setTaxData] = useState<any[]>([
    { nickname: '', rate: '', agency: '', sales_tax_account: '' },
  ]);
  const [isSingle, setIsSingle] = useState<any>(true);

  useEffect(() => {
    if (data?.uid) {
      setIsSingle(data?.is_single);
      setTitle(data?.title);
      setTaxData(data?.tax_group);
    }
  }, [data]);

  const handleSubmit = async (e: FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    e.stopPropagation();
    try {
      const rows = isSingle ? taxData.slice(0, 1) : taxData;
      const total = rows?.reduce((prev, row) => prev + Number(row?.rate), 0);
      if (data?.uid) {
        const taxSet = rows?.map((d) => ({
          uid: d?.uid,
          nickname: d?.nickname,
          rate: d?.rate,
          agency_uid: d?.agency?.uid,
          sales_tax_uid: d?.sales_tax_account?.uid,
        }));
        const result = await postTaxRate({
          uid: data?.uid,
          title,
          is_single: isSingle,
          total_rate: total,
          tax_set: taxSet,
        });
        if (result.success) {
          handleReset();
          toast.success('Custom Rate Updated');
          setIsOpen(false);
          refetch && refetch();
        }
      } else {
        const taxSet = rows?.map((d) => ({
          nickname: d?.nickname,
          rate: d?.rate,
          agency_uid: d?.agency?.uid,
          sales_tax_uid: d?.sales_tax_account?.uid,
        }));
        const result = await postTaxRate({
          title,
          is_single: isSingle,
          total_rate: total,
          tax_set: taxSet,
        });
        if (result.success) {
          handleReset();
          toast.success('Custom Rate Created');
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

  const handleOnChange = (value: any, field: string, index: number) => {
    setTaxData((prev) => prev?.map((row, idx) => (index === idx ? { ...row, [field]: value } : row)));
  };

  const handleReset = () => {
    setIsSingle(true);
    setTitle('');
    setTaxData([{ nickname: '', rate: '', agency: '', sales_tax_account: '' }]);
  };

  useEffect(() => {
    if (!data?.uid) handleReset();
  }, [data]);

  const rows = isSingle ? taxData.slice(0, 1) : taxData;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* single / combined segmented toggle */}
      <div className="flex items-center gap-1 rounded-full bg-v-wash2 p-1">
        {[
          { key: true, label: 'Single' },
          { key: false, label: 'Combined' },
        ].map((opt) => {
          const active = isSingle === opt.key;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => setIsSingle(opt.key)}
              className={cn(
                'flex-1 rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors',
                active ? 'bg-white text-v-primary shadow-sm' : 'text-v-ink500 hover:text-v-ink900'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <VioletInput
        label="Name"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. NYC Combined"
      />

      {rows?.map((row, index) => (
        <div
          key={index}
          className={cn(
            'flex flex-col gap-3',
            !isSingle && 'rounded-v-card border border-v-border bg-v-card-subtle p-3.5'
          )}
        >
          {!isSingle && (
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-v-ink700">Component {index + 1}</span>
              {taxData.length > 1 && (
                <button
                  type="button"
                  onClick={() => setTaxData((prev) => prev.filter((_, i) => i !== index))}
                  className="text-[11.5px] font-semibold text-v-danger-fg hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          )}

          <div className="flex items-end gap-3">
            {!isSingle && (
              <VioletInput
                label="Nickname"
                required
                wrapClassName="flex-1"
                value={row.nickname}
                onChange={(e) => handleOnChange(e.target.value, 'nickname', index)}
                placeholder="Nickname"
              />
            )}
            <VioletInput
              label="Rate"
              required
              type="number"
              wrapClassName="flex-1"
              value={row.rate}
              onChange={(e) => handleOnChange(e.target.value, 'rate', index)}
              placeholder="%"
            />
          </div>

          <div>
            <label className={fieldLabel}>Agency</label>
            <AgencySelectDropDown
              setValue={(e: any) => handleOnChange(e, 'agency', index)}
              value={row?.agency}
              ClassName="rounded-v-input border border-v-border focus:border-v-primary"
              required
            />
          </div>

          <div>
            <label className={fieldLabel}>Sales tax account</label>
            <AccountSelectDropDown
              value={row?.sales_tax_account}
              setValue={(e: any) => handleOnChange(e, 'sales_tax_account', index)}
              ClassName="rounded-v-input border border-v-border focus:border-v-primary"
            />
          </div>
        </div>
      ))}

      {!isSingle && (
        <VioletButton
          type="button"
          variant="soft"
          className="self-start"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() =>
            setTaxData([...taxData, { nickname: '', rate: '', agency: '', sales_tax_account: '' }])
          }
        >
          Add another rate
        </VioletButton>
      )}

      <div className="mt-2 flex items-center gap-2.5">
        <VioletButton
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => {
            handleReset();
            setIsOpen && setIsOpen(false);
          }}
        >
          Cancel
        </VioletButton>
        <VioletButton type="submit" variant="primary" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving…' : 'Save rate'}
        </VioletButton>
      </div>
    </form>
  );
};

export default AddCustomRate;
