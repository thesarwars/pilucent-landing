'use client'
import React, { useState } from 'react';
import { geocodeCounty, calculateTax, TaxInfo } from '@/utils/TaxLookUp';

const TaxLookupComponent = () => {
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: 'NY',
    zip: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<any>(null);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!formData.street || !formData.city) {
      setError('Street and city are required');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const county = await geocodeCounty(formData.street, formData.city, formData.state, formData.zip);
      
      if (!county) {
        setError('Could not determine county from address');
        setLoading(false);
        return;
      }

      const taxInfo = calculateTax(county);
      
      if (!taxInfo) {
        setError('Tax information not available for this county');
        setLoading(false);
        return;
      }

      setResult({
        address: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`,
        county,
        taxRate: (taxInfo.combined * 100).toFixed(3),
        taxCode: taxInfo.code,
        breakdown: taxInfo.breakdown
      });

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({ street: '', city: '', state: 'NY', zip: '' });
    setError('');
    setResult(null);
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Tax Rate Lookup</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Street Address</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="123 Main Street"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="New York"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="NY"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ZIP Code</label>
          <input
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="10001"
            disabled={loading}
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Looking up...' : 'Get Tax Rate'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Reset
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
          <h3 className="font-bold text-green-800 mb-2">Tax Information</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Address:</strong> {result.address}</p>
            <p><strong>County:</strong> {result.county}</p>
            <p><strong>Tax Rate:</strong> <span className="text-xl font-bold text-green-600">{result.taxRate}%</span></p>
            <p><strong>Tax Code:</strong> {result.taxCode}</p>
            
            <div className="mt-3 pt-2 border-t border-green-300">
              <p className="font-medium">Breakdown:</p>
              <ul className="ml-4 space-y-1">
                <li>State: {(result.breakdown.state * 100).toFixed(2)}%</li>
                <li>MCTD: {(result.breakdown.mctd * 100).toFixed(3)}%</li>
                <li>Local: {(result.breakdown.local * 100).toFixed(3)}%</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxLookupComponent;