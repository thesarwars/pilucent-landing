'use client';
import { useFetch } from '@/app/helpers/hooks';
import { fetchCreditNotes } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import ExpensesListTable from './ExpensesListTable';
import {
  colDate,
  colType,
  colPayee,
  colCurrency,
  colBeforeTax,
  colSalesTax,
  colTotal,
  colStatus,
  EditAction,
} from './expenseColumns';

const AllCreditListTable = ({ type, setType }: { type: any; setType: any }) => {
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const perms = Array.isArray(Permissions) ? Permissions : [];
  const canView =
    perms.includes('change_creditnote') ||
    perms.includes('view_creditnote') ||
    perms.includes('change_purchase');

  const { data, isPending, params, setQueryParams } = useFetch(
    ['credit_expense_list'],
    fetchCreditNotes,
    { kind: 'PURCHASE' }
  );

  return (
    <ExpensesListTable
      type={type}
      setType={setType}
      data={data}
      loading={isPending}
      params={params}
      setParams={setQueryParams}
      columns={[
        colDate(),
        colType('Supplier Credit'),
        colPayee(),
        colCurrency(),
        colBeforeTax(),
        colSalesTax(),
        colTotal(),
        colStatus(),
      ]}
      exportName="supplier-credits"
      renderActions={(row) => (
        <EditAction href={`/dashboard/expenses/expenses/supplier-credit/${row?.uid}`} canView={canView} />
      )}
    />
  );
};

export default AllCreditListTable;
