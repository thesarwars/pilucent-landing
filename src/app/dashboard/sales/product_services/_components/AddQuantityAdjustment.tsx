"use client";
import Button from "@/components/ui/RawButton";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useState, useEffect } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RxDragHandleDots2 } from "react-icons/rx";
import GetToken from "@/hooks/getToken";
import ProductSelectDropDown2 from "../../../../../components/ui/ScrollSelectDropDowns/ProductSelectDropDown2";
import DatePicker from "@/components/ui/DatePicker";
import { PostData } from "@/services/company";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Temporal } from "@js-temporal/polyfill";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import { fetchAccounts, fetchProductServices } from "@/app/helpers/backend";
import { useFetch } from "@/app/helpers/hooks";
import { IoIosArrowBack } from "react-icons/io";
import { useAppSelector } from "@/app/redux/store";
import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";

interface ProductRow {
  rowIndex: number;
  productService: {
    label: string;
    value: string;
  } | null;
  description: string;
  qtyOnHand: number;
  newQty: number | "";
  changeInQty: number;
}

// Add the useFetch hook or import it

const AddQuantityAdjustment = () => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const router = useRouter();
  const token = GetToken(); // Move token to component level

  // Add these queries
  const { data: productsData } = useFetch(
    ["fetch_products"],
    fetchProductServices,
  );
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [rowIndex, SetRowIndex] = useState<number>(1);
  const [productRows, setProductRows] = useState<ProductRow[]>([
    {
      rowIndex: 0,
      productService: null,
      description: "",
      qtyOnHand: 0,
      newQty: "",
      changeInQty: 0,
    },
  ]);

  // Add loading state for submit button
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (!Permissions?.includes("add_stockadjustment")) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);
  const removeInvoiceLine = (index: number) => {
    const updatedRows = productRows.filter((_, rowIndex) => rowIndex !== index);
    setProductRows(updatedRows);
  };
  const removeALLInvoiceLine = () => {
    setProductRows([]);
  };

  const addInvoiceLine = () => {
    SetRowIndex(rowIndex + 1);
    setProductRows([
      ...productRows,
      {
        rowIndex: rowIndex,
        productService: null,
        description: "",
        qtyOnHand: 0,
        newQty: 0,
        changeInQty: 0,
      },
    ]);
  };

  const handleProductSelect = (
    index: number,
    selectedProduct: { label: string; value: string },
  ) => {
    // Find the selected product from the API data
    const productDetails = productsData?.results?.find(
      (p: any) => p.uid === selectedProduct.value,
    );

    const updatedRows = productRows.map((row, rowIndex) => {
      if (rowIndex === index) {
        return {
          ...row,
          productService: selectedProduct,
          description: productDetails?.description || "",
          qtyOnHand: productDetails?.quantity || 0,
          changeInQty: 0,
        };
      }
      return row;
    });

    setProductRows(updatedRows);
  };

  const handleInvoiceInputChange = (
    index: number,
    field: keyof ProductRow,
    value: string,
  ) => {
    const updatedRows = productRows.map((row, rowIndex) => {
      if (rowIndex === index) {
        const updatedRow: ProductRow = { ...row };

        if (field === "newQty") {
          // Remove leading zeros and handle empty/invalid input
          const cleanValue = value.replace(/^0+/, "");
          const newQty =
            cleanValue === "" ? "" : Math.max(0, Number.parseInt(cleanValue));

          updatedRow.newQty = newQty;
          updatedRow.changeInQty = newQty === "" ? 0 : newQty - row.qtyOnHand;
        } else if (field === "changeInQty" && value) {
          // Remove leading zeros and handle empty/invalid input
          const cleanValue = value.replace(/^0+/, "") || "0";
          const change = Number.parseInt(cleanValue);
          const newQty = row.qtyOnHand + change;

          if (newQty >= 0) {
            updatedRow.newQty = newQty;
            updatedRow.changeInQty = change;
          }
        } else if (field === "description") {
          // Handle description field explicitly
          updatedRow.description = value;
        }

        return updatedRow;
      }
      return row;
    });
    setProductRows(updatedRows);
  };

  const [adjustmentDate, setAdjustmentDate] = useState(todayDate);
  const [description, setDescription] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState(""); // Add state for adjustment reason

  const [incomeAccountValue, setIncomeAccountValue] = useState<any>({});

  const handleSubmit = async (createNew = false) => {
    // Prevent multiple submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Format date to YYYY-MM-DD
      let formattedDate = adjustmentDate;
      if (adjustmentDate && adjustmentDate.includes("T")) {
        formattedDate = adjustmentDate.split("T")[0];
      } else if (adjustmentDate) {
        // Ensure date is in YYYY-MM-DD format
        const dateObj = new Date(adjustmentDate);
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split("T")[0];
        }
      }

      // Filter out rows without products
      const validRows = productRows.filter((row) => row.productService?.value);

      if (validRows.length === 0) {
        toast.error("Please add at least one product", { autoClose: 3000 });
        setIsSubmitting(false);
        return;
      }

      if (!incomeAccountValue?.uid) {
        toast.error("Please select a stock adjustment account", {
          autoClose: 3000,
        });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        status: "ACTIVE",
        date: formattedDate,
        reference_number: referenceNumber,
        description: description,
        reason: adjustmentReason, // Include adjustment reason in payload
        stock_adjustment_account_uid: incomeAccountValue?.uid,
        stock_adjustment_items: validRows.map((row) => ({
          status: "ACTIVE",
          kind: row.changeInQty > 0 ? "ADDITION" : "DEDUCTION",
          description: row.description,
          quantity: Math.abs(row.changeInQty || 0),
          product_uid: row.productService?.value,
        })),
      };
      const response = await PostData("we/stock/adjustment", payload, token);

      router.push("/dashboard/sales/product_services/quantity_adjustment");
      toast.success("Quantity adjusted!");

      if (createNew) {
        // Reset form for new entry
        setProductRows([
          {
            rowIndex: 0,
            productService: null,
            description: "",
            qtyOnHand: 0,
            newQty: 0,
            changeInQty: 0,
          },
        ]);
        setDescription("");
        setReferenceNumber("");
        setAdjustmentDate(todayDate);
        setIncomeAccountValue({});
      } else {
        // Navigate back
        router.back();
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error(error?.message || "Failed to save quantity adjustment", {
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fn = async () => {
      try {
        const defaultAccount = await fetchAccounts({
          title: "Inventory Shrinkage",
        });
        if (defaultAccount?.results?.[0]?.uid) {
          setIncomeAccountValue(defaultAccount?.results[0]);
        }
      } catch (error) {
        //error here
      } finally {
        // setIsMounted(true);
      }
    };
    fn();
  }, []);

  return (
    <div className="font-lexend">
      <ManualBreadcrumbs
        items={[
          { label: "Sales", href: "/dashboard/sales/all_sales" },
          {
            label: "Products & Services",
            href: "/dashboard/sales/product_services",
          },
          {
            label: "Quantity Adjustment",
            href: "/dashboard/sales/product_services/quantity_adjustment",
          },
          {
            label: "Add Quantity Adjustment",
            href: "/dashboard/sales/product_services/add_new_inventoryqa",
          },
        ]}
        className="mb-5 mt-0"
      />
      <Button
        className="flex items-center gap-1 p-1 text-accent_soft_blue hover:underline"
        onClick={() => router.back()}
      >
        <IoIosArrowBack className="text-lg" /> Back
      </Button>
      <div className="my-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#131523]">
          List of Quantity Adjustment
        </h1>
      </div>
      <div
        style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
        className="grid grid-cols-2 justify-between gap-8 rounded-xl border-2 bg-white px-6 py-5"
      >
        <div className="max-w-80">
          <Label className="block font-semibold text-accent_text_gray">
            Adjustment Date
          </Label>
          <DatePicker
            value={adjustmentDate}
            onChange={setAdjustmentDate}
            ClassName="border border-[#A1A7C4] text-accent_text_gray"
          />
        </div>

        <div className="max-w-80">
          <Label className="block text-[#5A607F]">
            Adjustment Reason<span className="text-red-500">*</span>
          </Label>
          <select
            className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
            required
            name="reason"
            value={adjustmentReason}
            onChange={(e) => setAdjustmentReason(e.target.value)} // Update state on change
          >
            <option value="" defaultChecked>
              Select
            </option>
            <option value="Damaged Goods">Damaged Goods</option>
            <option value="Stock written-off">Stock written-off</option>
            <option value="Inventory Count">Inventory Count</option>
            <option value="Shrinkage">Shrinkage</option>
            <option value="Inventory Revaluation">Inventory Revaluation</option>
            <option value="Stolen Goods">Stolen Goods</option>
            <option value="Expired">Expired</option>
            <option value="Returned Goods">Returned Goods</option>
            <option value="Marketing and Promotions">
              Marketing and Promotions
            </option>
            <option value="Others">Others</option>
          </select>
        </div>
        <div className="max-w-80">
          <Label className="block font-semibold text-accent_text_gray">
            Stock adjustment account
          </Label>
          <AccountSelectDropDown
            value={incomeAccountValue}
            setValue={(e: any) => setIncomeAccountValue(e)}
            filters={{ kind: "EXPENSES" }}
            ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
          />
        </div>

        <div className="max-w-80">
          <Label className="block font-medium text-[#5A607F]">
            Reference no.
          </Label>
          <Input
            placeholder="3"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
            type="text"
          />
        </div>
      </div>

      <div className="border-base-300 relative mb-5 mt-10 rounded-none border-b">
        <div
          style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
          className="relative overflow-x-auto bg-white"
        >
          <Table className="bg-white hover:bg-white">
            <TableHeader className="">
              <TableRow className="border-b-2 border-gray-300 uppercase hover:bg-accent_bg_gray">
                <TableHead></TableHead>
                <TableHead>#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>QTY On Hand</TableHead>
                <TableHead>New QTY</TableHead>
                <TableHead>Change In QTy</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productRows.map((row, index) => (
                <TableRow key={index} className="border-none hover:bg-white">
                  <TableCell className="cursor-pointer p-6">
                    <RxDragHandleDots2 />
                  </TableCell>

                  <TableCell className="border-l p-4">{index + 1}</TableCell>

                  <TableCell className="relative w-[250px] overflow-visible border bg-white capitalize">
                    <div className="relative">
                      <ProductSelectDropDown2
                        value={row.productService}
                        setValue={(option) =>
                          handleProductSelect(index, option)
                        }
                        placeholder="Select product"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="border">
                    <input
                      type="text"
                      className="h-full w-full border-none px-2 outline-none"
                      value={row.description}
                      onChange={(e) =>
                        handleInvoiceInputChange(
                          index,
                          "description",
                          e.target.value,
                        )
                      }
                    />
                  </TableCell>

                  <TableCell className="border">
                    <input
                      type="number"
                      className="h-full w-full border-none px-2 text-center outline-none"
                      value={row.qtyOnHand}
                      readOnly
                    />
                  </TableCell>

                  <TableCell className="border">
                    <input
                      type="number"
                      className="h-full w-full border-none px-2 text-center outline-none"
                      value={row.newQty}
                      onChange={(e) =>
                        handleInvoiceInputChange(
                          index,
                          "newQty",
                          e.target.value,
                        )
                      }
                    />
                  </TableCell>

                  <TableCell className="border">
                    <input
                      type="number"
                      className="h-full w-full border-none px-2 text-center outline-none"
                      value={row.changeInQty}
                      onChange={(e) =>
                        handleInvoiceInputChange(
                          index,
                          "changeInQty",
                          e.target.value,
                        )
                      }
                    />
                  </TableCell>

                  <TableCell
                    onClick={() => removeInvoiceLine(index)}
                    className="cursor-pointer p-6"
                  >
                    <RiDeleteBin6Line className="text-red-500" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-3 flex justify-between px-2 pb-2">
            <div className="flex gap-x-4">
              <p
                onClick={addInvoiceLine}
                className="cursor-pointer font-medium text-accent_soft_black"
              >
                Add Line
              </p>
              <p
                onClick={removeALLInvoiceLine}
                className="cursor-pointer font-medium text-accent_soft_black"
              >
                Clear All Lines
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex max-w-xl flex-col items-start gap-4">
        <div className="w-full">
          <Label className="block font-medium text-[#5A607F]">Memo</Label>
          <textarea
            style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
            placeholder="Type"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 h-24 w-full resize-none rounded-lg border bg-white px-4 py-2 outline-none"
          />
        </div>{" "}
      </div>

      <div className="mt-16 mb-4 flex items-center justify-between gap-12">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            className="w-[142px] border border-accent_soft_blue font-semibold text-accent_soft_blue"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setProductRows([
                {
                  rowIndex: 0,
                  productService: null,
                  description: "",
                  qtyOnHand: 0,
                  newQty: 0,
                  changeInQty: 0,
                },
              ]);
              setDescription("");
              setReferenceNumber("");
              setAdjustmentDate(todayDate);
              setIncomeAccountValue({});
            }}
            className="w-[142px] border border-accent_soft_blue bg-accent_bg_light_violet px-1 font-semibold text-accent_soft_blue"
          >
            Clear
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="w-[142px] border border-accent_soft_blue font-semibold text-accent_soft_blue disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="w-[142px] bg-accent_dark_blue px-0 font-semibold text-white disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Save & New"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddQuantityAdjustment;
