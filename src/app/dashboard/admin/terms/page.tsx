'use client';

import React, { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { Search, Plus, MoreVertical, Pencil, Trash2, Clock, CalendarClock } from 'lucide-react';
import Pagination from '@/components/ui/Pagination/Pagination';
import { useFetch } from '@/app/helpers/hooks';
import Term from './Term';
import CardSkeleton from './CardSkeleton';
import { delTerm, fetchTerms, patchTerm } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import {
  Breadcrumb,
  Chip,
  Drawer,
  IconChip,
  Toggle,
  VioletButton,
} from '@/components/violet';
import { cn } from '@/lib/utils';

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [UpdateUID, setUpdateUID] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState(0);

  const { data, isPending, setQueryParams, refetch, params } = useFetch(['terms'], fetchTerms);

  const toggleAction = (uid: string) => setActiveItemId(activeItemId === uid ? null : uid);

  useEffect(() => {
    if (data?.count && data?.count != totalCount) setTotalCount(data?.count);
    setQueryParams({ ...params, page: currentPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleToggleActive = async (item: any) => {
    const res = await patchTerm(item?.uid, { is_active: !item?.is_active });
    if (res?.success) {
      setActiveItemId(null);
      toast.success('Status updated.');
      refetch();
    }
  };

  const handleDelete = async (uid: any) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7C4DFF',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, Just do it`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await delTerm(uid);
          if (response.success) {
            setActiveItemId(null);
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
          text: 'Term has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const actionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeItemId && !actionRef.current?.contains(event.target as Node)) {
        setActiveItemId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeItemId]);

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin', href: '#' },
          { label: 'Terms' },
        ]}
      />

      {/* header */}
      <div className="flex animate-v-rise flex-wrap items-center gap-3">
        <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
          Terms
        </h1>
        {totalCount > 0 && (
          <Chip tone="violet">
            {totalCount} {totalCount === 1 ? 'term' : 'terms'}
          </Chip>
        )}
        <span className="flex-1" />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-v-ink400" />
          <input
            onChange={(e) => setQueryParams({ ...params, search: e.target.value })}
            placeholder="Search terms"
            type="text"
            className="w-[220px] rounded-[10px] border border-v-border bg-v-card-subtle py-2 pl-9 pr-3 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
          />
        </div>
        <VioletButton
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setUpdateUID('');
            setIsOpen(true);
          }}
        >
          New term
        </VioletButton>
      </div>

      {/* cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isPending ? (
          Array.from({ length: 4 }).map((_, index) => <CardSkeleton key={index} />)
        ) : data?.results?.length > 0 ? (
          data.results.map((item: any, i: number) => {
            const active = !!item?.is_active;
            return (
              <div
                key={item.uid}
                className="group relative animate-v-rise overflow-hidden rounded-v-card bg-white shadow-v-card transition-shadow hover:shadow-v-tile-hover"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* status accent bar */}
                <span
                  className="absolute left-0 top-0 h-full w-[3px]"
                  style={{ backgroundColor: active ? '#1FA97A' : '#D8D2EC' }}
                />

                <div className="p-5">
                  {/* header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <IconChip tone={active ? 'success' : 'neutral'} size="lg">
                        <CalendarClock />
                      </IconChip>
                      <div className="min-w-0">
                        <h3 className="truncate text-[15px] font-extrabold capitalize text-v-ink900" title={item.title}>
                          {item.title}
                        </h3>
                        <div className="text-[11.5px] text-v-ink400">Payment term</div>
                      </div>
                    </div>

                    {/* kebab menu */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        aria-label="Term actions"
                        onClick={() => toggleAction(item.uid)}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-wash2 hover:text-v-ink900',
                          activeItemId === item.uid && 'bg-v-tint100 text-v-primary'
                        )}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {activeItemId === item.uid && (
                        <div
                          ref={actionRef}
                          className="absolute right-0 top-9 z-20 w-40 animate-v-pop overflow-hidden rounded-v-card border border-v-border bg-white p-1.5 shadow-v-modal"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setUpdateUID(item?.uid);
                              setIsOpen(true);
                              setActiveItemId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-[9px] px-2.5 py-1.5 text-left text-[12.5px] font-medium text-v-ink700 transition-colors hover:bg-v-wash"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.uid)}
                            className="flex w-full items-center gap-2 rounded-[9px] px-2.5 py-1.5 text-left text-[12.5px] font-medium text-v-danger-fg transition-colors hover:bg-v-danger-bg"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* days */}
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-v-wash2 px-3 py-1.5 text-[12.5px] font-bold tabular-nums text-v-ink700">
                      <Clock className="h-3.5 w-3.5 text-v-ink400" />
                      Net {item.days} {Number(item.days) === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  <div className="my-4 border-t border-[rgba(22,23,42,0.07)]" />

                  {/* footer */}
                  <div className="flex items-center justify-between">
                    <Chip tone={active ? 'success' : 'neutral'} dot>
                      {active ? 'Active' : 'Inactive'}
                    </Chip>
                    <Toggle
                      checked={active}
                      onChange={() => handleToggleActive(item)}
                      aria-label="Toggle active"
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center gap-2 rounded-v-card bg-white px-5 py-16 text-center shadow-v-card">
            <IconChip tone="violet" size="lg">
              <CalendarClock />
            </IconChip>
            <div className="text-sm font-semibold text-v-ink900">No terms yet</div>
            <div className="text-[13px] text-v-ink400">Create a payment term to get started.</div>
          </div>
        )}
      </div>

      <Pagination currentPage={currentPage} onPageChange={setCurrentPage} totalData={data?.count} />

      {/* create / edit drawer */}
      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        width={420}
        icon={<CalendarClock />}
        title={UpdateUID ? 'Edit Term' : 'New Term'}
        sub="Payment terms applied to invoices and bills"
      >
        <Term refetch={refetch} setIsOpen={setIsOpen} uid={UpdateUID} />
      </Drawer>
    </div>
  );
};

export default Page;
