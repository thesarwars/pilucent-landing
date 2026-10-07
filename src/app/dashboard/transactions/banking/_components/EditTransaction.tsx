import moment from "moment";
import { useState } from "react";

const EditTransaction = ({
  transaction,
  onSave,
  onClose,
}: {
  transaction: any;
  onSave: any;
  onClose: any;
}) => {
  const [editedTransaction, setEditedTransaction] = useState(transaction);

  const handleFieldChange = (
    field: string,
    value: string | number | boolean,
  ) => {
    setEditedTransaction((prev: any) => ({ ...prev, [field]: value }));
  };

  //   const formatDate = (inputDate: any) => {
  //     // Check if the date is already in dd/mm/yyyy format
  //     const ddMMyyyyRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  //     if (ddMMyyyyRegex.test(inputDate)) {
  //       return inputDate; // Return as is
  //     }

  //     // Check if the date is in mm/yy format
  //     const mmYYRegex = /^\d{2}\/\d{2}$/;
  //     if (mmYYRegex.test(inputDate)) {
  //       const [month, year] = inputDate.split("/");
  //       const fullYear = `20${year}`; // Assuming years are in the 2000s
  //       return `01/${month}/${fullYear}`; // Default to the first day of the month
  //     }

  //     // Check if the date is in dd/mm/yy format
  //     const ddMMyyRegex = /^\d{2}\/\d{2}\/\d{2}$/;
  //     if (ddMMyyRegex.test(inputDate)) {
  //       const [day, month, year] = inputDate.split("/");
  //       const fullYear = `20${year}`; // Assuming years are in the 2000s
  //       return `${day}/${month}/${fullYear}`;
  //     }

  //     // If the format is not recognized, return null or throw an error
  //     return null; // or throw new Error("Invalid date format");
  //   };

  const isSpam = (value: boolean) => {
    if (value) {
      return "spam";
    } else {
      return "pass";
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-bold">Edit Transaction</h3>

        <div className="space-y-4">
          {/* <div>
            <label className="mb-1 block text-sm font-medium">Date</label>
            <input
              type="date"
              value={formatDate(editedTransaction?.date)}
              onChange={(e) => handleFieldChange("date", e.target.value)}
              className="w-full rounded border p-2"
            />
          </div> */}

          {/* <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <input
              type="text"
              value={editedTransaction.category}
              onChange={(e) => handleFieldChange("category", e.target.value)}
              className="w-full rounded border p-2"
            />
          </div> */}
          <div>
            <label className="mb-1 block text-sm font-medium">Received</label>
            <input
              type="text"
              value={editedTransaction.deposits_additions}
              onChange={(e) =>
                handleFieldChange("deposits_additions", e.target.value)
              }
              className="w-full rounded border p-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <input
              type="text"
              value={editedTransaction.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              className="w-full rounded border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Spam</label>
            <select
              value={isSpam(editedTransaction?.is_spam)}
              className="rounded-md border p-2"
              onChange={(e) =>
                handleFieldChange(
                  "is_spam",
                  e.target.value == "spam" ? true : false,
                )
              }
            >
              <option value="spam">Spam</option>
              <option value="pass">Not Spam</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Spent</label>
            <input
              type="text"
              step="0.01"
              value={editedTransaction.withdrawals_subtractions}
              onChange={(e) =>
                handleFieldChange("withdrawals_subtractions", e.target.value)
              }
              className="w-full rounded border p-2"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedTransaction)}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTransaction;
