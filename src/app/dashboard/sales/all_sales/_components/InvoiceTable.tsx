/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { GrDrag } from 'react-icons/gr';
import { useAppSelector } from '@/app/redux/store';
import { toast } from '@/lib/ToastService';
import SmoothCheckbox from '@/components/ui/SmoothCheckbox';
import ProductServicesDropdown from '@/components/ui/ScrollSelectDropDowns/ProductServicesDropdown';
import TaxSelectDropDown from '@/components/ui/ScrollSelectDropDowns/TaxSelectDropdown';
import { IoMdInformationCircleOutline } from 'react-icons/io';

const InvoiceTable = ({
  setIsCalculation,
  invoiceData,
  setInvoiceData,
  setInvoiceItems,
  invoiceItems,
  deleteItems,
  setDeleteItems,
  isDepositShow = true,
  setIsTaxLoading,
  storedAutoTax,
  showSummary = true,
}: {
  setIsCalculation?: any;
  deleteItems?: any;
  setDeleteItems?: any;
  invoiceItems: any;
  invoiceData: any;
  setIsTaxLoading?: any;
  storedAutoTax?: any;
  setInvoiceData: React.Dispatch<React.SetStateAction<any>>;
  setInvoiceItems: React.Dispatch<React.SetStateAction<any>>;
  isDepositShow?: boolean;
  /** Render the in-table totals/discount/tax summary + run its totals engine. Set false when the summary lives elsewhere (e.g. a sticky rail). */
  showSummary?: boolean;
}) => {
  const [discount, setDiscount] = useState<any>('');
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState<any>('');
  const [isInitial, setIsInitial] = useState(true);
  const { SalesSettingsData } = useAppSelector((state) => state.SalesSettingsData);
  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    // when the summary lives in a sibling (showSummary=false), that component
    // owns the totals engine — skip here to avoid double-writing invoiceData.
    if (!showSummary) return;
    const calculateTotals = () => {
      //product calculations
      const InvoiceSubtotal = invoiceItems.reduce(
        (acc: any, row: any) => acc + Number(row.amount),
        0
      );
      let TotalTax = 0;

      TotalTax = invoiceItems.reduce((prev: any, row: any, idx: number) => {
        if (row?.is_tax) {
          return (
            prev +
            (Number(row?.amount || 0) / 100) * Number(invoiceData?.sales_tax?.total_rate || 0)
          );
        }
        return prev;
      }, 0);

      // console.log(TotalTax);

      const InvoiceTotal = Number(InvoiceSubtotal) + Number(TotalTax);

      //set totals in purchaseData object
      const total = Number(
        (
          Number(InvoiceTotal) +
          Number(invoiceData?.shipping || 0) -
          Number(discountAmount)
        ).toFixed(3)
      );
      const dueTotal = total - Number(invoiceData?.deposit);

      setSubtotal(Number(InvoiceSubtotal));
      setInvoiceData({
        ...invoiceData,
        total_tax: Number(TotalTax.toFixed(3)),
        due_total: dueTotal,
        total: total,
        sub_total: Number(InvoiceSubtotal),
      });
    };

    calculateTotals();
  }, [
    invoiceItems,
    invoiceData?.sales_tax,
    discountAmount,
    invoiceData?.shipping,
    invoiceData?.deposit,
  ]);

  // Auto-enable tax on existing products when auto-tax is set
  useEffect(() => {
    if (invoiceData?.sales_tax?.auto_calculated && invoiceItems.length > 0) {
      const updatedItems = invoiceItems.map((item: any) => {
        if (item.type === 'product' && item.product_service && !item.is_tax) {
          return { ...item, is_tax: true };
        }
        return item;
      });
      setInvoiceItems(updatedItems);
    }
    // Clear tax from products when no auto-tax is available
    else if (!storedAutoTax && !invoiceData?.sales_tax && invoiceItems.length > 0) {
      const updatedItems = invoiceItems.map((item: any) => {
        if (item.type === 'product' && item.is_tax) {
          return { ...item, is_tax: false };
        }
        return item;
      });
      setInvoiceItems(updatedItems);
    }
  }, [invoiceData?.sales_tax?.auto_calculated, storedAutoTax, invoiceData?.sales_tax]);

  useEffect(() => {
    if (!showSummary) return;
    if (isInitial && Number(subtotal) > 0) {
      if (
        invoiceData?.discount_kind == 'PERCENTAGE' &&
        Number(invoiceData?.discount_amount) > 0 &&
        subtotal > 0
      ) {
        const dis = Number((invoiceData?.discount_amount / subtotal) * 100).toFixed(3);
        setDiscount(dis);
      }
      if (invoiceData?.discount_kind == 'FLAT' && Number(invoiceData?.discount_amount) > 0) {
        setDiscount(invoiceData?.discount_amount);
      }

      setIsInitial(false);
    }
  }, [subtotal]);

  const handleDiscountChange = (value: any) => {
    if (invoiceData.discount_kind === 'PERCENTAGE') {
      setDiscount(value);
      if (value > 100) {
        toast.warning("Discount percentage can't be greater than 100");
        setDiscount('');
        setDiscountAmount('');
        setInvoiceData({ ...invoiceData, discount_amount: '', deposit: '' });
        return;
      }
      const discountAmount = Number(subtotal / 100) * Number(value);
      setDiscountAmount(discountAmount);
      setInvoiceData({
        ...invoiceData,
        discount_amount: discountAmount,
        deposit: '',
      });
    } else if (invoiceData.discount_kind === 'FLAT') {
      setDiscount(value);
      if (value > subtotal) {
        toast.warning("Discount can't be greater than subtotal");
        setDiscountAmount('');
        setDiscount('');
        setInvoiceData({ ...invoiceData, discount_amount: '', deposit: '' });
        return;
      }
      const discountAmount = value;
      setDiscountAmount(discountAmount);
      setInvoiceData({
        ...invoiceData,
        discount_amount: discountAmount,
        deposit: '',
      });
    }
  };

  const handleDepositChange = (value: any) => {
    if (value > invoiceData?.total) {
      toast.warning("Deposit can't be greater than Total");
      setInvoiceData({
        ...invoiceData,
        deposit: '',
      });
      return;
    }
    setInvoiceData({
      ...invoiceData,
      deposit: Number(value),
      due_total: invoiceData?.total - Number(value),
    });
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addInvoiceLine = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: generateId(),
        type: 'product',
        product_service: '',
        description: '',
        qty: 1,
        price: 0,
        amount: 0,
        is_tax: false,
      },
    ]);
  };

  const addSection = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: generateId(),
        type: 'section',
        product_service: '',
        description: '',
        qty: 1,
        price: 0,
        amount: 0,
      },
    ]);
  };

  const addNote = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: generateId(),
        type: 'note',
        product_service: '',
        description: '',
        qty: 1,
        price: 0,
        amount: 0,
      },
    ]);
  };

  const removeInvoiceLine = (id: number, uid?: string) => {
    const updatedRows = invoiceItems.filter((item: any, idx: number) => idx !== id);
    if (setDeleteItems && uid) {
      setDeleteItems([...deleteItems, uid]);
    }
    setInvoiceItems(updatedRows);
  };

  const removeAllInvoiceLines = () => {
    setInvoiceItems([]);
  };

  const handleInvoiceInputChange = (index: number, field: any, value: any) => {
    const updatedRows = invoiceItems.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        setInvoiceData({
          ...invoiceData,
          deposit: '',
        });
        let updatedRow = { ...row };

        updatedRow = { ...row, [field]: value };

        if (field === 'price' || field === 'qty') {
          updatedRow.amount = updatedRow.price * updatedRow.qty;
        }
        return updatedRow;
      }
      return row;
    });
    setInvoiceItems(updatedRows);
  };

  const handleSelectedProduct = (index: number, product: any) => {
    const updatedRows = invoiceItems.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        row.product_service = product;
        row.product = product;
        row.description = product.description;
        row.price = product.sale_price;
        row.amount = product.sale_price * row.qty;

        // Auto-enable tax if storedAutoTax is available
        if (storedAutoTax) {
          row.is_tax = true;
        }
      }
      return row;
    });

    setInvoiceItems(updatedRows);

    // Auto-set tax when first product is selected
    if (storedAutoTax && !invoiceData?.sales_tax?.auto_calculated) {
      setInvoiceData((prev: any) => ({
        ...prev,
        sales_tax: storedAutoTax,
      }));
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
    setIsDragging(false);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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

    const draggedIndex = invoiceItems.findIndex((item: any) => item.id === draggedItem);
    const dropIndex = invoiceItems.findIndex((item: any) => item.id === dropItemId);

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
    <div className="relative font-lexend text-sm font-light">
      <div className="relative mt-7">
        {/* Table Container */}
        <div className="mb-5 rounded-lg border bg-white/60 shadow-sm">
          <div className="">
            {/* Header Row - Only visible on desktop */}
            <div className="hidden border-b p-4 text-sm font-medium uppercase text-accent_soft_black md:grid md:grid-cols-12 md:gap-2 [&>div]:min-w-0 [&_input]:min-w-0">
              <div className="col-span-1">#</div>
              <div className="text-left md:col-span-3">Product/Service</div>
              <div className="text-center md:col-span-1">Qty</div>
              <div className="text-center md:col-span-2">Rate</div>
              {invoiceData.tax_kind !== 'NO_TAX' && (
                <div className="text-center md:col-span-2">Tax</div>
              )}
              <div
                className={`${invoiceData.tax_kind !== 'NO_TAX' ? 'md:col-span-2' : 'md:col-span-4'} text-center`}
              >
                Amount
              </div>
              <div className="md:col-span-1"></div>
            </div>

            {/* Table Body */}
            {invoiceItems.map((row: any, index: number) => (
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
                  draggedItem === row.id ? 'bg-blue-100 opacity-50' : ''
                } ${
                  dragOverItem === row.id && draggedItem !== row.id
                    ? 'border-t-4 border-t-blue-500 bg-blue-50'
                    : ''
                } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              >
                {row.type === 'product' ? (
                  <>
                    {/* Desktop View */}
                    <div className="hidden md:grid md:grid-cols-12 md:items-center md:gap-2 md:px-4 [&>div]:min-w-0 [&_input]:min-w-0">
                      <div className="col-span-1 flex items-center">
                        <div className="cursor-grab rounded p-2 transition-colors hover:bg-gray-100 active:cursor-grabbing">
                          <GrDrag className="text-2xl text-gray-400" />
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <div className="w-full">
                          <ProductServicesDropdown
                            ClassName="border-b-2 focus:border-b-accent_soft_blue"
                            setValue={(value: any) => {
                              console.log(value);
                              if (value?.quantity == 0 && value?.kind == 'PRODUCT') {
                                toast.warning('Product is out of stock!');
                                return;
                              }
                              handleSelectedProduct(index, value);
                            }}
                            value={row?.product_service}
                          />
                          <input
                            placeholder="Product description here..."
                            className="mb-1 w-full border-b px-2 py-1 text-[13px] outline-none focus:border-b-accent_soft_blue"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-1">
                        <div className="group relative flex items-center justify-center">
                          <div className="absolute top-[-80px] z-[-1] translate-y-[-20px] opacity-0 transition-all duration-500 group-hover:z-[1000] group-hover:translate-y-0 group-hover:opacity-100">
                            <p className="w-max rounded bg-[#8d8d8d] px-3 py-2 text-[0.9rem] text-white">
                              Quantity On Hand: {row?.product?.quantity || 0} <br />
                              Reorder Point: {row?.product?.reorder_point || 0}
                            </p>
                          </div>
                          <input
                            type="number"
                            className="h-7 w-full border-accent_soft_blue px-2 text-center outline-none hover:border-b-2 focus:border-b-2 max-md:min-w-32"
                            value={row.qty}
                            onChange={(e) => handleInvoiceInputChange(index, 'qty', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          className="w-full border-b border-transparent px-2 py-1 text-center outline-none transition-colors hover:border-violet-500 focus:border-violet-500"
                          value={row.price}
                          onChange={(e) =>
                            handleInvoiceInputChange(index, 'price', Number(e.target.value))
                          }
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="items-ce flex justify-center">
                          <SmoothCheckbox
                            checked={row.is_tax}
                            onCheckedChange={() =>
                              handleInvoiceInputChange(index, 'is_tax', !row?.is_tax)
                            }
                          />
                        </div>
                      </div>

                      <div className={`md:col-span-2`}>
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-center outline-none"
                          value={Number(row?.amount || 0).toFixed(2)}
                          readOnly
                        />
                      </div>
                      <div className="flex items-center justify-center md:col-span-1">
                        <button
                          onClick={() => removeInvoiceLine(index)}
                          className="rounded p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                        >
                          <RiDeleteBin6Line className="text-lg" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="p-4 md:hidden">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-lg font-medium">Product or service</div>
                      </div>
                      <div className="mb-4 flex items-center justify-between">
                        {/* <div className="cursor-grab rounded p-2 transition-colors hover:bg-gray-100 active:cursor-grabbing">
                          <GrDrag className="text-xl text-gray-400" />
                        </div> */}
                        <div className="mx-2 text-center font-medium">{index + 1}</div>
                        <button
                          onClick={() => removeInvoiceLine(index)}
                          className="rounded p-2 text-gray-500 transition-colors hover:bg-red-50"
                        >
                          <RiDeleteBin6Line className="text-xl" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-accent_soft_black">
                            Product/service
                          </label>
                          <ProductServicesDropdown
                            ClassName="border focus:border-accent_soft_blue rounded"
                            setValue={(value: any) => {
                              if (value?.quantity == 0 && value?.kind == 'PRODUCT') {
                                toast.warning('Product is out of stock!');
                                return;
                              }
                              handleSelectedProduct(index, value);
                            }}
                            value={row?.product_service}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-accent_soft_black">
                            Description
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-md border px-3 py-2 outline-none transition-colors focus:border-accent_soft_blue focus:ring-1 focus:ring-accent_soft_blue"
                            value={row.description}
                            onChange={(e) =>
                              handleInvoiceInputChange(index, 'description', e.target.value)
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-accent_soft_black">
                              Qty
                            </label>
                            <input
                              type="number"
                              className="w-full rounded-md border px-3 py-2 outline-none transition-colors focus:border-accent_soft_blue focus:ring-1 focus:ring-accent_soft_blue"
                              value={row.qty}
                              onChange={(e) =>
                                handleInvoiceInputChange(index, 'qty', Number(e.target.value))
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-accent_soft_black">
                              Rate
                            </label>
                            <input
                              type="number"
                              className="w-full rounded-md border px-3 py-2 outline-none transition-colors focus:border-accent_soft_blue focus:ring-1 focus:ring-accent_soft_blue"
                              value={row.price}
                              onChange={(e) =>
                                handleInvoiceInputChange(index, 'price', Number(e.target.value))
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-accent_soft_black">
                            Amount
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-md border px-3 py-2 outline-none"
                            value={Number(row?.amount || 0)?.toFixed(2)}
                            readOnly
                          />
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <SmoothCheckbox
                            checked={row.is_tax}
                            onCheckedChange={() =>
                              handleInvoiceInputChange(index, 'is_tax', !row?.is_tax)
                            }
                          />

                          <label
                            htmlFor={`tax-${index}`}
                            className="-mt-1.5 text-sm font-medium text-accent_soft_black"
                          >
                            Sale Tax
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                ) : row.type === 'section' ? (
                  <>
                    {/* Desktop View for Section */}
                    <div className="hidden md:grid md:grid-cols-12 md:gap-2 md:p-4 [&>div]:min-w-0 [&_input]:min-w-0">
                      <div className="flex items-center md:col-span-1">
                        <div className="cursor-grab rounded p-2 transition-colors hover:bg-gray-100 active:cursor-grabbing">
                          <GrDrag className="text-2xl text-gray-400" />
                        </div>
                      </div>
                      <div className="md:col-span-10">
                        <input
                          type="text"
                          className="w-full border-b border-transparent px-2 py-1 text-lg italic text-accent_soft_black outline-none transition-colors hover:border-accent_soft_blue focus:border-accent_soft_blue"
                          placeholder="Section title"
                          value={row.description}
                          onChange={(e) =>
                            handleInvoiceInputChange(index, 'description', e.target.value)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-center md:col-span-1">
                        <button
                          onClick={() => removeInvoiceLine(index)}
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
                            className="w-full rounded-md border px-3 py-2 text-lg italic text-accent_soft_black outline-none transition-colors focus:border-accent_soft_blue focus:ring-1 focus:ring-accent_soft_blue"
                            placeholder="Section title"
                            value={row.description}
                            onChange={(e) =>
                              handleInvoiceInputChange(index, 'description', e.target.value)
                            }
                          />
                        </div>
                        <button
                          onClick={() => removeInvoiceLine(index)}
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
                    <div className="hidden md:grid md:grid-cols-12 md:gap-2 md:p-4 [&>div]:min-w-0 [&_input]:min-w-0">
                      <div className="flex items-center md:col-span-1">
                        <div className="cursor-grab rounded p-2 transition-colors hover:bg-gray-100 active:cursor-grabbing">
                          <GrDrag className="text-2xl text-gray-400" />
                        </div>
                      </div>
                      <div className="md:col-span-10">
                        <input
                          type="text"
                          className="w-full border-b border-transparent px-2 py-1 text-lg font-light text-gray-500 outline-none transition-colors hover:border-accent_soft_blue focus:border-accent_soft_blue"
                          placeholder="Note"
                          value={row.description}
                          onChange={(e) =>
                            handleInvoiceInputChange(index, 'description', e.target.value)
                          }
                        />
                      </div>
                      <div className="flex items-center justify-center md:col-span-1">
                        <button
                          onClick={() => removeInvoiceLine(index)}
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
                            className="w-full rounded-md border px-3 py-2 text-lg font-light text-gray-500 outline-none transition-colors focus:border-accent_soft_blue focus:ring-1 focus:ring-accent_soft_blue"
                            placeholder="Note"
                            value={row.description}
                            onChange={(e) =>
                              handleInvoiceInputChange(index, 'description', e.target.value)
                            }
                          />
                        </div>
                        <button
                          onClick={() => removeInvoiceLine(index)}
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
          <div className="p-4">
            <div className="flex flex-wrap gap-4 text-accent_soft_blue">
              <button
                onClick={addInvoiceLine}
                className="rounded px-2 py-1 font-medium transition-colors hover:bg-gray-100 hover:text-accent_soft_blue"
              >
                Add a Product
              </button>
              <button
                onClick={addSection}
                className="rounded px-2 py-1 font-medium transition-colors hover:bg-gray-100 hover:text-accent_soft_blue"
              >
                Add a Section
              </button>
              <button
                onClick={addNote}
                className="rounded px-2 py-1 font-medium transition-colors hover:bg-gray-100 hover:text-accent_soft_blue"
              >
                Add a Note
              </button>
              {!setDeleteItems && (
                <button
                  onClick={removeAllInvoiceLines}
                  className="rounded px-2 py-1 font-medium transition-colors hover:bg-gray-100 hover:text-accent_soft_blue"
                >
                  Remove All
                </button>
              )}
            </div>
          </div>
        </div>

        {showSummary && (
        <div className="flex justify-end">
          <div
            style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.05)' }}
            className="rounded-2xl bg-white/60 p-4 text-white md:w-auto"
          >
            <div className="my-4 flex justify-between gap-2 font-semibold text-[#333752] md:flex-row md:justify-between md:gap-4">
              <p className="text-right md:flex-1">Subtotal</p>
              <p className="text-right md:w-32">
                ${' '}
                {invoiceData?.tax_kind == 'INCLUSIVE'
                  ? (Number(subtotal) - Number(invoiceData.total_tax)).toFixed(3)
                  : Number(subtotal).toFixed(3)}
              </p>
            </div>
            {SalesSettingsData?.is_discount && (
              <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2 md:flex-1 md:flex-row md:items-center md:justify-end">
                  <select
                    value={invoiceData.discount_kind}
                    onChange={(e) => {
                      setInvoiceData({
                        ...invoiceData,
                        discount_kind: e.target.value,
                      });
                    }}
                    className="w-full rounded-lg border border-accent_soft_black bg-transparent px-4 py-2 text-accent_soft_black outline-none sm:w-auto"
                  >
                    <option value="PERCENTAGE">Discount Percentage</option>
                    <option value="FLAT">Discount Value</option>
                  </select>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    className="w-full rounded-lg border border-accent_soft_black bg-transparent px-4 py-2 text-accent_soft_black outline-none md:w-20"
                  />
                </div>
                <p className="text-right font-semibold text-[#333752] md:w-32">
                  - {Number(invoiceData.discount_amount).toFixed(2)}
                </p>
              </div>
            )}
            {SalesSettingsData?.is_shipping && (
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                  <p className="font-medium text-accent_soft_black sm:text-right">Shipping</p>
                  <input
                    type="number"
                    value={invoiceData?.shipping || ''}
                    onChange={(e) =>
                      setInvoiceData({
                        ...invoiceData,
                        shipping: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-accent_soft_black bg-transparent px-4 py-2 text-accent_soft_black outline-none md:w-24"
                  />
                </div>
                <p className="w-32 text-right font-semibold text-accent_soft_black">
                  + {Number(invoiceData?.shipping || 0.0)}
                </p>
              </div>
            )}
            <div className="flex items-center gap-4 font-semibold text-[#333752]">
              <p className="text-right">Sales tax rate</p>
              <div className="flex flex-1 flex-col gap-1">
                <TaxSelectDropDown
                  parentClassName="flex-1"
                  ClassName="border font-normal border-accent_soft_black focus:border-accent_soft_blue rounded-md"
                  value={invoiceData?.sales_tax}
                  setValue={(e: any) => setInvoiceData({ ...invoiceData, sales_tax: e })}
                  storedAutoTax={storedAutoTax}
                />
                {invoiceData?.sales_tax?.auto_calculated && (
                  <p className="text-xs font-normal text-green-600">
                    ✓ Auto-calculated based on customer address
                  </p>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between px-4 py-2 text-base font-normal text-accent_soft_black">
                <p>Total sales tax </p>
                <p>$ {Number(invoiceData?.total_tax)?.toFixed(2)}</p>
              </div>
              {/* {invoiceItems.map((product: any, idx: any) =>
                product.type === "product" &&
                product.amount &&
                product?.is_tax &&
                invoiceData?.sales_tax ? (
                  <div
                    key={idx}
                    className="mb-4 flex flex-col gap-4 text-sm font-normal text-accent_soft_black md:flex-row md:items-center md:justify-between md:gap-4"
                  >
                    <div className="flex flex-1 justify-end gap-4">
                      <p className="text-right">
                        {invoiceData?.sales_tax?.title} @{" "}
                        {invoiceData?.sales_tax?.total_rate}% On $
                        {product?.amount}
                      </p>
                      {"->"}
                      <p>
                      ${" "}
                      {(
                        (product?.amount / 100) *
                          Number(invoiceData?.sales_tax?.total_rate || 0)
                          ).toFixed(2)}
                          </p>
                          </div>
                          </div>
                          ) : (
                            ""
                            ),
                            )} */}
            </div>
            {invoiceData?.sales_tax && (
              <div className="flex items-center justify-end">
                <button
                  className="mb-3 flex items-center gap-1 px-2 py-1 text-sm font-normal text-accent_soft_blue hover:bg-gray-200 hover:underline"
                  onClick={() => setIsCalculation && setIsCalculation(true)}
                >
                  See math{' '}
                  <IoMdInformationCircleOutline className="text-lg text-accent_soft_blue" />
                </button>
              </div>
            )}

            {SalesSettingsData?.is_deposit && isDepositShow && (
              <div className="mb-4 flex items-center justify-between gap-4 font-semibold text-[#333752]">
                <p className="flex-1 text-right">Deposit</p>
                <input
                  type="number"
                  value={invoiceData?.deposit}
                  onChange={(e) => handleDepositChange(e.target.value)}
                  placeholder="0.0"
                  className="w-32 rounded-lg border border-accent_soft_black bg-transparent px-4 py-2 font-normal text-accent_soft_black outline-none"
                />
              </div>
            )}

            <div className="mb-4 flex justify-between gap-4 border-t border-t-accent_soft_black pt-2 font-semibold text-[#333752]">
              <p className="flex-1 text-right">Total</p>
              <p className="w-32 text-right font-semibold">
                $ {Number(invoiceData?.total).toFixed(2)}
              </p>
            </div>

            {isDepositShow && (
              <div className="mb-4 flex justify-between gap-4 font-semibold text-accent_soft_blue">
                <p className="flex-1 text-right">Balance Due</p>
                <p className="w-32 text-right font-semibold">
                  $ {Number(invoiceData?.due_total).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceTable;
