'use client';

import { Bell, Search, Sparkles, Menu, PanelLeft, PanelRight, X } from 'lucide-react';
import Button from '@/components/ui/RawButton';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import NotificationBell from './Notification';
import { AvatarDropdown } from './AvatarDropdown';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import Link from 'next/link';
import GlobalSearch from './GlobalSearch';

interface TopNavbarProps {
  onMobileMenuToggle?: () => void;
  onSidebarToggle?: () => void;
}

const TopNavbar = ({ onMobileMenuToggle, onSidebarToggle }: TopNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="mt-5 flex h-10 items-center gap-3 font-jakarta mb-5">
      {/* Search leads on desktop; hidden below lg where the mobile hamburger sits */}
      <div className="max-lg:hidden">
        <GlobalSearch />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <Link href="/dashboard/accountants" className="max-md:hidden">
          <div className="flex items-center gap-2 rounded-xl bg-[#0E1020] px-4 py-2 text-white transition-colors duration-200 hover:bg-v-ink900">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="7" width="18" height="13" rx="2.5"></rect>
              <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"></path>
            </svg>
            <p className="text-sm font-semibold">Hire an Accountant</p>
          </div>
        </Link>
        <Link title="AI Agent" href="/dashboard/ai-chat" className="group hover:brightness-110">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/75 bg-white/60 p-2.5 text-v-ink500 backdrop-blur-md transition-all duration-300 hover:text-v-primary active:scale-95">
            <div className="flex items-center gap-1">
              <Image
                src="https://i.ibb.co.com/tPPFJjgj/Star-AI-loader-activated-state.gif"
                alt="image"
                className="hidden h-5 w-5 group-hover:flex"
                width={80}
                height={80}
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
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        </Link>

        <NotificationBell />
        <WorkspaceSwitcher />
        <AvatarDropdown />
      </div>
    </header>
  );
};

export default TopNavbar;
