"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Button from "../ui/RawButton";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import TrialStatus from "./trial-status-card";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/app/redux/store";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

interface MenuItem {
  id: string;
  icon?: any;
  activeIcon?: string;
  label: string;
  href?: string;
  active?: boolean;
  children?: MenuItem[];
}

const Sidebar = ({
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
  const { UserData: user } = useAppSelector((state) => state.userData);
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
      } else if (path?.startsWith("/dashboard/hris")) {
        setExpandedMenus(["hris"]);
      } else if (path?.startsWith("/dashboard/taxes")) {
        setExpandedMenus(["taxes"]);
      } else if (path?.startsWith("/dashboard/reports")) {
        setExpandedMenus(["/dashboard/reports"]);
      }

      if (path?.startsWith("/dashboard/hris/employee")) {
        setExpandedChildMenus(["employee"]);
      } else if (path?.startsWith("/dashboard/hris/payroll")) {
        setExpandedChildMenus(["payroll"]);
      } else if (path?.startsWith("/dashboard/hris/attendance")) {
        setExpandedChildMenus(["attendance"]);
      }

      setIsMounted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const menuItems: MenuItem[] = [
    {
      id: "/dashboard",
      icon: "/icons/dashboard-v2.svg",
      activeIcon: "/icons/dashboard-v2-c.svg",
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      id: "transactions",
      icon: "/icons/transactions-v2.svg",
      activeIcon: "/icons/transactions-v2-c.svg",
      label: "Transactions",
      active: false,
      children: [
        {
          id: "/dashboard/transactions/chart-of-accounts",
          label: "Chart Of Accounts",
          href: "/dashboard/transactions/chart-of-accounts",
        },

        {
          id: "/dashboard/transactions/coa_tree",
          label: "COA Tree",
          href: "/dashboard/transactions/coa_tree",
        },
        {
          id: "/dashboard/transactions/banking",
          label: "Bank Transaction",
          href: "/dashboard/transactions/banking",
        },
        {
          id: "/dashboard/transactions/reconcile",
          label: "Reconcile",
          href: "/dashboard/transactions/reconcile",
        },
        {
          id: "/dashboard/transactions/journal",
          label: "Journal Entry",
          href: "/dashboard/transactions/journal",
        },
        {
          id: "/dashboard/transactions/payment-setup",
          label: "Payment Setup",
          href: "/dashboard/transactions/payment-setup",
        },
      ],
    },
    {
      id: "sales",
      icon: "/icons/sales-v2.svg",
      activeIcon: "/icons/sales-v2-c.svg",
      label: "Sales",
      href: "",
      children: [
        {
          id: "/dashboard/sales/all_sales",
          label: "All Sales",
          href: "/dashboard/sales/all_sales",
        },

        {
          id: "/dashboard/sales/customers",
          label: "Customers",
          href: "/dashboard/sales/customers",
        },
        {
          id: "/dashboard/sales/product_services",
          label: "Products & Services",
          href: "/dashboard/sales/product_services",
        },
        {
          id: "/dashboard/sales/warehouse_location",
          label: "Warehouse Locations",
          href: "/dashboard/sales/warehouse_location",
        },
      ],
    },
    {
      id: "expenses",
      icon: "/icons/expense-v2.svg",
      activeIcon: "/icons/expense-v2-c.svg",
      label: "Expenses",
      href: "",
      children: [
        {
          id: "/dashboard/expenses/expenses",
          label: "Expenses",
          href: "/dashboard/expenses/expenses",
        },

        {
          id: "/dashboard/expenses/suppliers",
          label: "Suppliers",
          href: "/dashboard/expenses/suppliers",
        },
      ],
    },
    {
      id: "/dashboard/reports",
      icon: "/icons/reports-v2.svg",
      activeIcon: "/icons/reports-v2-c.svg",
      label: "Reports",
      href: "/dashboard/reports",
    },
    {
      id: "taxes",
      icon: "/icons/taxes-v2.svg",
      activeIcon: "/icons/taxes-v2-c.svg",
      label: "Taxes",
      href: "",
      children: [
        {
          id: "/dashboard/taxes/taxes_agencies",
          label: "Taxes & Agencies",
          href: "/dashboard/taxes/taxes_agencies",
        },
        {
          id: "/dashboard/taxes/sales",
          label: "Sales Tax",
          href: "/dashboard/taxes/sales",
        },
        {
          id: "/dashboard/taxes/tax-process-tracker",
          label: "Tax Process Tracker",
          href: "/dashboard/taxes/tax-process-tracker",
        },
      ],
    },
    {
      id: "hris",
      icon: "/icons/hris-v2.svg",
      activeIcon: "/icons/hris-v2-c.svg",
      label: "HRIS",
      href: "",
      children: [
        {
          id: "employee",
          label: "Employee",
          href: "",
          children: [
            {
              id: `/dashboard/hris/employee/employees/profile?uid=${user?.employee?.uid}`,
              label: "Employee Profile",
              href: `/dashboard/hris/employee/employees/profile?uid=${user?.employee?.uid}`,
            },
            {
              id: "/dashboard/hris/employee/shifts",
              label: "Shifts",
              href: "/dashboard/hris/employee/shifts",
            },
            {
              id: "/dashboard/hris/employee/departments",
              label: "Departments",
              href: "/dashboard/hris/employee/departments",
            },
            {
              id: "/dashboard/hris/employee/designations",
              label: "Designations",
              href: "/dashboard/hris/employee/designations",
            },
            {
              id: "/dashboard/hris/employee/employees",
              label: "Employees",
              href: "/dashboard/hris/employee/employees",
            },
            {
              id: "/dashboard/hris/employee/employee-leaves",
              label: "Employee Leave",
              href: "/dashboard/hris/employee/employee-leaves",
            },
            {
              id: "/dashboard/hris/employee/holiday",
              label: "Holiday",
              href: "/dashboard/hris/employee/holiday",
            },
            {
              id: "/dashboard/hris/employee/leave-type",
              label: "Leave Type",
              href: "/dashboard/hris/employee/leave-type",
            },
            {
              id: "/dashboard/hris/employee/leave-balance",
              label: "Leave Balance",
              href: "/dashboard/hris/employee/leave-balance",
            },
            {
              id: "/dashboard/hris/employee/leave-encashments",
              label: "Leave Encashment",
              href: "/dashboard/hris/employee/leave-encashments",
            },
            {
              id: "/dashboard/hris/employee/leave-approval",
              label: "Leave Approval",
              href: "/dashboard/hris/employee/leave-approval",
            },
          ],
        },
        {
          id: "payroll",
          label: "Payroll",
          href: "",
          children: [
            {
              id: "/dashboard/hris/payroll/salaries",
              label: "Employee Salary",
              href: "/dashboard/hris/payroll/salaries",
            },

            {
              id: "/dashboard/hris/payroll/addition-deductions",
              label: "Addition & Deduction",
              href: "/dashboard/hris/payroll/addition-deductions",
            },
            {
              id: "/dashboard/hris/payroll/salary_process",
              label: "Salary Process",
              href: "/dashboard/hris/payroll/salary_process",
            },
            {
              id: "/dashboard/hris/payroll/payroll_tax",
              label: "Payroll Tax",
              href: "/dashboard/hris/payroll/payroll_tax",
            },
            {
              id: "/dashboard/hris/payroll/deduction_contribution",
              label: "Deduction Contribution",
              href: "/dashboard/hris/payroll/deduction_contribution",
            },

            {
              id: "/dashboard/hris/payroll/pay-schedules",
              label: "Pay Schedule",
              href: "/dashboard/hris/payroll/pay-schedules",
            },

            {
              id: "/dashboard/hris/payroll/payment",
              label: "Salary & Payments",
              href: "/dashboard/hris/payroll/payment",
            },
            {
              id: "/dashboard/hris/payroll/settings",
              label: "Payroll Settings",
              href: "/dashboard/hris/payroll/settings",
            },
          ],
        },
        {
          id: "attendance",
          label: "Attendance",
          href: "",
          children: [
            {
              id: "/dashboard/hris/attendance/attendance_list",
              label: "Attendance List",
              href: "/dashboard/hris/attendance/attendance_list",
            },

            {
              id: "/dashboard/hris/attendance/attendance_process",
              label: "Attendance Process",
              href: "/dashboard/hris/attendance/attendance_process",
            },
            {
              id: "/dashboard/hris/attendance/daily_attendance",
              label: "Daily Attendance",
              href: "/dashboard/hris/attendance/daily_attendance",
            },
            {
              id: "/dashboard/hris/attendance/punch_data_import",
              label: "Punch Data Import",
              href: "/dashboard/hris/attendance/punch_data_import",
            },
          ],
        },
        {
          id: "/dashboard/hris/reports",
          label: "Payroll Reports",
          href: "/dashboard/hris/reports",
        },
      ],
    },
    {
      id: "admin",
      icon: "/icons/admin-v2.svg",
      activeIcon: "/icons/admin-v2-c.svg",
      label: "Admin",
      href: "",
      children: [
        {
          id: "/dashboard/admin/currency_management",
          label: "Currencies",
          href: "/dashboard/admin/currency_management",
        },
        {
          id: "/dashboard/admin/company_settings",
          label: "Company Settings",
          href: "/dashboard/admin/company_settings",
        },
        {
          id: "/dashboard/admin/audit_log",
          label: "Audit Logs",
          href: "/dashboard/admin/audit_log",
        },
        {
          id: "/dashboard/admin/terms",
          label: "Terms",
          href: "/dashboard/admin/terms",
        },
        {
          id: "/dashboard/admin/attachment",
          label: "Attachments",
          href: "/dashboard/admin/attachment",
        },
        {
          id: "/dashboard/admin/documents",
          label: "Documents",
          href: "/dashboard/admin/documents",
        },
        {
          id: "/dashboard/admin/roles",
          label: "Roles",
          href: "/dashboard/admin/roles",
        },
        {
          id: "/dashboard/admin/payment_management",
          label: "Payments",
          href: "/dashboard/admin/payment_management",
        },
      ],
    },
    {
      id: "/dashboard/support",
      icon: "/images/icons/support.svg",
      activeIcon: "/images/icons/support.svg",
      label: "Support",
      href: "/dashboard/support",
    },
  ];
  // Resizing state (desktop only)
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(propCollapsed ? 64 : 255);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Constants
  const MIN_WIDTH = 70;
  const MAX_WIDTH = 400;
  const COLLAPSED_WIDTH = 65;
  const EXPANDED_WIDTH = 255;
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
      <li key={item.id} className="relative pb-4">
        <div className="relative z-[100000]">
          <Link
            href={item.href || "#"}
            className={cn(
              "group z-[1000] flex items-center gap-2 rounded-xl px-2 py-2 transition-all duration-300",
              level > 0 ? "ml-16" : "",
              (selectedRoute?.includes(item?.id) && item?.href) ||
                expandedMenus?.includes(item?.id)
                ? "bg-[#090E4F] text-white shadow-md"
                : "text-[#090E4F] hover:bg-indigo-800/10",
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
                src={
                  (selectedRoute?.includes(item?.id) && item?.href) ||
                  expandedMenus?.includes(item?.id)
                    ? item?.activeIcon
                    : item?.icon
                }
                width={100}
                height={100}
                alt="icon"
                className={cn(
                  "h-6 w-5 pl-0.5 transition-colors",
                  selectedRoute?.includes(item?.id) ||
                    expandedMenus?.includes(item?.id)
                    ? "fill-white text-white brightness-200"
                    : "text-gray-400 group-hover:text-white",
                )}
              />
            )}
            <span
              className={cn(
                "whitespace-nowrap",
                collapsed && !hovering && !isMobile
                  ? "w-0 opacity-0"
                  : "opacity-100 transition-all duration-200",
                level > 0 ? "" : "",
              )}
            >
              {item.label}
            </span>
            {hasChildren && (
              <ChevronDown
                className={cn(
                  "ml-auto h-4 w-4 transition-all duration-200",
                  isMenuExpanded ? "rotate-180" : "",
                  collapsed && !hovering && !isMobile
                    ? "w-0 opacity-0"
                    : "opacity-100",
                  item.active
                    ? "text-white"
                    : "text-gray-500 group-hover:text-white",
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

                    <div className="z-[10] h-6 w-6 -translate-x-6 -translate-y-2 rounded-bl-2xl border-b border-l border-[#090E4F]"></div>
                    <Link
                      href={child.href || "#"}
                      className={cn(
                        "group -ml-8 flex w-full flex-1 items-center rounded-2xl px-4 py-2.5 transition-all duration-200",
                        selectedRoute?.includes(child?.id) ||
                          selectedRoute?.[0].startsWith(child?.id)
                          ? "bg-[#090E4F] text-white"
                          : "text-[#090E4F] hover:bg-indigo-800/10",
                      )}
                      onClick={() => {
                        setSelectedRoute([child?.id]);
                      }}
                    >
                      <span className="whitespace-nowrap">{child.label}</span>
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
                      <div className="z-[10] h-6 w-6 -translate-x-6 -translate-y-2 rounded-bl-2xl border-b border-l border-[#090E4F]"></div>
                      <Link
                        href={child.href || "#"}
                        className={cn(
                          "group z-[5000] -ml-8 flex w-full flex-1 items-center gap-2 rounded-xl px-4 py-2.5",
                          expandedChildMenus.includes(child?.id)
                            ? "bg-[#090E4F] text-white"
                            : "text-[#090E4F] hover:bg-indigo-800/10",
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
                        <span className="whitespace-nowrap">{child.label}</span>
                        {hasChildChildren && (
                          <ChevronDown
                            className={cn(
                              "ml-auto h-4 w-4 transition-all duration-200",
                              isChildMenuExpanded ? "rotate-180" : "",
                              expandedChildMenus.includes(child?.id)
                                ? "text-white"
                                : "text-gray-500",
                            )}
                          />
                        )}
                      </Link>
                    </div>
                    {showChildChildren && (
                      <ul
                        className={`relative ${child?.id == "employee" ? "-ml-6" : child?.id == "attendance" ? "-ml-8" : ""} mt-8 -translate-x-16`}
                      >
                        <div className="absolute bottom-0 left-0 top-0 -z-[1] -translate-x-[24px] -translate-y-[30px] overflow-hidden rounded-2xl border-r border-[#090E4F]"></div>
                        {/* <div
                          className={`absolute ${child?.id == "attendance" ? "" : "hidden"} -left-10 bottom-0 top-0 -z-[1] w-[1px] -translate-x-[24px] -translate-y-[30px] overflow-hidden rounded-2xl bg-accent_primary`}
                        ></div> */}
                        {child.children?.map((grandChild: any) => (
                          <li key={grandChild.id}>
                            <div className="z-[10] h-4 w-6 -translate-x-6 translate-y-[17px] rounded-bl-2xl border-b border-l border-[#090E4F]"></div>
                            <Link
                              onClick={() => {
                                setSelectedRoute([grandChild?.id]);
                              }}
                              href={grandChild.href || "#"}
                              className={`flex items-center text-nowrap rounded-lg px-2 py-1.5 text-[13px] ${selectedRoute?.includes(grandChild?.id) ? "bg-[#090E4F] text-white" : "text-[#090E4F] hover:bg-indigo-800/10"}`}
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
            "fixed left-0 top-0 z-50 flex h-full transform flex-col bg-white text-sm font-light text-white transition-transform duration-300 ease-in-out",
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
                <span className="font-bold text-white">B</span>
              </div>
              <span className="text-gray-700">balanzify</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileToggle}
              className="text-gray-300 transition-colors hover:bg-indigo-800/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-4">
              <ul className="space-y-1.5">
                {menuItems.map((item) => renderMenuItem(item))}
              </ul>
            </nav>
          </div>
          <div className="overflow-x-hidden border-t border-indigo-900/50 p-2">
            <TrialStatus isCollapsed={collapsed} isHovering={hovering} />
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
          "relative z-10 hidden h-full flex-col overflow-x-hidden bg-white text-sm font-normal text-white md:flex",
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
          className={`flex h-16 items-center bg-[#EAE3F9] ${collapsed && !hovering ? "justify-center" : "justify-between px-4"}`}
        >
          <div
            className={cn(
              "flex items-center overflow-hidden text-xl font-bold",
              "opacity-100 transition-all duration-200",
            )}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center ${collapsed && !hovering ? "" : "mr-1"}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
              >
                <rect width="28" height="28" rx="8" fill="#6A57E3" />
                <path
                  d="M8.13369 11.5455V10.2531C8.13369 7.69076 10.3049 5.61328 12.9827 5.61328H15.5325C18.2104 5.61328 20.3816 7.69076 20.3816 10.2531V12.1995C20.3816 14.6533 18.3032 16.642 15.7387 16.642H6.13188C5.70324 16.642 5.33353 16.3206 5.32616 15.9105C5.3188 15.4919 5.67085 15.1508 6.10538 15.1508H15.7387C17.4415 15.1508 18.8217 13.8302 18.8217 12.2009V10.2545C18.8217 8.51668 17.3487 7.10726 15.5325 7.10726H12.9827C11.1666 7.10726 9.69357 8.51668 9.69357 10.2545V11.375"
                  fill="white"
                />
                <path
                  d="M9.74501 16.6422V20.8916H16.7947C19.1765 20.8916 21.115 19.0368 21.115 16.7578C21.115 14.4788 19.1765 12.624 16.7947 12.624H6.10527C5.67515 12.624 5.32605 12.2899 5.32605 11.8784C5.32605 11.4668 5.67515 11.1328 6.10527 11.1328H16.7947C20.0368 11.1328 22.6749 13.6571 22.6749 16.7592C22.6749 19.8613 20.0368 22.3856 16.7947 22.3856H8.18512V16.6436"
                  fill="white"
                />
                <path
                  d="M8.13369 11.5455V10.2531C8.13369 7.69076 10.3049 5.61328 12.9827 5.61328H15.5325C18.2104 5.61328 20.3816 7.69076 20.3816 10.2531V12.1995C20.3816 14.6533 18.3032 16.642 15.7387 16.642H6.13188C5.70324 16.642 5.33353 16.3206 5.32616 15.9105C5.3188 15.4919 5.67085 15.1508 6.10538 15.1508H15.7387C17.4415 15.1508 18.8217 13.8302 18.8217 12.2009V10.2545C18.8217 8.51668 17.3487 7.10726 15.5325 7.10726H12.9827C11.1666 7.10726 9.69357 8.51668 9.69357 10.2545V11.375"
                  fill="white"
                />
                <path
                  d="M9.74501 16.6422V20.8916H16.7947C19.1765 20.8916 21.115 19.0368 21.115 16.7578C21.115 14.4788 19.1765 12.624 16.7947 12.624H6.10527C5.67515 12.624 5.32605 12.2899 5.32605 11.8784C5.32605 11.4668 5.67515 11.1328 6.10527 11.1328H16.7947C20.0368 11.1328 22.6749 13.6571 22.6749 16.7592C22.6749 19.8613 20.0368 22.3856 16.7947 22.3856H8.18512V16.6436"
                  fill="white"
                />
                <path
                  d="M8.13369 11.5455V10.2531C8.13369 7.69076 10.3049 5.61328 12.9827 5.61328H15.5325C18.2104 5.61328 20.3816 7.69076 20.3816 10.2531V12.1995C20.3816 14.6533 18.3032 16.642 15.7387 16.642H6.13188C5.70324 16.642 5.33353 16.3206 5.32616 15.9105C5.3188 15.4919 5.67085 15.1508 6.10538 15.1508H15.7387C17.4415 15.1508 18.8217 13.8302 18.8217 12.2009V10.2545C18.8217 8.51668 17.3487 7.10726 15.5325 7.10726H12.9827C11.1666 7.10726 9.69357 8.51668 9.69357 10.2545V11.375"
                  fill="white"
                />
                <path
                  d="M9.74501 16.6422V20.8916H16.7947C19.1765 20.8916 21.115 19.0368 21.115 16.7578C21.115 14.4788 19.1765 12.624 16.7947 12.624H6.10527C5.67515 12.624 5.32605 12.2899 5.32605 11.8784C5.32605 11.4668 5.67515 11.1328 6.10527 11.1328H16.7947C20.0368 11.1328 22.6749 13.6571 22.6749 16.7592C22.6749 19.8613 20.0368 22.3856 16.7947 22.3856H8.18512V16.6436"
                  fill="white"
                />
              </svg>
            </div>
            <span
              className={`${collapsed && !hovering ? "hidden" : "visible"} text-[#0e0e10]`}
            >
              balanzify
            </span>
          </div>
          <p
            title="The beta version does not represent the final quality"
            className={`-translate-x-10 -translate-y-2 rounded bg-accent_secondary px-[7px] py-0 text-[11px] uppercase text-white ${collapsed && !hovering ? "hidden" : "visible"}`}
          >
            Beta
          </p>
        </div>

        <div
          style={{
            scrollbarWidth: "thin",
            msOverflowStyle: "none",
            scrollbarColor: "#090E4F transparent",
          }}
          className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden"
        >
          <nav className="flex-1 px-3 py-4 pt-6">
            <ul className="space-y-1.5">
              {menuItems.map((item) => renderMenuItem(item))}
            </ul>
          </nav>
        </div>
        <div className="overflow-x-hidden p-2">
          <TrialStatus isCollapsed={collapsed} isHovering={hovering} />
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

export default Sidebar;
