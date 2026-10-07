'use client';
import Table from '@/app/(admin)/_components/Table';
import { fetchMoovTransactions } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import moment from 'moment';
import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { TransferStatusChip } from './TransferTimelineModal';
import TransferDetailModal from './TransferDetailModal';

/* The list rows come straight from Moov, where the transfer id has gone by a few
   names across endpoints. Try them all rather than guessing one. */
const getTransferUid = (row: any) =>
  row?.transfer_uid || row?.moov_transfer_uid || row?.transfer_id || row?.uid || '';

const baseColumns = [
  {
    text: 'Pay to',
    dataField: 'destination.bank_account.holder_name',
  },
  {
    text: 'Bank Name',
    dataField: 'destination.bank_account.bank_name',
  },
  {
    text: 'Account Number',
    dataField: 'destination.bank_account.last_four_account_number',
    formatter: (cell: any) => {
      return <>*********{cell}</>;
    },
  },
  {
    text: 'Payment Method Type',
    dataField: 'destination.payment_method_type',
  },
  {
    text: 'Pay Period',
    dataField: 'description',
  },
  {
    text: 'Transfer Date',
    dataField: 'created_on',
    formatter: (cell: any, row: any) => {
      return moment(cell).format('DD MMMM, YYYY');
    },
  },
  {
    text: 'Amount',
    dataField: 'amount.value',
    formatter: (cell: any, row: any) => {
      return new Intl.NumberFormat('en-us', {
        style: 'currency',
        currency: 'USD',
      }).format(cell / 100 || 0);
    },
  },
  {
    text: 'Status',
    dataField: 'status',
    formatter: (cell: any) => <TransferStatusChip status={cell} />,
  },
];

/* Both tables are the same grid over the same endpoint — only the status filter
   and the query key differ. */
const MoovTransferTable = ({
  status,
  queryKey,
  emptyDataMessage,
}: {
  status: string;
  queryKey: string;
  emptyDataMessage: string;
}) => {
  const { data, isPending, setQueryParams, params, refetch } = useFetch([queryKey], fetchMoovTransactions, {
    status,
  });
  const queryClient = useQueryClient();

  const [openUid, setOpenUid] = useState<string>('');
  const [openRow, setOpenRow] = useState<any>(null);

  const openTimeline = (row: any) => {
    const uid = getTransferUid(row);
    if (!uid) return;
    setOpenRow(row);
    setOpenUid(uid);
  };

  return (
    <div>
      <Table
        isCheckbox={false}
        isScreen={false}
        headerShown={false}
        emptyDataMessage={emptyDataMessage}
        data={{
          results: Array.isArray(data?.data) ? data?.data : [],
          count: data?.data?.length,
          next: null,
          previous: null,
        }}
        loading={isPending}
        setParams={setQueryParams}
        params={params}
        refetch={refetch}
        columns={baseColumns}
        ActionFormatter={(row: any) => {
          const uid = getTransferUid(row);
          return (
            <button
              type="button"
              onClick={() => openTimeline(row)}
              disabled={!uid}
              title={uid ? 'View transfer detail' : 'No transfer id on this row'}
              aria-label="View transfer detail"
              className="rounded-full bg-table_success_light p-2 text-table_success transition-colors hover:bg-table_success hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-table_success_light disabled:hover:text-table_success"
            >
              <Eye className="h-4 w-4" />
            </button>
          );
        }}
      />

      <TransferDetailModal
        key={openUid}
        isOpen={!!openUid}
        transferUid={openUid}
        row={openRow}
        onClose={() => {
          setOpenUid('');
          setOpenRow(null);
        }}
        onCanceled={() => {
          // Row leaves the pending list and the tab badges shift, so refresh both.
          refetch();
          queryClient.invalidateQueries({ queryKey: ['salary-process-tab-counts'] });
        }}
      />
    </div>
  );
};

export const PaymentHistoryTable = () => (
  <MoovTransferTable
    status="completed"
    queryKey="transaction-history"
    emptyDataMessage="No completed payments yet"
  />
);

export const PendingPaymentTable = () => (
  <MoovTransferTable
    status="pending"
    queryKey="pending-transfers"
    emptyDataMessage="No pending payments"
  />
);

export const CanceledPaymentTable = () => (
  <MoovTransferTable
    status="canceled"
    queryKey="canceled-transfers"
    emptyDataMessage="No canceled payments"
  />
);
