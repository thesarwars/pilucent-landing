import SmoothCheckbox from '@/components/ui/SmoothCheckbox';
import { useAddressValidator } from '@/hooks/useAddressValidator';
import type { AddressSuggestion } from '@/hooks/useAddressValidator';
import { USStates } from '@/lib/helpers/UsaStates';
import React, { useEffect, useRef, useState } from 'react';
import PhoneNumberInput from './PhoneNumberInput';
import { toast } from '@/lib/ToastService';
import { patchEmployee, patchEmployeeAddress, postEmployeeAddress } from '@/app/helpers/backend';
import Button from '@/components/ui/RawButton';
import { FiEdit } from 'react-icons/fi';
import { Loader2, MapPin } from 'lucide-react';
import LogoLoader from '@/components/MainLoader/logo-loader';

const Address = ({
  view = false,
  Employee,
  isPending,
  refetch,
  uid = '',
}: {
  view?: boolean;
  Employee: any;
  isPending?: boolean;
  refetch?: any;
  uid?: string;
}) => {
  const [isDisabled1, setIsDisabled1] = useState(true);
  const [isDisabled2, setIsDisabled2] = useState(true);
  const [isDisabled3, setIsDisabled3] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [address, setAddress] = useState<any>({ is_shipping: true });
  const [mailingAddress, setMailingAddress] = useState<any>({});
  const [data, setData] = useState<any>({});
  const [RenderAgain, setRenderAgain] = useState(false);

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

  useEffect(() => {
    if (!isPending) {
      setData({ ...Employee });
      const shippingAddress = Employee?.addresses?.find((a: any) => a.is_shipping);
      const mailAddr = Employee?.addresses?.find(
        (a: any) => !a.is_work_address && !a.is_shipping,
      );
      if (shippingAddress) {
        setAddress((prev: any) => ({ ...prev, ...shippingAddress }));
        setIsAddrVerified(!!shippingAddress.full_address);
      }
      if (mailAddr) {
        setMailingAddress((prev: any) => ({ ...prev, ...mailAddr }));
        setIsMailVerified(!!mailAddr.full_address);
      }
    }
  }, [Employee, isPending, RenderAgain]);

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

  const inputClass = (error?: string, disabled?: boolean) =>
    `rounded-md border px-4 py-2.5 outline-none transition-colors ${
      error
        ? 'border-red-500 bg-red-50 focus:border-red-500'
        : 'border-gray-300 focus:border-accent_soft_black'
    } ${disabled ? 'bg-gray-50 text-gray-500' : ''}`;

  const UpdateEmployee = async (formData: FormData, preToast = 'Profile image', next: any) => {
    if (!uid) return toast.error('Employee not found!');
    try {
      setIsUpdating(true);
      const res = await patchEmployee(uid, formData);
      if (res?.success) {
        toast.success(`${preToast} updated`);
        refetch && refetch();
        next();
      }
    } catch (error) {
      //err
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!isAddrVerified) {
      const result = await addr.validate({
        address: address.full_address,
        city: address.city,
        state: address.province,
        zip: address.postal_code,
      });
      if (!result.valid) {
        toast.error('Please fix the address errors before saving.');
        addrInputRef.current?.focus();
        return;
      }
      setIsAddrVerified(true);
    }

    if (!data.is_same_address && !isMailVerified) {
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
          toast.error('Please fix the mailing address errors before saving.');
          mailInputRef.current?.focus();
          return;
        }
        setIsMailVerified(true);
      }
    }

    try {
      setIsUpdating(true);
      let res;
      let res1;
      if (Employee?.is_same_address != data?.is_same_address) {
        const formData = new FormData();
        formData.append('is_same_address', data?.is_same_address);
        await patchEmployee(Employee?.uid, formData);
      }
      if (address?.uid) {
        res = await patchEmployeeAddress(address?.uid, address);
      } else {
        res = await postEmployeeAddress({ ...address, employee_uid: uid });
      }
      if (mailingAddress?.uid) {
        res1 = await patchEmployeeAddress(mailingAddress?.uid, mailingAddress);
      } else {
        res1 = await postEmployeeAddress({
          ...mailingAddress,
          employee_uid: uid,
        });
      }
      if (res?.success && res1?.success) {
        setIsDisabled2(true);
        setRenderAgain(!RenderAgain);
        refetch && refetch();
        toast.success('Address updated.');
      }
    } catch (error) {
      //err
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveContact = () => {
    const formData = new FormData();
    formData.append('phone_number', data?.phone_number);
    formData.append('home_phone_number', data?.home_phone_number);
    formData.append('personal_email', data?.personal_email);
    formData.append('preferred_email', data?.preferred_email);
    UpdateEmployee(formData, 'Contact', () => setIsDisabled1(true));
  };

  const handleSaveEmergencyContact = () => {
    const formData = new FormData();
    formData.append('emergency_contact_name', data?.emergency_contact_name);
    formData.append('emergency_contact_relationship', data?.emergency_contact_relationship);
    formData.append('emergency_phone_number', data?.emergency_phone_number);
    UpdateEmployee(formData, 'Emergency contact', () => setIsDisabled3(true));
  };

  const handleUseAddress = (checked: boolean) => {
    if (checked) {
      setMailingAddress({
        ...mailingAddress,
        city: address?.city,
        province: address?.province,
        postal_code: address?.postal_code,
        full_address: address?.full_address,
      });
    }
  };

  const renderSuggestionsList = (
    suggestions: AddressSuggestion[],
    show: boolean,
    highlight: number,
    setHighlight: React.Dispatch<React.SetStateAction<number>>,
    onSelect: (s: AddressSuggestion) => void,
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
    );
  };

  if (isPending) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LogoLoader size={120} color={'#16151c'} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full text-sm">
      <div className="rounded-lg border bg-white/60 p-7">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-xl font-medium">Contact</h1>
          {isDisabled1 && !view && (
            <Button
              onClick={() => {
                setIsDisabled3(true);
                setIsDisabled2(true);
                setIsDisabled1(false);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Phone Number (Primary)<span className="text-base text-red-500">* </span>
            </label>
            <PhoneNumberInput
              value={data?.phone_number}
              disabled={isDisabled1}
              setValue={(value: any) => setData({ ...data, phone_number: value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Home Phone</label>
            <PhoneNumberInput
              disabled={isDisabled1}
              value={data?.home_phone_number}
              setValue={(value: any) => setData({ ...data, home_phone_number: value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Personal Email (Primary)<span className="text-base text-red-500">* </span>
            </label>
            <input
              disabled={isDisabled1}
              type="email"
              required
              value={data?.personal_email}
              onChange={(e) => setData({ ...data, personal_email: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Preferred Email
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              disabled={isDisabled1}
              value={data?.preferred_email}
              onChange={(e) => setData({ ...data, preferred_email: e.target.value })}
              required
              type="email"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>

        {!isDisabled1 && (
          <div className="items mt-4 flex gap-4">
            <Button
              isLoading={isUpdating}
              onClick={handleSaveContact}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled1(true);
                setRenderAgain(!RenderAgain);
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="my-7 rounded-lg border bg-white/60 p-7">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-xl font-medium">Address</h1>
          {isDisabled2 && !view && (
            <Button
              onClick={() => {
                setIsDisabled3(true);
                setIsDisabled2(false);
                setIsDisabled1(true);
                addr.clearAllErrors();
                mail.clearAllErrors();
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2" ref={addrWrapperRef}>
            <label className="text-accent_soft_black">
              Address Line<span className="text-base text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={addrInputRef}
                disabled={isDisabled2}
                maxLength={60}
                type="text"
                value={address?.full_address}
                onChange={(e) => handleAddrChange(e.target.value)}
                onFocus={() => {
                  if (!isDisabled2 && addr.suggestions.length > 0) setShowAddrSuggestions(true);
                }}
                onKeyDown={handleAddrKeyDown}
                autoComplete="off"
                placeholder={isDisabled2 ? '' : 'Enter your address'}
                required
                aria-invalid={!!addr.fieldErrors.address}
                className={`w-full ${inputClass(addr.fieldErrors.address, isDisabled2)}`}
              />
          
              {!isDisabled2 &&
                renderSuggestionsList(
                  addr.suggestions,
                  showAddrSuggestions,
                  addrHighlight,
                  setAddrHighlight,
                  handleAddrSelect,
                )}
            </div>
            {addr.fieldErrors.address && (
              <p className="mt-1 text-xs text-red-600">{addr.fieldErrors.address}</p>
            )}
            {!addr.fieldErrors.address && isAddrVerified && address?.full_address && !isDisabled2 && (
              <p className="mt-1 text-xs text-green-600">Address verified.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              State <span className="text-base text-red-500">*</span>
            </label>
            <select
              disabled={isDisabled2}
              value={address?.province}
              onChange={(e) => {
                setAddress({ ...address, province: e.target.value });
                addr.clearFieldError('state');
                setIsAddrVerified(false);
              }}
              required
              className={inputClass(addr.fieldErrors.state, isDisabled2)}
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
              disabled={isDisabled2}
              maxLength={40}
              type="text"
              value={address?.city}
              required
              onChange={(e) => {
                setAddress({ ...address, city: e.target.value });
                addr.clearFieldError('city');
                setIsAddrVerified(false);
              }}
              className={inputClass(addr.fieldErrors.city, isDisabled2)}
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
              disabled={isDisabled2}
              maxLength={20}
              value={address?.postal_code}
              onChange={(e) => {
                setAddress({ ...address, postal_code: e.target.value });
                addr.clearFieldError('zip');
                setIsAddrVerified(false);
              }}
              required
              type="text"
              className={inputClass(addr.fieldErrors.zip, isDisabled2)}
            />
            {addr.fieldErrors.zip && (
              <p className="mt-1 text-xs text-red-600">{addr.fieldErrors.zip}</p>
            )}
          </div>
        </div>
        <div className="my-4 flex items-center gap-3">
          <SmoothCheckbox
            disabled={isDisabled2}
            htmlFor="is_same_address"
            onCheckedChange={(e) => {
              handleUseAddress(e);
              setData({ ...data, is_same_address: e });
            }}
            checked={data?.is_same_address}
          />
          <label htmlFor="is_same_address">Same as Shipping/Billing Address</label>
        </div>
        {!data?.is_same_address && (
          <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="flex flex-col gap-2" ref={mailWrapperRef}>
              <label className="text-accent_soft_black">Mailing Address</label>
              <div className="relative">
                <input
                  ref={mailInputRef}
                  disabled={isDisabled2}
                  maxLength={60}
                  type="text"
                  value={mailingAddress?.full_address}
                  onChange={(e) => handleMailChange(e.target.value)}
                  onFocus={() => {
                    if (!isDisabled2 && mail.suggestions.length > 0) setShowMailSuggestions(true);
                  }}
                  onKeyDown={handleMailKeyDown}
                  autoComplete="off"
                  placeholder={isDisabled2 ? '' : 'Enter your address'}
                  aria-invalid={!!mail.fieldErrors.address}
                  className={`w-full ${inputClass(mail.fieldErrors.address, isDisabled2)}`}
                />
           
                {!isDisabled2 &&
                  renderSuggestionsList(
                    mail.suggestions,
                    showMailSuggestions,
                    mailHighlight,
                    setMailHighlight,
                    handleMailSelect,
                  )}
              </div>
              {mail.fieldErrors.address && (
                <p className="mt-1 text-xs text-red-600">{mail.fieldErrors.address}</p>
              )}
              {!mail.fieldErrors.address && isMailVerified && mailingAddress?.full_address && !isDisabled2 && (
                <p className="mt-1 text-xs text-green-600">Address verified.</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">Mailing State</label>
              <select
                disabled={isDisabled2}
                value={mailingAddress?.province}
                onChange={(e) => {
                  setMailingAddress({ ...mailingAddress, province: e.target.value });
                  mail.clearFieldError('state');
                  setIsMailVerified(false);
                }}
                className={inputClass(mail.fieldErrors.state, isDisabled2)}
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
              <label className="text-accent_soft_black">Mailing City</label>
              <input
                disabled={isDisabled2}
                maxLength={40}
                type="text"
                value={mailingAddress?.city}
                onChange={(e) => {
                  setMailingAddress({ ...mailingAddress, city: e.target.value });
                  mail.clearFieldError('city');
                  setIsMailVerified(false);
                }}
                className={inputClass(mail.fieldErrors.city, isDisabled2)}
              />
              {mail.fieldErrors.city && (
                <p className="mt-1 text-xs text-red-600">{mail.fieldErrors.city}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">Mailing Zip Code</label>
              <input
                disabled={isDisabled2}
                maxLength={20}
                type="text"
                value={mailingAddress?.postal_code}
                onChange={(e) => {
                  setMailingAddress({ ...mailingAddress, postal_code: e.target.value });
                  mail.clearFieldError('zip');
                  setIsMailVerified(false);
                }}
                className={inputClass(mail.fieldErrors.zip, isDisabled2)}
              />
              {mail.fieldErrors.zip && (
                <p className="mt-1 text-xs text-red-600">{mail.fieldErrors.zip}</p>
              )}
            </div>
          </div>
        )}
        {!isDisabled2 && (
          <div className="items mt-4 flex gap-4">
            <Button
              isLoading={isUpdating || addr.isValidating || mail.isValidating}
              disabled={isUpdating || addr.isValidating || mail.isValidating}
              onClick={handleSaveAddress}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {addr.isValidating || mail.isValidating
                ? 'Validating...'
                : isUpdating
                  ? 'Saving...'
                  : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled2(true);
                setRenderAgain(!RenderAgain);
                addr.clearAllErrors();
                mail.clearAllErrors();
                addr.clearSuggestions();
                mail.clearSuggestions();
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="my-7 rounded-lg border bg-white/60 p-7">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-xl font-medium">Emergency Contact</h1>
          {isDisabled3 && !view && (
            <Button
              onClick={() => {
                setIsDisabled3(false);
                setIsDisabled2(true);
                setIsDisabled1(true);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Contact Name <span className="text-base text-red-500">*</span>
            </label>
            <input
              maxLength={40}
              value={data?.emergency_contact_name}
              onChange={(e) =>
                setData({
                  ...data,
                  emergency_contact_name: e.target.value,
                })
              }
              disabled={isDisabled3}
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
              value={data?.emergency_contact_relationship}
              onChange={(e) =>
                setData({
                  ...data,
                  emergency_contact_relationship: e.target.value,
                })
              }
              disabled={isDisabled3}
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
              disabled={isDisabled3}
              value={data?.emergency_phone_number}
              setValue={(value: any) => setData({ ...data, emergency_phone_number: value })}
            />
          </div>
        </div>
        {!isDisabled3 && (
          <div className="items mt-4 flex gap-4">
            <Button
              isLoading={isUpdating}
              onClick={handleSaveEmergencyContact}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled3(true);
                setRenderAgain(!RenderAgain);
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Address;
