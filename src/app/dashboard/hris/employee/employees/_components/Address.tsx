import SmoothCheckbox from '@/components/ui/SmoothCheckbox';
import { useAddressValidator } from '@/hooks/useAddressValidator';
import type { AddressSuggestion } from '@/hooks/useAddressValidator';
import { USStates } from '@/lib/helpers/UsaStates';
import { toast } from '@/lib/ToastService';
import { Loader2, MapPin } from 'lucide-react';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import PhoneNumberInput from './PhoneNumberInput';

const Address = ({
  data,
  setData,
  prev,
  next,
  currentStep,
  steps,
  address,
  setAddress,
  mailingAddress,
  setMailingAddress,
}: {
  data: any;
  setData: any;
  prev: any;
  next: any;
  currentStep: any;
  steps: any;
  setAddress: any;
  address: any;
  mailingAddress: any;
  setMailingAddress: any;
}) => {
  const [isAddressVerified, setIsAddressVerified] = useState(false);
  const [isMailingVerified, setIsMailingVerified] = useState(false);

  const [showAddrSuggestions, setShowAddrSuggestions] = useState(false);
  const [addrHighlight, setAddrHighlight] = useState(-1);
  const addrWrapperRef = useRef<HTMLDivElement>(null);
  const addrInputRef = useRef<HTMLInputElement>(null);

  const [showMailSuggestions, setShowMailSuggestions] = useState(false);
  const [mailHighlight, setMailHighlight] = useState(-1);
  const mailWrapperRef = useRef<HTMLDivElement>(null);
  const mailInputRef = useRef<HTMLInputElement>(null);

  const addr = useAddressValidator();
  const mail = useAddressValidator();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addrWrapperRef.current && !addrWrapperRef.current.contains(event.target as Node)) {
        setShowAddrSuggestions(false);
        setAddrHighlight(-1);
      }
      if (mailWrapperRef.current && !mailWrapperRef.current.contains(event.target as Node)) {
        setShowMailSuggestions(false);
        setMailHighlight(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowAddrSuggestions(addr.suggestions.length > 0);
    setAddrHighlight(-1);
  }, [addr.suggestions]);

  useEffect(() => {
    setShowMailSuggestions(mail.suggestions.length > 0);
    setMailHighlight(-1);
  }, [mail.suggestions]);

  const handleAddrChange = (value: string) => {
    setAddress({ ...address, full_address: value });
    setIsAddressVerified(false);
    addr.clearFieldError('address');
    if (!value.trim()) {
      addr.clearSuggestions();
      setShowAddrSuggestions(false);
      return;
    }
    addr.fetchSuggestions(value);
  };

  const handleAddrSelect = async (suggestion: AddressSuggestion) => {
    const details = await addr.selectSuggestion(suggestion);
    if (!details) return;
    setShowAddrSuggestions(false);
    setAddrHighlight(-1);
    addr.clearAllErrors();
    setAddress({
      ...address,
      full_address: details.street || details.mainText,
      city: details.city || address.city,
      province: details.state || address.province,
      postal_code: details.zip || address.postal_code,
    });
    setIsAddressVerified(true);
  };

  const handleAddrKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAddrSuggestions || addr.suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAddrHighlight((prev) => (prev + 1) % addr.suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAddrHighlight((prev) => (prev <= 0 ? addr.suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (addrHighlight >= 0) {
        e.preventDefault();
        handleAddrSelect(addr.suggestions[addrHighlight]);
      }
    } else if (e.key === 'Escape') {
      setShowAddrSuggestions(false);
      setAddrHighlight(-1);
    }
  };

  const handleMailChange = (value: string) => {
    setMailingAddress({ ...mailingAddress, full_address: value });
    setIsMailingVerified(false);
    mail.clearFieldError('address');
    if (!value.trim()) {
      mail.clearSuggestions();
      setShowMailSuggestions(false);
      return;
    }
    mail.fetchSuggestions(value);
  };

  const handleMailSelect = async (suggestion: AddressSuggestion) => {
    const details = await mail.selectSuggestion(suggestion);
    if (!details) return;
    setShowMailSuggestions(false);
    setMailHighlight(-1);
    mail.clearAllErrors();
    setMailingAddress({
      ...mailingAddress,
      full_address: details.street || details.mainText,
      city: details.city || mailingAddress.city,
      province: details.state || mailingAddress.province,
      postal_code: details.zip || mailingAddress.postal_code,
    });
    setIsMailingVerified(true);
  };

  const handleMailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showMailSuggestions || mail.suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMailHighlight((prev) => (prev + 1) % mail.suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMailHighlight((prev) => (prev <= 0 ? mail.suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (mailHighlight >= 0) {
        e.preventDefault();
        handleMailSelect(mail.suggestions[mailHighlight]);
      }
    } else if (e.key === 'Escape') {
      setShowMailSuggestions(false);
      setMailHighlight(-1);
    }
  };

  const inputClass = (error?: string) =>
    `rounded-md border px-4 py-2.5 outline-none transition-colors ${
      error
        ? 'border-red-500 bg-red-50 focus:border-red-500'
        : 'border-gray-300 focus:border-accent_soft_black'
    }`;

  const handleNext = async (e: FormEvent) => {
    e.preventDefault();

    if (!isAddressVerified) {
      const result = await addr.validate({
        address: address.full_address,
        city: address.city,
        state: address.province,
        zip: address.postal_code,
      });
      if (!result.valid) {
        toast.error('Please fix the address errors before continuing.');
        addrInputRef.current?.focus();
        return;
      }
      setIsAddressVerified(true);
    }

    if (!data.is_same_address && !isMailingVerified) {
      const hasMailingData =
        mailingAddress.full_address?.trim() ||
        mailingAddress.city?.trim() ||
        mailingAddress.province?.trim() ||
        mailingAddress.postal_code?.trim();

      if (hasMailingData) {
        const result = await mail.validate({
          address: mailingAddress.full_address,
          city: mailingAddress.city,
          state: mailingAddress.province,
          zip: mailingAddress.postal_code,
        });
        if (!result.valid) {
          toast.error('Please fix the mailing address errors before continuing.');
          mailInputRef.current?.focus();
          return;
        }
        setIsMailingVerified(true);
      }
    }

    next();
  };

  const renderSuggestionsList = (
    suggestions: AddressSuggestion[],
    show: boolean,
    highlight: number,
    setHighlight: React.Dispatch<React.SetStateAction<number>>,
    onSelect: (s: AddressSuggestion) => void
  ) => {
    if (!show || suggestions.length === 0) return null;
    return (
      <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
        {suggestions.map((suggestion, index) => (
          <li key={suggestion.id}>
            <button
              type="button"
              onMouseEnter={() => setHighlight(index)}
              onClick={() => onSelect(suggestion)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                index === highlight ? 'bg-accent_bluish_gray' : 'hover:bg-gray-50'
              }`}
            >
              <MapPin className="size-4 shrink-0 text-gray-500" />
              <span className="min-w-0 truncate">
                <span className="font-semibold text-accent_soft_black">{suggestion.mainText}</span>
                {suggestion.secondaryText && (
                  <span className="ml-1 font-normal text-gray-500">{suggestion.secondaryText}</span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <form onSubmit={handleNext} className="mx-auto text-sm">
      <div className="rounded-lg border bg-white p-7">
        <h1 className="mb-4 text-xl font-medium">Contact</h1>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Phone Number <span className="text-base text-red-500">*</span>
            </label>
            <PhoneNumberInput
              value={data.phone_number}
              setValue={(value: any) => setData({ ...data, phone_number: value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Home Phone</label>
            <PhoneNumberInput
              value={data.home_phone_number}
              setValue={(value: any) => setData({ ...data, home_phone_number: value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Preferred Email
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              value={data.preferred_email}
              onChange={(e) => setData({ ...data, preferred_email: e.target.value })}
              required
              type="email"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>
      </div>

      <div className="my-7 rounded-lg border bg-white p-7">
        <h1 className="mb-4 text-xl font-medium">Address</h1>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2" ref={addrWrapperRef}>
            <label className="text-accent_soft_black">
              Address Line<span className="text-base text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={addrInputRef}
                maxLength={60}
                type="text"
                value={address.full_address}
                onChange={(e) => handleAddrChange(e.target.value)}
                onFocus={() => {
                  if (addr.suggestions.length > 0) setShowAddrSuggestions(true);
                }}
                onKeyDown={handleAddrKeyDown}
                autoComplete="off"
                placeholder="Enter your address"
                required
                aria-invalid={!!addr.fieldErrors.address}
                className={`w-full ${inputClass(addr.fieldErrors.address)}`}
              />

              {renderSuggestionsList(
                addr.suggestions,
                showAddrSuggestions,
                addrHighlight,
                setAddrHighlight,
                handleAddrSelect
              )}
            </div>
            {addr.fieldErrors.address && (
              <p className="mt-1 text-xs text-red-600">{addr.fieldErrors.address}</p>
            )}
            {!addr.fieldErrors.address && isAddressVerified && address.full_address && (
              <p className="mt-1 text-xs text-green-600">Address verified.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              State <span className="text-base text-red-500">*</span>
            </label>
            <select
              value={address.province}
              onChange={(e) => {
                setAddress({ ...address, province: e.target.value });
                addr.clearFieldError('state');
                setIsAddressVerified(false);
              }}
              required
              className={inputClass(addr.fieldErrors.state)}
            >
              <option value="">Select</option>
              {USStates.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.title}
                </option>
              ))}
            </select>
            {addr.fieldErrors.state && (
              <p className="mt-1 text-xs text-red-600">{addr.fieldErrors.state}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              City <span className="text-base text-red-500">*</span>
            </label>
            <input
              maxLength={40}
              type="text"
              value={address.city}
              required
              onChange={(e) => {
                setAddress({ ...address, city: e.target.value });
                addr.clearFieldError('city');
                setIsAddressVerified(false);
              }}
              className={inputClass(addr.fieldErrors.city)}
            />
            {addr.fieldErrors.city && (
              <p className="mt-1 text-xs text-red-600">{addr.fieldErrors.city}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Zip code <span className="text-base text-red-500">*</span>
            </label>
            <input
              maxLength={20}
              value={address.postal_code}
              onChange={(e) => {
                setAddress({ ...address, postal_code: e.target.value });
                addr.clearFieldError('zip');
                setIsAddressVerified(false);
              }}
              required
              type="text"
              className={inputClass(addr.fieldErrors.zip)}
            />
            {addr.fieldErrors.zip && (
              <p className="mt-1 text-xs text-red-600">{addr.fieldErrors.zip}</p>
            )}
          </div>
        </div>
        <div>
          <h1 className="my-4 text-xl font-medium">Mailing Address</h1>
          <div className="my-4 flex items-center gap-3">
            <SmoothCheckbox
              htmlFor="is_same_address"
              checked={data.is_same_address}
              onCheckedChange={(e) => setData({ ...data, is_same_address: e })}
            />
            <label htmlFor="is_same_address">Same as Address</label>
          </div>
          {!data?.is_same_address && (
            <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="flex flex-col gap-2" ref={mailWrapperRef}>
                <label className="text-accent_soft_black">Address</label>
                <div className="relative">
                  <input
                    ref={mailInputRef}
                    maxLength={60}
                    type="text"
                    value={mailingAddress.full_address}
                    onChange={(e) => handleMailChange(e.target.value)}
                    onFocus={() => {
                      if (mail.suggestions.length > 0) setShowMailSuggestions(true);
                    }}
                    onKeyDown={handleMailKeyDown}
                    autoComplete="off"
                    placeholder="Enter your address"
                    aria-invalid={!!mail.fieldErrors.address}
                    className={`w-full ${inputClass(mail.fieldErrors.address)}`}
                  />
                  {renderSuggestionsList(
                    mail.suggestions,
                    showMailSuggestions,
                    mailHighlight,
                    setMailHighlight,
                    handleMailSelect
                  )}
                </div>
                {mail.fieldErrors.address && (
                  <p className="mt-1 text-xs text-red-600">{mail.fieldErrors.address}</p>
                )}
                {!mail.fieldErrors.address && isMailingVerified && mailingAddress.full_address && (
                  <p className="mt-1 text-xs text-green-600">Address verified.</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">State</label>
                <select
                  value={mailingAddress.province}
                  onChange={(e) => {
                    setMailingAddress({ ...mailingAddress, province: e.target.value });
                    mail.clearFieldError('state');
                    setIsMailingVerified(false);
                  }}
                  className={inputClass(mail.fieldErrors.state)}
                >
                  <option value="">Select</option>
                  {USStates.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.title}
                    </option>
                  ))}
                </select>
                {mail.fieldErrors.state && (
                  <p className="mt-1 text-xs text-red-600">{mail.fieldErrors.state}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">City</label>
                <input
                  maxLength={40}
                  type="text"
                  value={mailingAddress.city}
                  onChange={(e) => {
                    setMailingAddress({ ...mailingAddress, city: e.target.value });
                    mail.clearFieldError('city');
                    setIsMailingVerified(false);
                  }}
                  className={inputClass(mail.fieldErrors.city)}
                />
                {mail.fieldErrors.city && (
                  <p className="mt-1 text-xs text-red-600">{mail.fieldErrors.city}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-accent_soft_black">Zip Code</label>
                <input
                  maxLength={20}
                  type="text"
                  value={mailingAddress.postal_code}
                  onChange={(e) => {
                    setMailingAddress({ ...mailingAddress, postal_code: e.target.value });
                    mail.clearFieldError('zip');
                    setIsMailingVerified(false);
                  }}
                  className={inputClass(mail.fieldErrors.zip)}
                />
                {mail.fieldErrors.zip && (
                  <p className="mt-1 text-xs text-red-600">{mail.fieldErrors.zip}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="my-7 rounded-lg border bg-white p-7">
        <h1 className="mb-4 text-xl font-medium">Emergency Contact</h1>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Contact Name <span className="text-base text-red-500">*</span>
            </label>
            <input
              maxLength={40}
              value={data.emergency_contact_name}
              onChange={(e) =>
                setData({
                  ...data,
                  emergency_contact_name: e.target.value,
                })
              }
              required
              type="text"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Relationship <span className="text-base text-red-500">*</span>
            </label>
            <input
              maxLength={40}
              value={data.emergency_contact_relationship}
              onChange={(e) =>
                setData({
                  ...data,
                  emergency_contact_relationship: e.target.value,
                })
              }
              required
              type="text"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Emergency Phone <span className="text-base text-red-500">*</span>
            </label>
            <PhoneNumberInput
              value={data.emergency_phone_number}
              setValue={(value: any) => setData({ ...data, emergency_phone_number: value })}
            />
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <button
          onClick={prev}
          disabled={currentStep === 1}
          className={`rounded-md border px-6 py-2 ${
            currentStep === 1
              ? 'cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400'
              : 'border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50'
          } `}
        >
          Previous
        </button>

        <button
          type="submit"
          disabled={addr.isValidating || mail.isValidating}
          className={`rounded-md px-6 py-2 text-white ${
            addr.isValidating || mail.isValidating
              ? 'cursor-not-allowed bg-indigo-400'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {addr.isValidating || mail.isValidating
            ? 'Validating...'
            : currentStep === steps.length
              ? 'Finish'
              : 'Next'}
        </button>
      </div>
    </form>
  );
};

export default Address;
