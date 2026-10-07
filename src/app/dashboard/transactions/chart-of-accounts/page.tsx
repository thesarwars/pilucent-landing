'use client';
import React, { useState, useEffect } from 'react';
import { DeleteData } from '@/services/company';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useFetch } from '@/app/helpers/hooks';
import { fetchAccounts, postDeactivateAccount } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import { isDeleteBlockedByHistory, parseDeactivateError, toastDeleteError } from '@/lib/helpers/apiErrors';
import AccountsTable from './_components/AccountsTable';
import AccountFormDrawer from './_components/AccountFormDrawer';

const Page = () => {
  const [uid, setUid] = useState<string>('');
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const { data, isPending, refetch, setQueryParams, params } = useFetch(
    ['chart-of-accounts'],
    fetchAccounts
  );
  const { Permissions } = useAppSelector((state) => state.Permissions);

  useEffect(() => {
    document.title = 'Chart Of Accounts';
  }, []);

 
  const offerDeactivateInstead = (uid: string) => {
    Swal.fire({
      title: 'Deactivate this account instead?',
      text: 'It keeps its balance and history but is hidden from new documents. You can make it active again at any time.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6A6EF6',
      cancelButtonColor: '#00035F',
      confirmButtonText: 'Yes, deactivate it',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        await postDeactivateAccount(uid);
        toast.success('Account deactivated.');
        refetch();
      } catch (error: any) {
        const refusal = parseDeactivateError(error?.response?.data);
        toast.error(refusal.message, { autoClose: 7000 });
      }
    });
  };

  const handleDeleteClick = async (uid: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6A6EF6',
      cancelButtonColor: '#00035F',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await DeleteData('we/chart-of-accounts/', uid, '');
          if (res.success) {
            refetch();
            toast.success('Account deleted successfully');
            return;
          }
          toastDeleteError(res.message, res.status);
          if (isDeleteBlockedByHistory(res.message, res.status)) offerDeactivateInstead(uid);
        } catch (error: any) {
          toastDeleteError(error?.body ?? error?.message, error?.status);
          if (isDeleteBlockedByHistory(error?.body ?? error?.message, error?.status)) {
            offerDeactivateInstead(uid);
          }
        }
      }
    });
  };

  const handleEditClick = (uid: string) => {
    setMode('edit');
    setUid(uid);
    setDrawerOpen(true);
  };

  const handleOpenModalForCreate = () => {
    setMode('create');
    setUid('');
    setDrawerOpen(true);
  };

  return (
    <>
      <AccountsTable
        data={data}
        loading={isPending}
        params={params}
        setParams={setQueryParams}
        permissions={Permissions}
        onCreate={handleOpenModalForCreate}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        refetch={refetch}
      />
      <AccountFormDrawer
        open={drawerOpen}
        mode={mode}
        uid={uid}
        onClose={() => setDrawerOpen(false)}
        refetch={refetch}
      />
    </>
  );
};

export default Page;
