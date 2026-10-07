import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { baseURL } from "@/services/FetchMethods";

interface HistoryProps {
  isOpen: boolean;
  onClose: () => void;
  currencyKind: string | null;
  token: string | null;
}

interface HistoryData {
  uid: string;
  kind: string;
  exchange_rate: string;
  date: string;
  status: string;
}

const CurrencyHistory: React.FC<HistoryProps> = ({
  isOpen,
  onClose,
  currencyKind,
  token,
}) => {
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => {
        setMounted(false);
      }, 300); // Match this with CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currencyKind || !token) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `${baseURL}we/currencies?kind=${currencyKind}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        setHistoryData(data.results || []);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, currencyKind, token]);

  if (!mounted) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/${date.getFullYear().toString().slice(2)}`;
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
        isOpen ? "bg-opacity-50" : "pointer-events-none bg-opacity-0"
      }`}
    >
      <div
        className={`absolute right-0 top-0 h-full w-[520px] rounded-md bg-white shadow-lg transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-xl font-medium">History</h2>
            <h3 className="mt-2 text-gray-500">
              {currencyKind} - Currency exchange rate history
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoMdClose size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 p-4">
          <div className="bg-[#F9F9FC] p-4">
            {/* Table Headers */}
            <div className="mt-2 px-4">
              <div className="grid grid-cols-2 text-sm font-medium text-gray-600">
                <div>Date</div>
                <div>Exchange Rate</div>
              </div>
            </div>

            {/* Content */}
            <div className="mt-2 px-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {historyData.map((item) => (
                    <div
                      key={item.uid}
                      className="grid grid-cols-2 py-2 text-sm"
                    >
                      <div className="text-gray-600">
                        {formatDate(item.date)}
                      </div>
                      <div className="text-gray-900">
                        ${Number(item.exchange_rate).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyHistory;
