"use client";
import { useTaxLookup } from "@/hooks/useSaleTax";
import { formatPercent } from "@/utils/TaxLookUp";
import { useState } from "react";

export default function TaxLookupForm() {
  const { lookup, result, error, loading } = useTaxLookup();
  const [form, setForm] = useState({ 
    street: "", 
    city: "", 
    state: "NY", 
    zip: "" 
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.street.trim() || !form.city.trim()) {
      return;
    }
    lookup(form);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">NYC Sales Tax</h1>
            <p className="text-gray-600">Enter address to get current tax rates</p>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
              <input 
                type="text"
                placeholder="e.g. 20 Cooper Square" 
                value={form.street} 
                onChange={e => setForm({ ...form, street: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
              <input 
                type="text"
                placeholder="e.g. New York" 
                value={form.city} 
                onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <input 
                  type="text"
                  placeholder="NY" 
                  value={form.state} 
                  onChange={e => setForm({ ...form, state: e.target.value.toUpperCase() })}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  maxLength={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                <input 
                  type="text"
                  placeholder="e.g. 10003" 
                  value={form.zip} 
                  onChange={e => setForm({ ...form, zip: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  maxLength={5}
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !form.street.trim() || !form.city.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Looking up...
                </div>
              ) : "Get Tax Rate"}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Results Display - HTML Style */}
          {result && (
            <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              {/* Combined Rate - Big Display */}
              <div className="text-center mb-6">
                <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-3">
                  Combined Rate
                </div>
                <div className="text-5xl font-bold text-green-800 mb-2">
                  {formatPercent(result.tax.combined)}
                </div>
              </div>

              {/* Pills for County and Code */}
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-mono px-3 py-1 rounded-full">
                  Code: {result.tax.code}
                </span>
                <span className="inline-block bg-purple-100 text-purple-800 text-sm font-mono px-3 py-1 rounded-full">
                  County: {result.county}
                </span>
                {result.tax.mctd && (
                  <span className="inline-block bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full">
                    MCTD Region
                  </span>
                )}
              </div>

              {/* Address Display */}
              <div className="text-center mb-6 text-gray-700">
                <p className="text-sm font-medium">{result.matchedAddress}</p>
              </div>
              
              {/* Tax Breakdown - Clean Grid */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-700">New York State</span>
                    <span className="font-mono text-lg text-gray-900">
                      {formatPercent(result.tax.breakdown.state)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-semibold text-gray-700">MCTD</span>
                    <span className="font-mono text-lg text-gray-900">
                      {formatPercent(result.tax.breakdown.mctd)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-gray-700">Local</span>
                    <span className="font-mono text-lg text-gray-900">
                      {formatPercent(result.tax.breakdown.local)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Geocoding address...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
