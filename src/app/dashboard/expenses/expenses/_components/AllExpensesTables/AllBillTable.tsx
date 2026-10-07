'use client';
import { useRouter } from 'next/navigation';
import { Wallet, FilePlus2 } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchBills } from '@/app/helpers/backend';
import { encryptData } from '@/app/helpers/crypto';
import { useAppSelector } from '@/app/redux/store';
import ExpensesListTable from './ExpensesListTable';
import { baseExpenseColumns, EditAction, ICON_BTN } from './expenseColumns';

const AllBillTable = ({ type, setType }: { type: any; setType: any }) => {
  const router = useRouter();
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const perms = Array.isArray(Permissions) ? Permissions : [];
  const canView = perms.includes('change_purchase') || perms.includes('view_purchase');

  const { data, isPending, params, setQueryParams } = useFetch(['bill_list'], fetchBills, {
    is_bill: true,
  });

  const givePayment = (row: any) => {
    const bill = encryptData({
      purchase_id: row?.purchase_id,
      uid: row?.uid,
      due_date: row?.due_date,
      total: row?.total,
      due_total: parseFloat(row?.due_total),
      payment: parseFloat(row?.due_total),
    });
    router.push(
      `/dashboard/expenses/expenses/bill-payment?c=${encryptData(row?.supplier)}&b=${bill}`
    );
  };
  const createBill = (row: any) =>
    router.push(`/dashboard/expenses/expenses/bill?c=${encryptData(row?.supplier)}`);

  return (
    <ExpensesListTable
      type={type}
      setType={setType}
      data={data}
      loading={isPending}
      params={params}
      setParams={setQueryParams}
      columns={baseExpenseColumns('Bill')}
      exportName="bills"
      renderActions={(row) => (
        <>
          {Number(row?.due_total) > 0 ? (
            <button type="button" title="Give payment" onClick={() => givePayment(row)} className={ICON_BTN}>
              <Wallet className="h-[15px] w-[15px]" />
            </button>
          ) : (
            <button type="button" title="Create bill" onClick={() => createBill(row)} className={ICON_BTN}>
              <FilePlus2 className="h-[15px] w-[15px]" />
            </button>
          )}
          <EditAction href={`/dashboard/expenses/expenses/bill/${row?.uid}`} canView={canView} />
        </>
      )}
    />
  );
};

export default AllBillTable;
