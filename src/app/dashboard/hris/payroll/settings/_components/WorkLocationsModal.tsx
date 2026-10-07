import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, MapPin } from 'lucide-react';
import { useFetch } from '@/app/helpers/hooks';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { USStates, US_STATES_SELECTABLE_IN_TAX_INFO } from '@/lib/helpers/UsaStates';
import {
  deleteWorkLocations,
  fetchWorkLocation,
  fetchWorkLocationList,
  patchWorkLocations,
} from '@/app/helpers/backend';
import TopModal from '@/components/ui/ScrollSelectDropDowns/TopModal';
import CreateWorkLocation from '@/app/dashboard/sales/product_services/_components/CreateWorkLocation';
import { Button } from '@/components/ui/button';
import { useAddressValidator } from '@/hooks/useAddressValidator';
import type { AddressSuggestion } from '@/hooks/useAddressValidator';

const WorkLocationsList = ({
  onEditLocation,
  data,
}: {
  onEditLocation: (location: any) => void;
  data: any;
}) => {
  return (
    <div className="bg-white">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-medium text-gray-900">Company work locations</h1>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-700">
            <div className="col-span-6">ADDRESS</div>
            <div className="col-span-3 line-clamp-1 text-nowrap">EMPLOYEES ASSIGNED</div>
            <div className="col-span-3">STATUS</div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 bg-white">
          {data?.results?.map((location: any, index: number) => (
            <div key={index} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50">
              <div className="col-span-6 flex items-center gap-2">
                <div className="text-sm text-gray-900">
                  {location.location_address}
                  {location.location_city ? `, ${location.location_city}` : ''}
                  {location.location_state ? `, ${location.location_state}` : ''}
                  {location.location_zip ? ` - ${location.location_zip}` : ''}
                </div>
                {location?.is_primary && (
                  <span className="rounded-md bg-accent_soft_blue px-2 py-1 text-xs text-white">
                    Primary
                  </span>
                )}
              </div>

              <div className="col-span-3 text-center">
                <span className="text-sm text-gray-900">{location.total_employees}</span>
              </div>

              <div className="col-span-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{location.status}</span>
                <button
                  onClick={() => onEditLocation(location)}
                  className="text-sm font-medium text-green-600 hover:text-green-800"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EditWorkLocationModal = ({ location, onClose }: { location: any; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    location_address: location?.location_address || '',
    location_city: location?.location_city || '',
    location_state: location?.location_state || '',
    location_zip: location?.location_zip || '',
    status: location?.status || 'ACTIVE',
  });
  const [employees, setEmployees] = useState(location?.employees || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressVerified, setIsAddressVerified] = useState(!!location?.location_address);
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
      if (addressWrapperRef.current && !addressWrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setHighlightIndex(-1);
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
    const fetchLocationDetails = async () => {
      if (location?.uid) {
        try {
          setIsLoading(true);
          const response = await fetchWorkLocation(location.uid);
          if (response) {
            setFormData({
              location_address: response.location_address || '',
              location_city: response.location_city || '',
              location_state: response.location_state || '',
              location_zip: response.location_zip || '',
              status: response.status || 'ACTIVE',
            });
            setEmployees(response.employees || []);
            setIsAddressVerified(!!response.location_address);
          }
        } catch (error) {
          console.error('Error fetching location details:', error);
          toast.error('Failed to load location details');
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchLocationDetails();
  }, [location?.uid]);

  const handleAddressChange = (value: string) => {
    setFormData((prev) => ({ ...prev, location_address: value }));
    setIsAddressVerified(false);
    clearFieldError('address');
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
    setFormData((prev) => ({
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

  const handleSave = async () => {
    if (!isAddressVerified) {
      const result = await validate({
        address: formData.location_address,
        city: formData.location_city,
        state: formData.location_state,
        zip: formData.location_zip,
      });
      if (!result.valid) {
        toast.error('Please fix the address errors before saving.');
        addressInputRef.current?.focus();
        return;
      }
      setIsAddressVerified(true);
    }

    try {
      setIsLoading(true);
      const response = await patchWorkLocations(location.uid, formData);
      if (response) {
        toast.success('Work location updated successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update work location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLocation = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      timerProgressBar: true,
      timer: 20000,
      confirmButtonColor: '#6A6EF6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, delete`,
      customClass: {
        container: '!z-[10000]',
      },
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          setIsLoading(true);
          const response = await deleteWorkLocations(location.uid);
          if (response?.success) {
            onClose();
            return response;
          }
          throw new Error('Failed');
        } catch (error) {
          Swal.showValidationMessage(`${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Success!',
          text: 'Work location has been deleted.',
          icon: 'success',
          color: '#181640',
          background: 'white',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            container: '!z-[10000]',
          },
        });
      }
      setIsLoading(false);
    });
  };

  const inputClass = (error?: string) =>
    `w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
      error
        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50 pb-8 pt-8">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900">Edit work location</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Location Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="IN_ACTIVE">Inactive</option>
            </select>
          </div>

          <div ref={addressWrapperRef}>
            <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
            <div className="relative">
              <input
                ref={addressInputRef}
                type="text"
                value={formData.location_address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={handleAddressKeyDown}
                autoComplete="off"
                className={inputClass(fieldErrors.address)}
                placeholder="Start typing your address..."
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
                          index === highlightIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                        }`}
                      >
                        <MapPin className="size-4 shrink-0 text-gray-500" />
                        <span className="min-w-0 truncate">
                          <span className="font-semibold text-gray-900">{suggestion.mainText}</span>
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
            {!fieldErrors.address && isAddressVerified && formData.location_address && (
              <p className="mt-1 text-xs text-green-600">Address verified.</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={formData.location_city}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, location_city: e.target.value }));
                clearFieldError('city');
                setIsAddressVerified(false);
              }}
              className={inputClass(fieldErrors.city)}
              placeholder="Enter city"
            />
            {fieldErrors.city && <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">State</label>
            <select
              value={formData.location_state}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, location_state: e.target.value }));
                clearFieldError('state');
                setIsAddressVerified(false);
              }}
              className={inputClass(fieldErrors.state)}
            >
              <option value="">Select State</option>
              {USStates?.map((state) => (
                <option
                  key={state.value}
                  value={state.value}
                  disabled={!US_STATES_SELECTABLE_IN_TAX_INFO.has(state.value)}
                >
                  {state.title}
                </option>
              ))}
            </select>
            {fieldErrors.state && <p className="mt-1 text-xs text-red-600">{fieldErrors.state}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">ZIP code</label>
            <input
              type="text"
              value={formData.location_zip}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, location_zip: e.target.value }));
                clearFieldError('zip');
                setIsAddressVerified(false);
              }}
              className={inputClass(fieldErrors.zip)}
              placeholder="Enter ZIP code"
            />
            {fieldErrors.zip && <p className="mt-1 text-xs text-red-600">{fieldErrors.zip}</p>}
          </div>

          {employees.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Assigned Employees
              </label>
              <ul className="list-disc pl-5 text-sm text-gray-800">
                {employees.map((emp: any) => (
                  <li key={emp.slug}>{emp.full_name}</li>
                ))}
              </ul>
            </div>
          )}

          {location?.is_primary || location?.total_employees > 0 ? (
            <p className="text-sm text-red-600">
              This is the primary work location or it has employees assigned to it and cannot be
              deleted.
            </p>
          ) : (
            <button
              onClick={handleDeleteLocation}
              disabled={isLoading}
              className="inline-flex items-center text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              🗑️ Delete work location
            </button>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            disabled={isLoading || isValidating}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || isValidating}
            className="flex items-center justify-center rounded-md bg-accent_soft_black px-6 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isLoading || isValidating ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkLocationModal = ({ setIsOpen }: { setIsOpen: (open: boolean) => void }) => {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const { data, isPending, refetch, params, setQueryParams } = useFetch(
    ['work_locations', isRefetching],
    fetchWorkLocationList
  );

  const handleEditLocation = (location: any) => {
    setSelectedLocation(location);
  };

  const handleCloseModal = () => {
    setSelectedLocation(null);
    setIsRefetching((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl">
        <Button onClick={() => setOpen(true)} className="float-end">
          Add Work Location
        </Button>
        <WorkLocationsList onEditLocation={handleEditLocation} data={data} />

        {selectedLocation && (
          <EditWorkLocationModal location={selectedLocation} onClose={handleCloseModal} />
        )}
      </div>
      <TopModal
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        title="Work Location"
        widthClass="w-full md:w-[500px]"
      >
        <CreateWorkLocation setIsOpen={setOpen} onSuccess={() => refetch()} />
      </TopModal>
    </div>
  );
};

export default WorkLocationModal;
