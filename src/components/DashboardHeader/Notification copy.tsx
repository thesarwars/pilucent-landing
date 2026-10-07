import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { GetData } from "@/services/FetchMethods";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/app/helpers/api";
import Button from "../ui/RawButton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<any>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["notification", page],
    queryFn: async () => {
      const response = await get(`${"me/notifications"}`, { page: page });
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = async (uid: string) => {
    try {
      await GetData(`me/notifications/${uid}`, ""); // API call to mark as read
      setNotifications(
        notifications.map((notification) =>
          notification.uid === uid
            ? { ...notification, is_read: true }
            : notification,
        ),
      );
      // toast.success("Notification marked as read successfully!"); // Show success toast
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, is_read: true })),
    );
  };

  const unreadCount = notifications?.filter((n) => !n.is_read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center">
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-300 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M15.5 18C15.5 19.933 13.933 21.5 12 21.5C10.067 21.5 8.5 19.933 8.5 18"
              stroke="#090E4F"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M19.2311 18H4.76887C3.79195 18 3 17.208 3 16.2311C3 15.762 3.18636 15.3121 3.51809 14.9803L4.12132 14.3771C4.68393 13.8145 5 13.0514 5 12.2558V9.5C5 5.63401 8.13401 2.5 12 2.5C15.866 2.5 19 5.634 19 9.5V12.2558C19 13.0514 19.3161 13.8145 19.8787 14.3771L20.4819 14.9803C20.8136 15.3121 21 15.762 21 16.2311C21 17.208 20.208 18 19.2311 18Z"
              stroke="#090E4F"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="18" cy="4" r="3" fill="#69E255" />
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
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <div className="w-80 border-0 text-black shadow-none">
          <div className="flex items-center justify-between border-b p-2">
            <h2 className="text-base font-medium">Notification</h2>
          </div>
          <div className="h-[400px] divide-y overflow-auto">
            <ul
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } =
                  e.currentTarget;
                if (scrollHeight - scrollTop == clientHeight) {
                  if (hasMore && !isPending) {
                    setPage(page + 1);
                  }
                }
              }}
              className={`flex max-h-[400px] w-full flex-col overflow-y-auto rounded bg-white py-1 duration-500`}
            >
              {notifications.map((notification) => (
                <li
                  key={notification.uid}
                  className={cn(
                    "border-b border-gray-200 p-2 transition-colors",
                    !notification.is_read &&
                      "border-white bg-gray-100 hover:bg-gray-200",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-normal">
                          {notification?.kind.split("_").join(" ")}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs font-light text-muted-foreground">
                        {notification.message.split("_").join(" ")}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <Button
                        variant={"outline"}
                        className="shrink-0 text-[10px] text-primary"
                        onClick={() => markAsRead(notification.uid)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(notification?.created_at))}{" "}
                    ago
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
            {/* <Button
                className="text-xs text-primary"
                onClick={markAllAsRead}
              >
                Mark All as Read
              </Button> */}
            {/* <Button className="text-[10px] text-primary md:text-xs">
                See More →
              </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
