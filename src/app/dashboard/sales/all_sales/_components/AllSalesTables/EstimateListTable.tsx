'use client';
import { useFetch } from '@/app/helpers/hooks';
import { fetchSaleList } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import SalesListTable from './SalesListTable';
import { baseColumns, EditAction } from './salesColumns';

const EstimateListTable = () => {
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const canEdit = (Array.isArray(Permissions) ? Permissions : []).includes('change_sale');

  const { data, isPending, setQueryParams, params } = useFetch(
    ['sales_estimate_list'],
    fetchSaleList,
    { sale_type: 'estimate' }
  );

  return (
    <SalesListTable
      saleType="estimate"
      data={data}
      loading={isPending}
      params={params}
      setParams={setQueryParams}
      columns={baseColumns()}
      exportName="estimates"
      renderActions={(row) => (
        <EditAction href={`/dashboard/sales/all_sales/estimate/${row?.uid}`} canEdit={canEdit} />
      )}
    />
  );
};

export default EstimateListTable;
