'use client';
import { useFetch } from '@/app/helpers/hooks';
import { fetchExpenses } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import ExpensesListTable from './ExpensesListTable';
import { baseExpenseColumns, EditAction } from './expenseColumns';

const AllExpenseListTable = ({ type, setType }: { type: any; setType: any }) => {
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const perms = Array.isArray(Permissions) ? Permissions : [];
  const canView =
    perms.includes('change_expense') ||
    perms.includes('view_expense') ||
    perms.includes('change_purchase');

  const { data, isPending, params, setQueryParams } = useFetch(['expense_list'], fetchExpenses);

  return (
    <ExpensesListTable
      type={type}
      setType={setType}
      data={data}
      loading={isPending}
      params={params}
      setParams={setQueryParams}
      columns={baseExpenseColumns('Expense')}
      exportName="expenses"
      renderActions={(row) => (
        <EditAction href={`/dashboard/expenses/expenses/expense/${row?.uid}`} canView={canView} />
      )}
    />
  );
};

export default AllExpenseListTable;
