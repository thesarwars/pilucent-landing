import { ChevronDownIcon, Loader2, MapPin } from "lucide-react";
import React, {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAddressValidator } from "@/hooks/useAddressValidator";
import type { AddressSuggestion } from "@/hooks/useAddressValidator";
import { PatternInput } from "./pattern-input";
import Button from "@/components/ui/RawButton";
import { USStates } from "@/lib/helpers/UsaStates";
import { toast } from "@/lib/ToastService";
import moment from "moment";
import {
  patchMoovAccount,
  patchMoovRepresentative,
  postMoovRepresentative,
} from "@/app/helpers/backend";
import { collectErrorMessages } from "@/utils/flattenErrors";

const AboutThePrincipal = ({
  RenderAgain,
  setRenderAgain,
  rUID,
  uid,
  handleNext,
  data,
  setData,
}: {
  RenderAgain: any;
  setRenderAgain: any;
  rUID: string;
  uid: string;
  handleNext: any;
  data: any;
  setData: any;
}) => {
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
      if (
        addressWrapperRef.current &&
        !addressWrapperRef.current.contains(event.target as Node)
      ) {
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    setData((prev: any) => ({ ...prev, address_line1: value }));
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
    setData((prev: any) => ({
      ...prev,
      address_line1: details.street || details.mainText,
      city: details.city || prev.city,
      state_or_province: details.state || prev.state_or_province,
      postal_code: details.zip || prev.postal_code,
    }));
  };

  const handleAddressKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightIndex(-1);
    }
  };

  const handleAddress2Change = (value: string) => {
    setData((prev: any) => ({ ...prev, address_line2: value }));
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
    setData((prev: any) => ({
      ...prev,
      address_line2: details.street || details.mainText,
      city: details.city || prev.city,
      state_or_province: details.state || prev.state_or_province,
      postal_code: details.zip || prev.postal_code,
    }));
  };

  const handleAddress2KeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions2 || suggestions2.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex2((prev) => (prev + 1) % suggestions2.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex2((prev) =>
        prev <= 0 ? suggestions2.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter") {
      if (highlightIndex2 >= 0) {
        e.preventDefault();
        handleSelectSuggestion2(suggestions2[highlightIndex2]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions2(false);
      setHighlightIndex2(-1);
    }
  };

  const formatDate = (dateString: string) => {
    const parsed = moment(dateString, "YYYY-MM-DD");
    return {
      day: parsed.date(),
      month: parsed.month() + 1, // months are zero-based
      year: parsed.year(),
    };
  };

  const handleError = (error: any) => {
    try {
      if (error?.response?.data?.message) {
        const errors = JSON.parse(error?.response?.data?.message);
        const messages = collectErrorMessages(errors);
        messages?.map((message) => {
          return toast.error(message);
        });
      }
    } catch (err) {
      // console.log(err);
      toast.error("Something Went Wrong");
    }
  };

  const handleUpdate = async () => {
    try {
      const payloadData = {
        name: {
          first_name: data?.first_name,
          last_name: data?.last_name,
        },
        phone: {
          number: data?.phone,
          country_code: "1",
        },
        email: data?.email,
        address: {
          address_line1: data?.address_line1,
          address_line2: data?.address_line2,
          city: data?.city,
          state_or_province: data?.state_or_province,
          postal_code: data?.postal_code,
          country: "US",
        },
        // birth_date: formatDate(data?.date_of_birth),
        // governmentID: data?.is_itin
        //   ? {
        //       itin: {
        //         full: data?.itin_or_ssn,
        //         lastFour: data?.itin_or_ssn?.slice(-4),
        //       },
        //     }
        //   : {
        //       ssn: {
        //         full: data?.itin_or_ssn,
        //         lastFour: data?.itin_or_ssn?.slice(-4),
        //       },
        //     },
        responsibilities: {
          ownership_percentage: Number(data?.ownership_percentage),
          job_title: data?.job_title,
          // isOwner: true,
          // isController: true,
        },
      };
      const res = await patchMoovRepresentative(uid, rUID, payloadData);
      if (res?.success) {
        setRenderAgain(!RenderAgain);
        toast.success("Changes saved!");
        handleNext();
      }
    } catch (error) {
      handleError(error);
      handleNext();
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (rUID) {
      handleUpdate();
    } else {
      const payloadData = {
        name: {
          first_name: data?.first_name,
          last_name: data?.last_name,
        },
        phone: {
          number: data?.phone,
          country_code: "1",
        },
        email: data?.email,
        address: {
          address_line1: data?.address_line1,
          address_line2: data?.address_line2,
          city: data?.city,
          state_or_province: data?.state_or_province,
          postal_code: data?.postal_code,
          country: "US",
        },
        birth_date: formatDate(data?.date_of_birth),
        governmentID: data?.is_itin
          ? {
              itin: {
                full: data?.itin_or_ssn,
                lastFour: data?.itin_or_ssn?.slice(-4),
              },
            }
          : {
              ssn: {
                full: data?.itin_or_ssn,
                lastFour: data?.itin_or_ssn?.slice(-4),
              },
            },
        responsibilities: {
          ownership_percentage: Number(data?.ownership_percentage),
          job_title: data?.job_title,
          isOwner: Number(data?.ownership_percentage || 0) >= 25 ? true : false,
          isController: true,
        },
      };

      try {
        const res = await postMoovRepresentative(uid, payloadData);
        if (res?.success) {
          setRenderAgain(!RenderAgain);
          const res1 = await patchMoovAccount(uid, {
            profile: {
              business: {
                ownersProvided: true,
              },
            },
          });
          if (res1?.success) {
            toast.success("success!");
            handleNext();
          }
        }
      } catch (error) {
        handleError(error);
      }
    }
  };

  return (
    <form onSubmit={handleSave}>
      <p className="mb-6 text-gray-600 transition-all delay-100 duration-500">
        Tell us about the main person associated with your business's bank
        account.
      </p>

      <div className="space-y-4">
        {/* Owner Title */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Job Title
              <span className="text-base text-red-500">*</span>
            </label>
            <select
              value={data.job_title}
              onChange={(e) =>
                setData({
                  ...data,
                  job_title: e.target.value,
                })
              }
              required
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Choose one</option>
              <option value="CEO">CEO</option>
              <option value="PRESIDENT">President</option>
              <option value="OWNER">Owner</option>
              <option value="PARTNER">Partner</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="mb-1 text-accent_soft_black">
              Ownership percentage
              <span className="text-base text-red-500"> *</span>
            </label>
            <input
              value={data.ownership_percentage}
              onChange={(e) =>
                setData({
                  ...data,
                  ownership_percentage: e.target.value,
                })
              }
              type="number"
              required
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
            <p className="text-[11px] text-accent_soft_black">
              (how much you own this business. Ex: 25%, 50% or 100%)
            </p>
          </div>
        </div>
        {/* Name Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              First name
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              value={data.first_name}
              onChange={(e) =>
                setData({
                  ...data,
                  first_name: e.target.value,
                })
              }
              type="text"
              required
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Last name
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              value={data.last_name}
              onChange={(e) =>
                setData({
                  ...data,
                  last_name: e.target.value,
                })
              }
              type="text"
              required
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="mb-1 text-accent_soft_black">
              Mobile number
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={data.phone}
              onChange={(e) =>
                setData({
                  ...data,
                  phone: e.target.value,
                })
              }
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
            {!rUID && (
              <p className="mt-1 text-xs text-accent_soft_black">
                We'll use this for account security and verification. (US only)
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="mb-1 text-accent_soft_black">
              Email
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={data.email}
              onChange={(e) =>
                setData({
                  ...data,
                  email: e.target.value,
                })
              }
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>
        {/* SSN and DOB Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Date of birth
              <span className="text-base text-red-500">*</span>{" "}
              {rUID && (
                <span className="text-xs font-light text-accent_soft_black">
                  (contact support for any change)
                </span>
              )}
            </label>
            {rUID ? (
              <p className="cursor-not-allowed rounded-md border bg-gray-100 px-4 py-2.5">
                Provided <br />
              </p>
            ) : (
              <input
                value={data.date_of_birth}
                onChange={(e) =>
                  setData({
                    ...data,
                    date_of_birth: e.target.value,
                  })
                }
                type="date"
                required
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              {data?.is_itin ? "ITIN" : "SSN"}
              <span className="text-base text-red-500"> *</span>{" "}
              {rUID && (
                <span className="text-xs font-light text-accent_soft_black">
                  (contact support for any change)
                </span>
              )}
            </label>
            {rUID ? (
              <p className="cursor-not-allowed rounded-md border bg-gray-100 px-4 py-2.5">
                Provided <br />
              </p>
            ) : (
              <div className="flex items-center gap-4">
                <PatternInput
                  value={data.itin_or_ssn}
                  setValue={(value: any) =>
                    setData({ ...data, itin_or_ssn: value })
                  }
                />
                <Button
                  type="button"
                  onClick={() => {
                    setData({ ...data, is_itin: !data?.is_itin });
                  }}
                  className="px-2 py-1 text-sm font-light hover:bg-gray-200"
                >
                  Use {!data?.is_itin ? "ITIN" : "SSN"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="my-2 text-lg font-normal">Personal address</h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2" ref={addressWrapperRef}>
              <label className="text-accent_soft_black">
                Address line 1<span className="text-base text-red-500">*</span>
              </label>
              <div className="relative max-w-sm">
                <input
                  value={data.address_line1}
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
                            index === highlightIndex
                              ? "bg-gray-100"
                              : "hover:bg-gray-50"
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
                  value={data.address_line2}
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
                            index === highlightIndex2
                              ? "bg-gray-100"
                              : "hover:bg-gray-50"
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

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">
                ZIP code
                <span className="text-base text-red-500">*</span>
              </label>
              <input
                maxLength={10}
                type="text"
                value={data.postal_code}
                onChange={(e) =>
                  setData({
                    ...data,
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
                value={data.city}
                onChange={(e) =>
                  setData({
                    ...data,
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
                value={data.state_or_province}
                onChange={(e) =>
                  setData({
                    ...data,
                    state_or_province: e.target.value,
                  })
                }
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              >
                {USStates?.map((state) => {
                  return (
                    <option key={state.value} value={state.value}>
                      {state.title}
                    </option>
                  );
                })}
                {/* <option value="MN">Minnesota</option>
                       <option value="TX">Texas</option>*/}
                <option value="">Select state</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="delay-600 mt-8 transition-all duration-500 ease-out">
        <Button className="w-full bg-accent_soft_black px-12 py-2.5 text-white">
          Save and continue
        </Button>
      </div>
    </form>
  );
};

export default AboutThePrincipal;
