/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import TagInput from "../../_components/TagInput";
import FileUpload from "../../_components/FileUpload";
import dynamic from "next/dynamic";
import DatePicker from "@/components/ui/DatePicker";
import { useAppSelector } from "@/app/redux/store";
import LocationSelectDropDown from "../../../../../../components/ui/ScrollSelectDropDowns/LocationSelectDropDown";
import { GetData } from "@/services/FetchMethods";
import CurrencySelect from "../../_components/CurrencySelect";
import TextAnimation from "../../_components/CustomTypewritter";
import moment from "moment";
import { useRouter } from "next/navigation";
import ProductModalSkeleton from "@/components/ProductManager/ProductModalSkeleton";
import CreateProductAndService from "@/components/ProductManager/CreateProductService";
import { convertBackendToFrontendData } from "@/utils/ConvertSalesData";
import PayMethodSelectDropdown from "../../../../../../components/ui/ScrollSelectDropDowns/PayMethodSelectDropdown";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import { toast } from "@/lib/ToastService";
import { deleteSingleSaleItem, patchSale, fetchAgencyTaxSet } from "@/app/helpers/backend";
import MainLoader from "@/components/MainLoader/MainLoader";
import InvoiceTable from "../../_components/InvoiceTable";
import InvoiceSummary from "../../_components/InvoiceSummary";
import Modal from "@/app/(admin)/_components/Modal";
import { formatPercent } from "@/utils/TaxLookUp";
import { cn } from "@/lib/utils";
import { Breadcrumb, Chip, IconChip, VioletButton, money, V } from "@/components/violet";
import { ArrowLeft, User, CreditCard, ListPlus, Paperclip, Loader2 } from "lucide-react";

const TaxCalculation = dynamic(
  () => import("../../invoice/_components/TaxCalculation"),
  {
    ssr: false,
  },
);

const TextEditor = dynamic(
  () => import("@/app/dashboard/sales/all_sales/_components/TextEditor"),
  {
    ssr: false,
  },
);

/* violet field + label styles reused across the form */
const V_FIELD =
  "w-full min-w-0 rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13.5px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]";
const V_LABEL = "mb-1.5 block text-xs font-semibold text-v-ink700";

const UpdateReceipt = ({ uid }: { uid: string }) => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [existFileList, setExistFileList] = useState<any[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<any>([]);
  const [deleteItemsUID, setDeleteItemsUID] = useState<any[]>([]);
  const [invoiceData, setInvoiceData] = useState<any>({
    discount_kind: "PERCENTAGE",
    discount_amount: 0,
    shipping_fee: 0,
    total_tax: 0,
    total: 0,
    tax_kind: "EXCLUSIVE",
    deposit: 0,
    due_total: 0,
    sub_total: 0,
    payment_method: {},
    receivable_charter_account: "",
    reference_no: "",
  });
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(true);
  const [ReceiptDate, setReceiptDate] = useState(todayDate);
  const [isBcOpen, setIsBcOpen] = useState<boolean>();
  const [files, setFiles] = useState<File[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>({
    first_name: "",
  });
  const [emails, setEmails] = useState<any>({
    email: "",
    ccEmail: "",
    bcEmail: "",
  });
  const [data, setData] = useState<any>({
    billing_address: "",
    location: {},
  });
  const { UserData } = useAppSelector((state) => state.userData);
  const [currency, setCurrency] = useState<any>({ exchange_rate: 0 });
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [isUpdatePending, setIsUpdatePending] = useState(false);
  const [invoiceUid, setInvoiceUid] = useState("");
  const [storedAutoTax, setStoredAutoTax] = useState<any>(null);
  const router = useRouter();
  const [isTaxLoading, setIsTaxLoading] = useState(true);

  // Function to automatically calculate tax using API route
  const autoCalculateTaxForCustomer = async (customer: any) => {
    if (
      !customer?.address?.street ||
      !customer?.address?.city ||
      !customer?.address?.province ||
      (!["NY", "MN"].includes(customer?.address?.province))
    ) {
      // Clear any stored auto tax for non-supported states
      setStoredAutoTax(null);
      return; // Silently skip if no valid address or unsupported state
    }

    const state = customer.address.province.toUpperCase();

    try {
      // First, fetch agency tax set for the state
      const agencyTaxSetParams = { state: state };
      const agencyTaxSetResponse = await fetchAgencyTaxSet(agencyTaxSetParams);
      let agencyTaxSet = null;
      
      if (agencyTaxSetResponse && agencyTaxSetResponse.results && agencyTaxSetResponse.results.length > 0) {
        agencyTaxSet = agencyTaxSetResponse.results[0]; // Get full tax set for the state
      }

      // Then calculate tax rates
      const params = new URLSearchParams({
        street: customer.address.street,
        city: customer.address.city,
        state: customer.address.province,
        ...(customer.address.postal_code && {
          zip: customer.address.postal_code,
        }),
      });

      const response = await fetch(`/api/tax-lookup?${params}`);
      if (response.ok) {
        const data = await response.json();
        const taxRate = formatPercent(data.tax.combined);

        // Create tax_group based on state and agency tax set
        let tax_group: any[] = [];
        
        if (state === 'NY' && agencyTaxSet) {
          // Map NY breakdown to agency tax set accounts
          const breakdown = data.tax.breakdown;

          tax_group = agencyTaxSet.tax_group
            .map((taxAccount: any) => {
              const title = taxAccount.sales_tax_account?.title;
              let rate = 0;

              // Map breakdown rates to tax accounts based on title
              if (title === 'New York State') {
                rate = breakdown.state * 100;
              } else if (title === 'MCTD') {
                rate = breakdown.mctd * 100;
              } else if (title === 'Local') {
                rate = breakdown.local * 100;
              }

              return {
                agency: { title: taxAccount.agency.title },
                nickname: taxAccount.nickname,
                rate: rate,
                sales_tax_account: taxAccount.sales_tax_account
              };
            })
            .filter((item: any) => item.rate > 0); // Only include items with rate > 0
        } else if (state === 'MN' && agencyTaxSet) {
          // Map MN breakdown to agency tax set accounts
          const breakdown = data.tax.breakdown;

          tax_group = agencyTaxSet.tax_group
            .map((taxAccount: any) => {
              const title = taxAccount.sales_tax_account?.title;
              let rate = 0;

              // Map breakdown rates to tax accounts
              if (title === 'Minnesota State') {
                rate = (breakdown.state_rate || 0) * 100;
              } else if (title === 'Metro Housing') {
                rate = (breakdown.other_local_rate || 0) * 100;
              } else if (title === 'Metro Transportation') {
                rate = (breakdown.other_area_rate || 0) * 100;
              } else if (title === 'County Other Local') {
                rate = (breakdown.local_rate || 0) * 100;
              } else if (title === 'County Transit') {
                rate = (breakdown.county_rate || 0) * 100;
              } else if (title === 'Local (City)') {
                rate = (breakdown.city_rate || 0) * 100;
              }

              return {
                agency: { title: taxAccount.agency.title },
                nickname: taxAccount.nickname,
                rate: rate,
                sales_tax_account: taxAccount.sales_tax_account
              };
            })
            .filter((item: any) => item.rate > 0); // Only include items with rate > 0
        }

        // Store the auto-calculated tax in state
        const autoTaxData = {
          uid: `auto_${data.tax.code}`,
          label: `Automatic Calculation`,
          title: `Automatic Calculation (${taxRate})`,
          total_rate: data.tax.combined * 100,
          rate: data.tax.combined,
          code: data.tax.code,
          county: data.county || data.location_info?.county,
          state: data.location_info?.state || customer.address.province,
          auto_calculated: true,
          tax_group: tax_group,
          // Store agency tax set for payload creation
          agencyTaxSet: agencyTaxSet,
          // Store original API response for auto_sales_tax payload
          apiResponse: data
        };

        setStoredAutoTax(autoTaxData);

        const locationInfo = data.county || data.location_info?.county 
          ? `${data.county || data.location_info?.county} County` 
          : data.location_info?.city || customer.address.city;

        toast.success(
          `Tax calculated: ${taxRate} for ${locationInfo}, ${customer.address.province}. Will auto-apply when you select products.`,
        );
      }
    } catch (error) {
      console.log("Auto tax calculation failed:", error);
      setStoredAutoTax(null);
      // Silently fail, don't show error to user
    }
  };

  // Create auto_sales_tax payload for automatic tax calculation
  const createAutoSalesTaxPayload = (autoTax: any, items: any[]) => {
    if (!autoTax?.agencyTaxSet || !autoTax?.apiResponse) {
      return null;
    }

    // Calculate total taxable amount
    const totalTaxableAmount = items.reduce((total, item) => {
      if (item.type === "product" && item.is_tax) {
        return total + (Number(item.price) * Number(item.qty));
      }
      return total;
    }, 0);

    const breakdown: any = {};
    let totalRate = 0;
    let totalAmount = 0;

    // Create breakdown based on tax_group with amounts
    autoTax.tax_group.forEach((taxItem: any) => {
      if (taxItem.rate > 0) {
        const rate = taxItem.rate / 100; // Convert percentage to decimal
        const amount = (totalTaxableAmount * rate);
        
        // Use the sales_tax_account title for the breakdown key
        const breakdownKey = taxItem.sales_tax_account?.title || taxItem.nickname;
        
        breakdown[breakdownKey] = {
          rate: taxItem.rate,
          amount: Number(amount.toFixed(2))
        };
        
        totalRate += taxItem.rate;
        totalAmount += amount;
      }
    });

    return {
      auto_calculated: true,
      rate: Number((totalRate / 100).toFixed(6)), // Total rate as decimal
      amount: Number(totalAmount.toFixed(2)),
      details: {
        state: autoTax.state,
        city: autoTax.apiResponse.details?.metroRegion || autoTax.county
      },
      breakdown: breakdown
    };
  };

  useEffect(() => {
    const div = document.getElementById("textInput");
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  useEffect(() => {
    if (!Permissions?.includes("change_salereceipt")) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const handleSubmit = async () => {
    const convertedData = handleConvertData();
    if (!convertedData.length) {
      toast.error("Add Product or Invoice To Create Receipt");
      return;
    }
    if (!invoiceData?.payment_method?.uid) {
      toast.error("Please Select Payment Method");
      return;
    } else if (!invoiceData?.receivable_charter_account?.uid) {
      toast.error("Please Select Deposit To Account");
      return;
    }

    const emailList = {
      customer_email: emails.email,
      cc_emails: emails?.ccEmail?.split(",").join(","),
      bcc_emails: emails?.bcEmail?.split(",").join(","),
    };

    const Data = {
      date: new Date().toLocaleDateString(),
      email: emailList,
      discount_kind: invoiceData.discount_kind,
      discount: invoiceData.discount_amount,
      receivable_charter_account_uid:
        invoiceData.receivable_charter_account?.uid,
      payment_method_uid: invoiceData.payment_method?.uid,
      shipping_fee: invoiceData.shipping_fee,
      total_tax: invoiceData.total_tax,
      total: invoiceData.total,
      description: termsCondition,
      tax_kind: invoiceData.tax_kind,
      full_billing_address: data.billing_address,
      warehouse_uid: data.location?.uid,
      tag_title_list: tags,
      sales_items: JSON.stringify(convertedData),
      existFileList: existFileList.filter((file) => {
        if (file.uid) {
          return file?.uid;
        }
      }),
      files: files,
    };
    const linkedFiles = attachmentList.map((file) => file.uid);

    if (!Data?.full_billing_address) {
      return toast.error("Billing Address is Required");
    }
    if (currency < 0) {
      return toast.error("Currency is Required");
    }
    if (!data?.location) {
      return toast.error("Warehouse Location is Required");
    }

    const formData = new FormData();
    if (linkedFiles.length)
      formData.append(
        "file_uids",
        JSON.stringify([...linkedFiles, ...Data?.existFileList]),
      );
    formData.append("email", JSON.stringify(Data.email));
    formData.append("discount_kind", Data.discount_kind);
    formData.append("discount", Data.discount);
    formData.append("shipping_fee", Data.shipping_fee);
    formData.append("total_tax", Data.total_tax);
    formData.append(
      "receivable_charter_account_uid",
      Data.receivable_charter_account_uid,
    );
    formData.append("payment_method_uid", Data.payment_method_uid);
    formData.append("total", Data.total);
    formData.append("description", Data.description);
    formData.append("tax_kind", Data.tax_kind);
    
    // Handle auto tax vs manual tax selection
    if (invoiceData?.sales_tax?.auto_calculated && storedAutoTax) {
      // Create auto_sales_tax payload for automatic tax calculation
      const autoSalesTax = createAutoSalesTaxPayload(storedAutoTax, invoiceItems);
      if (autoSalesTax) {
        formData.append("auto_sales_tax", JSON.stringify(autoSalesTax));
      }
    } else {
      // Use regular tax_uid for manual tax selection
      formData.append("tax_uid", invoiceData?.sales_tax?.uid || "");
    }
    
    formData.append("full_billing_address", Data.full_billing_address);
    formData.append("tag_title_list", JSON.stringify(Data.tag_title_list));
    formData.append("sales_items", Data.sales_items);
    formData.append("warehouse_uid", Data.warehouse_uid);
    formData.append("currency_rate", currency);
    formData.append("kind", "SALE");
    formData.append("reference_number", invoiceData?.reference_no || "");
    formData.append("deposit", Data.total);
    // formData.append("currency_kind", selectedCustomer?.currency);
    if (files.length) {
      files.map((file) => {
        formData.append("files", file);
      });
    }
    try {
      setIsUpdatePending(true);
      const salePromise = patchSale(uid, formData);
      const deletePromises = deleteItemsUID?.map((itemUid) =>
        deleteSingleSaleItem(uid, itemUid),
      );

      // Wait for all API calls to complete
      const results = await Promise.allSettled([
        salePromise,
        ...deletePromises,
      ]);

      // Check if all requests were successful
      const allSuccess = results.every(
        (res) => res.status === "fulfilled" && Boolean(res.value),
      );

      if (allSuccess) {
        toast.success("Sale Receipt updated.");
        router.push("/dashboard/sales/all_sales?table=receipt");
      } else {
        toast.warning("Some items failed to update. Please check.");
      }
    } catch (err: any) {
      // error here
    } finally {
      setIsUpdatePending(false);
    }
  };

  const handleConvertData = () => {
    console.log("invoice items", invoiceItems)
    const array: any = [];
    let note = "";
    let section = "";
    invoiceItems.map((data: any) => {
      if (data.type === "product" && data?.product_service?.uid) {
        // Only set tax_uid if the item has tax enabled
        
        let taxUid = "";
        if (data?.is_tax) {
          // For auto-calculated tax, don't send tax_uid but mark is_tax
          const isAutoTax = invoiceData?.sales_tax?.auto_calculated;
          taxUid = isAutoTax ? "" : data?.is_tax ? invoiceData?.sales_tax?.uid || "" : "";
        }
        
        array.push({
          uid: data?.uid,
          product_uid: data.product_service?.uid,
          quantity: data.qty,
          total: (data.price * data.qty).toFixed(2),
          is_tax: data?.is_tax ? true : false,
          tax_uid: taxUid,
          sale_price: data.price,
          note: note ? note : "",
          section: section ? section : "",
          description: data.description,
        });
        note = "";
        section = "";
      } else if (data.type === "note") {
        note = data.description;
      } else if (data.type === "section") {
        section = data.description;
      }
    });
    return array;
  };

  useEffect(() => {
    const loadData = async () => {
      setIsInvoiceLoading(true);
      try {
        const SalesData = await GetData(`we/sales/${uid}`);
        const SalesItems = await GetData(`we/sales/${uid}/items`);
        const TagList = await GetData(`we/sales/${uid}/tags`);
        const FileList = await GetData(`we/sales/${uid}/files`);

        setExistFileList(FileList.results);
        TagList?.results?.map((tag: any) => {
          setTags((prev) => [...prev, tag.title]);
        });
        const email = SalesData?.email;
        setTermsCondition(SalesData?.description);
        setSelectedCustomer(SalesData?.customer);
        
        // Auto-calculate sales tax based on customer address
        if (SalesData?.customer) {
          await autoCalculateTaxForCustomer(SalesData?.customer);
        }
        
        // Check if any items have auto_sales_tax data
        const hasAutoSalesTax = SalesItems?.some((item: any) => item.auto_sales_tax?.auto_calculated);
        let autoTaxData = null;
        
        if (hasAutoSalesTax) {
          // Find the first item with auto_sales_tax to get the tax data
          const autoTaxItem = SalesItems?.find((item: any) => item.auto_sales_tax?.auto_calculated);
          
          if (autoTaxItem?.auto_sales_tax) {
            // Create auto tax object from the response data
            autoTaxData = {
              uid: `auto_${autoTaxItem.auto_sales_tax.details?.state || 'calculated'}`,
              label: `Automatic Calculation`,
              title: `Automatic Calculation (${(autoTaxItem.auto_sales_tax.rate * 100).toFixed(3)}%)`,
              total_rate: autoTaxItem.auto_sales_tax.rate * 100,
              rate: autoTaxItem.auto_sales_tax.rate,
              auto_calculated: true,
              state: autoTaxItem.auto_sales_tax.details?.state,
              city: autoTaxItem.auto_sales_tax.details?.city,
              // Create tax_group from breakdown data
              tax_group: Object.entries(autoTaxItem.auto_sales_tax.breakdown).map(([title, data]: [string, any]) => ({
                agency: { title: title },
                nickname: title,
                rate: data.rate,
                sales_tax_account: { title: title }
              }))
            };
            
            setStoredAutoTax(autoTaxData);
          }
        }
        
        setEmails({
          email: email?.customer_email || "",
          ccEmail: email?.cc_emails,
          bcEmail: email?.bcc_emails,
        });
        setData({
          ...data,
          billing_address: SalesData?.billing_address?.full_address || "",
          shipping_to: SalesData?.shipping_address?.full_address || "",
          ship_via: SalesData?.shipping_address?.shipping_by,
          location: {
            title: SalesData?.warehouse?.title,
            uid: SalesData?.warehouse?.uid,
          },
        });

        // Find manual sales tax from items if no auto tax
        const salesTax = SalesItems?.filter((i: any) => {
          if (i?.tax?.uid) {
            return i;
          }
        });
        
        setInvoiceData({
          ...invoiceData,
          discount_kind: SalesData.discount_kind,
          discount_amount: SalesData.discount,
          shipping_fee: SalesData?.shipping_fee,
          total_tax: SalesData.total_tax,
          total: SalesData.total,
          sub_total: SalesData?.total - SalesData?.total_tax,
          tax_kind: SalesData.tax_kind,
          deposit: SalesData?.deposit,
          due_total: SalesData?.due_total,
          payment_method: SalesData?.payment_method,
          receivable_charter_account: SalesData?.receivable_charter_account,
          reference_no: SalesData?.reference_number || "",
          sales_tax: autoTaxData || salesTax?.[0]?.tax, // Use auto tax if available, otherwise manual tax
        });
        const array = convertBackendToFrontendData(
          SalesItems,
          SalesData,
        );

        setInvoiceItems(array);
        console.log("invoice array", SalesItems?.results)
        console.log("invoice array", invoiceItems)
        setIsInvoiceLoading(false);
      } catch (err) {
        toast.error("An Error Occurred While Getting The Data");
      }
    };
    loadData();
  }, []);

  if (isInvoiceLoading) {
    return <MainLoader color="#9ca3af" />;
  }

  return (
    <div className="relative font-jakarta text-v-ink900">
      {isUpdatePending && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          <div className="mt-2">
            <TextAnimation
              messages={["Updating Receipt", "Updating Sales", "Uploading Attachments"]}
              start={isUpdatePending}
            />
          </div>
        </div>
      )}

      {/* header */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sales", href: "/dashboard/sales/all_sales" },
          { label: "Sales Receipt" },
        ]}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink500 backdrop-blur-md transition-colors hover:text-v-primary"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          Sales receipt
        </h1>
        <Chip tone="success">Paid in full</Chip>
      </div>

      {/* two-column body */}
      <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* LEFT — work column */}
        <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
          {/* Sold-to */}
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-4 flex items-center gap-2.5">
              <IconChip tone="violet">
                <User />
              </IconChip>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-v-ink900">Sold to</div>
                <div className="text-[11.5px] text-v-ink400">Customer &amp; receipt details.</div>
              </div>
              <span className="flex-1" />
              {selectedCustomer?.uid && (
                <span className="flex items-center gap-2 rounded-full bg-v-wash px-2.5 py-1.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-v-primary text-[10px] font-bold text-white">
                    {(selectedCustomer?.first_name?.[0] || "?").toUpperCase()}
                  </span>
                  <span className="text-[12px] font-semibold text-v-ink900">
                    {`${selectedCustomer?.first_name || ""} ${selectedCustomer?.last_name || ""}`.trim()}
                  </span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 [&>div]:min-w-0">
              <div>
                <label className={V_LABEL}>Customer</label>
                <input
                  value={`${selectedCustomer?.first_name || ""} ${selectedCustomer?.middle_name || ""} ${selectedCustomer?.last_name || ""}`
                    .replace(/\s+/g, " ")
                    .trim()}
                  readOnly
                  className={cn(V_FIELD, "bg-v-wash2")}
                  type="text"
                />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <label className={V_LABEL}>Email</label>
                  <button
                    type="button"
                    onClick={() => setIsBcOpen(!isBcOpen)}
                    className="mb-1.5 text-[11.5px] font-semibold text-v-primary hover:underline"
                  >
                    Cc / Bcc
                  </button>
                </div>
                <input
                  placeholder="name@company.com"
                  className={V_FIELD}
                  type="email"
                  value={emails.email}
                  onChange={(e) => setEmails({ ...emails, email: e.target.value })}
                />
                {isBcOpen && (
                  <div className="absolute right-0 top-[72px] z-20 w-full max-w-[420px] rounded-v-card border border-v-border bg-white p-4 shadow-v-modal">
                    <div className="mb-3">
                      <label className={V_LABEL}>Cc</label>
                      <input
                        value={emails.ccEmail}
                        onChange={(e) => setEmails({ ...emails, ccEmail: e.target.value })}
                        placeholder="Separate emails with a comma"
                        className={V_FIELD}
                        type="text"
                      />
                    </div>
                    <div>
                      <label className={V_LABEL}>Bcc</label>
                      <input
                        value={emails.bcEmail}
                        onChange={(e) => setEmails({ ...emails, bcEmail: e.target.value })}
                        placeholder="Separate emails with a comma"
                        className={V_FIELD}
                        type="text"
                      />
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <VioletButton variant="outline" size="sm" onClick={() => setIsBcOpen(false)}>
                        Cancel
                      </VioletButton>
                      <VioletButton variant="primary" size="sm" onClick={() => setIsBcOpen(false)}>
                        Save
                      </VioletButton>
                    </div>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className={V_LABEL}>Billing address</label>
                <input
                  value={data.billing_address}
                  onChange={(e) => setData({ ...data, billing_address: e.target.value })}
                  placeholder="Type Billing Address"
                  className={V_FIELD}
                  type="text"
                />
              </div>
              <div>
                <label className={V_LABEL}>Sales receipt date</label>
                <DatePicker
                  onChange={setReceiptDate}
                  value={ReceiptDate}
                  ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                  placeholder="DD-MM-YYYY"
                />
              </div>
              <div>
                <label className={V_LABEL}>Sales representative</label>
                <input
                  value={UserData?.name}
                  readOnly
                  className={cn(V_FIELD, "bg-v-wash2")}
                  type="text"
                />
              </div>
              {!uid && (
                <div className="md:col-span-2">
                  <CurrencySelect
                    customerCurrency={selectedCustomer?.currency}
                    setRate={setCurrency}
                    rate={currency}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment (green-accented) */}
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-4 flex items-center gap-2.5">
              <IconChip tone="success">
                <CreditCard />
              </IconChip>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-v-ink900">Payment</div>
                <div className="text-[11.5px] text-v-ink400">How the customer paid.</div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0">
              <div>
                <label className={V_LABEL}>
                  Payment method <span className="text-v-primary">*</span>
                </label>
                <PayMethodSelectDropdown
                  filters={{ status: "ACTIVE" }}
                  ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                  setValue={(e: any) =>
                    setInvoiceData({ ...invoiceData, payment_method: e })
                  }
                  value={invoiceData.payment_method}
                />
              </div>
              <div>
                <label className={V_LABEL}>
                  Deposit to <span className="text-v-primary">*</span>
                </label>
                <AccountSelectDropDown
                  filters={{ status: "ACTIVE", kind: "ASSETS" }}
                  ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                  setValue={(e: any) =>
                    setInvoiceData({ ...invoiceData, receivable_charter_account: e })
                  }
                  value={invoiceData.receivable_charter_account}
                />
              </div>
              <div>
                <label className={V_LABEL}>Reference number</label>
                <input
                  value={invoiceData.reference_no}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, reference_no: e.target.value })
                  }
                  className={V_FIELD}
                  type="text"
                />
              </div>
              <div>
                <label className={V_LABEL}>Location</label>
                <LocationSelectDropDown
                  ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                  setValue={(e: any) => setData({ ...data, location: e })}
                  value={data.location}
                />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-4 flex items-center gap-2.5">
              <IconChip tone="violet">
                <ListPlus />
              </IconChip>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-v-ink900">Line items</div>
                <div className="text-[11.5px] text-v-ink400">Totals update live as you edit.</div>
              </div>
            </div>
            <div className="min-w-0">
              <InvoiceTable
                deleteItems={deleteItemsUID}
                setDeleteItems={setDeleteItemsUID}
                invoiceItems={invoiceItems}
                setIsTaxLoading={setIsTaxLoading}
                setInvoiceItems={setInvoiceItems}
                setInvoiceData={setInvoiceData}
                invoiceData={invoiceData}
                storedAutoTax={storedAutoTax}
                setIsCalculation={setIsCalculationOpen}
                showSummary={false}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <label className={V_LABEL}>Tags</label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          {/* Message + Attachments */}
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>div]:min-w-0">
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                Terms &amp; conditions
              </div>
              <div className="relative">
                <TextEditor setTermsCondition={setTermsCondition} initialContent={termsCondition} />
              </div>
            </div>
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                <Paperclip className="h-3.5 w-3.5" /> Attachments
              </div>
              <FileUpload
                onLinkedFilesChange={setAttachmentList}
                fileList={existFileList}
                setFileList={setExistFileList}
                preview={Boolean(uid)}
                onFilesChange={handleFilesChange}
              />
            </div>
          </div>
        </div>

        {/* RIGHT — summary rail */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-0">
          {/* total-collected hero + PAID stamp */}
          <div
            className="relative overflow-hidden rounded-v-card p-[22px] text-white shadow-v-hero"
            style={{ backgroundImage: V.gradients.heroViolet }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[60px] -top-[60px] h-[200px] w-[200px] animate-v-float rounded-full"
              style={{ background: V.orb.violet }}
            />
            <div className="absolute right-4 top-4 rounded-lg border-2 border-dashed border-[rgba(94,222,178,0.65)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#5EDEB2]">
              Paid
            </div>
            <div className="relative">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-white/55">
                Total collected
              </div>
              <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                {money(Number(invoiceData?.total) || 0)}
              </div>
              <div className="mt-1 text-[11.5px] text-white/60">
                {invoiceData?.payment_method?.title
                  ? `via ${invoiceData.payment_method.title} · `
                  : ""}
                {moment(ReceiptDate).format("DD MMMM, YYYY")}
              </div>
              {selectedCustomer?.uid && (
                <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                  <User className="h-3.5 w-3.5" />
                  Sold to {`${selectedCustomer?.first_name || ""} ${selectedCustomer?.last_name || ""}`.trim()}
                </div>
              )}
            </div>
          </div>

          {/* totals + actions */}
          <div className="rounded-v-card bg-white p-5 shadow-v-card">
            <InvoiceSummary
              invoiceData={invoiceData}
              setInvoiceData={setInvoiceData}
              invoiceItems={invoiceItems}
              storedAutoTax={storedAutoTax}
              setIsCalculation={setIsCalculationOpen}
              isDepositShow={false}
            />

            <div className="mt-4 flex flex-col gap-2 border-t border-[rgba(22,23,42,0.07)] pt-4">
              <VioletButton
                variant="primary"
                className="w-full"
                onClick={handleSubmit}
                disabled={isUpdatePending}
                leftIcon={isUpdatePending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
              >
                {isUpdatePending ? "Updating…" : "Update receipt"}
              </VioletButton>
              <VioletButton variant="outline" className="w-full" onClick={() => router.back()}>
                Cancel
              </VioletButton>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCalculationOpen}
        onClose={() => setIsCalculationOpen(false)}
        title="Tax Calculations"
        widthClass="w-full lg:w-[620px]"
      >
        <TaxCalculation
          invoiceData={{
            ...invoiceData,
            sales_tax: invoiceData?.sales_tax || storedAutoTax,
          }}
          invoiceItems={invoiceItems}
        />
      </Modal>

      <ProductModalSkeleton title="Add Products And Services">
        <CreateProductAndService />
      </ProductModalSkeleton>
    </div>
  );
};

export default UpdateReceipt;

