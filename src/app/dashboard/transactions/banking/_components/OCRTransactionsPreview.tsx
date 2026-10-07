import {
  postTransactions,
} from "@/app/helpers/backend";
import Button from "@/components/ui/RawButton";
import { toast } from "@/lib/ToastService";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";

const OCRTransactionsList = ({
  account,
  data,
  selectedRows,
  setSelectedRows,
  setEditingTransaction,
  selectedOption,
  setSelectedOption,
  setReversedArray,
  reversedArray,
  setStep,
}: {
  account: any;
  setStep: any;
  setEditingTransaction: any;
  data: any[];
  selectedRows: any;
  setSelectedRows: any;
  selectedOption: any;
  setSelectedOption: any;
  setReversedArray: any;
  reversedArray: any;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [upsertedCount, setUpsertedCount] = useState(0);

  const handleCheckboxChange = (id: number) => {
    setSelectedRows((prev: any) => {
      const UpdatedRows = new Set(prev);
      if (UpdatedRows.has(id)) {
        setIsAllSelected(false);
        UpdatedRows.delete(id);
      } else {
        UpdatedRows.add(id);
      }
      return UpdatedRows;
    });
  };

  const handleSelectAllChange = () => {
    setIsAllSelected(!isAllSelected);

    if (!isAllSelected && data) {
      const allIds = data?.map((row: any, idx: number) => idx);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  const parseDecimal = (input: any) => {
    if (typeof input !== "string") return 0;

    // Remove any non-numeric characters except dot and minus sign
    const cleaned = input
      // .replace(/[“”"']/g, "") // Remove fancy or straight quotes
      .replace(/,/g, "") // Remove commas
      .trim();

    const number = parseFloat(cleaned);
    return isNaN(number) ? 0 : number;
  };

  const convertData = (data: any) => {
    return data.map((d: any) => {
      if (Number(d?.deposits_additions > 0)) {
        return {
          date: d?.date,
          description: d?.description,
          received: parseDecimal(d?.deposits_additions),
          // spent: parseDecimal(item?.withdrawals_subtractions),
          category: d?.category,
          is_spam: d?.is_spam,
        };
      } else {
        return {
          date: d?.date,
          description: d?.description,
          // received: parseDecimal(d?.deposits_additions),
          spent: parseDecimal(d?.withdrawals_subtractions),
          category: d?.category,
          is_spam: d?.is_spam,
        };
      }
      // return {
      //   date: item?.date,
      //   description: item?.description,
      //   received: parseDecimal(item?.deposits_additions),
      //   spent: parseDecimal(d?.withdrawals_subtractions),
      //   category: d?.category,
      //   is_spam: d?.is_spam,
      //   // chart_of_account: account?.uid,
      //   // transaction_status: "FOR_REVIEW",
      //   // check_number: "",
      // };
    });
  };

  const handleSubmit = async () => {
    const dataToSubmit = (
      selectedOption == "reversed" ? reversedArray : data
    )?.filter((t: any, idx: any) => selectedRows.has(idx));
    const Transactions = convertData(dataToSubmit);
    if (dataToSubmit?.length) {
      try {
        setIsLoading(true);
        const results = await postTransactions({
          transactions: Transactions,
          chart_of_account: account?.uid,
        });

        if (results.success) {
          if (results?.transactions?.length > 0) {
            // if (results?.upserted?.length == Transactions?.length) {
            //   setUpsertedCount(results?.upserted?.length || 0)
            setStep(5);
            toast.success(
              `${results?.transactions?.length || ""} transactions imported.`,
            );
            // }
          }
        }
      } catch (error) {
        toast.error("Some transactions couldn't be imported");
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.info("Select transactions to submit");
    }
  };

  const handleValueChange = (value: string) => {
    if (value == "reversed") {
      const reversed = data?.map((pd: any) => {
        return {
          ...pd,
          deposits_additions: pd?.withdrawals_subtractions,
          withdrawals_subtractions: pd?.deposits_additions,
        };
      });
      setReversedArray(reversed);
    }
  };

  return (
    <div>
      {isLoading && (
        <div className="absolute left-0 top-0 z-[100] h-full w-full bg-white bg-opacity-70">
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-b-[5px] border-t-[5px] border-b-accent_soft_blue border-t-primary"></div>
          </div>
        </div>
      )}
      <div className="w-full overflow-auto rounded-lg bg-white">
        <div className="mb-2 space-y-2">
          <label className="flex cursor-pointer items-center rounded-md p-3 hover:bg-gray-50">
            <div className="relative mr-3 flex items-center justify-center">
              <input
                type="radio"
                name="transactionValues"
                value="original"
                checked={selectedOption === "original"}
                onChange={() => {
                  setSelectedOption("original");
                  handleValueChange("original");
                }}
                className="h-5 w-5 border-gray-300 text-green-600 focus:ring-green-500"
              />
            </div>
            <span className="text-gray-800">Keep original values</span>
          </label>

          <label className="flex cursor-pointer items-center rounded-md p-3 hover:bg-gray-50">
            <div className="relative mr-3 flex items-center justify-center">
              <input
                type="radio"
                name="transactionValues"
                value="reversed"
                checked={selectedOption === "reversed"}
                onChange={() => {
                  handleValueChange("reversed");
                  setSelectedOption("reversed");
                }}
                className="h-5 w-5 border-gray-300 text-green-600 focus:ring-green-500"
              />
            </div>
            <span className="text-gray-800">Reverse all values</span>
          </label>
        </div>
        <h2 className="mb-4 text-xl font-bold">Review Transactions</h2>

        <table className="w-full border-collapse rounded-md border p-4 text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="whitespace-nowrap px-2">
                {" "}
                <div
                  className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded ${
                    isAllSelected
                      ? "bg-indigo-600"
                      : "border border-gray-400 bg-white"
                  }`}
                  onClick={() => {
                    handleSelectAllChange();
                  }}
                >
                  {isAllSelected && <FaCheck className="h-3 w-3 text-white" />}
                </div>
              </th>
              <th className="whitespace-nowrap px-2 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600">
                Date
              </th>
              <th className="whitespace-nowrap px-2 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600">
                Description
              </th>
              <th className="whitespace-nowrap px-2 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600">
                Category
              </th>
              <th className="whitespace-nowrap px-2 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600">
                Received
              </th>
              <th className="whitespace-nowrap px-2 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600">
                Spent
              </th>
              <th className="whitespace-nowrap px-2 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600">
                Spam
              </th>
              <th className="whitespace-nowrap px-2 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {(selectedOption != "reversed" ? data : reversedArray).map(
              (transaction: any, idx: number) => (
                <tr key={idx} className="border-t">
                  <td className="px-2">
                    <div
                      className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded ${
                        selectedRows?.has(idx)
                          ? "bg-indigo-600"
                          : "border border-gray-400 bg-white"
                      }`}
                      onClick={() => {
                        handleCheckboxChange(idx);
                      }}
                    >
                      {selectedRows?.has(idx) && (
                        <FaCheck className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-center text-sm uppercase tracking-wider text-gray-600">
                    {transaction?.date}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-center text-sm uppercase tracking-wider text-gray-600">
                    {transaction?.description}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-center text-sm uppercase tracking-wider text-gray-600">
                    {transaction?.category}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-center text-sm uppercase tracking-wider text-gray-600">
                    {transaction?.deposits_additions == "N/A"
                      ? "0.00"
                      : transaction?.deposits_additions}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-center text-sm uppercase tracking-wider text-gray-600">
                    {transaction?.withdrawals_subtractions == "N/A"
                      ? "0.00"
                      : transaction?.withdrawals_subtractions}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-center text-sm uppercase tracking-wider text-gray-600">
                    {transaction?.is_spam ? (
                      <span className="rounded-md bg-yellow-100 p-1 text-sm text-yellow-600">
                        Spam
                      </span>
                    ) : (
                      <span className="rounded-md bg-green-100 p-1 text-sm text-green-600">
                        Pass
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-center text-sm uppercase tracking-wider text-gray-600">
                    <button
                      onClick={() =>
                        setEditingTransaction({ idx: idx, ...transaction })
                      }
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          isLoading={isLoading}
          onClick={handleSubmit}
          className="flex items-center gap-1 rounded bg-green-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Submit Selected ({selectedRows.size})
        </Button>
      </div>
    </div>
  );
};

export default OCRTransactionsList;
