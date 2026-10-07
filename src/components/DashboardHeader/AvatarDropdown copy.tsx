'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, CreditCard, Users, Mail, Bell, HelpCircle } from 'lucide-react';
import { useAppSelector } from '@/app/redux/store';
import Link from 'next/link';
const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;

export function AvatarDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { UserData: user } = useAppSelector((state) => state.userData);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onLogoutClick = () => {
    setIsLoggingOut(true);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggingOut(false);
    window.location.href = `${redirectUrl}/pricing?action=logout`;
    // router.replace("/auth/signin")
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className={`rounded-full focus:outline-none`}>
          <Avatar className="h-10 w-10 cursor-pointer border-2 border-indigo-500 transition-colors hover:border-indigo-600">
            {user?.image ? (
              <AvatarImage
                src={user?.image?.original || ''}
                alt={user?.name || 'User'}
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarFallback className="bg-indigo-100 font-medium uppercase text-accent_secondary">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            )}
            <AvatarFallback className="bg-indigo-100 font-medium uppercase text-accent_secondary">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-lexend font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          <Link
            onClick={() => {
              setTimeout(() => {
                setIsOpen(false);
              }, 200);
            }}
            href="/dashboard/profile"
            className="flex w-full items-center gap-2"
          >
            <User className="mr-2 h-4 w-4" />
            <span className="font-lexend text-sm font-normal">Profile</span>
          </Link>
        </DropdownMenuItem>

        {/* <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <Users className="mr-2 h-4 w-4" />
          <span>Team</span>
        </DropdownMenuItem> */}

        {/* <DropdownMenuItem className="cursor-pointer">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer">
          <Mail className="mr-2 h-4 w-4" />
          <span>Messages</span>
        </DropdownMenuItem> */}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          <Link
            onClick={() => {
              setTimeout(() => {
                setIsOpen(false);
              }, 200);
            }}
            href="/dashboard/support"
            className="flex w-full items-center gap-2 font-lexend"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            <span className="font-lexend text-sm font-normal">Support</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogoutClick}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-5 w-5" />
          <span className="font-lexend text-sm font-normal">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
