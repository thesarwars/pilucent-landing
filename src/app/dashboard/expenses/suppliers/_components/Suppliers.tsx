"use client";
import { useEffect, useRef, useState } from "react";
import SupplierCreateUpdate from "./SupplierCreateUpdate";
import { useRouter } from "next/navigation";
import { useFetch } from "@/app/helpers/hooks";
import { fetchSuppliers, patchSupplier } from "@/app/helpers/backend";
import Swal from "sweetalert2";
import Modal from "@/app/(admin)/_components/Modal";
import { encryptData } from "@/app/helpers/crypto";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/app/redux/store";
import SupplierOverviewCard from "./Overview";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  money,
  avatarGradient,
  initials,
  type VioletTone,
} from "@/components/violet";
import {
  ArrowLeft,
  Plus,
  Search,
  Columns3,
  ChevronDown,
  MoreVertical,
  Users,
  Upload,
} from "lucide-react";

/* column model for the show/hide popover (purely client-side) */
type SupplierCol = {
  key: string;
  label: string;
  w: string;
  locked?: boolean;
  align?: "left" | "right" | "center";
};
const ALL_COLUMNS: SupplierCol[] = [
  { key: "supplier", label: "Supplier", w: "minmax(0,1.6fr)", locked: true },
  { key: "contact", label: "Contact", w: "minmax(0,1.4fr)" },
  { key: "balance", label: "Open balance", w: "140px", align: "right" },
  { key: "status", label: "Status", w: "120px" },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "balance", label: "With balance" },
  { key: "inactive", label: "On hold / inactive" },
];

function statusMeta(status: string): { tone: VioletTone; label: string } {
  if (status === "ACTIVE") return { tone: "success", label: "Active" };
  if (status === "PENDING") return { tone: "warn", label: "On hold" };
  return { tone: "neutral", label: "Inactive" };
}

function pageRange(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "…", count];
  if (page >= count - 3)
    return [1, "…", count - 4, count - 3, count - 2, count - 1, count];
  return [1, "…", page - 1, page, page + 1, "…", count];
}

const Suppliers = () => {
  const [updateUID, setUpdateUID] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const dropdownRef2 = useRef<HTMLDivElement>(null);
  const [selectedRowId, setSelectedRowId] = useState("");
  const { Permissions } = useAppSelector((state) => state.Permissions);

  const {
    data: suppliers,
    isPending: isLoading,
    refetch,
    setQueryParams,
  } = useFetch(["api/v1/purchases"], fetchSuppliers);

  // table UI state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState("all");
  const [panelOpen, setPanelOpen] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>(() => {
    const v: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((c) => (v[c.key] = true));
    return v;
  });

  const results: any[] = suppliers?.results || suppliers?.data || [];
  const total = suppliers?.count ?? results.length;

  // sync server page-size on mount (the shared admin Table did this)
  useEffect(() => {
    setQueryParams?.({ page: 1, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // close the columns popover on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-sup-keep]")) setPanelOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* server params — always send search so clearing resets the filter (merge semantics) */
  const onSearch = (v: string) => {
    setSearch(v);
    setPage(1);
    setQueryParams?.({ page: 1, limit, search: v });
  };
  const goPage = (p: number) => {
    setPage(p);
    setQueryParams?.({ page: p, limit, search });
  };
  const changeLimit = (l: number) => {
    setLimit(l);
    setPage(1);
    setQueryParams?.({ page: 1, limit: l, search });
  };

  const handleUpdateStatus = async (row: any) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6A6EF6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Change it!",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const formData = new FormData();
          formData.append(
            "status",
            row?.status == "ACTIVE" ? "PENDING" : "ACTIVE",
          );
          const result = await patchSupplier(row.uid, formData);
          if (result.success) {
            refetch();
            return result;
          }
          throw new Error("Failed to Update");
        } catch (error) {
          Swal.showValidationMessage(`Request failed: ${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Success!",
          text: "Supplier status has changed.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const ActionFormatter = ({ row }: { row?: any }) => {
    const triggerRef = useRef<any>(null);
    const [triggerPosition, setTriggerPosition] = useState({ x: 0, y: 0 });
    const open = selectedRowId === row.uid;

    useEffect(() => {
      const updatePosition = () => {
        if (selectedRowId === row.uid && triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setTriggerPosition({
            x: rect.right - 184,
            y: rect.bottom + window.scrollY + 6,
          });
        }
      };

      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);

      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRowId, row.uid]);

    // primary action — identical routing/payload as before
    const goPrimary = () => {
      if (row?.opening_balance > 0) {
        const encryptedData = encryptData({
          uid: row?.uid,
          address: row?.address,
          first_name: row?.first_name,
          middle_name: row?.middle_name || "",
          last_name: row?.last_name || "",
          email: row?.email || "",
          currency: row?.currency || "",
        });
        router.push(
          `/dashboard/expenses/expenses/bill-payment?c=${encryptedData}`,
        );
      } else {
        if (row?.status != "ACTIVE") return toast.info("Supplier is inactive.");
        const encryptedData = encryptData({
          uid: row?.uid,
          address: row?.address,
          first_name: row?.first_name,
          middle_name: row?.middle_name || "",
          last_name: row?.last_name || "",
          email: row?.email || "",
          currency: row?.currency || "",
        });
        router.push(`/dashboard/expenses/expenses/bill?c=${encryptedData}`);
      }
      setSelectedRowId("");
    };

    const menuItem =
      "block w-full px-3.5 py-2 text-left text-[13px] font-medium text-v-ink700 transition-colors hover:bg-v-wash hover:text-v-primary";

    return (
      <div className="relative" data-sup-keep>
        <button
          ref={triggerRef}
          type="button"
          aria-label="Row actions"
          onClick={() =>
            setSelectedRowId((prev) => (prev === row.uid ? "" : row.uid))
          }
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary",
            open && "bg-v-tint100 text-v-primary",
          )}
        >
          <MoreVertical className="h-[18px] w-[18px]" />
        </button>

        {open && (
          <div
            className="fixed z-[120] w-[184px] animate-v-pop overflow-hidden rounded-v-card border border-v-border bg-white py-1.5 shadow-v-modal"
            style={{ top: `${triggerPosition.y}px`, left: `${triggerPosition.x}px` }}
          >
            <button type="button" onClick={goPrimary} className={menuItem}>
              {row?.opening_balance > 0 ? "Record payment" : "Create bill"}
            </button>
            <Link
              href={`/dashboard/expenses/suppliers/${row.uid}`}
              onClick={() => setSelectedRowId("")}
              className={menuItem}
            >
              View profile
            </Link>
            {Permissions?.includes("change_supplier") && (
              <button
                type="button"
                onClick={() => {
                  setUpdateUID(row.uid);
                  setIsOpen(true);
                  setSelectedRowId("");
                }}
                className={menuItem}
              >
                Edit
              </button>
            )}
            {Permissions?.includes("change_supplier") && (
              <button
                type="button"
                onClick={() => {
                  handleUpdateStatus(row);
                  setSelectedRowId("");
                }}
                className={menuItem}
              >
                {row?.status == "ACTIVE" ? "Make inactive" : "Make active"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // client-side pill filter (display only — does not change the query)
  const filtered = results.filter((r) =>
    filter === "balance"
      ? Number(r?.opening_balance) > 0
      : filter === "inactive"
        ? r?.status !== "ACTIVE"
        : true,
  );

  const visibleCols = ALL_COLUMNS.filter((c) => visible[c.key]);
  const gridCols = `${visibleCols.map((c) => c.w).join(" ")} 70px`;

  const resetCols = () => {
    const v: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((c) => (v[c.key] = true));
    setVisible(v);
  };

  const pageCount = Math.max(1, Math.ceil(total / limit));
  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
      setQueryParams?.({ page: pageCount, limit, search });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount]);

  const pages = pageRange(page, pageCount);
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const renderCell = (col: SupplierCol, row: any) => {
    if (col.key === "supplier") {
      const name = `${row.first_name || ""} ${row.middle_name || ""} ${
        row.last_name || ""
      }`
        .replace(/\s+/g, " ")
        .trim();
      return (
        <Link
          href={`/dashboard/expenses/suppliers/${row.uid}`}
          title="Supplier details"
          className="flex min-w-0 items-center gap-2.5"
        >
          {row.image ? (
            <Image
              src={row.image}
              width={72}
              height={72}
              alt={name}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
              style={{ backgroundImage: avatarGradient(name || row.uid) }}
            >
              {initials(name || "?")}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-[13.5px] font-bold text-v-ink900 hover:text-v-primary">
              {name || "—"}
            </span>
            {row?.address?.city && (
              <span className="block truncate text-[11px] text-v-ink400">
                {row.address.city}
                {row?.address?.province ? `, ${row.address.province}` : ""}
              </span>
            )}
          </span>
        </Link>
      );
    }
    if (col.key === "contact") {
      return (
        <div className="min-w-0">
          <div className="truncate text-[12.5px] text-v-ink700">
            {row?.email || "—"}
          </div>
          <div className="truncate text-[11.5px] text-v-ink400">
            {row?.mobile_number || "No phone"}
          </div>
        </div>
      );
    }
    if (col.key === "balance") {
      const bal = Number(row?.opening_balance) || 0;
      return (
        <div
          className={cn(
            "text-right text-[13px] font-bold tabular-nums",
            bal > 0 ? "text-v-danger-fg" : "text-v-ink900",
          )}
        >
          {money(bal)}
        </div>
      );
    }
    if (col.key === "status") {
      const m = statusMeta(row?.status);
      return <Chip tone={m.tone}>{m.label}</Chip>;
    }
    return null;
  };

  return (
    <div className="relative font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Expenses", href: "/dashboard/expenses/expenses" },
          { label: "Suppliers" },
        ]}
      />

      {/* header */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/75 bg-white/60 text-v-ink500 backdrop-blur-md transition-colors hover:text-v-primary"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </button>
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          Suppliers
        </h1>
        <Chip tone="violet">{total}</Chip>

        <span className="flex-1" />

        {/* New supplier + Import split */}
        <div className="flex items-center" ref={dropdownRef2}>
          <VioletButton
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setUpdateUID("");
              setIsOpen(true);
            }}
            className="rounded-r-none"
          >
            New supplier
          </VioletButton>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsImportOpen(!isImportOpen)}
              aria-label="More"
              className="flex h-full items-center rounded-r-v-btn border-l border-white/25 bg-v-primary px-2 py-[11px] text-white transition-colors hover:bg-v-primary-hover"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isImportOpen && "rotate-180",
                )}
              />
            </button>
            {isImportOpen && (
              <div className="absolute right-0 z-50 mt-2 w-48 animate-v-pop overflow-hidden rounded-v-card border border-v-border bg-white py-1.5 shadow-v-modal">
                <button
                  type="button"
                  onClick={() => {
                    router.push("/dashboard/expenses/suppliers/bulk-import");
                    setIsImportOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] font-medium text-v-ink700 transition-colors hover:bg-v-wash hover:text-v-primary"
                >
                  <Upload className="h-4 w-4" /> Import suppliers
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mt-[18px] animate-v-rise">
        <SupplierOverviewCard />
      </div>

      {/* table card */}
      <div className="mt-4 animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card">
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
          <IconChip tone="violet">
            <Users />
          </IconChip>
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-v-ink900">
              All suppliers
            </div>
            <div className="text-[11.5px] text-v-ink400">
              {filtered.length} of {total} shown
            </div>
          </div>

          <span className="flex-1" />

          {/* filter pills */}
          <div className="flex items-center gap-1 rounded-full bg-v-wash2 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  filter === f.key
                    ? "bg-white text-v-primary shadow-sm"
                    : "text-v-ink500 hover:text-v-ink900",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-v-ink400" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search name, email"
              className="w-[230px] rounded-[10px] border border-v-border bg-v-card-subtle py-2 pl-9 pr-3 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
            />
          </div>

          <div className="relative" data-sup-keep>
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              title="Columns"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary",
                panelOpen && "bg-v-tint100 text-v-primary",
              )}
            >
              <Columns3 className="h-[17px] w-[17px]" />
            </button>
            {panelOpen && (
              <div className="absolute right-0 top-11 z-50 w-[260px] animate-v-pop rounded-v-card border border-v-border bg-white p-3 shadow-v-modal">
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <span className="text-[12.5px] font-bold text-v-ink900">
                    Columns
                  </span>
                  <button
                    type="button"
                    onClick={resetCols}
                    className="text-[11.5px] font-semibold text-v-primary hover:underline"
                  >
                    Reset
                  </button>
                </div>
                {ALL_COLUMNS.map((c) => (
                  <div
                    key={c.key}
                    className="flex items-center gap-2 rounded-[9px] px-1.5 py-1.5 hover:bg-v-wash"
                  >
                    <span className="flex-1 text-[12.5px] font-medium text-v-ink700">
                      {c.label}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={visible[c.key]}
                      disabled={c.locked}
                      onClick={() =>
                        setVisible((v) => ({ ...v, [c.key]: !v[c.key] }))
                      }
                      className={cn(
                        "relative inline-flex h-[18px] w-8 shrink-0 rounded-full transition-colors disabled:opacity-40",
                        visible[c.key] ? "bg-v-primary" : "bg-v-border",
                      )}
                    >
                      <span
                        className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-[0_1px_3px_rgba(22,23,42,0.3)] transition-all"
                        style={{ left: visible[c.key] ? "16px" : "2px" }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* column strip */}
        <div
          className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-[22px] py-2.5"
          style={{ gridTemplateColumns: gridCols }}
        >
          {visibleCols.map((c) => (
            <div
              key={c.key}
              className={cn(
                "text-[12px] font-semibold uppercase tracking-[0.04em] text-v-ink400",
                c.align === "right" && "text-right",
                c.align === "center" && "text-center",
              )}
            >
              {c.label}
            </div>
          ))}
          <div className="text-right text-[12px] font-semibold uppercase tracking-[0.04em] text-v-ink400">
            Action
          </div>
        </div>

        {/* body */}
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-3"
              style={{ gridTemplateColumns: gridCols }}
            >
              {visibleCols.map((c) => (
                <div key={c.key} className="h-4 w-3/4 rounded bg-v-wash2" />
              ))}
              <div className="ml-auto h-7 w-7 rounded bg-v-wash2" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
              <Users className="h-[19px] w-[19px]" />
            </span>
            <div className="text-sm font-semibold text-v-ink900">
              No suppliers found
            </div>
            <div className="text-[13px] text-v-ink400">
              Try a different search or filter.
            </div>
          </div>
        ) : (
          filtered.map((row, i) => (
            <div
              key={row?.uid || i}
              className="grid animate-v-pop items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-2.5 transition-colors hover:bg-[#F7F5FC]"
              style={{
                gridTemplateColumns: gridCols,
                animationDelay: `${i * 0.03}s`,
                zIndex: selectedRowId === row.uid ? 120 : undefined,
                position: selectedRowId === row.uid ? "relative" : undefined,
              }}
            >
              {visibleCols.map((c) => (
                <div key={c.key} className="min-w-0">
                  {renderCell(c, row)}
                </div>
              ))}
              <div className="flex items-center justify-end">
                <ActionFormatter row={row} />
              </div>
            </div>
          ))
        )}

        {/* footer / pager */}
        <div className="flex flex-wrap items-center gap-3 px-[22px] py-3.5">
          <span className="text-[12.5px] text-v-ink400">
            {total === 0 ? "No suppliers" : `Showing ${start}–${end} of ${total}`}
          </span>
          <span className="flex-1" />
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-v-ink400">Rows</span>
            <select
              value={limit}
              onChange={(e) => changeLimit(Number(e.target.value))}
              className="cursor-pointer rounded-[8px] bg-v-wash2 px-2 py-1 text-[12.5px] font-semibold text-v-ink700 outline-none"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => page > 1 && goPage(page - 1)}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-[8px] text-v-ink500 transition-colors hover:bg-v-wash2 disabled:opacity-30"
            >
              ‹
            </button>
            {pages.map((p, i) =>
              p === "…" ? (
                <span key={`e${i}`} className="px-1 text-v-ink400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goPage(p)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-[8px] text-[12.5px] font-semibold tabular-nums transition-colors",
                    p === page
                      ? "bg-v-primary text-white"
                      : "text-v-ink500 hover:bg-v-wash2",
                  )}
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => page < pageCount && goPage(page + 1)}
              disabled={page >= pageCount}
              className="flex h-8 w-8 items-center justify-center rounded-[8px] text-v-ink500 transition-colors hover:bg-v-wash2 disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        widthClass="w-full md:w-[980px]"
        title={updateUID ? "Edit Supplier" : "Add Supplier"}
      >
        <SupplierCreateUpdate
          setIsOpen={setIsOpen}
          uid={updateUID}
          refetchData={refetch}
        />
      </Modal>
    </div>
  );
};
export default Suppliers;
