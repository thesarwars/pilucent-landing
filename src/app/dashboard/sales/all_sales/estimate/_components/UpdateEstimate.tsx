/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect, useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import dynamic from "next/dynamic";
import DatePicker from "@/components/ui/DatePicker";
import { useAppSelector } from "@/app/redux/store";
import { useMutation } from "@tanstack/react-query";
import { GetData, PatchMultipart } from "@/services/FetchMethods";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, ListPlus, Paperclip, Loader2 } from "lucide-react";
import TextAnimation from "../../_components/CustomTypewritter";
import EmailPopup from "../../_components/EmailPopup";
import CurrencySelect from "../../_components/CurrencySelect";
import LocationSelectDropDown from "../../../../../../components/ui/ScrollSelectDropDowns/LocationSelectDropDown";
import TagInput from "../../_components/TagInput";
import FileUpload from "../../_components/FileUpload";
import InvoiceTable from "../../_components/InvoiceTable";
import InvoiceSummary from "../../_components/InvoiceSummary";
import ProductModalSkeleton from "@/components/ProductManager/ProductModalSkeleton";
import CreateProductAndService from "@/components/ProductManager/CreateProductService";
import { convertBackendToFrontendData } from "@/utils/ConvertSalesData";
import MainLoader from "@/components/MainLoader/MainLoader";
import { toast } from "@/lib/ToastService";
import moment from "moment";
import Modal from "@/app/(admin)/_components/Modal";
import TaxCalculation from "../../invoice/_components/TaxCalculation";
import { deleteSingleSaleItem, patchSale, fetchAgencyTaxSet } from "@/app/helpers/backend";
import { formatPercent } from "@/utils/TaxLookUp";
import { cn } from "@/lib/utils";
import { Breadcrumb, Chip, IconChip, VioletButton, money, V } from "@/components/violet";

const TextEditor = dynamic(() => import("./../../_components/TextEditor"), {
  ssr: false,
});

/* violet field + label styles reused across the form */
const V_FIELD =
  'w-full min-w-0 rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13.5px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const V_LABEL = 'mb-1.5 block text-xs font-semibold text-v-ink700';

const UpdateEstimate = ({ uid }: { uid: string }) => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [selectedCustomer, setSelectedCustomer] = useState<any>({
    first_name: "",
  });
  const [currency, setCurrency] = useState<any>();
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [invoiceData, setInvoiceData] = useState<any>({
    discount_kind: "PERCENTAGE",
    discount_amount: 0,
    shipping_fee: 0,
    total_tax: 0,
    total: 0,
    tax_kind: "EXCLUSIVE",
    sub_total: 0,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [emails, setEmails] = useState<any>({
    email: "",
    ccEmail: "",
    bcEmail: "",
  });
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);
  const { UserData } = useAppSelector((state) => state.userData);
  const [estimateDate, setEstimateDate] = useState<any>(todayDate);
  const [shipDate, setShipDate] = useState<any>(todayDate);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const { SalesSettingsData } = useAppSelector(
    (state) => state.SalesSettingsData,
  );
  const [data, setData] = useState<any>({
    billing_address: "",
    shipping_to: "",
    ship_via: "",
    tracking_number: "",
    terms: { label: "", uid: "" },
    location: { label: "", uid: "" },
  });
  const [expireDate, setExpireDate] = useState<any>();
  const router = useRouter();
  const [invoiceNum, setInvoiceNum] = useState("");
  const [fileList, setFileList] = useState<any[]>([]);
  const [invoiceId, setInvoiceId] = useState<any>(null);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(true);
  const [estimationStatus, setEstimationStatus] = useState("open");
  const [isTaxLoading, setIsTaxLoading] = useState(true);
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [storedAutoTax, setStoredAutoTax] = useState<any>(null);

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
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  useEffect(() => {
    const div = document.getElementById("textInput");
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  useEffect(() => {
    if (!Permissions?.includes("change_sale")) {
      router.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const handleConvertData = () => {
    const array: any = [];
    let note = "";
    let section = "";
    invoiceItems?.map((data: any) => {
      if (data.type === "product") {
        // For auto-calculated tax, don't send tax_uid but mark is_tax
        const isAutoTax = invoiceData?.sales_tax?.auto_calculated && data?.is_tax;
        
        array.push({
          uid: data?.uid,
          product_uid: data?.product_service?.uid || data?.product_uid || data?.uid, // Extract from product object first
          quantity: data.qty,
          total: (data.price * data.qty).toFixed(2),
          is_tax: data?.is_tax ? true : false,
          tax_uid: isAutoTax ? "" : data?.is_tax ? invoiceData?.sales_tax?.uid || "" : "",
          sale_price: data?.price,
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

  const {
    mutate: PatchInvoice,
    isPending,
    error,
    isError,
  } = useMutation({
    mutationFn: async (data: any) => {
      const res = await PatchMultipart(`we/sales/${invoiceId}`, data);
      return res;
    },
    onSuccess: (res) => {
      toast.success("Estimate updated.");
      router.push("/dashboard/sales/all_sales?sale_type=estimate");
    },
    onError: (res: any) => {
      // toast.error("An Unknown Error Occurred!", { autoClose: 4000 });
    },
  });

  const handleSend = () => {
    const convertedData = handleConvertData();
    if (!convertedData.length) {
      toast.error("Add Product To Update Invoice");

      return;
    }
    const emailList = {
      customer_email: emails.email,
      cc_emails: emails?.ccEmail?.split(",").join(","),
      bcc_emails: emails?.bcEmail?.split(",").join(","),
    };

    const linkedFiles = attachmentList?.map((file) => file.uid);

    const Data = {
      email: emailList,
      tracking_number: data.tracking_number,
      discount_kind: invoiceData.discount_kind,
      discount: invoiceData.discount_amount,
      shipping_fee: invoiceData.shipping_fee,
      status: estimationStatus.toUpperCase(),
      total_tax: invoiceData.total_tax,
      total: invoiceData.total,
      description: termsCondition,
      tax_kind: invoiceData.tax_kind,
      invoice_date: estimateDate,
      expired_date: expireDate,
      customer_uid: selectedCustomer.uid,
      full_billing_address: data.billing_address,
      full_shipping_address: data.shipping_to,
      shipping_by: data.ship_via,
      shipping_date: shipDate,
      tag_title_list: tags,
      sales_items: JSON.stringify(convertedData),
      files: files,
      warehouse_uid: data.location.uid,
      term_uid: data?.terms?.uid,
      existingFiles: fileList?.map((file) => file?.uid),
    };

    // if (currency < 0)
    //   return toast.error("Currency is Required", { autoClose: 4000 });
    if (!Data?.warehouse_uid) {
      const loopArr = [
        { property: "warehouse_uid", message: "Please Select A Warehouse" },
      ];
      loopArr?.map((item, idx) => {
        if (!Data[item?.property as keyof typeof Data]) {
          toast.error(item.message, { duration: 1000 + 1000 * idx });
        }
      });
      return;
    }

    try {
      const formData = new FormData();
      if (linkedFiles.length)
        formData.append(
          "file_uids",
          JSON.stringify([...linkedFiles, ...Data?.existingFiles]),
        );
      // formData.append("date", Data.date);
      formData.append("email", JSON.stringify(Data.email));
      formData.append("status", "OPEN");
      formData.append("tracking_number", Data.tracking_number);
      formData.append("discount_kind", Data.discount_kind);
      formData.append("discount", Data.discount);
      formData.append("shipping_fee", Data.shipping_fee);
      formData.append("total_tax", Data.total_tax);
      formData.append("total", Data.total);
      formData.append("description", Data.description);
      formData.append("tax_kind", Data.tax_kind);
      formData.append("invoice_date", Data.invoice_date);
      formData.append("expired_date", Data.expired_date);
      // formData.append("due_date", Data.due_date);
      // formData.append("customer_uid", Data.customer_uid);
      formData.append("full_billing_address", Data.full_billing_address);
      Data?.full_shipping_address &&
        formData.append("full_shipping_address", Data.full_shipping_address);
      Data?.shipping_by && formData.append("shipping_by", Data.shipping_by);
      Data?.shipping_date &&
        formData.append("shipping_date", Data.shipping_date);
      formData.append("tag_title_list", JSON.stringify(Data.tag_title_list));
      formData.append("sales_items", Data.sales_items);
      formData.append("warehouse_uid", Data.warehouse_uid);
      // formData.append("term_uid", Data.term_uid);
      // formData.append("currency_rate", currency);
      // formData.append("currency_kind", selectedCustomer?.currency);
      
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
        files?.map((file) => {
          formData.append("files", file);
        });
      }
      PatchInvoice(formData);
    } catch (err: any) {
      console.log("Error Occurred While Updating Data", err);
    }
  };

  useEffect(() => {
    try {
      if (isError) {
        let errors: any;
        if (error?.message) errors = JSON.parse(error?.message);
        Object.keys(errors)?.forEach((key) => {
          const errorMessages = errors[key];
          errorMessages?.forEach((message: string) => {
            toast.error(
              `${key.split("_").join(" ").toUpperCase()} :- ${message}`,
            );
          });
        });
      }
    } catch (err) {
      toast.error("Something Went Wrong");
    }
  }, [error, isError]);

  useEffect(() => {
    const loadData = async () => {
      setIsInvoiceLoading(true);
      try {
        const SalesData = await GetData(`we/sales/${uid}`);
        const SalesItems = await GetData(`we/sales/${uid}/items`);
        const TagList = await GetData(`we/sales/${uid}/tags`);
        const FileList = await GetData(`we/sales/${uid}/files`);

        setFileList(FileList.results);
        TagList?.results?.map((tag: any) => {
          setTags((prev) => [...prev, tag.title]);
        });
        const email = SalesData?.email;
        // console.log(email, SalesData.email);
        setTermsCondition(SalesData?.description);
        setInvoiceId(SalesData?.uid);
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
          billing_address: SalesData?.billing_address?.full_address || "",
          shipping_to: SalesData?.shipping_address?.full_address || "",
          ship_via: SalesData?.shipping_address?.shipping_by,
          tracking_number: SalesData?.tracking_number,
          location: {
            title: SalesData?.warehouse?.title,
            uid: SalesData?.warehouse?.uid,
          },
          terms: SalesData?.terms,
        });
        setShipDate(SalesData?.shipping_address?.shipping_date);
        setEstimationStatus(SalesData?.status.toLowerCase());
        setEstimateDate(SalesData?.invoice_date);
        setExpireDate(SalesData?.expired_date);
        setShipDate(SalesData?.ship_date);
        setInvoiceNum(SalesData?.invoice_id);
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
          sales_tax: autoTaxData || salesTax?.[0]?.tax, // Use auto tax if available, otherwise manual tax
        });
        const array = convertBackendToFrontendData(
          SalesItems,
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

  return (
    <div className="relative font-jakarta text-v-ink900">
      {isPending && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          <div className="mt-2">
            <TextAnimation
              messages={["Updating Estimate", "Saving Changes", "Uploading Attachments"]}
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
          { label: "Estimate" },
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
          Estimate {invoiceNum ? `· ${invoiceNum}` : ""}
        </h1>
        <Chip tone="warn">Expires {moment(expireDate).format("DD MMM YYYY")}</Chip>
      </div>

      {/* two-column body */}
      <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* LEFT — work column */}
        <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
          {/* Estimate-for + details */}
          <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
            <div className="mb-4 flex items-center gap-2.5">
              <IconChip tone="violet">
                <User />
              </IconChip>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-v-ink900">Estimate for</div>
                <div className="text-[11.5px] text-v-ink400">Customer &amp; estimate details.</div>
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
                  value={`${selectedCustomer?.first_name || ""} ${selectedCustomer?.middle_name || ""} ${selectedCustomer?.last_name || ""}`.replace(/\s+/g, " ").trim()}
                  readOnly
                  className={cn(V_FIELD, "bg-v-wash2")}
                  type="text"
                />
              </div>
              <div>
                <label className={V_LABEL}>Email</label>
                <input
                  value={emails.email}
                  onChange={(e) => setEmails({ ...emails, email: e.target.value })}
                  placeholder="name@company.com"
                  className={V_FIELD}
                  type="email"
                />
              </div>
              <div className="md:col-span-2">
                <EmailPopup emails={emails} setEmails={setEmails} />
              </div>
              <div>
                <label className={V_LABEL}>Status</label>
                <select
                  value={estimationStatus}
                  onChange={(e) => setEstimationStatus(e.target.value)}
                  className={cn(V_FIELD, "cursor-pointer")}
                >
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <CurrencySelect
                  customerCurrency={selectedCustomer?.currency}
                  setRate={setCurrency}
                  rate={currency}
                />
              </div>
              <div className="md:col-span-2">
                <label className={V_LABEL}>Billing address</label>
                <input
                  value={data.billing_address}
                  onChange={(e) => setData({ ...data, billing_address: e.target.value })}
                  onBlur={(e) => {
                    const addr = parseAddressString(e.target.value);
                    if (addr) autoCalculateTaxForAddress(addr);
                  }}
                  placeholder="Street, city, state ZIP"
                  className={V_FIELD}
                  type="text"
                />
              </div>
            </div>

            <div className="my-4 border-t border-[rgba(22,23,42,0.07)]" />
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
              Estimate details
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0">
              <div>
                <label className={V_LABEL}>Estimation date</label>
                <DatePicker
                  calenderClassName="max-md:left-1 max-md:right-1"
                  onChange={setEstimateDate}
                  value={estimateDate}
                  ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                  placeholder="DD-MM-YYYY"
                />
              </div>
              <div>
                <label className={V_LABEL}>Expire date</label>
                <DatePicker
                  calenderClassName="max-md:left-1 max-md:right-1"
                  onChange={setExpireDate}
                  value={expireDate}
                  ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                  placeholder="DD-MM-YYYY"
                />
              </div>
              <div>
                <label className={V_LABEL}>Sales representative</label>
                <input
                  defaultValue={UserData?.name}
                  className={cn(V_FIELD, "bg-v-wash2")}
                  type="text"
                  readOnly
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
              <div>
                <label className={V_LABEL}>Tracking no</label>
                <input
                  value={data.tracking_number}
                  onChange={(e) => setData({ ...data, tracking_number: e.target.value })}
                  className={V_FIELD}
                  type="text"
                />
              </div>
              {SalesSettingsData?.is_shipping && (
                <>
                  <div>
                    <label className={V_LABEL}>Shipping to</label>
                    <input
                      value={data.shipping_to}
                      onChange={(e) => setData({ ...data, shipping_to: e.target.value })}
                      onBlur={(e) => {
                        const addr = parseAddressString(e.target.value);
                        if (addr) autoCalculateTaxForAddress(addr);
                      }}
                      className={V_FIELD}
                      type="text"
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Ship via</label>
                    <input
                      value={data.ship_via}
                      onChange={(e) => setData({ ...data, ship_via: e.target.value })}
                      className={V_FIELD}
                      type="text"
                    />
                  </div>
                  <div>
                    <label className={V_LABEL}>Ship date</label>
                    <DatePicker
                      calenderClassName="max-md:left-1 max-md:right-1"
                      onChange={setShipDate}
                      value={shipDate}
                      ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                      placeholder="DD-MM-YYYY"
                    />
                  </div>
                </>
              )}
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

          {/* Terms + Attachments */}
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
                fileList={fileList}
                onLinkedFilesChange={setAttachmentList}
                onFilesChange={handleFilesChange}
                setFileList={setFileList}
              />
            </div>
          </div>
        </div>

        {/* RIGHT — summary rail */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-0">
          {/* estimate-total hero */}
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
                Estimate total
              </div>
              <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                {money(Number(invoiceData?.total) || 0)}
              </div>
              <div className="mt-1 text-[11.5px] text-white/60">
                Valid until {moment(expireDate).format("DD MMMM, YYYY")}
                {selectedCustomer?.currency ? ` · ${selectedCustomer.currency}` : ""}
              </div>
              {selectedCustomer?.uid && (
                <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                  <User className="h-3.5 w-3.5" />
                  {`${selectedCustomer?.first_name || ""} ${selectedCustomer?.last_name || ""}`.trim()}
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
                onClick={handleSend}
                disabled={isPending}
                leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
              >
                {isPending ? "Updating…" : "Update estimate"}
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

export default UpdateEstimate;
