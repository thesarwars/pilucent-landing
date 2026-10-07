/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import type React from 'react';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Button from '../ui/RawButton';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';
import TrialStatus from './trial-status-card';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/app/redux/store';

interface SideBarProps {}

interface MenuItem {
  id: string;
  icon?: any;
  activeIcon?: string;
  label: string;
  href?: string;
  active?: boolean;
  permission?: string;
  children?: MenuItem[];
  show?: boolean;
}

const SideBar = ({}: SideBarProps) => {
  // Internal state for SideBar - collapsed and mobile logic moved inside
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string[]>(['/dashboard']);
  const path = usePathname();
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const { UserData: user } = useAppSelector((state) => state.userData);
  const [isMounted, setIsMounted] = useState(false);
  const [expandedChildMenus, setExpandedChildMenus] = useState<string[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fn = async () => {
      if (path) {
        setSelectedRoute([path]);
        if (path?.startsWith('/dashboard/transactions')) {
          setExpandedMenus(['transactions']);
        } else if (path?.startsWith('/dashboard/sales')) {
          setExpandedMenus(['sales']);
        } else if (path?.startsWith('/dashboard/expenses')) {
          setExpandedMenus(['expenses']);
        } else if (path?.startsWith('/dashboard/admin')) {
          setExpandedMenus(['admin']);
        } else if (path?.startsWith('/dashboard/hris')) {
          setExpandedMenus(['hris']);
        } else if (path?.startsWith('/dashboard/taxes')) {
          setExpandedMenus(['taxes']);
        } else if (path?.startsWith('/dashboard/reports')) {
          setExpandedMenus(['/dashboard/reports']);
        }

        if (path?.startsWith('/dashboard/hris/employee')) {
          setExpandedChildMenus(['employee']);
        } else if (path?.startsWith('/dashboard/hris/payroll')) {
          setExpandedChildMenus(['payroll']);
        } else if (path?.startsWith('/dashboard/hris/attendance')) {
          setExpandedChildMenus(['attendance']);
        }

        setIsMounted(true);
      }
    };
    fn();

    if (path?.includes('/dashboard/snap-expense')) {
      setCollapsed(true);
    }
  }, [path]);

  // Restore persisted collapse preference on mount (desktop).
  // Skip on snap-expense, which always forces the rail collapsed.
  useEffect(() => {
    if (path?.includes('/dashboard/snap-expense')) return;
    try {
      const saved = localStorage.getItem('sidebar_collapsed');
      if (saved !== null) setCollapsed(saved === 'true');
    } catch {
      // ignore unavailable storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const EmployeeHrefs = [
    {
      id: '/dashboard/hris/employee/shifts',
      label: 'Shifts',
      href: '/dashboard/hris/employee/shifts',
      permission: 'view_companyshift',
    },
    {
      id: '/dashboard/hris/employee/departments',
      label: 'Departments',
      href: '/dashboard/hris/employee/departments',
      permission: 'view_companydepartment',
    },
    {
      id: '/dashboard/hris/employee/designations',
      label: 'Designations',
      href: '/dashboard/hris/employee/designations',
      permission: 'view_companydesignation',
    },
    {
      id: '/dashboard/hris/employee/employees',
      label: 'Employees',
      href: '/dashboard/hris/employee/employees',
      permission: 'view_employee',
    },
    {
      id: '/dashboard/hris/employee/employee-leaves',
      label: 'Leave Requests',
      href: '/dashboard/hris/employee/employee-leaves',
      permission: 'view_leaverequests',
    },
    {
      id: '/dashboard/hris/employee/holiday',
      label: 'Holiday',
      href: '/dashboard/hris/employee/holiday',
      permission: 'view_holiday',
    },
    {
      id: '/dashboard/hris/employee/leave-type',
      label: 'Leave Type',
      href: '/dashboard/hris/employee/leave-type',
      permission: 'view_leavetype',
    },
    {
      id: '/dashboard/hris/employee/leave-balance',
      label: 'Leave Balance',
      href: '/dashboard/hris/employee/leave-balance',
      permission: 'view_leavebalance',
    },
    {
      id: '/dashboard/hris/employee/leave-encashments',
      label: 'Leave Encashment',
      href: '/dashboard/hris/employee/leave-encashments',
      permission: 'view_leaveencashment',
    },
    {
      id: '/dashboard/hris/employee/leave-approval',
      label: 'Leave Approval',
      href: '/dashboard/hris/employee/leave-approval',
      permission: 'view_leaveapproval',
    },
  ];

  const menuItems: MenuItem[] = [
    {
      id: '/dashboard',
      icon: '/icons/sidebar/dashboard-v2.svg',
      activeIcon: '/icons/sidebar/dashboard-v2.svg',
      label: 'Dashboard',
      href: '/dashboard',
      permission: 'view_dashboard',
      show: !user?.is_employee || user?.is_admin,
    },
    {
      id: 'transactions',
      icon: '/icons/sidebar/transactions-v2.svg',
      activeIcon: '/icons/sidebar/transactions-v2.svg',
      label: 'Transactions',
      active: false,
      children: [
        {
          id: '/dashboard/transactions/chart-of-accounts',
          label: 'Chart Of Accounts',
          href: '/dashboard/transactions/chart-of-accounts',
          permission: 'view_chartofaccount',
        },

        {
          id: '/dashboard/transactions/coa_tree',
          label: 'COA Tree',
          href: '/dashboard/transactions/coa_tree',
          permission: 'view_chartofaccount',
        },
        {
          id: '/dashboard/transactions/banking',
          label: 'Bank Transaction',
          href: '/dashboard/transactions/banking',
          permission: 'view_bankdeposit',
        },
        {
          id: '/dashboard/transactions/reconcile',
          label: 'Reconcile',
          href: '/dashboard/transactions/reconcile',
          permission: 'view_bankreconciliation',
        },
        {
          id: '/dashboard/transactions/journal',
          label: 'Journal Entry',
          href: '/dashboard/transactions/journal',
          permission: 'view_journalentry',
        },
        {
          id: '/dashboard/transactions/recurring',
          label: 'Recurring Transactions',
          href: '/dashboard/transactions/recurring',
          permission: 'view_recurring',
          // Backend doesn't emit `view_recurring` yet — force-show from the frontend.
          show: true,
        },
        // {
        //   id: '/dashboard/transactions/payment-setup',
        //   label: 'Payment Setup',
        //   href: '/dashboard/transactions/payment-setup',
        //   permission: 'view_paymentmethod',
        // },
      ],
    },
    {
      id: 'sales',
      icon: '/icons/sidebar/sales-v2.svg',
      activeIcon: '/icons/sidebar/sales-v2.svg',
      label: 'Sales',
      href: '',
      children: [
        {
          id: '/dashboard/sales/all_sales',
          label: 'All Sales',
          href: '/dashboard/sales/all_sales',
          permission: 'view_sale',
        },

        {
          id: '/dashboard/sales/customers',
          label: 'Customers',
          href: '/dashboard/sales/customers',
          permission: 'view_customer',
        },
        {
          id: '/dashboard/sales/product_services',
          label: 'Products & Services',
          href: '/dashboard/sales/product_services',
          permission: 'view_product',
        },
        {
          id: '/dashboard/sales/warehouse_location',
          label: 'Warehouse Locations',
          href: '/dashboard/sales/warehouse_location',
          permission: 'view_warehouse',
        },
      ],
    },
    {
      id: 'expenses',
      icon: '/icons/sidebar/expense-v2.svg',
      activeIcon: '/icons/sidebar/expense-v2.svg',
      label: 'Expenses',
      href: '',
      children: [
        {
          id: '/dashboard/expenses/expenses',
          label: 'Expenses',
          href: '/dashboard/expenses/expenses',
          permission: 'view_expense',
        },

        {
          id: '/dashboard/expenses/suppliers',
          label: 'Suppliers',
          href: '/dashboard/expenses/suppliers',
          permission: 'view_supplier',
        },
      ],
    },
    {
      id: '/dashboard/reports',
      icon: '/icons/sidebar/reports-v2.svg',
      activeIcon: '/icons/sidebar/reports-v2.svg',
      label: 'Reports',
      permission: 'view_reports',
      href: '/dashboard/reports',
    },
    {
      id: 'taxes',
      icon: '/icons/sidebar/taxes-v2.svg',
      activeIcon: '/icons/sidebar/taxes-v2.svg',
      label: 'Taxes',
      href: '',
      children: [
        {
          id: '/dashboard/taxes/taxes_agencies',
          label: 'Taxes & Agencies',
          href: '/dashboard/taxes/taxes_agencies',
          permission: 'view_agency',
        },
        {
          id: '/dashboard/taxes/sales',
          label: 'Sales Tax',
          href: '/dashboard/taxes/sales',
          permission: 'view_agencytax',
        },
        {
          id: '/dashboard/taxes/economic_nexus',
          label: 'Economic Nexus',
          href: '/dashboard/taxes/economic_nexus',
          permission: 'view_agencytax',
        },
        // {
        //   id: '/dashboard/taxes/tax-process-tracker',
        //   label: 'Tax Process Tracker',
        //   href: '/dashboard/taxes/tax-process-tracker',
        //   permission: 'view_salestax',
        // },
      ],
    },
    {
      id: 'hris',
      icon: '/icons/sidebar/hris-v2.svg',
      activeIcon: '/icons/sidebar/hris-v2.svg',
      label: 'HRIS',
      href: '',
      children: [
        {
          id: `/dashboard/hris/profile?uid=${user?.employee?.uid}`,
          label: 'Your Profile',
          show: user?.is_employee,
          href: `/dashboard/hris/profile?uid=${user?.employee?.uid}`,
          permission: 'view_employee_profile',
        },
        {
          id: 'employee',
          label: 'Employee',
          href: '',
          children: [...EmployeeHrefs],
        },
        {
          id: 'payroll',
          label: 'Payroll',
          href: '',
          children: [
            {
              id: '/dashboard/hris/payroll/salaries',
              label: 'Employee Salary',
              href: '/dashboard/hris/payroll/salaries',
              permission: 'view_employeesalary',
            },

            {
              id: '/dashboard/hris/payroll/addition-deductions',
              label: 'Addition & Deduction',
              href: '/dashboard/hris/payroll/addition-deductions',
              permission: 'view_employeeearning',
            },
            {
              id: '/dashboard/hris/payroll/salary_process',
              label: 'Run Payroll',
              href: '/dashboard/hris/payroll/salary_process',
              permission: 'view_payrollsalaryprocess',
            },
            {
              id: '/dashboard/hris/payroll/payroll_tax',
              label: 'Payroll Tax',
              href: '/dashboard/hris/payroll/payroll_tax',
              permission: 'view_payrollstatetaxinfosetting',
            },
            {
              id: '/dashboard/hris/payroll/deduction_contribution',
              label: 'Deduction Contribution',
              href: '/dashboard/hris/payroll/deduction_contribution',
              permission: 'view_deductionandcontributions',
            },

            {
              id: '/dashboard/hris/payroll/pay-schedules',
              label: 'Pay Schedule',
              href: '/dashboard/hris/payroll/pay-schedules',
              permission: 'view_payschedule',
            },

            {
              id: '/dashboard/hris/payroll/payment',
              label: 'Salary & Payments',
              href: '/dashboard/hris/payroll/payment',
              permission: 'view_paymentinformation',
            },
            {
              id: '/dashboard/hris/payroll/settings',
              label: 'Payroll Settings',
              href: '/dashboard/hris/payroll/settings',
              permission: 'view_payrollgeneralsettings',
            },
          ],
        },
        {
          id: 'attendance',
          label: 'Attendance',
          href: '',
          children: [
            {
              id: '/dashboard/hris/attendance/attendance_list',
              label: 'Attendance List',
              href: '/dashboard/hris/attendance/attendance_list',
              permission: 'view_attendance',
            },

            {
              id: '/dashboard/hris/attendance/attendance_process',
              label: 'Attendance Process',
              href: '/dashboard/hris/attendance/attendance_process',
              permission: 'view_attendanceprocess',
            },
            {
              id: '/dashboard/hris/attendance/daily_attendance',
              label: 'Daily Attendance',
              href: '/dashboard/hris/attendance/daily_attendance',
              permission: 'view_dailytimetracking',
            },
            {
              id: '/dashboard/hris/attendance/punch_data_import',
              label: 'Punch Data Import',
              href: '/dashboard/hris/attendance/punch_data_import',
              permission: 'view_punchdatadailytime',
            },
          ],
        },
        {
          id: `/dashboard/hris/employee/employees/summary/${user?.employee?.uid}`,
          label: 'Your Attendance',
          href: `/dashboard/hris/employee/employees/summary/${user?.employee?.uid}`,
          show: user?.is_employee,
          permission: 'view_attendance_summary',
        },
        {
          id: '/dashboard/hris/reports',
          label: 'Payroll Reports',
          href: '/dashboard/hris/reports',
          permission: 'view_reports',
        },
        {
          id: '/dashboard/hris/snap-expense',
          label: 'Snap Expense',
          href: '/dashboard/snap-expense',
          permission: 'view_expense',
        },
      ],
    },
    {
      id: 'admin',
      icon: '/icons/sidebar/admin-v2.svg',
      activeIcon: '/icons/sidebar/admin-v2.svg',
      label: 'Admin',
      href: '',
      children: [
        {
          id: '/dashboard/admin/currency_management',
          label: 'Currencies',
          href: '/dashboard/admin/currency_management',
          permission: 'view_currency',
        },
        {
          id: '/dashboard/admin/company_settings',
          label: 'Company Settings',
          href: '/dashboard/admin/company_settings',
          permission: 'view_companysetting',
        },
        {
          id: '/dashboard/admin/audit_log',
          label: 'Audit Logs',
          href: '/dashboard/admin/audit_log',
          permission: 'view_logentry',
        },
        {
          id: '/dashboard/admin/subscription',
          label: 'Subscription',
          href: '/dashboard/admin/subscription',
          permission: 'view_companysubscription',
        },
        {
          id: '/dashboard/admin/terms',
          label: 'Terms',
          href: '/dashboard/admin/terms',
          permission: 'view_term',
        },
        {
          id: '/dashboard/admin/attachment',
          label: 'Attachments',
          href: '/dashboard/admin/attachment',
          permission: 'view_fileitem',
        },
        {
          id: '/dashboard/admin/documents',
          label: 'Documents',
          href: '/dashboard/admin/documents',
          permission: 'view_fileitem',
        },
        {
          id: '/dashboard/admin/migrate',
          label: 'Migrate',
          href: '/dashboard/admin/migrate',
          permission: 'view_datamigrationjob',
        },
        {
          id: '/dashboard/admin/roles',
          label: 'Roles',
          href: '/dashboard/admin/roles',
          permission: 'view_companyrole',
        },
        {
          id: '/dashboard/admin/payment_management',
          label: 'Payments',
          href: '/dashboard/admin/payment_management',
          permission: 'view_paymentinformation',
        },
      ],
    },
    {
      id: '/dashboard/support',
      icon: '/icons/sidebar/support-v2.svg',
      activeIcon: '/icons/sidebar/support-v2.svg',
      label: 'Support',
      permission: 'view_inbox',
      href: '/dashboard/support',
    },
  ];

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.reduce<MenuItem[]>((acc, item) => {
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuItems(item.children);
        if (filteredChildren.length > 0) {
          acc.push({ ...item, children: filteredChildren });
        }
      } else if (!item.permission || Permissions?.includes(item.permission) || item.show) {
        acc.push(item);
      }
      return acc;
    }, []);
  };

  const filteredMenuItems = filterMenuItems(menuItems);

  // Resizing state (desktop only)
  const [isResizing, setIsResizing] = useState(false);
  const [SideBarWidth, setSideBarWidth] = useState(collapsed ? 85 : 280);
  const SideBarRef = useRef<HTMLDivElement>(null);

  // Constants
  const MIN_WIDTH = 85;
  const MAX_WIDTH = 400;
  const COLLAPSED_WIDTH = 85;
  const EXPANDED_WIDTH = 280;
  const MOBILE_WIDTH = 280;

  // Sync SideBarWidth with collapsed state (desktop only)
  useEffect(() => {
    if (!isMobile) {
      const fn = async () => {
        setSideBarWidth(collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH);
      };
      fn();
    }
  }, [collapsed, isMobile]);

  // Close mobile SideBar when clicking outside
  useEffect(() => {
    if (!isMobile || !mobileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (SideBarRef.current && !SideBarRef.current.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, mobileOpen]);

  // Prevent body scroll when mobile SideBar is open
  useEffect(() => {
    if (isMobile && mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
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
        const rect = SideBarRef.current?.getBoundingClientRect();
        if (rect) {
          const mouseX = e.clientX;
          const mouseY = e.clientY;

          // Check if mouse is still within the expanded SideBar area
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
      setSideBarWidth(newWidth);

      // Auto-collapse/expand logic
      const shouldBeCollapsed = newWidth <= 120;

      if (shouldBeCollapsed !== collapsed) {
        setCollapsed(shouldBeCollapsed);
      }
    },
    [isResizing, isMobile, collapsed]
  );

  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);

    // Snap to proper width
    if (collapsed) {
      setSideBarWidth(COLLAPSED_WIDTH);
    } else if (SideBarWidth < 200) {
      setSideBarWidth(EXPANDED_WIDTH);
    }

    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.body.style.pointerEvents = '';
  }, [isResizing, collapsed, SideBarWidth]);

  // Add/remove event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      document.body.style.pointerEvents = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
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
    return SideBarWidth;
  };

  const effectiveWidth = getEffectiveWidth();

  const renderMenuItem = (item: MenuItem, level = 0, isLast = false, isFirst = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isMenuExpanded = isExpanded(item.id);
    const showChildren = hasChildren && isMenuExpanded;
    const collapsedVisual = collapsed && !hovering && !isMobile;
    const itemActive =
      (selectedRoute?.includes(item?.id) && !!item?.href) || expandedMenus?.includes(item?.id);

    return (
      <li key={item.id} className="relative">
        <div className="relative z-[100000]">
          <Link
            href={item.href || '#'}
            className={cn(
              'group z-[1000] flex items-center justify-start gap-2 rounded-xl py-3 transition-all duration-300',
              level > 0 && !(collapsed && !hovering && !isMobile) ? 'ml-16' : '',
              collapsed && !hovering && !isMobile ? 'justify-center px-2' : 'px-4',
              itemActive
                ? collapsedVisual
                  ? 'bg-v-tint100 text-v-primary'
                  : 'bg-white/90 font-semibold text-v-ink900 shadow-[0_6px_16px_-8px_rgba(22,23,42,0.25)]'
                : 'text-v-ink700 hover:bg-white/55 hover:text-v-ink900'
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
                  'h-6 w-6 transition-all duration-200',
                  selectedRoute?.includes(item?.id) || expandedMenus?.includes(item?.id)
                    ? 'opacity-100'
                    : 'opacity-70 group-hover:opacity-100'
                )}
              />
            )}
            <span
              className={cn(
                'whitespace-nowrap text-sm font-medium',
                collapsed && !hovering && !isMobile
                  ? 'hidden opacity-0'
                  : 'opacity-100 transition-all duration-200',
                level > 0 ? '' : ''
              )}
            >
              {item.label}
            </span>
            {hasChildren && (
              <ChevronDown
                className={cn(
                  'ml-auto h-4 w-4 transition-all duration-200',
                  isMenuExpanded ? 'rotate-180' : '',
                  collapsed && !hovering && !isMobile ? 'hidden opacity-0' : 'opacity-100',
                  isMenuExpanded ? 'text-v-primary' : 'text-v-ink400'
                )}
              />
            )}
          </Link>
        </div>

        {showChildren && (
          <ul
            className={cn(
              'relative ml-4 mt-2 space-y-0.5 pl-6',
              collapsed && !hovering && !isMobile ? 'hidden' : ''
            )}
          >
            <div className="absolute bottom-0 left-0 top-0 -z-[1] w-[1px] -translate-y-[30px] overflow-hidden rounded-2xl bg-[rgba(22,23,42,0.10)]"></div>
            {item.children?.map((child, index) => {
              const hasChildChildren = child.children && child.children.length > 0;
              const isChildMenuExpanded = expandedChildMenus.includes(child.id);
              const showChildChildren = hasChildChildren && isChildMenuExpanded;
              if (!hasChildChildren) {
                const childActive =
                  selectedRoute?.includes(child?.id) || selectedRoute?.[0]?.startsWith(child?.id);
                return (
                  <li key={child.id} className="flex items-center justify-center gap-1">
                    {/* Elbow connector using borders */}

                    <div className="z-[10] h-6 w-6 -translate-x-6 -translate-y-2 rounded-bl-2xl border-b border-l border-[rgba(22,23,42,0.10)]"></div>
                    <Link
                      href={child.href || '#'}
                      className={cn(
                        'group -ml-8 flex w-full flex-1 items-center gap-2 rounded-2xl px-4 py-2.5 transition-all duration-200',
                        childActive
                          ? 'bg-white/90 font-semibold text-v-primary shadow-[0_6px_16px_-8px_rgba(22,23,42,0.25)]'
                          : 'text-v-ink700 hover:bg-white/55 hover:text-v-ink900'
                      )}
                      onClick={() => {
                        setSelectedRoute([child?.id]);
                      }}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 shrink-0 rounded-full bg-v-primary transition-opacity',
                          childActive ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <span className="whitespace-nowrap">{child.label}</span>
                    </Link>
                  </li>
                );
              } else {
                return (
                  <li key={child.id} className="z-[5000] flex items-start justify-between gap-1">
                    <div className="flex items-center gap-1">
                      {/* Elbow connector using borders */}
                      <div className="z-[10] h-6 w-6 -translate-x-6 -translate-y-2 rounded-bl-2xl border-b border-l border-[rgba(22,23,42,0.10)]"></div>
                      <Link
                        href={child.href || '#'}
                        className={cn(
                          'group z-[5000] -ml-8 flex w-full flex-1 items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-200',
                          expandedChildMenus.includes(child?.id)
                            ? 'bg-white/55 font-semibold text-v-ink900'
                            : 'text-v-ink700 hover:bg-white/55 hover:text-v-ink900'
                        )}
                        onClick={(e) => {
                          if (hasChildChildren) {
                            e.preventDefault();
                            setExpandedChildMenus((prev) =>
                              prev.includes(child.id)
                                ? prev.filter((id) => id !== child.id)
                                : [...prev, child.id]
                            );
                          }
                        }}
                      >
                        <span className="whitespace-nowrap">{child.label}</span>
                        {hasChildChildren && (
                          <ChevronDown
                            className={cn(
                              'ml-auto h-4 w-4 transition-all duration-200',
                              isChildMenuExpanded ? 'rotate-180' : '',
                              expandedChildMenus.includes(child?.id)
                                ? 'text-v-primary'
                                : 'text-v-ink400'
                            )}
                          />
                        )}
                      </Link>
                    </div>
                    {showChildChildren && (
                      <ul
                        className={`relative ${child?.id == 'employee' ? '-ml-6' : child?.id == 'attendance' ? '-ml-8' : ''} mt-8 -translate-x-16`}
                      >
                        <div className="absolute bottom-0 left-0 top-0 -z-[1] -translate-x-[24px] -translate-y-[30px] overflow-hidden rounded-2xl border-r border-[rgba(22,23,42,0.10)]"></div>
                        {/* <div
                          className={`absolute ${child?.id == "attendance" ? "" : "hidden"} -left-10 bottom-0 top-0 -z-[1] w-[1px] -translate-x-[24px] -translate-y-[30px] overflow-hidden rounded-2xl bg-accent_primary`}
                        ></div> */}
                        {child.children?.map((grandChild: any) => (
                          <li key={grandChild.id}>
                            <div className="z-[10] h-4 w-6 -translate-x-6 translate-y-[17px] rounded-bl-2xl border-b border-l border-[rgba(22,23,42,0.10)]"></div>
                            <Link
                              onClick={() => {
                                setSelectedRoute([grandChild?.id]);
                              }}
                              href={grandChild.href || '#'}
                              className={`flex items-center text-nowrap rounded-lg px-2 py-1.5 text-[13px] transition-all duration-200 ${selectedRoute?.includes(grandChild?.id) ? 'bg-white/90 font-semibold text-v-primary shadow-[0_6px_16px_-8px_rgba(22,23,42,0.25)]' : 'text-v-ink700 hover:bg-white/55 hover:text-v-ink900'}`}
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

  // Mobile SideBar overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger - open sidebar when closed */}
        {!mobileOpen && (
          <button
            className="fixed left-4 top-5 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-white/60 text-v-ink700 backdrop-blur-lg transition-colors hover:bg-white/80 hover:text-v-primary"
            onClick={() => setMobileOpen(true)}
            title="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
        )}

        <aside
          ref={SideBarRef}
          className={cn(
            'fixed left-0 top-0 z-[50000] flex h-full transform flex-col bg-white/85 font-jakarta text-sm font-light text-v-ink700 backdrop-blur-2xl transition-transform duration-300 ease-in-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          style={{
            width: '280px',
            // backgroundImage: "linear-gradient(to bottom, #1a1155, #191052)",
          }}
        >
          <div className="flex h-16 items-center justify-between border-b border-v-border/60 px-4">
            <div className="flex items-center text-xl font-bold">
              <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C4DFF] to-[#5A2BE0] shadow-[0_8px_22px_-8px_rgba(124,77,255,0.7)]">
                <span className="font-bold text-white">b</span>
              </div>
              <span className="text-v-ink900">balanzify</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="text-v-ink400 transition-colors hover:bg-v-tint100 hover:text-v-primary"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-4">
              <ul className="space-y-1.5">
                {filteredMenuItems.map((item) => renderMenuItem(item))}
              </ul>
            </nav>
          </div>
          {/* <div className="overflow-x-hidden border-t border-indigo-900/50 p-2">
            <TrialStatus isCollapsed={collapsed} isHovering={hovering} />
          </div> */}
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

  // Desktop SideBar
  return (
    <>
      <aside
        ref={SideBarRef}
        className={cn(
          'sticky top-5 z-10 hidden h-full max-h-[calc(100vh-40px)] min-h-[calc(100vh-40px)] flex-col overflow-x-hidden rounded-[24px] border border-white/75 bg-white/[0.42] px-3.5 pb-4 pt-5 font-jakarta text-sm font-normal text-v-ink700 shadow-[0_24px_60px_-36px_rgba(22,23,42,0.5)] backdrop-blur-[24px] md:flex',
          `max-w-[${MAX_WIDTH}px]`,
          collapsed && !hovering ? 'items-center px-2' : '',
          !isResizing && 'transition-all duration-300 ease-in-out'
        )}
        style={{
          width: hovering && collapsed ? `${EXPANDED_WIDTH}px` : `${effectiveWidth}px`,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Brand + collapse toggle */}
        <div
          className={cn(
            'mb-3 flex w-full shrink-0 items-center',
            collapsed && !hovering ? 'flex-col gap-2.5' : 'gap-2.5 px-1'
          )}
        >
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C4DFF] to-[#5A2BE0] text-[19px] font-bold leading-none text-white shadow-[0_8px_22px_-8px_rgba(124,77,255,0.7)]">
            b
          </div>
          {!(collapsed && !hovering) && (
            <span className="truncate text-[17px] font-bold tracking-[-0.01em] text-v-ink900">
              Balanzify
            </span>
          )}
          {!(collapsed && !hovering) && <span className="flex-1" />}
          <button
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] border border-white/75 bg-white/60 transition-colors hover:bg-white/90"
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              try {
                localStorage.setItem('sidebar_collapsed', String(next));
              } catch {
                // ignore unavailable storage
              }
            }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Image
              src="/icons/sidebar/collapse.svg"
              alt={collapsed ? 'Expand' : 'Collapse'}
              width={16}
              height={16}
              className={cn('transition-transform duration-200', collapsed && 'rotate-180')}
            />
          </button>
        </div>

        <div
          style={{
            scrollbarWidth: 'thin',
            msOverflowStyle: 'none',
            scrollbarColor: '#E3DDFE transparent',
          }}
          className="flex w-full flex-1 flex-col overflow-y-auto overflow-x-hidden"
        >
          <nav className="flex-1">
            <ul className="space-y-1.5">{filteredMenuItems.map((item) => renderMenuItem(item))}</ul>
          </nav>
        </div>
        {/* <div className="overflow-x-hidden p-2">
          <TrialStatus isCollapsed={collapsed} isHovering={hovering} />
        </div> */}
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

export default SideBar;
