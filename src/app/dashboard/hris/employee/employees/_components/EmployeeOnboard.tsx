'use client';
import React, { FormEvent, useState } from 'react';
import Modal from '@/app/(admin)/_components/Modal';
import RoleSelectDropdown, {
  MultipleRoleSelectDropdown,
} from '@/components/ui/ScrollSelectDropDowns/RoleSelectDropdown';
import { postEmployee } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import Button from '@/components/ui/RawButton';

const EmployeeOnboard = ({
  isOpen,
  setIsOpen,
  refetch,
  onboardingKind,
  setOnboardingKind,
}: {
  isOpen: boolean;
  setIsOpen: any;
  refetch?: any;
  onboardingKind: string;
  setOnboardingKind: any;
}) => {
  const [isPending, setIsPending] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
  const [data, setData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    confirmation_date: '',
    personal_email: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(data)?.map((field) => {
        formData.append(field, data?.[field as keyof typeof data]);
      });
      selectedRoles?.map((role: any) => formData.append('company_role_uids', role?.uid));
      formData.append('on_boarding_kind', onboardingKind);
      formData.append('preferred_email', data.personal_email);
      formData.append('company_email', data.personal_email);
      setIsPending(true);
      const res = await postEmployee(formData);
      if (res?.success) {
        toast.success('Employee added and invitation has ben sent to the mail.');
        refetch && refetch();
        setIsOpen(false);
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      widthClass="w-full md:w-[550px]"
      title={'Add An Employee'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="flex flex-col gap-2">
          <label className="text-accent_soft_black">
            {' '}
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            onChange={(e) => setData({ ...data, first_name: e.target.value })}
            value={data.first_name}
            type="text"
            required
            className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-accent_soft_black">
            {' '}
            Middle Name <span className="text-red-500">*</span>
          </label>
          <input
            onChange={(e) => setData({ ...data, middle_name: e.target.value })}
            value={data.middle_name}
            type="text"
            className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-accent_soft_black">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            required
            onChange={(e) => setData({ ...data, last_name: e.target.value })}
            value={data.last_name}
            type="text"
            className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-accent_soft_black">
            Confirmation Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            onChange={(e) => setData({ ...data, confirmation_date: e.target.value })}
            value={data.confirmation_date}
            className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-accent_soft_black">
            Role <span className="text-red-500">*</span>
          </label>
          <MultipleRoleSelectDropdown
            kind="EMPLOYEE"
            setValue={setSelectedRoles}
            value={selectedRoles}
            ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-accent_soft_black">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            onChange={(e) => setData({ ...data, personal_email: e.target.value })}
            value={data.personal_email}
            className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-accent_soft_black">
            Onboarding Type <span className="text-red-500">*</span>
          </label>

          <select
            onChange={(e) => setOnboardingKind(e.target.value)}
            value={onboardingKind}
            style={{ borderBottom: '1px solid #c4c4c4' }}
            className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
          >
            <option value={'SELF_ONBOARD_WITH_I9'}>Employee self onboard with from 1-9 </option>
            <option value={'SELF_ONBOARD'}>Employee self onboard</option>
            <option disabled value={'MANUAL_ENTRY'}>
              I’ll enter all the their into myself{' '}
            </option>
          </select>
        </div>

        <div className="flex items-center justify-center gap-4 pt-[48px]">
          <div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg border border-accent_soft_blue bg-white px-[43.5px] py-3 text-sm font-semibold leading-[21px] text-accent_soft_blue"
            >
              Cancel
            </button>
          </div>
          <div>
            <Button
              isLoading={isPending}
              disabled={isPending}
              type="submit"
              className="rounded-lg bg-black px-[43.5px] py-3 text-sm font-semibold leading-[21px] text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeOnboard;