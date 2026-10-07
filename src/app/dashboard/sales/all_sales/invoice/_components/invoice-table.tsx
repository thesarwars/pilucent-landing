"use client";

import ProductSelectDropdown from "@/components/ui/ScrollSelectDropDowns/ProductSelectDropdown";
import type React from "react";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { GrDrag } from "react-icons/gr";
import { RiDeleteBin6Line } from "react-icons/ri";

interface InvoiceItem {
  id: string;
  type: "product" | "section" | "note";
  productService: string;
  description: string;
  qty: number;
  price: number;
  amount: number;
  tax: number;
  productTaxRate: number;
  productTaxType: string;
  productTaxInfo: {
    rate: number;
    title: string;
    uid: string;
  };
}

interface InvoiceData {
  tax_kind: string;
  discount_kind: string;
  discount_amount: number;
  shipping_fee: number;
  deposit: number;
  total: number;
  sub_total: number;
  total_tax: number;
  due_total: number;
}

interface PropsType {
  invoiceItems: InvoiceItem[];
  setInvoiceItems: any;
  invoiceData: InvoiceData;
  setInvoiceData: any;
}

const InvoiceTable = ({
  invoiceItems,
  setInvoiceItems,
  invoiceData,
  setInvoiceData,
}: PropsType) => {
  // const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  // const [invoiceData, setInvoiceData] = useState<InvoiceData>({
  //   tax_kind: "EXCLUSIVE",
  //   discount_kind: "PERCENTAGE",
  //   discount_amount: 0,
  //   shipping_fee: 0,
  //   deposit: 0,
  //   total: 0,
  //   sub_total: 0,
  //   total_tax: 0,
  //   due_total: 0,
  // });
  const [discount, setDiscount] = useState<string>("");
  const [shipping, setShipping] = useState({ rate: 10, value: "" });
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [shippingAmount, setShippingAmount] = useState<number>(0);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  // Mock tax rates
  const taxRateOptions = [
    { uid: "1", title: "GST", rate: 10 },
    { uid: "2", title: "VAT", rate: 15 },
    { uid: "3", title: "Sales Tax", rate: 8 },
  ];

  // Calculate totals
  useEffect(() => {
    const subtotal = invoiceItems.reduce(
      (acc, row) => acc + Number(row.amount),
      0,
    );
    let totalTax = 0;

    if (invoiceData.tax_kind === "EXCLUSIVE") {
      totalTax = invoiceItems.reduce(
        (acc, row) => acc + Number(row.tax || 0),
        0,
      );
    } else if (invoiceData.tax_kind === "INCLUSIVE") {
      totalTax = invoiceItems.reduce(
        (acc, row) => acc + Number(row.tax || 0),
        0,
      );
    }

    const total =
      subtotal +
      (invoiceData.tax_kind === "EXCLUSIVE" ? totalTax : 0) +
      Number(shippingAmount) -
      Number(discountAmount);
    const dueTotal = total - Number(invoiceData.deposit);

    setInvoiceData((prev: any) => ({
      ...prev,
      sub_total: subtotal,
      total_tax: totalTax,
      total: total,
      due_total: dueTotal,
    }));
  }, [
    invoiceItems,
    shippingAmount,
    discountAmount,
    invoiceData.deposit,
    invoiceData.tax_kind,
  ]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addInvoiceLine = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: generateId(),
        type: "product",
        productService: "",
        description: "",
        qty: 1,
        price: 0,
        amount: 0,
        tax: 0,
        productTaxRate: taxRateOptions[0]?.rate || 0,
        productTaxType: invoiceData.tax_kind,
        productTaxInfo: taxRateOptions[0] || { rate: 0, title: "", uid: "" },
      },
    ]);
  };

  const addSection = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: generateId(),
        type: "section",
        productService: "",
        description: "",
        qty: 1,
        price: 0,
        amount: 0,
        tax: 0,
        productTaxRate: 0,
        productTaxType: "EXCLUSIVE",
        productTaxInfo: { rate: 0, title: "", uid: "" },
      },
    ]);
  };

  const addNote = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: generateId(),
        type: "note",
        productService: "",
        description: "",
        qty: 1,
        price: 0,
        amount: 0,
        tax: 0,
        productTaxRate: 0,
        productTaxType: "EXCLUSIVE",
        productTaxInfo: { rate: 0, title: "", uid: "" },
      },
    ]);
  };

  const removeInvoiceLine = (id: string) => {
    const updatedRows = invoiceItems.filter((item) => item.id !== id);
    setInvoiceItems(updatedRows);
  };

  const removeAllInvoiceLines = () => {
    setInvoiceItems([]);
  };

  const handleInvoiceInputChange = (id: string, field: string, value: any) => {
    const updatedRows = invoiceItems.map((row) => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };

        if (
          field === "price" ||
          field === "qty" ||
          field === "productTaxRate"
        ) {
          if (updatedRow.productTaxType === "EXCLUSIVE") {
            updatedRow.amount = updatedRow.price * updatedRow.qty;
            updatedRow.tax =
              (updatedRow.price / 100) *
              updatedRow.productTaxRate *
              updatedRow.qty;
          } else if (updatedRow.productTaxType === "INCLUSIVE") {
            updatedRow.amount = updatedRow.price * updatedRow.qty;
            updatedRow.tax =
              (updatedRow.price / (100 + updatedRow.productTaxRate)) *
              updatedRow.productTaxRate *
              updatedRow.qty;
          } else {
            updatedRow.amount = updatedRow.price * updatedRow.qty;
            updatedRow.tax = 0;
          }
        }

        return updatedRow;
      }
      return row;
    });
    setInvoiceItems(updatedRows);
  };

  const handleTaxTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newTaxType = e.target.value;
    setInvoiceData((prev: any) => ({ ...prev, tax_kind: newTaxType }));

    const updatedRows = invoiceItems.map((row) => {
      const updatedRow = { ...row, productTaxType: newTaxType };

      if (newTaxType === "EXCLUSIVE") {
        updatedRow.amount = updatedRow.price * updatedRow.qty;
        updatedRow.tax =
          (updatedRow.price / 100) * updatedRow.productTaxRate * updatedRow.qty;
      } else if (newTaxType === "INCLUSIVE") {
        updatedRow.amount = updatedRow.price * updatedRow.qty;
        updatedRow.tax =
          (updatedRow.price / (100 + updatedRow.productTaxRate)) *
          updatedRow.productTaxRate *
          updatedRow.qty;
      } else {
        updatedRow.amount = updatedRow.price * updatedRow.qty;
        updatedRow.tax = 0;
      }

      return updatedRow;
    });
    setInvoiceItems(updatedRows);
  };

  const handleDiscountChange = (value: string) => {
    setDiscount(value);
    if (invoiceData.discount_kind === "PERCENTAGE") {
      const discountAmt = ((invoiceData?.sub_total || 0) / 100) * Number(value);
      setDiscountAmount(discountAmt);
    } else {
      setDiscountAmount(Number(value));
    }
  };

  const handleShippingChange = (value: string) => {
    setShipping((prev) => ({ ...prev, value }));
    const shippingAmt = (Number(value) / 100) * shipping.rate;
    setShippingAmount(shippingAmt);
  };

  const handleDepositChange = (value: string) => {
    setInvoiceData((prev: any) => ({ ...prev, deposit: Number(value) }));
  };

  // Drag and Drop Functions
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
    setIsDragging(false);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverItem(itemId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverItem(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropItemId: string) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === dropItemId) {
      handleDragEnd();
      return;
    }

    const draggedIndex = invoiceItems.findIndex(
      (item) => item.id === draggedItem,
    );
    const dropIndex = invoiceItems.findIndex((item) => item.id === dropItemId);

    if (draggedIndex === -1 || dropIndex === -1) {
      handleDragEnd();
      return;
    }

    const newItems = [...invoiceItems];
    const [draggedItemData] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItemData);

    setInvoiceItems(newItems);
    handleDragEnd();
  };

  return (
    <div className="relative mt-7">
      {/* Tax Type Selection */}
      {/* <div className="mb-6 flex items-center justify-start">
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <label className="font-medium text-gray-600">Amount are</label>
          <select
            value={invoiceData.tax_kind}
            onChange={handleTaxTypeChange}
            className="mt-2 h-11 w-64 rounded-md border bg-white px-3 text-gray-800 shadow-sm outline-none"
          >
            <option value="EXCLUSIVE">Exclusive of Tax</option>
            <option value="INCLUSIVE">Inclusive of Tax</option>
            <option value="NO_TAX">Out Of Scope Of Tax</option>
          </select>
        </div>
      </div> */}

      {/* Table Container */}
      <div className="mb-5 rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          {/* Header Row - Only visible on desktop */}
          <div className="hidden border-b-2 border-gray-300 bg-gray-50 p-4 text-sm font-medium uppercase text-gray-700 md:grid md:grid-cols-12 md:gap-2">
            <div className="">#</div>
            <div className="md:col-span-4">Product/Service</div>
            <div className="text-center md:col-span-1">Qty</div>
            <div className="text-center md:col-span-1">Rate</div>
            {invoiceData.tax_kind !== "NO_TAX" && (
              <div className="text-center md:col-span-2">Tax</div>
            )}
            <div
              className={`${invoiceData.tax_kind !== "NO_TAX" ? "md:col-span-2" : "md:col-span-4"} text-center`}
            >
              Amount
            </div>
            <div className="md:col-span-1"></div>
          </div>

          {/* Table Body */}
          {invoiceItems.map((row) => (
            <div
              key={row.id}
              draggable
              onDragStart={(e) => handleDragStart(e, row.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, row.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, row.id)}
              className={`border-b transition-all duration-200 ${
                draggedItem === row.id ? "bg-blue-100 opacity-50" : ""
              } ${
                dragOverItem === row.id && draggedItem !== row.id
                  ? "border-t-4 border-t-blue-500 bg-blue-50"
                  : ""
              } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
            >
              {row.type === "product" ? (
                <>
                  {/* Desktop View */}
                  <div className="hidden md:grid md:grid-cols-12 md:items-center md:gap-2 md:p-4">
                    <div className="flex items-center ">
                      <div className="cursor-grab rounded p-2 transition-colors hover:bg-gray-100 active:cursor-grabbing">
                        <GrDrag className="text-2xl text-gray-400" />
                      </div>
                    </div>
                    <div className="md:col-span-4">
                      <ProductSelectDropdown
                        handleInvoiceInputChange={handleInvoiceInputChange}
                        handleSelectedProduct={() => {}}
                        index={row?.id}
                        invoiceRows={invoiceItems}
                        row={row}
                        setInvoiceRows={setInvoiceItems}
                      />
                      {/* <input
                        type="text"
                        className="w-full border-b border-transparent px-2 py-1 outline-none transition-colors hover:border-violet-500 focus:border-violet-500"
                        placeholder="Product/Service"
                        value={row.productService}
                        onChange={(e) =>
                          handleInvoiceInputChange(
                            row.id,
                            "productService",
                            e.target.value,
                          )
                        }
                      />
                      <input
                        type="text"
                        className="w-full border-b border-transparent px-2 py-1 text-sm text-gray-500 outline-none transition-colors hover:border-violet-500 focus:border-violet-500"
                        placeholder="Description"
                        value={row.description}
                        onChange={(e) =>
                          handleInvoiceInputChange(
                            row.id,
                            "description",
                            e.target.value,
                          )
                        }
                      /> */}
                    </div>
                    <div className="md:col-span-1">
                      <input
                        type="number"
                        className="w-full border-b border-transparent px-2 py-1 text-center outline-none transition-colors hover:border-violet-500 focus:border-violet-500"
                        value={row.qty}
                        onChange={(e) =>
                          handleInvoiceInputChange(
                            row.id,
                            "qty",
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-1">
                      <input
                        type="number"
                        className="w-full border-b border-transparent px-2 py-1 text-center outline-none transition-colors hover:border-violet-500 focus:border-violet-500"
                        value={row.price}
                        onChange={(e) =>
                          handleInvoiceInputChange(
                            row.id,
                            "price",
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>
                    {invoiceData.tax_kind !== "NO_TAX" && (
                      <div className="md:col-span-2">
                        <select
                          value={row.productTaxInfo.uid}
                          onChange={(e) => {
                            const selectedTax = taxRateOptions.find(
                              (tax) => tax.uid === e.target.value,
                            );
                            if (selectedTax) {
                              handleInvoiceInputChange(
                                row.id,
                                "productTaxRate",
                                selectedTax.rate,
                              );
                              handleInvoiceInputChange(
                                row.id,
                                "productTaxInfo",
                                selectedTax,
                              );
                            }
                          }}
                          className="w-full bg-transparent px-2 py-1 outline-none"
                        >
                          {taxRateOptions.map((option) => (
                            <option key={option.uid} value={option.uid}>
                              {option.title} {option.rate}%
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div
                      className={`${invoiceData.tax_kind !== "NO_TAX" ? "md:col-span-2" : "md:col-span-4"}`}
                    >
                      <input
                        type="text"
                        className="w-full bg-gray-50 px-2 py-1 text-center outline-none"
                        value={row.amount.toFixed(2)}
                        readOnly
                      />
                    </div>
                    <div className="flex items-center justify-center md:col-span-1">
                      <button
                        onClick={() => removeInvoiceLine(row.id)}
                        className="rounded p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                      >
                        <RiDeleteBin6Line className="text-xl" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="p-4 md:hidden">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-lg font-medium">
                        Product or service
                      </div>
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="cursor-grab rounded p-2 transition-colors hover:bg-gray-100 active:cursor-grabbing">
                        <GrDrag className="text-xl text-gray-400" />
                      </div>
                      <div className="mx-2 text-center font-medium">
                        {row.qty}
                      </div>
                      <button
                        onClick={() => removeInvoiceLine(row.id)}
                        className="rounded p-2 text-gray-500 transition-colors hover:bg-red-50"
                      >
                        <RiDeleteBin6Line className="text-xl" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Product/service
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-md border px-3 py-2 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                          value={row.productService}
                          onChange={(e) =>
                            handleInvoiceInputChange(
                              row.id,
                              "productService",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-md border px-3 py-2 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                          value={row.description}
                          onChange={(e) =>
                            handleInvoiceInputChange(
                              row.id,
                              "description",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Qty
                          </label>
                          <input
                            type="number"
                            className="w-full rounded-md border px-3 py-2 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                            value={row.qty}
                            onChange={(e) =>
                              handleInvoiceInputChange(
                                row.id,
                                "qty",
                                Number(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Rate
                          </label>
                          <input
                            type="number"
                            className="w-full rounded-md border px-3 py-2 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                            value={row.price}
                            onChange={(e) =>
                              handleInvoiceInputChange(
                                row.id,
                                "price",
                                Number(e.target.value),
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Amount
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-md border bg-gray-50 px-3 py-2 outline-none"
                          value={row.amount.toFixed(2)}
                          readOnly
                        />
                      </div>

                      {invoiceData.tax_kind !== "NO_TAX" && (
                        <div className="mt-2 flex items-center">
                          <input
                            type="checkbox"
                            id={`tax-${row.id}`}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                            checked={row.productTaxRate > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInvoiceInputChange(
                                  row.id,
                                  "productTaxRate",
                                  taxRateOptions[0].rate,
                                );
                                handleInvoiceInputChange(
                                  row.id,
                                  "productTaxInfo",
                                  taxRateOptions[0],
                                );
                              } else {
                                handleInvoiceInputChange(
                                  row.id,
                                  "productTaxRate",
                                  0,
                                );
                                handleInvoiceInputChange(
                                  row.id,
                                  "productTaxInfo",
                                  { rate: 0, title: "", uid: "" },
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`tax-${row.id}`}
                            className="text-sm font-medium text-gray-700"
                          >
                            Tax
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : row.type === "section" ? (
                <>
                  {/* Desktop View for Section */}
                  <div className="hidden md:grid md:grid-cols-12 md:gap-2 md:p-4">
                    <div className="flex items-center md:col-span-1">
                      <div className="cursor-grab rounded p-2 transition-colors hover:bg-gray-100 active:cursor-grabbing">
                        <GrDrag className="text-2xl text-gray-400" />
                      </div>
                    </div>
                    <div className="md:col-span-10">
                      <input
                        type="text"
                        className="w-full border-b border-transparent px-2 py-1 text-lg italic text-gray-700 outline-none transition-colors hover:border-violet-500 focus:border-violet-500"
                        placeholder="Section title"
                        value={row.description}
                        onChange={(e) =>
                          handleInvoiceInputChange(
                            row.id,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-center md:col-span-1">
                      <button
                        onClick={() => removeInvoiceLine(row.id)}
                        className="rounded p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                      >
                        <RiDeleteBin6Line className="text-xl" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile View for Section */}
                  <div className="p-4 md:hidden">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="cursor-grab rounded p-2 transition-colors hover:bg-gray-100 active:cursor-grabbing">
                        <GrDrag className="text-xl text-gray-400" />
                      </div>
                      <div className="mx-2 flex-1">
                        <input
                          type="text"
                          className="w-full rounded-md border px-3 py-2 text-lg italic text-gray-700 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                          placeholder="Section title"
                          value={row.description}
                          onChange={(e) =>
                            handleInvoiceInputChange(
                              row.id,
                              "description",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <button
                        onClick={() => removeInvoiceLine(row.id)}
                        className="rounded p-2 text-gray-500 transition-colors hover:bg-red-50"
                      >
                        <RiDeleteBin6Line className="text-xl" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Desktop View for Note */}
                  <div className="hidden md:grid md:grid-cols-12 md:gap-2 md:p-4">
                    <div className="flex items-center md:col-span-1">
                      <div className="cursor-grab rounded p-2 transition-colors hover:bg-gray-100 active:cursor-grabbing">
                        <GrDrag className="text-2xl text-gray-400" />
                      </div>
                    </div>
                    <div className="md:col-span-10">
                      <input
                        type="text"
                        className="w-full border-b border-transparent px-2 py-1 text-lg font-light text-gray-500 outline-none transition-colors hover:border-violet-500 focus:border-violet-500"
                        placeholder="Note"
                        value={row.description}
                        onChange={(e) =>
                          handleInvoiceInputChange(
                            row.id,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-center md:col-span-1">
                      <button
                        onClick={() => removeInvoiceLine(row.id)}
                        className="rounded p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                      >
                        <RiDeleteBin6Line className="text-xl" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile View for Note */}
                  <div className="p-4 md:hidden">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="cursor-grab rounded p-2 transition-colors hover:bg-gray-100 active:cursor-grabbing">
                        <GrDrag className="text-xl text-gray-400" />
                      </div>
                      <div className="mx-2 flex-1">
                        <input
                          type="text"
                          className="w-full rounded-md border px-3 py-2 text-lg font-light text-gray-500 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                          placeholder="Note"
                          value={row.description}
                          onChange={(e) =>
                            handleInvoiceInputChange(
                              row.id,
                              "description",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <button
                        onClick={() => removeInvoiceLine(row.id)}
                        className="rounded p-2 text-gray-500 transition-colors hover:bg-red-50"
                      >
                        <RiDeleteBin6Line className="text-xl" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="border-t p-4">
          <div className="flex flex-wrap gap-4 text-violet-600">
            <button
              onClick={addInvoiceLine}
              className="font-medium transition-colors hover:text-violet-800"
            >
              Add a Product
            </button>
            <button
              onClick={addSection}
              className="font-medium transition-colors hover:text-violet-800"
            >
              Add a Section
            </button>
            <button
              onClick={addNote}
              className="font-medium transition-colors hover:text-violet-800"
            >
              Add a Note
            </button>
            <button
              onClick={removeAllInvoiceLines}
              className="font-medium transition-colors hover:text-violet-800"
            >
              Remove All
            </button>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="flex justify-end">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex justify-between font-semibold text-gray-700">
            <span>Subtotal</span>
            <span>${Number(invoiceData?.sub_total)?.toFixed(2)}</span>
          </div>

          {/* Discount */}
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <select
                value={invoiceData.discount_kind}
                onChange={(e) =>
                  setInvoiceData((prev: any) => ({
                    ...prev,
                    discount_kind: e.target.value,
                  }))
                }
                className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-600 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              >
                <option value="PERCENTAGE">Discount %</option>
                <option value="FLAT">Discount Value</option>
              </select>
              <input
                type="number"
                value={discount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-600 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500 md:w-20"
                placeholder="0"
              />
            </div>
            <span className="font-semibold text-gray-700">
              -${discountAmount.toFixed(2)}
            </span>
          </div>

          {/* Shipping */}
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <span className="text-gray-600">Shipping</span>
              <select
                value={shipping.rate.toString()}
                onChange={(e) =>
                  setShipping((prev) => ({
                    ...prev,
                    rate: Number(e.target.value),
                  }))
                }
                className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-600 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              >
                {taxRateOptions.map((option) => (
                  <option key={option.uid} value={option.rate}>
                    {option.rate}%
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={shipping.value}
                onChange={(e) => handleShippingChange(e.target.value)}
                className="rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-600 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500 md:w-20"
                placeholder="0"
              />
            </div>
            <span className="font-semibold text-gray-700">
              +${shippingAmount.toFixed(2)}
            </span>
          </div>

          {/* Tax Breakdown */}
          {invoiceData.tax_kind !== "NO_TAX" && (
            <div className="mb-4">
              {invoiceItems
                .filter((item) => item.type === "product" && item.amount > 0)
                .map((item, idx) => (
                  <div
                    key={idx}
                    className="mb-2 flex justify-between text-gray-600"
                  >
                    <span className="text-sm">
                      {item.productTaxInfo.title} @ {item.productTaxInfo.rate}%
                      on ${item.amount.toFixed(2)}
                    </span>
                    <span>${item.tax.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          )}

          <div className="mb-4 flex justify-between border-t pt-4 text-lg font-semibold text-gray-700">
            <span>Total</span>
            <span>${invoiceData.total.toFixed(2)}</span>
          </div>

          {/* Deposit */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="font-semibold text-gray-700">Deposit</span>
            <input
              type="number"
              value={invoiceData.deposit}
              onChange={(e) => handleDepositChange(e.target.value)}
              className="w-32 rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-gray-600 outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-between text-lg font-bold text-violet-600">
            <span>Balance Due</span>
            <span>${invoiceData.due_total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTable;
