import PhoneNumberInput from '@/app/dashboard/hris/employee/employees/_components/PhoneNumberInput';
import { useAddressValidator } from '@/hooks/useAddressValidator';
import type { AddressSuggestion } from '@/hooks/useAddressValidator';
import { USStates } from '@/lib/helpers/UsaStates';
import { Loader2, MapPin } from 'lucide-react';
import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import SmoothCheckbox from '@/components/ui/SmoothCheckbox';
import {
  onboardingTextInputClassName,
  onboardingNativeSelectClassName,
  onboardingSelectEmptyTextClass,
} from './onboardingInputStyles';
import {
  emailError,
  fieldErrorClass,
  optionalPhoneError,
  phoneError,
  requiredTextError,
} from './onboardingFormUtils';

function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function ReqOpt({ required }: { required: boolean }) {
  return (
    <span className="ml-1 text-xs font-normal text-gray-500">
      ({required ? 'Required' : 'Optional'})
    </span>
  );
}

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
  const [blurred, setBlurred] = useState<Record<string, boolean>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  const [isAddrVerified, setIsAddrVerified] = useState(false);
  const [showAddrSuggestions, setShowAddrSuggestions] = useState(false);
  const [addrHighlight, setAddrHighlight] = useState(-1);
  const addrWrapperRef = useRef<HTMLDivElement>(null);
  const addrInputRef = useRef<HTMLInputElement>(null);

  const [isMailVerified, setIsMailVerified] = useState(false);
  const [showMailSuggestions, setShowMailSuggestions] = useState(false);
  const [mailHighlight, setMailHighlight] = useState(-1);
  const mailWrapperRef = useRef<HTMLDivElement>(null);
  const mailInputRef = useRef<HTMLInputElement>(null);

  const addr = useAddressValidator();
  const mail = useAddressValidator();

  const markBlur = (key: string) => setBlurred((b) => ({ ...b, [key]: true }));
  const show = (key: string) => blurred[key] || showAllErrors;

  const errors = useMemo(() => {
    return {
      phone_number: phoneError(data?.phone_number, true),
      home_phone_number: optionalPhoneError(data?.home_phone_number),
      personal_email: emailError(data?.personal_email, false),
      preferred_email: emailError(data?.preferred_email, true),
      full_address: requiredTextError(address?.full_address),
      province: requiredTextError(address?.province),
      city: requiredTextError(address?.city),
      postal_code: requiredTextError(address?.postal_code),
      emergency_contact_name: requiredTextError(data?.emergency_contact_name),
      emergency_contact_relationship: requiredTextError(data?.emergency_contact_relationship),
      emergency_phone_number: phoneError(data?.emergency_phone_number, true),
    };
  }, [data, address]);

  const contactComplete =
    !errors.phone_number &&
    !errors.home_phone_number 

  const addressBlockComplete =
    !errors.full_address && !errors.province && !errors.city && !errors.postal_code;

  const emergencyComplete =
    !errors.emergency_contact_name &&
    !errors.emergency_contact_relationship &&
    !errors.emergency_phone_number;

  const formValid = contactComplete && addressBlockComplete && emergencyComplete;

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
    setIsAddrVerified(false);
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
    setIsAddrVerified(true);
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
    setIsMailVerified(false);
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
    setIsMailVerified(true);
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

  const addrInputClass = (smartyError?: string) =>
    `${onboardingTextInputClassName} ${smartyError ? fieldErrorClass : ''}`;

  const formInputClass = (key: keyof typeof errors, err: string | null) =>
    `${onboardingTextInputClassName} ${show(key) && err ? fieldErrorClass : ''}`;

  const renderSuggestionsList = (
    suggestions: AddressSuggestion[],
    showList: boolean,
    highlight: number,
    setHighlight: React.Dispatch<React.SetStateAction<number>>,
    onSelect: (s: AddressSuggestion) => void
  ) => {
    if (!showList || suggestions.length === 0) return null;
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async (e: FormEvent) => {
    e.preventDefault();
    setShowAllErrors(true);
    if (!formValid) return;

    setIsSubmitting(true);
    try {
      if (!isAddrVerified) {
        const result = await addr.validate({
          address: address.full_address,
          city: address.city,
          state: address.province,
          zip: address.postal_code,
        });
        if (!result.valid) {
          addrInputRef.current?.focus();
          return;
        }
        setIsAddrVerified(true);
      }

      if (!data.is_same_address && !isMailVerified) {
        const hasMailData =
          mailingAddress.full_address?.trim() ||
          mailingAddress.city?.trim() ||
          mailingAddress.province?.trim() ||
          mailingAddress.postal_code?.trim();

        if (hasMailData) {
          const result = await mail.validate({
            address: mailingAddress.full_address,
            city: mailingAddress.city,
            state: mailingAddress.province,
            zip: mailingAddress.postal_code,
          });
          if (!result.valid) {
            mailInputRef.current?.focus();
            return;
          }
          setIsMailVerified(true);
        }
      }

      next();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleNext} className="mx-auto text-sm" noValidate>
      <div className="my-4 rounded-3xl border border-white bg-[#FFFFFF66] p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-medium">Contact</h1>
          {contactComplete && (
            <span className="text-sm font-medium text-emerald-600">&#10003; Saved</span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Phone Number
              <ReqOpt required />
            </label>
            <PhoneNumberInput
              onboarding
              placeholder="Enter phone number"
              value={data.phone_number}
              setValue={(value: any) => setData({ ...data, phone_number: value })}
            />
            <FieldError message={show('phone_number') ? errors.phone_number : null} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Home Phone
              <ReqOpt required={false} />
            </label>
            <PhoneNumberInput
              onboarding
              placeholder="Enter home phone"
              value={data.home_phone_number}
              setValue={(value: any) => setData({ ...data, home_phone_number: value })}
            />
            <FieldError message={show('home_phone_number') ? errors.home_phone_number : null} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Personal Email
              <ReqOpt required={false} />
            </label>
            <input
              type="email"
              value={data.personal_email}
              onChange={(e) => setData({ ...data, personal_email: e.target.value })}
              onBlur={() => markBlur('personal_email')}
              placeholder="name@example.com"
              className={formInputClass('personal_email', errors.personal_email)}
            />
            <FieldError message={show('personal_email') ? errors.personal_email : null} />
          </div>
          {/* <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Preferred Email
              <ReqOpt required />
            </label>
            <input
              value={data.preferred_email}
              onChange={(e) => setData({ ...data, preferred_email: e.target.value })}
              onBlur={() => markBlur('preferred_email')}
              type="email"
              placeholder="name@example.com"
              className={formInputClass('preferred_email', errors.preferred_email)}
            />
            <FieldError message={show('preferred_email') ? errors.preferred_email : null} />
          </div> */}
        </div>
      </div>

      <div className="my-7 rounded-3xl border border-white bg-[#FFFFFF66] p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-medium">Address</h1>
          {addressBlockComplete && isAddrVerified && (
            <span className="text-sm font-medium text-emerald-600">&#10003; Verified</span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2" ref={addrWrapperRef}>
            <label className="text-accent_soft_black">
              Address Line
              <ReqOpt required />
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
                onBlur={() => markBlur('full_address')}
                autoComplete="off"
                placeholder="Enter your address"
                aria-invalid={!!addr.fieldErrors.address}
                className={`w-full ${addr.fieldErrors.address ? `${onboardingTextInputClassName} ${fieldErrorClass}` : formInputClass('full_address', errors.full_address)}`}
              />

              {renderSuggestionsList(
                addr.suggestions,
                showAddrSuggestions,
                addrHighlight,
                setAddrHighlight,
                handleAddrSelect
              )}
            </div>
            {addr.fieldErrors.address ? (
              <p className="mt-1 text-xs text-red-600">{addr.fieldErrors.address}</p>
            ) : (
              <FieldError message={show('full_address') ? errors.full_address : null} />
            )}
            {!addr.fieldErrors.address && isAddrVerified && address.full_address && (
              <p className="mt-1 text-xs text-green-600">Address verified.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              State
              <ReqOpt required />
            </label>
            <select
              value={address.province}
              onChange={(e) => {
                setAddress({ ...address, province: e.target.value });
                addr.clearFieldError('state');
                setIsAddrVerified(false);
              }}
              onBlur={() => markBlur('province')}
              className={`${onboardingNativeSelectClassName} ${!address.province ? onboardingSelectEmptyTextClass : ''} ${addr.fieldErrors.state || (show('province') && errors.province) ? fieldErrorClass : ''}`}
            >
              <option value="">Select state</option>
              {USStates.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.title}
                </option>
              ))}
            </select>
            {addr.fieldErrors.state ? (
              <p className="mt-1 text-xs text-red-600">{addr.fieldErrors.state}</p>
            ) : (
              <FieldError message={show('province') ? errors.province : null} />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              City
              <ReqOpt required />
            </label>
            <input
              maxLength={40}
              type="text"
              value={address.city}
              onChange={(e) => {
                setAddress({ ...address, city: e.target.value });
                addr.clearFieldError('city');
                setIsAddrVerified(false);
              }}
              onBlur={() => markBlur('city')}
              placeholder="City"
              className={`${onboardingTextInputClassName} ${addr.fieldErrors.city || (show('city') && errors.city) ? fieldErrorClass : ''}`}
            />
            {addr.fieldErrors.city ? (
              <p className="mt-1 text-xs text-red-600">{addr.fieldErrors.city}</p>
            ) : (
              <FieldError message={show('city') ? errors.city : null} />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Zip code
              <ReqOpt required />
            </label>
            <input
              maxLength={20}
              value={address.postal_code}
              onChange={(e) => {
                setAddress({ ...address, postal_code: e.target.value });
                addr.clearFieldError('zip');
                setIsAddrVerified(false);
              }}
              onBlur={() => markBlur('postal_code')}
              type="text"
              placeholder="ZIP or postal code"
              className={`${onboardingTextInputClassName} ${addr.fieldErrors.zip || (show('postal_code') && errors.postal_code) ? fieldErrorClass : ''}`}
            />
            {addr.fieldErrors.zip ? (
              <p className="mt-1 text-xs text-red-600">{addr.fieldErrors.zip}</p>
            ) : (
              <FieldError message={show('postal_code') ? errors.postal_code : null} />
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
                    className={`w-full ${addrInputClass(mail.fieldErrors.address)}`}
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
                {!mail.fieldErrors.address && isMailVerified && mailingAddress.full_address && (
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
                    setIsMailVerified(false);
                  }}
                  className={`${onboardingNativeSelectClassName} ${!mailingAddress.province ? onboardingSelectEmptyTextClass : ''} ${mail.fieldErrors.state ? fieldErrorClass : ''}`}
                >
                  <option value="">Select state</option>
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
                    setIsMailVerified(false);
                  }}
                  placeholder="City"
                  className={`${onboardingTextInputClassName} ${mail.fieldErrors.city ? fieldErrorClass : ''}`}
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
                    setIsMailVerified(false);
                  }}
                  placeholder="ZIP or postal code"
                  className={`${onboardingTextInputClassName} ${mail.fieldErrors.zip ? fieldErrorClass : ''}`}
                />
                {mail.fieldErrors.zip && (
                  <p className="mt-1 text-xs text-red-600">{mail.fieldErrors.zip}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="my-7 rounded-3xl border border-white bg-[#FFFFFF66] p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-medium">Emergency Contact</h1>
          {emergencyComplete && (
            <span className="text-sm font-medium text-emerald-600">&#10003; Saved</span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Contact Name
              <ReqOpt required />
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
              onBlur={() => markBlur('emergency_contact_name')}
              type="text"
              placeholder="Full name"
              className={formInputClass('emergency_contact_name', errors.emergency_contact_name)}
            />
            <FieldError
              message={show('emergency_contact_name') ? errors.emergency_contact_name : null}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Relationship
              <ReqOpt required />
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
              onBlur={() => markBlur('emergency_contact_relationship')}
              type="text"
              placeholder="e.g. Spouse, Parent"
              className={formInputClass(
                'emergency_contact_relationship',
                errors.emergency_contact_relationship
              )}
            />
            <FieldError
              message={
                show('emergency_contact_relationship')
                  ? errors.emergency_contact_relationship
                  : null
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Emergency Phone
              <ReqOpt required />
            </label>
            <PhoneNumberInput
              onboarding
              placeholder="Emergency contact phone"
              value={data.emergency_phone_number}
              setValue={(value: any) => setData({ ...data, emergency_phone_number: value })}
            />
            <FieldError
              message={show('emergency_phone_number') ? errors.emergency_phone_number : null}
            />
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-between">
        <button
          type="button"
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
          disabled={!formValid || isSubmitting || addr.isValidating || mail.isValidating}
          className={`rounded-md px-6 py-2 text-white ${
            formValid && !isSubmitting && !addr.isValidating && !mail.isValidating
              ? 'bg-[#02143A] hover:opacity-95'
              : 'cursor-not-allowed bg-gray-400'
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
