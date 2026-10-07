'use client';
import React, { useState, useEffect } from 'react';
import { MdOutlinePaid } from 'react-icons/md';
import { BsBank } from 'react-icons/bs';
import { GoCreditCard } from 'react-icons/go';
import { TfiWrite } from 'react-icons/tfi';
import Swal from 'sweetalert2';
import {
  deletePaymentMethod,
  fetchPaymentMethods,
  patchPaymentMethod,
} from '@/app/helpers/backend';
import Switch from '@/components/ui/Switch';
import Modal from '@/app/(admin)/_components/Modal';
import PaymentMethod from './PaymentMethod';
import { useFetch } from '@/app/helpers/hooks';
import Pagination from '@/components/ui/Pagination/Pagination';
import { toast } from '@/lib/ToastService';
import { ManualBreadcrumbs } from '@/components/BreadCrumb/BreadCrumb';
import Image from 'next/image';
import Button from '@/components/ui/RawButton';

export interface PaymentMethod {
  // Add export keyword
  uid: string;
  title: string;
  status: string;
}

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [UpdateUID, setUpdateUID] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [page, setPage] = useState(1); // Add page state

  const { data, isPending, setQueryParams, refetch, params, isError } = useFetch(
    ['paymentMethods'],
    fetchPaymentMethods
  );

  useEffect(() => {
    setQueryParams({ ...params, page: page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    if (data) {
      setPaymentMethods(data.results);
    }
  }, [data]);

  const handleStatusToggle = async (uid: string, currentStatus: string) => {
    setIsUpdating(uid);
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const data = {
      status: newStatus,
    };

    try {
      const result = await patchPaymentMethod(uid, data);
      if (result.success) {
        refetch();
        toast.success(`Status updated.`);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleEditClick = (method: PaymentMethod) => {
    setUpdateUID(method?.uid);
    setIsOpen(true);
    setDropdownOpen(null); // Close dropdown when edit form opens
  };

  const handleDeleteClick = async (uid: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this payment method!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6A6EF6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const result = await deletePaymentMethod(uid);
          if (result.success) {
            return result;
          }
          throw new Error('Failed to delete');
        } catch (error) {
          Swal.showValidationMessage(`Request failed: ${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        refetch();
        Swal.fire({
          title: 'Deleted!',
          text: 'Payment method has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });

    setDropdownOpen(null); // Close dropdown after delete action
  };

  const getPaymentMethodIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'cash':
        return {
          Icon: MdOutlinePaid,
          bgColor: 'bg-accent_bg_deep_blue',
          cardBg: 'bg-accent_bg_water_blue',
        };
      case 'check':
        return {
          Icon: TfiWrite,
          bgColor: 'bg-accent_bg_deep_purple',
          cardBg: 'bg-accent_bg_deep_light_purple',
        };
      case 'credit card':
        return {
          Icon: GoCreditCard,
          bgColor: 'bg-accent_bg_deep_light_yellow',
          cardBg: 'bg-accent_bg_beige',
        };
      case 'direct debit':
        return {
          Icon: BsBank,
          bgColor: 'bg-accent_bg_deep_light_ash',
          cardBg: 'bg-accent_bg_bright_gray',
        };
      default:
        return {
          Icon: MdOutlinePaid,
          bgColor: 'bg-accent_bg_deep_blue',
          cardBg: 'bg-accent_bg_water_blue',
        };
    }
  };

  const toggleDropdown = (uid: string) => {
    // Close dropdown if clicking the same one, open if clicking a different one
    setDropdownOpen(dropdownOpen === uid ? null : uid);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="">
      <ManualBreadcrumbs
        items={[
          {
            label: 'Payment Methods',
            href: '/dashboard/admin/payment_management',
          },
        ]}
        className="mb-5 mt-0"
      />
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold leading-9 text-accent_text_black">Payment Methods</h2>
        <Button
          onClick={() => {
            setUpdateUID('');
            setDropdownOpen(null); // Close any open dropdown
            setIsOpen(true);
          }}
          className="flex items-center gap-2 text-nowrap rounded-md bg-black px-4 text-white hover:bg-gray-900"
        >
          <Image
            src="/icons/plus-sign.svg"
            width={100}
            height={100}
            alt="plus"
            className="h-5 w-5 object-contain"
          />
          <span className="text-sm font-medium">Add New</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {isPending ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))
        ) : isError ? (
          <div className="col-span-full py-4 text-center text-red-500">
            Failed to load payment methods
          </div>
        ) : (
          paymentMethods.map((method, idx) => {
            const { Icon, bgColor, cardBg } = getPaymentMethodIcon(method.title);
            return (
              <div
                style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.05)' }}
                key={method.uid}
                className={`relative flex w-full max-w-80 items-center gap-4 overflow-hidden rounded-xl bg-white/60 shadow-sm transition-all duration-200 hover:shadow-md`}
              >
                <div
                  className={`h-full w-1 ${method?.status == 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`}
                />
                <div className={`w-full p-4`}>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 text-white ${bgColor} rounded-lg`}>
                      <Icon size={20} />
                    </div>

                    <div className="dropdown-container relative">
                      <button
                        onClick={() => toggleDropdown(method.uid)}
                        className="rounded-full p-2 transition-colors hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-1 w-1 rounded-full bg-accent_soft_black" />
                          <div className="h-1 w-1 rounded-full bg-accent_soft_black" />
                          <div className="h-1 w-1 rounded-full bg-accent_soft_black" />
                        </div>
                      </button>

                      {dropdownOpen === method.uid && (
                        <div className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-lg border bg-white shadow-lg">
                          <button
                            onClick={() => handleEditClick(method)}
                            className="w-full px-4 py-2 text-left text-sm text-accent_soft_black transition-colors hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(method.uid)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-gray-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col justify-between">
                    <h3 className="text-lg font-medium text-accent_soft_black">{method.title}</h3>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <Switch
                        value={method.status === 'ACTIVE'}
                        disabled={isUpdating === method.uid}
                        onChange={() => handleStatusToggle(method.uid, method.status)}
                        name={`switch${idx}`}
                      />

                      <div className="flex items-center gap-2 text-base text-accent_soft_black">
                        <p
                          className={`rounded-full p-2 text-sm ${method?.status == 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`}
                        ></p>
                        {method.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <Pagination currentPage={page} onPageChange={setPage} totalData={data?.count || 0} />

      <Modal
        onClose={() => {
          setIsOpen(false);
        }}
        isOpen={isOpen}
        title={'Payment Method'}
        widthClass="w-full md:w-[500px]"
      >
        <PaymentMethod setIsOpen={setIsOpen} uid={UpdateUID} refetch={refetch} />
      </Modal>
    </div>
  );
};

export default Page;
