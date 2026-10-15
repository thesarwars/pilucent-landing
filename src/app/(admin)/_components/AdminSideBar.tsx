"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/RawButton";
import { ChevronDownIcon, Cross1Icon } from "@radix-ui/react-icons";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

interface MenuItem {
  id: string;
  icon?: any;
  label: string;
  href?: string;
  active?: boolean;
  children?: MenuItem[];
}

const AdminSideBar = ({
  collapsed: propCollapsed,
  onToggle,
  mobileOpen = false,
  onMobileToggle,
}: SidebarProps) => {
  // Internal state for sidebar
  const [collapsed, setCollapsed] = useState(propCollapsed);
  const [hovering, setHovering] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string[]>(["/dashboard"]);
  const path = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [expandedChildMenus, setExpandedChildMenus] = useState<string[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (path) {
      setSelectedRoute([path]);
      if (path?.startsWith("/dashboard/transactions")) {
        setExpandedMenus(["transactions"]);
      } else if (path?.startsWith("/dashboard/sales")) {
        setExpandedMenus(["sales"]);
      } else if (path?.startsWith("/dashboard/expenses")) {
        setExpandedMenus(["expenses"]);
      } else if (path?.startsWith("/dashboard/admin")) {
        setExpandedMenus(["admin"]);
      } else if (path?.startsWith("/admin/subscription/")) {
        setExpandedMenus(["subscription-v2"]);
      }
      setIsMounted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const menuItems: MenuItem[] = [
    {
      id: "/admin",
      icon: "/images/icons/dashboard.png",
      label: "Dashboard",
      href: "/admin",
    },
    {
      id: "/admin/users",
      icon: "/images/icons/dashboard.png",
      label: "User Managements",
      href: "/admin/users",
    },
    {
      id: "/admin/companies",
      icon: "/images/icons/company.svg",
      label: "Company",
      href: "/admin/companies",
    },
    // {
    //   id: "/admin/subscriptions",
    //   icon: "/images/icons/subscriptions.svg",
    //   label: "Subscriptions",
    //   href: "/admin/subscriptions",
    // },
    {
      id: "subscription-v2",
      icon: "/images/icons/subscriptions.svg",
      label: "Subscription",
      href: "",
      children: [
        {
          id: "/admin/subscription/dashboard",
          label: "Dashboard",
          href: "/admin/subscription/dashboard",
        },
        {
          id: "/admin/subscription/plans",
          label: "Plans",
          href: "/admin/subscription/plans",
        },
        {
          id: "/admin/subscription/modules-features",
          label: "Modules & Features",
          href: "/admin/subscription/modules-features",
        },
        {
          id: "/admin/subscription/limits-metrics",
          label: "Limits & Metrics",
          href: "/admin/subscription/limits-metrics",
        },
        {
          id: "/admin/subscription/add-ons",
          label: "Add-ons",
          href: "/admin/subscription/add-ons",
        },
        {
          id: "/admin/subscription/coupons-offers",
          label: "Coupons & Offers",
          href: "/admin/subscription/coupons-offers",
        },
        {
          id: "/admin/subscription/referral-program",
          label: "Referral Program",
          href: "/admin/subscription/referral-program",
        },
        {
          id: "/admin/subscription/trials",
          label: "Trials",
          href: "/admin/subscription/trials",
        },
        {
          id: "/admin/subscription/tenant-subscriptions",
          label: "Tenant Subscriptions",
          href: "/admin/subscription/tenant-subscriptions",
        },
        {
          id: "/admin/subscription/invoices-payments",
          label: "Invoices & Payments",
          href: "/admin/subscription/invoices-payments",
        },
        {
          id: "/admin/subscription/audit-logs",
          label: "Audit Logs",
          href: "/admin/subscription/audit-logs",
        },
      ],
    },
    {
      id: "/admin/accountant-requests",
      icon: "/images/icons/subscriptions.svg",
      label: "Accountant Requests",
      href: "/admin/accountant-requests",
    },
    {
      id: "/admin/schedules",
      icon: "/images/icons/support.svg",
      label: "Schedule",
      href: "/admin/schedules",
    },
    {
      id: "/admin/support",
      icon: "/images/icons/support.svg",
      label: "Support & Tickets",
      href: "/admin/support",
    },
    {
      id: "/admin/agents",
      icon: "/images/icons/support.svg",
      label: "Agents",
      href: "/admin/agents",
    },
  ];
  // Resizing state (desktop only)
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(propCollapsed ? 64 : 256);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Constants
  const MIN_WIDTH = 65;
  const MAX_WIDTH = 400;
  const COLLAPSED_WIDTH = 65;
  const EXPANDED_WIDTH = 256;
  const MOBILE_WIDTH = 280;

  // Sync with props
  useEffect(() => {
    if (!isMobile) {
      setCollapsed(propCollapsed);
      setSidebarWidth(propCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH);
    }
  }, [propCollapsed, isMobile]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    if (!isMobile || !mobileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onMobileToggle?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, mobileOpen, onMobileToggle]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, mobileOpen]);

  const toggleMenu = (menuId: string) => {
    if (expandedMenus.includes(menuId)) {
      setExpandedMenus([]);
    } else {
      setExpandedMenus([menuId]);
    }
  };

  const isExpanded = (menuId: string) => expandedMenus.includes(menuId);

  const handleMouseEnter = () => {
    if (!isMobile && collapsed) {
      setHovering(true);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!isMobile) {
      // When collapsed and hovering, check if mouse is actually leaving the expanded area
      if (collapsed && hovering) {
        const rect = sidebarRef.current?.getBoundingClientRect();
        if (rect) {
          const mouseX = e.clientX;
          const mouseY = e.clientY;

          // Check if mouse is still within the expanded sidebar area
          const isWithinExpandedArea =
            mouseX >= rect.left &&
            mouseX <= rect.left + EXPANDED_WIDTH &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom;

          if (!isWithinExpandedArea) {
            setHovering(false);
          }
        }
      } else {
        setHovering(false);
      }
    }
  };

  // Resize handlers with useCallback for better performance
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || isMobile) return;

      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, e.clientX));
      setSidebarWidth(newWidth);

      // Auto-collapse/expand logic
      const shouldBeCollapsed = newWidth <= 120;

      if (shouldBeCollapsed !== collapsed) {
        setCollapsed(shouldBeCollapsed);
        onToggle();
      }
    },
    [isResizing, isMobile, collapsed, onToggle],
  );

  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);

    // Snap to proper width
    if (collapsed) {
      setSidebarWidth(COLLAPSED_WIDTH);
    } else if (sidebarWidth < 200) {
      setSidebarWidth(EXPANDED_WIDTH);
    }

    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    document.body.style.pointerEvents = "";
  }, [isResizing, collapsed, sidebarWidth]);

  // Add/remove event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      document.body.style.pointerEvents = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.body.style.pointerEvents = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const startResizing = (e: React.MouseEvent) => {
    if (isMobile) return;
    e.preventDefault();
    setIsResizing(true);
  };

  // Calculate effective width
  const getEffectiveWidth = () => {
    if (isMobile) return MOBILE_WIDTH;
    // When collapsed, always return collapsed width for layout purposes
    if (collapsed) return COLLAPSED_WIDTH;
    return sidebarWidth;
  };

  const effectiveWidth = getEffectiveWidth();

  const renderMenuItem = (
    item: MenuItem,
    level = 0,
    isLast = false,
    isFirst = false,
  ) => {
    const hasChildren = item.children && item.children.length > 0;
    const isMenuExpanded = isExpanded(item.id);
    const showChildren = hasChildren && isMenuExpanded;

    return (
      <li key={item.id} className="relative pb-4 text-sm">
        <div className="relative z-[100000]">
          <Link
            href={item.href || "#"}
            className={cn(
              "group z-[1000] flex items-center gap-2 rounded-[8px] px-2 py-2 transition-all duration-300",
              level > 0 ? "ml-16" : "",
              (selectedRoute?.includes(item?.id) && item?.href) ||
                expandedMenus?.includes(item?.id)
                ? "bg-accent_secondary text-white shadow-md"
                : "hover:bg-indigo-800/30 hover:text-white",
            )}
            onClick={(e) => {
              item?.href && setSelectedRoute([item?.id]);
              if (hasChildren) {
                e.preventDefault();
                toggleMenu(item.id);
              }
            }}
          >
            {level === 0 && (
              <Image
                src={item?.icon}
                width={100}
                height={100}
                alt="icon"
                className={cn(
                  "h-6 w-5 pl-0.5 transition-colors",
                  selectedRoute?.includes(item?.id) ||
                    expandedMenus?.includes(item?.id)
                    ? "text-white brightness-200"
                    : "text-gray-400 group-hover:text-white",
                )}
              />
            )}
            <span
              className={cn(
                "whitespace-nowrap font-normal",
                collapsed && !hovering && !isMobile
                  ? "w-0 opacity-0"
                  : "opacity-100 transition-all duration-200",
                level > 0 ? "text-sm" : "text-sm",
              )}
            >
              {item.label}
            </span>
            {hasChildren && (
              <ChevronDownIcon
                className={cn(
                  "ml-auto h-4 w-4 transition-all duration-200",
                  isMenuExpanded ? "rotate-180" : "",
                  collapsed && !hovering && !isMobile
                    ? "w-0 opacity-0"
                    : "opacity-100",
                  item.active
                    ? "text-white"
                    : "text-gray-400 group-hover:text-white",
                )}
              />
            )}
          </Link>
        </div>

        {showChildren && (
          <ul
            className={cn(
              "relative ml-4 mt-4 space-y-0.5 pl-6",
              collapsed && !hovering && !isMobile ? "hidden" : "",
            )}
          >
            <div className="absolute bottom-0 left-0 top-0 -z-[1] w-[1px] -translate-y-[30px] overflow-hidden rounded-2xl bg-accent_line_gray"></div>
            {item.children?.map((child, index) => {
              const hasChildChildren =
                child.children && child.children.length > 0;
              const isChildMenuExpanded = expandedChildMenus.includes(child.id);
              const showChildChildren = hasChildChildren && isChildMenuExpanded;
              if (!hasChildChildren) {
                return (
                  <li
                    key={child.id}
                    className="flex items-center justify-center gap-1"
                  >
                    {/* Elbow connector using borders */}

                    <div className="z-[10] h-6 w-6 -translate-x-6 -translate-y-2 rounded-bl-2xl border-b border-l border-accent_line_gray"></div>
                    <Link
                      href={child.href || "#"}
                      className={cn(
                        "group -ml-8 flex w-full flex-1 items-center rounded-xl px-4 py-2.5 transition-all duration-200",
                        selectedRoute?.includes(child?.id) ||
                          selectedRoute?.[0].startsWith(child?.id)
                          ? "bg-accent_selected_bg text-white"
                          : "text-gray-300 hover:bg-indigo-800/30 hover:text-white",
                      )}
                      onClick={() => {
                        setSelectedRoute([child?.id]);
                      }}
                    >
                      <span className="whitespace-nowrap text-sm font-medium">
                        {child.label}
                      </span>
                    </Link>
                  </li>
                );
              } else {
                return (
                  <li
                    key={child.id}
                    className="z-[5000] flex items-start justify-between gap-1"
                  >
                    <div className="flex items-center gap-1">
                      {/* Elbow connector using borders */}
                      <div className="z-[10] h-6 w-6 -translate-x-6 -translate-y-2 rounded-bl-2xl border-b border-l border-accent_line_gray"></div>
                      <Link
                        href={child.href || "#"}
                        className={cn(
                          "group z-[5000] -ml-8 flex w-full flex-1 items-center gap-2 rounded-xl px-4 py-2.5",
                          expandedChildMenus.includes(child?.id)
                            ? "bg-accent_selected_bg text-white"
                            : "text-gray-300 hover:bg-indigo-800/30 hover:text-white",
                        )}
                        onClick={(e) => {
                          if (hasChildChildren) {
                            e.preventDefault();
                            setExpandedChildMenus((prev) =>
                              prev.includes(child.id)
                                ? prev.filter((id) => id !== child.id)
                                : [...prev, child.id],
                            );
                          }
                        }}
                      >
                        <span className="whitespace-nowrap text-sm font-medium">
                          {child.label}
                        </span>
                        {hasChildChildren && (
                          <ChevronDownIcon
                            className={cn(
                              "ml-auto h-4 w-4 transition-all duration-200",
                              isChildMenuExpanded ? "rotate-180" : "",
                              expandedChildMenus.includes(child?.id)
                                ? "text-white"
                                : "text-gray-400 group-hover:text-white",
                            )}
                          />
                        )}
                      </Link>
                    </div>
                    {showChildChildren && (
                      <ul className={`relative -ml-72 mt-8 -translate-x-16`}>
                        <div className="absolute bottom-0 left-0 top-0 -z-[1] w-[1px] -translate-x-[24px] -translate-y-[32px] overflow-hidden rounded-2xl bg-accent_line_gray"></div>
                        {child.children?.map((grandChild: any) => (
                          <li key={grandChild.id}>
                            <div className="z-[10] h-6 w-6 -translate-x-6 translate-y-[18px] rounded-bl-2xl border-b border-l border-accent_line_gray"></div>
                            <Link
                              onClick={() => {
                                setSelectedRoute([grandChild?.id]);
                              }}
                              href={grandChild.href || "#"}
                              className={`hover:text-whit flex items-center text-nowrap rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-indigo-800/30 ${selectedRoute?.includes(grandChild?.id) ? "bg-accent_selected_bg text-white" : ""}`}
                            >
                              {grandChild.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }
            })}
          </ul>
        )}
      </li>
    );
  };

  // Mobile sidebar overlay
  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onMobileToggle}
          />
        )}

        <aside
          ref={sidebarRef}
          className={cn(
            "fixed left-0 top-0 z-50 flex h-full transform flex-col bg-accent_primary text-white transition-transform duration-300 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
          style={{
            width: "280px",
            // backgroundImage: "linear-gradient(to bottom, #1a1155, #191052)",
          }}
        >
          <div className="flex h-16 items-center justify-between border-b border-indigo-900/50 px-4">
            <div className="flex items-center text-xl font-bold">
              <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                pilucent
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileToggle}
              className="text-gray-300 transition-colors hover:bg-indigo-800/50 hover:text-white"
            >
              <Cross1Icon className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-4">
              <ul className="space-y-1.5">
                {menuItems.map((item) => renderMenuItem(item))}
              </ul>
            </nav>
          </div>
        </aside>

        <style jsx>{`
          @keyframes slideInFromLeft {
            from {
              opacity: 0;
              transform: translateX(-20px) translateY(26px);
            }
            to {
              opacity: 1;
              transform: translateX(0) translateY(26px);
            }
          }
        `}</style>
      </>
    );
  }

  // Desktop sidebar
  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "relative z-10 hidden h-full flex-col overflow-x-hidden bg-accent_primary text-sm font-normal text-white md:flex",
          !isResizing && "transition-all duration-300 ease-in-out",
          // Add absolute positioning when collapsed and hovering
          hovering && collapsed && "absolute left-0 top-0 z-50 shadow-2xl",
        )}
        style={{
          width:
            hovering && collapsed
              ? `${EXPANDED_WIDTH}px`
              : `${effectiveWidth}px`,
          // backgroundImage: "linear-gradient(to bottom, #1a1155, #191052)",
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`flex h-16 items-center border-b border-indigo-900/50 ${collapsed && !hovering ? "justify-center" : "justify-between px-4"}`}
        >
          <div
            className={cn(
              "flex items-center overflow-hidden text-xl font-bold",
              "opacity-100 transition-all duration-200",
            )}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg bg-accent_secondary shadow-lg ${collapsed && !hovering ? "" : "mr-3"}`}
            >
              <Image
                src="/icons/logo.svg"
                width={100}
                height={100}
                alt="logo"
                className="h-6 w-6 object-contain"
              />
            </div>
            <span
              className={`${collapsed && !hovering ? "hidden" : "visible"} bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent`}
            >
              pilucent
            </span>
          </div>
        </div>

        <div className="scrollbar-thin md:scrollbar scrollbar-thumb-green-500 scrollbar-track-green-100 flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <nav className="flex-1 px-3 py-4 pt-6">
            <ul className="space-y-1.5">
              {menuItems.map((item) => renderMenuItem(item))}
            </ul>
          </nav>
        </div>

        {/* Resize handle - much more visible and easier to grab */}
        <div
          className={cn(
            "absolute right-0 top-0 z-50 flex h-full w-4 cursor-ew-resize items-center justify-center",
            isResizing
              ? "bg-indigo-500/30"
              : "bg-transparent hover:bg-indigo-500/20",
          )}
          onMouseDown={startResizing}
          title="Drag to resize sidebar"
        >
          {/* Visual indicator */}
          <div className="h-8 w-1 rounded-full bg-gray-400/50 transition-colors hover:bg-indigo-400" />
        </div>
      </aside>

      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px) translateY(26px);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(26px);
          }
        }
      `}</style>
    </>
  );
};

export default AdminSideBar;
