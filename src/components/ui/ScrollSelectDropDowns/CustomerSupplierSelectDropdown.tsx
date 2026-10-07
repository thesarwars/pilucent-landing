import { get } from '@/app/helpers/api';
import { useDebounce } from 'use-debounce';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';

const CustomerSupplierSelectDropdown = ({
  value,
  setValue,
  onSelect,
  type = 'both', // "customer" | "supplier" | "both"
  placeholder = 'Select a Supplier/Customer',
  valueFormatter = (v: any) => v?.first_name || '' + v?.middle_name || '' + v?.last_name || '',
  formatter = (v: any) => (
    <p className="flex w-full justify-between">
      <span>{v?.first_name || '' + v?.middle_name || '' + v?.last_name || ''}</span>
      <span className="text-xs text-gray-400">{v?.type}</span>
    </p>
  ),
  required = true,
  parentClassName = '',
  ClassName = '',
  view = false,
}: {
  value: any;
  setValue: any;
  onSelect?: (val: any) => void;
  type?: 'customer' | 'supplier' | 'both';
  placeholder?: string;
  valueFormatter?: any;
  formatter?: any;
  required?: boolean;
  parentClassName?: string;
  ClassName?: string;
  view?: boolean;
}) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch] = useDebounce(searchText, 500);
  const [items, setItems] = useState<any[]>([]);
  const [uniqueItems, setUniqueItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef<any>(null);

  const endpoints = {
    customer: 'we/customers',
    supplier: 'we/suppliers',
  };

  const fetchContacts = async () => {
    const fetchOne = async (endpoint: string) =>
      await get(endpoint, { page, search: debouncedSearch });

    const responses = await Promise.all(
      (type === 'both' ? [endpoints.customer, endpoints.supplier] : [endpoints[type]]).map(fetchOne)
    );

    let merged: any[] = [];
    for (let i = 0; i < responses.length; i++) {
      const data = responses[i];
      if (data?.results?.length) {
        const formatted = data.results.map((entry: any) => ({
          ...entry,
          type: type === 'both' ? (i === 0 ? 'Customer' : 'Supplier') : type,
        }));
        merged = [...merged, ...formatted];
      }
      if (data?.next == null) setHasMore(false);
    }

    setItems((prev) => [...prev, ...merged]);
    setIsLoading(false);
  };

  useQuery({
    queryKey: ['customers_suppliers', page, debouncedSearch, type],
    queryFn: fetchContacts,
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const uniqueMap: Record<string, any> = {};
    items.forEach((item) => {
      uniqueMap[item.uid] = item;
    });
    const uniqueArray = Object.values(uniqueMap);
    if (JSON.stringify(uniqueArray) !== JSON.stringify(uniqueItems)) {
      setUniqueItems(uniqueArray);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setItems([]);
      setHasMore(true);
      setPage(1);
    } else {
      setIsMounted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, type]);

  const handleSelect = (item: any) => {
    setValue(item);
    onSelect?.(item);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${parentClassName}`}>
      <input
        type="text"
        className={`w-full cursor-pointer bg-transparent py-2 outline-none ${ClassName}`}
        placeholder={placeholder}
        value={
          value?.first_name || value?.middle_name || value?.last_name
            ? `${value?.first_name || ''} ${value?.middle_name || ''} ${value?.last_name || ''}`
            : ''
        }
        required={required}
        onFocus={() => setIsOpen(true)}
        readOnly
      />
      <IoIosArrowDown
        className={`absolute right-3 top-1/2 -translate-y-1/2 transform text-xl text-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : 'rotate-0'
        }`}
      />
      {!view && isOpen && (
        <div className="absolute left-0 z-20 mt-1 w-full rounded-md border bg-white px-3 py-2 shadow-lg">
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search here"
            className="mb-2 w-full rounded border px-3 py-2 text-sm outline-none"
          />
          <ul
            onScroll={(e) => {
              const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
              if (scrollHeight - scrollTop === clientHeight && hasMore && !isLoading) {
                setIsLoading(true);
                setPage((prev) => prev + 1);
              }
            }}
            className="max-h-60 overflow-y-auto"
          >
            {uniqueItems.map((item, idx) => (
              <li
                key={idx}
                className="flex cursor-pointer items-center justify-between py-2 pr-1 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleSelect(item)}
              >
                {`${item?.first_name || ''} ${item?.middle_name || ''} ${item?.last_name || ''}`}{' '}
                <span className="text-xs">{item?.type}</span>
              </li>
            ))}
            {!isLoading && uniqueItems.length === 0 && (
              <li className="py-2 text-center text-sm text-gray-400">No results found</li>
            )}
            {isLoading && (
              <li className="py-2 text-center text-sm text-accent_soft_blue">Loading...</li>
            )}
            {!hasMore && uniqueItems.length > 0 && (
              <li className="py-2 text-center text-xs text-accent_soft_blue">End of results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomerSupplierSelectDropdown;
