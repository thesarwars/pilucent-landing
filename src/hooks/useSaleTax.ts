import { useState } from "react";

export interface TaxLookupResult {
  input: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  matchedAddress: string;
  county: string;
  tax: {
    combined: number;
    code: string;
    county: string;
    mctd: boolean;
    breakdown: {
      state: number;
      mctd: number;
      local: number;
    };
  };
}

export function useTaxLookup() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaxLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup(address: { street: string; city: string; state: string; zip?: string; saleYear?: number }) {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const params = new URLSearchParams({
        street: address.street,
        city: address.city,
        state: address.state,
        ...(address.zip && { zip: address.zip }),
        ...(address.saleYear && { saleYear: String(address.saleYear) }),
      }).toString();
      
      const res = await fetch(`/api/tax-lookup?${params}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to lookup tax information");
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during tax lookup");
    } finally {
      setLoading(false);
    }
  }

  return { lookup, result, error, loading };
}
