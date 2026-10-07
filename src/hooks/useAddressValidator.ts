import { useCallback, useRef, useState } from 'react';

export type AddressSuggestion = {
  id: string;
  mainText: string;
  secondaryText: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  entries?: number;
  secondary?: string;
};

export type AddressFieldErrors = {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export type AddressData = {
  address: string;
  city: string;
  state: string;
  zip: string;
};

// Smarty embedded/website key — must be NEXT_PUBLIC_* since this hook runs in
// the browser. Set NEXT_PUBLIC_SMARTY_KEY in .env (referer-restricted key).
const SMARTY_KEY = process.env.NEXT_PUBLIC_SMARTY_KEY ?? '';

const US_AUTOCOMPLETE_URL = 'https://us-autocomplete-pro.api.smarty.com/lookup';
const US_STREET_URL = 'https://us-street.api.smarty.com/street-address';

function mapSuggestion(s: any, i: number): AddressSuggestion {
  const street = s.street_line + (s.secondary ? ` ${s.secondary}` : '');
  const isGroup = (s.entries ?? 0) > 1;
  return {
    id: `smarty-${i}-${s.street_line}`,
    mainText: s.street_line + (s.secondary && !isGroup ? ` ${s.secondary}` : ''),
    secondaryText: isGroup
      ? `${s.city}, ${s.state} ${s.zipcode} (${s.entries} entries)`
      : `${s.city}, ${s.state} ${s.zipcode}`,
    street: isGroup ? s.street_line : street,
    city: s.city || '',
    state: s.state || '',
    zip: s.zipcode || '',
    entries: s.entries ?? 0,
    secondary: s.secondary || '',
  };
}

async function fetchAutocompleteSuggestions(query: string): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({
    key: SMARTY_KEY,
    search: query,
    license: 'us-autocomplete-pro-cloud',
  });
  const res = await fetch(`${US_AUTOCOMPLETE_URL}?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.suggestions || []).map(mapSuggestion);
}

async function fetchSecondaries(
  suggestion: AddressSuggestion,
  searchText: string
): Promise<AddressSuggestion[]> {
  const selected = [
    suggestion.street,
    suggestion.secondary
      ? `${suggestion.secondary} (${suggestion.entries})`
      : `(${suggestion.entries})`,
    suggestion.city,
    suggestion.state,
    suggestion.zip,
  ].join(' ');

  const params = new URLSearchParams({
    key: SMARTY_KEY,
    search: searchText || suggestion.street,
    selected,
    license: 'us-autocomplete-pro-cloud',
  });
  const res = await fetch(`${US_AUTOCOMPLETE_URL}?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.suggestions || []).map(mapSuggestion);
}

async function validateSmartyAddress(
  addressData: AddressData
): Promise<{ valid: boolean; errors: AddressFieldErrors }> {
  if (!addressData.address?.trim()) {
    return { valid: false, errors: { address: 'Street address is required.' } };
  }

  const params = new URLSearchParams({
    key: SMARTY_KEY,
    street: addressData.address,
    city: addressData.city,
    state: addressData.state,
    zipcode: addressData.zip,
  });

  const res = await fetch(`${US_STREET_URL}?${params}`);
  if (!res.ok) {
    return {
      valid: false,
      errors: { address: 'Unable to validate address. Please try again.' },
    };
  }

  const results: any[] = await res.json();
  if (!results.length) {
    return {
      valid: false,
      errors: { address: 'Address could not be validated. Please verify.' },
    };
  }

  const result = results[0];
  const dpvCode = result.analysis?.dpv_match_code;

  if (
    (dpvCode === 'Y' || dpvCode === 'S' || dpvCode === 'D') &&
    result?.components?.city_name == addressData.city &&
    result?.components?.state_abbreviation == addressData.state &&
    result?.components?.zipcode == addressData.zip
  ) {
    return { valid: true, errors: {} };
  }

  const errors: AddressFieldErrors = {};
  const components = result.components || {};

  if (
    components.state_abbreviation &&
    addressData.state &&
    components.state_abbreviation.toUpperCase() !== addressData.state.toUpperCase()
  ) {
    errors.state = `Expected state: ${components.state_abbreviation}.`;
  }

  if (
    components.city_name &&
    addressData.city &&
    components.city_name.toLowerCase() !== addressData.city.toLowerCase()
  ) {
    errors.city = `Expected city: ${components.city_name}.`;
  }

  if (components.zipcode && addressData.zip && components.zipcode !== addressData.zip) {
    errors.zip = `Expected zip: ${components.zipcode}.`;
  }

  if (dpvCode === 'N') {
    errors.address = 'This address was not found as a deliverable address. Please verify.';
  } else {
    errors.address =
      errors.address || 'Address could not be confirmed as deliverable. Please verify.';
  }

  return { valid: false, errors };
}

export function useAddressValidator() {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AddressFieldErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestCounterRef = useRef(0);
  const lastSearchRef = useRef('');

  const fetchSuggestions = useCallback((input: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    const trimmed = input.trim();
    lastSearchRef.current = trimmed;
    if (!trimmed || trimmed.length < 3) {
      setSuggestions([]);
      setIsFetchingSuggestions(false);
      return;
    }
    debounceTimerRef.current = setTimeout(async () => {
      const requestId = ++requestCounterRef.current;
      setIsFetchingSuggestions(true);
      try {
        const items = await fetchAutocompleteSuggestions(trimmed);
        if (requestId !== requestCounterRef.current) return;
        setSuggestions(items);
      } catch {
        if (requestId === requestCounterRef.current) setSuggestions([]);
      } finally {
        if (requestId === requestCounterRef.current) setIsFetchingSuggestions(false);
      }
    }, 300);
  }, []);

  const selectSuggestion = useCallback(
    async (suggestion: AddressSuggestion): Promise<AddressSuggestion | null> => {
      if (suggestion.entries && suggestion.entries > 1) {
        setIsFetchingSuggestions(true);
        try {
          const expanded = await fetchSecondaries(suggestion, lastSearchRef.current);
          setSuggestions(expanded);
        } catch {
          /* keep current */
        } finally {
          setIsFetchingSuggestions(false);
        }
        return null;
      }

      return suggestion;
    },
    []
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  const clearFieldError = useCallback((field: keyof AddressFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const validate = useCallback(
    async (addressData: AddressData): Promise<{ valid: boolean; errors: AddressFieldErrors }> => {
      setIsValidating(true);
      try {
        const result = await validateSmartyAddress(addressData);
        setFieldErrors(result.errors);
        return result;
      } catch {
        const errors: AddressFieldErrors = {
          address: 'Unable to validate address. Please try again.',
        };
        setFieldErrors(errors);
        return { valid: false, errors };
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  return {
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
  };
}
