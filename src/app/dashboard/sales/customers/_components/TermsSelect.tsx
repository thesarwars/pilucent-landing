import ScrollSelect from "@/components/ui/InfiniteSelect/CustomInfiniteScrollSelect";
import GetToken from "@/hooks/getToken";
import { GetData } from "@/services/FetchMethods";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

type terms = {
  value: any;
  onChange: any;
  placeholder?: any;
  required?: boolean;
};
const TermsSelect = ({
  value,
  onChange,
  required = false,
  placeholder = "Select Parent",
}: terms) => {
  const token = GetToken();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [termsList, setTermsList] = useState<any[]>([]);

  const { data, isPending } = useQuery({
    queryKey: ["terms_select_list", currentPage],
    queryFn: async () => {
      const response = await GetData(
        `we/terms?page=${currentPage}`,
        token,
      );
      console.log(response);
      if (response.next == null) {
        setHasMore(false);
      }
      if (response.detail !== "Invalid page.") {
        response.results.map((res: any) =>
          setTermsList((prev) => [
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
      options={termsList}
      placeholder={placeholder}
      setPage={setCurrentPage}
      value={value}
      onChange={onChange}
      required={required}
    />
  );
};

export default TermsSelect;
