'use client';
import Button from '@/components/ui/RawButton';
import Input from '@/components/ui/RawInput';
import Label from '@/components/ui/RawLabel';
import { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { Temporal } from '@js-temporal/polyfill';
import dynamic from 'next/dynamic';
import TagInput from '../../_components/TagInput';
import FileUpload from '../../_components/FileUpload';
import ModalSM, { CloseModal, handleOpenModalSM } from '@/components/ModalSM/ModalSM';
import CustomerSelectDropDown from '../../../../../../components/ui/ScrollSelectDropDowns/CustomerSelectDropDown';
import DatePicker from '@/components/ui/DatePicker';
import TextAnimation from '../../_components/CustomTypewritter';
import { useRouter } from 'next/navigation';
import { MdKeyboardArrowDown } from 'react-icons/md';
import RefundPreview from './RefundPreview';
import moment from 'moment';
import RefundTable from './RefundTable';
import CurrencySelect from '../../_components/CurrencySelect';
import ProductModalSkeleton from '@/components/ProductManager/ProductModalSkeleton';
import CreateProductAndService from '@/components/ProductManager/CreateProductService';
import { useAppSelector } from '@/app/redux/store';
import PayMethodSelectDropdown from '../../../../../../components/ui/ScrollSelectDropDowns/PayMethodSelectDropdown';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import { convertBackendToFrontendData } from '@/utils/ConvertSalesData';
import { toast } from '@/lib/ToastService';
import { postSale } from '@/app/helpers/backend';
import InvoiceTable from '../../_components/InvoiceTable';
import InvoiceSummary from '../../_components/InvoiceSummary';
import { formatPercent } from '@/utils/TaxLookUp';
import Modal from '@/app/(admin)/_components/Modal';
import { fetchAgencyTaxSet } from '@/app/helpers/backend';
import { cn } from '@/lib/utils';
import { Chip, IconChip, VioletButton, money, V } from '@/components/violet';
import {
  ArrowLeft,
  User,
  RotateCcw,
  ListPlus,
  Paperclip,
  Loader2,
  Landmark,
  AlertTriangle,
} from 'lucide-react';

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

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={cn('text-[13px]', strong ? 'font-bold text-v-ink900' : 'text-v-ink500')}>{label}</span>
      <span
        className={cn(
          'tabular-nums',
          strong ? 'text-[14px] font-extrabold text-v-ink900' : 'text-[13px] font-semibold text-v-ink900'
        )}
      >
        {value}
      </span>
    </div>
  );
}

const RefundReceipt = () => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [isBcOpen, setIsBcOpen] = useState<boolean>();
  const [files, setFiles] = useState<File[]>([]);
  const [ReceiptDate, setReceiptDate] = useState(todayDate);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  const [currency, setCurrency] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ReceiptData, setReceiptData] = useState<any>({
    payment_method: {},
    deposit_to: '',
    receipt_number: '',
    cheque_number: '',
  });
  const [invoiceItems, setInvoiceItems] = useState<any>([]);
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
  const router = useRouter();
  const { Permissions } = useAppSelector((state) => state.Permissions);
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
    shipping_to: '',
    ship_via: '',
    tracking_no: '',
    terms: { label: '', uid: '' },
    location: { label: '', uid: '' },
  });
  const [isSend, setIsSend] = useState(false);
  const { SalesSettingsData } = useAppSelector((state) => state.SalesSettingsData);

  // Sync storedAutoTax with invoiceData.sales_tax when storedAutoTax changes
  useEffect(() => {
    if (storedAutoTax) {
      setInvoiceData((prev: any) => ({
        ...prev,
        sales_tax: storedAutoTax,
      }));
    }
  }, [storedAutoTax]);

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
        agencyTaxSet = agencyTaxSetResponse.results[0].tax_group;
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
          agencyTaxSet: agencyTaxSet,
          apiResponse: data,
          // Add breakdown for tax calculation modal
          tax_group: data.tax.breakdown_detailed || data.tax.tax_group || [],
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

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
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
    setInvoiceItems([]);
    setFiles([]);
    setSelectedCustomer(customer);
    //  console.log(customer);

    // Auto-calculate sales tax based on customer address
    await autoCalculateTaxForCustomer(customer);

    handleOpenModalSM();
  };

  // Default chart-of-account title mappings per state for the backend lookup
  const NY_ACCOUNT_TITLES: Record<string, string> = {
    state: 'New York State',
    mctd: 'MCTD',
    local: 'Local',
  };
  const MN_ACCOUNT_TITLES: Record<string, string> = {
    state_rate: 'Minnesota State',
    other_local_rate: 'Metro Housing',
    other_area_rate: 'Metro Transportation',
    county_other_local_rate: 'County Other Local',
    county_transit_rate: 'County Transit',
    city_rate: 'Local (City)',
  };

  // Create auto_sales_tax payload for automatic tax calculation
  const createAutoSalesTaxPayload = (autoTax: any, items: any[]) => {
    if (!autoTax?.apiResponse) return null;

    const totalTaxableAmount = items.reduce((total, item) => {
      if (item.is_item_tax) {
        return total + Number(item.sale_price) * Number(item.quantity);
      }
      return total;
    }, 0);

    const breakdown: any = {};
    let totalRate = 0;
    let totalAmount = 0;

    if (autoTax.tax_group?.length > 0) {
      autoTax.tax_group.forEach((taxItem: any) => {
        if (taxItem.rate > 0) {
          const decimalRate = taxItem.rate / 100;
          const amount = totalTaxableAmount * decimalRate;
          const key = taxItem.sales_tax_account?.title || taxItem.nickname;
          breakdown[key] = { rate: taxItem.rate, amount: Number(amount.toFixed(2)) };
          totalRate += taxItem.rate;
          totalAmount += amount;
        }
      });
    } else {
      const raw = autoTax.apiResponse?.tax?.breakdown;
      if (raw) {
        const labels = autoTax.state === 'MN' ? MN_ACCOUNT_TITLES : NY_ACCOUNT_TITLES;
        Object.entries(raw).forEach(([key, val]) => {
          const decimalRate = Number(val);
          if (decimalRate > 0) {
            const pctRate = Number((decimalRate * 100).toFixed(4));
            const amount = totalTaxableAmount * decimalRate;
            const title = labels[key] || key;
            breakdown[title] = { rate: pctRate, amount: Number(amount.toFixed(2)) };
            totalRate += pctRate;
            totalAmount += amount;
          }
        });
      }
    }

    return {
      auto_calculated: true,
      rate: Number(totalRate.toFixed(4)),
      amount: Number(totalAmount.toFixed(2)),
      details: {
        state: autoTax.state,
        city: autoTax.apiResponse.details?.metroRegion || autoTax.county,
      },
      breakdown,
    };
  };

  useEffect(() => {
    if (!Permissions?.includes('add_salereceipt')) {
      router.push('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const handleConvertData = () => {
    const array: any = [];
    let note = '';
    let section = '';
    invoiceItems.map((data: any) => {
      if (data.type === 'product' && data?.product_service?.uid) {
        const isAutoTax = invoiceData?.sales_tax?.auto_calculated && data?.is_tax;

        array.push({
          product_uid: data.product_service?.uid,
          quantity: data.qty,
          total: (data.price * data.qty).toFixed(3),
          is_item_tax: data?.is_tax ? true : false,
          tax_uid: isAutoTax ? '' : invoiceData?.sales_tax?.uid || '',
          sale_price: data?.price,
          note: note ? note : '',
          section: section ? section : '',
          description: data.description,
        });

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

  const handleSubmit = async () => {
    const Data = {
      date: ReceiptDate,
      reference_number: ReceiptData.cheque_number,
      payable_charter_account_uid: ReceiptData.deposit_to?.uid,
      payment_method_uid: ReceiptData.payment_method.uid,
      tracking_number: ReceiptData.receipt_number,
      customer_uid: selectedCustomer.uid,
    };

    if (!Data?.payable_charter_account_uid) {
      const loopArr = [
        {
          property: 'payable_charter_account_uid',
          message: 'Refund from account is required',
        },
      ];
      loopArr.map((item, idx) => {
        if (!Data[item?.property as keyof typeof Data]) {
          toast.error(item.message, { duration: 2000 + 1000 * idx });
        }
      });
      return;
    }
    const emailList = {
      customer_email: emails.email,
      cc_emails: emails?.ccEmail?.split(',').join(','),
      bcc_emails: emails?.bcEmail?.split(',').join(','),
    };

    const invoiceItems = handleConvertData();
    if (!invoiceItems?.length) {
      return toast.error('Add Product or Items to Make Refund');
    }
    const formData = new FormData();
    formData.append('email', JSON.stringify(emailList));
    formData.append('status', 'OPEN');
    formData.append('discount_kind', invoiceData.discount_kind);
    formData.append('discount', invoiceData.discount_amount);
    formData.append('shipping_fee', invoiceData.shipping_fee);
    formData.append('total_tax', invoiceData.total_tax);
    formData.append('total', invoiceData.total);
    formData.append('tax_kind', invoiceData.tax_kind);
    formData.append('is_sale_receipt', 'true');
    formData.append('kind', 'REFUND');
    formData.append('description', termsCondition);
    formData.append('customer_uid', selectedCustomer.uid);
    formData.append('payable_charter_account_uid', Data.payable_charter_account_uid);
    formData.append('payment_method_uid', Data.payment_method_uid);
    formData.append('full_billing_address', data.billing_address);
    formData.append('tracking_number', Data.tracking_number);
    formData.append('reference_number', Data.reference_number);
    formData.append('date', Data.date);
    formData.append('sales_items', JSON.stringify(invoiceItems));
    formData.append('deposit', invoiceData.total);
    formData.append('currency_rate', currency);
    formData.append('currency_kind', selectedCustomer?.currency);

    // Handle auto tax vs manual tax selection
    if (invoiceData?.sales_tax?.auto_calculated && storedAutoTax) {
      const autoSalesTax = createAutoSalesTaxPayload(storedAutoTax, invoiceItems);
      if (autoSalesTax) {
        formData.append('auto_sales_tax', JSON.stringify(autoSalesTax));
      }
    } else if (invoiceData?.sales_tax?.uid) {
      formData.append('tax_uid', invoiceData.sales_tax.uid);
    }

    try {
      setIsInvoiceLoading(true);
      const res = await postSale(formData);
      if (res?.success) {
        toast.success('Refund created.');
        router.push('/dashboard/sales/all_sales?sale_type=refund receipt');
      }
    } catch (error: any) {
      setIsLoading(false);
      toast.error('Something went wrong!');
    } finally {
      setIsInvoiceLoading(false);
    }
  };

  useEffect(() => {
    const div = document.getElementById('textInput');
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

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

  // derived for the money-out summary rail (display only — does not change any payload)
  const refundTotal = Number(invoiceData?.total) || 0;
  const refundAccount = ReceiptData?.deposit_to;
  const accountBalance = Number(refundAccount?.opening_balance) || 0;
  const balanceAfter = Math.max(0, accountBalance - refundTotal);

  return (
    <div className="relative mb-4 font-jakarta text-v-ink900">
      {(isInvoiceLoading || isLoading) && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          {isLoading && (
            <div className="mt-2">
              <TextAnimation
                messages={['Creating Receipt', 'Sending Receipt', 'Finishing Up']}
                start={isLoading}
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
            New refund receipt
          </h1>
          <Chip tone="danger">Money out</Chip>
        </div>

        {/* two-column body */}
        <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT — work column */}
          <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
            {/* Refund-to */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet">
                  <User />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">Refund to</div>
                  <div className="text-[11.5px] text-v-ink400">
                    Who you&rsquo;re refunding — contact details auto-fill.
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
                <div className="md:col-span-2">
                  <CurrencySelect
                    customerCurrency={selectedCustomer?.currency}
                    rate={currency}
                    setRate={setCurrency}
                  />
                </div>
              </div>
            </div>

            {/* Refund details (red-accented) */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="danger">
                  <RotateCcw />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">Refund details</div>
                  <div className="text-[11.5px] text-v-ink400">
                    How and from where the money goes back.
                  </div>
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
                    setValue={(e: any) => setReceiptData({ ...ReceiptData, payment_method: e })}
                    value={ReceiptData.payment_method}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>
                    Refund from <span className="text-v-primary">*</span>
                  </label>
                  <AccountSelectDropDown
                    ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                    setValue={(e: any) => setReceiptData({ ...ReceiptData, deposit_to: e })}
                    filters={{ status: 'ACTIVE', account_type__title: 'Bank' }}
                    value={ReceiptData.deposit_to}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Refund date</label>
                  <DatePicker
                    onChange={setReceiptDate}
                    value={ReceiptDate}
                    ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Refund receipt number</label>
                  <input
                    value={ReceiptData.receipt_number}
                    onChange={(e) =>
                      setReceiptData({ ...ReceiptData, receipt_number: e.target.value })
                    }
                    className={V_FIELD}
                    type="text"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Cheque number</label>
                  <input
                    value={ReceiptData.cheque_number}
                    onChange={(e) =>
                      setReceiptData({ ...ReceiptData, cheque_number: e.target.value })
                    }
                    className={V_FIELD}
                    type="text"
                  />
                </div>
              </div>

              {/* balance-after impact */}
              {refundAccount?.uid && (
                <div className="mt-3 flex animate-v-pop items-center gap-2 rounded-v-input bg-v-wash px-3.5 py-2.5">
                  <Landmark className="h-4 w-4 shrink-0 text-v-ink400" />
                  <span className="min-w-0 truncate text-[12.5px] text-v-ink500">
                    {refundAccount?.title || 'Account'} after this refund
                  </span>
                  <span className="flex-1" />
                  <span className="shrink-0 text-[13px] font-bold tabular-nums text-v-ink900">
                    {money(balanceAfter)}
                  </span>
                </div>
              )}
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
                    What&rsquo;s being refunded — totals update live.
                  </div>
                </div>
              </div>
              <InvoiceTable
                isDepositShow={false}
                showSummary={false}
                setInvoiceData={setInvoiceData}
                setInvoiceItems={setInvoiceItems}
                invoiceData={invoiceData}
                invoiceItems={invoiceItems}
                storedAutoTax={storedAutoTax}
                setIsCalculation={setIsCalculationOpen}
              />
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
                  <TextEditor setTermsCondition={setTermsCondition} />
                </div>
              </div>
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  <Paperclip className="h-3.5 w-3.5" /> Attachments
                </div>
                <FileUpload onLinkedFilesChange={() => {}} onFilesChange={handleFilesChange} />
              </div>
            </div>
          </div>

          {/* RIGHT — summary rail */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-0">
            {/* total-refund hero */}
            <div
              className="relative overflow-hidden rounded-v-card p-[22px] text-white shadow-v-hero"
              style={{ backgroundImage: V.gradients.heroViolet }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-[60px] -top-[60px] h-[200px] w-[200px] animate-v-float rounded-full"
                style={{ background: V.orb.violet }}
              />
              <div className="relative">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-white/55">
                  Total refund
                </div>
                <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em] text-[#F9A8C7]">
                  {money(-refundTotal)}
                </div>
                <div className="mt-1 text-[11.5px] text-white/60">
                  {ReceiptData?.payment_method?.title
                    ? `via ${ReceiptData.payment_method.title} · `
                    : ''}
                  {moment(ReceiptDate).format('DD MMMM, YYYY')}
                </div>
                {selectedCustomer?.uid && (
                  <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                    <User className="h-3.5 w-3.5" />
                    Refund to {`${selectedCustomer?.first_name || ''} ${selectedCustomer?.last_name || ''}`.trim()}
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
                <span className="text-[13px] font-bold text-v-ink900">Total refund</span>
                <span className="text-[15px] font-extrabold tabular-nums text-[#D2483E]">
                  {money(-refundTotal)}
                </span>
              </div>

              {refundAccount?.uid && refundTotal > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-[11px] bg-v-danger-bg px-3 py-2.5 text-[12px] text-[#9B2C24]">
                  <AlertTriangle className="mt-px h-4 w-4 shrink-0" />
                  <span>
                    {money(refundTotal)} will leave {refundAccount?.title || 'this account'} when you
                    save this refund.
                  </span>
                </div>
              )}

              <div className="mt-3 flex flex-col gap-2">
                <VioletButton
                  variant="primary"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isInvoiceLoading || isLoading}
                  leftIcon={
                    isInvoiceLoading || isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : undefined
                  }
                >
                  {isInvoiceLoading || isLoading ? 'Saving…' : 'Save & refund'}
                </VioletButton>
                <VioletButton variant="outline" className="w-full" onClick={handlePreview}>
                  Preview
                </VioletButton>
                <VioletButton
                  variant="ghost"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={isInvoiceLoading || isLoading}
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
      </div>

      <div className={`${Preview ? '' : 'hidden'}`}>
        <RefundPreview
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          setPreview={setPreview}
          EstimateData={{
            invoiceData: {
              ...invoiceData,
              selectedCustomer,
              emails,
              ReceiptDate,
              data,
            },
            ReceiptData,
            invoiceItems,
            tags: tags,
            files: files,
          }}
        />
      </div>

      <Modal
        isOpen={isCalculationOpen}
        onClose={() => setIsCalculationOpen(false)}
        title="Tax Calculations"
        widthClass="w-full lg:w-[620px]"
      >
        <TaxCalculation invoiceData={invoiceData} invoiceItems={invoiceItems} />
      </Modal>
    </div>
  );
};

export default RefundReceipt;
