import { useAppSelector } from "@/app/redux/store";
import GetToken from "@/hooks/getToken";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const CurrencySelect = ({
  view =false,
  rate,
  setRate,
  customerCurrency = "",
}: {
  view?:any
  rate?: any;
  setRate?: any;
  customerCurrency: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { CompanySettingsData } = useAppSelector((state) => state.CompanyData);

  const fetchMarketRate = async (currencyCode: string) => {
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${CompanySettingsData?.home_currency}`,
      );
      const data = await response.json();
      const rate = data.rates[currencyCode];
      if (rate) {
        setRate(rate);
      }
    } catch (error) {
      console.error("Error fetching market rate:", error);
      toast.error("Failed to fetch market rate");
    }
  };

  useEffect(() => {
    if (customerCurrency && CompanySettingsData) {
      fetchMarketRate(customerCurrency);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [CompanySettingsData, customerCurrency]);

  return (
    <>
      {(CompanySettingsData?.home_currency !== customerCurrency && customerCurrency) && (
        <div className="relative flex items-center justify-start gap-2 text-[#7E84A3]">
          {(isLoading) && (
            <div className="absolute flex h-full w-full items-center justify-center bg-white p-1 opacity-50">
              {" "}
              <p className="inline-block h-8 w-8 animate-spin rounded-full border-[2px] border-gray-100 border-t-[#6A6EF6]" />{" "}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span>1 {CompanySettingsData?.home_currency}</span>
          </div>
          <span>=</span>
          <div className="mr-3 flex items-center gap-2">
            <input
              type="number"
              onChange={(e) => {
               !view && setRate(e.target.value);
              }}
              value={rate}
              className="w-20 rounded-lg border bg-transparent px-2 py-2 outline-none"
            />
            <span>{customerCurrency}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default CurrencySelect;
