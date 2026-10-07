import { useAppSelector } from '@/app/redux/store';
import Button from '@/components/ui/RawButton';
import DepartmentSelectDropdown from '@/components/ui/ScrollSelectDropDowns/DepartmentSelectDropdown';
import DesignationSelectDropdown from '@/components/ui/ScrollSelectDropDowns/DesignationSelectDropdown';
import EmployeeSelectDropdown from '@/components/ui/ScrollSelectDropDowns/EmployeeSelectDropdown';
import RoleSelectDropdown, {
  MultipleRoleSelectDropdown,
} from '@/components/ui/ScrollSelectDropDowns/RoleSelectDropdown';
import ShiftSelectDropdown from '@/components/ui/ScrollSelectDropDowns/ShiftSelectDropdown';
import WorkLocationSelectDropDown from '@/components/ui/ScrollSelectDropDowns/WorkLocationSelectDropDown';
import SmoothCheckbox from '@/components/ui/SmoothCheckbox';
import Image from 'next/image';
import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { BiTrash } from 'react-icons/bi';
import { FiEdit } from 'react-icons/fi';
import PhoneNumberInput from './PhoneNumberInput';
import LogoLoader from '@/components/MainLoader/logo-loader';
import { MdOutlineFileUpload } from 'react-icons/md';
import { patchEmployee, patchEmployeeAddress, postEmployeeAddress } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import DotSpinner from '../../_components/dot-spinner';
import SignaturePad from '../../_components/signature';

const ssnDigitsOnly = (value: string) => value.replace(/\D/g, '');

interface SignaturePadRef {
  clear: () => void;
}

const formatSsnDisplay = (value: string) => {
  const d = ssnDigitsOnly(value).slice(0, 9);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
};

const Overview = ({
  view = false,
  Employee,
  isPending,
  refetch,
  uid = '',
}: {
  view?: boolean;
  Employee: any;
  isPending?: boolean;
  refetch?: any;
  uid?: string;
}) => {
  const [isDisabled, setIsDisabled] = useState(true);
  const [isDisabled1, setIsDisabled1] = useState(true);
  const [isDisabled2, setIsDisabled2] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [data, setData] = useState<any>({});
  const [workAddress, setWorkAddress] = useState<any>({
    is_work_address: true,
  });
  const [isCompanyAddress, setIsCompanyAddress] = useState<boolean>(false);
  const { Company } = useAppSelector((state) => state.CompanyData);
  const { UserData } = useAppSelector((state) => state.userData);
  const reportToExcludeUids = Array.from(
    new Set([UserData?.employee?.uid, uid].filter((id): id is string => Boolean(id)))
  );
  const [RenderAgain, setRenderAgain] = useState(false);
  const [file, setFile] = useState<any>();

  const [loading, setLoading] = useState<boolean>(false);
  const signaturePadRef = useRef<SignaturePadRef | null>(null);
  const [signatureData, setSignatureData] = useState<string>('');
  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setSignatureData('');
    }
  };

  useEffect(() => {
    if (!isPending) {
      setData({
        ...Employee,
        // ...Employee?.user,
        company_roles: Employee?.company_roles,
        department_uid: Employee?.department,
        designation_uid: Employee?.designation,
        report_to_uid: Employee?.report_to,
        work_locations: Employee?.work_locations,
        ssn: ssnDigitsOnly(String(Employee?.ssn ?? '')).slice(0, 9),
      });
      setImageSrc(Employee?.image || '');
      Employee?.addresses?.map((address: any) => {
        if (address?.is_work_address) {
          setWorkAddress({ ...workAddress, ...address });
        }
      });
    }
  }, [Employee, isPending, RenderAgain]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFile(files[0]);
    }
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setImageSrc(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseCompanyAddress = (checked: boolean) => {
    if (checked) {
      setWorkAddress({
        ...workAddress,
        city: Company?.company_addresses?.city || '',
        province: Company?.company_addresses.state || '',
        postal_code: Company?.company_addresses?.zip_code || '',
        full_address: Company?.company_addresses?.address || '',
      });
    } else {
      setWorkAddress({
        ...workAddress,
        city: '',
        province: '',
        postal_code: '',
        full_address: '',
      });
    }

    setIsCompanyAddress(checked);
  };

  const UpdateEmployee = async (formData: FormData, preToast = 'Profile image', next: any) => {
    if (!uid) return toast.error('Employee not found!');
    try {
      setIsUpdating(true);
      const res = await patchEmployee(uid, formData);
      if (res?.success) {
        toast.success(`${preToast} updated`);
        refetch && refetch();
        next();
      }
    } catch (error) {
      //err
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateImage = () => {
    const data = new FormData();
    if (file?.size > 1000 * 1024) {
      return toast.warning("Image Size can't be larger than 1 Megabyte");
    }
    data.append('image', file);
    UpdateEmployee(data, 'Profile image', () => setFile(''));
  };

  const handleSaveProfileInfo = () => {
    const nextSsn = ssnDigitsOnly(String(data?.ssn ?? '')).slice(0, 9);
    if (nextSsn.length > 0 && nextSsn.length !== 9) {
      return toast.error('SSN must be exactly 9 digits.');
    }

    if (
      data?.company_roles?.length == 0 &&
      data?.company_roles?.length != Employee?.company_roles?.length
    ) {
      return toast.error('Please select at least one role.');
    }

    const formData = new FormData();
    Employee?.employee_id != data?.employee_id && formData.append('employee_id', data?.employee_id);
    Employee?.status != data?.status && formData.append('status', data?.status);
    Employee?.first_name != data?.first_name && formData.append('first_name', data?.first_name);
    Employee?.middle_name != data?.middle_name && formData.append('middle_name', data?.middle_name);
    Employee?.last_name != data?.last_name && formData.append('last_name', data?.last_name);
    Employee?.gender != data?.gender && formData.append('gender', data?.gender);
    Employee?.salutation != data?.salutation && formData.append('salutation', data?.salutation);
    Employee?.date_of_birth != data?.date_of_birth &&
      formData.append('date_of_birth', data?.date_of_birth);
    data?.company_roles?.map((role: any) => formData.append('company_role_uids', role?.uid));
    ssnDigitsOnly(String(Employee?.ssn ?? '')) !== nextSsn && formData.append('ssn', nextSsn);
    UpdateEmployee(formData, 'Personal details', () => setIsDisabled(true));
  };

  const handleSaveCompanyDetails = () => {
    const formData = new FormData();
    Employee?.department?.uid !== data?.department_uid?.uid &&
      formData.append('department_uid', data?.department_uid?.uid);
    Employee?.designation?.uid !== data?.designation_uid?.uid &&
      formData.append('designation_uid', data?.designation_uid?.uid);
    Employee?.report_to?.uid !== data?.report_to_uid?.uid &&
      formData.append('report_to_uid', data?.report_to_uid?.uid);
    Employee?.kind !== data?.kind && formData.append('kind', data?.kind);
    Employee?.company_phone_number !== data?.company_phone_number &&
      formData.append('company_phone_number', data?.company_phone_number);
    Employee?.company_email !== data?.company_email &&
      formData.append('company_email', data?.company_email);
    Employee?.work_locations?.uid !== data?.work_locations?.uid &&
      formData.append('work_locations_uid', data?.work_locations?.uid);
    UpdateEmployee(formData, 'Company details', () => setIsDisabled1(true));
  };

  const handleSaveAddress = async () => {
    try {
      setIsUpdating(true);
      let res;
      if (workAddress?.uid) {
        res = await patchEmployeeAddress(workAddress?.uid, workAddress);
      } else {
        res = await postEmployeeAddress({ ...workAddress, employee_uid: uid });
      }
      if (res?.success) {
        setIsDisabled2(true);
        refetch && refetch();
        setRenderAgain(!RenderAgain);
        toast.success('Work address updated.');
      }
    } catch (error) {
      //err
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGiveUserAccess = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('is_access_enabled', String(!data?.is_access_enabled));
      const res = await patchEmployee(uid, formData);
      if (res?.success) {
        toast.success('User access updated.');
        refetch && refetch();
      }
    } catch (error) {
      //err
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <DotSpinner />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full text-sm">
      <div className="mt-4 flex flex-col gap-2 rounded-lg bg-white/60 p-5">
        <label className="border-b text-lg font-medium text-accent_soft_black">User Profile</label>
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-3 text-center md:text-left">
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-800">
              <span className="w-14 font-medium text-accent_soft_black">Name :</span>

              <span className="text-accent_soft_black">
                {data?.first_name || ''} {data?.middle_name || ''} {data?.last_name || ''}
              </span>
            </div>
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-800">
              <span className="w-14 font-medium text-accent_soft_black">Role :</span>

              <span className="text-accent_soft_black">
                {data?.company_roles?.map((role: any) => role?.name).join(', ') || ''}
              </span>
            </div>
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-800">
              <span className="w-14 font-medium text-accent_soft_black">Email :</span>

              <span className="text-accent_soft_black">{data?.company_email || ''}</span>
            </div>
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-800">
              <span className="w-28 text-nowrap font-medium text-accent_soft_black">
                Phone Number :
              </span>

              <span className="text-accent_soft_black">{data?.company_phone_number || ''}</span>
            </div>
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-800">
              <span className="w-24 text-nowrap font-medium text-accent_soft_black">
                Employee ID :
              </span>
              <span className="text-accent_soft_black">{data?.employee_id || ''}</span>
              {!view && (
                <button
                  onClick={() => handleGiveUserAccess()}
                  disabled={loading}
                  className="ml-4 w-56 rounded-md bg-accent_soft_black px-2 py-1 text-sm text-white active:scale-95"
                >
                  {loading
                    ? 'Loading...'
                    : data?.is_access_enabled
                      ? 'Remove User login Access'
                      : 'Give User login Access'}
                </button>
              )}
            </div>
            <div className="mb-1 flex items-center gap-2 text-sm text-gray-800">
              <span className="w-24 text-nowrap font-medium text-accent_soft_black">Status :</span>
              <span className="text-accent_soft_black">{Employee?.status || ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {file?.name && (
              <div className="mt-2 flex flex-col gap-4">
                <Button
                  isLoading={isUpdating}
                  onClick={handleUpdateImage}
                  className="flex min-w-36 items-center justify-center rounded bg-accent_soft_black px-3 py-2 text-white"
                >
                  {isUpdating ? 'Uploading...' : 'Save'}
                </Button>
                <Button
                  onClick={() => {
                    setFile('');
                    setImageSrc(Employee?.image);
                  }}
                  className="min-w-36 rounded border border-accent_soft_black px-3 py-2 text-accent_soft_black"
                >
                  Cancel
                </Button>
              </div>
            )}
            <div className="relative mt-2 flex items-center gap-1 rounded-lg">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  width={1400}
                  height={1400}
                  alt="avatar"
                  className="h-28 w-28 rounded-lg border-2 border-accent_soft_blue bg-white/60 object-cover"
                  priority
                  blurDataURL={Employee?.image || imageSrc}
                  placeholder="blur"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-lg border-2 bg-gray-100">
                  <label
                    htmlFor="picture-upload"
                    className="cursor-pointer rounded-md px-2 py-0.5 text-black transition-all duration-500 hover:bg-white/60"
                  >
                    Upload
                  </label>
                </div>
              )}
              <input
                id="picture-upload"
                type="file"
                accept="image/*"
                className="hidden overflow-hidden"
                onChange={handleImageChange}
              />
              <label htmlFor="picture-upload">
                <MdOutlineFileUpload className="absolute bottom-4 right-4 cursor-pointer rounded-full bg-white/60 p-1 text-2xl text-[#5A607F] shadow" />{' '}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-lg border bg-white/60 p-7">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-xl font-medium">Personal Details</h1>
          {isDisabled && !view && (
            <Button
              onClick={() => {
                setIsDisabled(false);
                setIsDisabled2(true);
                setIsDisabled1(true);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Employee ID</label>
            <input
              value={data.employee_id}
              onChange={(e) => setData({ ...data, employee_id: e.target.value })}
              disabled={isDisabled}
              maxLength={40}
              type="text"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Status</label>
            <select
              required
              disabled={isDisabled}
              value={data.status}
              onChange={(e) => setData({ ...data, status: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Select Gender</option>
              <option value="ACTIVE">Active</option>
              <option value="IN_ACTIVE">Inactive</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">First Name</label>
            <input
              type="text"
              disabled={isDisabled}
              value={data.first_name}
              onChange={(e) => setData({ ...data, first_name: e.target.value })}
              required
              maxLength={20}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Middle Name</label>
            <input
              type="text"
              value={data.middle_name}
              onChange={(e) => setData({ ...data, middle_name: e.target.value })}
              disabled={isDisabled}
              maxLength={20}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Last Name</label>
            <input
              maxLength={20}
              disabled={isDisabled}
              type="text"
              value={data.last_name}
              onChange={(e) => setData({ ...data, last_name: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Gender</label>
            <select
              required
              disabled={isDisabled}
              value={data.gender}
              onChange={(e) => setData({ ...data, gender: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHERS">Others</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Salutation</label>
            <input
              disabled={isDisabled}
              value={data.salutation}
              onChange={(e) => setData({ ...data, salutation: e.target.value })}
              type="text"
              maxLength={40}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Date of birth</label>
            <input
              disabled={isDisabled}
              value={data.date_of_birth}
              onChange={(e) => setData({ ...data, date_of_birth: e.target.value })}
              required
              type="date"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Role</label>
            <MultipleRoleSelectDropdown
              show={1}
              kind="EMPLOYEE"
              disabled={isDisabled}
              value={data.company_roles}
              setValue={(e: any) => setData({ ...data, company_roles: e })}
              ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">SSN</label>
            <input
              value={formatSsnDisplay(data.ssn ?? '')}
              disabled={isDisabled}
              onChange={(e) => setData({ ...data, ssn: ssnDigitsOnly(e.target.value).slice(0, 9) })}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="XXX-XX-XXXX"
              maxLength={11}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>
        {!isDisabled && (
          <div className="items mt-4 flex gap-4">
            <Button
              isLoading={isUpdating}
              onClick={handleSaveProfileInfo}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled(true);
                setRenderAgain(!RenderAgain);
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="my-7 rounded-lg border bg-white/60 p-7">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-xl font-medium">Company Details</h1>

          {isDisabled1 && !view && (
            <Button
              onClick={() => {
                setIsDisabled(true);
                setIsDisabled2(true);
                setIsDisabled1(false);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Company</label>
            <input
              value={Company.name}
              readOnly
              disabled
              type="text"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Department</label>
            <DepartmentSelectDropdown
              view={isDisabled1}
              value={data?.department_uid}
              setValue={(value: any) => setData({ ...data, department_uid: value })}
              ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Designation </label>
            <DesignationSelectDropdown
              view={isDisabled1}
              value={data?.designation_uid}
              setValue={(value: any) => setData({ ...data, designation_uid: value })}
              ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Report to</label>
            <EmployeeSelectDropdown
              required={false}
              view={isDisabled1}
              value={data?.report_to_uid}
              setValue={(value: any) => setData({ ...data, report_to_uid: value })}
              ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              excludeUids={reportToExcludeUids}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Employee Type</label>
            <select
              value={data.kind}
              onChange={(e) => setData({ ...data, kind: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              required
              disabled={isDisabled1}
            >
              <option value="">Select type</option>
              <option value="FULL_TIME">Full time</option>
              <option value="PART_TIME">Part time</option>
              <option value="CONTRACT">Contract</option>
              <option value="TEMPORARY">Temporary</option>
              <option value="SEASONAL">Seasonal</option>
              <option value="VOLUNTEER">Volunteer</option>
              <option value="INTER">Inter</option>
              <option value="TRAINEE">Trainee</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Work Phone</label>
            <PhoneNumberInput
              disabled={isDisabled1}
              value={data.company_phone_number}
              setValue={(value: any) => setData({ ...data, company_phone_number: value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Work Email</label>
            <input
              disabled={isDisabled1}
              type="email"
              value={data.company_email}
              onChange={(e) => setData({ ...data, company_email: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>
        {!isDisabled1 && (
          <div className="items mt-4 flex gap-4">
            <Button
              isLoading={isUpdating}
              onClick={handleSaveCompanyDetails}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled1(true);
                setRenderAgain(!RenderAgain);
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="my-7 rounded-lg border bg-white/60 p-7">
        <div className="flex items-center justify-between">
          <h1 className="mb-4 text-xl font-medium">Work Locations</h1>
          {isDisabled2 && !view && (
            <Button
              onClick={() => {
                setIsDisabled(true);
                setIsDisabled1(true);
                setIsDisabled2(false);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
            >
              <FiEdit className="text-lg text-accent_soft_black" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4">
          <div className="flex max-w-sm flex-col gap-2">
            <label className="text-accent_soft_black">Work Location</label>
            <WorkLocationSelectDropDown
              parentClassName="w-full"
              view={isDisabled2}
              value={data?.work_locations}
              setValue={(value: any) => setData({ ...data, work_locations: value })}
              ClassName="rounded-md border  border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>
        {!isDisabled2 && (
          <div className="items mt-4 flex gap-4">
            <Button
              isLoading={isUpdating}
              onClick={() => {
                // Save work_locations using patchEmployee
                const formData = new FormData();
                formData.append('work_locations_uid', data?.work_locations?.uid || '');
                UpdateEmployee(formData, 'Work location', () => setIsDisabled2(true));
              }}
              className="flex min-w-36 items-center justify-center gap-1 rounded-lg bg-accent_soft_black py-2.5 text-white"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => {
                setIsDisabled2(true);
                setRenderAgain(!RenderAgain);
              }}
              className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      <div>
        <p className="mb-3 text-lg font-medium text-accent_soft_black">Signature and Agreement</p>
        {data?.w4_signature && (
          <Image
            src={data?.w4_signature}
            alt="w4 signature"
            width={700}
            height={400}
            className="h-24 w-full rounded-lg bg-white object-contain py-4 pt-5"
          />
        )}
      </div>

      {/* Signature and Agreement */}
      {/* <div className="my-7 rounded-lg border bg-white/60 p-7">
        <div className="">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Signature and Agreement</h2>
          <div className="space-y-6">
            <p className="text-sm">
              By submitting this form, I confirm that the information provided is accurate and that
              I agree to the terms of the Nobelle Unlimited Membership.
            </p>
            <div className="space-y-2">
              <label htmlFor="signature" className="block text-sm font-medium text-gray-700">
                Signature
              </label>
              <div
                className={`border ${errors.signature ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
              >
                <SignaturePad
                  ref={signaturePadRef}
                  onEnd={(data: string) => setSignatureData(data)}
                />
              </div>
              <button
                type="button"
                onClick={clearSignature}
                className="mt-2 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Clear Signature
              </button>
              {errors.signature && <p className="text-sm text-red-500">Signature is required.</p>}
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Overview;
