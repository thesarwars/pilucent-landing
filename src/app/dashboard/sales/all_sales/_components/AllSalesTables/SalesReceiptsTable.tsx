'use client';
import { useFetch } from '@/app/helpers/hooks';
import { fetchSaleList } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import SalesListTable from './SalesListTable';
import { baseColumns, EditAction } from './salesColumns';

const SalesReceiptsTable = () => {
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const canEdit = (Array.isArray(Permissions) ? Permissions : []).includes('change_sale');

  const { data, isPending, setQueryParams, params } = useFetch(
    ['sales_sale_receipt_list'],
    fetchSaleList,
    { sale_type: 'sale_receipt' }
  );

  return (
    <SalesListTable
      saleType="sale receipt"
      data={data}
      loading={isPending}
      params={params}
      setParams={setQueryParams}
      columns={baseColumns()}
      exportName="sale-receipts"
      renderActions={(row) => (
        <EditAction href={`/dashboard/sales/all_sales/sales_receipt/${row?.uid}`} canEdit={canEdit} />
      )}
    />
  );
};

export default SalesReceiptsTable;
