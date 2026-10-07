import Button from "@/components/ui/RawButton";
import GetToken from "@/hooks/getToken";
import { GetData } from "@/services/FetchMethods";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useEffect, useState } from "react";

const CustomerSalesList = ({
  uid,
  handleAddClick,
  Token,
}: {
  uid: string;
  handleAddClick?: any;
  Token: string;
}) => {
  const [SalesList, setSalesList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [token, setToken] = useState("");
  const [page, setPage] = useState(1);
  const { data, isPending } = useQuery({
    queryKey: ["customer_sales_list", uid, page],
    queryFn: async () => {
      const response = await GetData(
        `we/customers/${uid}/sales?page=${page}`,
        token,
      );
      if (response.next == null) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      if (!response?.detail) {
        setSalesList((prev: any) => [...prev, ...response.results]);
      }
      setIsLoading(false);

      return response;
    },

    enabled: !!uid,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setToken("");
    setPage(1);
    setSalesList([]);
    setIsLoading(true);
    setHasMore(true);
    setIsLoading(true);
    setTimeout(() => {
      setToken(Token);
    }, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // console.log(SalesList);

  return (
    <div className="font-lexend">
      {isLoading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <p className="inline-block h-20 w-20 animate-spin rounded-full border-[3px] border-gray-100 border-t-[#6A6EF6]" />{" "}
        </div>
      ) : (
        <div className="overflow-y-auto">
          {SalesList.length != 0 &&
            SalesList?.map((sale: any) => (
              <div
                className="mb-2 rounded-xl border border-[#D7DBEC] bg-[#F5F6FA] p-4"
                key={sale.uid}
              >
                <div className="flex items-center justify-between">
                  <h1 className="mb-2 text-lg font-semibold text-[#131523]">
                    {sale?.is_invoice && "Invoice"}{" "}
                    {sale?.is_estimated && "Estimate"}
                  </h1>
                  <h2 className="mb-1 text-sm font-medium">
                    {sale.invoice_id}
                  </h2>
                </div>
                <p className="mb-1 text-sm text-[#7E84A3]">
                  {moment(sale.date).format("DD MMM YYYY")}
                </p>
                <p className="text-lg font-semibold text-[#131523]">
                  $ {sale.total}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Button
                    className="p-1 font-semibold text-[#6A6EF6]"
                    onClick={() => handleAddClick(sale.uid)}
                  >
                    Add
                  </Button>
                  {/* <Button className="p-1 font-semibold text-[#00035F]">
                    Open
                  </Button> */}
                </div>
              </div>
            ))}
          {hasMore ? (
            <div className="flex justify-center">
              <Button
                onClick={() => setPage(page + 1)}
                className="p-1 text-center text-lg font-medium text-accent_soft_blue"
              >
                {isPending ? "Loading..." : "Load More"}
              </Button>
            </div>
          ) : (
            SalesList.length > 0 && (
              <Button className="p-1 text-center text-lg text-accent_dark_blue">
                No More Data
              </Button>
            )
          )}
        </div>
      )}
      {!isLoading && !SalesList.length && (
        <div className="flex h-[50vh] items-center justify-center">
          <h1 className="text-center text-2xl text-accent_dark_blue">
            No Invoice Or Estimate Found!
          </h1>
        </div>
      )}
    </div>
  );
};

export default CustomerSalesList;
