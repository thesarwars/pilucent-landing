'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wallet, FilePlus2 } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { fetchSaleList } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import { encryptData } from '@/app/helpers/crypto';
import SalesListTable from './SalesListTable';
import {
  EditAction,
  ICON_BTN,
  colDate,
  colCustomer,
  colType,
  colInvoice,
  colAmount,
  colDueTotal,
  colStatus,
} from './salesColumns';

const InvoiceListTable = () => {
  const isRecent = useSearchParams().get('recent');
  const isOverdue = useSearchParams().get('overdue');
  const isOpen = useSearchParams().get('open');
  const router = useRouter();
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const canEdit = (Array.isArray(Permissions) ? Permissions : []).includes('change_sale');

  const { data, isPending, setQueryParams, params } = useFetch(
    ['sales_invoice_list'],
    fetchSaleList,
    { sale_type: 'invoice' }
  );

  useEffect(() => {
    setQueryParams({
      ...params,
      status: isRecent ? 'PAID' : isOverdue ? 'OPEN' : isOpen ? 'OPEN' : '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecent, isOverdue, isOpen]);

  // bespoke actions ported from the original ActionFormatter (ungated, like before)
  const receivePayment = (row: any) => {
    const invData = {
      uid: row?.uid,
      due_date: row?.due_date || '',
      total: row?.total,
      due_total: row?.due_total,
      invoice_id: row?.invoice_id,
    };
    router.push(
      `/dashboard/sales/all_sales/payment?c=${encryptData(row?.customer)}&inv=${encryptData(invData)}`
    );
  };
  const createInvoice = (row: any) =>
    router.push(`/dashboard/sales/all_sales/invoice?c=${encryptData(row?.customer)}`);

  return (
    <SalesListTable
      saleType="invoice"
      data={data}
      loading={isPending}
      params={params}
      setParams={setQueryParams}
      columns={[
        colDate(),
        colCustomer(),
        colType(),
        colInvoice(),
        colAmount(),
        colDueTotal(),
        colStatus(),
      ]}
      exportName="invoices"
      renderActions={(row) => (
        <>
          {Number(row?.due_total) > 0 ? (
            <button
              type="button"
              title="Receive payment"
              onClick={() => receivePayment(row)}
              className={ICON_BTN}
            >
              <Wallet className="h-[15px] w-[15px]" />
            </button>
          ) : (
            <button
              type="button"
              title="Create invoice"
              onClick={() => createInvoice(row)}
              className={ICON_BTN}
            >
              <FilePlus2 className="h-[15px] w-[15px]" />
            </button>
          )}
          <EditAction href={`/dashboard/sales/all_sales/invoice/${row?.uid}`} canEdit={canEdit} />
        </>
      )}
    />
  );
};

export default InvoiceListTable;
