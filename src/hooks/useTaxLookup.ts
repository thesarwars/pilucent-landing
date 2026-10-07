import { useState } from 'react';
import { TaxInfo } from '@/utils/TaxLookUp';

interface TaxLookupResult {
  input: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  matchedAddress: string;
  county: string;
  tax: TaxInfo;
}

interface TaxLookupError {
  error: string;
  details?: string;
}

export function useTaxLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TaxLookupResult | null>(null);

  const lookupTax = async (
    street: string,
    city: string,
    state: string = 'NY',
    zip: string = '',
    saleYear?: number,
  ) => {
    if (!street.trim() || !city.trim()) {
      setError('Street and city are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = new URLSearchParams({
        street: street.trim(),
        city: city.trim(),
        state: state.trim() || 'NY',
        zip: zip.trim(),
        ...(saleYear && { saleYear: String(saleYear) }),
      });

      const response = await fetch(`/api/tax-lookup?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Tax lookup failed');
      }

      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setResult(null);
  };

  return {
    loading,
    error,
    result,
    lookupTax,
    reset,
  };
}