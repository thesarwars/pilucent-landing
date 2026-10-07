'use client';
import { deleteWarehouse, fetchWarehouses } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { useAppSelector } from '@/app/redux/store';
import { useState } from 'react';
import Swal from 'sweetalert2';
import WarehouseLocation from './_components/WarehouseLocation';
import Filter from './_components/Filter';
import {
  Breadcrumb,
  Chip,
  Drawer,
  VioletButton,
  VioletListTable,
  type VListColumn,
} from '@/components/violet';
import { Plus, Pencil, Trash2, Warehouse, MapPin, SlidersHorizontal } from 'lucide-react';

function humanize(s: string): string {
  if (!s) return '—';
  return s
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const Page = () => {
  const { data, isPending, refetch, params, setQueryParams } = useFetch(
    ['warehouse_locations'],
    fetchWarehouses
  );
  const [isOpen, setIsOpen] = useState(false);
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [updateUID, setUpdateUID] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const handleDelete = async (uid: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6A6EF6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, Delete`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await deleteWarehouse(uid);
          if (response.success) {
            refetch();
            return response;
          }
          throw new Error('Failed');
        } catch (error) {
          Swal.showValidationMessage(`${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Success!',
          text: 'Warehouse has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const total = data?.count ?? (data?.results?.length || 0);
  const canEdit = Permissions?.includes('change_warehouse');
  const canDelete = Permissions?.includes('delete_warehouse');

  const columns: VListColumn[] = [
    {
      key: 'title',
      label: 'Warehouse',
      w: 'minmax(0,1.4fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-v-tint100 text-v-primary">
            <Warehouse className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold text-v-ink900">{row?.title || '—'}</div>
            {row?.short_name && (
              <div className="truncate text-[11px] text-v-ink400">{row.short_name}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'short_name',
      label: 'Short name',
      w: '130px',
      defaultHidden: true,
      render: (row) => (
        <div className="truncate text-[12.5px] tabular-nums text-v-ink700">
          {row?.short_name || '—'}
        </div>
      ),
    },
    {
      key: 'kind',
      label: 'Type',
      w: '130px',
      render: (row) => <Chip tone="violet">{humanize(row?.kind)}</Chip>,
    },
    {
      key: 'address',
      label: 'Location',
      w: 'minmax(0,1.6fr)',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-1.5 text-[12.5px] text-v-ink700">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-v-ink400" />
          <span className="truncate">{row?.address?.full_address || '—'}</span>
        </div>
      ),
    },
    {
      key: 'remark',
      label: 'Remarks',
      w: 'minmax(0,1fr)',
      render: (row) => (
        <div className="truncate text-[12.5px] text-v-ink500">{row?.remark || '—'}</div>
      ),
    },
  ];

  const renderActions =
    canEdit || canDelete
      ? (row: any) => (
          <>
            {canEdit && (
              <button
                type="button"
                aria-label="Edit warehouse"
                onClick={() => {
                  setModalTitle('Edit Warehouse');
                  setUpdateUID(row.uid);
                  setIsOpen(true);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                aria-label="Delete warehouse"
                onClick={() => handleDelete(row.uid)}
                className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </>
        )
      : undefined;

  return (
    <div className="relative min-w-full font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sales', href: '/dashboard/sales/all_sales' },
          { label: 'Warehouse locations' },
        ]}
      />

      {/* header */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-v-ink900">
          Warehouse locations
        </h1>
        <Chip tone="violet">{total}</Chip>

        <span className="flex-1" />

        {Permissions?.includes('add_warehouse') && (
          <VioletButton
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setModalTitle('Warehouse Location');
              setUpdateUID('');
              setIsOpen(true);
            }}
          >
            Add new
          </VioletButton>
        )}
      </div>

      <div className="mt-[18px]">
        <VioletListTable
          icon={<Warehouse />}
          title="Warehouse locations"
          data={data}
          loading={isPending}
          setParams={setQueryParams}
          columns={columns}
          searchPlaceholder="Search warehouses"
          renderActions={renderActions}
          actionLabel="Actions"
          actionWidth="96px"
          emptyIcon={<Warehouse className="h-[19px] w-[19px]" />}
          emptyTitle="No warehouses found"
          emptySub="Add a warehouse to start tracking stock locations."
          toolbarExtra={
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              title="Filter"
              className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
            >
              <SlidersHorizontal className="h-[16px] w-[16px]" />
            </button>
          }
        />
      </div>

      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        icon={<Warehouse />}
        title={modalTitle || 'Warehouse location'}
        sub="Define a stock location and its address"
        width={560}
      >
        <WarehouseLocation setIsOpen={setIsOpen} uid={updateUID} refetch={refetch} />
      </Drawer>

      <Drawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        icon={<SlidersHorizontal />}
        title="Filter"
        sub="Narrow warehouses by type and more"
        width={420}
      >
        <Filter
          setIsFilterOpen={setIsFilterOpen}
          params={params}
          setQueryParams={setQueryParams}
          refetch={refetch}
        />
      </Drawer>
    </div>
  );
};

export default Page;
