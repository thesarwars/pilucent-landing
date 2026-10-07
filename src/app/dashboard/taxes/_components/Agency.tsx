'use client';
import { useState } from 'react';
import Swal from 'sweetalert2';
import moment from 'moment';
import { useFetch } from '@/app/helpers/hooks';
import { deleteAgency, fetchAgencies } from '@/app/helpers/backend';
import AddAgency from './AddAgency';
import { useAppSelector } from '@/app/redux/store';
import {
  Chip,
  Drawer,
  VioletButton,
  VioletListTable,
  avatarGradient,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';
import { Plus, Pencil, Trash2, Landmark } from 'lucide-react';

function humanize(s: string): string {
  if (!s) return '—';
  return s
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function reportingMeta(method: string): { tone: VioletTone; label: string } {
  const m = `${method || ''}`.toUpperCase();
  if (m === 'ACCRUAL') return { tone: 'success', label: 'Accrual' };
  if (m === 'CASH') return { tone: 'teal', label: 'Cash' };
  if (m) return { tone: 'neutral', label: humanize(m) };
  return { tone: 'neutral', label: '—' };
}

const Agency = () => {
  const [UpdateUID, setUpdateUID] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const { data, isPending, refetch, setQueryParams } = useFetch(
    ['agency_list_data'],
    fetchAgencies
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
          const response = await deleteAgency(uid);
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
          text: 'Agency has been Deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleEditAgency = (uid: string) => {
    setUpdateUID(uid);
    setIsOpen(true);
  };

  const canEdit = Permissions?.includes('change_agency');
  const canDelete = Permissions?.includes('delete_agency');

  const columns: VListColumn[] = [
    {
      key: 'title',
      label: 'Agency',
      w: 'minmax(0,1.5fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-white"
            style={{ backgroundImage: avatarGradient(row?.title || row?.uid || '?') }}
          >
            <Landmark className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold text-v-ink900">{row?.title || '—'}</div>
            {row?.state && <div className="truncate text-[11px] text-v-ink400">{row.state}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'filling_frequency',
      label: 'Frequency',
      w: '130px',
      render: (row) => <Chip tone="violet">{humanize(row?.filling_frequency)}</Chip>,
    },
    {
      key: 'start_of_period',
      label: 'Period start',
      w: '120px',
      render: (row) => (
        <div className="truncate text-[12.5px] text-v-ink700">{row?.start_of_period || '—'}</div>
      ),
    },
    {
      key: 'date',
      label: 'Start date',
      w: '120px',
      render: (row) => (
        <div className="text-[12.5px] tabular-nums text-v-ink700">
          {row?.date ? moment(row.date).format('DD MMM YYYY') : '—'}
        </div>
      ),
    },
    {
      key: 'reporting_method',
      label: 'Reporting',
      w: '130px',
      render: (row) => {
        const m = reportingMeta(row?.reporting_method);
        return <Chip tone={m.tone}>{m.label}</Chip>;
      },
    },
  ];

  const renderActions =
    canEdit || canDelete
      ? (row: any) => (
          <>
            {canEdit && (
              <button
                type="button"
                aria-label="Edit agency"
                onClick={() => handleEditAgency(row?.uid)}
                className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                aria-label="Delete agency"
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
        icon={<Landmark />}
        title="Agencies"
        subtitle={(shown, total) => `${total} agencies you collect for`}
        data={data}
        loading={isPending}
        setParams={setQueryParams}
        columns={columns}
        searchPlaceholder="Search agencies"
        renderActions={renderActions}
        actionLabel="Actions"
        actionWidth="96px"
        emptyIcon={<Landmark className="h-[19px] w-[19px]" />}
        emptyTitle="No agencies yet"
        emptySub="Add the agencies you remit sales tax to."
        toolbarExtra={
          Permissions?.includes('add_agency') ? (
            <VioletButton
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setUpdateUID('');
                setIsOpen(true);
              }}
            >
              Add agency
            </VioletButton>
          ) : undefined
        }
      />
      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        width={460}
        icon={<Landmark />}
        title={UpdateUID ? 'Edit Agency' : 'Add Agency'}
        sub="Agencies you collect and remit sales tax for"
      >
        <AddAgency refetch={refetch} setIsOpen={setIsOpen} uid={UpdateUID} />
      </Drawer>
    </>
  );
};

export default Agency;
