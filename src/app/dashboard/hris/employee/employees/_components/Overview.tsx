import { useAppSelector } from '@/app/redux/store';
import Button from '@/components/ui/RawButton';
import DepartmentSelectDropdown from '@/components/ui/ScrollSelectDropDowns/DepartmentSelectDropdown';
import DesignationSelectDropdown from '@/components/ui/ScrollSelectDropDowns/DesignationSelectDropdown';
import EmployeeSelectDropdown from '@/components/ui/ScrollSelectDropDowns/EmployeeSelectDropdown';
import RoleSelectDropdown, {
  MultipleRoleSelectDropdown,
} from '@/components/ui/ScrollSelectDropDowns/RoleSelectDropdown';
import ShiftSelectDropdown from '@/components/ui/ScrollSelectDropDowns/ShiftSelectDropdown';
import SmoothCheckbox from '@/components/ui/SmoothCheckbox';
import Image from 'next/image';
import React, { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import { BiTrash } from 'react-icons/bi';
import { FiEdit } from 'react-icons/fi';
import PhoneNumberInput from './PhoneNumberInput';
import Label from '@/components/ui/RawLabel';
import CategoryScrollSelectDropDown from '@/components/ui/ScrollSelectDropDowns/CategoryScrollSelectDropdown';
import WorkLocationSelectDropDown from '@/components/ui/ScrollSelectDropDowns/WorkLocationSelectDropDown';

const Overview = ({
  // workAddress,
  // setWorkAddress,
  data,
  setData,
  prev,
  next,
  currentStep,
  steps,
}: {
  // workAddress: any;
  // setWorkAddress: any;
  data: any;
  setData: any;
  prev: any;
  next: any;
  currentStep: any;
  steps: any;
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isCompanyAddress, setIsCompanyAddress] = useState<boolean>(false);
  const [ssnError, setSsnError] = useState('');

  const formatSsn = useCallback((value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  }, []);

  const handleSsnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSsn(e.target.value);
    setData({ ...data, ssn: formatted });
    if (ssnError) setSsnError('');
  };

  const validateSsn = (ssn: string): boolean => {
    if (!ssn) return true;
    const digits = ssn.replace(/\D/g, '');
    if (digits.length !== 9) {
      setSsnError('SSN must be exactly 9 digits (XXX-XX-XXXX)');
      return false;
    }
    if (/^0{3}/.test(digits) || /^.{3}0{2}/.test(digits) || /0{4}$/.test(digits)) {
      setSsnError('Invalid SSN');
      return false;
    }
    if (digits === '078051120' || digits === '219099999') {
      setSsnError('Invalid SSN');
      return false;
    }
    setSsnError('');
    return true;
  };
  const { Company } = useAppSelector((state) => state.CompanyData);
  const { UserData } = useAppSelector((state) => state.userData);
  const reportToExcludeUids = [UserData?.employee?.uid].filter((id): id is string => Boolean(id));
  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    if (!validateSsn(data?.ssn || '')) return;
    next();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setData({ ...data, image: files[0] });
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

  // const handleUseCompanyAddress = (checked: boolean) => {
  //   if (checked) {
  //     setWorkAddress({
  //       ...workAddress,
  //       city: Company?.company_addresses?.city || '',
  //       province: Company?.company_addresses.state || '',
  //       postal_code: Company?.company_addresses?.zip_code || '',
  //       full_address: Company?.company_addresses?.address || '',
  //     });
  //   } else {
  //     setWorkAddress({
  //       ...workAddress,
  //       city: '',
  //       province: '',
  //       postal_code: '',
  //       full_address: '',
  //     });
  //   }

  //   setIsCompanyAddress(checked);
  // };

  return (
    <form onSubmit={handleNext} className="mx-auto text-sm">
      <div className="mt-4 flex flex-col gap-2 rounded-lg bg-white p-5">
        <label className="text-lg text-accent_soft_black">Profile Image</label>
        <div className="flex items-center gap-2">
          <div className="h-24 w-24 rounded-full bg-[#D9D9D9]">
            {imageSrc && (
              <Image
                src={imageSrc}
                width={93}
                height={85}
                alt="avatar"
                className="h-full w-full rounded-full object-cover"
              />
            )}
          </div>

          <div className="flex items-center">
            <input
              id="picture-upload"
              type="file"
              accept="image/*"
              className="hidden overflow-hidden"
              onChange={handleImageChange}
            />
            <label htmlFor="picture-upload">
              <FiEdit className="ml-4 mr-2 cursor-pointer text-xl text-gray-700" />
            </label>
            <Button
              onClick={() => {
                setImageSrc('');
                setData({ ...data, image: '' });
              }}
              type="button"
              className="p-1"
            >
              <BiTrash className="text-xl text-red-500" />
            </Button>
          </div>
        </div>
      </div>
      <div className="rounded-lg border bg-white p-7">
        <h1 className="mb-4 text-xl font-medium">Personal Details</h1>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Employee ID</label>
            <input
              value={data?.employee_id}
              onChange={(e) => setData({ ...data, employee_id: e.target.value })}
              maxLength={20}
              type="text"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              First Name <span className="text-base text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data?.first_name}
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
              value={data?.middle_name}
              onChange={(e) => setData({ ...data, middle_name: e.target.value })}
              maxLength={20}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Last Name <span className="text-base text-red-500">*</span>
            </label>
            <input
              maxLength={20}
              type="text"
              value={data?.last_name}
              onChange={(e) => setData({ ...data, last_name: e.target.value })}
              required
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Gender</label>
            <select
              required
              value={data?.gender}
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
              value={data?.salutation}
              onChange={(e) => setData({ ...data, salutation: e.target.value })}
              type="text"
              maxLength={40}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Date of birth <span className="text-base text-red-500">*</span>
            </label>
            <input
              value={data?.date_of_birth}
              onChange={(e) => setData({ ...data, date_of_birth: e.target.value })}
              required
              type="date"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          {/* <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Status</label>
            <select
              value={data.status}
              onChange={(e) => setData({ ...data, status: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Select status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div> */}
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Role</label>
            <MultipleRoleSelectDropdown
              kind="EMPLOYEE"
              value={data?.company_role_uids}
              setValue={(e: any) => setData({ ...data, company_role_uids: e })}
              ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">SSN</label>
            <input
              value={data?.ssn}
              onChange={handleSsnChange}
              type="text"
              placeholder="XXX-XX-XXXX"
              maxLength={11}
              className={`rounded-md border px-4 py-2.5 outline-none ${
                ssnError
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-accent_soft_black'
              }`}
            />
            {ssnError && <p className="text-xs text-red-500">{ssnError}</p>}
          </div>
        </div>
      </div>
      <div className="my-7 rounded-lg border bg-white p-7">
        <h1 className="mb-4 text-xl font-medium">Company Details</h1>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Company</label>
            <input
              value={Company?.name}
              readOnly
              disabled
              type="text"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Department</label>
            <DepartmentSelectDropdown
              value={data?.department_uid}
              setValue={(value: any) => setData({ ...data, department_uid: value })}
              ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Designation </label>
            <DesignationSelectDropdown
              value={data?.designation_uid}
              setValue={(value: any) => setData({ ...data, designation_uid: value })}
              ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Report to</label>
            <EmployeeSelectDropdown
              required={false}
              value={data?.report_to_uid}
              setValue={(value: any) => setData({ ...data, report_to_uid: value })}
              ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              excludeUids={reportToExcludeUids}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Employee Type</label>
            <select
              value={data?.kind}
              onChange={(e) => setData({ ...data, kind: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              required
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
              value={data?.company_phone_number}
              setValue={(value: any) => setData({ ...data, company_phone_number: value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Work Email</label>
            <input
              type="email"
              value={data?.company_email}
              onChange={(e) => setData({ ...data, company_email: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>
      </div>

      <div className="my-7 rounded-lg border bg-white p-7">
        {/* <h1 className="mb-4 text-xl font-medium">Work Address</h1> */}
        <div>
          <Label className="block font-medium text-[#5A607F]">Work Address</Label>
          <WorkLocationSelectDropDown
            parentClassName="max-w-xl"
            value={data?.work_locations}
            setValue={(value: any) => setData({ ...data, work_locations: value })}
            required={true}
            ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
          />
        </div>
        {/* <div className="my-3 flex items-center gap-2">
          <SmoothCheckbox
            htmlFor="use_company_address"
            checked={isCompanyAddress}
            onCheckedChange={(checked) => {
              handleUseCompanyAddress(checked);
            }}
          />
          <label htmlFor="use_company_address" className="mb-1">
            Use Company Address
          </label>
        </div>
        <div className="grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Address</label>
            <input
              type="text"
              maxLength={60}
              value={workAddress?.full_address}
              onChange={(e) =>
                setWorkAddress({ ...workAddress, full_address: e.target.value })
              }
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">City</label>
            <input
              type="text"
              value={workAddress?.city}
              onChange={(e) =>
                setWorkAddress({ ...workAddress, city: e.target.value })
              }
              maxLength={40}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">State </label>
            <input
              type="text"
              value={workAddress?.province}
              onChange={(e) =>
                setWorkAddress({ ...workAddress, province: e.target.value })
              }
              maxLength={40}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Zip</label>
            <input
              value={workAddress?.postal_code}
              onChange={(e) =>
                setWorkAddress({ ...workAddress, postal_code: e.target.value })
              }
              maxLength={20}
              type="text"
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div> */}
      </div>
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={prev}
          disabled={currentStep === 1}
          className={`rounded-md border px-6 py-2 ${
            currentStep === 1
              ? 'cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400'
              : 'border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50'
          } `}
        >
          Previous
        </button>

        <button
          type="submit"
          // onClick={next}
          //   disabled={currentStep === steps.length}
          className={`rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700`}
        >
          {currentStep === steps.length ? 'Finish' : 'Next'}
        </button>
      </div>
    </form>
  );
};

export default Overview;
