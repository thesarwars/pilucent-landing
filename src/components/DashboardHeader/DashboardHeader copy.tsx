"use client";

import {
  Bell,
  Search,
  Sparkles,
  Menu,
  PanelLeft,
  PanelRight,
  X,
} from "lucide-react";
import Button from "@/components/ui/RawButton";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import NotificationBell from "./Notification";
import { AvatarDropdown } from "./AvatarDropdown";
import Link from "next/link";
import GlobalSearch from "./GlobalSearch";

interface TopNavbarProps {
  onMobileMenuToggle?: () => void;
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
}

const TopNavbar = ({
  onMobileMenuToggle,
  onSidebarToggle,
  sidebarCollapsed = false,
}: TopNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between bg-[#EAE3F9] px-4 text-white">
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle Button - Desktop */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          className="text-gray-300 transition-colors py-2 px-4 hover:bg-indigo-800/10 hover:text-white max-lg:hidden"
        >
          {sidebarCollapsed ? (
            <svg
              className={sidebarCollapsed ? "rotate-180" : ""}
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <g opacity="0.6">
                <path
                  d="M1.66699 9.99997C1.66699 6.92572 1.66699 5.38858 2.34518 4.29898C2.59608 3.89585 2.90775 3.54522 3.26608 3.26295C4.23463 2.5 5.60097 2.5 8.33366 2.5H11.667C14.3997 2.5 15.766 2.5 16.7346 3.26295C17.0929 3.54522 17.4046 3.89585 17.6555 4.29898C18.3337 5.38858 18.3337 6.92572 18.3337 9.99997C18.3337 13.0743 18.3337 14.6114 17.6555 15.7011C17.4046 16.1041 17.0929 16.4548 16.7346 16.7371C15.766 17.5 14.3997 17.5 11.667 17.5H8.33366C5.60097 17.5 4.23463 17.5 3.26608 16.7371C2.90775 16.4548 2.59608 16.1041 2.34518 15.7011C1.66699 14.6114 1.66699 13.0743 1.66699 9.99997Z"
                  stroke="#090E4F"
                  strokeWidth="1.2"
                />
                <path
                  d="M12.083 2.5V17.5"
                  stroke="#090E4F"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 5.83203H15.8333M15 8.33206H15.8333"
                  stroke="#090E4F"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <g opacity="0.6">
                <path
                  d="M1.66699 9.99997C1.66699 6.92572 1.66699 5.38858 2.34518 4.29898C2.59608 3.89585 2.90775 3.54522 3.26608 3.26295C4.23463 2.5 5.60097 2.5 8.33366 2.5H11.667C14.3997 2.5 15.766 2.5 16.7346 3.26295C17.0929 3.54522 17.4046 3.89585 17.6555 4.29898C18.3337 5.38858 18.3337 6.92572 18.3337 9.99997C18.3337 13.0743 18.3337 14.6114 17.6555 15.7011C17.4046 16.1041 17.0929 16.4548 16.7346 16.7371C15.766 17.5 14.3997 17.5 11.667 17.5H8.33366C5.60097 17.5 4.23463 17.5 3.26608 16.7371C2.90775 16.4548 2.59608 16.1041 2.34518 15.7011C1.66699 14.6114 1.66699 13.0743 1.66699 9.99997Z"
                  stroke="#090E4F"
                  strokeWidth="1.2"
                />
                <path
                  d="M12.083 2.5V17.5"
                  stroke="#090E4F"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 5.83203H15.8333M15 8.33206H15.8333"
                  stroke="#090E4F"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          )}
        </Button>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuToggle}
          className="text-gray-700 transition-colors hover:bg-indigo-800/50 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <GlobalSearch />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`hidden -translate-x-10 text-gray-300 transition-all duration-300 ease-in-out hover:text-white sm:block ${!isOpen ? "" : "w-0 overflow-hidden opacity-0"}`}
        >
          <Search className="h-5 w-5 text-[#090E4F]" />
        </button>
      </div>
      <div className="flex items-center gap-4 sm:gap-8">
        <Link href="/dashboard/accountants" className="max-md:hidden">
          <div className="hover:border-wh relative overflow-hidden rounded-[50px] border border-gray-200 bg-[#090E4F] bg-cover px-4 py-2 text-white transition-all duration-300 hover:translate-x-[1px] hover:translate-y-[1px] hover:brightness-150">
            <div className="flex items-center gap-1">
              <p className="text-sm">Hire an Accountant</p>
            </div>
          </div>
        </Link>
        <Link href="/dashboard/ai-chat" className="group hover:brightness-110">
          <div className="relative overflow-hidden rounded-[50px] bg-[#090E4F] px-4 py-2 transition-all duration-300 hover:brightness-150 active:scale-95">
            <div className="flex items-center gap-1">
              <Image
                src="https://i.ibb.co.com/tPPFJjgj/Star-AI-loader-activated-state.gif"
                alt="image"
                className="hidden h-5 w-5 group-hover:flex"
                width={100}
                height={100}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 17 17"
                fill="none"
                className="group-hover:hidden"
              >
                <path
                  d="M8.125 0C8.47017 0 8.75 0.279825 8.75 0.625C8.75 2.29673 9.59217 4.02078 10.9107 5.33931C12.2292 6.65783 13.9532 7.5 15.625 7.5C15.9702 7.5 16.25 7.77983 16.25 8.125C16.25 8.47017 15.9702 8.75 15.625 8.75C13.9532 8.75 12.2292 9.59217 10.9107 10.9107C9.59217 12.2292 8.75 13.9532 8.75 15.625C8.75 15.9702 8.47017 16.25 8.125 16.25C7.77983 16.25 7.5 15.9702 7.5 15.625C7.5 13.9532 6.65783 12.2292 5.33931 10.9107C4.02078 9.59217 2.29673 8.75 0.625 8.75C0.279825 8.75 0 8.47017 0 8.125C0 7.77983 0.279825 7.5 0.625 7.5C2.29673 7.5 4.02078 6.65783 5.33931 5.33931C6.65783 4.02078 7.5 2.29673 7.5 0.625C7.5 0.279825 7.77983 0 8.125 0Z"
                  fill="#69E255"
                />
              </svg>
              <p className="text-sm text-transparent text-white">AI Agent</p>
            </div>
          </div>
        </Link>

        <NotificationBell />
        <AvatarDropdown />
      </div>
    </header>
  );
};

export default TopNavbar;
