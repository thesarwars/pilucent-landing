'use client';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  fetchEmployee,
  patchEmployee,
  postEmployeeAddress,
  postEmployeeBank,
  postEmployeeTaxes,
} from '@/app/helpers/backend';

import { toast } from '@/lib/ToastService';
import DotSpinner from '@/app/dashboard/hris/employee/employees/_components/dot-spinner';
import EmploymentEligibilityForm from './_components/EmploymentEligibilityForm';
import Address from './_components/Address';
import SignW4Form from './_components/SignW4Form';
import PersonalInfo from './_components/PersonalInfoForm';
import SuccessScreen from './_components/SuccessScreen';
import OnboardingReview from './_components/OnboardingReview';
import Payment from './_components/Payment';
import TaxInfo from './_components/Taxinfo';
import {
  buildOnboardingDraft,
  clearOnboardingDraft,
  loadOnboardingDraft,
  mergeRestoredData,
  saveOnboardingDraft,
} from './_components/onboardingDraftStorage';

const steps = [
  {
    id: 1,
    label: 'Personal Info',
    subtitle: 'Provide your personal details to get started',
  },
  {
    id: 2,
    label: 'Address & Contact',
    subtitle: 'Enter your address and contact information',
  },
  {
    id: 3,
    label: 'Eligibility',
    subtitle: 'Verify your employment eligibility',
  },
  {
    id: 4,
    label: 'Payment',
    subtitle: 'Set up your payment information',
  },
  {
    id: 5,
    label: 'Taxes',
    subtitle: 'Configure your tax withholding details',
  },
  { id: 6, label: 'Sign W4', subtitle: 'Review and sign your W-4 form' },
  {
    id: 7,
    label: 'Review',
    subtitle: 'Confirm your information before submitting',
  },
];

const SUCCESS_STEP = 8;

const Employee = () => {
  const params = useSearchParams();
  const token = params.get('access_token');
  const empUID = params.get('emp');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [allowDraftSave, setAllowDraftSave] = useState(false);
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [draftSavedLabel, setDraftSavedLabel] = useState<string | null>(null);
  const [skippedPayment, setSkippedPayment] = useState(false);
  const [skippedTaxes, setSkippedTaxes] = useState(false);
  const signaturePadRef = useRef<any | null>(null);
  const [isJoined, setIsJoined] = useState(false);

  const [paymentInfo, setPaymentInfo] = useState({
    kind: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_type: null as string | null,
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
  const [federalTaxInfo, setFederalTaxInfo] = useState({
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
    holding_status: '',
    is_employee_exempt_from_federal_tax: 'false',
  });
  const [mailingAddress, setMailingAddress] = useState({
    full_address: '',
    city: '',
    province: '',
    postal_code: '',
    is_company: true,
    status: 'ACTIVE',
  });
  const [shippingAddress, setShippingAddress] = useState({
    full_address: '',
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
    on_boarding_kind: '',
    phone_number: '',
    home_phone_number: '',
    personal_email: '',
    // preferred_email: "",
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_phone_number: '',
    citizenship_kind: '',
    uscis_or_alien_registration_number: '',
    from_i_94: '',
    foreign_passort: '',
    w4_signature: '',
    is_same_address: true,
    is_email_verified: true,
    authorized_to_work_na: false,
    authorized_to_work_until: '',
  });

  const next = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };
  const prev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(1, step), steps.length));
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('access_token', token);
      const fn = async () => {
        try {
          setIsLoading(true);
          const res = await fetchEmployee(empUID);
          if (res) {
            // setData((prev: any) => ({
            //   ...prev,
            //   first_name: res?.user?.first_name,
            //   middle_name: res?.user?.middle_name,
            //   last_name: res?.user?.last_name,
            //   on_boarding_kind: res?.on_boarding_kind,
            // }));
            const draft = loadOnboardingDraft(empUID);
            if (draft) {
              setCurrentStep(Math.min(Math.max(1, draft.currentStep), steps.length));
              setData({ ...data, ...res });
              setIsJoined(res?.is_joined);
              setShippingAddress(draft.shippingAddress as typeof shippingAddress);
              setMailingAddress(draft.mailingAddress as typeof mailingAddress);
              setPaymentInfo(draft.paymentInfo as typeof paymentInfo);
              setStateTaxInfo(draft.stateTaxInfo as typeof stateTaxInfo);
              setFederalTaxInfo(draft.federalTaxInfo as typeof federalTaxInfo);
              setSkippedPayment(draft.skippedPayment);
              setSkippedTaxes(draft.skippedTaxes);
            }
            setAllowDraftSave(true);
          }
        } catch (error) {
          // err
        } finally {
          setIsLoading(false);
        }
      };
      fn();
    }
  }, [token, empUID]);

  // useEffect(() => {
  //   if (isLoading || !empUID) return;
  // }, [isLoading, empUID]);

  useEffect(() => {
    if (!allowDraftSave || !empUID) return;
    setDraftStatus('saving');
    const t = window.setTimeout(() => {
      const payload = buildOnboardingDraft(
        currentStep,
        data as Record<string, unknown>,
        shippingAddress as Record<string, unknown>,
        mailingAddress as Record<string, unknown>,
        paymentInfo as Record<string, unknown>,
        stateTaxInfo as Record<string, unknown>,
        federalTaxInfo as Record<string, unknown>,
        skippedPayment,
        skippedTaxes
      );
      saveOnboardingDraft(empUID, payload);
      setDraftStatus('saved');
      setDraftSavedLabel(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }, 500);
    return () => window.clearTimeout(t);
  }, [
    allowDraftSave,
    empUID,
    currentStep,
    data,
    shippingAddress,
    mailingAddress,
    paymentInfo,
    stateTaxInfo,
    federalTaxInfo,
    skippedPayment,
    skippedTaxes,
  ]);

  const saveDraftManually = useCallback(() => {
    if (!empUID) {
      toast.error('Missing employee link.');
      return;
    }
    const payload = buildOnboardingDraft(
      currentStep,
      data as Record<string, unknown>,
      shippingAddress as Record<string, unknown>,
      mailingAddress as Record<string, unknown>,
      paymentInfo as Record<string, unknown>,
      stateTaxInfo as Record<string, unknown>,
      federalTaxInfo as Record<string, unknown>,
      skippedPayment,
      skippedTaxes
    );
    saveOnboardingDraft(empUID, payload);
    setDraftStatus('saved');
    setDraftSavedLabel(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    toast.success('Progress saved on this device. Reopen this link anytime to continue.');
  }, [
    empUID,
    currentStep,
    data,
    shippingAddress,
    mailingAddress,
    paymentInfo,
    stateTaxInfo,
    federalTaxInfo,
    skippedPayment,
    skippedTaxes,
  ]);

  const handleConvertToFormData = () => {
    const formData = new FormData();
    Object.keys(data)?.map((key) => {
      if (
        data[key as keyof typeof data] !== null &&
        data[key as keyof typeof data] !== undefined &&
        data[key as keyof typeof data] !== ''
      ) {
        formData.append(key, data[key as keyof typeof data]);
      }
    });
    formData.delete('w4_signature');
    formData.delete('company_roles');
    formData.delete('banaking_informations');
    formData.delete('work_locations');
    formData.delete('user');
    formData.delete('uid');
    formData.delete('status');
    formData.delete('is_joined');
    formData.delete('company_roles');
    formData.delete('addresses');
    formData.delete('pay_kind');
    formData.delete('pay_schedule_uid');
    formData.delete('payroll_salary_process');
    formData.delete('created_at');
    formData.delete('updated_at');
    formData.delete('is_over_time');
    formData.delete('is_double_over_time');
    formData.delete('is_holiday_pay');
    formData.delete('is_bonus');
    formData.delete('is_banking_info_verified');
    formData.delete('salary_frequency');
    formData.delete('total_salary');
    formData.delete('total_rate_per_hour');
    formData.delete('preferred_email');

    formData.append('is_joined', 'true');
    formData.append('status', 'ACTIVE');
    if (
      data?.w4_signature &&
      typeof data?.w4_signature === 'string' &&
      data?.w4_signature.includes(';base64,')
    ) {
      const base64Data = data?.w4_signature.split(';base64,').pop() || '';
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
    if (!data?.w4_signature) {
      return toast.error('Please add your W-4 signature.');
    }
    try {
      setIsPending(true);
      const formPayload = handleConvertToFormData();
      const res = await patchEmployee(empUID, formPayload);
      if (res?.success) {
        const uid = res?.uid;
        const ShippingRes = postEmployeeAddress({
          ...shippingAddress,
          employee_uid: uid,
        });
        const MailingRes = postEmployeeAddress(
          data?.is_same_address
            ? {
                ...shippingAddress,
                is_shipping: false,
                employee_uid: uid,
              }
            : {
                ...mailingAddress,
                is_shipping: false,
                employee_uid: uid,
              }
        );

        const tasks: Promise<unknown>[] = [ShippingRes, MailingRes];
        if (!skippedPayment) {
          tasks.push(postEmployeeBank(uid, paymentInfo));
        }
        if (!skippedTaxes) {
          tasks.push(
            postEmployeeTaxes(uid, {
              ...stateTaxInfo,
              total_allowance: stateTaxInfo?.total_allowance || 0,
              total: stateTaxInfo?.total || 0,
            })
          );
          tasks.push(
            postEmployeeTaxes(uid, {
              ...federalTaxInfo,
              total_other_income: federalTaxInfo?.total_other_income || 0,
              extra_with_holding: federalTaxInfo?.extra_with_holding || 0,
            })
          );
        }

        const results = await Promise.allSettled(tasks);
        const allSuccess = results.every((r) => r.status === 'fulfilled' && Boolean(r.value));

        clearOnboardingDraft(empUID);
        setCurrentStep(SUCCESS_STEP);
        if (allSuccess) {
          toast.success('Onboarding completed.');
        } else {
          toast.success(
            'Onboarding completed. Some items could not be saved — update them from your employee profile if needed.'
          );
        }
      }
    } catch (error) {
      // err
    } finally {
      setIsPending(false);
    }
  };

  const progressWidthPct =
    steps.length > 1 ? ((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white bg-opacity-50">
        <DotSpinner />
      </div>
    );
  }

  if (isJoined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-blue-50">
        <SuccessScreen />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen flex-col items-center bg-[url(/snap-expense/snap_bg.webp)] bg-cover bg-fixed bg-center bg-no-repeat px-4 py-12 font-lexend sm:px-6 lg:px-8">
      {isPending && (
        <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex flex-col items-center justify-center bg-white bg-opacity-50">
          <DotSpinner />
        </div>
      )}

      <div className="w-full max-w-screen-2xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            {draftStatus === 'saving' && <span className="text-[#525151]">Saving draft…</span>}
            {draftStatus === 'saved' && draftSavedLabel && (
              <span className="text-emerald-800">Draft auto-saved at {draftSavedLabel}</span>
            )}
          </div>
          {empUID && currentStep < SUCCESS_STEP && (
            <button
              type="button"
              onClick={saveDraftManually}
              className="rounded-lg border border-white/80 bg-white/40 px-4 py-2 text-sm font-medium text-[#373636] backdrop-blur-sm hover:bg-white/60"
            >
              Save & continue later
            </button>
          )}
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-[#FFFFFF82]">
          <div
            className="h-full rounded-full transition-all duration-500 ease-in-out"
            style={{
              width: `${progressWidthPct}%`,
              background: 'linear-gradient(90deg, #070281 0%, #2A0072 100%)',
            }}
          />
        </div>

        {currentStep >= 1 && currentStep <= steps.length && (
          <div className="mb-2 mt-6">
            <h2 className="text-3xl font-normal text-[#373636]">
              Step {currentStep}: {steps[currentStep - 1]?.label}
            </h2>
            <p className="mt-1 text-sm text-[#525151]">{steps[currentStep - 1]?.subtitle}</p>
          </div>
        )}

        <div className="mt-8 rounded-3xl border border-white bg-[#FFFFFF66] p-6">
          <div className="rounded-[22px]">
            {currentStep === 1 && (
              <PersonalInfo
                setData={setData}
                data={data}
                currentStep={currentStep}
                next={next}
                prev={prev}
                steps={steps}
              />
            )}
            {currentStep === 2 && (
              <Address
                setData={setData}
                data={data}
                currentStep={currentStep}
                next={next}
                prev={prev}
                steps={steps}
                setAddress={setShippingAddress}
                address={shippingAddress}
                mailingAddress={mailingAddress}
                setMailingAddress={setMailingAddress}
              />
            )}
            {currentStep == 3 && (
              <EmploymentEligibilityForm
                setData={setData}
                data={data}
                currentStep={currentStep}
                next={next}
                prev={prev}
                steps={steps}
              />
            )}
            {currentStep === 4 && (
              <Payment
                currentStep={currentStep}
                next={next}
                prev={prev}
                steps={steps}
                paymentInfo={paymentInfo}
                setPaymentInfo={setPaymentInfo}
                onSkipForNow={() => {
                  setSkippedPayment(true);
                  next();
                }}
                onPaymentInteraction={() => setSkippedPayment(false)}
              />
            )}

            {currentStep === 5 && (
              <TaxInfo
                setStateTaxInfo={setStateTaxInfo}
                stateTaxInfo={stateTaxInfo}
                setFederalTaxInfo={setFederalTaxInfo}
                federalTaxInfo={federalTaxInfo}
                currentStep={currentStep}
                next={next}
                prev={prev}
                steps={steps}
                onSkipForNow={() => {
                  setSkippedTaxes(true);
                  next();
                }}
                onTaxInteraction={() => setSkippedTaxes(false)}
              />
            )}

            {currentStep === 6 && (
              <SignW4Form
                signaturePadRef={signaturePadRef}
                setData={setData}
                data={data}
                currentStep={currentStep}
                next={next}
                prev={prev}
                steps={steps}
              />
            )}
            {currentStep === 7 && (
              <OnboardingReview
                data={data}
                shippingAddress={shippingAddress}
                mailingAddress={mailingAddress}
                paymentInfo={paymentInfo}
                stateTaxInfo={stateTaxInfo}
                federalTaxInfo={federalTaxInfo}
                skippedPayment={skippedPayment}
                skippedTaxes={skippedTaxes}
                goToStep={goToStep}
                onSubmit={handleSave}
                isSubmitting={isPending}
              />
            )}
            {currentStep === SUCCESS_STEP && <SuccessScreen />}
          </div>
        </div>
      </div>
    </div>
  );
};

const page = () => {
  return (
    <Suspense fallback={<DotSpinner />}>
      <Employee />
    </Suspense>
  );
};

export default page;
