import React, { Dispatch, SetStateAction, useState } from 'react';
import BoxWrapper from './BoxWrapper';
import { useAddressValidator } from '@/hooks/useAddressValidator';
import type { AddressSuggestion } from '@/hooks/useAddressValidator';
import { Loader2, MapPin, Pencil } from 'lucide-react';
import { FormEvent, useEffect, useRef } from 'react';
import { USStates } from '@/lib/helpers/UsaStates';
import { toast } from '@/lib/ToastService';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

const textInputClassName =
  'h-14 w-full rounded-lg border border-white bg-[#F9F9F970] px-4 text-gray-900 outline-none placeholder:text-[#525151] focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white/70';

const selectClassName =
  "h-14 w-full cursor-pointer appearance-none [-webkit-appearance:none] rounded-lg border border-white bg-[#F9F9F970] bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat px-4 py-0 pr-10 text-sm leading-[3.5rem] text-gray-900 outline-none [background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%2302143A%22%20d%3D%22M12%2015.4L6%209h12z%22/%3E%3C/svg%3E')] focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white/70";

const selectEmptyTextClass = 'text-[#525151]';
const fieldErrorClass = 'border-red-500 ring-1 ring-red-500/30';

type AddressProps = {
  setStep?: Dispatch<SetStateAction<number>>;
  companyData: any;
  companyLegalAddress: any;
  setCompanyLegalAddress: any;
  disabled?: boolean;
  setCompanyData: any;
  companyAddress: any;
  setCompanyAddress: any;
};

const Address = ({
  disabled = false,
  companyLegalAddress,
  setCompanyLegalAddress,
  setStep,
  companyData,
  setCompanyData,
  companyAddress,
  setCompanyAddress,
}: AddressProps) => {
  const [errors, setErrors] = useState({
    state: '',
    country: '',
  });

  const [isAddressVerified, setIsAddressVerified] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const addressWrapperRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const {
    suggestions,
    isFetchingSuggestions,
    fetchSuggestions,
    selectSuggestion,
    clearSuggestions,
    fieldErrors,
    isValidating,
    clearFieldError,
    clearAllErrors,
    validate,
  } = useAddressValidator();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addressWrapperRef.current && !addressWrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0);
    setHighlightIndex(-1);
  }, [suggestions]);

  const handleAddressChange = (value: string) => {
    setCompanyLegalAddress((prev: any) => ({ ...prev, address: value }));
    setIsAddressVerified(false);
    clearFieldError('address');
    if (!value.trim()) {
      clearSuggestions();
      setShowSuggestions(false);
      return;
    }
    fetchSuggestions(value);
  };

  const handleSelectSuggestion = async (suggestion: AddressSuggestion) => {
    const details = await selectSuggestion(suggestion);
    if (!details) return;
    setShowSuggestions(false);
    setHighlightIndex(-1);
    clearAllErrors();
    setCompanyLegalAddress((prev: any) => ({
      ...prev,
      address: details.street || details.mainText,
      city: details.city || prev.city,
      state: details.state || prev.state,
      zip_code: details.zip || prev.zip_code,
    }));
    setIsAddressVerified(true);
  };

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightIndex(-1);
    }
  };

  const inputClass = (error?: string) =>
    `max-w-sm rounded-md border px-4 bg-transparent py-2.5 outline-none transition-colors ${
      error
        ? 'border-red-500 bg-red-50 focus:border-red-500'
        : 'border-gray-300 focus:border-accent_soft_black'
    }`;

  const validateState = (state: string): string => {
    if (!state || state.trim() === '' || state === 'Select state') {
      return 'State is required';
    }
    return '';
  };

  const validateCountry = (country: string): string => {
    if (!country || country.trim() === '') {
      return 'Country is required';
    }
    return '';
  };

  const handleStateBlur = () => {
    const stateError = validateState(companyAddress.state);
    setErrors((prev) => ({ ...prev, state: stateError }));
  };

  const handleCountryBlur = () => {
    const countryError = validateCountry(companyAddress.country);
    setErrors((prev) => ({ ...prev, country: countryError }));
  };

  const handleNext = async () => {
    if (
      !isAddressVerified &&
      (companyLegalAddress.address ||
        companyLegalAddress.city ||
        companyLegalAddress.state ||
        companyLegalAddress.zip_code)
    ) {
      const result = await validate({
        address: companyLegalAddress.address,
        city: companyLegalAddress.city,
        state: companyLegalAddress.state,
        zip: companyLegalAddress.zip_code,
      });
      if (!result.valid) {
        toast.error('Please fix the address errors before saving.');
        addressInputRef.current?.focus();
        return;
      }
      setIsAddressVerified(true);
    }
    const stateError = validateState(companyAddress?.state);
    const countryError = validateCountry(companyAddress?.country);

    if (stateError || countryError) {
      setErrors({
        state: stateError,
        country: countryError,
      });
      if (stateError) {
        toast.error(stateError);
      } else if (countryError) {
        toast.error(countryError);
      }
      return;
    }

    setErrors({
      state: '',
      country: '',
    });
    setStep && setStep(4);
  };

  return (
    <div className="text-sm">
      <BoxWrapper className="flex flex-col">
        <h4 className="mb-4 text-xl font-medium">Address</h4>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="company_address"
              tooltip="Enter your company's street address. This will be used as the primary business location."
            >
              Address
            </TooltipLabel>
            <input
              id="company_address"
              placeholder="Enter Street or address"
              value={companyAddress.address}
              onChange={(e) =>
                setCompanyAddress({
                  ...companyAddress,
                  address: e.target.value,
                })
              }
              className={textInputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="company_city"
              tooltip="Enter the city where your company is located."
            >
              City
            </TooltipLabel>
            <input
              id="company_city"
              placeholder="Enter City"
              value={companyAddress.city}
              onChange={(e) =>
                setCompanyAddress({
                  ...companyAddress,
                  city: e.target.value,
                })
              }
              className={textInputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="company_state"
              required={true}
              tooltip="Select the state where your company is registered. Required for tax and legal purposes."
            >
              State
            </TooltipLabel>
            <select
              id="company_state"
              required
              value={companyAddress.state}
              onChange={(e) => {
                setCompanyAddress({
                  ...companyAddress,
                  state: e.target.value,
                });
                setErrors({ ...errors, state: '' });
              }}
              onBlur={handleStateBlur}
              className={`${selectClassName} ${!companyAddress.state ? selectEmptyTextClass : ''} ${errors?.state ? fieldErrorClass : ''}`}
            >
              <option value="">Select state</option>
              {USStates?.map((state) => {
                return (
                  <option key={state.value} value={state.value}>
                    {state.title}
                  </option>
                );
              })}
            </select>
            {errors?.state && <span className="text-xs text-red-500">{errors.state}</span>}
          </div>
          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="company_country"
              required={true}
              tooltip="Select the country where your company is located. Determines tax regulations and compliance."
            >
              Country
            </TooltipLabel>
            <select
              id="company_country"
              required
              value={companyAddress.country}
              onChange={(e) => {
                setCompanyAddress({
                  ...companyAddress,
                  country: e.target.value,
                });
                setErrors({ ...errors, country: '' });
              }}
              onBlur={handleCountryBlur}
              className={`${selectClassName} ${errors?.country ? fieldErrorClass : ''}`}
            >
              <option value="US">United States</option>
            </select>
            {errors?.country && <span className="text-xs text-red-500">{errors.country}</span>}
          </div>
          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="company_zip_code"
              tooltip="Enter your company's postal or ZIP code."
            >
              Zip Code
            </TooltipLabel>
            <input
              id="company_zip_code"
              placeholder="Enter zip code"
              value={companyAddress.zip_code}
              onChange={(e) =>
                setCompanyAddress({
                  ...companyAddress,
                  zip_code: e.target.value,
                })
              }
              className={textInputClassName}
            />
          </div>

          <div className="flex flex-col gap-2">
            <TooltipLabel
              htmlFor="customerFacingAddress"
              tooltip="The address displayed to customers on invoices and public documents. Leave blank to use company address."
            >
              Customer-facing Address
            </TooltipLabel>
            <input
              className={textInputClassName}
              name="customerFacingAddress"
              id="customerFacingAddress"
              placeholder="Same as Company Address"
              value={companyData.customer_facing_address}
              maxLength={255}
              onChange={(e) =>
                setCompanyData({
                  ...companyData,
                  customer_facing_address: e.target.value,
                })
              }
            />
          </div>
        </div>
      </BoxWrapper>

      <BoxWrapper className="flex flex-col rounded-lg bg-white/60 shadow">
        <div>
          <h2 className="mb-4 text-xl font-medium text-accent_soft_black">Company legal address</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex flex-col gap-2" ref={addressWrapperRef}>
                <label className="text-accent_soft_black">
                  Street Address
                  {/* <span className="text-base text-red-500">*</span> */}
                </label>
                <div className="relative max-w-sm">
                  <input
                    disabled={disabled}
                    ref={addressInputRef}
                    value={companyLegalAddress?.address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    onKeyDown={handleAddressKeyDown}
                    autoComplete="off"
                    placeholder="Enter your address..."
                    required
                    aria-invalid={!!fieldErrors.address}
                    className={`w-full bg-transparent ${inputClass(fieldErrors.address)}`}
                  />
                  {(isFetchingSuggestions || isValidating) && (
                    <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-gray-400" />
                  )}
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                      {suggestions.map((suggestion, index) => (
                        <li key={suggestion.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setHighlightIndex(index)}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                              index === highlightIndex
                                ? 'bg-accent_bluish_gray'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <MapPin className="size-4 shrink-0 text-gray-500" />
                            <span className="min-w-0 truncate">
                              <span className="font-semibold text-accent_soft_black">
                                {suggestion.mainText}
                              </span>
                              {suggestion.secondaryText && (
                                <span className="ml-1 font-normal text-gray-500">
                                  {suggestion.secondaryText}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {fieldErrors.address && (
                  <p className="mt-1 max-w-sm text-xs text-red-600">{fieldErrors.address}</p>
                )}
                {/* {!fieldErrors.address && isAddressVerified && companyLegalAddress.address && (
                  <p className="mt-1 max-w-sm text-xs text-green-600">Address verified.</p>
                )} */}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">
                  State
                  {/* <span className="text-base text-red-500">*</span> */}
                </label>
                <select
                  disabled={disabled}
                  value={companyLegalAddress?.state}
                  onChange={(e) => {
                    setCompanyLegalAddress({ ...companyLegalAddress, state: e.target.value });
                    clearFieldError('state');
                    setIsAddressVerified(false);
                  }}
                  required
                  className={inputClass(fieldErrors.state)}
                >
                  {' '}
                  <option value="">Select</option>
                  {USStates.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.title}
                    </option>
                  ))}
                </select>
                {fieldErrors.state && (
                  <p className="mt-1 max-w-sm text-xs text-red-600">{fieldErrors.state}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">
                  City
                  {/* <span className="text-base text-red-500">*</span> */}
                </label>
                <input
                  disabled={disabled}
                  value={companyLegalAddress?.city}
                  onChange={(e) => {
                    setCompanyLegalAddress({ ...companyLegalAddress, city: e.target.value });
                    clearFieldError('city');
                    setIsAddressVerified(false);
                  }}
                  required
                  className={inputClass(fieldErrors.city)}
                />
                {fieldErrors.city && (
                  <p className="mt-1 max-w-sm text-xs text-red-600">{fieldErrors.city}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">
                  Zip
                  {/* <span className="text-base text-red-500">*</span> */}
                </label>
                <input
                  disabled={disabled}
                  value={companyLegalAddress?.zip_code}
                  onChange={(e) => {
                    setCompanyLegalAddress({ ...companyLegalAddress, zip_code: e.target.value });
                    clearFieldError('zip');
                    setIsAddressVerified(false);
                  }}
                  required
                  className={inputClass(fieldErrors.zip)}
                />
                {fieldErrors.zip && (
                  <p className="mt-1 max-w-sm text-xs text-red-600">{fieldErrors.zip}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </BoxWrapper>

      {setStep && (
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="rounded-md border border-indigo-600 bg-white px-6 py-2 text-indigo-600 hover:bg-indigo-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-md bg-[#02143A] px-6 py-2 text-white hover:opacity-95"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Address;

interface TooltipLabelProps {
  children: React.ReactNode;
  tooltip: string;
  required?: boolean;
  htmlFor?: string;
}

const TooltipLabel = ({ children, tooltip, required = false, htmlFor }: TooltipLabelProps) => {
  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor={htmlFor} className="text-accent_soft_black">
        {children}
        {required && <span className="ml-1 text-xs font-normal text-gray-500">(Required)</span>}
        {!required && <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>}
      </label>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-1 text-accent_soft_black transition-colors hover:bg-gray-200"
          >
            <InfoIcon className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="max-w-xs rounded-lg border bg-white px-2 py-2 text-sm text-white shadow-lg"
          sideOffset={5}
        >
          <div className="flex items-start gap-2">
            <InfoIcon color="#000" className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="text-left text-[13px] font-light leading-relaxed text-accent_soft_black">
              {tooltip}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
