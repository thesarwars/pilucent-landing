"use client";

import type React from "react";

import Button from "@/components/ui/RawButton";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { CloseModal, handleOpenModalSM } from "@/components/ModalSM/ModalSM";
import DatePicker from "@/components/ui/DatePicker";
import { useAction } from "@/hooks/useAction";
import moment from "moment";
import BrandSelectDropDown from "@/components/ui/ScrollSelectDropDowns/BrandSelectDropdown";
import CategoryScrollSelectDropDown from "@/components/ui/ScrollSelectDropDowns/CategoryScrollSelectDropdown";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import SupplierSelectDropDown from "@/components/ui/ScrollSelectDropDowns/SupplierSelectDropDown";
import TaxSelectDropDown from "@/components/ui/ScrollSelectDropDowns/TaxSelectDropdown";
import { fetchAccounts } from "@/app/helpers/backend";

interface AddInventoryProductProps {
  Image: any;
  setImage: any;
  categoryData: any;
  brandData: any;
  onSuccess?: any;
  taxData: any;
  journalData: any;
  refetch: any;
  onClose: () => void;
  productData?: any;
  productUid?: string;
}

const AddInventoryProduct = ({
  Image,
  setImage,
  categoryData,
  brandData,
  onSuccess,
  taxData,
  journalData,
  refetch,
  onClose,
  productData,
  productUid,
}: AddInventoryProductProps) => {
  const [expiredDate, setExpiredDate] = useState<boolean>(false);
  const [purchased, setPurchased] = useState<boolean>(true);
  const { mutateAsync: addProduct } = useAction("we/products");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryValue, setCategoryValue] = useState<any>(null);
  const [brandValue, setBrandValue] = useState<any>(null);
  const [assetAccountValue, setAssetAccountValue] = useState<any>({});
  const [incomeAccountValue, setIncomeAccountValue] = useState<any>({});
  const [expenseAccountValue, setExpenseAccountValue] = useState<any>({});
  const [taxValue, setTaxValue] = useState<any>(null);
  const [supplierValue, setSupplierValue] = useState<any>(null);
  const [asOfDate, setAsOfDate] = useState(
    moment(new Date()).format("YYYY-MM-DD"),
  );
  const [expiryDate, setExpiryDate] = useState("");
  const [purchaseInformation, setPurchaseInformation] = useState<string>("");
  const [amount, setAmount] = useState<number | string>(""); // Initialize amount with 2 decimal places
  const [quantity, setQuantity] = useState<number | string>("");
  const [reorderPoint, setReorderPoint] = useState<number | string>(""); // Add state for reorderPoint
  const [salePrice, setSalePrice] = useState<number | string>(""); // Initialize salePrice with 2 decimal places
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (productData?.quantity) {
      setQuantity(productData.quantity);
    }
    if (productData?.reorder_point) {
      setReorderPoint(productData.reorder_point); // Initialize reorderPoint
    }
    if (productData?.sale_price) {
      setSalePrice(productData.sale_price); // Initialize salePrice with 2 decimal places
    }
  }, [productData]);

  useEffect(() => {
    if (!productUid) {
      setQuantity("");
      setReorderPoint("");
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
    if (productData) {
      if (productData.category && productData.category.uid) {
        setCategoryValue(productData.category);
      }

      if (productData.brand && productData.brand.uid) {
        setBrandValue(productData.brand);
      }
      setAssetAccountValue(
        productData.asset_account ? productData.asset_account : null,
      );
      setIncomeAccountValue(
        productData.income_account ? productData.income_account : null,
      );

      setTaxValue(productData.tax ? productData.tax : null);
      setSupplierValue(
        productData.prefferred_supplier
          ? productData.prefferred_supplier
          : null,
      );
      setAsOfDate(productData.date || "");
      setExpiryDate(productData.expired_date || "");
      if (
        productData.file_data &&
        productData.file_data[0] &&
        productData.file_data[0].file
      ) {
        setImage(productData.file_data[0].file);
      }

      if (productData.purchase_information_data) {
        setPurchased(true);
        if (productData.purchase_information_data.description) {
          setPurchaseInformation(
            productData.purchase_information_data.description,
          );
        }
        if (productData.purchase_information_data.amount) {
          setAmount(
            Number(productData.purchase_information_data.amount).toFixed(2),
          ); // Format amount to 2 decimal places
        }
        if (productData?.purchase_information_data?.expense_account) {
          setExpenseAccountValue(
            productData?.purchase_information_data?.expense_account
              ? productData?.purchase_information_data?.expense_account
              : null,
          );
        }
        if (productData.purchase_information_data.tax) {
          setTaxValue(productData.purchase_information_data.tax);
        }
        if (productData.purchase_information_data.prefferred_supplier) {
          const supplier =
            productData.purchase_information_data.prefferred_supplier;
          setSupplierValue(supplier);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData, categoryData, brandData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("object");
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    if (Image && Image.length > 0) {
      formData.delete("files");
      Image?.forEach((file: any) => {
        formData.append("files", file);
      });
    }

    if (!categoryValue?.uid || !brandValue?.uid) {
      toast.error("Please select a valid category and brand");
      setIsSubmitting(false);
      return;
    }

    const formValues: any = {
      title: formData.get("title"),
      sku: formData.get("sku"),
      description: formData.get("description"),
      reorder_point: Math.floor(Number(reorderPoint)),
      quantity: Math.floor(Number(quantity)),
      category_uid: categoryValue.uid,
      brand_uid: brandValue.uid,
      tax_uid: taxValue?.uid || "",
      sale_price: Number(salePrice).toFixed(2),
      asset_account_uid: assetAccountValue?.uid,
      income_account_uid: incomeAccountValue?.uid,
      date: asOfDate || formData.get("date"),
      expired_date: expiryDate,
      status: "ACTIVE",
      kind: "PRODUCT",
      is_purchased: purchased,
      is_addtional_cost: purchased, // Add is_additional_cost
      prefferred_supplier_uid: supplierValue?.uid,
      is_inventory: true,
      is_additional_cost: purchased,
      uid: productUid,
    };

    // Include additional fields if purchased is true
    if (purchased) {
      formValues.purchase_information = formData.get("purchase_information");
      formValues.amount = Number(amount).toFixed(2);
      formValues.expense_account_uid = expenseAccountValue?.uid;
      formValues.tax_uid = taxValue?.uid;
      formValues.prefferred_supplier_uid = supplierValue?.uid;
    }

    const submitFormData = new FormData();

    Object.entries(formValues).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        submitFormData.append(key, value.toString());
      }
    });

    if (Image && Image.length > 0) {
      Image.forEach((file: any) => {
        submitFormData.append("files", file);
      });
    }

    try {
      const response: any = await addProduct({
        data: submitFormData,
        uid: productUid,
      });

      if (response?.title && response?.kind === "PRODUCT") {
        toast.success(`Product ${productUid ? "updated" : "added"}`);
        onSuccess && onSuccess(response);
        refetch();
        onClose();
        handleOpenModalSM();
        CloseModal();
      } else {
        toast.error(`Failed to ${productUid ? "update" : "add"} product`);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        `Failed to ${productUid ? "update" : "add"} product`;
      toast.error(errorMessage);
      console.error(
        `Error ${productUid ? "updating" : "adding"} product:`,
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
              placeholder=""
              className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="text"
              required
              defaultValue={productData?.title || ""}
            />
          </div>
          <div className="">
            <Label className="block font-medium text-[#5A607F]">SKU</Label>
            <Input
              name="sku"
              placeholder=""
              className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="text"
              required
              defaultValue={productData?.sku || ""}
            />
          </div>
          <div>
            <Label className="block font-medium text-[#5A607F]">Category</Label>
            <CategoryScrollSelectDropDown
              value={categoryValue}
              setValue={setCategoryValue}
              required={true}
              ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
            />
          </div>
          <div>
            <Label className="block font-medium text-[#5A607F]">Brand</Label>
            <BrandSelectDropDown
              value={brandValue}
              setValue={setBrandValue}
              required={true}
              ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 items-center gap-4 bg-[#F5F6FA] p-6">
          <div className="col-span-2 flex items-center justify-between">
            <Label className="inline-block w-96 font-medium text-[#5A607F]">
              Initial quantity on hand*
            </Label>
            <input
              name="quantity"
              placeholder=""
              className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="number"
              min="0"
              step="1"
              value={quantity} // Controlled input
              onChange={(e) => {
                const newValue = Number(e.target.value);
                setQuantity(newValue < 0 ? 0 : newValue); // Update state with the new value
              }}
              required
            />
          </div>
          <div>
            <Label className="block font-medium text-[#5A607F]">
              As of date *<br />
              <span className="text-xs text-[#6A6EF6] underline">
                {"What's"} the as of date?
              </span>
            </Label>
            <DatePicker
              value={asOfDate}
              onChange={(date) => setAsOfDate(date)}
              placeholder="DD/MM/YYYY"
            />
            <input type="hidden" name="date" value={asOfDate} />
          </div>
          <div className="">
            <Label className="block font-medium text-[#5A607F]">
              Reorder Point *<br />
              <span className="text-xs text-[#6A6EF6] underline">
                {"What's"} the reorder point?{" "}
              </span>
            </Label>
            <input
              name="reorder_point"
              placeholder=""
              className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="number"
              min="0"
              step="1"
              value={reorderPoint || ""} // Controlled input for reorderPoint
              onChange={(e) => {
                Number(e.target?.value) > 0 && setReorderPoint(e.target.value); // Update state with the new value
              }}
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
          <div className="col-span-2">
            <Label className="block font-medium text-[#5A607F]">
              Description
            </Label>
            <Input
              name={"description"}
              placeholder=""
              className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="text"
              defaultValue={productData?.description || ""}
            />
          </div>
          <div className="col-span-2">
            <Label className="mb-1 block font-medium text-[#5A607F]">
              Income account{" "}
            </Label>

            <AccountSelectDropDown
              value={incomeAccountValue}
              setValue={(e: any) => setIncomeAccountValue(e)}
              filters={{ kind: "INCOMES" }}
              ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
            />
          </div>
          <div className="">
            <Label className="block font-medium text-[#5A607F]">
              Sales Price/Rate{" "}
            </Label>
            <input
              name="sale_price"
              placeholder=""
              className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
              type="number"
              min="0"
              step="0.01"
              value={salePrice} // Controlled input for salePrice
              onChange={(e) => {
                setSalePrice(e.target.value);
              }}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <div className="col-span-2">
              <div className="flex">
                <label className="label flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      setExpiredDate(!expiredDate);
                    }}
                    className="checkbox"
                  />
                  <span className="font-medium text-[#111928]">
                    Expired Date
                  </span>
                </label>
              </div>
              <div className={`${expiredDate ? "" : "hidden"}`}>
                <Label className="block font-medium text-[#5A607F]">
                  Expired Date{" "}
                </Label>
                <DatePicker
                required={false}
                  value={expiryDate}
                  onChange={(date) => setExpiryDate(date)}
                  placeholder="DD/MM/YYYY"
                />
              </div>
            </div>
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
                    value={amount} // Controlled input for amount
                    onChange={(e) => {
                      setAmount(e.target.value);
                    }}
                    readOnly={productUid ? true : false}
                  />
                </div>
                <div className="col-span-2 flex-1">
                  <Label className="mb-1 block font-medium text-[#5A607F]">
                    Expense account
                  </Label>
                  <AccountSelectDropDown
                    value={expenseAccountValue}
                    setValue={(e: any) => setExpenseAccountValue(e)}
                    filters={{
                      account_type__title: "Cost of Goods Sold (COGS)",
                    }}
                    ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
                  />
                </div>
              </div>

              {/* <div className="mt-2">
                <Label className="block font-medium text-[#5A607F]">
                  Purchase Tax{" "}
                </Label>
                <TaxSelectDropDown
                  value={taxValue}
                  setValue={setTaxValue}
                  ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
                  required={false}
                />
              </div> */}

              <div className="mt-2">
                <Label className="block font-medium text-[#5A607F]">
                  Preferred Supplier{" "}
                </Label>

                <SupplierSelectDropDown
                  ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
                  value={supplierValue}
                  setValue={setSupplierValue}
                  required={false}
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

export default AddInventoryProduct;
