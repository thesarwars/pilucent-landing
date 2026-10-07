import ExpenseCategorySelectDropdown from "@/components/ui/ScrollSelectDropDowns/ExpenseCategorySelectDropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useState } from "react";
import { GrDrag } from "react-icons/gr";
import { RiDeleteBin6Line } from "react-icons/ri";

const CategoryTable = ({
  isEdit = false,
  view = false,
  taxType,
  deleteItems,
  setDeleteItems,
  CategoryRows,
  setCategoryRows,
  taxRateOptions,
  setPurchaseData,
  purchaseData,
}: {
  isEdit?: boolean;
  view?: boolean;
  taxType: string;
  deleteItems?: any;
  setDeleteItems?: any;
  CategoryRows: any;
  setCategoryRows: any;
  taxRateOptions: any;
  setPurchaseData?: any;
  purchaseData?: any;
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [searchProduct, setSearchProduct] = useState<string>("");

  const addInvoiceLine = () => {
    setCategoryRows([
      ...CategoryRows,
      {
        type: "category",
        category: "",
        category_uid: "",
        description: "",
        amount: 0,
        tax: 0,
        productTaxInfo: taxRateOptions.length
          ? taxRateOptions[0]
          : { rate: 0, title: "", uid: "" },
        productTaxRate: taxRateOptions.length ? taxRateOptions[0]?.rate : 0,
        productTaxType: taxType,
        isPopupOpen: false,
      },
    ]);

    // console.log(invoiceRows);
  };

  const AddSection = () => {
    setCategoryRows([
      ...CategoryRows,
      {
        type: "section",
        category_title: "",
        category_uid: "",
        description: "",
        amount: 0,
        tax: 0,
        productTaxInfo: { rate: 0, title: "", uid: "" },
        productTaxRate: 0,
        productTaxType: "",
        isPopupOpen: false,
      },
    ]);
  };
  const AddNote = () => {
    setCategoryRows([
      ...CategoryRows,
      {
        type: "note",
        category_title: "",
        category_uid: "",
        description: "",
        amount: 0,
        tax: 0,
        productTaxInfo: { rate: 0, title: "", uid: "" },
        productTaxRate: 0,
        productTaxType: "",
        isPopupOpen: false,
      },
    ]);
  };

  const removeInvoiceLine = (index: number, uid?: string) => {
    const updatedRows = CategoryRows.filter(
      (_: any, rowIndex: any) => rowIndex !== index,
    );
    setCategoryRows(updatedRows);
    if (setDeleteItems && uid) {
      setDeleteItems([...deleteItems, uid]);
    }
  };

  const removeALLInvoiceLine = () => {
    setCategoryRows([]);
  };

  const handleInvoiceInputChange = (
    index: number,
    field: string,
    value: any,
  ) => {
    const updatedRows = CategoryRows.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        if (purchaseData && setPurchaseData) {
          setPurchaseData({
            ...purchaseData,
            deposit: "",
          });
        }
        let updatedRow = { ...row };
        if (field == "productTaxRate") {
          taxRateOptions.map((rate: any) => {
            if (value === rate.uid) {
              updatedRow = { ...row, [field]: rate.rate, productTaxInfo: rate };
            }
          });
        } else {
          updatedRow = { ...row, [field]: value };
        }
        if (
          field === "amount" ||
          field === "productTaxRate" ||
          field === "productTaxType"
        ) {
          if (updatedRow.productTaxType === "EXCLUSIVE") {
            updatedRow.tax =
              (updatedRow.amount / 100) * updatedRow.productTaxRate;
          }

          if (updatedRow.productTaxType === "INCLUSIVE") {
            updatedRow.tax = 0;
          }

          if (updatedRow.productTaxType === "NO_TAX") {
            updatedRow.tax = 0;
          }
        }
        return updatedRow;
      }
      return row;
    });
    setCategoryRows(updatedRows);
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLTableRowElement>,
    index: number,
  ) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLTableRowElement>,
    index: number,
  ) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;

    const updatedData = [...CategoryRows];
    const draggedItem = updatedData[draggingIndex];
    updatedData.splice(draggingIndex, 1);
    updatedData.splice(index, 0, draggedItem);
    setDraggingIndex(index);
    setCategoryRows(updatedData);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  const handleSelectedProduct = (index: number, product: any) => {
    setSearchProduct(product.title.toUpperCase());

    const updatedRows = CategoryRows.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        row.category_uid = product.uid;
        row.category = product.title;
        row.description = product.description;
        row.productTaxType = taxType;
        row.isPopupOpen = false; // Close the popup

        // if (taxType === "exclusive") {
        //   row.amount = product.sale_price;
        //   row.price = product.sale_price;
        //   row.amount = product.sale_price * row.qty;
        //   row.tax = (product.sale_price / 100) * row.productTaxRate * row.qty;
        // }

        // if (taxType === "inclusive") {
        //   row.mainPrice = product.sale_price;
        //   row.price = product.sale_price;
        //   row.amount = product.sale_price * row.qty;
        //   row.tax = 0;
        // }

        // if (taxType === "outOfScope") {
        //   row.mainPrice = product.sale_price;
        //   row.price = product.sale_price;
        //   row.tax = 0;
        //   row.amount = product.sale_price * row.qty;
        // }
      }
      return row;
    });

    setCategoryRows(updatedRows);
  };

  return (
    <div className="mt-8">
    <h1 className="text-base font-medium text-accent_soft_black">CATEGORY DETAILS</h1>
      <div className="relative mb-5 rounded-none border-base-300">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="">
              <TableRow className="border-b-2 border-gray-300 bg-white/60 uppercase hover:bg-white">
                <TableHead className="pl-2 font-medium">#</TableHead>
                <TableHead className="text-left font-medium">Category</TableHead>
                {!(taxType === "NO_TAX") && <TableHead className="text-center font-medium">TAX</TableHead>}
                <TableHead className="text-center font-medium">Amount</TableHead>
                {!view && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {CategoryRows?.map((row: any, index: any) => (
                <TableRow
                  draggable // Enables the drag behavior
                  onDragStart={(e) => !view && handleDragStart(e, index)}
                  onDragOver={(e) => !view && handleDragOver(e, index)}
                  onDragEnd={() => !view && handleDragEnd()}
                  key={index}
                  className={`border-none bg-white hover:bg-white`}
                >
                  {row.type === "category" ? (
                    <>
                      {" "}
                      <TableCell className="cursor-pointer border-b pl-2 pr-1">
                        <GrDrag className="text-2xl" />
                      </TableCell>
                      <TableCell className="w-84 border-b">
                        <ExpenseCategorySelectDropdown
                          view={view}
                          handleInvoiceInputChange={handleInvoiceInputChange}
                          handleSelectedProduct={handleSelectedProduct}
                          index={index}
                          invoiceRows={CategoryRows}
                          row={row}
                          setInvoiceRows={setCategoryRows}
                        />
                      </TableCell>
                      {!(taxType === "NO_TAX") && (
                        <TableCell className="border-b bg-white">
                          <select
                            value={row.productTaxInfo?.uid}
                            onChange={(e: any) =>
                              handleInvoiceInputChange(
                                index,
                                "productTaxRate",
                                e.target.value,
                              )
                            }
                            className="h-full bg-transparent text-[16px] outline-none"
                            disabled={view}
                          >
                            {taxRateOptions.map((option: any) => (
                              <option key={option.rate} value={option.uid}>
                                {option.title} {option.rate}%
                              </option>
                            ))}
                          </select>
                        </TableCell>
                      )}
                      <TableCell className="border-b">
                        <input
                          type="text"
                          className="w-full border-accent_soft_blue px-2 text-center outline-none hover:border-b-2 focus:border-b-2"
                          value={row.amount}
                          onChange={(e) =>
                            handleInvoiceInputChange(
                              index,
                              "amount",
                              e.target.value,
                            )
                          }
                          readOnly={view}
                          disabled={view}
                        />
                      </TableCell>
                      {!view && (
                        <TableCell
                          onClick={() => removeInvoiceLine(index, row?.uid)}
                          className="cursor-pointer border-b p-6"
                        >
                          <RiDeleteBin6Line className="text-red-500" />
                        </TableCell>
                      )}
                    </>
                  ) : row.type === "section" ? (
                    <>
                      {" "}
                      <TableCell className="cursor-pointer border-b pl-2 pr-1">
                        <GrDrag className="text-2xl" />
                      </TableCell>
                      <TableCell className="col-span-4 w-80 border-b">
                        {" "}
                        <input
                          type="text"
                          className="h-full w-80 border-none px-2 text-center text-lg italic text-[#333752] outline-none"
                          onChange={(e) =>
                            handleInvoiceInputChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          value={row.description}
                          readOnly={view}
                          disabled={view}
                        />
                      </TableCell>
                      {!(taxType === "NO_TAX") && (
                        <TableCell className="border-b"></TableCell>
                      )}
                      <TableCell className="border-b"></TableCell>
                      {!view && (
                        <TableCell
                          onClick={() => removeInvoiceLine(index)}
                          className="cursor-pointer border-b p-6"
                        >
                          <RiDeleteBin6Line className="text-red-500" />
                        </TableCell>
                      )}
                    </>
                  ) : (
                    row.type === "note" && (
                      <>
                        <TableCell className="cursor-pointer border-b pl-2 pr-1">
                          <GrDrag className="text-2xl" />
                        </TableCell>

                        <TableCell className="col-span-4 w-80 border-b">
                          {" "}
                          <input
                            type="text"
                            className="h-full w-80 border-none px-2 text-center text-lg font-light text-[#7E84A3] outline-none"
                            onChange={(e) =>
                              handleInvoiceInputChange(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            value={row.description}
                            readOnly={view}
                            disabled={view}
                          />
                        </TableCell>
                        {!(taxType === "NO_TAX") && (
                          <TableCell className="border-b"></TableCell>
                        )}
                        <TableCell className="border-b"></TableCell>
                        {!view && (
                          <TableCell
                            onClick={() => removeInvoiceLine(index)}
                            className="cursor-pointer border-b p-6"
                          >
                            <RiDeleteBin6Line className="text-red-500" />
                          </TableCell>
                        )}
                      </>
                    )
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!view && (
            <div className="mt-3 border-b pb-3">
              <div className="ml-16 flex gap-8 text-accent_soft_blue">
                <button
                  onClick={addInvoiceLine}
                  className="border-r-1 cursor-pointer font-medium"
                >
                  Add a Category
                </button>
                <button
                  onClick={AddSection}
                  className="border-r-1 cursor-pointer font-medium"
                >
                  Add a Section
                </button>
                <button
                  onClick={AddNote}
                  className="cursor-pointer font-medium"
                >
                  Add a Note
                </button>
                {!isEdit && (
                  <button
                    onClick={removeALLInvoiceLine}
                    className="cursor-pointer font-medium"
                  >
                    Remove All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryTable;
