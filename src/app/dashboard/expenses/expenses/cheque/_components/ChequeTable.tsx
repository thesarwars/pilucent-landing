/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, ChangeEvent } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import Label from "@/components/ui/RawLabel";
import useAllTaxRates from "@/hooks/useAllTaxRates";
import { GrDrag } from "react-icons/gr";
import GetToken from "@/hooks/getToken";
import ProductSelectDropdown from "@/components/ui/ScrollSelectDropDowns/ProductSelectDropdown";
import CategoryTable from "../../purchase/_components/CategoryTable";
import { toast } from "react-toastify";

const ChequeTable = ({
  isEdit = false,
  deleteItems,
  setDeleteItems,
  view = false,
  purchaseData,
  setPurchaseData,
  setPurchaseItems,
  setCategoryItems,
  purchaseItems,
  categoryItems,
  setIsTaxLoading,
}: {
  isEdit?: any;
  deleteItems?: any;
  setDeleteItems?: any;
  view?: boolean;
  setIsTaxLoading?: any;
  categoryItems: any;
  purchaseItems: any;
  setCategoryItems: any;
  purchaseData: any;
  setPurchaseData: React.Dispatch<React.SetStateAction<any>>;
  setPurchaseItems: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [discount, setDiscount] = useState<any>("");
  const [subtotal, setSubtotal] = useState(0);
  const [isInitial, setIsInitial] = useState(true);
  const [shipping, setShipping] = useState<any>({ rate: 0, value: "" });
  const token = GetToken();
  const { taxRates: taxRateOptions, isPending } = useAllTaxRates(token);
  const [discountAmount, setDiscountAmount] = useState<any>("");
  const [shippingAmount, setShippingAmount] = useState<any>("");

  useEffect(() => {
    const calculateTotals = () => {
      //product calculations
      const PurchaseSubtotal = purchaseItems.reduce(
        (acc: any, row: any) => acc + Number(row.amount),
        0,
      );
      let PurchaseTotalTax = purchaseItems.reduce(
        (acc: any, row: any) => acc + Number(row.tax),
        0,
      );
      //category calculations
      const CategorySubtotal = categoryItems.reduce(
        (acc: any, row: any) => acc + Number(row.amount),
        0,
      );
      let CategoryTotalTax = categoryItems.reduce(
        (acc: any, row: any) => acc + Number(row.tax),
        0,
      );
      if (purchaseData?.tax_kind === "NO_TAX") {
        CategoryTotalTax = 0;
        PurchaseTotalTax = 0;
      }
      const CategoryTotal = Number(CategorySubtotal) + Number(CategoryTotalTax);
      const PurchaseTotal = Number(PurchaseSubtotal) + Number(PurchaseTotalTax);
      const CatInTotal = Number(CategoryTotal) + Number(PurchaseTotal);

      //set totals in purchaseData object
      const total =
        Number(CatInTotal) + Number(shippingAmount) - Number(discountAmount);
      const dueTotal = total - Number(purchaseData?.deposit);

      setSubtotal(
        Number(
          (Number(PurchaseSubtotal) + Number(CategorySubtotal)).toFixed(2),
        ),
      );
      setPurchaseData({
        ...purchaseData,
        total_tax: (
          Number(PurchaseTotalTax) + Number(CategoryTotalTax)
        ).toFixed(2),
        due_total: dueTotal,
        total: total,
        sub_total: Number(PurchaseSubtotal) + Number(CategorySubtotal),
      });
    };

    calculateTotals();
  }, [
    purchaseItems,
    purchaseData?.tax_kind,
    categoryItems,
    purchaseData?.deposit,
    discountAmount,
    shippingAmount,
  ]);

  const handleShippingChange = (value: any) => {
    if (value > subtotal) {
      toast.warning("Shipping Amount Can't be More than Subtotal");
      setShippingAmount("");
      setShipping({ ...shipping, value: "" });
      setPurchaseData({ ...purchaseData, shipping_fee: "", deposit: "" });
      return;
    }
    const shippingAmount = (
      Number(value / 100) * Number(shipping.rate)
    ).toFixed(2);
    setShipping({ ...shipping, value: Number(value) });
    setShippingAmount(shippingAmount);
    setPurchaseData({
      ...purchaseData,
      shipping_fee: shippingAmount,
      deposit: "",
    });
  };

  useEffect(() => {
    if (isInitial && Number(subtotal) > 0) {
      if (
        purchaseData?.discount_kind == "PERCENTAGE" &&
        Number(purchaseData?.discount_amount) > 0 &&
        subtotal > 0
      ) {
        const dis = Number(
          (purchaseData?.discount_amount / subtotal) * 100,
        ).toFixed(2);
        setDiscount(dis);
      }
      if (
        purchaseData?.discount_kind == "FLAT" &&
        Number(purchaseData?.discount_amount) > 0
      ) {
        setDiscount(purchaseData?.discount_amount);
      }

      setIsInitial(false);
    }
  }, [subtotal]);

  const handleDiscountChange = (value: any) => {
    if (purchaseData.discount_kind === "PERCENTAGE") {
      setDiscount(value);
      if (value > 100) {
        toast.warning("Discount Percentage Can't be More than 100");
        setDiscount("");
        setDiscountAmount("");
        setPurchaseData({ ...purchaseData, discount_amount: "", deposit: "" });
        return;
      }
      const discountAmount = Number(subtotal / 100) * Number(value);
      setDiscountAmount(discountAmount);
      setPurchaseData({
        ...purchaseData,
        discount_amount: discountAmount,
        deposit: "",
      });
    } else if (purchaseData.discount_kind === "FLAT") {
      setDiscount(value);
      if (value > subtotal) {
        toast.warning("Discount Percentage Can't be More than 100");
        setDiscountAmount("");
        setDiscount("");
        setPurchaseData({ ...purchaseData, discount_amount: "", deposit: "" });
        return;
      }
      const discountAmount = value;
      setDiscountAmount(discountAmount);
      setPurchaseData({
        ...purchaseData,
        discount_amount: discountAmount,
        deposit: "",
      });
    }
  };

  const handleDepositChange = (value: any) => {
    if (value > purchaseData?.total) {
      toast.warning("Deposit Amount Can't be More than Total Amount");
      setPurchaseData({
        ...purchaseData,
        deposit: "",
      });
      return;
    }
    setPurchaseData({
      ...purchaseData,
      deposit: Number(value),
    });
  };

  useEffect(() => {
    if (taxRateOptions.length) {
      setShipping({ rate: taxRateOptions[0].rate, value: "" });
    }
  }, [taxRateOptions]);

  const addInvoiceLine = () => {
    setPurchaseItems([
      ...purchaseItems,
      {
        type: "product",
        mainPrice: 0,
        productService: "",
        product_uid: "",
        description: "",
        qty: 1,
        price: 0,
        amount: 0,
        tax: 0,
        productTaxInfo: taxRateOptions.length
          ? taxRateOptions[0]
          : { rate: 0, title: "", uid: "" },
        productTaxRate: taxRateOptions.length ? taxRateOptions[0]?.rate : 0,
        productTaxType: purchaseData?.tax_kind,
        productCode: 0,
        isPopupOpen: false, // Initialize popup state
      },
    ]);
  };

  const AddSection = () => {
    setPurchaseItems([
      ...purchaseItems,
      {
        type: "section",
        mainPrice: 0,
        productService: "",
        description: "",
        product_uid: "",
        qty: 1,
        price: 0,
        amount: 0,
        tax: 0,
        productTaxInfo: { rate: 0, title: "", uid: "" },
        productTaxRate: 0,
        productTaxType: "EXCLUSIVE",
        productCode: 0,
        isPopupOpen: false,
      },
    ]);
  };
  const AddNote = () => {
    setPurchaseItems([
      ...purchaseItems,
      {
        type: "note",
        mainPrice: 0,
        productService: "",
        product_uid: "",
        description: "",
        qty: 1,
        price: 0,
        amount: 0,
        tax: 0,
        productTaxInfo: { rate: 0, title: "", uid: "" },
        productTaxRate: 0,
        productTaxType: "EXCLUSIVE",
        productCode: 0,
        isPopupOpen: false,
      },
    ]);
  };

  const removeInvoiceLine = (index: number, uid?: string) => {
    const updatedRows = purchaseItems.filter(
      (_: any, rowIndex: any) => rowIndex !== index,
    );
    setPurchaseItems(updatedRows);
    if (setDeleteItems && uid) {
      setDeleteItems([...deleteItems, uid]);
    }
  };

  const removeALLInvoiceLine = () => {
    setPurchaseItems([]);
  };

  const handleInvoiceInputChange = (index: number, field: any, value: any) => {
    const updatedRows = purchaseItems.map((row: any, rowIndex: any) => {
      setPurchaseData({
        ...purchaseData,
        deposit: "",
      });
      if (rowIndex === index) {
        let updatedRow = { ...row };
        if (field == "productTaxRate") {
          taxRateOptions.map((rate) => {
            if (value === rate.uid) {
              updatedRow = { ...row, [field]: rate.rate, productTaxInfo: rate };
            }
          });
        } else {
          updatedRow = { ...row, [field]: value };
        }
        if (
          field === "price" ||
          field === "qty" ||
          field === "productTaxRate" ||
          field === "productTaxType"
        ) {
          if (updatedRow.productTaxType === "EXCLUSIVE") {
            updatedRow.amount = updatedRow.price * updatedRow.qty;
            updatedRow.tax =
              (updatedRow.price / 100) *
              updatedRow.productTaxRate *
              updatedRow.qty;
          }

          if (updatedRow.productTaxType === "INCLUSIVE") {
            updatedRow.price = updatedRow.price;

            updatedRow.amount = updatedRow.price * updatedRow.qty;
            updatedRow.tax = 0;
          }

          if (updatedRow.productTaxType === "NO_TAX") {
            updatedRow.price = updatedRow.price;
            updatedRow.tax = 0;
            updatedRow.amount = updatedRow.price * updatedRow.qty;
          }
        }
        return updatedRow;
      }
      return row;
    });
    setPurchaseItems(updatedRows);
  };
  const handleSelectedProduct = (index: number, product: any) => {
    const updatedRows = purchaseItems.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        row.product_uid = product.uid;
        row.productService = product.title;
        row.description = product.description;
        row.productCode = product.code;
        row.productTaxType = purchaseData?.tax_kind;
        row.isPopupOpen = false; // Close the popup

        if (purchaseData?.tax_kind === "EXCLUSIVE") {
          row.mainPrice = Number(product?.purchase_price || 0);
          row.price = Number(product?.purchase_price || 0);
          row.amount = Number(product?.purchase_price || 0) * row.qty;
          row.tax =
            (Number(product?.purchase_price || 0) / 100) *
            row.productTaxRate *
            row.qty;
        }

        if (purchaseData?.tax_kind === "INCLUSIVE") {
          row.mainPrice = Number(product?.purchase_price || 0);
          row.price = Number(product?.purchase_price || 0);
          row.amount = Number(product?.purchase_price || 0) * row.qty;
          row.tax = 0;
        }

        if (purchaseData?.tax_kind === "NO_TAX") {
          row.mainPrice = Number(product?.purchase_price || 0);
          row.price = Number(product?.purchase_price || 0);
          row.tax = 0;
          row.amount = Number(product?.purchase_price || 0) * row.qty;
        }
      }
      return row;
    });

    setPurchaseItems(updatedRows);
  };

  const handleTaxTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    purchaseItems.map((row: any, idx: any) => {
      row.productTaxType = purchaseData?.tax_kind;
    });

    const newTaxType = e.target.value;

    const updatedRows = purchaseItems.map((row: any) => {
      row.productTaxType = newTaxType;

      if (newTaxType === "EXCLUSIVE") {
        row.price = row.price;
        row.amount = row.price * row.qty;
        row.tax = (row.price / 100) * row.productTaxRate * row.qty;
      } else if (newTaxType === "INCLUSIVE") {
        // row.price = row.mainPrice - (row.mainPrice / 100) * row.productTaxRate;
        row.price = row.price;
        row.amount = row.price * row.qty;
        row.tax = 0;
      } else if (newTaxType === "NO_TAX") {
        row.price = row.price;
        row.tax = 0;
        row.amount = row.price * row.qty;
      }

      return { ...row };
    });

    setPurchaseItems(updatedRows);
  };

  const handleCategoryTaxTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    categoryItems.map((row: any, idx: any) => {
      row.productTaxType = purchaseData?.tax_kind;
      // handleInvoiceInputChange(idx, "productTaxType", e.target.value);
    });

    const newTaxType = e.target.value;
    const updatedRows = categoryItems.map((row: any) => {
      row.productTaxType = newTaxType;

      if (newTaxType === "EXCLUSIVE") {
        row.tax = (row.amount / 100) * row.productTaxRate;
      } else if (newTaxType === "INCLUSIVE") {
        row.tax = 0;
      } else if (newTaxType === "NO_TAX") {
        row.tax = 0;
      }
      return { ...row };
    });

    setCategoryItems(updatedRows);
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

    const updatedData = [...purchaseItems];
    const draggedItem = updatedData[draggingIndex];
    updatedData.splice(draggingIndex, 1);
    updatedData.splice(index, 0, draggedItem);
    setDraggingIndex(index);
    setPurchaseItems(updatedData);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  useEffect(() => {
    if (setIsTaxLoading) setIsTaxLoading(isPending);
  }, [isPending]);

  return (
    <div className="font-lexend relative">
      {/* <div className="mb-5 mt-6 flex items-center justify-start">
        <div className="flex items-center gap-2">
          <Label className="font-medium text-accent_text_gray">
            Amount are
          </Label>
          <select
            value={purchaseData?.tax_kind}
            onChange={(e) => {
              setPurchaseData({ ...purchaseData, tax_kind: e.target.value });
              handleTaxTypeChange(e);
              handleCategoryTaxTypeChange(e);
            }}
            disabled={view}
            className="mt-2 h-11 w-64 rounded-md border bg-[#F5F6FA] px-3 text-[#7E84A3] outline-none"
          >
            <option value="EXCLUSIVE">Exclusive of Tax</option>
            <option value="INCLUSIVE">Inclusive of Tax</option>
            <option value="NO_TAX">Out Of Scope Of Tax</option>
          </select>
        </div>
      </div> */}

      <div className="mb-16">
        <CategoryTable
          deleteItems={deleteItems}
          isEdit={isEdit}
          setDeleteItems={setDeleteItems}
          purchaseData={purchaseData}
          setPurchaseData={setPurchaseData}
          view={view}
          CategoryRows={categoryItems}
          setCategoryRows={setCategoryItems}
          taxRateOptions={taxRateOptions}
          taxType={purchaseData?.tax_kind}
        />
      </div>

      <div className="border-base-300 relative mb-5 rounded-none">
        <h1 className="text-base font-medium text-accent_soft_black">
          ITEMS DETAILS
        </h1>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="">
              <TableRow className="border-b-2 border-gray-300 bg-white/60 uppercase hover:bg-white">
                <TableHead className="pl-2 font-medium">#</TableHead>
                <TableHead className="text-left font-medium">
                  Product/Service
                </TableHead>
                <TableHead className="text-center font-medium">Qty</TableHead>
                {setDeleteItems && (
                  <TableHead className="px-2 text-center font-medium">
                    Remaining QTY
                  </TableHead>
                )}

                <TableHead className="text-center font-medium">Price</TableHead>
                {!(purchaseData?.tax_kind === "NO_TAX") && (
                  <TableHead className="text-center font-medium">TAX</TableHead>
                )}
                <TableHead className="text-center font-medium">
                  Amount
                </TableHead>
                {!view && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseItems?.map((row: any, index: any) => (
                <TableRow
                  draggable // Enables the drag behavior
                  onDragStart={(e) => !view && handleDragStart(e, index)}
                  onDragOver={(e) => !view && handleDragOver(e, index)}
                  onDragEnd={() => !view && handleDragEnd()}
                  key={index}
                  className={`border-none bg-white hover:bg-white`}
                >
                  {row.type === "product" ? (
                    <>
                      {" "}
                      <TableCell className="cursor-pointer border-b pl-2 pr-1">
                        <GrDrag className="text-2xl" />
                      </TableCell>
                      <TableCell className="w-84 border-b">
                        <ProductSelectDropdown
                          isStockShown={false}
                          view={view}
                          handleInvoiceInputChange={handleInvoiceInputChange}
                          handleSelectedProduct={handleSelectedProduct}
                          index={index}
                          invoiceRows={purchaseItems}
                          row={row}
                          setInvoiceRows={setPurchaseItems}
                        />
                      </TableCell>
                      <TableCell className="border-b">
                        <input
                          type="number"
                          className="w-full border-accent_soft_blue px-2 text-center outline-none hover:border-b-2 focus:border-b-2"
                          value={row.qty}
                          onChange={(e) =>
                            handleInvoiceInputChange(
                              index,
                              "qty",
                              e.target.value,
                            )
                          }
                          readOnly={view}
                          disabled={view}
                        />
                      </TableCell>
                      {setDeleteItems && (
                        <TableCell className="border-b">
                          <input
                            type="number"
                            className="w-full border-accent_soft_blue px-2 text-center outline-none hover:border-b-2 focus:border-b-2"
                            value={row.remaining_qty || 0}
                            // onChange={(e) =>
                            //   handleInvoiceInputChange(
                            //     index,
                            //     "qty",
                            //     e.target.value,
                            //   )
                            // }
                            readOnly={true}
                            disabled={true}
                          />
                        </TableCell>
                      )}
                      <TableCell className="border-b">
                        <input
                          type="text"
                          className="w-full border-accent_soft_blue px-2 text-center outline-none hover:border-b-2 focus:border-b-2"
                          value={row.price}
                          onChange={(e) =>
                            handleInvoiceInputChange(
                              index,
                              "price",
                              e.target.value,
                            )
                          }
                          readOnly={view}
                          disabled={view}
                        />
                      </TableCell>
                      {!(purchaseData?.tax_kind === "NO_TAX") && (
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
                          className="h-full w-full border-none px-2 text-center outline-none"
                          value={row.amount}
                          readOnly
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
                      <TableCell className="border-b"></TableCell>
                      <TableCell className="border-b"></TableCell>
                      {!(purchaseData?.tax_kind === "NO_TAX") && (
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
                        <TableCell className="border-b"></TableCell>
                        <TableCell className="border-b"></TableCell>
                        {!(purchaseData?.tax_kind === "NO_TAX") && (
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
                  Add a Product
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

      <div className="flex justify-end">
        <div
          style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
          className="rounded-2xl bg-white/60 p-4 text-white"
        >
          <div className="my-4 flex justify-between gap-4 font-semibold text-[#333752]">
            <p className="flex-1 text-right">Subtotal</p>
            <p className="w-32 text-right">$ {Number(subtotal).toFixed(2)}</p>
          </div>
          {/* <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center justify-end gap-2">
              <select
                value={purchaseData.discount_kind}
                onChange={(e) => {
                  setPurchaseData({
                    ...purchaseData,
                    discount_kind: e.target.value,
                  });
                }}
                className="rounded-lg border border-[#A1A7C4] bg-transparent px-4 py-2 text-[#7E84A3] outline-none"
                disabled={view}
              >
                <option value="PERCENTAGE">Discount Percentage</option>
                <option value="FLAT">Discount Value</option>
              </select>
              <input
                type="number"
                value={discount}
                onChange={(e) => handleDiscountChange(e.target.value)}
                className="w-20 rounded-lg border border-[#A1A7C4] bg-transparent px-4 py-2 text-[#7E84A3] outline-none"
                readOnly={view}
                disabled={view}
              />
            </div>
            <p className="w-32 text-right font-semibold text-[#333752]">
              - {Number(purchaseData.discount_amount)}
            </p>
          </div> */}
          {/* <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center justify-end gap-4">
              <p className="font-medium text-[#7E84A3]">Shipping</p>
              <select
                value={shipping.rate}
                onChange={(e) =>
                  setShipping((prev:any) => ({
                    ...prev,
                    rate: parseInt(e.target.value),
                  }))
                }
                className="rounded-lg border border-[#A1A7C4] bg-transparent px-4 py-2 text-[#7E84A3] outline-none"
              >
                {taxRateOptions.map((option: any) => (
                  <option key={option.value} value={option.rate}>
                    {option.rate}%
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={shipping.value}
                onChange={(e) =>handleShippingChange(e.target.value)}
                className="w-20 rounded-lg border border-[#A1A7C4] bg-transparent px-4 py-2 text-[#7E84A3] outline-none"
                readOnly={view}
                 disabled={view}
              />
            </div>
            <p className="w-32 text-right font-semibold text-[#333752]">
              + {Number(purchaseData.shipping_fee)}
            </p>
          </div> */}
          <div>
            {purchaseData?.tax_kind !== "NO_TAX" &&
              purchaseItems.map((product: any, idx: any) =>
                product.type === "product" && product.amount ? (
                  <div
                    key={idx}
                    className="mb-4 flex items-center justify-between gap-4 text-[#7E84A3]"
                  >
                    <div className="flex flex-1 justify-end">
                      <p className="text-right">
                        {product.productTaxInfo.title} @{" "}
                        {product.productTaxInfo.rate}% On $
                        {product?.amount || 0}
                      </p>
                    </div>
                    {product.productTaxType === "EXCLUSIVE" ? (
                      <p className="w-32 text-right text-[#7E84A3]">
                        {product.tax.toFixed(2)}
                      </p>
                    ) : product.productTaxType === "INCLUSIVE" ? (
                      <p className="w-32 text-right text-[#7E84A3]">
                        {(
                          (product.price / 100) *
                          product.productTaxRate *
                          product.qty
                        ).toFixed(2)}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                ) : (
                  ""
                ),
              )}
            {purchaseData?.tax_kind !== "NO_TAX" &&
              categoryItems.map((product: any, idx: any) =>
                product.type === "category" && product.amount ? (
                  <div
                    key={idx}
                    className="mb-4 flex items-center justify-between gap-4 text-[#7E84A3]"
                  >
                    <div className="flex flex-1 justify-end">
                      <p className="text-right">
                        {product.productTaxInfo.title} @{" "}
                        {product.productTaxInfo.rate}% On ${product.amount}
                      </p>
                    </div>
                    <p className="w-32 text-right text-[#7E84A3]">
                      {(
                        (product.amount / 100) *
                        product.productTaxRate
                      ).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  ""
                ),
              )}
          </div>

          <div className="mb-4 flex justify-between gap-4 font-semibold text-[#333752]">
            <p className="flex-1 text-right">Total </p>
            <p className="w-32 text-right font-semibold">
              $ {Number(purchaseData?.total).toFixed(2)}
            </p>
          </div>
          {/*<div className="my-4 flex items-center justify-between gap-4 font-semibold text-[#333752]">
            <p className="flex-1 text-right"> Deposit</p>
            <input
              type="number"
              value={purchaseData?.deposit}
              onChange={(e) => handleDepositChange(e.target.value)}
              placeholder="0.0"
              readOnly={view}
              disabled={view}
              className="w-32 rounded-lg border border-[#A1A7C4] bg-transparent px-4 py-2 text-[#7E84A3] outline-none"
            />
          </div>
          <div className="mb-4 flex justify-between gap-4 font-semibold text-accent_soft_blue">
            <p className="flex-1 text-right">Balance Due</p>
            <p className="w-32 text-right font-semibold">
              $ {Number(purchaseData?.due_total).toFixed(2)}
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ChequeTable;
