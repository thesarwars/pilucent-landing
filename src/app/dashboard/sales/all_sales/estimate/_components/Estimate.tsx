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
import CustomerSelectDropDown from '../../../../../../components/ui/ScrollSelectDropDowns/CustomerSelectDropDown';
import { useAppSelector } from '@/app/redux/store';
import LocationSelectDropDown from '../../../../../../components/ui/ScrollSelectDropDowns/LocationSelectDropDown';
import EstimatePreview from './EstimatePreview';
import { useMutation } from '@tanstack/react-query';
import { PostMultipart } from '@/services/FetchMethods';
import GetToken from '@/hooks/getToken';
import CurrencySelect from '../../_components/CurrencySelect';
import TextAnimation from '../../_components/CustomTypewritter';
import DatePicker from '@/components/ui/DatePicker';
import moment from 'moment';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import EstimateTable from './EstimateTable';
import ProductModalSkeleton from '@/components/ProductManager/ProductModalSkeleton';
import CreateProductAndService from '@/components/ProductManager/CreateProductService';
import { toast } from '@/lib/ToastService';
import InvoiceTable from '../../_components/InvoiceTable';
import InvoiceSummary from '../../_components/InvoiceSummary';
import { formatPercent } from '@/utils/TaxLookUp';
import Modal from '@/app/(admin)/_components/Modal';
import { fetchAgencyTaxSet } from '@/app/helpers/backend';
import { cn } from '@/lib/utils';
import { Chip, IconChip, VioletButton, money, V } from '@/components/violet';
import { ArrowLeft, User, ListPlus, Paperclip, Loader2 } from 'lucide-react';

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

/* header status pill colors, mirroring the existing status select */
const STATUS_PILL: Record<string, string> = {
  open: 'bg-[#DDEDFD] text-[#286AC5]',
  pending: 'bg-[#FCF7EE] text-[#EF9B0D]',
  accepted: 'bg-green-100 text-green-600',
  closed: 'bg-gray-100 text-gray-500',
  rejected: 'bg-red-100 text-red-500',
};

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

const Estimate = () => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [Preview, setPreview] = useState<boolean>(false);
  const [estimateItems, setEstimateItems] = useState<any[]>([]);
  const [currency, setCurrency] = useState<any>({ exchange_rate: 0 });
  const { SalesSettingsData } = useAppSelector((state) => state.SalesSettingsData);
  const [estimateData, setEstimateData] = useState<any>({
    discount_kind: 'PERCENTAGE',
    discount_amount: 0,
    shipping_fee: 0,
    total_tax: 0,
    total: 0,
    tax_kind: 'EXCLUSIVE',
  });
  const [emails, setEmails] = useState<any>({
    email: '',
    ccEmail: '',
    bcEmail: '',
  });
  const { UserData } = useAppSelector((state) => state.userData);
  const [estimateDate, setEstimateDate] = useState<any>(todayDate);
  const [expiredDate, setExpiredDate] = useState<any>(todayDate);
  const [shipDate, setShipDate] = useState<any>(todayDate);
  const [data, setData] = useState<any>({
    billing_address: '',
    shipping_to: '',
    ship_via: '',
    tracking_no: '',
    terms: { label: '', uid: '' },
    location: { label: '', uid: '' },
  });
  const [isBcOpen, setIsBcOpen] = useState<boolean>();
  const [files, setFiles] = useState<File[]>([]);
  const [estimationStatus, setEstimationStatus] = useState('open');
  const [isSend, setIsSend] = useState<boolean>(false);
  const [attachmentList, setAttachmentList] = useState<any[]>([]);
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const router = useRouter();

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
  };
  const [selectedCustomer, setSelectedCustomer] = useState<any>({
    first_name: '',
  });
  const [storedAutoTax, setStoredAutoTax] = useState<any>(null);
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);
  const [isCustomerSelection, setIsCustomerSelection] = useState(false);
  const token = GetToken();

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

        // Show toast for customer selection
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
  const autoCalculateTaxForAddress = async (address: any, showToast = true) => {
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

        // Only show toast if requested (not during customer selection)
        if (showToast) {
          toast.success(
            `${stateNames[state as keyof typeof stateNames]} tax calculated: ${taxRate} for ${data.county} County. Will auto-apply when you select products.`
          );
        }
      }
    } catch (error) {
      console.log('Auto tax calculation failed:', error);
      setStoredAutoTax(null);
      // Silently fail, don't show error to user
    }
  };

  useEffect(() => {
    const div = document.getElementById('textInput');
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  const handleConvertData = () => {
    const array: any = [];
    let note = '';
    let section = '';
    estimateItems.map((data: any) => {
      if (data?.product_service?.uid) {
        const itemData: any = {
          product_uid: data.product_service?.uid,
          quantity: data.qty,
          total: (data.price * data.qty).toFixed(3),
          sale_price: data?.price,
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

  useEffect(() => {
    if (!Permissions?.includes('add_sale')) {
      router.push('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const {
    mutate: PostEstimate,
    isPending,
    error,
    isError,
  } = useMutation({
    mutationFn: async (data: any) => {
      const res = await PostMultipart(`we/sales`, data, token);
      return res;
    },
    onSuccess: (res) => {
      toast.success('Estimate created.');
      router.push('/dashboard/sales/all_sales?sale_type=estimate');
    },
    onError: (res: any) => {
      // toast.error("An Unknown Error Occurred!", { autoClose: 4000 });
    },
  });

  const OnCustomerSelect = async (customer: any) => {
    setIsCustomerSelection(true); // Set flag to prevent billing address toast
    setEmails({ ...emails, email: customer?.email || '' });
    setData({
      ...data,
      billing_address: formatFullAddress(customer?.address),
    });

    // Clear previous auto-calculated tax when customer changes
    setStoredAutoTax(null);
    setEstimateData((prev: any) => ({
      ...prev,
      sales_tax: null, // Clear previous tax selection
    }));

    // Auto-calculate sales tax based on customer address
    await autoCalculateTaxForCustomer(customer);

    // Reset flag after customer selection is complete
    setTimeout(() => setIsCustomerSelection(false), 100);
  };

  const handleSend = () => {
    const convertedData = handleConvertData();
    if (!convertedData.length) {
      toast.error('Add Product To Create Invoice');
      return;
    }
    const emailList = {
      customer_email: emails.email,
      cc_emails: emails?.ccEmail?.split(',').join(','),
      bcc_emails: emails?.bcEmail?.split(',').join(','),
    };
    const Data = {
      // date: new Date().toLocaleDateString(),
      email: JSON.stringify(emailList),
      status: estimationStatus.toUpperCase(),
      tracking_number: data.tracking_no,
      discount_kind: estimateData.discount_kind,
      discount: estimateData.discount_amount,
      shipping_fee: estimateData.shipping_fee,
      total_tax: estimateData.total_tax,
      total: estimateData.total,
      description: termsCondition,
      tax_kind: estimateData.tax_kind,
      invoice_date: estimateDate,
      expired_date: expiredDate,
      is_estimate: true,
      customer_uid: selectedCustomer.uid,
      full_billing_address: data.billing_address,
      full_shipping_address: data.shipping_to,
      shipping_by: data.ship_via,
      shipping_date: shipDate,
      tag_title_list: tags,
      sales_items: JSON.stringify(convertedData),
      files: files,
      warehouse_uid: data.location.uid,
      term_uid: data.terms.uid,
    };
    const linkedFiles = attachmentList.map((file) => file.uid);
    const formData = new FormData();
    if (linkedFiles.length) formData.append('file_uids', JSON.stringify(linkedFiles));
    // formData.append("date", Data.date);
    formData.append('email', Data.email);
    formData.append('status', Data.status);
    formData.append('tracking_number', Data.tracking_number);
    formData.append('discount_kind', Data.discount_kind);
    formData.append('discount', Data.discount);
    formData.append('shipping_fee', Data.shipping_fee);
    formData.append('total_tax', Data.total_tax);
    formData.append('total', Data.total);
    formData.append('description', Data.description);
    formData.append('tax_kind', Data.tax_kind);
    formData.append('invoice_date', Data.invoice_date);
    formData.append('expired_date', Data.expired_date);
    formData.append('is_estimated', 'true');
    formData.append('customer_uid', Data.customer_uid);
    formData.append('full_billing_address', Data.full_billing_address);
    formData.append('full_shipping_address', Data.full_shipping_address);
    formData.append('shipping_by', Data.shipping_by);
    formData.append('shipping_date', Data.shipping_date);
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

    PostEstimate(formData);
  };

  useEffect(() => {
    try {
      if (isError) {
        let errors: any;
        if (error?.message) errors = JSON.parse(error?.message);
        Object.keys(errors)?.forEach((key) => {
          const errorMessages = errors[key];
          errorMessages?.forEach((message: string) => {
            toast.error(`${key.split('_').join(' ').toUpperCase()} :- ${message}`);
          });
        });
      }
    } catch (err) {
      toast.error('Something Went Wrong');
    }
  }, [error, isError]);

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
      {isPending && (
        <div className="absolute left-0 top-0 z-[100] flex h-full w-full flex-col items-center justify-center rounded-v-card bg-white/70 backdrop-blur-sm">
          <p className="inline-block h-16 w-16 animate-spin rounded-full border-[3px] border-v-tint100 border-t-v-primary" />
          <div className="mt-2">
            <TextAnimation
              messages={['Creating Estimate', 'Sending Estimate', 'Uploading Attachments']}
              start={isPending}
            />
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
            New estimate
          </h1>
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-bold capitalize',
              STATUS_PILL[estimationStatus] || STATUS_PILL.open
            )}
          >
            {estimationStatus}
          </span>
          <Chip tone="warn">Expires {moment(expiredDate).format('DD MMM YYYY')}</Chip>
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
                  <div className="text-[11.5px] text-v-ink400">
                    Pick a customer — contact details auto-fill.
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
                    value={emails.email}
                    onChange={(e) => setEmails({ ...emails, email: e.target.value })}
                    placeholder="name@company.com"
                    className={V_FIELD}
                    type="email"
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
                          type="email"
                        />
                      </div>
                      <div>
                        <label className={V_LABEL}>Bcc</label>
                        <input
                          value={emails.bcEmail}
                          onChange={(e) => setEmails({ ...emails, bcEmail: e.target.value })}
                          placeholder="Separate emails with a comma"
                          className={V_FIELD}
                          type="email"
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
                <div>
                  <label className={V_LABEL}>Status</label>
                  <select
                    value={estimationStatus}
                    onChange={(e) => setEstimationStatus(e.target.value)}
                    className={cn(V_FIELD, 'cursor-pointer')}
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
              </div>

              <div className="my-4 border-t border-[rgba(22,23,42,0.07)]" />
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                Estimate details
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 [&>div]:min-w-0">
                <div>
                  <label className={V_LABEL}>Estimation date</label>
                  <DatePicker
                    value={estimateDate}
                    onChange={setEstimateDate}
                    ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Expire date</label>
                  <DatePicker
                    value={expiredDate}
                    onChange={setExpiredDate}
                    ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
                <div>
                  <label className={V_LABEL}>Sales representative</label>
                  <input
                    value={UserData?.name}
                    className={cn(V_FIELD, 'bg-v-wash2')}
                    type="text"
                    readOnly
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={V_LABEL}>Billing address</label>
                  <input
                    value={data.billing_address}
                    onChange={(e) => setData({ ...data, billing_address: e.target.value })}
                    onBlur={async (e) => {
                      // Don't trigger during customer selection
                      if (isCustomerSelection) return;

                      const addressString = e.target.value.trim();
                      if (addressString) {
                        const parsedAddress = parseAddressString(addressString);
                        if (
                          parsedAddress &&
                          (parsedAddress.province === 'NY' || parsedAddress.province === 'MN')
                        ) {
                          await autoCalculateTaxForAddress(parsedAddress, true); // Show toast for manual entry
                        }
                      }
                    }}
                    placeholder="Street, city, state ZIP"
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
                {SalesSettingsData?.is_shipping && (
                  <>
                    <div>
                      <label className={V_LABEL}>Shipping to</label>
                      <input
                        value={data.shipping_to}
                        onChange={(e) => setData({ ...data, shipping_to: e.target.value })}
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
                        value={shipDate}
                        onChange={setShipDate}
                        ClassName="w-full rounded-v-input border border-v-border bg-white px-3.5 py-2.5 focus:border-v-primary"
                        placeholder="DD-MM-YYYY"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className={V_LABEL}>Tracking no</label>
                  <input
                    value={data.tracking_no}
                    onChange={(e) => setData({ ...data, tracking_no: e.target.value })}
                    className={V_FIELD}
                    type="text"
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
                invoiceItems={estimateItems}
                setInvoiceData={setEstimateData}
                setInvoiceItems={setEstimateItems}
                invoiceData={estimateData}
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

            {/* Terms + Attachments */}
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] [&>div]:min-w-0">
              <div className="rounded-v-card bg-white p-[22px] shadow-v-card">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-v-ink400">
                  Terms &amp; note to customer
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
            {/* estimate-total hero */}
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
                  Estimate total
                </div>
                <div className="mt-1 text-[30px] font-extrabold tabular-nums tracking-[-0.02em]">
                  {money(Number(estimateData?.total) || 0)}
                </div>
                <div className="mt-1 text-[11.5px] text-white/60">
                  Valid until {moment(expiredDate).format('DD MMMM, YYYY')}
                  {selectedCustomer?.currency ? ` · ${selectedCustomer.currency}` : ''}
                </div>
                {selectedCustomer?.uid && (
                  <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-3 text-[12px] text-white/75">
                    <User className="h-3.5 w-3.5" />
                    For {`${selectedCustomer?.first_name || ''} ${selectedCustomer?.last_name || ''}`.trim()}
                  </div>
                )}
              </div>
            </div>

            {/* totals + actions */}
            <div className="rounded-v-card bg-white p-5 shadow-v-card">
              <InvoiceSummary
                invoiceData={estimateData}
                setInvoiceData={setEstimateData}
                invoiceItems={estimateItems}
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
                  {isPending ? 'Saving…' : 'Save & send'}
                </VioletButton>
                <VioletButton variant="outline" className="w-full" onClick={handlePreview}>
                  Preview estimate
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
          </div>
        </div>
      </div>

      <ProductModalSkeleton title="Add Products And Services">
        <CreateProductAndService />
      </ProductModalSkeleton>

      <div className={`${Preview ? '' : 'hidden'}`}>
        <EstimatePreview
          handleSubmit={handleSend}
          isLoading={isPending}
          setPreview={setPreview}
          EstimateData={{
            invoiceData: {
              ...estimateData,
              selectedCustomer,
              emails,
              estimateDate,
              expiredDate,
              shipDate,
              data,
            },
            estimateItems,
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
        <TaxCalculation invoiceData={estimateData} invoiceItems={estimateItems} />
      </Modal>
    </div>
  );
};

export default Estimate;
