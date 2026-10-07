'use client';

import React, { useEffect, useState } from 'react';
import { ShieldPlus, UserPlus } from 'lucide-react';
import {
  fetchUserOnboard,
  patchUserOnboard,
  postUserOnboard,
} from '@/app/helpers/backend';
import PermissionsPopup from './PermissionsPopup';
import ExtraPermissions from './ExtraPermission';
import { MultipleRoleSelectDropdown } from '@/components/ui/ScrollSelectDropDowns/RoleSelectDropdown';
import MainLoader from '@/components/MainLoader/MainLoader';
import { toast } from '@/lib/ToastService';
import { Drawer, VioletButton, VioletInput } from '@/components/violet';

interface Option {
  setIsOpen?: any;
  refetch?: () => void;
  uid?: string;
  isOpen: any;
}

const labelCls = 'mb-1.5 block text-xs font-semibold text-v-ink700';

const User = ({ setIsOpen, refetch, uid, isOpen }: Option) => {
  const [data, setData] = useState<any>({
    email: '',
    roles: [],
    name: '',
    employee_code: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<any[]>([]);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);

  const [isPending, setIsPending] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!uid) {
      setData({ email: '', roles: [], name: '', employee_code: '' });
      setSelectedRoles([]);
    }
  }, [uid]);

  useEffect(() => {
    const fn = async () => {
      try {
        setIsLoading(true);
        const res = await fetchUserOnboard(uid);
        if (!res?.error) {
          setData({
            ...data,
            ...res?.data,
            email: res?.data?.email,
            name: res?.data?.name,
            employee_code: res?.data?.employee?.code || '',
          });
          setSelectedRoles(res?.data?.company_user?.roles || []);
        }
        handleSelectedRole(
          res?.data?.company_user?.ext_permissions,
          res?.data?.company_user?.role_permissions
        );
      } catch (error) {
        toast.error("Couldn't retrieve to get user data!");
      } finally {
        setIsLoading(false);
      }
    };
    if (uid) fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const handleSelectedRole = (role: any, rolePermissions: any) => {
    const appLabel = role?.app_label || {};

    const allIds = Object.values(appLabel).flatMap((app: any) =>
      Object.values(app?.model || {}).flatMap((modelArray: any) =>
        modelArray.map((entry: any) => entry.id)
      )
    );
    const allRolePermissionIds = Object.values(rolePermissions.app_label).flatMap((app: any) =>
      Object.values(app?.model || {}).flatMap((modelArray: any) =>
        modelArray.map((entry: any) => entry.id)
      )
    );

    setSelectedPermissions([...allIds]);
    setSelectedRolePermissions([...allRolePermissionIds]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (uid) {
      const Data = {
        permission: selectedPermissions,
        role_uids: selectedRoles?.map((role: any) => role.uid),
        employee_code: data?.employee_code,
        name: data?.name,
      };

      const formData = new FormData();
      formData.append('name', Data?.name);
      Data?.role_uids?.map((role: any) => formData.append('role_uids', role));
      formData.append('permission', JSON.stringify(Data?.permission));
      formData.append('employee_code', Data?.employee_code);

      try {
        setIsPending(true);
        const result = await patchUserOnboard(uid, formData);
        if (result?.success) {
          toast.success('User updated.');
          setIsOpen && setIsOpen(false);
          refetch && refetch();
        }
      } catch (error) {
        // toast.error("Something went wrong");
      } finally {
        setIsPending(false);
      }
    } else {
      const payload = {
        email: data.email,
        role_uids: selectedRoles?.map((role: any) => role.uid),
        name: data?.name,
      };
      try {
        setIsPending(true);
        const result = await postUserOnboard(payload);
        if (result?.email) {
          toast.success('User created.');
          setIsOpen && setIsOpen(false);
          refetch && refetch();
        }
      } catch (error) {
        toast.error('Something went wrong');
      } finally {
        setIsPending(false);
      }
    }
  };

  return (
    <Drawer
      open={isOpen}
      onClose={() => setIsOpen(false)}
      width={440}
      icon={<UserPlus />}
      title={uid ? 'Edit User' : 'Add User'}
      sub="Invite a teammate and assign roles"
    >
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <MainLoader />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <VioletInput
            label="Email"
            type="email"
            placeholder="name@company.com"
            disabled={!!data?.employee?.uid || !!uid}
            value={data?.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            className={!!data?.employee?.uid || !!uid ? 'cursor-not-allowed bg-v-wash2' : undefined}
            hint={data?.employee?.uid ? 'To edit email, go to the employee page.' : undefined}
          />

          <VioletInput
            label="Name"
            required
            placeholder="Full name"
            disabled={!!data?.employee?.uid}
            value={data?.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className={data?.employee?.uid ? 'cursor-not-allowed bg-v-wash2' : undefined}
            hint={data?.employee?.uid ? 'To edit name, go to the employee page.' : undefined}
          />

          {uid && data?.employee?.uid && (
            <VioletInput
              label="Employee code"
              placeholder="Employee code"
              value={data?.employee_code}
              onChange={(e) => setData({ ...data, employee_code: e.target.value })}
            />
          )}

          <div>
            <label className={labelCls}>Select role</label>
            <MultipleRoleSelectDropdown
              kind="USER"
              ClassName="bg-transparent border border-v-border rounded-v-input focus:border-v-primary"
              setValue={setSelectedRoles}
              value={selectedRoles}
            />
          </div>

          {uid && (
            <VioletButton
              type="button"
              variant="soft"
              className="self-start"
              leftIcon={<ShieldPlus className="h-4 w-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Add extra permission
            </VioletButton>
          )}

          <div className="mt-1 flex items-center gap-2.5">
            <VioletButton
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen && setIsOpen(false)}
            >
              Cancel
            </VioletButton>
            <VioletButton type="submit" variant="primary" className="flex-1" disabled={isPending}>
              {isPending ? 'Saving…' : uid ? 'Update user' : 'Add user'}
            </VioletButton>
          </div>

          <PermissionsPopup isOpen={isModalOpen} setIsOpen={setIsModalOpen}>
            <ExtraPermissions
              selectedRolePermissions={selectedRolePermissions}
              selectedPermissions={selectedPermissions}
              setSelectedPermissions={setSelectedPermissions}
            />
            <div className="sticky bottom-0 left-0 right-0 mt-6 flex justify-end gap-3 bg-white p-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md border border-gray-300 px-8 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-indigo-900 px-8 py-2 text-white transition-colors hover:bg-indigo-800"
              >
                Save
              </button>
            </div>
          </PermissionsPopup>
        </form>
      )}
    </Drawer>
  );
};

export default User;
