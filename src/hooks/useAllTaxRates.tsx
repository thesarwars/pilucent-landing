import { GetData } from "@/services/FetchMethods";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const useAllTaxRates = (token?: string) => {
  const [taxRates, setTaxRates] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["terms_list_invoice", page],
    queryFn: async () => {
      const response = await GetData(`we/agencies/taxes/combines?page=${page}`);
      // console.log(response);
      if (response.next == null) {
        setHasMore(false);
      }
      if (!response?.detail) {
        setTaxRates((prev) => [...prev, ...response.results]);
      }
      setIsLoading(false);
      return response;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isMounted) {
      if (!isPending && !isLoading && hasMore) {
        setPage(page + 1);
      }
    } else {
      setIsMounted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, isPending, isLoading]);

  return { taxRates, isPending };
};

export default useAllTaxRates;
