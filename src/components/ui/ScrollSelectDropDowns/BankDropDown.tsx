import React, { useEffect, useRef, useState } from "react";
import { FaRegCreditCard } from "react-icons/fa";
import { RiBankFill } from "react-icons/ri";

interface Account {
  type: "checking" | "savings" | "credit";
  name: string;
  balance: number;
  transactions: number;
}

interface DropdownProps {
  options: any[];
  value?:any,
  setValue?:any,
}

const BankDropdown: React.FC<DropdownProps> = ({
  value,
  setValue,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = (option: any) => {
    setValue(option?.chart_of_account);
    setIsOpen(false);
  };


  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[300px] max-w-[300px]" ref={selectRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {value ? (
          <div className="flex items-center">
            {value.type === "credit" ? (
              <FaRegCreditCard className="mr-2" />
            ) : (
              <RiBankFill className="mr-2" />
            )}
            <span>{value?.title}</span>
          </div>
        ) : (
          "Select an account"
        )}
        <svg
          className="-mr-1 ml-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-2 w-full origin-top-right rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="py-1">
            {options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleSelect(option)}
                className="cursor-pointer  px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  {option.type === "credit" ? (
                    <FaRegCreditCard className="mr-2 text-lg" />
                  ) : (
                    <RiBankFill className="mr-2 text-lg" />
                  )}

                  <span>{option?.chart_of_account?.title}</span>
                
                </div>
                <div className="flex items-center justify-between mt-2">
                <p className="text-xs">Balance: ${option?.chart_of_account?.opening_balance}</p>
                <p className="text-xs">
                  {option.status_for_review} transactions
                </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDropdown;
