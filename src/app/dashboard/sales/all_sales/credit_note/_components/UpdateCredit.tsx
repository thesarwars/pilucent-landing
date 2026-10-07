/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import TagInput from "../../_components/TagInput";
import FileUpload from "../../_components/FileUpload";
import dynamic from "next/dynamic";
import CurrencySelect from "../../_components/CurrencySelect";
import DatePicker from "@/components/ui/DatePicker";
import LocationSelectDropDown from "../../../../../../components/ui/ScrollSelectDropDowns/LocationSelectDropDown";
import { useMutation } from "@tanstack/react-query";
import {
  GetData,
  PatchMultipart,
  PostMultipart,
} from "@/services/FetchMethods";
import TextAnimation from "../../_components/CustomTypewritter";
import EmailPopup from "../../_components/EmailPopup";
import moment from "moment";
import { useRouter } from "next/navigation";
import InvoiceTable from "../../_components/InvoiceTable";
import InvoiceSummary from "../../_components/InvoiceSummary";
import ProductModalSkeleton from "@/components/ProductManager/ProductModalSkeleton";
import CreateProductAndService from "@/components/ProductManager/CreateProductService";
import {
  deleteCreditNoteItem,
  deleteSingleSupplierCreditItem,
  patchSingleSupplierCreditItem,
  patchSupplierCredit,
  postSingleSupplierCreditItem,
  fetchAgencyTaxSet,
} from "@/app/helpers/backend";
import { convertSaleCreditToFrontendData } from "@/utils/ConvertSalesData";
import { useAppSelector } from "@/app/redux/store";
import MainLoader from "@/components/MainLoader/MainLoader";
import { toast } from "@/lib/ToastService";
import { formatPercent } from "@/utils/TaxLookUp";
import Modal from "@/app/(admin)/_components/Modal";
import TaxCalculation from "../../invoice/_components/TaxCalculation";
import { cn } from "@/lib/utils";
import { Breadcrumb, Chip, IconChip, VioletButton, money, V } from "@/components/violet";
import { ArrowLeft, User, ListPlus, Paperclip, Loader2, Info } from "lucide-react";

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

const UpdateCredit = ({ uid }: { uid: string }) => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [fileList, setFileList] = useState<any>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(true);
  const [isTaxLoading, setIsTaxLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<any>({
    discount_kind: "PERCENTAGE",
    discount_amount: 0,
    shipping_fee: 0,
    total_tax: 0,
    total: 0,
    tax_kind: "EXCLUSIVE",
    sub_total: 0,
  });
  const { SalesSettingsData } = useAppSelector(
    (state) => state.SalesSettingsData,
  );
  const [currency, setCurrency] = useState<any>({ exchange_rate: 0 });
  const [receiptDate, setReceiptDate] = useState<any>(todayDate);
  const [selectedCustomer, setSelectedCustomer] = useState<any>({
    first_name: "",
  });
  const [data, setData] = useState<any>({
    billing_address: "",
    note_no: "",
    location: { label: "", uid: "" },
  });
  const [isPending, setIsPending] = useState(false);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [emails, setEmails] = useState<any>({
    email: "",
    ccEmail: "",
    bcEmail: "",
  });
  const router = useRouter();
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };
  const [deleteItemsUID, setDeleteItemsUID] = useState<any>([]);
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [storedAutoTax, setStoredAutoTax] = useState<any>(null);
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);

  // Function to automatically calculate tax using API route
  const autoCalculateTaxForCustomer = async (customer: any) => {
    if (!customer?.address?.street || !customer?.address?.city || customer?.address?.province !== 'NY') {
      // Clear any stored auto tax for non-NY addresses
      setStoredAutoTax(null);
      return; // Silently skip if no valid NY address
    }

    try {
      const params = new URLSearchParams({
        street: customer.address.street,
        city: customer.address.city,
        state: customer.address.province,
        ...(customer.address.postal_code && { zip: customer.address.postal_code })
      });
      
      const response = await fetch(`/api/tax-lookup?${params}`);
      if (response.ok) {
        const data = await response.json();
        const taxRate = formatPercent(data.tax.combined);
        
        // Store the auto-calculated tax in state
        const autoTaxData = {
          uid: `auto_${data.tax.code}`,
          label: `Automatic Calculation`,
          title: `Automatic Calculation (${taxRate})`,
          total_rate: data.tax.combined * 100,
          rate: data.tax.combined,
          code: data.tax.code,
          county: data.county,
          auto_calculated: true,
          // Add breakdown for tax calculation modal
          tax_group: [
            {
              agency: { title: "New York State" },
              nickname: "NY State",
              rate: data.tax.breakdown.state * 100
            },
            ...(data.tax.breakdown.mctd > 0 ? [{
              agency: { title: "Metropolitan Commuter Transportation District" },
              nickname: "MCTD",
              rate: data.tax.breakdown.mctd * 100
            }] : []),
            {
              agency: { title: `${data.county} County Local Tax` },
              nickname: "Local",
              rate: data.tax.breakdown.local * 100
            }
          ]
        };
        
        setStoredAutoTax(autoTaxData);
      }
    } catch (error) {
      console.log('Auto tax calculation failed:', error);
      setStoredAutoTax(null);
      // Silently fail, don't show error to user
    }
  };

  // Helper to parse address string back to components
  const parseAddressString = (addressString: string) => {
    if (!addressString) return null;
    
    let street = "", city = "", province = "", postal_code = "";
    
    // First try comma-separated format
    if (addressString.includes(",")) {
      const parts = addressString.split(",").map(p => p.trim()).filter(p => p);
      
      if (parts.length >= 3) {
        street = parts[0];
        city = parts[1];
        
        // Handle "State ZIP" format in the last part
        const lastPart = parts[parts.length - 1];
        const stateZipMatch = lastPart.match(/^([A-Z]{2})\s+(\d{5}(?:-\d{4})?)$/);
        
        if (stateZipMatch) {
          province = stateZipMatch[1];
          postal_code = stateZipMatch[2];
        } else {
          // Try to extract state from the second-to-last part if available
          if (parts.length >= 4) {
            province = parts[2];
            postal_code = parts[3];
          } else {
            province = lastPart;
          }
        }
      }
    } else {
      // Handle space-separated format like "7802 Olson Memorial Hwy  Minnesota MN  55427"
      const trimmed = addressString.trim();
      
      // Look for ZIP code pattern at the end
      const zipMatch = trimmed.match(/(\d{5}(?:-\d{4})?)$/);
      if (zipMatch) {
        postal_code = zipMatch[1];
        const beforeZip = trimmed.substring(0, trimmed.lastIndexOf(postal_code)).trim();
        
        // Look for 2-letter state code before ZIP
        const stateMatch = beforeZip.match(/\b([A-Z]{2})\s*$/);
        if (stateMatch) {
          province = stateMatch[1];
          const beforeState = beforeZip.substring(0, beforeZip.lastIndexOf(province)).trim();
          
          // Split the remaining into street and city
          // Look for common city patterns or use last word(s) as city
          const words = beforeState.split(/\s+/);
          if (words.length >= 4) {
            // Assume last 1-2 words are city, rest is street
            const cityWords = words.slice(-2);
            const streetWords = words.slice(0, -2);
            
            // Check if last word looks like a city (capitalize check)
            if (cityWords[cityWords.length - 1].charAt(0) === cityWords[cityWords.length - 1].charAt(0).toUpperCase()) {
              city = cityWords.join(" ");
              street = streetWords.join(" ");
            } else {
              // Fallback: last word as city
              city = words[words.length - 1];
              street = words.slice(0, -1).join(" ");
            }
          } else {
            street = beforeState;
          }
        } else {
          street = beforeZip;
        }
      } else {
        // No ZIP found, treat as street only
        street = trimmed;
      }
    }
    
    return {
      street: street.trim(),
      city: city.trim(),
      province: province.trim(),
      postal_code: postal_code.trim()
    };
  };

  // Function to calculate tax for a given address
  const autoCalculateTaxForAddress = async (address: any) => {
    console.log("Calculating tax for address:", address);
    
    if (
      !address?.street ||
      !address?.city ||
      (address?.province !== "NY" &&
        address?.province !== "MN")
    ) {
      // Clear any stored auto tax for non-NY/MN addresses
      setStoredAutoTax(null);
      console.log("Address validation failed or unsupported state");
      return; // Silently skip if no valid address
    }

    const state = address.province.toUpperCase();
    console.log("Calculating tax for state:", state);

    try {
      // First, fetch agency tax set for the state
      const agencyTaxSetParams = { state: state };
      const agencyTaxSetResponse = await fetchAgencyTaxSet(agencyTaxSetParams);
      let agencyTaxSet = null;
      
      if (agencyTaxSetResponse && agencyTaxSetResponse.results && agencyTaxSetResponse.results.length > 0) {
        agencyTaxSet = agencyTaxSetResponse.results[0]; // Get first tax set for the state
      }

      // Then calculate tax rates
      const params = new URLSearchParams({
        street: address.street,
        city: address.city,
        state: address.province,
        ...(address.postal_code && {
          zip: address.postal_code,
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
                rate = (breakdown.county_other_local_rate || 0) * 100;
              } else if (title === 'County Transit') {
                rate = (breakdown.county_transit_rate || 0) * 100;
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

        // Store the auto-calculated tax in state (don't set immediately)
        const autoTaxData = {
          uid: `auto_${data.tax.code}`,
          label: `Automatic Calculation`,
          title: `Automatic Calculation (${taxRate})`,
          total_rate: data.tax.combined * 100,
          rate: data.tax.combined,
          code: data.tax.code,
          county: data.county,
          state: state,
          auto_calculated: true,
          tax_group: tax_group,
          // Store agency tax set for payload creation
          agencyTaxSet: agencyTaxSet,
          // Store original API response for auto_sales_tax payload
          apiResponse: data
        };

        setStoredAutoTax(autoTaxData);

        const stateNames = {
          'NY': 'New York',
          'MN': 'Minnesota'
        };

        toast.success(
          `${stateNames[state as keyof typeof stateNames]} tax calculated: ${taxRate} for ${data.county} County. Will auto-apply when you select products.`,
        );
      }
    } catch (error) {
      console.log("Auto tax calculation failed:", error);
      setStoredAutoTax(null);
      // Silently fail, don't show error to user
    }
  };

  useEffect(() => {
    if (!Permissions?.includes("change_creditnote")) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  // const {
  //   mutate: PatchCredit,
  //   isPending,
  //   error,
  //   isError,
  // } = useMutation({
  //   mutationFn: async (data: any) => {
  //     const res = await PatchMultipart(`we/credit-notes/${uid}`, data);
  //     return res;
  //   },
  //   onSuccess: (res) => {
  //     toast.success("Credit Note Updated Successfully", {
  //       autoClose: 4000,
  //     });
  //     router.push("/dashboard/sales/all_sales");
  //   },
  //   onError: (res: any) => {
  //     toast.error("An Unexpected Error Occurred!", { autoClose: 4000 });
  //   },
  // });

  const handleConvertData = () => {
    const array: any = [];
    let note = "";
    let section = "";
    invoiceItems.map((data: any) => {
      if (data.type === "product") {
        console.log("Converting product item:", data);
        // For auto-calculated tax, don't send tax_uid but mark is_tax
        const isAutoTax = invoiceData?.sales_tax?.auto_calculated && data?.is_tax;
        
        // Determine tax_uid: for auto tax use empty string, for manual tax use the global tax or product-specific tax
        // let taxUid = "";
        // if (!isAutoTax && data?.is_tax) {
        //   // If not auto tax and item is taxable, use the global sales tax or product-specific tax
        //   taxUid = invoiceData?.sales_tax?.uid || data.productTaxInfo?.uid || "";
        // }

        let taxUid = "";
        if (data?.is_tax) {
          // For auto-calculated tax, don't send tax_uid but mark is_tax
          const isAutoTax = invoiceData?.sales_tax?.auto_calculated;
          taxUid = isAutoTax ? "" : data?.is_tax ? invoiceData?.sales_tax?.uid || "" : "";
        }
        
        array.push({
          uid: data?.uid || "",
          product_uid: data?.product_uid || data?.product?.uid,
          quantity: data.qty,
          item_credit: data?.price,
          total: (data.price * data.qty).toFixed(2),
          is_tax: data?.is_tax ? true : false,
          tax_uid: taxUid,
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

  // Create auto_sales_tax payload for automatic tax calculation
  const createAutoSalesTaxPayload = (autoTax: any, items: any[]) => {
    if (!autoTax?.tax_group) {
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
        city: autoTax.city
      },
      breakdown: breakdown
    };
  };

  const handleSend = async () => {
    const convertedData = handleConvertData();
    if (!convertedData.length) {
      toast.error("Add Product To Add Credit");
      return;
    }
    const emailList = {
      customer_email: emails.email,
      cc_emails: emails?.ccEmail?.split(",").join(","),
      bcc_emails: emails?.bcEmail?.split(",").join(","),
    };

    const Data = {
      date: receiptDate,
      email: emailList,
      credit_note_number: data.note_no,
      total: invoiceData.total,
      description: termsCondition,
      tax_kind: invoiceData.tax_kind,
      full_address: data.billing_address,
      tag_title_list: JSON.stringify(tags),
      credit_note_items: JSON.stringify(convertedData),
      files: files,
      total_tax: invoiceData.total_tax,
      existingFiles: fileList?.map((file: any) => file?.uid),
      warehouse_uid: data.location.uid,
    };

    if (!Data?.warehouse_uid) {
      toast.error("Select Warehouse");
      return;
    }
    if (!Data?.credit_note_number)
      return toast.error("Credit Note Number is Required");
    // if (!currency)
    //   return toast.error("Currency is Required", { autoClose: 4000 });

    const linkedFiles = attachmentList.map((file) => file.uid);

    const formData = new FormData();
    if (linkedFiles.length)
      formData.append(
        "file_uids",
        JSON.stringify([...linkedFiles, ...Data.existingFiles]),
      );
    formData.append("date", Data.date);
    formData.append("email", JSON.stringify(Data.email));
    formData.append("status", "OPEN");
    formData.append("credit_note_number", Data.credit_note_number);
    formData.append("total", Data.total);
    formData.append("total_tax", Data.total_tax);
    formData.append("description", Data.description);
    formData.append("tax_kind", Data.tax_kind);
    formData.append("full_address", Data.full_address);
    formData.append("tag_title_list", Data.tag_title_list);
    formData.append("credit_note_items", Data.credit_note_items);
    formData.append("warehouse_uid", Data.warehouse_uid);
    formData.append("currency_rate", currency);
    formData.append("currency_kind", selectedCustomer?.currency);
    
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
    
    if (files.length) {
      files.map((file) => {
        formData.append("files", file);
      });
    }

    try {
      setIsPending(true);
      // Step 1: Patch Bill
      const billPromise = patchSupplierCredit(uid, formData);

      // Step 2: Handle purchase items
      const purchasePromises = convertedData.map((arr: any) =>
        arr?.uid
          ? patchSingleSupplierCreditItem(uid, arr?.uid, JSON.stringify(arr))
          : postSingleSupplierCreditItem(uid, JSON.stringify(arr)),
      );
      // Step 4: Handle deleted items
      const deletePromises = deleteItemsUID?.map((itemUid: any) =>
        deleteSingleSupplierCreditItem(uid, itemUid),
      );

      // Wait for all API calls to complete
      const results = await Promise.allSettled([
        billPromise,
        ...purchasePromises,
        ...deletePromises,
      ]);

      // Check if all requests were successful
      const allSuccess = results.every(
        (res) => res.status === "fulfilled" && Boolean(res.value),
      );

      if (allSuccess) {
        console.log(allSuccess);
        toast.success("Credit updated.");
        router.push("/dashboard/sales/all_sales?sale_type=credit note");
      } else {
        toast.warning("Some Items Failed to Update. Please Check.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating the bill.");
    } finally {
      setIsPending(false); // Ensure loading state stops
    }
  };

  useEffect(() => {
    const div = document.getElementById("textInput");
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  useEffect(() => {
    const loadData = async () => {
      setIsInvoiceLoading(true);
      try {
        const SalesData = await GetData(`we/credit-notes/${uid}`);
        const SalesItems = await GetData(`we/credit-notes/${uid}/items`);
        const TagList = await GetData(`we/credit-notes/${uid}/tags`);
        const FileList = await GetData(`we/credit-notes/${uid}/files`);

        setFileList(FileList?.results || []);
        TagList?.results?.map((tag: any) => {
          setTags((prev) => [...prev, tag?.title]);
        });
        const email = SalesData?.email;
        setTermsCondition(SalesData?.description || "");
        setSelectedCustomer(SalesData?.customer);
        
        // Auto-calculate sales tax based on customer address
        if (SalesData?.customer) {
          await autoCalculateTaxForCustomer(SalesData?.customer);
        }
        
        // Check if any items have auto_sales_tax data
        const itemsArray = SalesItems?.results || SalesItems || [];
        console.log("Loaded items for credit note:", itemsArray);
        const hasAutoSalesTax = itemsArray?.some((item: any) => item.auto_sales_tax?.auto_calculated);
        let autoTaxData = null;
        
        if (hasAutoSalesTax) {
          // Find the first item with auto_sales_tax to get the tax data
          const autoTaxItem = itemsArray?.find((item: any) => item.auto_sales_tax?.auto_calculated);
          
          if (autoTaxItem?.auto_sales_tax) {
            // Create auto tax object from the response data
            autoTaxData = {
              uid: `auto_${autoTaxItem.auto_sales_tax.details?.state || 'calculated'}`,
              label: `Automatic Calculation`,
              title: `Automatic Calculation (${(autoTaxItem.auto_sales_tax.rate).toFixed(3)}%)`,
              total_rate: autoTaxItem.auto_sales_tax.rate,
              rate: autoTaxItem.auto_sales_tax.rate / 100,
              auto_calculated: true,
              state: autoTaxItem.auto_sales_tax.details?.state,
              city: autoTaxItem.auto_sales_tax.details?.city,
              // Convert breakdown to tax_group format
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
          billing_address: SalesData?.address?.full_address || "",
          location: {
            title: SalesData?.warehouse?.title,
            uid: SalesData?.warehouse?.uid,
          },
          note_no: SalesData?.credit_note_number,
        });
        const salesTax = itemsArray?.filter((i: any) => {
          if (i?.tax?.uid) {
            return i;
          }
        });
        
        setInvoiceData({
          ...invoiceData,
          total: SalesData.total,
          tax_kind: SalesData.tax_kind,
          total_tax: SalesData?.total_tax,
          sub_total: SalesData?.total - SalesData?.total_tax,
          sales_tax: autoTaxData || salesTax?.[0]?.tax, // Use auto tax if available, otherwise manual tax
        });
        const array = convertSaleCreditToFrontendData(
          itemsArray,
          SalesData,
        );

        setInvoiceItems(array);
      } catch (err) {
        console.log(err);
        toast.error("An Error Occurred While Getting The Data");
      } finally {
        setIsInvoiceLoading(false);
      }
    };
    loadData();
  }, []);

  if (isInvoiceLoading) {
    return <MainLoader color="#9ca3af" />;
  }

  // derived for the amber credit summary rail (display only — does not change any payload)
  const creditTotal = Number(invoiceData?.total) || 0;
  const customerName = `${selectedCustomer?.first_name || ""} ${selectedCustomer?.last_name || ""}`.trim();
  const applyNote = `This credit reduces ${customerName || "the customer"}’s available balance.`;

  return (
    <div className="relative font-jakarta text-v-ink900">
      {isPending && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          <div className="mt-2">
            <TextAnimation
              messages={["Updating Credit", "Saving Changes", "Uploading Attachments"]}
              start={isPending}
            />
          </div>
        </div>
      )}

      {/* header */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sales", href: "/dashboard/sales/all_sales" },
          { label: "Credit Note" },
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
          Credit note {data?.note_no ? `· ${data.note_no}` : ""}
        </h1>
        <Chip tone="warn">Reduces customer balance</Chip>
      </div>

      {/* two-column body */}
      <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* LEFT — work column */}
        <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
          {/* Credit-to + details */}
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-4 flex items-center gap-2.5">
              <IconChip tone="violet">
                <User />
              </IconChip>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-v-ink900">Credit to</div>
                <div className="text-[11.5px] text-v-ink400">
                  Whose balance this credit reduces.
                </div>
              </div>
              <span className="flex-1" />
              {selectedCustomer?.uid && (
                <span className="flex items-center gap-2 rounded-full bg-v-wash px-2.5 py-1.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-v-primary text-[10px] font-bold text-white">
                    {(selectedCustomer?.first_name?.[0] || "?").toUpperCase()}
                  </span>
                  <span className="text-[12px] font-semibold text-v-ink900">{customerName}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 [&>div]:min-w-0">
              <div>
                <label className={V_LABEL}>Customer</label>
                <input
                  value={`${selectedCustomer?.first_name || ""} ${selectedCustomer?.middle_name || ""} ${selectedCustomer?.last_name || ""}`.replace(/\s+/g, " ").trim()}
                  readOnly
                  className={cn(V_FIELD, "bg-v-wash2")}
                  type="text"
                />
              </div>
              <div>
                <label className={V_LABEL}>Email</label>
                <input
                  value={emails.email || ""}
                  onChange={(e) => setEmails({ ...emails, email: e.target.value })}
                  placeholder="name@company.com"
                  className={V_FIELD}
                  type="email"
                />
              </div>
              <div className="md:col-span-2">
                <EmailPopup emails={emails} setEmails={setEmails} />
              </div>
              <div className="md:col-span-2">
                <label className={V_LABEL}>Billing address</label>
                <input
                  value={data.billing_address || ""}
                  onChange={(e) => setData({ ...data, billing_address: e.target.value })}
                  onBlur={(e) => {
                    const addr = parseAddressString(e.target.value);
                    if (addr) {
                      autoCalculateTaxForAddress(addr);
                    }
                  }}
                  placeholder="Street, city, state ZIP"
                  className={V_FIELD}
                  type="text"
                />
              </div>
              <div className="md:col-span-2">
                <CurrencySelect
                  customerCurrency={selectedCustomer?.currency}
                  setRate={setCurrency}
                  rate={currency}
                />
              </div>
            </div>

            <div className="my-4 border-t border-[rgba(22,23,42,0.07)]" />
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
              Credit details
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0">
              <div>
                <label className={V_LABEL}>Credit note date</label>
                <DatePicker
                  calenderClassName="max-md:left-1 max-md:right-1"
                  onChange={setReceiptDate}
                  value={receiptDate}
                  ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                  placeholder="DD-MM-YYYY"
                />
              </div>
              <div>
                <label className={V_LABEL}>Credit note no.</label>
                <input
                  className={V_FIELD}
                  type="text"
                  value={data.note_no}
                  onChange={(e) => setData({ ...data, note_no: e.target.value })}
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
                <div className="text-[11.5px] text-v-ink400">
                  What&rsquo;s being credited — totals update live.
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <InvoiceTable
                isDepositShow={false}
                showSummary={false}
                setIsCalculation={setIsCalculationOpen}
                setIsTaxLoading={setIsTaxLoading}
                setInvoiceItems={setInvoiceItems}
                setInvoiceData={setInvoiceData}
                invoiceData={invoiceData}
                invoiceItems={invoiceItems}
                storedAutoTax={storedAutoTax}
              />
            </div>
          </div>

          {/* Tags */}
          {SalesSettingsData?.is_tag && (
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <label className={V_LABEL}>Tags</label>
              <TagInput tags={tags} onChange={setTags} />
            </div>
          )}

          {/* Message + Attachments */}
          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>div]:min-w-0">
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                Message / reason note
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
                fileList={fileList}
                setFileList={setFileList}
                onLinkedFilesChange={setAttachmentList}
                onFilesChange={handleFilesChange}
              />
            </div>
          </div>
        </div>

        {/* RIGHT — summary rail */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-0">
          {/* total-credit hero */}
          <div
            className="relative overflow-hidden rounded-v-card p-[22px] text-white shadow-v-hero"
            style={{ backgroundImage: V.gradients.heroViolet }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-[60px] -top-[60px] h-[200px] w-[200px] rounded-full"
              style={{ background: V.orb.violet }}
            />
            <div className="relative">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-white/55">
                Total credit
              </div>
              <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em] text-[#FBBF6B]">
                {money(-creditTotal)}
              </div>
              <div className="mt-1 text-[11.5px] text-white/60">
                {moment(receiptDate).format("DD MMMM, YYYY")}
                {selectedCustomer?.currency ? ` · ${selectedCustomer.currency}` : ""}
              </div>
              {selectedCustomer?.uid && (
                <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                  <User className="h-3.5 w-3.5" />
                  Credit to {customerName}
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
              showTotals={false}
            />
            <div className="my-2.5 border-t border-[rgba(22,23,42,0.07)]" />
            <div className="flex items-center justify-between py-1">
              <span className="text-[13px] font-bold text-v-ink900">Total credit</span>
              <span className="text-[15px] font-extrabold tabular-nums text-[#B97608]">
                {money(-creditTotal)}
              </span>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-[11px] bg-v-warn-bg px-3 py-2.5 text-[12px] text-[#7A5200]">
              <Info className="mt-px h-4 w-4 shrink-0" />
              <span>{applyNote}</span>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <VioletButton
                variant="primary"
                className="w-full"
                onClick={handleSend}
                disabled={isPending}
                leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
              >
                {isPending ? "Updating…" : "Update credit note"}
              </VioletButton>
              <VioletButton variant="outline" className="w-full" onClick={() => router.back()}>
                Cancel
              </VioletButton>
            </div>
          </div>
        </div>
      </div>

      <ProductModalSkeleton title="Add Products And Services">
        <CreateProductAndService />
      </ProductModalSkeleton>

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
    </div>
  );
};

export default UpdateCredit;
