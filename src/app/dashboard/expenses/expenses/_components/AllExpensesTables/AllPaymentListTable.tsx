'use client';
import { useFetch } from '@/app/helpers/hooks';
import { fetchPurchasePayments } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import ExpensesListTable from './ExpensesListTable';
import { colDate, colType, colPayee, colCurrency, colTotal, colStatus, EditAction } from './expenseColumns';

const AllPaymentListTable = ({ type, setType }: { type: any; setType: any }) => {
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const perms = Array.isArray(Permissions) ? Permissions : [];
  const canView =
    perms.includes('change_purchasepayment') ||
    perms.includes('view_purchasepayment') ||
    perms.includes('change_purchase');

  const { data, isPending, params, setQueryParams } = useFetch(
    ['bill_payment_list'],
    fetchPurchasePayments,
    { is_bill: false, is_cheque: false, is_via_expense: false }
  );

  return (
    <ExpensesListTable
      type={type}
      setType={setType}
      data={data}
      loading={isPending}
      params={params}
      setParams={setQueryParams}
      columns={[colDate(), colType('Bill Payment'), colPayee(), colCurrency(), colTotal(), colStatus()]}
      exportName="bill-payments"
      renderActions={(row) => (
        <EditAction href={`/dashboard/expenses/expenses/bill-payment/${row?.uid}`} canView={canView} />
      )}
    />
  );
};

export default AllPaymentListTable;
