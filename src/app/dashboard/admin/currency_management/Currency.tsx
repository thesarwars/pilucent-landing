import Button from "@/components/ui/RawButton";
import { currencyChoices } from "@/lib/helpers/COAData";
import { toast } from "@/lib/ToastService";
import { PostData } from "@/services/company";
import { baseURL } from "@/services/FetchMethods";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { FormEvent, useEffect, useState } from "react";
import {
  fetchCurrency,
  patchCurrency,
  postCurrency,
} from "@/app/helpers/backend";
import MainLoader from "@/components/MainLoader/MainLoader";

const Currency = ({
  uid,
  isOpen,
  setIsOpen,
  refetch,
}: {
  uid?: string;
  isOpen?: any;
  setIsOpen?: any;
  refetch?: any;
}) => {
  const [data, setData] = useState({
    kind: "",
    exchange_rate: "",
    status: "ACTIVE",
  });
  const [exchangeRate, setExchangeRate] = useState<string>("");
  const [rateType, setRateType] = useState<"market" | "custom">("custom");
  const [marketRate, setMarketRate] = useState<number | null>(null);
  const [customRate, setCustomRate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!uid) {
      setData({
        ...data,
        kind: "",
        exchange_rate: "",
        status: "ACTIVE",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  useEffect(() => {
    const fn = async () => {
      try {
        setIsPending(true);
        const res = await fetchCurrency(uid);
        if (res) {
          setData({
            ...data,
            kind: res?.kind || "",
            exchange_rate: res?.exchange_rate || "",
          });
        }
      } catch (error) {
        toast.error("Couldn't retrieve data");
      } finally {
        setIsPending(false);
      }
    };
    if (uid) fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (uid) {
        const payloadData = {
          kind: data.kind,
          exchange_rate: parseFloat(data?.exchange_rate),
        };
        const result = await patchCurrency(uid, payloadData);
        if (result?.success) {
          toast.success("Currency updated.");
          setIsOpen && setIsOpen(false);
          refetch && refetch();
        }
      } else {
        const payloadData = {
          kind: data.kind,
          status: "ACTIVE",
          exchange_rate: parseFloat(data?.exchange_rate),
          date: new Date().toISOString().split("T")[0],
        };
        const result = await postCurrency(payloadData);
        if (result?.success) {
          toast.success("Currency created.");
          setIsOpen && setIsOpen(false);
          refetch && refetch();
        }
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }

    // console.log("Add Currency Payload:", payload);
    // Add your API call here
  };

  const handleRateTypeChange = (type: "market" | "custom") => {
    setRateType(type);
    if (type === "market" && marketRate) {
      setExchangeRate(marketRate.toString());
    } else if (type === "custom") {
      setExchangeRate(customRate);
    }
  };

  const handleExchangeRateChange = (value: string) => {
    setExchangeRate(value);
    if (rateType === "custom") {
      setCustomRate(value);
    }
  };

  const fetchMarketRate = async (currencyCode: string) => {
    // setIsLoadingRate(true);
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD",
      );
      const data = await response.json();
      const rate = data.rates[currencyCode];
      if (rate) {
        setMarketRate(rate);
        if (rateType === "market") {
          setExchangeRate(rate.toString());
        }
      }
    } catch (error) {
      toast.error("Failed to fetch market rate");
    } finally {
      // setIsLoadingRate(false);
    }
  };

  useEffect(() => {
    if (rateType === "market" && marketRate) {
      setExchangeRate(marketRate.toString());
    }
  }, [rateType, marketRate]);

  if (isPending) {
    return <MainLoader />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="z-[60]">
          <label className="mb-1 block">Select Currency</label>
          <select
            required
            value={data.kind}
            onChange={(e) => setData({ ...data, kind: e.target.value })}
            className="w-full rounded-md border border-accent_text_slate bg-transparent px-4 py-2 outline-none"
          >
            <option value="" defaultChecked>
              Select Currency
            </option>
            {currencyChoices?.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
        </div>

        {/* Exchange rate field - now visible in both add and edit modes */}
        <div>
          <label className="mb-1 block">Exchange Rate</label>
          <input
            type="number"
            value={data.exchange_rate}
            onChange={(e) =>
              setData({ ...data, exchange_rate: e.target.value })
            }
            className="w-full rounded-md border border-accent_text_slate bg-transparent px-4 py-2 outline-none"
            placeholder="Enter exchange rate"
            required
          />
        </div>

        <div className="flex justify-center gap-6">
          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            className="btn min-w-32 border-2 border-accent_soft_black bg-white text-accent_soft_black transition-all hover:bg-accent_soft_black hover:text-white"
          >
            Cancel
          </Button>

          <Button
            isLoading={isLoading}
            type="submit"
            className="min-w-32 items-center gap-2 text-nowrap rounded-md bg-black px-4 text-white hover:bg-gray-900"
          >
            {uid ? "Update" : "Add"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Currency;
