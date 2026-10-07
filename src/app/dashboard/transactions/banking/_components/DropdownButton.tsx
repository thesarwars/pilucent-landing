import Button from '@/components/ui/RawButton';
import React, { useEffect, useRef, useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import LinkButton from './LinkButton';
import Link from 'next/link';
import { useAppSelector } from '@/app/redux/store';
import { toast } from '@/lib/ToastService';

const DropdownButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const { UserData } = useAppSelector((state: any) => state.userData);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <Button
          type="button"
          className="inline-flex w-full justify-center rounded-md border bg-accent_soft_black p-1 text-white shadow-sm focus:outline-none"
        >
          {UserData?.is_2fa_enabled ? (
            <LinkButton />
          ) : (
            <button
              className="px-4"
              onClick={() =>
                toast.error('To link your account please enable 2FA  from your profile settings')
              }
            >
              Link Account
            </button>
          )}
          <p onClick={toggleDropdown} className="border-l px-2 py-2">
            <IoIosArrowDown className="text-xl" />
          </p>
        </Button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-[1010] mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <Link
              href="/dashboard/transactions/banking?act=import"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              Upload from file
            </Link>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              Manage connections
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              Order checks
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownButton;
