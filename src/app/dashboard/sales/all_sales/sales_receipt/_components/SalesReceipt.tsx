'use client';
import Button from '@/components/ui/RawButton';
import Input from '@/components/ui/RawInput';
import Label from '@/components/ui/RawLabel';
import { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { Temporal } from '@js-temporal/polyfill';
import TagInput from '../../_components/TagInput';
import FileUpload from '../../_components/FileUpload';
import SalesReceiptTable from './SalesReceiptTable';
import dynamic from 'next/dynamic';
import CustomerSelectDropDown from '../../../../../../components/ui/ScrollSelectDropDowns/CustomerSelectDropDown';
import DatePicker from '@/components/ui/DatePicker';
import { useAppSelector } from '@/app/redux/store';
import LocationSelectDropDown from '../../../../../../components/ui/ScrollSelectDropDowns/LocationSelectDropDown';
import GetToken from '@/hooks/getToken';
import { PostMultipart } from '@/services/FetchMethods';
import SalesReceiptPreview from './SalesReceiptPreview';
import CurrencySelect from '../../_components/CurrencySelect';
import TextAnimation from '../../_components/CustomTypewritter';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { MdKeyboardArrowDown } from 'react-icons/md';
import ProductModalSkeleton from '@/components/ProductManager/ProductModalSkeleton';
import CreateProductAndService from '@/components/ProductManager/CreateProductService';
import PayMethodSelectDropdown from '../../../../../../components/ui/ScrollSelectDropDowns/PayMethodSelectDropdown';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import { toast } from '@/lib/ToastService';
import InvoiceTable from '../../_components/InvoiceTable';
import InvoiceSummary from '../../_components/InvoiceSummary';
import { formatPercent } from '@/utils/TaxLookUp';
import Modal from '@/app/(admin)/_components/Modal';
import { fetchAgencyTaxSet } from '@/app/helpers/backend';
import { cn } from '@/lib/utils';
import { Chip, IconChip, VioletButton, money, V } from '@/components/violet';
import { ArrowLeft, User, CreditCard, ListPlus, Paperclip, Loader2, CheckCircle2 } from 'lucide-react';

const TaxCalculation = dynamic(() => import('../../invoice/_components/TaxCalculation'), {
  ssr: false,
});

const TextEditor = dynamic(() => import('@/app/dashboard/sales/all_sales/_components/TextEditor'), {
  ssr: false,
});

/* violet field + label styles reused across the form */
const V_FIELD =
  'w-full min-w-0 rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13.5px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const V_LABEL = 'mb-1.5 block text-xs font-semibold text-v-ink700';

function TotalRow({
  label,
  value,
  strong,
  rose,
}: {
  label: string;
  value: string;
  strong?: boolean;
  rose?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={cn('text-[13px]', strong ? 'font-bold text-v-ink900' : 'text-v-ink500')}>{label}</span>
      <span
        className={cn(
          'tabular-nums',
          rose
            ? 'text-[13px] font-semibold text-[#D2483E]'
            : strong
              ? 'text-[14px] font-extrabold text-v-ink900'
              : 'text-[13px] font-semibold text-v-ink900'
        )}
      >
        {value}
      </span>
    </div>
  );
}

const SalesReceipt = () => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [invoiceId, setInvoiceId] = useState<any>(null);
  const [SalesReceiptData, setSalesReceiptData] = useState<any>({
    payment_method: {},
    deposit_to: '',
    reference_no: '',
    deposit_amount: 0,
    due_amount: 0,
  });
  const [invoiceItems, setInvoiceItems] = useState<any>([
    {
      type: 'product',
      product_service: '',
      description: '',
      qty: 1,
      price: 0,
      amount: 0,
      is_tax: false,
    },
  ]);
  const [invoiceData, setInvoiceData] = useState<any>({
    discount_kind: 'PERCENTAGE',
    discount_amount: 0,
    shipping_fee: 0,
    total_tax: 0,
    total: 0,
    tax_kind: 'EXCLUSIVE',
    deposit: 0,
    due_total: 0,
    sub_total: 0,
  });
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  const token = GetToken();
  const [ReceiptDate, setReceiptDate] = useState(todayDate);
  const [isBcOpen, setIsBcOpen] = useState<boolean>();
  const [files, setFiles] = useState<File[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>({
    first_name: '',
  });
  const [storedAutoTax, setStoredAutoTax] = useState<any>(null);
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);
  const [emails, setEmails] = useState<any>({
    email: '',
    ccEmail: '',
    bcEmail: '',
  });
  const [data, setData] = useState<any>({
    billing_address: '',
    location: {},
  });
  const { UserData } = useAppSelector((state) => state.userData);
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [currency, setCurrency] = useState<any>({ exchange_rate: 0 });
  const [isInvoiceCreating, setIsInvoiceCreating] = useState(false);
  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [isSend, setIsSend] = useState(false);
  const router = useRouter();
  const { SalesSettingsData } = useAppSelector((state) => state.SalesSettingsData);

  // Function to automatically calculate tax using API route
  const autoCalculateTaxForCustomer = async (customer: any) => {
    if (
      !customer?.address?.street ||
      !customer?.address?.city ||
      !customer?.address?.province ||
      !['NY', 'MN'].includes(customer?.address?.province)
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

      if (
        agencyTaxSetResponse &&
        agencyTaxSetResponse.results &&
        agencyTaxSetResponse.results.length > 0
      ) {
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
                sales_tax_account: taxAccount.sales_tax_account,
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
                sales_tax_account: taxAccount.sales_tax_account,
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
          apiResponse: data,
        };

        setStoredAutoTax(autoTaxData);

        const locationInfo =
          data.county || data.location_info?.county
            ? `${data.county || data.location_info?.county} County`
            : data.location_info?.city || customer.address.city;

        toast.success(
          `Tax calculated: ${taxRate} for ${locationInfo}, ${customer.address.province}. Will auto-apply when you select products.`
        );
      }
    } catch (error) {
      console.log('Auto tax calculation failed:', error);
      setStoredAutoTax(null);
      // Silently fail, don't show error to user
    }
  };

  // Helper to build full address string from address object
  const formatFullAddress = (addr: any) => {
    if (!addr) return '';
    const parts = [] as string[];
    if (addr.street) parts.push(addr.street);
    if (addr.city) parts.push(addr.city);
    if (addr.province) parts.push(addr.province);
    if (addr.postal_code) parts.push(addr.postal_code);
    return parts.filter(Boolean).join(', ');
  };

  // Helper to parse address string back to components
  const parseAddressString = (addressString: string) => {
    if (!addressString) return null;

    let street = '',
      city = '',
      province = '',
      postal_code = '';

    // First try comma-separated format
    if (addressString.includes(',')) {
      const parts = addressString
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p);

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
            if (
              cityWords[cityWords.length - 1].charAt(0) ===
              cityWords[cityWords.length - 1].charAt(0).toUpperCase()
            ) {
              city = cityWords.join(' ');
              street = streetWords.join(' ');
            } else {
              // Fallback: last word as city
              city = words[words.length - 1];
              street = words.slice(0, -1).join(' ');
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
      postal_code: postal_code.trim(),
    };
  };

  // Function to calculate tax for a given address
  const autoCalculateTaxForAddress = async (address: any) => {
    console.log('Calculating tax for address:', address);

    if (
      !address?.street ||
      !address?.city ||
      (address?.province !== 'NY' && address?.province !== 'MN')
    ) {
      // Clear any stored auto tax for non-NY/MN addresses
      setStoredAutoTax(null);
      console.log('Address validation failed or unsupported state');
      return; // Silently skip if no valid address
    }

    const state = address.province.toUpperCase();
    console.log('Calculating tax for state:', state);

    try {
      // First, fetch agency tax set for the state
      const agencyTaxSetParams = { state: state };
      const agencyTaxSetResponse = await fetchAgencyTaxSet(agencyTaxSetParams);
      let agencyTaxSet = null;

      if (
        agencyTaxSetResponse &&
        agencyTaxSetResponse.results &&
        agencyTaxSetResponse.results.length > 0
      ) {
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
                sales_tax_account: taxAccount.sales_tax_account,
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
                sales_tax_account: taxAccount.sales_tax_account,
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
          apiResponse: data,
        };

        setStoredAutoTax(autoTaxData);

        const stateNames = {
          NY: 'New York',
          MN: 'Minnesota',
        };

        toast.success(
          `${stateNames[state as keyof typeof stateNames]} tax calculated: ${taxRate} for ${data.county} County. Will auto-apply when you select products.`
        );
      }
    } catch (error) {
      console.log('Auto tax calculation failed:', error);
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
      if (item.type === 'product' && item.is_tax) {
        return total + Number(item.price) * Number(item.qty);
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
        const amount = totalTaxableAmount * rate;

        // Use the sales_tax_account title for the breakdown key
        const breakdownKey = taxItem.sales_tax_account?.title || taxItem.nickname;

        breakdown[breakdownKey] = {
          rate: taxItem.rate,
          amount: Number(amount.toFixed(2)),
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
        city: autoTax.apiResponse.details?.metroRegion || autoTax.county,
      },
      breakdown: breakdown,
    };
  };

  const OnCustomerSelect = async (customer: any) => {
    setEmails({ ...emails, email: customer?.email || '' });
    setData({
      ...data,
      billing_address: formatFullAddress(customer?.address),
      shipping_to: '',
      ship_via: '',
      tracking_no: '',
      terms: { label: '', uid: '' },
      location: { label: '', uid: '' },
    });

    // Clear previous auto-calculated tax when customer changes
    setStoredAutoTax(null);
    setInvoiceData({
      discount_kind: 'PERCENTAGE',
      discount_amount: 0,
      shipping_fee: 0,
      total_tax: 0,
      total: 0,
      tax_kind: 'EXCLUSIVE',
      deposit: 0,
      due_total: 0,
      sales_tax: null, // Clear previous tax selection
    });
    setTags([]);
    setTermsCondition('');
    // setInvoiceItems([]);
    setInvoiceId(null);
    // setFileList([]);
    //  console.log(customer);

    // Auto-calculate sales tax based on customer address
    await autoCalculateTaxForCustomer(customer);

    // handleOpenModalSM();
  };

  useEffect(() => {
    const div = document.getElementById('textInput');
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  useEffect(() => {
    if (!Permissions?.includes('add_salereceipt')) {
      router.push('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const handleSubmit = async () => {
    setSalesReceiptData({
      ...SalesReceiptData,
      deposit_amount: 0,
      due_amount: 0,
    });

    const convertedData = handleConvertData();
    if (!convertedData.length) {
      toast.error('Add Product or Invoice To Create Receipt');
      return;
    }
    if (!SalesReceiptData?.payment_method?.uid) {
      toast.error('Please Select Payment Method');
      return;
    } else if (!SalesReceiptData?.deposit_to?.uid) {
      toast.error('Please Select Deposit To Account');
      return;
    }

    const emailList = {
      customer_email: emails.email,
      cc_emails: emails?.ccEmail?.split(',').join(','),
      bcc_emails: emails?.bcEmail?.split(',').join(','),
    };

    const Data = {
      date: new Date().toLocaleDateString(),
      email: emailList,
      status: 'ACTIVE',
      discount_kind: invoiceData.discount_kind,
      discount: invoiceData.discount_amount,
      shipping_fee: invoiceData.shipping_fee,
      total_tax: invoiceData.total_tax,
      total: invoiceData.total,
      description: termsCondition,
      tax_kind: invoiceData.tax_kind,
      is_invoice: false,
      customer_uid: selectedCustomer.uid,
      full_billing_address: data.billing_address,
      warehouse_uid: data.location?.uid,
      tag_title_list: tags,
      sales_items: JSON.stringify(convertedData),
      payment_method_uid: SalesReceiptData.payment_method.uid,
      receivable_charter_account_uid: SalesReceiptData.deposit_to.uid,
      files: files,
    };
    const linkedFiles = attachmentList.map((file) => file.uid);
    setInvoiceData({ ...invoiceData, total: Data.total });

    // if (!Data?.full_billing_address) {
    //   return toast.error("Billing Address is Required");
    // }
    if (currency < 0) {
      return toast.error('Currency is Required');
    }
    if (!data?.location) {
      return toast.error('Warehouse Location is Required');
    }
    setInvoiceData({ ...invoiceData, total: invoiceData.total });

    try {
      setIsInvoiceCreating(true);
      const formData = new FormData();

      if (linkedFiles.length) formData.append('file_uids', JSON.stringify(linkedFiles));
      formData.append('email', JSON.stringify(Data.email));
      formData.append('status', 'OPEN');
      formData.append('discount_kind', Data.discount_kind);
      formData.append('discount', Data.discount);
      formData.append('kind', 'SALE');
      formData.append('shipping_fee', Data.shipping_fee);
      formData.append('total_tax', Data.total_tax);
      formData.append('total', Data.total);
      formData.append('description', Data.description);
      formData.append('receivable_charter_account_uid', Data.receivable_charter_account_uid);

      // Handle auto tax vs manual tax selection
      if (invoiceData?.sales_tax?.auto_calculated && storedAutoTax) {
        // Create auto_sales_tax payload for automatic tax calculation
        const autoSalesTax = createAutoSalesTaxPayload(storedAutoTax, invoiceItems);
        if (autoSalesTax) {
          formData.append('auto_sales_tax', JSON.stringify(autoSalesTax));
        }
      } else {
        // Use regular tax_uid for manual tax selection
        formData.append('tax_uid', invoiceData?.sales_tax?.uid || '');
      }

      formData.append('payment_method_uid', Data.payment_method_uid);
      formData.append('tax_kind', Data.tax_kind);
      formData.append('is_sale_receipt', 'true');
      formData.append('reference_number', SalesReceiptData?.reference_no || '');
      formData.append('deposit', Data.total);
      formData.append('customer_uid', Data.customer_uid);
      formData.append('full_billing_address', Data.full_billing_address);
      formData.append('tag_title_list', JSON.stringify(Data.tag_title_list));
      formData.append('sales_items', Data.sales_items);
      formData.append('warehouse_uid', Data.warehouse_uid);
      formData.append('currency_rate', currency);
      formData.append('currency_kind', selectedCustomer?.currency);
      if (files.length) {
        files.map((file) => {
          formData.append('files', file);
        });
      }

      const res: any = await PostMultipart('we/sales', formData, token);
      if (res?.uid) {
        toast.success('Sales Receipt created.');
        router.push('/dashboard/sales/all_sales?sale_type=sale receipt');
      } else {
        toast.error('An Error Occurred');
      }
    } catch (err: any) {
      try {
        let errors: any;
        if (err?.message) errors = JSON.parse(err?.message);
        Object.keys(errors)?.forEach((key) => {
          const errorMessages = errors[key];
          errorMessages?.forEach((message: string) => {
            toast.error(`${key.split('_').join(' ').toUpperCase()} :- ${message}`);
          });
        });
      } catch (err) {
        toast.error('Something Went Wrong');
      }
    } finally {
      setIsInvoiceCreating(false);
    }
  };

  const handleConvertData = () => {
    const array: any = [];
    let note = '';
    let section = '';
    invoiceItems.map((data: any) => {
      if (data.type === 'product' && data?.product_service?.uid) {
        // Only set tax_uid if the item has tax enabled
        let taxUid = '';
        if (data?.is_tax) {
          // For auto-calculated tax, don't send tax_uid but mark is_tax
          const isAutoTax = invoiceData?.sales_tax?.auto_calculated;
          taxUid = isAutoTax ? '' : invoiceData?.sales_tax?.uid || '';
        }

        const itemData: any = {
          product_uid: data.product_service?.uid,
          quantity: data.qty,
          total: (data.price * data.qty).toFixed(2),
          is_tax: data?.is_tax ? true : false,
          tax_uid: taxUid,
          sale_price: data.price,
          note: note ? note : '',
          section: section ? section : '',
          description: data.description,
        };

        array.push(itemData);

        note = '';
        section = '';
      } else if (data.type === 'note') {
        note = data.description;
      } else if (data.type === 'section') {
        section = data.description;
      }
    });

    return array;
  };

  const handlePreview = () => {
    if (!selectedCustomer?.uid) {
      return toast.error('Please Select A Customer First');
    }
    const convertedData = handleConvertData();
    if (!convertedData?.length) {
      return toast.error('Please Add Some Product to See Preview');
    }
    setPreview(true);
  };

  return (
    <div className="relative font-jakarta text-v-ink900">
      {(isInvoiceLoading || isInvoiceCreating) && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          {isInvoiceCreating && (
            <div className="mt-2">
              <TextAnimation
                messages={['Creating Receipt', 'Sending Receipt', 'Uploading Attachments']}
                start={isInvoiceCreating}
              />
            </div>
          )}
        </div>
      )}

      <div className={`${Preview ? 'hidden' : ''}`}>
        {/* header */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink500 backdrop-blur-md transition-colors hover:text-v-primary"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
          <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
            New sales receipt
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-v-success-bg px-2.5 py-1 text-[11px] font-bold text-v-success-fg">
            <CheckCircle2 className="h-3.5 w-3.5" /> Paid in full
          </span>
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
                  <div className="text-[11.5px] text-v-ink400">
                    Who bought from you — contact details auto-fill.
                  </div>
                </div>
                <span className="flex-1" />
                {selectedCustomer?.uid && (
                  <span className="flex animate-v-pop items-center gap-2 rounded-full bg-v-wash px-2.5 py-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-v-primary text-[10px] font-bold text-white">
                      {(selectedCustomer?.first_name?.[0] || '?').toUpperCase()}
                    </span>
                    <span className="text-[12px] font-semibold text-v-ink900">
                      {`${selectedCustomer?.first_name || ''} ${selectedCustomer?.last_name || ''}`.trim()}
                    </span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 [&>div]:min-w-0">
                <div>
                  <label className={V_LABEL}>
                    Customer <span className="text-v-primary">*</span>
                  </label>
                  <CustomerSelectDropDown
                    ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                    setValue={setSelectedCustomer}
                    value={selectedCustomer}
                    OnCustomerSelect={OnCustomerSelect}
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
                    className={cn(V_FIELD, 'bg-v-wash2')}
                    type="text"
                  />
                </div>
                {!invoiceId && (
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
                    filters={{ status: 'ACTIVE' }}
                    ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                    setValue={(e: any) =>
                      setSalesReceiptData({ ...SalesReceiptData, payment_method: e })
                    }
                    value={SalesReceiptData.payment_method}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>
                    Deposit to <span className="text-v-primary">*</span>
                  </label>
                  <AccountSelectDropDown
                    filters={{ account_type__title: 'Bank' }}
                    ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                    setValue={(e: any) =>
                      setSalesReceiptData({ ...SalesReceiptData, deposit_to: e })
                    }
                    value={SalesReceiptData.deposit_to}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Reference number</label>
                  <input
                    value={SalesReceiptData.reference_no}
                    onChange={(e) =>
                      setSalesReceiptData({ ...SalesReceiptData, reference_no: e.target.value })
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
              <InvoiceTable
                isDepositShow={false}
                showSummary={false}
                invoiceItems={invoiceItems}
                setInvoiceItems={setInvoiceItems}
                setInvoiceData={setInvoiceData}
                invoiceData={invoiceData}
                storedAutoTax={storedAutoTax}
                setIsCalculation={setIsCalculationOpen}
              />
            </div>

            {/* Tags */}
            {SalesSettingsData?.is_tag && (
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <label className={V_LABEL}>Tags</label>
                <TagInput preview={Boolean(invoiceId)} tags={tags} onChange={setTags} />
              </div>
            )}

            {/* Message + Attachments */}
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>div]:min-w-0">
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  Message / note
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
                  fileList={fileList}
                  preview={Boolean(invoiceId)}
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
                  {SalesReceiptData?.payment_method?.title
                    ? `via ${SalesReceiptData.payment_method.title} · `
                    : ''}
                  {moment(ReceiptDate).format('DD MMMM, YYYY')}
                </div>
                {selectedCustomer?.uid && (
                  <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                    <User className="h-3.5 w-3.5" />
                    Sold to {`${selectedCustomer?.first_name || ''} ${selectedCustomer?.last_name || ''}`.trim()}
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
                  disabled={isInvoiceCreating}
                  leftIcon={
                    isInvoiceCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined
                  }
                >
                  {isInvoiceCreating ? 'Saving…' : 'Save & send'}
                </VioletButton>
                <VioletButton variant="outline" className="w-full" onClick={handlePreview}>
                  Preview receipt
                </VioletButton>
                <VioletButton
                  variant="ghost"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isInvoiceCreating}
                >
                  Save as draft
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

      <div className={`${Preview ? '' : 'hidden'}`}>
        <SalesReceiptPreview
          InvoiceData={{
            invoiceData,
            invoiceItems,
            tags,
            files,
            fileList,
            attachmentList,
            ReceiptData: { ...SalesReceiptData, date: ReceiptDate },
          }}
          handleSubmit={handleSubmit}
          isLoading={isInvoiceCreating}
          setPreview={setPreview}
        />
      </div>
    </div>
  );
};

export default SalesReceipt;
