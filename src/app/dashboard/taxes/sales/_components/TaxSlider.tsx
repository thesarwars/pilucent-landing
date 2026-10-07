'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { fetchAgencyTaxTracker } from '@/app/helpers/backend';

export interface SaleOverview {
  total_taxable_sale: number;
  total_non_taxable_sale: number;
  total_gross_sale: number;
}

export interface TaxAgencyData {
  uid: string;
  title: string;
  filling_frequency: string;
  reporting_method: string;
  status: string;
  date: string;
  state: string | null;
  start_of_period: string;
  sale_overview: SaleOverview;
}

export interface TaxAgencyResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TaxAgencyData[];
}

export interface TaxTrackerData {
  period: string;
  due_date: string;
  total_sales_amount: number;
  total_tax_amount: number;
  status: string;
  month: string;
}

export interface TaxTrackerResponse {
  error: boolean;
  message: string;
  data: {
    agency_name: string;
    year_to_date_data: TaxTrackerData[];
  };
}

interface TaxSliderProps {
  data?: TaxAgencyResponse;
  isLoading?: boolean;
  onTaxTrackerData?: (data: TaxTrackerData[], agencyName: string, agencyUid: string) => void;
  refreshKey?: number;
}

export default function TaxAgencySlider({
  data,
  isLoading = false,
  onTaxTrackerData,
  refreshKey = 0,
}: TaxSliderProps) {
  const taxAgencies = data?.results || [];
  const [selectedAgency, setSelectedAgency] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [taxTrackerData, setTaxTrackerData] = useState<TaxTrackerData[]>([]);
  const [isLoadingTracker, setIsLoadingTracker] = useState(false);
  const [selectedAgencyName, setSelectedAgencyName] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);

  // Touch/Swipe functionality
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Update selected agency when data changes
  useEffect(() => {
    if (taxAgencies.length > 0 && !selectedAgency) {
      const firstAgency = taxAgencies[0];
      setSelectedAgency(firstAgency.uid);
      setSelectedAgencyName(firstAgency.title);
      // Pass agency info immediately
      if (onTaxTrackerData) {
        onTaxTrackerData([], firstAgency.title, firstAgency.uid);
      }
      // Fetch tax tracker data for the first agency
      fetchTaxTracker(firstAgency.uid);
    }
  }, [taxAgencies, selectedAgency]);

  // Refetch tax tracker data when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0 && selectedAgency) {
      fetchTaxTracker(selectedAgency);
    }
  }, [refreshKey]);

  // Function to fetch tax tracker data
  const fetchTaxTracker = async (agencyUid: string) => {
    if (!agencyUid) return;

    setIsLoadingTracker(true);
    try {
      const response = await fetchAgencyTaxTracker(agencyUid);
      if (response && !response.error && response.data) {
        // Sort data in descending order (latest first)
        const sortedData = [...response.data.year_to_date_data].reverse();
        setTaxTrackerData(sortedData);

        // Pass data back to parent component
        if (onTaxTrackerData) {
          onTaxTrackerData(sortedData, response.data.agency_name, agencyUid);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tax tracker data:', error);
      setTaxTrackerData([]);
      if (onTaxTrackerData) {
        onTaxTrackerData([], '', agencyUid);
      }
    } finally {
      setIsLoadingTracker(false);
    }
  };

  // Handle agency selection
  const handleAgencySelect = (agency: TaxAgencyData) => {
    setSelectedAgency(agency.uid);
    setSelectedAgencyName(agency.title);
    setIsDropdownOpen(false);
    // Pass agency info immediately when selected
    if (onTaxTrackerData) {
      onTaxTrackerData([], agency.title, agency.uid);
    }
    fetchTaxTracker(agency.uid);
  };

  // Update slides per view based on screen size
  useEffect(() => {
    const updateSlidesPerView = () => {
      if (window.innerWidth >= 1280) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(1);
      }
    };

    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, []);

  const maxSlide = Math.max(0, taxAgencies.length - slidesPerView);

  const goToSlide = (slideIndex: number) => {
    if (isTransitioning) return;

    const newSlide = Math.max(0, Math.min(slideIndex, maxSlide));
    setCurrentSlide(newSlide);
    setIsTransitioning(true);

    setTimeout(() => setIsTransitioning(false), 300);
  };

  const nextSlide = () => {
    if (currentSlide < maxSlide) {
      goToSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toFixed(2);
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  const formatPeriod = (startPeriod: string, date: string, frequency: string) => {
    const formatDate = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return `${startPeriod} - ${formatDate} (${frequency})`;
  };

  const calculateSalesTaxOwed = (saleOverview: SaleOverview) => {
    // This is a simple calculation - you might want to adjust based on your business logic
    return saleOverview.total_taxable_sale * 0.05; // Assuming 5% tax rate for example
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'open':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div
        style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.05)' }}
        className="rounded-xl border bg-white/60 p-4"
      >
        <div className="flex h-64 items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading tax agencies...</div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!taxAgencies.length) {
    return (
      <div
        style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.05)' }}
        className="rounded-xl border bg-white/60 p-4"
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-500">No tax agencies found</div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.05)' }}
      className="rounded-xl border bg-white/60 p-4"
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-accent_soft_black">Sales Tax</h1>

          {/* Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex min-w-[200px] items-center justify-between rounded-md border border-gray-300 bg-white/60 px-4 py-2 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="text-sm text-gray-700">{selectedAgencyName || 'Select Agency'}</span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white/60 shadow-lg">
                {taxAgencies.map((agency) => (
                  <button
                    key={agency.uid}
                    onClick={() => handleAgencySelect(agency)}
                    className="w-full px-4 py-2 text-left first:rounded-t-md last:rounded-b-md hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <span className="text-sm text-gray-900">{agency.title}</span>
                    {agency.state && (
                      <span className="ml-2 text-xs text-gray-500">({agency.state})</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center gap-2 px-3 py-2 text-accent_soft_black transition-colors hover:text-gray-800 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm">Previous</span>
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide >= maxSlide}
            className="flex items-center gap-2 rounded bg-accent_soft_black px-3 py-2 text-white transition-colors hover:bg-gray-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-sm">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Global Expand/Collapse Toggle */}
      <div className="mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus:outline-none"
        >
          {isExpanded ? (
            <ChevronDown className="mr-1 h-4 w-4" />
          ) : (
            <ChevronRight className="mr-1 h-4 w-4" />
          )}
          {isExpanded ? 'Collapse all details' : 'Expand all details'}
        </button>
      </div>

      {/* Custom Slider */}
      <div className="relative">
        <div className="overflow-hidden">
          <div
            ref={sliderRef}
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)`,
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {taxAgencies.map((agency) => (
              <div
                key={agency.uid}
                className={`flex-shrink-0 px-3 ${slidesPerView === 1 ? 'w-full' : 'w-1/2'}`}
              >
                <div className="h-full rounded-lg border border-gray-200 bg-white/60 shadow-sm transition-shadow duration-200 hover:shadow-md">
                  <div className="p-6">
                    <div className="flex flex-col gap-6 xl:flex-row">
                      {/* Left Side - Main Info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-4 break-words text-sm font-semibold leading-tight text-gray-800">
                          {agency.title}
                          {agency.state && (
                            <span className="ml-2 text-xs font-normal text-gray-500">
                              ({agency.state})
                            </span>
                          )}
                        </h3>

                        <div className="mb-3">
                          <span className="text-3xl font-bold text-blue-600">
                            {formatCurrency(calculateSalesTaxOwed(agency.sale_overview))}
                          </span>
                        </div>

                        <div className="mb-4 text-sm text-gray-600">
                          {formatPeriod(
                            agency.start_of_period,
                            agency.date,
                            agency.filling_frequency
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{agency.reporting_method} basis</div>
                        <div className="mt-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              agency.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {agency.status}
                          </span>
                        </div>
                      </div>

                      {/* Right Side - Details */}
                      <div
                        className={`min-w-0 flex-1 overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">Taxable sales</span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(agency.sale_overview.total_taxable_sale)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">Non-Taxable sales</span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(agency.sale_overview.total_non_taxable_sale)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">Gross sales</span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(agency.sale_overview.total_gross_sale)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">Filling Frequency</span>
                            <span className="text-sm font-medium text-gray-900">
                              {agency.filling_frequency}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-t border-gray-200 py-2 pt-3">
                            <span className="text-sm font-medium text-gray-900">
                              Sales tax owed
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(calculateSalesTaxOwed(agency.sale_overview))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="mt-8 flex justify-center space-x-2">
        {Array.from({ length: maxSlide + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 rounded-full transition-colors duration-200 ${
              currentSlide === index ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
