import LogoLoader from "@/components/MainLoader/logo-loader";
import Button from "@/components/ui/RawButton";
import GetToken from "@/hooks/getToken";
import { GetData } from "@/services/FetchMethods";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import Link from "next/link";
import { useEffect, useState } from "react";

const CustomerEstimateList = ({
  uid,
  handleAddClick,
}: {
  uid: string;
  handleAddClick?: any;
}) => {
  const [SalesList, setSalesList] = useState<any>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { data, isPending } = useQuery({
    queryKey: ["customer_sales_receipt_list", uid, page],
    queryFn: async () => {
      const response = await GetData(
        `we/sales?customer__uid=${uid}&page=${page}&is_estimated=true`,
        "",
      );
      if (response.next == null) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      if (!response?.detail) {
        setSalesList((prev: any) => [...prev, ...response.results]);
      }

      return response;
    },

    enabled: !!uid,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setPage(1);
    setSalesList([]);
    setHasMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  return (
    <div className="font-lexend text-sm font-light">
      {isPending ? (
        <div className="flex h-[50vh] items-center justify-center">
          <LogoLoader color="#16151c" size={120} />
        </div>
      ) : (
        <div className="overflow-y-auto">
          {SalesList.length != 0 &&
            SalesList?.map((sale: any) => (
              <div
                className="mb-3 rounded border border-[#D7DBEC] bg-white px-4 py-2"
                key={sale.uid}
              >
                <div className="flex items-center justify-between">
                  <h1 className="mb-1 text-sm font-semibold text-accent_soft_black">
                    Estimate
                  </h1>
                  <h2 className="text-xs font-medium">{sale.invoice_id}</h2>
                </div>
                <p className="text-xs text-accent_soft_black">
                  {moment(sale.date).format("DD MMM YYYY")}
                </p>
                <p className="text-sm font-semibold text-[#131523]">
                  $ {sale.total}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Button
                    className="rounded p-0 px-2 py-0.5 text-sm font-normal text-accent_soft_blue hover:bg-gray-100"
                    onClick={() => handleAddClick(sale.uid)}
                  >
                    Add
                  </Button>
                  <Link
                    href={`/dashboard/sales/all_sales/estimate/${sale?.uid}`}
                    className="rounded-md px-2 py-0.5 text-sm font-normal text-accent_soft_black hover:bg-gray-100"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          {hasMore ? (
            <div className="flex justify-center">
              <Button
                onClick={() => setPage(page + 1)}
                className="p-1 text-center text-lg font-light text-accent_soft_blue"
              >
                {isPending ? "Loading..." : "Load More"}
              </Button>
            </div>
          ) : (
            SalesList.length > 0 && (
              <p className="p-1 text-center text-xs font-normal text-accent_soft_black">
                No More Data
              </p>
            )
          )}
        </div>
      )}
      {!isPending && !SalesList.length && (
        <div className="flex h-[50vh] items-center justify-center">
          <h1 className="text-center text-2xl text-accent_dark_blue">
            No Estimate Found!
          </h1>
        </div>
      )}
    </div>
  );
};

export default CustomerEstimateList;
