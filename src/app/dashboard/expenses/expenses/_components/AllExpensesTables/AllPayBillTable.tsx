'use client';
import { useFetch } from '@/app/helpers/hooks';
import { fetchPayBills } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import ExpensesListTable from './ExpensesListTable';
import { colDate, colType, colPayee, colTotal, colStatus, EditAction } from './expenseColumns';

const AllPayBillTable = ({ type, setType }: { type: any; setType: any }) => {
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const perms = Array.isArray(Permissions) ? Permissions : [];
  const canView =
    perms.includes('change_paybill') ||
    perms.includes('view_paybill') ||
    perms.includes('change_purchase');

  const { data, isPending, params, setQueryParams } = useFetch(['pay_bill_list'], fetchPayBills, {
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
      columns={[colDate(), colType('Pay Bill'), colPayee(), colTotal(), colStatus()]}
      exportName="pay-bills"
      renderActions={(row) => (
        <EditAction href={`/dashboard/expenses/expenses/pay-bill/${row?.uid}`} canView={canView} />
      )}
    />
  );
};

export default AllPayBillTable;
