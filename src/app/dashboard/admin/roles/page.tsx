'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Plus, UserPlus, Pencil, Trash2, Users, BadgeCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import User from './_components/User';
import RoleCarousel from './_components/RoleCarousel';
import { deleteUser, fetchUserOnboardList } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { useAppSelector } from '@/app/redux/store';
import {
  Avatar,
  Breadcrumb,
  Chip,
  VioletButton,
  VioletListTable,
  type VListColumn,
  type VioletTone,
} from '@/components/violet';

const statusTone = (s?: string): VioletTone => {
  const v = `${s || ''}`.toUpperCase();
  if (v.includes('ACTIVE') || v === 'APPROVED') return 'success';
  if (v.includes('PEND') || v.includes('INVIT')) return 'warn';
  if (v.includes('INACTIVE') || v.includes('SUSPEND') || v.includes('BLOCK') || v.includes('REJECT'))
    return 'danger';
  return 'neutral';
};

const titleCase = (s?: string) =>
  `${s || ''}`
    .split('_')
    .join(' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const Page = () => {
  const [roleUpdateUID, setRoleUpdateUID] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { Company } = useAppSelector((state) => state.CompanyData);
  const {
    data: userList,
    isLoading: isUserListLoading,
    refetch,
    setQueryParams,
  } = useFetch(['user_list'], fetchUserOnboardList);

  const handleEditButtonClick = (uid: string) => {
    setRoleUpdateUID(uid);
    setIsOpen(true);
  };

  const handleDelete = (uid: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7C4DFF',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, Delete`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await deleteUser(uid);
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
          text: 'User has been Deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const columns: VListColumn[] = [
    {
      key: 'name',
      label: 'User name',
      w: 'minmax(0,1.6fr)',
      locked: true,
      render: (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
          {row?.image ? (
            <Image
              width={72}
              height={72}
              src={row.image}
              alt={row?.name || 'user'}
              className="h-9 w-9 shrink-0 rounded-full object-cover object-top"
            />
          ) : (
            <Avatar name={row?.name || '?'} size={36} />
          )}
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold text-v-ink900">{row?.name || '—'}</div>
            <div className="truncate text-[11px] text-v-ink400">{row?.email || '—'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      w: '120px',
      render: (row) =>
        row?.status ? (
          <Chip tone={statusTone(row.status)} dot>
            {titleCase(row.status)}
          </Chip>
        ) : (
          <span className="text-[12.5px] text-v-ink400">—</span>
        ),
    },
    {
      key: 'phone',
      label: 'Phone',
      w: '140px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">{row?.phone || '—'}</span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      w: 'minmax(0,1fr)',
      render: (row) => {
        const role = row?.company_user?.roles?.[0]?.name;
        return role ? (
          <Chip tone="violet">{role}</Chip>
        ) : (
          <span className="text-[12.5px] text-v-ink400">N/A</span>
        );
      },
    },
    {
      key: 'is_email_verified',
      label: 'Verified',
      w: '120px',
      render: (row) =>
        row?.is_email_verified ? (
          <Chip tone="success" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
            Verified
          </Chip>
        ) : (
          <Chip tone="neutral" dot>
            Pending
          </Chip>
        ),
    },
    {
      key: 'code',
      label: 'Employee code',
      w: '140px',
      render: (row) => (
        <span className="text-[12.5px] tabular-nums text-v-ink700">{row?.employee?.code || '—'}</span>
      ),
    },
  ];

  const renderActions = (row: any) => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Edit user role"
        onClick={() => handleEditButtonClick(row?.uid)}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Delete user"
        onClick={() => handleDelete(row?.uid)}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta">
      {/* header */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Admin', href: '#' },
            { label: 'Role Management' },
          ]}
        />
        <div className="mt-2.5 flex animate-v-rise flex-wrap items-center gap-3">
          <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
            User Role Management
          </h1>
          <span className="flex-1" />
          <Link href="roles/create">
            <VioletButton variant="secondary" leftIcon={<Plus className="h-4 w-4" />}>
              Add Role
            </VioletButton>
          </Link>
          <VioletButton
            variant="primary"
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => {
              setRoleUpdateUID('');
              setIsOpen(true);
            }}
          >
            Add User
          </VioletButton>
        </div>
      </div>

      <RoleCarousel />

      <VioletListTable
        icon={<Users />}
        title="Users"
        subtitle={(shown, total) => `${shown} of ${total} ${total === 1 ? 'user' : 'users'}`}
        data={userList}
        loading={isUserListLoading}
        setParams={setQueryParams}
        columns={columns}
        renderActions={renderActions}
        actionLabel="Actions"
        actionWidth="84px"
        searchPlaceholder="Search users"
        emptyIcon={<Users className="h-[19px] w-[19px]" />}
        emptyTitle="No users yet"
        emptySub="Add a user or adjust your search to see results here."
      />

      <User isOpen={isOpen} uid={roleUpdateUID} setIsOpen={setIsOpen} refetch={refetch} />
    </div>
  );
};

export default Page;
