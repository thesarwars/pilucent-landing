import PDFModal from '@/app/dashboard/reports/_components/PDFModal';
import {
  fetchGeneralTaxSettings,
  patchGeneralTaxSettings,
  postGeneralTaxSettings,
} from '@/app/helpers/backend';
import Button from '@/components/ui/RawButton';
import { USStates } from '@/lib/helpers/UsaStates';
import { toast } from '@/lib/ToastService';
import { useAddressValidator } from '@/hooks/useAddressValidator';
import type { AddressSuggestion } from '@/hooks/useAddressValidator';
import { Loader2, MapPin, Pencil } from 'lucide-react';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import DotSpinner from '../../../employee/employees/_components/dot-spinner';

const GeneralTaxSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [isAddressVerified, setIsAddressVerified] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [einError, setEinError] = useState('');
  const [data, setData] = useState({
    title: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    company_type: 'OTHER',
    ein_number: '',
    uid: '',
  });

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
      if (
        addressWrapperRef.current &&
        !addressWrapperRef.current.contains(event.target as Node)
      ) {
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
    setData((prev) => ({ ...prev, address: value }));
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
    setData((prev) => ({
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
      setHighlightIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1,
      );
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

  const formatEin = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  };

  const handleEinChange = (value: string) => {
    const formatted = formatEin(value);
    setData((prev) => ({ ...prev, ein_number: formatted }));
    if (einError) setEinError('');
  };

  const validateEin = (ein: string): string => {
    const digits = ein.replace(/\D/g, '');
    if (!digits) return 'EIN is required.';
    if (digits.length !== 9) return 'EIN must be exactly 9 digits (XX-XXXXXXX).';
    if (digits.startsWith('00')) return 'EIN cannot start with 00.';
    return '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsPending(true);

      const einErr = validateEin(data.ein_number);
      if (einErr) {
        setEinError(einErr);
        toast.error(einErr);
        return;
      }

      if (!isAddressVerified) {
        const result = await validate({
          address: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip_code,
        });
        if (!result.valid) {
          toast.error('Please fix the address errors before saving.');
          addressInputRef.current?.focus();
          return;
        }
        setIsAddressVerified(true);
      }

      if (data?.uid) {
        const res = await patchGeneralTaxSettings(data?.uid, data);
        if (res?.success) {
          toast.success('Tax settings updated.');
          setData((prev) => ({ ...prev, ...res }));
          setIsOpen(false);
        }
      } else {
        const res = await postGeneralTaxSettings(data);
        if (res?.success) {
          toast.success('Tax settings created.');
          setData((prev) => ({ ...prev, ...res }));
          setIsOpen(false);
        }
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    const fn = async () => {
      try {
        setIsLoading(true);
        const res = await fetchGeneralTaxSettings();
        if (res?.results?.[0]?.uid) {
          setData({ ...data, ...res?.results?.[0] });
          setIsAddressVerified(true);
        }
      } catch (error) {
        //err
      } finally {
        setIsLoading(false);
      }
    };
    fn();
  }, []);

  const inputClass = (error?: string) =>
    `max-w-sm rounded-md border px-4 py-2.5 outline-none transition-colors ${
      error
        ? 'border-red-500 bg-red-50 focus:border-red-500'
        : 'border-gray-300 focus:border-accent_soft_black'
    }`;

  return (
    <div>
      <div className="border-b border-gray-200 bg-white/60 transition-all duration-300 hover:border-accent_soft_blue hover:bg-gray-100">
        <div className="grid grid-cols-2 px-4 py-7">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-accent_soft_black">
              General Tax
            </h2>
            <p className="flex-1 text-sm text-accent_soft_black">
              Company Type, filing Name and filing address
            </p>
          </div>
          <div className="flex items-end justify-end">
            <Button
              onClick={() => setIsOpen(true)}
              className="px-3 py-3 text-accent_soft_black hover:bg-gray-200"
            >
              <Pencil className="size-[18px]" />
            </Button>
          </div>
        </div>
      </div>
      <PDFModal
        isPadding={false}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="General Tax Settings"
        bgClass="bg-accent_bluish_gray"
      >
        {(isLoading || isPending) && (
          <div className="absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center bg-white/60 bg-opacity-50">
            <DotSpinner />
          </div>
        )}{' '}
        <div className="text-sm">
          <div className="px-7 py-7">
            {' '}
            <h2 className="text-3xl font-semibold text-accent_soft_black">
              General tax info
            </h2>
            <p className="text-sm text-accent_soft_black">
              This is the info you used when you applied for a federal EIN.
            </p>
          </div>
          <form
            className="flex h-screen flex-col rounded-lg bg-white/60 shadow"
            onSubmit={handleSubmit}
          >
            <div className="h-full flex-1 overflow-y-auto px-8">
              <div className="mb-8 space-y-2">
                <div className="py-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-accent_soft_black">
                      Company Legal Name{' '}
                      <span className="text-base text-red-500">*</span>
                    </label>
                    <input
                      maxLength={20}
                      type="text"
                      value={data?.title}
                      onChange={(e) =>
                        setData({ ...data, title: e.target.value })
                      }
                      required
                      className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    />
                    <p className="mt-1 text-xs font-light text-accent_soft_blue">
                      This may be different than a trade or doing business as
                      (DBA) name.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-xl font-medium text-accent_soft_black">
                  Company legal address
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div
                      className="flex flex-col gap-2"
                      ref={addressWrapperRef}
                    >
                      <label className="text-accent_soft_black">
                        Street Address
                        <span className="text-base text-red-500">*</span>
                      </label>
                      <div className="relative max-w-sm">
                        <input
                          ref={addressInputRef}
                          value={data?.address}
                          onChange={(e) => handleAddressChange(e.target.value)}
                          onFocus={() => {
                            if (suggestions.length > 0) setShowSuggestions(true);
                          }}
                          onKeyDown={handleAddressKeyDown}
                          autoComplete="off"
                          placeholder="Start typing your address..."
                          required
                          aria-invalid={!!fieldErrors.address}
                          className={`w-full ${inputClass(fieldErrors.address)}`}
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
                                  onClick={() =>
                                    handleSelectSuggestion(suggestion)
                                  }
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
                        <p className="mt-1 max-w-sm text-xs text-red-600">
                          {fieldErrors.address}
                        </p>
                      )}
                      {!fieldErrors.address &&
                        isAddressVerified &&
                        data.address && (
                          <p className="mt-1 max-w-sm text-xs text-green-600">
                            Address verified.
                          </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-accent_soft_black">
                        State
                        <span className="text-base text-red-500">*</span>
                      </label>
                      <select
                        value={data?.state}
                        onChange={(e) => {
                          setData({ ...data, state: e.target.value });
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
                        <p className="mt-1 max-w-sm text-xs text-red-600">
                          {fieldErrors.state}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-accent_soft_black">
                        City
                        <span className="text-base text-red-500">*</span>
                      </label>
                      <input
                        value={data?.city}
                        onChange={(e) => {
                          setData({ ...data, city: e.target.value });
                          clearFieldError('city');
                          setIsAddressVerified(false);
                        }}
                        required
                        className={inputClass(fieldErrors.city)}
                      />
                      {fieldErrors.city && (
                        <p className="mt-1 max-w-sm text-xs text-red-600">
                          {fieldErrors.city}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-accent_soft_black">
                        Zip
                        <span className="text-base text-red-500">*</span>
                      </label>
                      <input
                        value={data?.zip_code}
                        onChange={(e) => {
                          setData({ ...data, zip_code: e.target.value });
                          clearFieldError('zip');
                          setIsAddressVerified(false);
                        }}
                        required
                        className={inputClass(fieldErrors.zip)}
                      />
                      {fieldErrors.zip && (
                        <p className="mt-1 max-w-sm text-xs text-red-600">
                          {fieldErrors.zip}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-accent_soft_black">
                      Employee Identification Number (EIN)
                      <span className="text-base text-red-500">*</span>
                    </label>
                    <input
                      value={data?.ein_number}
                      onChange={(e) => handleEinChange(e.target.value)}
                      placeholder="XX-XXXXXXX"
                      maxLength={10}
                      required
                      aria-invalid={!!einError}
                      className={inputClass(einError)}
                    />
                    {einError && (
                      <p className="mt-1 max-w-sm text-xs text-red-600">
                        {einError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-accent_soft_black">
                      Company Type
                      <span className="text-base text-red-500">*</span>
                    </label>
                    <select
                      value={data?.company_type}
                      onChange={(e) =>
                        setData({ ...data, company_type: e.target.value })
                      }
                      required
                      className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                    >
                      <option value={'OTHER'}>Other</option>
                      <option value={'NON_PROFIT_501C3_CORP'}>
                        Non Profit 501c3 Corp
                      </option>
                      <option value={'SOLE_PROPRIETOR'}>
                        Sole Proprietor
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.1)' }}
              className="sticky bottom-0 left-0 right-0 mt-8 flex w-full justify-between space-x-4 border-t bg-white/60 px-7 py-4"
            >
              <Button
                type="button"
                className="rounded border border-accent_soft_black px-12 py-2 text-accent_soft_black transition-all hover:bg-accent_soft_black hover:text-white"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                isLoading={isPending || isValidating}
                disabled={isPending || isValidating}
                type="submit"
                className="rounded bg-accent_soft_black px-12 py-2 text-white"
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      </PDFModal>
    </div>
  );
};

export default GeneralTaxSettings;
