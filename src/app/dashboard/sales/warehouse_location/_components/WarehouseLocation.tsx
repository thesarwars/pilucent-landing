'use client';

import { FormEvent, useEffect, useState } from 'react';
import { fetchWarehouse, patchWarehouse, postWarehouse } from '@/app/helpers/backend';
import MainLoader from '@/components/MainLoader/MainLoader';
import { toast } from '@/lib/ToastService';
import { VioletButton, VioletInput, VioletSelect } from '@/components/violet';

type warehouseDataType = {
  title: string;
  short_name: string;
  full_address: string;
  remark: string;
  kind: string;
};

const WarehouseLocation = ({
  uid,
  setIsOpen,
  setValue,
  refetch,
  onSuccess,
}: {
  uid?: string;
  setIsOpen: any;
  setValue?: any;
  refetch?: any;
  onSuccess?: any;
}) => {
  const [warehouseData, setWarehouseData] = useState<warehouseDataType>({
    title: '',
    short_name: '',
    full_address: '',
    remark: '',
    kind: 'MAIN',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fn = async () => {
      try {
        setIsLoading(true);
        const res = await fetchWarehouse(uid);
        if (res) {
          setWarehouseData({
            title: res?.title || '',
            short_name: res?.short_name || '',
            full_address: res?.address?.full_address || '',
            remark: res?.remark || '',
            kind: res?.kind || '',
          });
        }
      } catch (error) {
        toast.error("Couldn't retrieve warehouse data");
      } finally {
        setIsLoading(false);
      }
    };
    if (uid) fn();
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setWarehouseData({
        title: '',
        short_name: '',
        full_address: '',
        remark: '',
        kind: 'MAIN',
      });
    }
  }, [uid]);

  const handleCreateWarehouse = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const nameLength = warehouseData.title.split('');
    const shortLength = warehouseData.short_name.split('');
    const locationLength = warehouseData.full_address.split('');
    if (nameLength?.length < 5) {
      return toast.warning('Name should be at least 5 characters');
    }
    if (shortLength?.length < 3) {
      return toast.warning('Shortname should be 3-5 characters');
    }
    if (locationLength?.length < 5) {
      return toast.warning('Address Should be more detailed');
    }
    try {
      setIsCreating(true);
      if (uid) {
        const res = await patchWarehouse(uid, warehouseData);
        if (res?.success) {
          toast.success('Warehouse updated.');
          setIsOpen(false);
          refetch && refetch();
          onSuccess && onSuccess();
        }
      } else {
        const res = await postWarehouse(warehouseData);
        if (res?.success) {
          toast.success('Warehouse created.');
          setIsOpen(false);
          refetch && refetch();
          onSuccess && onSuccess();
        }
      }
    } catch (error) {
      //error handling
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return <MainLoader className="h-[70vh]" color="#9ca3af" />;
  }

  return (
    <form onSubmit={handleCreateWarehouse} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <VioletInput
          label="Warehouse name"
          required
          placeholder="e.g. Central Warehouse"
          value={warehouseData.title}
          onChange={(e) => setWarehouseData((prev) => ({ ...prev, title: e.target.value }))}
        />
        <VioletInput
          label="Short name"
          required
          placeholder="Enter short name"
          value={warehouseData.short_name}
          onChange={(e) => setWarehouseData((prev) => ({ ...prev, short_name: e.target.value }))}
        />
      </div>

      <VioletInput
        label="Location / address"
        required
        placeholder="Street, city, state ZIP"
        value={warehouseData.full_address}
        onChange={(e) => setWarehouseData((prev) => ({ ...prev, full_address: e.target.value }))}
      />

      <VioletInput
        label="Remarks"
        placeholder="Optional"
        value={warehouseData.remark}
        onChange={(e) => setWarehouseData((prev) => ({ ...prev, remark: e.target.value }))}
      />

      <VioletSelect
        label="Warehouse type"
        required
        value={warehouseData.kind}
        onChange={(e) => setWarehouseData((prev) => ({ ...prev, kind: e.target.value }))}
      >
        <option value="MAIN">Main</option>
        <option value="TEMPORARY">Temporary</option>
      </VioletSelect>

      <div className="mt-1 flex items-center gap-2.5">
        <VioletButton
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </VioletButton>
        <VioletButton type="submit" variant="primary" className="flex-1" disabled={isCreating}>
          {isCreating ? 'Saving…' : uid ? 'Update warehouse' : 'Create warehouse'}
        </VioletButton>
      </div>
    </form>
  );
};

export default WarehouseLocation;
