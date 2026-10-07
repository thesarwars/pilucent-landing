'use client';
import { useFetch } from '@/app/helpers/hooks';
import { fetchPurchases } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import ExpensesListTable from './ExpensesListTable';
import { baseExpenseColumns, EditAction } from './expenseColumns';

const AllPurchaseTable = ({ type, setType }: { type: any; setType: any }) => {
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const perms = Array.isArray(Permissions) ? Permissions : [];
  const canView = perms.includes('change_purchase') || perms.includes('view_purchase');

  const { data, isPending, params, setQueryParams } = useFetch(['purchase_list'], fetchPurchases, {
    is_bill: false,
    is_cheque: false,
    is_via_expense: false,
  });

  return (
    <ExpensesListTable
      type={type}
      setType={setType}
      data={data}
      loading={isPending}
      params={params}
      setParams={setQueryParams}
      columns={baseExpenseColumns('Purchase')}
      exportName="purchase-orders"
      renderActions={(row) => (
        <EditAction href={`/dashboard/expenses/expenses/purchase/${row?.uid}`} canView={canView} />
      )}
    />
  );
};

export default AllPurchaseTable;
