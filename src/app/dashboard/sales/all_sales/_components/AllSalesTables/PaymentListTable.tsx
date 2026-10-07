'use client';
import { useFetch } from '@/app/helpers/hooks';
import { fetchSaleList } from '@/app/helpers/backend';
import SalesListTable from './SalesListTable';
import {
  colDate,
  colCustomer,
  colType,
  colInvoice,
  colAmount,
  colDueTotal,
  colStatus,
} from './salesColumns';

const PaymentListTable = () => {
  const { data, isPending, setQueryParams, params } = useFetch(
    ['sales_payment_received_list'],
    fetchSaleList,
    { sale_type: 'payment_received' }
  );

  return (
    <SalesListTable
      saleType="payment received"
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
      exportName="payments-received"
    />
  );
};

export default PaymentListTable;
