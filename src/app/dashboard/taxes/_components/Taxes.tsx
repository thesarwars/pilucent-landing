'use client';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { useFetch } from '@/app/helpers/hooks';
import { deleteTaxRate, fetchTaxRates } from '@/app/helpers/backend';
import AddCustomRate from './AddCustomRate';
import { useAppSelector } from '@/app/redux/store';
import { Chip, Drawer, VioletButton, VioletListTable, type VListColumn } from '@/components/violet';
import { Plus, Pencil, Trash2, Percent } from 'lucide-react';

const Taxes = () => {
  const [editData, setEditData] = useState<any>({});
  const [isOpen, setIsOpen] = useState(false);
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const { data, isPending, refetch, setQueryParams } = useFetch(
    ['taxes_list_data'],
    fetchTaxRates
  );

  const handleDeleteAgency = (uid: string) => {
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
          const response = await deleteTaxRate(uid);
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
          text: 'Tax has been Deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleEditAgency = (data: any) => {
    setEditData(data);
    setIsOpen(true);
  };

  const canEdit = Permissions?.includes('change_agencytax');
  const canDelete = Permissions?.includes('delete_agencytax');

  const columns: VListColumn[] = [
    {
      key: 'title',
      label: 'Rate',
      w: 'minmax(0,1.4fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 min-w-[44px] shrink-0 items-center justify-center rounded-[9px] px-1.5 text-[12px] font-extrabold tabular-nums text-white"
            style={{ backgroundImage: 'linear-gradient(140deg,#B97608,#F5B22E)' }}
          >
            {Number(row?.total_rate) || 0}%
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold text-v-ink900">{row?.title || '—'}</div>
            {row?.agency?.title && (
              <div className="truncate text-[11px] text-v-ink400">{row.agency.title}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'is_single',
      label: 'Type',
      w: '120px',
      render: (row) =>
        row?.is_single ? <Chip tone="violet">Single</Chip> : <Chip tone="warn">Combined</Chip>,
    },
    {
      key: 'total_rate',
      label: 'Total rate',
      w: '110px',
      align: 'right',
      render: (row) => (
        <div className="text-right text-[13px] font-bold tabular-nums text-v-ink900">
          {Number(row?.total_rate) || 0}%
        </div>
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
                aria-label="Edit rate"
                onClick={() => handleEditAgency(row)}
                className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                aria-label="Delete rate"
                onClick={() => handleDeleteAgency(row?.uid)}
                className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </>
        )
      : undefined;

  return (
    <>
      <VioletListTable
        icon={<Percent />}
        title="Custom tax rates"
        subtitle={(shown, total) => `${total} single or combined rates`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search rates"
        renderActions={renderActions}
        actionLabel="Actions"
        actionWidth="96px"
        emptyIcon={<Percent className="h-[19px] w-[19px]" />}
        emptyTitle="No tax rates yet"
        emptySub="Add the sales-tax rates you charge."
        toolbarExtra={
          Permissions?.includes('add_agencytax') ? (
            <VioletButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setEditData({});
                setIsOpen(true);
              }}
            >
              Add rate
            </VioletButton>
          ) : undefined
        }
      />
      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        width={460}
        icon={<Percent />}
        title={editData?.uid ? 'Edit Rate' : 'Add Rate'}
        sub="Single or combined sales-tax rates"
      >
        <AddCustomRate refetch={refetch} setIsOpen={setIsOpen} data={editData} />
      </Drawer>
    </>
  );
};

export default Taxes;
