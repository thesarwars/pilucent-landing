"use client";

import {  useState } from "react";
import {
  patchTransaction,
} from "@/app/helpers/backend";
import { toast } from "@/lib/ToastService";
import ResizableTable from "./BankingTable";

// Define our data type

const columns: any = [
  {
    dataField: "date",
    title: "Date",
    width: 150,
    sortable: true,
  },
  {
    dataField: "description",
    title: "Description",
    width: 200,
    sortable: true,
  },
  {
    dataField: "payee",
    title: "Payee",
    formatter: (item: any) =>
      `${item?.first_name || "-"} ${item?.middle_name || ""} ${item?.last_name || ""}`,
    width: 250,
    sortable: true,
  },
  {
    dataField: "category",
    title: "Category",
    width: 250,
    sortable: true,
  },
  {
    dataField: "received",
    title: "Received",
    width: 250,
    sortable: true,
  },
  {
    dataField: "spent",
    title: "Spent",
    width: 150,
    sortable: true,
  },
  {
    dataField: "rule",
    title: "Rule",
    width: 120,
    sortable: true,
  },
];

const CategorizedTransactionsTable = ({
  AccountRefetch,
  data,
  isPending,
  setQueryParams,
  params,
  refetch,
}: {
  AccountRefetch: any;
  data: any;
  isPending: any;
  setQueryParams: any;
  params: any;
  refetch: any;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.filter((col: any) => !col.hidden).map((col: any) => col.dataField),
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRow, setExpandedRow] = useState<string>();

  const handleSubmit = async (item: any) => {
    try {
      setIsLoading(true);
      const result = await patchTransaction({
        transactions: [
          {
            transaction_status: "FOR_REVIEW",
            uid: item?.uid,
          },
        ],
        undo:true
      });
      if (result?.success) {
        refetch();
        AccountRefetch();
        toast.success(`${result?.message?.split(" ")[0] || ""} transactions undone`);
      }
    } catch (error) {
      //error
    } finally {
      setIsLoading(false);
    }
  };
  const ExpendedElement = ({ item, index }: { item: any; index: number }) => {
    return (
      <tr className="text- bg-gray-50">
        <td
          colSpan={visibleColumns.length + 2}
          className="col-span-full px-8 py-4"
        >
          <div className="px-8 py-8">
            <h3>DESCRIPTION:</h3>
            <p>{item?.description}</p>
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleSubmit(item)}
              className="rounded-md bg-accent_soft_blue px-4 py-2 font-medium text-white active:scale-95"
            >
              Undo
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const handleBulkUndo = async () => {
    const SelectedData = data?.results?.filter((t: any) =>
      selectedRows.has(t?.uid),
    );
    const selectedDataPayload = SelectedData?.map((d: any) => {
      return { uid: d?.uid, transaction_status: "FOR_REVIEW" };
    });
    try {
      setIsLoading(true);
      const result = await patchTransaction({
        transactions: selectedDataPayload,
        undo: true
      });
      if (result?.success) {
        setSelectedRows(new Set());
        refetch();
        AccountRefetch();
        toast.success(`${result?.message?.split(" ")[0] || ""} transactions undone`,
        );
      }
    } catch (error) {
      //error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative font-lexend">
      {selectedRows?.size > 0 && (
        <div className="sticky top-0 z-[100] my-2 w-full px-2 rounded-md bg-blue-500">
          <div className="flex items-center flex-col md:flex-row  justify-between">
            <div className="text flex-1 text-nowrap font-normal text-white">
              {selectedRows?.size} transactions selected.
            </div>
            <div className="flex w-full items-center justify-center gap-8 py-3.5">
              <button
                onClick={handleBulkUndo}
                className="rounded-md border border-accent_soft_black bg-white px-5 py-1.5 font-normal text-accent_soft_black transition-colors  hover:bg-accent_soft_black hover:text-white active:scale-95"
              >
                Undo
              </button>
            </div>
            <div className="flex-1"></div>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="absolute left-0 top-0 z-[100] h-full w-full bg-white bg-opacity-60">
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div className="h-14 w-14 animate-spin rounded-full border-b-[4px] border-t-[4px] border-b-accent_soft_blue border-t-primary"></div>
          </div>
        </div>
      )}
      <ResizableTable
        setSelectedRows={setSelectedRows}
        selectedRows={selectedRows}
        setVisibleColumns={setVisibleColumns}
        visibleColumns={visibleColumns}
        setExpandedRow={setExpandedRow}
        expandedRow={expandedRow}
        refetch={refetch}
        params={params}
        setParams={setQueryParams}
        isPending={isPending}
        data={data}
        columns={columns}
        keyExtractor={(data: any) => data.uid}
        onRowClick={(data: any) => console.log(data)}
        emptyMessage="You haven’t categorized any transactions. When you confirm or edit a transaction, you’ll see it here."
        storageName="CategorizedTableBank"
        ActionFormatter={(item: any) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSubmit(item);
            }}
            className="rounded-md px-4 py-1.5 font-semibold text-accent_soft_blue hover:bg-opacity-90 active:scale-95"
          >
            Undo
          </button>
        )}
        ExpendedElement={({ item, index }: { item: any; index: any }) => (
          <ExpendedElement index={index} item={item} />
        )}
      />
    </div>
  );
};

export default CategorizedTransactionsTable;
