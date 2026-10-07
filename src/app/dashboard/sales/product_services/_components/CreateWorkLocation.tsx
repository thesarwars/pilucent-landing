import Button from "@/components/ui/RawButton";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import GetToken from "@/hooks/getToken";
import { useAddressValidator } from "@/hooks/useAddressValidator";
import type { AddressSuggestion } from "@/hooks/useAddressValidator";
import { USStates, US_STATES_SELECTABLE_IN_TAX_INFO } from "@/lib/helpers/UsaStates";
import { Post } from "@/services/FetchMethods";
import { useMutation } from "@tanstack/react-query";
import { Loader2, MapPin } from "lucide-react";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const CreateWorkLocation = ({
  setModalContent,
  setModalTitle,
  setIsRefetch,
  isRefetch,
  setValue,
  setIsOpen,
  onSuccess,
}: {
  setValue?: any;
  onSuccess?: any;
  setIsOpen?: any;
  setModalContent?: any;
  setModalTitle?: any;
  setIsRefetch?: any;
  isRefetch?: any;
}) => {
  const token = GetToken();
  const [workLocationData, setWorkLocationData] = useState({
    location_address: "",
    location_city: "",
    location_state: "",
    location_zip: "",
    status: "ACTIVE" as const,
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
      if (
        addressWrapperRef.current &&
        !addressWrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setHighlightIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0);
    setHighlightIndex(-1);
  }, [suggestions]);

  const handleAddressChange = (value: string) => {
    setWorkLocationData((prev) => ({ ...prev, location_address: value }));
    setIsAddressVerified(false);
    clearFieldError("address");
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
    setWorkLocationData((prev) => ({
      ...prev,
      location_address: details.street || details.mainText,
      location_city: details.city || prev.location_city,
      location_state: details.state || prev.location_state,
      location_zip: details.zip || prev.location_zip,
    }));
    setIsAddressVerified(true);
  };

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
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

  const { mutate: createLocation, isPending: isLocationCreating } =
    useMutation({
      mutationFn: async (data: any) => {
        const res = await Post(`we/payroll/work-location/`, {
          body: data,
          token,
        });
        return res;
      },
      onSuccess: (res) => {
        toast.success("Work Location Added Successfully");
        setValue && setValue(res);
        setIsOpen && setIsOpen(false);
        onSuccess && onSuccess();
        setWorkLocationData({
          location_address: "",
          location_city: "",
          location_state: "",
          location_zip: "",
          status: "ACTIVE",
        });
        clearAllErrors();
        setIsAddressVerified(false);
        setIsRefetch && setIsRefetch(!isRefetch);
        setModalContent && setModalContent("worklocations");
        setModalTitle && setModalTitle("Work Location List");
      },
      onError: () => {
        toast.error("Something went wrong!");
      },
    });

  const handleCreateWorkLocation = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAddressVerified) {
      const result = await validate({
        address: workLocationData.location_address,
        city: workLocationData.location_city,
        state: workLocationData.location_state,
        zip: workLocationData.location_zip,
      });
      if (!result.valid) {
        toast.error("Please fix the address errors before saving.");
        addressInputRef.current?.focus();
        return;
      }
      setIsAddressVerified(true);
    }

    createLocation(workLocationData);
  };

  const inputClass = (error?: string) =>
    `mt-2 h-12 w-full rounded-lg border px-6 py-4 ${
      error
        ? "border-red-500 bg-red-50 focus:border-red-500"
        : "border-gray-300"
    }`;

  return (
    <div className="mt-4 text-sm">
      <form
        onSubmit={handleCreateWorkLocation}
        className="flex flex-col gap-4 rounded-md"
      >
        <div ref={addressWrapperRef}>
          <Label className="block font-medium text-accent_soft_black">Address *</Label>
          <div className="relative">
            <input
              ref={addressInputRef}
              value={workLocationData.location_address}
              onChange={(e) => handleAddressChange(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={handleAddressKeyDown}
              autoComplete="off"
              placeholder="Enter address"
              className={inputClass(fieldErrors.address)}
              type="text"
              required
              aria-invalid={!!fieldErrors.address}
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
          {fieldErrors.address && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.address}</p>
          )}
          {!fieldErrors.address &&
            isAddressVerified &&
            workLocationData.location_address && (
              <p className="mt-1 text-xs text-green-600">Address verified.</p>
            )}
        </div>

        <div>
          <Label className="block font-medium text-accent_soft_black">City</Label>
          <Input
            value={workLocationData.location_city}
            onChange={(e) => {
              setWorkLocationData((prev) => ({
                ...prev,
                location_city: e.target.value,
              }));
              clearFieldError("city");
              setIsAddressVerified(false);
            }}
            placeholder=""
            className={inputClass(fieldErrors.city)}
            type="text"
          />
          {fieldErrors.city && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>
          )}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Label className="block font-medium text-accent_soft_black">State</Label>
            <select
              value={workLocationData.location_state}
              onChange={(e) => {
                setWorkLocationData((prev) => ({
                  ...prev,
                  location_state: e.target.value,
                }));
                clearFieldError("state");
                setIsAddressVerified(false);
              }}
              className={`mt-2 py-3 w-full rounded-lg border px-6 ${
                fieldErrors.state
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
            >
              <option value="">Select State</option>
              {USStates?.map((state) => (
                <option
                  value={state.value}
                  key={state.value}
                  disabled={!US_STATES_SELECTABLE_IN_TAX_INFO.has(state.value)}
                >
                  {state.title}
                </option>
              ))}
            </select>
            {fieldErrors.state && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.state}</p>
            )}
          </div>

          <div className="flex-1">
            <Label className="block font-medium text-accent_soft_black">
              ZIP Code
            </Label>
            <Input
              value={workLocationData.location_zip}
              onChange={(e) => {
                setWorkLocationData((prev) => ({
                  ...prev,
                  location_zip: e.target.value,
                }));
                clearFieldError("zip");
                setIsAddressVerified(false);
              }}
              placeholder=""
              className={inputClass(fieldErrors.zip)}
              type="text"
            />
            {fieldErrors.zip && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.zip}</p>
            )}
          </div>
        </div>

        <div className="mt-12 flex justify-center gap-8">
          <Button
            type="button"
            onClick={() => {
              setModalContent && setModalContent("worklocations");
              setModalTitle && setModalTitle("Work Location List");
              setIsOpen && setIsOpen(false);
            }}
            className="w-36 rounded-md border border-accent_soft_black bg-transparent px-6 py-3 text-center text-sm font-medium text-accent_soft_black hover:cursor-pointer"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex w-40 min-w-40 max-w-40 items-center justify-center bg-accent_soft_black text-sm font-medium text-white"
            isLoading={isLocationCreating || isValidating}
          >
            {isLocationCreating || isValidating ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateWorkLocation;
