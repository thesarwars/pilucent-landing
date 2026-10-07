'use client';
import { useFetch } from '@/app/helpers/hooks';
import { fetchSaleList } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import SalesListTable from './SalesListTable';
import { baseColumns, EditAction } from './salesColumns';

const CreditNoteListTable = () => {
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const canEdit = (Array.isArray(Permissions) ? Permissions : []).includes('change_sale');

  const { data, isPending, setQueryParams, params } = useFetch(
    ['sales_credit_list'],
    fetchSaleList,
    { sale_type: 'credit_note' }
  );

  return (
    <SalesListTable
      saleType="credit note"
      data={data}
      loading={isPending}
      params={params}
      setParams={setQueryParams}
      columns={baseColumns()}
      exportName="credit-notes"
      renderActions={(row) => (
        <EditAction href={`/dashboard/sales/all_sales/credit_note/${row?.uid}`} canEdit={canEdit} />
      )}
    />
  );
};

export default CreditNoteListTable;
