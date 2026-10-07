import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { GetData } from '@/services/FetchMethods';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/app/helpers/api';
import Button from '../ui/RawButton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<any>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['notification', page],
    queryFn: async () => {
      const response = await get(`${'me/notifications'}`, { page: page });
      // console.log(response);
      if (response.next == null) {
        setHasMore(false);
      }
      if (!response?.detail) {
        setNotifications((prev) => [...prev, ...response.results]);
      }
      return response;
    },
    refetchOnWindowFocus: false,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = async (uid: string) => {
    try {
      await GetData(`me/notifications/${uid}`, ''); // API call to mark as read
      setNotifications(
        notifications.map((notification) =>
          notification.uid === uid ? { ...notification, is_read: true } : notification
        )
      );
      // toast.success("Notification marked as read successfully!"); // Show success toast
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, is_read: true })));
  };

  const unreadCount = notifications?.filter((n) => !n.is_read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        title="Notifications"
        className="flex h-10 w-10 items-center rounded-[90px] bg-white/30 p-2.5 outline outline-1 outline-offset-[-1px] outline-white"
      >
        <button onClick={() => setOpen(!open)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M2.10825 12.3079C1.93104 13.4695 2.72331 14.2759 3.69336 14.6777C7.41232 16.2183 12.5876 16.2183 16.3066 14.6777C17.2766 14.2759 18.0689 13.4695 17.8917 12.3079C17.7828 11.5939 17.2443 10.9994 16.8453 10.4189C16.3227 9.64923 16.2708 8.80969 16.2707 7.9165C16.2707 4.46472 13.4632 1.6665 9.99998 1.6665C6.53675 1.6665 3.72925 4.46472 3.72925 7.9165C3.72917 8.80969 3.67725 9.64923 3.15465 10.4189C2.75568 10.9994 2.21716 11.5939 2.10825 12.3079Z"
              stroke="#595F70"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              opacity="0.4"
              d="M6.66669 15.8335C7.04876 17.2712 8.3963 18.3335 10 18.3335C11.6037 18.3335 12.9513 17.2712 13.3334 15.8335"
              stroke="#595F70"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {unreadCount > 0 && (
          <p className="absolute -right-1 -top-2 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount}
          </p>
        )}
      </div>
      <div
        className={`absolute z-50 mt-2 origin-top-right rounded-xl border bg-white shadow-lg transition-all duration-300 ease-in-out max-md:-right-12 md:right-0 ${
          open ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <div className="w-80 border-0 text-black shadow-none">
          <div className="flex items-center justify-between border-b p-2">
            <h2 className="text-base font-medium">Notification</h2>
          </div>
          <div className="h-[400px] divide-y overflow-auto">
            <ul
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (scrollHeight - scrollTop == clientHeight) {
                  if (hasMore && !isPending) {
                    setPage(page + 1);
                  }
                }
              }}
              className={`flex max-h-[400px] w-full flex-col overflow-y-auto rounded bg-white py-1 duration-500`}
            >
              {notifications.map((notification, index) => (
                <li
                  key={notification.uid + index}
                  className={cn(
                    'border-b border-gray-200 p-2 transition-colors',
                    !notification.is_read && 'border-white bg-gray-100 hover:bg-gray-200'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-normal">
                          {notification?.kind.split('_').join(' ')}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs font-light text-muted-foreground">
                        {notification.message.split('_').join(' ')}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant={'outline'}
                        className="shrink-0 text-[10px] text-primary"
                        onClick={() => markAsRead(notification.uid)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(notification?.created_at))} ago
                  </span>
                </li>
              ))}

              {isPending && (
                <li className="cursor-pointer px-3 py-2 text-center text-xs text-accent_soft_blue hover:bg-gray-100">
                  Loading...
                </li>
              )}
              {!hasMore && !(notifications?.length == 0) && (
                <li className="cursor-pointer px-3 py-2 text-center text-xs text-accent_soft_blue hover:bg-gray-100">
                  No More Notifications
                </li>
              )}
            </ul>
          </div>
          <div className="flex items-center justify-between border-t p-4">
            <Button className="text-xs text-primary" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
            <Button className="text-[10px] text-primary md:text-xs">See More →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
