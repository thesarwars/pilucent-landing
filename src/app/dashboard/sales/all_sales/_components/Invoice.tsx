'use client';
import Button from '@/components/ui/RawButton';
import Label from '@/components/ui/RawLabel';
import { useEffect, useState } from 'react';
import { IoIosArrowBack, IoIosArrowDown } from 'react-icons/io';
import { Temporal } from '@js-temporal/polyfill';
import TagInput from './TagInput';
import FileUpload from './FileUpload';
import dynamic from 'next/dynamic';
import CustomerSelectDropDown from '../../../../../components/ui/ScrollSelectDropDowns/CustomerSelectDropDown';
import LocationSelectDropDown from '../../../../../components/ui/ScrollSelectDropDowns/LocationSelectDropDown';
import DatePicker from '@/components/ui/DatePicker';
import { useAppSelector } from '@/app/redux/store';
import InvoicePreview from './InvoicePreview';
import CurrencySelect from './CurrencySelect';
import TextAnimation from './CustomTypewritter';
import EmailPopup from './EmailPopup';
import moment from 'moment';
import { useRouter, useSearchParams } from 'next/navigation';
import { MdKeyboardArrowDown } from 'react-icons/md';
import ProductModalSkeleton from '@/components/ProductManager/ProductModalSkeleton';
import CreateProductAndService from '@/components/ProductManager/CreateProductService';
import TermSelectDropDown from '../../../../../components/ui/ScrollSelectDropDowns/TermsSelectDropDown';
import { decryptData } from '@/app/helpers/crypto';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import Modal from '@/app/(admin)/_components/Modal';
import CustomerEstimateList from '../invoice/_components/CustomerEstimateList';
import {
  deleteSale,
  fetchSale,
  fetchSaleItems,
  fetchSaleTags,
  patchSale,
  postSale,
  fetchAgencyTaxSet,
} from '@/app/helpers/backend';
import { convertBackendToFrontendData } from '@/utils/ConvertSalesData';
import { toast } from '@/lib/ToastService';
import InvoiceTable from './InvoiceTable';
import InvoiceSummary from './InvoiceSummary';
import TaxCalculation from '../invoice/_components/TaxCalculation';
import { formatPercent } from '@/utils/TaxLookUp';
import { cn } from '@/lib/utils';
import { Chip, IconChip, VioletButton, money, V } from '@/components/violet';
import { ArrowLeft, User, ListPlus, Paperclip, CheckCircle2, Loader2 } from 'lucide-react';

const TextEditor = dynamic(() => import('./TextEditor'), {
  ssr: false,
});

/* violet field + label styles reused across the form */
const V_FIELD =
  'w-full min-w-0 rounded-v-input border border-v-border bg-white px-3.5 py-2.5 text-[13.5px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:shadow-[0_0_0_3px_#EEE9FF]';
const V_LABEL = 'mb-1.5 block text-xs font-semibold text-v-ink700';

function ReadyCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span
        className={cn(
          'flex h-[18px] w-[18px] items-center justify-center rounded-full transition-colors duration-300',
          ok ? 'bg-v-success-solid text-white' : 'bg-v-wash2 text-v-ink300'
        )}
      >
        <CheckCircle2 className="h-3 w-3" />
      </span>
      <span className={cn('text-[12.5px] transition-colors', ok ? 'font-semibold text-v-ink900' : 'text-v-ink400')}>
        {label}
      </span>
    </div>
  );
}

const Invoice = () => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>({
    first_name: '',
  });
  const [currency, setCurrency] = useState<any>();
  const [invoiceItems, setInvoiceItems] = useState<any[]>([
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
  const [isOpen, setIsOpen] = useState(false);
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>({
    discount_kind: 'PERCENTAGE',
    discount_amount: 0,
    shipping_fee: 0,
    total_tax: 0,
    total: 0,
    tax_kind: 'EXCLUSIVE',
    deposit: 0,
    due_total: 0,
    sub_total: '',
    receivable_charter_account: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [emails, setEmails] = useState<any>({
    email: '',
    ccEmail: '',
    bcEmail: '',
  });
  const { UserData } = useAppSelector((state) => state.userData);
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [invoiceDate, setInvoiceDate] = useState<any>(todayDate);
  const [shipDate, setShipDate] = useState<any>(todayDate);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const [estimateUID, setEstimateUID] = useState('');
  const [isEstimateLoading, setIsEstimateLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [data, setData] = useState<any>({
    billing_address: '',
    shipping_to: '',
    ship_via: '',
    tracking_no: '',
    terms: { label: '', uid: '' },
    location: { label: '', uid: '' },
  });
  const [dueDate, setDueDate] = useState<any>(todayDate);
  const c = useSearchParams().get('c');
  const router = useRouter();
  const [isSend, setIsSend] = useState(false);
  const [storedAutoTax, setStoredAutoTax] = useState<any>(null);
  const { SalesSettingsData } = useAppSelector((state) => state.SalesSettingsData);

  useEffect(() => {
    if (data?.terms?.days) {
      const date = moment(
        new Date(
          new Date(invoiceDate).setDate(new Date(invoiceDate).getDate() + data?.terms?.days || 0)
        )
      ).format('YYYY-MM-DD');
      setDueDate(date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.terms, new Date(invoiceDate)]);

  // Function to automatically calculate tax using API route
  const autoCalculateTaxForCustomer = async (customer: any) => {
    if (
      !customer?.address?.street ||
      !customer?.address?.city ||
      (customer?.address?.province !== 'NY' && customer?.address?.province !== 'MN')
    ) {
      // Clear any stored auto tax for non-NY/MN addresses
      setStoredAutoTax(null);
      return; // Silently skip if no valid address
    }

    await autoCalculateTaxForAddress(customer.address);
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

  useEffect(() => {
    if (!Permissions?.includes('add_sale')) {
      router.push('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };

  useEffect(() => {
    const div = document.getElementById('textInput');
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  useEffect(() => {
    if (c) {
      const res = decryptData(c);
      if (res?.uid) {
        setSelectedCustomer(res);
        OnCustomerSelect(res);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c]);

  const handleConvertData = () => {
    const array: any = [];
    let note = '';
    let section = '';
    invoiceItems.map((data: any) => {
      if (data.type === 'product' && data?.product_service?.uid) {
        // For auto-calculated tax, don't send tax_uid but mark is_item_tax
        const isAutoTax = invoiceData?.sales_tax?.auto_calculated && data?.is_tax;
        console.log("🚀 ~ handleConvertData ~ isAutoTax:", isAutoTax)

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
      // Build from tax_group when agencyTaxSet was available
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
      // Fallback: build from raw API breakdown
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

  const handleSend = async () => {
    const convertedData = handleConvertData();
    if (!invoiceData?.receivable_charter_account?.uid && invoiceData?.deposit > 0)
      return toast.error('Please select a deposit account');
    if (!selectedCustomer?.uid) {
      return toast.error('Please Select A Customer First');
    }
    if (!convertedData.length) {
      toast.error('Add Product To Create Invoice');
      return;
    }

    const isInventoryProduct = invoiceItems.some((item: any) => item.product?.is_inventory);
    console.log(isInventoryProduct);
    if (isInventoryProduct) {
      if (!data?.location?.uid) {
        return toast.error('Please select a warehouse location');
      }
    }

    const emailList = {
      customer_email: emails.email,
      cc_emails: emails?.ccEmail?.split(',').join(','),
      bcc_emails: emails?.bcEmail?.split(',').join(','),
    };

    const linkedFiles = attachmentList.map((file) => file.uid);

    const Data = {
      date: new Date().toLocaleDateString(),
      email: emailList,
      tracking_number: data.tracking_no,
      discount_kind: invoiceData.discount_kind,
      discount: invoiceData.discount_amount,
      shipping_fee: invoiceData.shipping_fee,
      total_tax: invoiceData.total_tax,
      total: invoiceData.total,
      description: termsCondition,
      tax_kind: invoiceData.tax_kind,
      invoice_date: invoiceDate,
      due_date: moment(dueDate).format('YYYY-MM-DD'),
      is_invoice: true,
      customer_uid: selectedCustomer.uid,
      full_billing_address: data.billing_address,
      full_shipping_address: data.shipping_to,
      shipping_by: data.ship_via,
      shipping_date: shipDate,
      tag_title_list: tags,
      sales_items: JSON.stringify(convertedData),
      files: files,
      warehouse_uid: data?.location?.uid,
      term_uid: data?.terms?.uid,
      deposit: invoiceData?.deposit,
      due_total: invoiceData?.due_total,
    };
    if (currency < 0) return toast.error('Currency is Required');
    if (!Data?.term_uid) {
      const loopArr = [
        // { property: 'warehouse_uid', message: 'Please Select A Warehouse' },
        { property: 'term_uid', message: 'Please Select A Term' },
      ];
      loopArr.map((item, idx) => {
        if (!Data[item?.property as keyof typeof Data]) {
          toast.error(item.message);
        }
      });
      return;
    }

    try {
      setIsPending(true);
      const formData = new FormData();
      if (linkedFiles.length) formData.append('file_uids', JSON.stringify(linkedFiles));
      formData.append('email', JSON.stringify(Data.email));
      formData.append('status', 'OPEN');
      formData.append('kind', 'SALE');
      formData.append('tracking_number', Data.tracking_number);
      formData.append('discount_kind', Data.discount_kind);
      formData.append('discount', Data.discount);
      formData.append('shipping_fee', Data.shipping_fee);
      formData.append('total_tax', Data.total_tax);
      formData.append('total', Data.total);
      formData.append('description', Data.description);
      formData.append('tax_kind', Data.tax_kind);
      formData.append('invoice_date', Data.invoice_date);
      formData.append('due_date', Data.due_date);
      formData.append('is_invoice', 'true');
      invoiceData?.receivable_charter_account?.uid &&
        formData.append(
          'receivable_charter_account_uid',
          invoiceData?.receivable_charter_account?.uid
        );
      formData.append('customer_uid', Data.customer_uid);
      formData.append('full_billing_address', Data.full_billing_address);
      formData.append('full_shipping_address', Data.full_shipping_address || '');

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

      formData.append('shipping_by', Data.shipping_by || '');
      formData.append('shipping_date', Data.shipping_date || '');
      formData.append('tag_title_list', JSON.stringify(Data.tag_title_list));
      formData.append('sales_items', Data.sales_items);
      formData.append('warehouse_uid', Data.warehouse_uid);
      formData.append('term_uid', Data.term_uid);
      formData.append('deposit', Data.deposit);
      formData.append('due_total', Data.due_total.toFixed(3));
      formData.append('currency_rate', currency);
      formData.append('currency_kind', selectedCustomer?.currency);
      if (files.length) {
        files.map((file) => {
          formData.append('files', file);
        });
      }

      const res = await postSale(formData);
      if (res?.success) {
        if (estimateUID) {
          const res = await deleteSale(estimateUID);
        }
        toast.success('Invoice created.');
        router.push('/dashboard/sales/all_sales?sale_type=invoice');
      }
    } catch (err: any) {
      // console.log(err);
    } finally {
      setIsPending(false);
    }
  };

  const OnCustomerSelect = async (customer: any) => {
    setEmails({ ...emails, email: customer?.email || '' });
    setData({
      ...data,
      billing_address: formatFullAddress(customer?.address),
      shipping_to: formatFullAddress(customer?.address),
    });

    // Clear previous auto-calculated tax when customer changes
    setStoredAutoTax(null);
    setInvoiceData((prev: any) => ({
      ...prev,
      sales_tax: null, // Clear previous tax selection
    }));

    // Auto-calculate sales tax based on customer address
    await autoCalculateTaxForCustomer(customer);

    // setInvoiceItems([]);
    setEstimateUID('');
    setIsOpen(true);
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

  const handleAddClick = async (uid: string) => {
    setIsOpen(false);
    setEstimateUID(uid);
    try {
      setIsEstimateLoading(true);
      const SalesData = await fetchSale(uid);
      const SalesItems: any = await fetchSaleItems(uid);
      const TagList: any = await fetchSaleTags(uid);
      // const FileList: any = await fetchSaleFiles(uid);

      // setExistingFiles(FileList.results);
      const tags = TagList?.results?.map((tag: any) => {
        return tag?.title;
      });
      setTags(tags);
      const email = SalesData?.email;
      setTermsCondition(SalesData?.description);
      setEmails({
        ...emails,
        email: email?.customer_email || '',
        ccEmail: email?.cc_emails,
        bcEmail: email?.bcc_emails,
      });
      setData({
        ...data,
        billing_address:
          SalesData?.billing_address?.street || SalesData?.billing_address?.full_address
            ? formatFullAddress(SalesData?.billing_address)
            : '',
        shipping_to:
          SalesData?.shipping_address?.street || SalesData?.shipping_address?.full_address
            ? formatFullAddress(SalesData?.shipping_address)
            : '',
        ship_via: SalesData?.shipping_address?.shipping_by,
        location: SalesData?.warehouse,
        tracking_no: SalesData?.tracking_number,
        terms: SalesData?.terms,
      });
      setInvoiceData({
        ...invoiceData,
        discount_kind: SalesData?.discount_kind,
        discount_amount: SalesData?.discount,
        shipping_fee: SalesData?.shipping_fee,
        total_tax: SalesData.total_tax,
        total: SalesData.total,
        tax_kind: SalesData.tax_kind,
      });

      const array = convertBackendToFrontendData(SalesItems, SalesData);

      setInvoiceItems(array);
    } catch (err) {
      toast.error('An Error Occurred While Getting The Data');
    } finally {
      setIsEstimateLoading(false);
    }
  };

  return (
    <div className="relative font-jakarta text-v-ink900">
      {(isPending || isEstimateLoading) && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          <div className="mt-2">
            {isPending && (
              <TextAnimation
                messages={['Creating Invoice', 'Sending Invoice', 'Uploading Attachments']}
                start={isPending}
              />
            )}
          </div>
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
            New invoice
          </h1>
          <Chip tone="warn">Draft</Chip>
        </div>

        {/* two-column body */}
        <div className="mt-[18px] grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT — work column (clip stray horizontal overflow; sticky rail is a sibling so it's unaffected) */}
          <div className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
            {/* Bill-to + details */}
            <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
              <div className="mb-4 flex items-center gap-2.5">
                <IconChip tone="violet">
                  <User />
                </IconChip>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-v-ink900">Bill to</div>
                  <div className="text-[11.5px] text-v-ink400">
                    Who is this invoice for? Contact details auto-fill.
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
                    setRate={setCurrency}
                    rate={currency}
                  />
                </div>
                {invoiceData?.deposit > 0 && (
                  <div className="md:col-span-2">
                    <label className={V_LABEL}>
                      Deposit account <span className="text-v-primary">*</span>
                    </label>
                    <AccountSelectDropDown
                      filters={{ account_type__title: 'Bank,Other Current Assets' }}
                      ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                      setValue={(e: any) =>
                        setInvoiceData({ ...invoiceData, receivable_charter_account: e })
                      }
                      value={invoiceData?.receivable_charter_account}
                    />
                  </div>
                )}
              </div>

              <div className="my-4 border-t border-[rgba(22,23,42,0.07)]" />
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                Invoice details
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0">
                <div>
                  <label className={V_LABEL}>Invoice date</label>
                  <DatePicker
                    calenderClassName="max-md:left-1 max-md:right-1"
                    onChange={setInvoiceDate}
                    value={invoiceDate}
                    ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Due date</label>
                  <DatePicker
                    calenderClassName="max-md:left-1 max-md:right-1"
                    onChange={setDueDate}
                    value={dueDate}
                    ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Terms</label>
                  <TermSelectDropDown
                    ClassName="rounded-v-input border border-v-border focus:border-v-primary"
                    setValue={(e: any) => setData({ ...data, terms: e })}
                    value={data.terms}
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Sales representative</label>
                  <input
                    defaultValue={UserData?.name}
                    className={cn(V_FIELD, 'bg-v-wash2')}
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
                    value={data.tracking_no}
                    onChange={(e) => setData({ ...data, tracking_no: e.target.value })}
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
                          if (addr) {
                            autoCalculateTaxForAddress(addr);
                          }
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
                  <div className="text-[11.5px] text-v-ink400">
                    Add the products and services to bill.
                  </div>
                </div>
              </div>
              <div className="min-w-0">
                <InvoiceTable
                  setIsCalculation={setIsCalculationOpen}
                  invoiceItems={invoiceItems}
                  setInvoiceItems={setInvoiceItems}
                  setInvoiceData={setInvoiceData}
                  invoiceData={invoiceData}
                  storedAutoTax={storedAutoTax}
                  showSummary={false}
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
                  <TextEditor setTermsCondition={setTermsCondition} />
                </div>
              </div>
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  <Paperclip className="h-3.5 w-3.5" /> Attachments
                </div>
                <FileUpload onLinkedFilesChange={setAttachmentList} onFilesChange={handleFilesChange} />
              </div>
            </div>
          </div>

          {/* RIGHT — summary rail */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-0">
            {/* amount-due hero */}
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
                  Amount due
                </div>
                <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                  {money(Number(invoiceData?.total) || 0)}
                </div>
                <div className="mt-1 text-[11.5px] text-white/60">
                  Due {moment(dueDate).format('DD MMMM, YYYY')}
                  {selectedCustomer?.currency ? ` · ${selectedCustomer.currency}` : ''}
                </div>
                {selectedCustomer?.uid && (
                  <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                    <User className="h-3.5 w-3.5" />
                    {`${selectedCustomer?.first_name || ''} ${selectedCustomer?.last_name || ''}`.trim()}
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
              />

              <div className="mt-4 flex flex-col gap-2 border-t border-[rgba(22,23,42,0.07)] pt-4">
                <VioletButton
                  variant="primary"
                  className="w-full"
                  onClick={handleSend}
                  disabled={isPending}
                  leftIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
                >
                  {isPending ? 'Saving…' : 'Save & send'}
                </VioletButton>
                <VioletButton variant="outline" className="w-full" onClick={handlePreview}>
                  Preview invoice
                </VioletButton>
                <VioletButton
                  variant="ghost"
                  className="w-full"
                  onClick={handleSend}
                  disabled={isPending}
                >
                  Save as draft
                </VioletButton>
              </div>
            </div>

            {/* ready to send */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                Ready to send?
              </div>
              <ReadyCheck ok={!!selectedCustomer?.uid} label="Customer selected" />
              <ReadyCheck
                ok={invoiceItems?.some((i: any) => i?.type === 'product' && i?.product_service?.uid)}
                label="At least one priced line"
              />
              <ReadyCheck ok={!!emails?.email} label="Customer email added" />
            </div>
          </div>
        </div>

        <ProductModalSkeleton title="Add Products And Services">
          <CreateProductAndService />
        </ProductModalSkeleton>
      </div>
      <div className={`${Preview ? '' : 'hidden'}`}>
        <InvoicePreview
          handleSubmit={handleSend}
          isLoading={isPending}
          setPreview={setPreview}
          InvoiceData={{
            invoiceData: {
              ...invoiceData,
              selectedCustomer,
              emails,
              invoiceDate,
              dueDate,
              shipDate,
              data,
            },
            invoiceItems: invoiceItems,
            tags: tags,
            files: files,
          }}
        />
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add to Invoice"
        widthClass="w-full md:w-[550px]"
      >
        <CustomerEstimateList
          uid={selectedCustomer?.uid}
          handleAddClick={(uid: any) => handleAddClick(uid)}
        />
      </Modal>
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

export default Invoice;
