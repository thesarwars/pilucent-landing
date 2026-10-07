import { postTransactions } from "@/app/helpers/backend";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";

const PreviewTransactions = ({
  account,
  step,
  setStep,
  processedData,
  setProcessedData,
}: {
  account: any;
  step: any;
  setStep: any;
  processedData: any;
  setProcessedData: any;
}) => {
  const [selectedOption, setSelectedOption] = useState("original");
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [reversedArray, setReversedArray] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [Titles, setTitles] = useState<any[]>([]);

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

    if (!isAllSelected && processedData) {
      const allIds = processedData?.map((row: any, idx: number) => idx);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleValueChange = (value: string) => {
    if (value == "reversed") {
      const reversed = processedData?.map((pd: any) => {
        return {
          ...pd,
          received: pd?.spent,
          spent: pd?.received,
        };
      });
      setReversedArray(reversed);
    }
  };

  const handleSubmit = async () => {
    let dataToSubmit = [];
    if (selectedOption == "reversed") {
      dataToSubmit = reversedArray.filter((t, idx) => selectedRows.has(idx));
    } else {
      dataToSubmit = processedData.filter((t: any, idx: any) =>
        selectedRows.has(idx),
      );
    }
    if (!dataToSubmit?.length)
      return toast.error("Select transactions to import");
    const Data = dataToSubmit?.map((d: any) => {
      if (Number(d?.received > 0)) {
        return {
          date: d?.date,
          description: d?.description,
          received: d?.received,
          check_number: d?.checkNumber || "",
        };
      } else {
        return {
          date: d?.date,
          description: d?.description,
          spent: d?.spent,
          check_number: d?.checkNumber || "",
        };
      }
    });
    setIsModalOpen(true);

    try {
      setIsPending(true);
      const data = {
        transactions: Data,
        chart_of_account: account?.uid,
      };
      const res = await postTransactions(data);
      if (res?.success) {
        setStep(5);
      }
    } catch (error) {
      //error here
    } finally {
      setIsPending(false);
    }
  };

  const handleSave = () => {
    if (!selectedRows?.size) {
      toast.error("Select transactions to import");
      return;
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (processedData.length) {
      const Titles = Object.keys(processedData[0]);
      setTitles(Titles);
    }
  }, [processedData]);

  return (
    <div className="rounded-lg border bg-white p-7 mb-4 font-lexend">
      {isPending && (
        <div className="absolute left-0 top-0 z-[100] h-full w-full bg-white bg-opacity-70">
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-b-[5px] border-t-[5px] border-b-accent_soft_blue border-t-primary"></div>
          </div>
        </div>
      )}
      <div
        style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
        className="flex rounded-xl border-2 bg-gray-50"
      >
        <div className="flex-1 p-8 md:p-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">
              {"Let's"} verify and import your transactions
            </h1>

            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-medium">Check:</span> Generally, income
                  transactions post as{" "}
                  <span className="font-medium text-gray-800">positive</span>{" "}
                  numbers and expense transactions post as{" "}
                  <span className="font-medium text-gray-800">negative</span>{" "}
                  ones.
                </p>
                <p className="mt-2">
                  Occasionally, some banks send us files with this reversed. Do
                  the transactions below correctly indicate income and expenses?
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-center rounded-md p-3 hover:bg-white">
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

                <label className="flex cursor-pointer items-center rounded-md p-3 hover:bg-white">
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
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-medium text-gray-800">
          Transactions Preview
        </h2>
        <h2 className="mb-4 text-lg font-medium text-gray-800">
          {`${selectedRows?.size} Transactions selected`}
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200 overflow-hidden rounded-lg border p-1">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6">
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
                    {isAllSelected && (
                      <FaCheck className="h-3 w-3 text-white" />
                    )}
                  </div>
                </th>
                {Titles.map((key) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600"
                  >
                    <span className="flex flex-col items-center">
                      {key}
                      {key == "date" && (
                        <span className="text-nowrap">(YYYY-MM-DD)</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border bg-white">
              {(selectedOption != "reversed"
                ? processedData
                : reversedArray
              )?.map((row: any, rowIndex: number) => (
                <tr key={rowIndex} className="border">
                  <td className="px-6">
                    <div
                      className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded ${
                        selectedRows?.has(rowIndex)
                          ? "bg-indigo-600"
                          : "border border-gray-400 bg-white"
                      }`}
                      onClick={() => {
                        handleCheckboxChange(rowIndex);
                      }}
                    >
                      {selectedRows?.has(rowIndex) && (
                        <FaCheck className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </td>
                  {Titles.map((key: any, valueIndex) => {
                    // console.log(valueIndex, value)
                    return (
                      <td
                        key={valueIndex}
                        className="whitespace-nowrap border px-6 py-4 text-center text-sm font-medium text-gray-500"
                      >
                        {row[key]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="my-12 flex items-center justify-between">
        <button
          onClick={() => setStep(3)}
          className="rounded-md border border-accent_soft_black px-6 py-2 font-medium text-accent_soft_black transition-colors"
        >
          Back
        </button>

        {/* Submit Button */}
        <button
          disabled={isPending}
          onClick={() => {
            handleSave();
            // setStep(5);
          }}
          className="ml-2 mt-4 rounded bg-accent_soft_black px-4 py-2 text-white "
        >
          {isPending ? "Importing..." : "Continue"}
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-8">
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold">
                Are you sure you want to import these {selectedRows?.size}{" "}
                selected transactions?
              </h2>
              <p className="mb-6 text-gray-600">
                You have full control over how your banking information is added
                to Balanzify. Transactions will only appear in your records once{" "}
                {"you've "}
                reviewed and approved them
              </p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mr-12 rounded-md border border-accent_soft_black bg-transparent px-12 py-2 text-accent_soft_black transition-colors hover:bg-accent_soft_black hover:text-white"
              >
                Close
              </button>
              <button
                disabled={isPending}
                onClick={() => {
                  handleSubmit();
                  // setStep(5);
                }}
                className="ml-2 mt-4 rounded bg-accent_soft_black px-12 py-2 text-white"
              >
                {isPending ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewTransactions;
