import ScrollSelect from "@/components/ui/InfiniteSelect/CustomInfiniteScrollSelect";
import GetToken from "@/hooks/getToken";
import { GetData } from "@/services/FetchMethods";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const Select = ({
  value,
  setValue,
  isRequired,
  filter=""
}: {
  filter?:any
  value: any;
  setValue: any;
  isRequired: boolean;
}) => {
  const token = GetToken();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [accountList, setAccountList] = useState<any[]>([]);

  const { data: Accounts, isPending } = useQuery({
    queryKey: ["account_list", currentPage],
    queryFn: async () => {
      const response = await GetData(
        `we/chart-of-accounts?page=${currentPage}&${filter}`,
        token,
      );
      console.log(response);
      if (response.next == null) {
        setHasMore(false);
      }
      if (response.detail !== "Invalid page.") {
        response.results.map((res: any) =>
          setAccountList((prev) => [
            ...prev,
            { label: res.title, value: res.uid },
          ]),
        );
      }
      return response;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <ScrollSelect
      hasMore={hasMore}
      isPending={isPending}
      options={accountList}
      placeholder="Select Parent"
      setPage={setCurrentPage}
      value={value}
      onChange={setValue}
      required={isRequired}
    />
  );
};

export default Select;
