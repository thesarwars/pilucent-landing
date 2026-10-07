'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFetch } from '@/app/helpers/hooks';
import { fetchSaleList } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import SalesListTable from './SalesListTable';
import { baseColumns, EditAction } from './salesColumns';
import { getRowApiType, editRouteSegment } from './salesHelpers';

const AllListTable = () => {
  const isRecent = useSearchParams().get('recent');
  const isOverdue = useSearchParams().get('overdue');
  const isOpen = useSearchParams().get('open');
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const canEdit = (Array.isArray(Permissions) ? Permissions : []).includes('change_sale');

  const { data, isPending, setQueryParams, params } = useFetch(
    ['sales_all_documents_list'],
    fetchSaleList,
    { sale_type: 'all' }
  );

  // preserve the original status-filter wiring (recent/overdue/open)
  useEffect(() => {
    setQueryParams({
      ...params,
      status: isRecent ? 'PAID' : isOverdue ? 'OPEN' : isOpen ? 'OPEN' : '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecent, isOverdue, isOpen]);

  return (
    <SalesListTable
      saleType="all"
      data={data}
      loading={isPending}
      params={params}
      setParams={setQueryParams}
      columns={baseColumns()}
      exportName="all-sales"
      renderActions={(row) => (
        <EditAction
          href={`/dashboard/sales/all_sales/${editRouteSegment[getRowApiType(row)] || 'invoice'}/${row?.uid}`}
          canEdit={canEdit}
        />
      )}
    />
  );
};

export default AllListTable;
