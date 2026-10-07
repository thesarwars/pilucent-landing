'use client';

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import Button from '@/components/ui/RawButton';
import { USStates } from '@/lib/helpers/UsaStates';
import { useAddressValidator } from '@/hooks/useAddressValidator';
import type { AddressSuggestion } from '@/hooks/useAddressValidator';
import {
  fetchOAuthToken,
  patchMoovAccount,
  postMoovAccount,
  postMoovCapabilities,
} from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import { toast } from '@/lib/ToastService';
import { collectErrorMessages } from '@/utils/flattenErrors';
import DotSpinner from '@/app/dashboard/hris/employee/employees/_components/dot-spinner';
import Link from 'next/link';

type MoovTermsOfServiceElement = HTMLElement & {
  token?: string;
  customActionCopy?: string;
  textColor?: string;
  linkColor?: string;
  backgroundColor?: string;
  fontSize?: string;
  onTermsOfServiceTokenReady?: (token: string) => void;
  onTermsOfServiceTokenError?: (error: unknown) => void;
};

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'moov-terms-of-service': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        >;
      }
    }
  }
}

const About = ({
  RenderAgain,
  setRenderAgain,
  handleNext,
  formData,
  setFormData,
  uid,
  industries,
}: {
  RenderAgain: any;
  setRenderAgain: any;
  handleNext: any;
  formData: any;
  uid: string;
  setFormData: any;
  industries: any[];
}) => {
  const { Company } = useAppSelector((state) => state.CompanyData);

  const [isPending, setIsPending] = useState(false);
  const loadingRef = useRef(false);
  const [moovScriptLoaded, setMoovScriptLoaded] = useState(false);
  const [moovAuthToken, setMoovAuthToken] = useState('');
  const [tosToken, setTosToken] = useState('');
  const [tosAccepted, setTosAccepted] = useState(false);
  const termsOfServicesRef = useRef<MoovTermsOfServiceElement | null>(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const addressWrapperRef = useRef<HTMLDivElement>(null);

  const [showSuggestions2, setShowSuggestions2] = useState(false);
  const [highlightIndex2, setHighlightIndex2] = useState(-1);
  const addressWrapperRef2 = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    isFetchingSuggestions,
    fetchSuggestions,
    selectSuggestion,
    clearSuggestions,
  } = useAddressValidator();

  const {
    suggestions: suggestions2,
    isFetchingSuggestions: isFetchingSuggestions2,
    fetchSuggestions: fetchSuggestions2,
    selectSuggestion: selectSuggestion2,
    clearSuggestions: clearSuggestions2,
  } = useAddressValidator();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addressWrapperRef.current && !addressWrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setHighlightIndex(-1);
      }
      if (
        addressWrapperRef2.current &&
        !addressWrapperRef2.current.contains(event.target as Node)
      ) {
        setShowSuggestions2(false);
        setHighlightIndex2(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0);
    setHighlightIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    setShowSuggestions2(suggestions2.length > 0);
    setHighlightIndex2(-1);
  }, [suggestions2]);

  const handleAddressChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, address_line1: value }));
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
    setFormData((prev: any) => ({
      ...prev,
      address_line1: details.street || details.mainText,
      city: details.city || prev.city,
      state_or_province: details.state || prev.state_or_province,
      postal_code: details.zip || prev.postal_code,
    }));
  };

  const handleAddressKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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

  const handleAddress2Change = (value: string) => {
    setFormData((prev: any) => ({ ...prev, address_line2: value }));
    if (!value.trim()) {
      clearSuggestions2();
      setShowSuggestions2(false);
      return;
    }
    fetchSuggestions2(value);
  };

  const handleSelectSuggestion2 = async (suggestion: AddressSuggestion) => {
    const details = await selectSuggestion2(suggestion);
    if (!details) return;
    setShowSuggestions2(false);
    setHighlightIndex2(-1);
    setFormData((prev: any) => ({
      ...prev,
      address_line2: details.street || details.mainText,
      city: details.city || prev.city,
      state_or_province: details.state || prev.state_or_province,
      postal_code: details.zip || prev.postal_code,
    }));
  };

  const handleAddress2KeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions2 || suggestions2.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex2((prev) => (prev + 1) % suggestions2.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex2((prev) => (prev <= 0 ? suggestions2.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (highlightIndex2 >= 0) {
        e.preventDefault();
        handleSelectSuggestion2(suggestions2[highlightIndex2]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions2(false);
      setHighlightIndex2(-1);
    }
  };

  const formatEIN = (num: any) => {
    const str = String(num || '').replace(/\D/g, '');
    if (str.length <= 2) return str;
    return `${str.slice(0, 2)}-${str.slice(2)}`;
  };

  const getMoovAuthToken = async () => {
    if (loadingRef.current) return;
    try {
      loadingRef.current = true;
      const res = await fetchOAuthToken();
      if (res?.access_token) {
        setMoovAuthToken(res?.access_token);
      }
    } catch (error) {
      toast.error('Failed to load Moov oAuth token.');
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    getMoovAuthToken();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.customElements?.whenDefined) return;

    let cancelled = false;
    void window.customElements.whenDefined('moov-terms-of-service').then(() => {
      if (!cancelled) setMoovScriptLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // const {data: moovCapabilites} = useFetch(
  //   ["capa"],
  //   () =>
  // )

  useEffect(() => {
    if (!moovScriptLoaded || !moovAuthToken) return;

    let isCancelled = false;

    const setupMoovDrop = async () => {
      try {
        if (typeof window !== 'undefined' && window.customElements?.whenDefined) {
          await window.customElements.whenDefined('moov-terms-of-service');
        }

        if (isCancelled) return;

        const el = termsOfServicesRef.current;

        if (!el) return;

        el.token = moovAuthToken;
        el.customActionCopy = 'By clicking continue';
        el.textColor = '#4B5563';
        el.linkColor = '#4F46E5';
        el.backgroundColor = '#FFFFFF';
        el.fontSize = '16px';

        el.onTermsOfServiceTokenReady = (generatedToken: string) => {
          setTosToken(generatedToken);
          console.log('generatedToken', generatedToken);
          setTosAccepted(true);
          toast.success('Terms accepted successfully.');
        };

        el.onTermsOfServiceTokenError = (error: unknown) => {
          console.error('Moov ToS token error:', error);
          setTosToken('');
          setTosAccepted(false);
          toast.error('Failed to accept Moov terms of service.');
        };
      } catch (error) {
        console.error('Failed to setup Moov ToS drop:', error);
      }
    };

    setupMoovDrop();

    return () => {
      isCancelled = true;
      const el = termsOfServicesRef.current;

      if (el) {
        el.onTermsOfServiceTokenReady = undefined;
        el.onTermsOfServiceTokenError = undefined;
      }
    };
  }, [moovScriptLoaded, moovAuthToken]);

  const handleError = (error: any) => {
    try {
      if (error?.response?.data?.message) {
        const errors = JSON.parse(error.response.data.message);
        const messages = collectErrorMessages(errors);

        messages?.forEach((message: string) => {
          toast.error(message);
        });
        return;
      }

      toast.error(error?.message || 'Something went wrong');
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  const getIndustryCodes = () => {
    const industry = industries.find((ind) => ind.industry === formData?.industry);

    return {
      mcc: industry?.default_mcc,
    };
  };

  const getCommonPayload = () => {
    return {
      profile: {
        business: {
          legal_business_name: formData?.legal_business_name,
          business_type: formData?.business_type,
          email: formData?.email,
          doingBusinessAs: formData?.legal_business_name,
          website: formData?.website,
          address: {
            address_line1: formData?.address_line1 || '',
            address_line2: formData?.address_line2 || '',
            city: formData?.city || '',
            state_or_province: formData?.state_or_province || '',
            postal_code: formData?.postal_code || '',
            country: formData?.country || 'US',
          },
          phone: {
            number: formData?.phone || '',
            country_code: '1',
          },
          industry_codes: getIndustryCodes(),
        },
      },
      customer_support: {
        phone: {
          number: formData?.phone || '',
          country_code: '1',
        },
        email: formData?.email,
        address: {
          address_line1: formData?.address_line1 || '',
          address_line2: formData?.address_line2 || '',
          city: formData?.city || '',
          state_or_province: formData?.state_or_province || '',
          postal_code: formData?.postal_code || '',
          country: formData?.country || 'US',
        },
      },
    };
  };

  const handleUpdate = async () => {
    try {
      if (!tosToken) {
        toast.error("Please accept Moov terms of service first.");
        return;
      }

      setIsPending(true);

      // Profile + terms of service in one backend PATCH. The ToS token is
      // accepted in this browser, so Moov requires it to be SUBMITTED from a
      // different address — i.e. our server. Submitting it from the browser
      // fails with "server address must not match client address".
      const res = await patchMoovAccount(uid, {
        ...getCommonPayload(),
        terms_of_service: { token: tosToken },
      });

      if (res?.success) {
        setRenderAgain(!RenderAgain);
        toast.success('Changes saved!');
        handleNext();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsPending(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    if (!tosToken) {
      toast.error("Please accept Moov terms of service first.");
      return;
    }

    if (uid) {
      await handleUpdate();
      return;
    }

    try {
      setIsPending(true);

      const data = {
        account_type: 'BUSINESS',
        ...getCommonPayload(),
        profile: {
          business: {
            ...getCommonPayload().profile.business,
            tax_id: {
              ein: {
                number: formatEIN(formData?.ein),
              },
            },
          },
        },
        metadata: {
          optional: 'metadata',
        },
        settings: {
          card_payment: {
            statement_descriptor: Company?.name,
          },
          ach_payment: {
            company_name: Company?.name,
          },
        },
        mode: 'PRODUCTION',
      };

      const res = await postMoovAccount(data);

      if (res?.error === false) {
        setRenderAgain(!RenderAgain);

        const accountId =
          res?.moov?.account_id ||
          res?.moov?.accountID ||
          res?.saved?.moov_account_uid;

        if (!accountId) {
          throw new Error('Account created but no account id was returned.');
        }

        // Accept ToS via our backend (submitted from the server, not this
        // browser that accepted it — Moov requires the two addresses to differ).
        const res1 = await patchMoovAccount(accountId, {
          terms_of_service: { token: tosToken },
        });

        if (res1?.success) {
          toast.success('Changes saved!');
        }

        const res2 = await postMoovCapabilities(accountId, {
          capabilities: ['TRANSFERS', 'Send_Funds', 'WALLET'],
        });

        if (res2?.success) {
          handleNext();
        }
        
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60">
          <DotSpinner />
        </div>
      )}

      <p className="mb-6 text-gray-600 transition-all delay-100 duration-500">
        We&apos;ll use this info to verify your business.
      </p>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Legal business name
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              maxLength={50}
              type="text"
              value={formData.legal_business_name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  legal_business_name: e.target.value,
                })
              }
              required
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Business email
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-accent_soft_black">
            Website
          </label>
          <input
            maxLength={100}
            type="url"
            value={formData.website}
            onChange={(e) =>
              setFormData({
                ...formData,
                website: e.target.value,
              })
            }
            
            className="max-w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Industry
              <span className="text-base text-red-500">*</span>
            </label>
            <select
              value={formData.industry}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  industry: e.target.value,
                })
              }
              required
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Choose your industry</option>
              {industries?.map((industry) => (
                <option key={industry.industry} value={industry.industry}>
                  {industry.display_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Business phone number
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
              maxLength={20}
              type="tel"
              required
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Business type
              <span className="text-base text-red-500">*</span>
            </label>
            <select
              value={formData.business_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  business_type: e.target.value,
                })
              }
              required
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Choose your business type</option>
              <option value="llc">LLC</option>
              <option value="corporation">Corporation</option>
              <option value="partnership">Partnership</option>
              <option value="publicCorporation">Public Corporation</option>
              <option value="governmentEntity">Government Entity</option>
              <option value="privateCorporation">Private Corporation</option>
              <option value="unincorporatedNonProfit">Unincorporated Non-Profit</option>
              <option value="incorporatedNonProfit">Incorporated Non-Profit</option>
              <option value="trust">Trust</option>
              <option value="unincorporatedAssociation">Unincorporated Association</option>
              <option value="soleProprietorship">Sole Proprietorship</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              EIN <span className="text-base text-red-500">*</span>
            </label>

            {uid ? (
              <p className="w-full cursor-not-allowed rounded-md border bg-gray-100 px-4 py-2.5">
                EIN Provided
              </p>
            ) : (
              <input
                value={formData.ein}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ein: e.target.value,
                  })
                }
                maxLength={20}
                type="text"
                inputMode="numeric"
                required
                disabled={!!uid}
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="my-2 text-lg font-normal">Business address</h1>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2" ref={addressWrapperRef}>
              <label className="text-accent_soft_black">
                Address line 1<span className="text-base text-red-500">*</span>
              </label>
              <div className="relative max-w-sm">
                <input
                  value={formData.address_line1}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  onKeyDown={handleAddressKeyDown}
                  autoComplete="off"
                  maxLength={50}
                  type="text"
                  required
                  placeholder="Start typing your address..."
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                />
                {isFetchingSuggestions && (
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
                            index === highlightIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                          }`}
                        >
                          <MapPin className="size-4 shrink-0 text-gray-500" />
                          <span className="min-w-0 truncate">
                            <span className="font-semibold text-gray-900">
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
            </div>

            <div className="flex flex-col gap-2" ref={addressWrapperRef2}>
              <label className="text-accent_soft_black">
                Address line 2
              </label>
              <div className="relative max-w-sm">
                <input
                  value={formData.address_line2}
                  onChange={(e) => handleAddress2Change(e.target.value)}
                  onFocus={() => {
                    if (suggestions2.length > 0) setShowSuggestions2(true);
                  }}
                  onKeyDown={handleAddress2KeyDown}
                  autoComplete="off"
                  maxLength={50}
                  type="text"
                  placeholder="Start typing your address..."
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                />
                {isFetchingSuggestions2 && (
                  <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-gray-400" />
                )}
                {showSuggestions2 && suggestions2.length > 0 && (
                  <ul className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                    {suggestions2.map((suggestion, index) => (
                      <li key={suggestion.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setHighlightIndex2(index)}
                          onClick={() => handleSelectSuggestion2(suggestion)}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                            index === highlightIndex2 ? 'bg-gray-100' : 'hover:bg-gray-50'
                          }`}
                        >
                          <MapPin className="size-4 shrink-0 text-gray-500" />
                          <span className="min-w-0 truncate">
                            <span className="font-semibold text-gray-900">
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
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">
                ZIP code
                <span className="text-base text-red-500">*</span>
              </label>
              <input
                maxLength={10}
                type="text"
                value={formData.postal_code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    postal_code: e.target.value,
                  })
                }
                required
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">
                City
                <span className="text-base text-red-500">*</span>
              </label>
              <input
                maxLength={20}
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    city: e.target.value,
                  })
                }
                required
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">
                State
                <span className="text-base text-red-500">*</span>
              </label>
              <select
                required
                value={formData.state_or_province}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    state_or_province: e.target.value,
                  })
                }
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              >
                <option value="">Select state</option>
                {USStates?.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!moovScriptLoaded || !moovAuthToken ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-500">
            Loading Moov terms of service...
          </div>
        ) : (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <moov-terms-of-service ref={termsOfServicesRef} />
          </div>
        )}

        <div className="delay-400 mt-8 transition-all duration-500 ease-out">
          <Button
            type="submit"
            disabled={!tosToken || isPending}
            className="w-full bg-accent_soft_black px-12 py-2.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uid ? 'Accept and continue' : 'Save and continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default About;
