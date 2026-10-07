import { useAppSelector } from "@/app/redux/store";
import Button from "@/components/ui/RawButton";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

const RedirectExpenseDropdown = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <>
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <Button
          onClick={toggleDropdown}
          className="flex items-center gap-1 whitespace-nowrap bg-accent_soft_black px-4 py-2.5 text-sm font-medium text-white"
        >
          <span className="hidden text-nowrap text-base font-medium sm:inline-block">
            New Transactions
          </span>
          <span className="sm:hidden">New</span>
          <IoIosArrowDown
            className={`${isOpen ? "rotate-180" : "rotate-0"} transform text-lg transition-all duration-300 sm:text-xl`}
          />
        </Button>

        {isOpen && (
          <div className="absolute right-0 z-[222] mt-2 w-48 sm:w-[200px]">
            <ul
              style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
              className="z-[10] rounded-xl border bg-white px-4 py-2.5 font-lexend text-base font-normal text-accent_soft_black shadow-lg"
            >
              {/* ...existing dropdown items... */}
              {Permissions?.includes("add_purchase") && (
                <li>
                  <Link
                    className="mb-1 block cursor-pointer rounded-lg py-1 text-center hover:bg-accent_bg_light_gray_2xl"
                    href="/dashboard/expenses/expenses/bill"
                  >
                    Bill
                  </Link>
                </li>
              )}
              <hr className="border-[#D7DBEC]" />
              {Permissions?.includes("add_expense") && (
                <li>
                  <Link
                    className="mb-1 block cursor-pointer rounded-lg py-1 text-center hover:bg-accent_bg_light_gray_2xl"
                    href="/dashboard/expenses/expenses/expense"
                  >
                    Expense
                  </Link>
                </li>
              )}
              <hr className="border-[#D7DBEC]" />
              {Permissions?.includes("add_purchase") && (
                <li>
                  <Link
                    className="mb-1 block cursor-pointer rounded-lg py-1 text-center hover:bg-accent_bg_light_gray_2xl"
                    href="/dashboard/expenses/expenses/cheque"
                  >
                    Cheque
                  </Link>
                </li>
              )}
              <hr className="border-[#D7DBEC]" />
              {Permissions?.includes("add_purchase") && (
                <li>
                  <Link
                    className="mb-1 block cursor-pointer rounded-lg py-1 text-center hover:bg-accent_bg_light_gray_2xl"
                    href="/dashboard/expenses/expenses/purchase"
                  >
                    Purchase Order
                  </Link>
                </li>
              )}
              <hr className="border-[#D7DBEC]" />
              {Permissions?.includes("add_purchasepayment") && (
                <li>
                  <Link
                    className="mb-1 block cursor-pointer rounded-lg py-1 text-center hover:bg-accent_bg_light_gray_2xl"
                    href="/dashboard/expenses/expenses/bill-payment"
                  >
                    Bill Payment
                  </Link>
                </li>
              )}
              <hr className="border-[#D7DBEC]" />
              {Permissions?.includes("add_creditnote") && (
                <li>
                  <Link
                    className="mb-1 block cursor-pointer rounded-lg py-2 text-center hover:bg-accent_bg_light_gray_2xl"
                    href="/dashboard/expenses/expenses/supplier-credit"
                  >
                    Supplier Credit
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default RedirectExpenseDropdown;
