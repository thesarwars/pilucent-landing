'use client';
import { fetchProducts } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { useAppSelector } from '@/app/redux/store';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReportFilter from '../_components/filter';

interface Brand {
  uid: string;
  title: string;
  description: string;
  kind: string;
  status: string;
}

interface Category {
  uid: string;
  title: string;
  description: string;
  status: string;
  kind: string;
}

interface FileData {
  uid: string;
  model_kind: string;
  title: string;
  file: string;
  status: string;
  kind: string;
}

interface Product {
  uid: string;
  title: string;
  sku: string;
  code: string | null;
  quantity: any;
  date: string;
  expired_date: string | null;
  reorder_point: number | null;
  description: string;
  sale_price: string;
  kind: string;
  status: string;
  vat: string;
  is_non_stock: boolean;
  is_inventory: boolean;
  is_stock: boolean;
  is_purchased: boolean;
  is_addtional_cost: boolean;
  brand: Brand;
  category: Category;
  file_data: FileData[];
}

const Page = () => {
  const [processedData, setProcessedData] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLTableRowElement | null>(null);
  const { Company } = useAppSelector((state) => state.CompanyData);
  const { data, setQueryParams, isPending, refetch, params } = useFetch(
    ['productsData'],
    fetchProducts
  );

  const fetchNextPage = useCallback(() => {
    if (isPending || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setQueryParams({ page: currentPage + 1 });
    setCurrentPage((prev) => prev + 1);
  }, [currentPage, isPending, isLoadingMore, hasMore, setQueryParams]);

  // Setup Intersection Observer for infinite scrolling
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (lastItemRef.current) {
      observerRef.current.observe(lastItemRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [fetchNextPage, hasMore]);

  // Process API data
  useEffect(() => {
    if (!data) return;

    setIsLoadingMore(false);

    try {
      if (data.next === null) {
        setHasMore(false);
      }

      const products: Product[] = Array.isArray(data.results) ? data.results : [];

      if (currentPage === 1) {
        setProcessedData(products);
      } else {
        const existingProductsMap = processedData?.reduce(
          (acc, product) => {
            acc[product?.uid] = product;
            return acc;
          },
          {} as Record<string, Product>
        );

        const mergedProducts = [...processedData];
        products.forEach((newProduct) => {
          if (!existingProductsMap[newProduct?.uid]) {
            mergedProducts.push(newProduct);
          }
        });

        setProcessedData(mergedProducts);
      }
    } catch (error) {
      console.error('Error processing products data:', error);
    }
  }, [data]);

  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    return numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const printReport = () => {
    const printContent = document.getElementById('report-content')?.innerHTML;
    const printWindow = window.open('', '_blank');

    if (printWindow && printContent) {
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join('\n');
          } catch {
            return '';
          }
        })
        .join('\n');

      printWindow.document.write(`
          <html>
            <head>
              <style>${styles}</style>
            </head>
            <body>${printContent}</body>
          </html>
        `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const totalQuantity = useMemo(() => {
    return processedData?.reduce((sum, account) => {
      return sum + Number.parseFloat(account?.quantity || 0);
    }, 0);
  }, [processedData]);

  return (
    <div className="mx-auto p-4">
      <ReportFilter
        params={params}
        setParams={setQueryParams}
        onFilterChange={() => {
          setCurrentPage(1);
          setProcessedData([]);
          setHasMore(true);
        }}
      />
      <button
        onClick={printReport}
        className="float-end mt-4 rounded-lg bg-gray-400 px-6 py-2 text-sm font-semibold text-white"
      >
        Print
      </button>
      <div id="report-content" className="rounded border bg-white/40 px-4 py-7 text-sm font-light">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Products/Services List</h1>
          <h2 className="mb-1 text-xl">{Company?.name || 'Binary Burst'} </h2>
          <p className="text-gray-600">As of {new Date().toLocaleDateString()}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white/60">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b px-4 py-2 text-left">Title</th>
                <th className="border-b px-4 py-2 text-center">Category</th>
                <th className="border-b px-4 py-2 text-center">Sale Price</th>
                <th className="border-b px-4 py-2 text-center">Quantity On Hand</th>
              </tr>
            </thead>
            <tbody>
              {isPending && currentPage === 1 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : processedData.length > 0 ? (
                <>
                  {processedData.map((product, index) => (
                    <tr
                      key={product?.uid}
                      className="hover:bg-gray-50"
                      ref={index === processedData?.length - 1 ? lastItemRef : null}
                    >
                      <td className="border-b px-4 py-2">{product?.title}</td>
                      <td className="border-b px-4 py-2 text-center">
                        {product?.category?.title || '-'}
                      </td>
                      <td className="border-b px-4 py-2 text-center">
                        $ {product?.sale_price || '-'}
                      </td>
                      <td className="border-b px-4 py-2 text-center">{product?.quantity || '-'}</td>
                    </tr>
                  ))}

                  {processedData.length > 0 && (
                    <tr className="bg-gray-50 font-semibold">
                      <td className="border-b px-4 py-2"></td>
                      <td colSpan={2} className="border-t-2 px-4 py-2 text-center">
                        Total Quantity:
                      </td>
                      <td colSpan={2} className="border-t-2 px-4 py-2 text-center">
                        {totalQuantity || 0}
                      </td>
                    </tr>
                  )}

                  {isLoadingMore && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page;
