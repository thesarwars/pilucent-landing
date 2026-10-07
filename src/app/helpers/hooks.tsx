import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// Query configuration
const QUERY_CONFIG = {
  staleTime: 0, // 30 seconds
  cacheTime: 0, // 5 minutes
  // refetchInterval: 30000, // 30 seconds
  // refetchOnWindowFocus: false,
  retry: 3,
};

export const useFetch = (
  queryKey: any[],
  queryFn: any,
  options = {},
  config = {},
  uid = "",
) => {
  const [params, setParams] = useState<any>({
    page: 1,
    limit: 20,
    search: "",
    ...options,
  });

  // Wrap the queryFn to include all params
  const wrappedQueryFn = async () => {
    if (uid) {
      return queryFn(uid, params);
    } else {
      return queryFn(params);
    }
  };

  const query = useQuery({
    queryKey: [...queryKey, params],
    queryFn: wrappedQueryFn,
    ...QUERY_CONFIG,
    ...options,
    ...config,
  });

  // Modified setQueryParams function
  const setQueryParams = (newParams: any, shouldReplace = false) => {
    if (shouldReplace) {
      // Completely replace parameters except for pagination defaults
      setParams({
        page: 1,
        limit: 20,
        search: "",
        ...newParams,
      });
    } else {
      // Merge with existing parameters (old behavior)
      setParams((prev: any) => ({ ...prev, ...newParams }));
    }
  };

  return { ...query, setQueryParams, params };
};

export const useCustomFetch = (queryFn: any, options = {}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);
  const [params, setParams] = useState<any>({
    page: 1,
    limit: 20,
    search: "",
  });
  const wrappedQueryFn = async () => {
    return queryFn({ ...params, ...options });
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await wrappedQueryFn();
      setData(res);
    } catch (error: any) {
      setIsError(true);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const refetch = () => fetchData();

  const setQueryParams = (newParams: any) => {
    // Completely replace parameters except for pagination defaults
    setParams({
      page: 1,
      limit: 20,
      search: "",
      ...newParams,
    });
  };

  return {
    data,
    isPending: loading,
    refetch,
    setQueryParams,
    params,
    error,
    isError,
  };
};
