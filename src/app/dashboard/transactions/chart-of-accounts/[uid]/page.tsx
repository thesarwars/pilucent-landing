'use client';

import { use, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchChartOfAccount, getChartOfAccount } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { useAppSelector } from '@/app/redux/store';
import { VioletSurface } from '@/components/violet';
import BankRegister from './_components/BankRegister';

const Page = (props: { params: Promise<{ uid: string }> }) => {
  const { uid } = use(props.params);
  const { Permissions } = useAppSelector((state) => state.Permissions);

  const { data: account, isPending: accountLoading } = useQuery({
    queryKey: ['chart-of-account', uid],
    queryFn: () => getChartOfAccount(uid),
    enabled: !!uid,
    refetchOnWindowFocus: false,
  });

  const { data, isPending, isError, error, setQueryParams, params } = useFetch(
    ['bank_statement', uid],
    (query: any) => fetchChartOfAccount(uid, query),
    { limit: 25 }
  );

  useEffect(() => {
    document.title = 'Bank Register';
  }, []);

  return (
    <VioletSurface className="min-h-screen">
      <BankRegister
        account={account}
        accountLoading={accountLoading}
        data={data}
        loading={isPending}
        error={isError}
        queryError={error}
        params={params}
        setParams={setQueryParams}
        permissions={Permissions}
      />
    </VioletSurface>
  );
};

export default Page;
