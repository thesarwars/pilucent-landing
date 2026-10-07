'use client';
import { useFetch } from '@/app/helpers/hooks';
import { fetchPurchases } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import ExpensesListTable from './ExpensesListTable';
import { baseExpenseColumns, EditAction } from './expenseColumns';

const AllChequeListTable = ({ type, setType }: { type: any; setType: any }) => {
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const perms = Array.isArray(Permissions) ? Permissions : [];
  const canView = perms.includes('change_purchase') || perms.includes('view_purchase');

  const { data, isPending, params, setQueryParams } = useFetch(['cheque_list'], fetchPurchases, {
    is_cheque: true,
  });

  return (
    <ExpensesListTable
      type={type}
      setType={setType}
      data={data}
      loading={isPending}
      params={params}
      setParams={setQueryParams}
      columns={baseExpenseColumns('Cheque')}
      exportName="cheques"
      renderActions={(row) => (
        <EditAction href={`/dashboard/expenses/expenses/cheque/${row?.uid}`} canView={canView} />
      )}
    />
  );
};

export default AllChequeListTable;
