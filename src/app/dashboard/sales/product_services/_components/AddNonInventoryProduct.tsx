"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/ui/RawButton";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import ScrollSelect from "@/components/ui/InfiniteSelect/InfiniteScroll";
import { CloseModal } from "@/components/ModalSM/ModalSM";
import DatePicker from "@/components/ui/DatePicker";
import AccountSelect from "../../../../../components/ui/ScrollSelectDropDowns/AccountSelect";
import { useAction } from "@/hooks/useAction";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import CategoryScrollSelectDropDown from "@/components/ui/ScrollSelectDropDowns/CategoryScrollSelectDropdown";
import BrandSelectDropDown from "@/components/ui/ScrollSelectDropDowns/BrandSelectDropdown";
import TaxSelectDropDown from "@/components/ui/ScrollSelectDropDowns/TaxSelectDropdown";
import SupplierSelectDropDown from "@/components/ui/ScrollSelectDropDowns/SupplierSelectDropDown";
import moment from "moment";
import { fetchAccounts } from "@/app/helpers/backend";

interface NonInventoryProductProps {
  image: any;
  setImage: any;
  categoryData: any;
  brandData: any;
  onSuccess?: any;
  taxData: any;
  journalData: any;
  refetch: any;
  onClose: () => void;
  productData?: any; // Add productData prop
  productUid?: string; // Add productUid prop
}

const NonInventoryProduct = ({
  image,
  setImage,
  categoryData,
  brandData,
  onSuccess,
  taxData,
  journalData,
  refetch,
  onClose,
  productData, // Destructure productData
  productUid, // Destructure productUid
}: NonInventoryProductProps) => {
  const [sellToCustomers, setSellToCustomers] = useState(false);
  const [expiredDate, setExpiredDate] = useState(false);
  const [purchased, setPurchased] = useState(true);
  const [asOfDate, setAsOfDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: addProduct } = useAction("we/products");
  const [isMounted, setIsMounted] = useState(false);
  const [categoryValue, setCategoryValue] = useState<any>(null);
  const [brandValue, setBrandValue] = useState<any>(null);
  const [incomeAccountValue, setIncomeAccountValue] = useState<any>({});
  const [taxValue, setTaxValue] = useState<any>(null);
  const [expenseAccountValue, setExpenseAccountValue] = useState<any>({});
  const [assetAccountValue, setAssetAccountValue] = useState<any>({});
  const [supplierValue, setSupplierValue] = useState<any>(null);
  const [amount, setAmount] = useState<string>("0.00"); // Initialize amount with 2 decimal places
  const [salePrice, setSalePrice] = useState<string>("0.00"); // Initialize sale price with 2 decimal places

  useEffect(() => {
    if (productData) {
      // Set initial form values based on productData
      if (productData.category && productData.category.uid) {
        setCategoryValue(productData.category);
      }

      if (productData.brand && productData.brand.uid) {
        setBrandValue(productData.brand);
      }

      // Set income account if exists
      if (productData.income_account) {
        setIncomeAccountValue(productData.income_account);
        setSellToCustomers(true);
      }

      // Set sale price if exists
      if (productData.sale_price) {
        setSalePrice(Number(productData.sale_price).toFixed(2));
      }

      // Handle purchase information data
      if (productData.purchase_information_data) {
        setPurchased(true); // Enable purchase checkbox

        // Set expense account
        if (productData.purchase_information_data.expense_account) {
          setExpenseAccountValue(
            productData.purchase_information_data.expense_account,
          );
        }

        // Set amount if exists
        if (productData.purchase_information_data.amount) {
          setAmount(
            Number(productData.purchase_information_data.amount).toFixed(2),
          );
        }

        // Set preferred supplier
        if (productData.purchase_information_data.prefferred_supplier) {
          const supplier =
            productData.purchase_information_data.prefferred_supplier;
          setSupplierValue(supplier);
        }

        // Set tax
        if (productData.purchase_information_data.tax) {
          setTaxValue(productData.purchase_information_data.tax);
        }
      }

      // Set dates
      if (productData.date) {
        setAsOfDate(productData.date);
      }
      if (productData.expired_date) {
        setExpiredDate(true);
        setExpiryDate(productData.expired_date);
      }
    }
  }, [productData]);

  useEffect(() => {
    if (isMounted || productUid) return;
    const fn = async () => {
      try {
        const defaultAsset = await fetchAccounts({ title: "Inventory Asset" });
        const defaultExpense = await fetchAccounts({
          title: "Cost of Goods Sold (COGS)",
        });
        const defaultIncome = await fetchAccounts({
          title: "Sales of Product Income",
        });

        if (defaultAsset?.results?.[0]?.uid) {
          setAssetAccountValue(defaultAsset?.results[0]);
        }

        if (defaultExpense?.results?.[0]?.uid) {
          setExpenseAccountValue(defaultExpense?.results[0]);
        }
        if (defaultIncome?.results?.[0]?.uid) {
          setIncomeAccountValue(defaultIncome?.results[0]);
        }
      } catch (error) {
        //error here
      } finally {
        setIsMounted(true);
      }
    };
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!productUid) {
      setSalePrice("");
      setBrandValue(null);
      setCategoryValue(null);
      setTaxValue(null);
      setSupplierValue(null);
      setAsOfDate(moment(new Date()).format("YYYY-MM-DD"));
      setExpiryDate("");
      // setPurchased(false)
      setAmount("");
    }
  }, [productUid]);

  useEffect(() => {
    if (categoryData && productData?.category?.uid) {
      const categoryExists = categoryData.results.some(
        (cat: any) => cat.uid === productData.category.uid,
      );
      if (!categoryExists) {
        setCategoryValue(null);
      }
    }
    if (brandData && productData?.brand?.uid) {
      const brandExists = brandData.results.some(
        (brand: any) => brand.uid === productData.brand.uid,
      );
      if (!brandExists) {
        setBrandValue(null);
      }
    }
  }, [categoryData, brandData, productData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    // Ensure the image is appended correctly
    if (image && image.length > 0) {
      formData.delete("files");
      image.forEach((file: any) => {
        formData.append("files", file);
      });
    }

    // Format numeric values to exactly 2 decimal places
    const formatDecimal = (
      value: string | number | null | undefined,
    ): string => {
      if (value === null || value === undefined || value === "") return "0.00";
      return Number(value).toFixed(2);
    };

    // Ensure all required fields are included
    const formValues: any = {
      title: formData.get("title"),
      sku: formData.get("sku"),
      description: formData.get("description"),
      category_uid: categoryValue?.uid,
      brand_uid: brandValue?.uid,
      tax_uid: taxValue?.uid,
      sale_price: formatDecimal(sellToCustomers ? salePrice : 0),
      income_account_uid: incomeAccountValue?.uid,
      asset_account_uid: assetAccountValue?.uid,
      date: asOfDate || formData.get("date"),
      expired_date: expiryDate,
      status: "ACTIVE",
      kind: "PRODUCT",
      is_inventory: false,
      is_purchased: purchased,
      is_addtional_cost: purchased, // Add is_additional_cost
      quantity: 1,
      prefferred_supplier_uid: supplierValue?.uid,
      uid: productUid, // Add uid to form values
    };

    // Include additional fields if purchased is true
    if (purchased) {
      formValues.purchase_information = formData.get("purchase_information");
      formValues.amount = formatDecimal(amount);
      formValues.expense_account_uid = expenseAccountValue?.uid;
      formValues.tax_uid = taxValue?.uid;
      formValues.prefferred_supplier_uid = supplierValue?.uid;
    }

    const submitFormData = new FormData();

    // Ensure we're only adding valid values to the FormData
    Object.entries(formValues).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        submitFormData.append(key, value.toString());
      }
    });

    // Append the image files to the FormData
    if (image && image.length > 0) {
      image.forEach((file: any) => {
        submitFormData.append("files", file);
      });
    }

    try {
      const response: any = await addProduct({
        data: submitFormData,
        uid: productUid,
      });

      // Check if response has expected properties
      if (response?.title && response?.is_inventory === false) {
        toast.success(
          `Non-Inventory Product ${productUid ? "updated" : "added"}`,
        );
        onSuccess && onSuccess(response);
        await refetch();
        onClose();
        CloseModal();
      } else {
        toast.error(
          `Failed to ${productUid ? "update" : "add"} non-inventory product`,
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        `Failed to ${productUid ? "update" : "add"} non-inventory product`;
      toast.error(errorMessage);
      console.error(
        `Error ${productUid ? "updating" : "adding"} non-inventory product:`,
        error,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 bg-[#F5F6FA] p-6">
          <div className="mt-4">
            <Label className="block font-medium text-[#5A607F]">Name*</Label>
            <Input
              name="title"
              required
              className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="text"
              defaultValue={productData?.title || ""} // Set default value
            />
          </div>

          <div>
            <Label className="block font-medium text-[#5A607F]">SKU</Label>
            <Input
              name="sku"
              className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="text"
              defaultValue={productData?.sku || ""} // Set default value
            />
          </div>

          <div>
            <Label className="block font-medium text-[#5A607F]">Category</Label>
            <CategoryScrollSelectDropDown
              ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
              value={categoryValue}
              setValue={setCategoryValue}
            />
          </div>

          <div>
            <Label className="block font-medium text-[#5A607F]">Brand</Label>
            <BrandSelectDropDown
              value={brandValue}
              setValue={setBrandValue}
              ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 items-center gap-4 bg-[#F5F6FA] p-6">
          <div className="col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={sellToCustomers}
                onChange={(e) => setSellToCustomers(e.target.checked)}
                className="checkbox"
              />
              <Label className="font-medium text-[#111928]">
                I sell this product to my customers
              </Label>
            </div>
          </div>

          <div className="col-span-2">
            <Label className="block font-medium text-[#5A607F]">
              Description
            </Label>
            <Input
              name="description"
              className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="text"
              defaultValue={productData?.description || ""} // Set default value
            />
          </div>

          <div className="col-span-2">
            <Label className="mb-1 block font-medium text-[#5A607F]">
              Inventory asset account{" "}
            </Label>
            <AccountSelectDropDown
              value={assetAccountValue}
              setValue={(e: any) => setAssetAccountValue(e)}
              filters={{ kind: "ASSETS" }}
              ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
            />
          </div>

          {sellToCustomers && (
            <div className="col-span-2 flex flex-col">
              <div>
                <Label className="block font-medium text-[#5A607F]">
                  Sales Price/Rate
                </Label>
                <input
                  name="sale_price"
                  className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                  type="number"
                  min="0"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = Number.parseFloat(value);
                    setSalePrice(
                      isNaN(numValue) ? "0.00" : numValue.toFixed(2),
                    );
                  }}
                />
              </div>

              <div>
                <Label className="block font-medium text-[#5A607F]">
                  Income Account
                </Label>
                <AccountSelectDropDown
                  ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
                  value={incomeAccountValue}
                  setValue={(e: any) => setIncomeAccountValue(e)}
                  filters={{ kind: "INCOMES" }}
                />
              </div>
            </div>
          )}

          <div className="col-span-2">
            <Label className="block font-medium text-[#5A607F]">
              As of Date
            </Label>
            <DatePicker
              value={asOfDate}
              onChange={(date) => setAsOfDate(date)}
              placeholder="DD/MM/YYYY"
            />
            <input type="hidden" name="date" value={asOfDate} />
          </div>

          <div className="col-span-2 flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={expiredDate}
                onChange={(e) => setExpiredDate(e.target.checked)}
                className="checkbox"
              />
              <Label className="font-medium text-[#111928]">Expired Date</Label>
            </div>
            {expiredDate && (
              <>
                <DatePicker
                  required={expiredDate}
                  value={expiryDate}
                  onChange={(date) => setExpiryDate(date)}
                  placeholder="DD/MM/YYYY"
                />
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 bg-[#F5F6FA] p-6">
          {purchased && (
            <div>
              <div className="">
                <Label className="block font-medium text-[#5A607F]">
                  Purchasing Information
                </Label>
                <Input
                  name="purchase_information"
                  placeholder=""
                  className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                  type="text"
                  defaultValue={
                    productData?.purchase_information_data?.description || ""
                  }
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex-1">
                  <Label className="block font-medium text-[#5A607F]">
                    Cost
                  </Label>
                  <input
                    name="amount"
                    placeholder=""
                    className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = Number.parseFloat(value);
                      setAmount(isNaN(numValue) ? "0.00" : numValue.toFixed(2));
                    }}
                    readOnly={productUid ? true : false}
                  />
                </div>
                <div className="col-span-2 flex-1">
                  <Label className="mb-1 block font-medium text-[#5A607F]">
                    Expense account
                  </Label>
                  <AccountSelectDropDown
                    ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
                    value={expenseAccountValue}
                    setValue={(e: any) => setExpenseAccountValue(e)} // Ensure state is updated correctly
                    filters={{ kind: "EXPENSES" }} // Correct filter for expense accounts
                  />
                </div>
              </div>

              {/* <div>
                <Label className="block font-medium text-[#5A607F]">
                  Purchase Tax{" "}
                </Label>
                <TaxSelectDropDown
                  value={taxValue}
                  setValue={setTaxValue}
                  ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
                />
              </div> */}

              <div>
                <Label className="block font-medium text-[#5A607F]">
                  Preferred Supplier{" "}
                </Label>
                <SupplierSelectDropDown
                  value={supplierValue}
                  setValue={setSupplierValue}
                  ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            type="submit"
            className="bg-[#00035F] text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NonInventoryProduct;
