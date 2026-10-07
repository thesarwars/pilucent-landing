'use client';
import Label from '@/components/ui/RawLabel';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ScrollSelect from '@/components/ui/InfiniteSelect/InfiniteScroll';
import ProductManager from '@/components/ProductManager/ProductManager';
import { toast } from 'react-toastify';
import { fetchCategories, fetchProductServices } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import StockLevelForm from './_components/StockLevelForm';
import Brands from './_components/Brands';
import EditBrand from './_components/EditBrand';
import EditCategory from './_components/EditCategory';
import Categories from './_components/Categories';
import CreateCategory from './_components/CreateCategory';
import CreateBrand from './_components/CreateBrand';
import ColumnFilter from './_components/ColumnFilter';
import Modal from '@/app/(admin)/_components/Modal';
import { useAppSelector } from '@/app/redux/store';
import ProductOverview from './_components/ProductOverview';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  Chip,
  IconChip,
  VioletButton,
  money,
  avatarGradient,
  type VioletTone,
} from '@/components/violet';
import {
  Plus,
  Search,
  Columns3,
  ChevronDown,
  MoreVertical,
  Boxes,
  Package,
  Filter,
  Upload,
  Pencil,
  SlidersHorizontal,
} from 'lucide-react';

/* column model for the show/hide popover (client-side) */
type ItemCol = {
  key: string;
  label: string;
  w: string;
  locked?: boolean;
  align?: 'left' | 'right' | 'center';
  defaultHidden?: boolean;
};
const ALL_COLUMNS: ItemCol[] = [
  { key: 'item', label: 'Item', w: 'minmax(0,1.6fr)', locked: true },
  { key: 'sku', label: 'SKU', w: '120px' },
  { key: 'type', label: 'Type', w: '110px' },
  { key: 'price', label: 'Price', w: '110px', align: 'right' },
  { key: 'stock', label: 'Stock', w: '90px', align: 'right' },
  { key: 'reorder', label: 'Reorder', w: '100px', align: 'right', defaultHidden: true },
  { key: 'status', label: 'Status', w: '120px' },
];

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'products', label: 'Products' },
  { key: 'services', label: 'Services' },
  { key: 'low', label: 'Low stock' },
];

function isLowStock(row: any): boolean {
  if (row?.kind !== 'PRODUCT') return false;
  const qty = Number(row?.quantity) || 0;
  const re = Number(row?.reorder_point) || 0;
  return qty <= 0 || (re > 0 && qty <= re);
}

function itemStatusMeta(row: any): { tone: VioletTone; label: string } {
  if (row?.status && row.status !== 'ACTIVE') return { tone: 'neutral', label: 'Inactive' };
  if (row?.kind === 'PRODUCT') {
    const qty = Number(row?.quantity) || 0;
    const re = Number(row?.reorder_point) || 0;
    if (qty <= 0) return { tone: 'danger', label: 'Out of stock' };
    if (re > 0 && qty <= re) return { tone: 'warn', label: 'Low stock' };
  }
  return { tone: 'success', label: 'Active' };
}

function typeMeta(kind: string): { tone: VioletTone; label: string } {
  if (kind === 'SERVICE') return { tone: 'teal', label: 'Service' };
  return { tone: 'violet', label: 'Product' };
}

function pageRange(page: number, count: number): (number | '…')[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '…', count];
  if (page >= count - 3) return [1, '…', count - 4, count - 3, count - 2, count - 1, count];
  return [1, '…', page - 1, page, page + 1, '…', count];
}

const Page = () => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isRefetch, setIsRefetch] = useState(false);
  const router = useRouter();
  const dropdownRef1 = useRef<HTMLDivElement>(null);
  const dropdownRef2 = useRef<HTMLDivElement>(null);
  const [productType, setProductType] = useState<string>('');
  const [serviceOptions, setServiceOptions] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [modalHeader, setModalHeader] = useState<string>('');
  const [modalContent, setModalContent] = useState<string>('');
  const [updateBrandUID, setUpdateBrandUID] = useState<string>('');
  const [updateCategoryUID, setUpdateCategoryUID] = useState<string>('');
  const [filterCategoryValue, setFilterCategoryValue] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [filterTypeValue, setFilterTypeValue] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [filterStatusValue, setFilterStatusValue] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [selectedProductUid, setSelectedProductUid] = useState<string | null>(null);
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const productManagerRef = useRef<any>(null);

  // table UI state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState('all');
  const [panelOpen, setPanelOpen] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>(() => {
    const v: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((c) => (v[c.key] = !c.defaultHidden));
    return v;
  });

  const handleEyeButtonClick = async (product: any) => {
    try {
      setSelectedProductUid(product?.uid);
      setServiceOptions(false);
      setModalHeader('Product/Service Information');
      if (product.kind === 'PRODUCT') {
        if (product.is_inventory) {
          setProductType('inventory');
        } else {
          setProductType('non-inventory');
        }
      } else if (product.kind === 'SERVICE') {
        setProductType('service');
      }
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  const {
    data: productData,
    isPending,
    refetch,
    setQueryParams,
    params,
  } = useFetch(['products'], fetchProductServices);

  const { data: categoryData } = useFetch(['categories'], fetchCategories);

  const handleFilterChange = (
    currentValue: { label: string; value: string } | null,
    setValue: (value: { label: string; value: string } | null) => void,
    newValue: { label: string; value: string } | null
  ) => {
    if (currentValue?.value === newValue?.value) {
      setValue(null);
    } else {
      setValue(newValue);
    }
  };

  const handleClearFilter = (
    setValue: (value: { label: string; value: string } | null) => void
  ) => {
    setValue(null);
  };

  // sync server page-size on mount
  useEffect(() => {
    setQueryParams?.({ page: 1, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // single outside-click handler for the More menu, columns panel, and import dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const t = event.target as HTMLElement;
      if (!(dropdownRef1.current?.contains(t) || dropdownRef2.current?.contains(t))) {
        setIsImportOpen(false);
        setIsMoreOpen(false);
      }
      if (!t.closest?.('[data-cols-panel]')) setPanelOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddNewClick = () => {
    setSelectedProductUid('');
    setServiceOptions(true);
    setModalContent('');
    setModalHeader('Product/Service Information');
    setIsModalOpen(true);
    setProductType('');
    if (productManagerRef.current) {
      productManagerRef.current.resetState();
    }
  };

  const handleApplyFilters = () => {
    setQueryParams({
      ...params,
      status: filterStatusValue?.value,
      // kind: filterTypeValue?.value,
      // category: filterCategoryValue?.value,
    });
    setIsFilterOpen(false);
  };

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

  const canEdit = Permissions?.includes('change_product');
  const results: any[] = productData?.results || productData?.data || [];
  const total = productData?.count ?? results.length;

  const filtered = results.filter((r) => {
    if (filter === 'products') return r?.kind === 'PRODUCT';
    if (filter === 'services') return r?.kind === 'SERVICE';
    if (filter === 'low') return isLowStock(r);
    return true;
  });

  const visibleCols = ALL_COLUMNS.filter((c) => visible[c.key]);
  const gridCols = `${visibleCols.map((c) => c.w).join(' ')} 70px`;

  const resetCols = () => {
    const v: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((c) => (v[c.key] = !c.defaultHidden));
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

  // per-row action kebab
  const [openRow, setOpenRow] = useState<string | null>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest?.('[data-row-menu]')) setOpenRow(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const RowMenu = ({ row }: { row: any }) => {
    const triggerRef = useRef<any>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const open = openRow === row.uid;
    useEffect(() => {
      const update = () => {
        if (openRow === row.uid && triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setPos({ x: rect.right - 184, y: rect.bottom + window.scrollY + 6 });
        }
      };
      update();
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      return () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update, true);
      };
    }, [row.uid, open]);

    const menuItem =
      'block w-full px-3.5 py-2 text-left text-[13px] font-medium text-v-ink700 transition-colors hover:bg-v-wash hover:text-v-primary';

    return (
      <div className="relative" data-row-menu>
        <button
          ref={triggerRef}
          type="button"
          aria-label="Row actions"
          onClick={() => setOpenRow((prev) => (prev === row.uid ? null : row.uid))}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary',
            open && 'bg-v-tint100 text-v-primary'
          )}
        >
          <MoreVertical className="h-[18px] w-[18px]" />
        </button>
        {open && (
          <div
            className="fixed z-[120] w-[184px] animate-v-pop overflow-hidden rounded-v-card border border-v-border bg-white py-1.5 shadow-v-modal"
            style={{ top: `${pos.y}px`, left: `${pos.x}px` }}
          >
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  handleEyeButtonClick(row);
                  setOpenRow(null);
                }}
                className={menuItem}
              >
                Edit
              </button>
            )}
            {Permissions?.includes('view_stockadjustment') && (
              <Link
                href="/dashboard/sales/product_services/quantity_adjustment"
                onClick={() => setOpenRow(null)}
                className={menuItem}
              >
                Adjust stock
              </Link>
            )}
            {!canEdit && !Permissions?.includes('view_stockadjustment') && (
              <div className="px-3.5 py-2 text-[12px] text-v-ink400">No actions</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCell = (col: ItemCol, row: any) => {
    if (col.key === 'item') {
      const title = row?.title || '—';
      return (
        <div
          title={canEdit ? 'View / edit' : title}
          onClick={() => canEdit && handleEyeButtonClick(row)}
          className={cn('flex min-w-0 items-center gap-2.5', canEdit && 'cursor-pointer')}
        >
          {row?.image ? (
            <Image
              src={row.image}
              width={72}
              height={72}
              alt={title}
              className="h-9 w-9 shrink-0 rounded-[9px] object-cover"
            />
          ) : (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-[12px] font-bold text-white"
              style={{ backgroundImage: avatarGradient(title || row?.uid || '?') }}
            >
              {(title?.[0] || '?').toUpperCase()}
            </span>
          )}
          <span className="min-w-0">
            <span
              className={cn(
                'block truncate text-[13.5px] font-bold text-v-ink900',
                canEdit && 'hover:text-v-primary'
              )}
            >
              {title}
            </span>
            {row?.category?.title && (
              <span className="block truncate text-[11px] text-v-ink400">{row.category.title}</span>
            )}
          </span>
        </div>
      );
    }
    if (col.key === 'sku') {
      return <div className="truncate text-[12.5px] tabular-nums text-v-ink500">{row?.sku || '—'}</div>;
    }
    if (col.key === 'type') {
      const m = typeMeta(row?.kind);
      return <Chip tone={m.tone}>{m.label}</Chip>;
    }
    if (col.key === 'price') {
      return (
        <div className="text-right text-[13px] font-bold tabular-nums text-v-ink900">
          {money(Number(row?.sale_price) || 0)}
        </div>
      );
    }
    if (col.key === 'stock') {
      if (row?.kind !== 'PRODUCT') return <div className="text-right text-[13px] text-v-ink400">—</div>;
      const qty = Number(row?.quantity) || 0;
      const re = Number(row?.reorder_point) || 0;
      return (
        <div
          className={cn(
            'text-right text-[13px] font-bold tabular-nums',
            qty <= 0 ? 'text-v-danger-fg' : re > 0 && qty <= re ? 'text-v-warn-fg' : 'text-v-ink900'
          )}
        >
          {qty}
        </div>
      );
    }
    if (col.key === 'reorder') {
      return (
        <div className="text-right text-[12.5px] tabular-nums text-v-ink500">
          {row?.kind === 'PRODUCT' ? Number(row?.reorder_point) || 0 : '—'}
        </div>
      );
    }
    if (col.key === 'status') {
      const m = itemStatusMeta(row);
      return <Chip tone={m.tone}>{m.label}</Chip>;
    }
    return null;
  };

  return (
    <div className="relative font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sales', href: '/dashboard/sales/all_sales' },
          { label: 'Products & services' },
        ]}
      />

      {/* header */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          Products &amp; services
        </h1>
        <Chip tone="violet">{total}</Chip>

        <span className="flex-1" />

        {/* More menu */}
        <div className="relative" ref={dropdownRef1}>
          <VioletButton
            variant="outline"
            rightIcon={
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', isMoreOpen && 'rotate-180')}
              />
            }
            onClick={() => setIsMoreOpen(!isMoreOpen)}
          >
            More
          </VioletButton>
          {isMoreOpen && (
            <div className="absolute right-0 z-50 mt-2 w-[230px] animate-v-pop overflow-hidden rounded-v-card border border-v-border bg-white py-1.5 shadow-v-modal">
              {Permissions?.includes('view_brand') && (
                <button
                  type="button"
                  onClick={() => {
                    setModalHeader('Brand List');
                    setServiceOptions(false);
                    setModalContent('brands');
                    setIsModalOpen(true);
                    setProductType('');
                    setIsMoreOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-[13px] font-medium text-v-ink700 transition-colors hover:bg-v-wash hover:text-v-primary"
                >
                  Brand
                </button>
              )}
              {Permissions?.includes('view_category') && (
                <button
                  type="button"
                  onClick={() => {
                    setModalHeader('Category List');
                    setServiceOptions(false);
                    setModalContent('categories');
                    setIsModalOpen(true);
                    setProductType('');
                    setIsMoreOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-[13px] font-medium text-v-ink700 transition-colors hover:bg-v-wash hover:text-v-primary"
                >
                  Category
                </button>
              )}
              {Permissions?.includes('view_stockalert') && (
                <button
                  type="button"
                  onClick={() => {
                    try {
                      setModalHeader('Stock Level');
                      setServiceOptions(false);
                      setModalContent('stock');
                      setProductType('');
                      setIsModalOpen(true);
                      setIsMoreOpen(false);
                    } catch (error) {
                      console.error('Error in stock level click handler:', error);
                      toast.error('Failed to open stock level form');
                    }
                  }}
                  className="block w-full px-4 py-2 text-left text-[13px] font-medium text-v-ink700 transition-colors hover:bg-v-wash hover:text-v-primary"
                >
                  Stock &amp; expired set
                </button>
              )}
              {Permissions?.includes('view_stockadjustment') && (
                <Link
                  href="/dashboard/sales/product_services/quantity_adjustment"
                  onClick={() => setIsMoreOpen(false)}
                  className="block w-full px-4 py-2 text-left text-[13px] font-medium text-v-ink700 transition-colors hover:bg-v-wash hover:text-v-primary"
                >
                  Quantity adjustment
                </Link>
              )}
            </div>
          )}
        </div>

        {/* New item + bulk import split */}
        {Permissions?.includes('add_product') && (
          <div className="flex items-center" ref={dropdownRef2}>
            <VioletButton
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleAddNewClick}
              className="rounded-r-none"
            >
              New item
            </VioletButton>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsImportOpen(!isImportOpen)}
                aria-label="More"
                className="flex h-full items-center rounded-r-v-btn border-l border-white/25 bg-v-primary px-2 py-[11px] text-white transition-colors hover:bg-v-primary-hover"
              >
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', isImportOpen && 'rotate-180')}
                />
              </button>
              {isImportOpen && (
                <div className="absolute right-0 z-50 mt-2 w-48 animate-v-pop overflow-hidden rounded-v-card border border-v-border bg-white py-1.5 shadow-v-modal">
                  <button
                    type="button"
                    onClick={() => {
                      router.push('/dashboard/sales/product_services/bulk_import');
                      setIsImportOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] font-medium text-v-ink700 transition-colors hover:bg-v-wash hover:text-v-primary"
                  >
                    <Upload className="h-4 w-4" /> Bulk import
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* inventory-health band */}
      <div className="mt-[18px] animate-v-rise">
        <ProductOverview />
      </div>

      {/* table card */}
      <div className="mt-4 animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card">
        {/* toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(22,23,42,0.07)] px-[22px] py-3.5">
          <IconChip tone="violet">
            <Boxes />
          </IconChip>
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-v-ink900">All items</div>
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
                  'rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  filter === f.key
                    ? 'bg-white text-v-primary shadow-sm'
                    : 'text-v-ink500 hover:text-v-ink900'
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
              placeholder="Search name, SKU"
              className="w-[210px] rounded-[10px] border border-v-border bg-v-card-subtle py-2 pl-9 pr-3 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            title="Filter"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
          >
            <Filter className="h-[16px] w-[16px]" />
          </button>

          <div className="relative" data-cols-panel>
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              title="Columns"
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary',
                panelOpen && 'bg-v-tint100 text-v-primary'
              )}
            >
              <Columns3 className="h-[17px] w-[17px]" />
            </button>
            {panelOpen && (
              <div className="absolute right-0 top-11 z-50 w-[260px] animate-v-pop rounded-v-card border border-v-border bg-white p-3 shadow-v-modal">
                <div className="mb-1.5 flex items-center justify-between px-1">
                  <span className="text-[12.5px] font-bold text-v-ink900">Columns</span>
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
                    <span className="flex-1 text-[12.5px] font-medium text-v-ink700">{c.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={visible[c.key]}
                      disabled={c.locked}
                      onClick={() => setVisible((v) => ({ ...v, [c.key]: !v[c.key] }))}
                      className={cn(
                        'relative inline-flex h-[18px] w-8 shrink-0 rounded-full transition-colors disabled:opacity-40',
                        visible[c.key] ? 'bg-v-primary' : 'bg-v-border'
                      )}
                    >
                      <span
                        className="absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-[0_1px_3px_rgba(22,23,42,0.3)] transition-all"
                        style={{ left: visible[c.key] ? '16px' : '2px' }}
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
                'text-[12px] font-semibold uppercase tracking-[0.04em] text-v-ink400',
                c.align === 'right' && 'text-right',
                c.align === 'center' && 'text-center'
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
        {isPending ? (
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
              <Package className="h-[19px] w-[19px]" />
            </span>
            <div className="text-sm font-semibold text-v-ink900">No items found</div>
            <div className="text-[13px] text-v-ink400">Try a different search or filter.</div>
          </div>
        ) : (
          filtered.map((row, i) => (
            <div
              key={row?.uid || i}
              className="grid animate-v-pop items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-[22px] py-2.5 transition-colors hover:bg-[#F7F5FC]"
              style={{
                gridTemplateColumns: gridCols,
                animationDelay: `${i * 0.03}s`,
                zIndex: openRow === row.uid ? 120 : undefined,
                position: openRow === row.uid ? 'relative' : undefined,
              }}
            >
              {visibleCols.map((c) => (
                <div key={c.key} className="min-w-0">
                  {renderCell(c, row)}
                </div>
              ))}
              <div className="flex items-center justify-end">
                <RowMenu row={row} />
              </div>
            </div>
          ))
        )}

        {/* footer / pager */}
        <div className="flex flex-wrap items-center gap-3 px-[22px] py-3.5">
          <span className="text-[12.5px] text-v-ink400">
            {total === 0 ? 'No items' : `Showing ${start}–${end} of ${total}`}
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
              p === '…' ? (
                <span key={`e${i}`} className="px-1 text-v-ink400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goPage(p)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-[8px] text-[12.5px] font-semibold tabular-nums transition-colors',
                    p === page ? 'bg-v-primary text-white' : 'text-v-ink500 hover:bg-v-wash2'
                  )}
                >
                  {p}
                </button>
              )
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

      {/* filter modal */}
      <Modal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter"
        widthClass="w-full md:w-[550px]"
      >
        <form
          className="mt-3 flex flex-col gap-4 rounded-lg bg-accent_bg_gray p-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleApplyFilters();
          }}
        >
          <div>
            <Label className="block font-medium text-accent_text_gray">Status</Label>
            <div className="items-center gap-2">
              <ScrollSelect
                name="status"
                value={filterStatusValue}
                onChange={(newValue: any) =>
                  handleFilterChange(filterStatusValue, setFilterStatusValue, newValue)
                }
                options={[
                  { label: 'Active', value: 'ACTIVE' },
                  { label: 'In-active', value: 'PENDING' },
                ]}
                required={false}
              />
              {filterStatusValue && (
                <button
                  type="button"
                  onClick={() => handleClearFilter(setFilterStatusValue)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div>
            <Label className="block font-medium text-accent_text_gray">Category</Label>
            <div className="items-center gap-2">
              <ScrollSelect
                name="category_uid"
                value={filterCategoryValue}
                onChange={(newValue: any) =>
                  handleFilterChange(filterCategoryValue, setFilterCategoryValue, newValue)
                }
                options={
                  categoryData?.results?.map((category: any) => ({
                    label: category.title,
                    value: category.uid,
                  })) || []
                }
                required={false}
              />
              {filterCategoryValue && (
                <button
                  type="button"
                  onClick={() => handleClearFilter(setFilterCategoryValue)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div>
            <Label className="block font-medium text-accent_text_gray">Product Type</Label>
            <div className="items-center gap-2">
              <ScrollSelect
                name="product_type"
                value={filterTypeValue}
                onChange={(newValue: any) =>
                  handleFilterChange(filterTypeValue, setFilterTypeValue, newValue)
                }
                options={[
                  { label: 'Product', value: 'Product' },
                  { label: 'Service', value: 'Service' },
                  { label: 'Event', value: 'Event' },
                  { label: 'Project', value: 'Project' },
                ]}
                required={false}
              />
              {filterTypeValue && (
                <button
                  type="button"
                  onClick={() => handleClearFilter(setFilterTypeValue)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="mx-auto mt-14 flex max-w-[325px] items-center justify-center gap-10">
            <VioletButton variant="primary" className="w-[142px]" type="submit">
              Apply Filter
            </VioletButton>
          </div>
        </form>
      </Modal>

      <Modal
        title={modalHeader}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        widthClass="w-full md:w-[550px]"
      >
        <>
          <div className={`${modalContent === '' ? '' : 'hidden'}`}>
            <ProductManager
              setProductType={setProductType}
              productType={productType}
              ref={productManagerRef}
              onClose={() => setIsModalOpen(false)}
              productUid={selectedProductUid ? selectedProductUid : ''}
            />
          </div>

          <div className={`${modalContent === 'stock' ? '' : 'hidden'}`}>
            <StockLevelForm onClose={() => setIsModalOpen(false)} />
          </div>

          <div className={`${modalContent === 'brands' ? '' : 'hidden'}`}>
            <Brands
              isRefetch={isRefetch}
              setModalContent={setModalContent}
              setModalHeader={setModalHeader}
              setProductType={setProductType}
              setServiceOptions={setServiceOptions}
              setBrandUID={setUpdateBrandUID}
            />
          </div>
          <div className={`${modalContent === 'update-brands' ? '' : 'hidden'}`}>
            <EditBrand
              BrandUID={updateBrandUID}
              isRefetch={isRefetch}
              setIsRefetch={setIsRefetch}
              setModalContent={setModalContent}
              setModalTitle={setModalHeader}
            />
          </div>
          <div className={`${modalContent === 'update-category' ? '' : 'hidden'}`}>
            <EditCategory
              CategoryUID={updateCategoryUID}
              isRefetch={isRefetch}
              setIsRefetch={setIsRefetch}
              setModalContent={setModalContent}
              setModalTitle={setModalHeader}
            />
          </div>

          <div className={`${modalContent === 'categories' ? '' : 'hidden'}`}>
            <Categories
              setCategoryUID={setUpdateCategoryUID}
              isRefetch={isRefetch}
              setModalContent={setModalContent}
              setModalHeader={setModalHeader}
              setProductType={setProductType}
              setServiceOptions={setServiceOptions}
            />
          </div>

          <div className={`${modalContent === 'create-categories' ? '' : 'hidden'}`}>
            <CreateCategory
              isRefetch={isRefetch}
              setIsRefetch={setIsRefetch}
              setModalTitle={setModalHeader}
              setModalContent={setModalContent}
            />
          </div>

          <div className={`${modalContent === 'create-brands' ? '' : 'hidden'}`}>
            <CreateBrand
              isRefetch={isRefetch}
              setIsRefetch={setIsRefetch}
              setModalContent={setModalContent}
              setModalTitle={setModalHeader}
            />
          </div>

          <div className={`${modalContent === 'setting-columns' ? '' : 'hidden'}`}>
            <ColumnFilter />
          </div>
        </>
      </Modal>
    </div>
  );
};

export default Page;
