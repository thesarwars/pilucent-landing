'use client';
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchGeneralTaxSettings,
  patchGeneralTaxSettings,
  patchWeCompany,
  postCompany,
  postGeneralTaxSettings,
} from '@/app/helpers/backend';
import CompanyInfo from './CompanyInfo';
import ContactInfo from './ContactInfo';
import Address from './Address';
import { toast } from '@/lib/ToastService';

type VerificationProps = {
  setStep: Dispatch<SetStateAction<number>>;
  companyData: any;
  setCompanyData: any;
  imageSrc: any;
  setImageSrc: any;
  companyAddress: any;
  setCompanyAddress: any;
  companyLegalAddress: any;
  setCompanyLegalAddress: any;
};

const Verification = ({
  companyLegalAddress,
  setCompanyLegalAddress,
  setStep,
  companyData,
  setCompanyData,
  imageSrc,
  setImageSrc,
  companyAddress,
  setCompanyAddress,
}: VerificationProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    country: '',
  });
  const [generalTaxSettingsUid, setGeneralTaxSettingsUid] = useState('');

  const validateCompanyName = (name: string): string => {
    if (!name || name.trim() === '') {
      return 'Company name is required';
    }
    if (name.trim().length < 2) {
      return 'Company name must be at least 2 characters';
    }
    return '';
  };

  const validateEmail = (email: string): string => {
    if (!email || email.trim() === '') {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePhone = (phone: string): string => {
    if (!phone || phone.trim() === '') {
      return 'Phone number is required';
    }
    const digitsOnly = phone.replace(/[+\s-]/g, '');
    if (digitsOnly.length < 10) {
      return 'Please enter a valid phone number';
    }
    return '';
  };

  const validateState = (state: string): string => {
    if (!state || state.trim() === '' || state === 'Select state') {
      return 'State is required';
    }
    return '';
  };

  const validateCountry = (country: string): string => {
    if (!country || country.trim() === '') {
      return 'Country is required';
    }
    return '';
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setCompanyData({ ...companyData, logo: files[0] });
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

  const handleCreateCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nameError = validateCompanyName(companyData?.name);
    const emailError = validateEmail(companyData?.email);
    const phoneError = validatePhone(companyData?.phone);
    const stateError = validateState(companyAddress?.state);
    const countryError = validateCountry(companyAddress?.country);

    if (nameError || emailError || phoneError || stateError || countryError) {
      setErrors({
        name: nameError,
        email: emailError,
        phone: phoneError,
        state: stateError,
        country: countryError,
      });

      if (nameError) {
        toast.error(nameError);
      } else if (emailError) {
        toast.error(emailError);
      } else if (phoneError) {
        toast.error(phoneError);
      } else if (stateError) {
        toast.error(stateError);
      } else if (countryError) {
        toast.error(countryError);
      }
      return;
    }
    const data: any = {
      name: companyData?.name || '',
      legal_name: companyData?.legal_name || '',
      status: 'ACTIVE',
      business_id_no: companyData?.business_id_no || '',
      vat_number: companyData?.vat_number || '',
      time_zone: companyData?.time_zone || '',
      email: companyData?.email || '',
      phone: companyData?.phone || '',
      website: companyData?.website || '',
      customer_facing_address: companyData?.customer_facing_address || '',
      legal_address: companyData?.legal_address || '',
      kind: companyData?.kind || '',
      company_addresses: JSON.stringify(companyAddress),
    };

    if (companyData?.logo) {
      data.logo = companyData?.logo;
    }

    try {
      setIsLoading(true);

      if (
        companyLegalAddress.address &&
        companyLegalAddress.city &&
        companyLegalAddress.state &&
        companyLegalAddress.zip_code
      ) {
        if (generalTaxSettingsUid) {
          const legalAddress = await patchGeneralTaxSettings(generalTaxSettingsUid, {
            ...companyLegalAddress,
            title: companyData?.legal_name || companyData?.name,
          });
        } else {
          const legalAddress = await postGeneralTaxSettings({
            ...companyLegalAddress,
            title: companyData?.legal_name || companyData?.name,
          });
        }
      }
      // From the workspace "Create new" flow (?is_workspace=true) we POST a brand-new
      // company; otherwise we PATCH the existing one (unchanged behavior).
      const isWorkspace =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('is_workspace') === 'true';

      const weResult = isWorkspace ? await postCompany(data) : await patchWeCompany(data);
      if (weResult?.success) {
        toast.success('Company setup completed successfully');
        router.push('/dashboard');
      }
    } catch (error) {
      //err
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fn = async () => {
      try {
        const res = await fetchGeneralTaxSettings();
        if (res?.results?.[0]?.uid) {
          setGeneralTaxSettingsUid(res?.results?.[0]?.uid);
        }
      } catch (error) {
        //err
      }
    };
    fn();
  }, []);

  return (
    <form onSubmit={handleCreateCompany} className="mx-auto text-sm">
      <div className="flex flex-col">
        <CompanyInfo
          companyData={companyData}
          setCompanyData={setCompanyData}
          imageSrc={imageSrc}
          setImageSrc={setImageSrc}
        />
        <ContactInfo companyData={companyData} setCompanyData={setCompanyData} />
        <Address
          disabled={true}
          companyLegalAddress={companyLegalAddress}
          setCompanyLegalAddress={setCompanyLegalAddress}
          companyAddress={companyAddress}
          setCompanyAddress={setCompanyAddress}
          companyData={companyData}
          setCompanyData={setCompanyData}
        />

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setStep(3)}
            type="button"
            className="rounded-md border border-indigo-600 bg-white px-6 py-2 text-indigo-600 hover:bg-indigo-50"
          >
            Previous
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`rounded-md px-6 py-2 text-white ${
              !isLoading ? 'bg-[#02143A] hover:opacity-95' : 'cursor-not-allowed bg-gray-400'
            }`}
          >
            {isLoading ? 'Processing...' : 'Submit'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default Verification;
