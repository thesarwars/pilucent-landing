'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import StepperIndicator from '@/app/(public)/onboarding/_components/StepperIndicator';
import Overview from './Overview';
import JoiningInfo from './JoiningInfo';
import Address from './Address';
import Payment from './Payment';
import Attendance from './Attendance';
import TaxInfo from './Taxinfo';
import Education from './Education';
import PayrollInfo from './Payroll';
import Documentation from './Documentation';
import {
  postEmployee,
  postEmployeeAddress,
  postEmployeeBank,
  postEmployeeDCItems,
  postEmployeeEarningsItems,
  postEmployeeEducationItems,
  postEmployeeFiles,
  postEmployeeTaxes,
  postEmployeeWorkExperiencesItems,
  postW4Form,
} from '@/app/helpers/backend';
import { buildExemptFields, getStateAdapter } from '@/lib/helpers/w4TaxConfig';
import moment from 'moment';
import { toast } from '@/lib/ToastService';
import LogoLoader from '@/components/MainLoader/logo-loader';
import DotSpinner from './dot-spinner';
import { useAppSelector } from '@/app/redux/store';

const steps = [
  { id: 1, label: 'Overview' },
  { id: 2, label: 'Joining' },
  { id: 3, label: 'Address & Contact' },
  { id: 4, label: 'Payment' },
  { id: 5, label: 'Attendance' },
  { id: 6, label: 'Tax Info' },
  { id: 7, label: 'Payroll Info' },
  { id: 8, label: 'Education' },
  { id: 9, label: 'Documentation' },
];

const Employee = ({ refetch, setIsOpen }: { refetch?: any; setIsOpen: any }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [files, setFiles] = useState<any>('');
  const [isPending, setIsPending] = useState(false);
  // const [workAddress, setWorkAddress] = useState({
  //   street: '',
  //   city: '',
  //   province: '',
  //   postal_code: '',
  //   is_work_address: true,
  //   status: 'ACTIVE',
  // });
  const [earningsItems, setEarningsItems] = useState<any[]>([]);
  const [dcItems, setDCItems] = useState<any[]>([]);
  const [garnishItems, setGarnishItems] = useState<any[]>([]);
  const [educationItems, setEducationItems] = useState<any[]>([]);
  const [prevWorkItems, setPrevWorkItems] = useState<any[]>([]);
  const [internalWorkItems, setInternalWorkItems] = useState<any[]>([]);
  const [paymentInfo, setPaymentInfo] = useState({
    kind: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_type: null,
    routing_number: '',
  });
  const [stateTaxInfo, setStateTaxInfo] = useState({
    is_the_state_other_income_tax: true,
    state: '',
    martial_status: '',
    total_allowance: '',
    additional_with_holdings: '',
    total: '',
    exempt: '',
    is_the_employee_exempt_from_any_state_taxes: false,
    is_the_employee_work_in_the_state_where_live: false,
    is_federal_with_holding: false,
    employee_W_4_kind: '',
    is_multiple_jobs_or_spouse_works: false,
    holding_status: '',
    deduction: '',
    exempt_from_with_holding: '',
  });
  const [federalTaxInfo, setFederalTaxInfo] = useState<any>({
    is_the_state_other_income_tax: false,
    state: '',
    additional_with_holdings: '',
    exempt: '',
    is_the_employee_exempt_from_any_state_taxes: false,
    is_the_employee_work_in_the_state_where_live: false,
    is_federal_with_holding: false,
    employee_W_4_kind: '',
    is_multiple_jobs_or_spouse_works: false,
    total_other_income: '',
    extra_with_holding: '',
    deduction: '',
    exempt_from_with_holding: '',
    is_employee_exempt_from_federal_tax: 'false',
  });
  const [mailingAddress, setMailingAddress] = useState({
    street: '',
    city: '',
    province: '',
    postal_code: '',
    // is_company: true,
    status: 'ACTIVE',
  });
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    province: '',
    postal_code: '',
    is_shipping: true,
    status: 'ACTIVE',
  });
  const [data, setData] = useState<any>({
    first_name: '',
    middle_name: '',
    last_name: '',
    gender: '',
    image: '',
    salutation: '',
    date_of_birth: '',
    ssn: '',
    code: '',
    employee_id: '',
    kind: '',
    status: 'ACTIVE',
    company_phone_number: '',
    company_email: '',
    confirmation_date: '',
    notice_period: '',
    offer_date: '',
    contract_end_date: '',
    terminate_date: '',
    is_same_address: true,
    last_date_of_work: '',
    terminate_kind: '',
    terminate_description: '',
    designation_uid: '' as any,
    department_uid: '' as any,
    shift_uid: '' as any,
    holiday_uid: '' as any,
    phone_number: '',
    home_phone_number: '',
    personal_email: '',
    preferred_email: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_phone_number: '',
    attendance_device_id: '',
    company_role_uid: '' as any,
    report_to_uid: '' as any,
  });
  const { Company } = useAppSelector((state) => state.CompanyData);

  const [isGenerating, setIsGenerating] = useState(false);

  const next = () => {
    if (currentStep === steps.length) {
      setIsCompleted(true);
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };
  const prev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Function to create W4 payload from form data
  const createW4Payload = (uid: string) => {
    const currentDate = new Date().toLocaleDateString('en-US');

    // Helper function to get full name
    const getFullName = () => {
      const firstName = data?.first_name || '';
      const middleName = data?.middle_name || '';
      const lastName = data?.last_name || '';
      return `${firstName} ${middleName}`.trim();
    };

    // Helper function to get full address
    const getFullAddress = () => {
      const address = mailingAddress || shippingAddress || {};
      return `${address.street || ''}, ${address.city || ''}, ${address.province || ''} ${address.postal_code || ''}`.trim();
    };

    // Determine filing status based on federal tax info
    const getFilingStatus = () => {
      const status = stateTaxInfo?.martial_status || '';
      return {
        single: status.toLowerCase().includes('single'),
        married_jointly: status.toLowerCase().includes('married'),
        head_of_household: status.toLowerCase().includes('head'),
      };
    };

    const filingStatus = getFilingStatus();

    return {
      // Step 1: Personal Information
      employee_id: uid || '', // Employee ID
      'f1_01[0]': getFullName(), // First name and middle initial
      'f1_02[0]': data?.last_name || '', // Last name
      'f1_03[0]': getFullAddress(), // Address
      'f1_04[0]': mailingAddress?.city || '', // City
      'f1_05[0]': mailingAddress?.province || '', // State
      'f1_06[0]': mailingAddress?.postal_code || '', // ZIP code
      'f1_07[0]': data?.ssn || '', // Social Security Number

      // Filing Status checkboxes (Step 1c)
      'c1_1[0]': filingStatus.single, // Single or Married filing separately
      'c1_1[1]': filingStatus.married_jointly, // Married filing jointly or Qualifying surviving spouse
      'c1_1[2]': filingStatus.head_of_household, // Head of household

      // Step 2: Multiple Jobs
      'c1_2[0]': federalTaxInfo?.is_multiple_jobs_or_spouse_works || false,

      // Step 3: Dependents (if available in your data structure)
      'f1_09[0]': '', // Number of children under 17 - you may need to add this to your form
      'f1_10[0]': '', // Number of other dependents - you may need to add this to your form
      'f1_11[0]': '', // Total credits amount - calculated based on dependents

      // Step 4: Other adjustments from federal tax info
      'f3_01[0]': federalTaxInfo?.total_other_income || '0', // Other income
      'f3_02[0]': federalTaxInfo?.deduction || '0', // Deductions
      'f3_03[0]': federalTaxInfo?.extra_with_holding || '0', // Extra withholding

      // Step 5: Signature and Date
      'f1_12[0]': `${data?.first_name || ''} ${data?.last_name || ''}`.trim(), // Employee signature
      'f1_16[0]': currentDate, // Date

      // Employer information (you might need to add company info to your data structure)
      'f1_13[0]': Company?.name || 'Company Name', // You may need to add this to your form data
      'f1_14[0]': data?.confirmation_date || data?.offer_date || currentDate, // First date of employment
      'f1_15[0]': '', // EIN Number - you may need to add this to your company data

      // Additional fields based on tax info
      'f3_04[0]': federalTaxInfo?.additional_with_holdings || '0',
      'f3_05[0]': stateTaxInfo?.additional_with_holdings || '0',
      'f3_06[0]': federalTaxInfo?.exempt || '0',
      'f3_07[0]': stateTaxInfo?.exempt || '0',
      'f3_08[0]': federalTaxInfo?.total || '0',
      'f3_09[0]': stateTaxInfo?.total || '0',
      'f3_10[0]': federalTaxInfo?.holding_status || '',
      'f3_11[0]': stateTaxInfo?.holding_status || '',

      // Fallback fields without brackets
      f1_01: getFullName(),
      f1_02: data?.last_name || '',
      f1_03: getFullAddress(),
      f1_04: mailingAddress?.city || '',
      f1_05: mailingAddress?.province || '',
      f1_06: mailingAddress?.postal_code || '',
      f1_07: data?.ssn || '',
      c1_1: filingStatus.single ? '1' : '0',
      f1_13: 'Company Name',
      f3_01: federalTaxInfo?.total_other_income || '0',
      f3_02: federalTaxInfo?.deduction || '0',
      f3_03: federalTaxInfo?.extra_with_holding || '0',
    };
  };

  // Function to handle W4 form generation
  const handleGenerateW4 = async (uid: string) => {
    try {
      setIsGenerating(true);
      const w4Payload = createW4Payload(uid);
      const employeeUid = data?.employee_id || 'temp';
      console.log('W4 Payload:', employeeUid);
      // Call postW4 from backend.js
      const response = await postW4Form(w4Payload);

      if (response) {
        console.log(response);

        toast.success('W4 form generated successfully!');
      }
    } catch (error) {
      console.error('Error generating W4:', error);
      toast.error('An error occurred while generating the W4 form.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConvertToFormData = () => {
    const formData = new FormData();
    Object.keys(data)?.map((key) => {
      formData.append(key, data[key as keyof typeof data]);
    });
    //delete
    formData.delete('designation_uid');
    formData.delete('department_uid');
    formData.delete('shift_uid');
    formData.delete('holiday_uid');
    formData.delete('company_role_uid');
    formData.delete('company_role_uids');
    formData.delete('pay_schedule_uid');
    formData.delete('report_to_uid');
    formData.delete('work_locations');

    //then append
    formData.append('designation_uid', data?.designation_uid?.uid || '');
    formData.append('department_uid', data?.department_uid?.uid || '');
    formData.append('shift_uid', data?.shift_uid?.uid || '');
    formData.append('holiday_uid', data?.holiday_uid?.uid || '');
    data?.company_roles?.map((role: any) => formData.append('company_role_uids', role?.uid));
    formData.append('pay_schedule_uid', data?.pay_schedule_uid?.uid || '');
    formData.append('report_to_uid', data?.report_to_uid?.uid || '');
    formData.append('work_locations_uid', data?.work_locations?.uid || '');
    formData.append('on_boarding_kind', 'MANUAL_ENTRY');

    if (files && typeof files === 'string' && files.includes(';base64,')) {
      const base64Data = files.split(';base64,').pop() || '';
      const byteCharacters = atob(base64Data);
      const byteArrays: ArrayBuffer[] = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray.buffer);
      }
      const signatureFile = new File(byteArrays, 'signature.png', { type: 'image/png' });
      formData.append('w4_signature', signatureFile);
    }

    return formData;
  };

  const handleSave = async () => {
    try {
      if (!files) {
        toast.error('Signature is Required ..');
        return;
      }
      setIsPending(true);
      const payloadData = handleConvertToFormData();
      const res = await postEmployee(payloadData);
      if (res?.success) {
        // const AddressRes = postEmployeeAddress({
        //   ...workAddress,
        //   employee_uid: res?.uid,
        // });
        const ShippingRes = postEmployeeAddress({
          ...shippingAddress,
          employee_uid: res?.uid,
        });
        const MailingRes = postEmployeeAddress(
          data?.is_same_address
            ? { ...shippingAddress, is_shipping: false, employee_uid: res?.uid }
            : {
                ...mailingAddress,
                employee_uid: res?.uid,
              }
        );
        const earningsPromises = earningsItems?.map((earning) => {
          return postEmployeeEarningsItems(res?.uid, {
            ...earning,
            total_recurring_amount: earning?.total_recurring_amount || 0,
          });
        });
        const dcPromises = dcItems?.map((earning) => {
          return postEmployeeDCItems(res?.uid, {
            ...earning,
            deduction_and_contribution_uid: earning?.deduction_and_contribution_uid?.uid || '',
            total_maximum_annual_company_contribution:
              earning?.total_maximum_annual_company_contribution || 0,
            total_company_contribution_per_pay_check:
              earning?.total_company_contribution_per_pay_check || 0,
            total_maximum_annual_employee_deduction:
              earning?.total_maximum_annual_employee_deduction || 0,
            total_employee_deduction_per_pay_check:
              earning?.total_employee_deduction_per_pay_check || 0,
          });
        });
        const garnishPromises = garnishItems?.map((earning) => {
          return postEmployeeDCItems(res?.uid, {
            ...earning,
            total_maximum_percentage_of_disposal_income:
              earning?.total_maximum_percentage_of_disposal_income || 0,
            total_requsted_amount: earning?.total_requsted_amount || 0,
          });
        });
        const educationPromises = educationItems?.map((earning) => {
          return postEmployeeEducationItems(res?.uid, earning);
        });
        const prevWorkPromises = prevWorkItems?.map((earning) => {
          return postEmployeeWorkExperiencesItems(res?.uid, {
            ...earning,
            total_salary: earning?.total_salary || 0,
          });
        });
        const internalWorkPromises = internalWorkItems?.map((earning) => {
          return postEmployeeWorkExperiencesItems(res?.uid, {
            ...earning,
            total_salary: earning?.total_salary || 0,
          });
        });
        const BankInfoRes = postEmployeeBank(res?.uid, paymentInfo);
        const stateAdapter = getStateAdapter((stateTaxInfo as any).state);
        const StateIncomeTaxRes = postEmployeeTaxes(res?.uid, {
          ...stateTaxInfo,
          total: stateTaxInfo.total || 0,
          total_allowance: stateTaxInfo.total_allowance || 0,
          /* Every exemption the state exposes, sent with an explicit boolean:
             { "<exemption>": true | false }. */
          exempt_fields: buildExemptFields(stateAdapter, stateTaxInfo),
        });
        const step3Children = Number(federalTaxInfo?.step3_children || 0);
        const step3OtherDeps = Number(federalTaxInfo?.step3_other_dependents || 0);
        const step3OtherCredits = Number(federalTaxInfo?.step3_other_credits || 0);
        const FederalTaxRes = postEmployeeTaxes(res?.uid, {
          ...federalTaxInfo,
          total_other_income: federalTaxInfo?.total_other_income || 0,
          extra_with_holding: federalTaxInfo.extra_with_holding || 0,
          children_under_17: step3Children,
          other_dependents: step3OtherDeps,
          other_tax_credits: step3OtherCredits,
          children_amount: step3Children * 2000,
          dependent_amount: step3OtherDeps * 500,
          total_credits: step3Children * 2000 + step3OtherDeps * 500 + step3OtherCredits,
        });
        let documentPromises: any[] = [];
        // if (files?.length) {
        //   documentPromises = files?.map((file) => {
        //     const formData = new FormData();
        //     formData.append('file', file);
        //     return postEmployeeFiles(res?.uid, formData);
        //   });
        // }

        const results = await Promise.allSettled([
          // AddressRes,
          ShippingRes,
          MailingRes,
          BankInfoRes,
          StateIncomeTaxRes,
          FederalTaxRes,
          ...earningsPromises,
          ...garnishPromises,
          ...dcPromises,
          ...educationPromises,
          ...prevWorkPromises,
          ...internalWorkPromises,
          ...documentPromises,
        ]);
        const allSuccess = results.every((res) => res.status === 'fulfilled' && Boolean(res.value));

        if (allSuccess) {
          handleGenerateW4(res?.uid);
          toast.success('Employee created.');
          refetch && refetch();
          setIsOpen(false);
        } else {
          handleGenerateW4(res?.uid);
          toast.success(
            'Employee created.But failed to save some info.Kindly check the employee profile and update those info'
          );
          refetch && refetch();
          setIsOpen(false);
        }
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Container */}
      {isPending && (
        <div className="absolute bottom-0 left-0 right-0 top-0 flex flex-col items-center justify-center bg-white bg-opacity-50">
          <DotSpinner />
        </div>
      )}

      <div className="w-full">
        {/* Stepper Indicator */}
        <div className="overflow-x-scroll rounded-md bg-white py-4">
          <StepperIndicator steps={steps} currentStep={currentStep} />
        </div>

        {/* Form Content */}
        <div className="mt-8">
          {currentStep === 1 && (
            <Overview
              setData={setData}
              data={data}
              currentStep={currentStep}
              next={next}
              prev={prev}
              steps={steps}
              // setWorkAddress={setWorkAddress}
              // workAddress={workAddress}
            />
          )}
          {currentStep === 2 && (
            <JoiningInfo
              setData={setData}
              data={data}
              currentStep={currentStep}
              next={next}
              prev={prev}
              steps={steps}
            />
          )}
          {currentStep === 3 && (
            <Address
              setData={setData}
              data={data}
              currentStep={currentStep}
              next={next}
              prev={prev}
              steps={steps}
              address={shippingAddress}
              setAddress={setShippingAddress}
              mailingAddress={mailingAddress}
              setMailingAddress={setMailingAddress}
            />
          )}
          {currentStep === 4 && (
            <Payment
              setPaymentInfo={setPaymentInfo}
              paymentInfo={paymentInfo}
              currentStep={currentStep}
              next={next}
              prev={prev}
              steps={steps}
            />
          )}
          {currentStep === 5 && (
            <Attendance
              setData={setData}
              data={data}
              currentStep={currentStep}
              next={next}
              prev={prev}
              steps={steps}
            />
          )}
          {currentStep === 6 && (
            <TaxInfo
              setStateTaxInfo={setStateTaxInfo}
              stateTaxInfo={stateTaxInfo}
              setFederalTaxInfo={setFederalTaxInfo}
              federalTaxInfo={federalTaxInfo}
              currentStep={currentStep}
              next={next}
              prev={prev}
              steps={steps}
            />
          )}
          {currentStep === 7 && (
            <PayrollInfo
              setData={setData}
              data={data}
              currentStep={currentStep}
              next={next}
              prev={prev}
              steps={steps}
              setEarningsItems={setEarningsItems}
              earningsItems={earningsItems}
              setDCItems={setDCItems}
              dcItems={dcItems}
              setGarnishItems={setGarnishItems}
              garnishItems={garnishItems}
            />
          )}
          {currentStep === 8 && (
            <Education
              currentStep={currentStep}
              next={next}
              prev={prev}
              steps={steps}
              prevWorkItems={prevWorkItems}
              setPrevWorkItems={setPrevWorkItems}
              internalWorkItems={internalWorkItems}
              setInternalWorkItems={setInternalWorkItems}
              educationItems={educationItems}
              setEducationItems={setEducationItems}
            />
          )}
          {currentStep === 9 && (
            <Documentation
              files={files}
              setFiles={setFiles}
              currentStep={currentStep}
              next={handleSave}
              prev={prev}
              steps={steps}
              // Pass the required data for W4 generation
              isGenerating={isGenerating}
              handleGenerateW4={handleGenerateW4}
            />
          )}
        </div>

        {/* <div className="mt-8 flex justify-between">
          <button
            onClick={prev}
            disabled={currentStep === 1}
            className={`rounded-md border px-6 py-2 ${
              currentStep === 1
                ? "cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400"
                : "border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50"
            } `}
          >
            Previous
          </button>

          <button
            type="submit"
            onClick={next}
            //   disabled={currentStep === steps.length}
            className={`rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700`}
          >
            {currentStep === steps.length ? "Finish" : "Next"}
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Employee;
