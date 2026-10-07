import { useAppSelector } from "@/app/redux/store";
import Button from "@/components/ui/RawButton";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

const RedirectDropdown = () => {
  const dropdownRef = useRef<any>(undefined);
  const [isDropVisible, setIsDropVisible] = useState(false);
  const { Permissions } = useAppSelector((state) => state.Permissions);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        onClick={() => setIsDropVisible(!isDropVisible)}
        className="flex items-center gap-1 whitespace-nowrap bg-accent_soft_black px-3 py-2 text-sm font-medium text-white sm:px-4 sm:text-base"
      >
        <span className="hidden sm:inline-block text-base font-medium">New Transactions</span>
        <span className="sm:hidden">New</span>
        <IoIosArrowDown
          className={`${isDropVisible ? "rotate-180" : "rotate-0"} transform text-lg transition-all duration-300 sm:text-xl`}
        />
      </Button>

      {/* New Transaction Dropdown */}
      {isDropVisible && (
        <div className="absolute right-0 z-[222] mt-2 w-48 sm:w-[200px]">
          <ul  style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }} className="z-[10] border rounded-xl bg-white px-3 py-2 font-lexend text-accent_soft_black shadow-lg sm:px-5 sm:py-3">
            {/* ...existing dropdown items... */}
            {Permissions?.includes("add_sale") && (
              <li>
                <Link
                  className="mb-1 block cursor-pointer rounded-lg py-1 text-center hover:bg-accent_bg_light_gray_2xl"
                  href="/dashboard/sales/all_sales/invoice"
                >
                  Invoice
                </Link>
              </li>
            )}
            <hr className="border-[#D7DBEC]" />
            {Permissions?.includes("add_salepaymentreceive") && (
              <li>
                <Link
                  className="mb-1 block cursor-pointer rounded-lg py-1 text-center hover:bg-accent_bg_light_gray_2xl"
                  href="/dashboard/sales/all_sales/payment"
                >
                  Payment
                </Link>
              </li>
            )}
            <hr className="border-[#D7DBEC]" />
            {Permissions?.includes("add_sale") && (
              <li>
                <Link
                  className="mb-1 block cursor-pointer rounded-lg py-1 text-center hover:bg-accent_bg_light_gray_2xl"
                  href="/dashboard/sales/all_sales/estimate"
                >
                  Estimate
                </Link>
              </li>
            )}
            <hr className="border-[#D7DBEC]" />
            {Permissions?.includes("add_salereceipt") && (
              <li>
                <Link
                  className="mb-1 block cursor-pointer rounded-lg py-1 text-center hover:bg-accent_bg_light_gray_2xl"
                  href="/dashboard/sales/all_sales/sales_receipt"
                >
                  Sales Receipt
                </Link>
              </li>
            )}
            <hr className="border-[#D7DBEC]" />
            {Permissions?.includes("add_creditnote") && (
              <li>
                <Link
                  className="mb-1 block cursor-pointer rounded-lg py-1 text-center hover:bg-accent_bg_light_gray_2xl"
                  href="/dashboard/sales/all_sales/credit_note"
                >
                  Credit Note
                </Link>
              </li>
            )}
            <hr className="border-[#D7DBEC]" />
            {Permissions?.includes("add_salereceipt") && (
              <li>
                <Link
                  className="mb-1 block cursor-pointer rounded-lg py-2 text-center hover:bg-accent_bg_light_gray_2xl"
                  href="/dashboard/sales/all_sales/refund_receipt"
                >
                  Refund Receipt
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RedirectDropdown;
