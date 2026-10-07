'use client';
import { getCompany } from '@/app/helpers/backend';
import Address from '@/components/Pages/Company/Address';
import CompanyInfo from '@/components/Pages/Company/CompanyInfo';
import ContactInfo from '@/components/Pages/Company/ContactInfo';
import Verification from '@/components/Pages/Company/Verification';
import { useEffect, useState } from 'react';

const steps = [
  { id: 1, label: 'Company Info', subtitle: 'Enter your company details to get started' },
  { id: 2, label: 'Contact Info', subtitle: 'Add your company contact information' },
  { id: 3, label: 'Address', subtitle: 'Enter your company address details' },
  { id: 4, label: 'Verification', subtitle: 'Review and submit your company information' },
];

const CompanySetup = () => {
  const [step, setStep] = useState(1);
  const [imageSrc, setImageSrc] = useState<any>('');
  const [companyAddress, setCompanyAddress] = useState({
    address: '',
    city: '',
    state: '',
    country: 'US',
    zip_code: '',
  });
  const [companyLegalAddress, setCompanyLegalAddress] = useState({
    address: '',
    city: '',
    state: '',
    zip_code: '',
  });
  const [companyData, setCompanyData] = useState({
    name: '',
    legal_name: '',
    status: 'ACTIVE',
    business_id_no: '',
    vat_number: '',
    time_zone: '',
    email: '',
    phone: '',
    website: '',
    customer_facing_address: '',
    legal_address: '',
    logo: '',
    kind: 'CONSTRUCTION',
  });

  useEffect(() => {
    const fn = async () => {
      // Coming from the workspace "Create new" flow (?is_workspace=true) means we
      // are creating a brand-new company — don't prefetch the current company.
      const isWorkspace =
        new URLSearchParams(window.location.search).get('is_workspace') === 'true';
      if (isWorkspace) return;

      const company = await getCompany();
      setCompanyData({
        name: company?.name,
        legal_name: company?.legal_name || '',
        status: 'ACTIVE',
        business_id_no: company?.business_id_no || '',
        vat_number: company?.vat_number || '',
        time_zone: company?.time_zone || '',
        email: company?.email || '',
        phone: company?.phone || '',
        website: company?.website || '',
        customer_facing_address: company?.customer_facing_address || '',
        legal_address: company?.legal_address || '',
        logo: '',
        kind: company?.kind,
      });
    };
    fn();
  }, []);

  const progressWidthPct =
    steps.length > 1 ? ((Math.min(step, steps.length) - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <div className="flex text-sm flex-col">
      <div className="h-3 w-full overflow-hidden rounded-full bg-[#FFFFFF82]">
        <div
          className="h-full rounded-full transition-all duration-500 ease-in-out"
          style={{
            width: `${progressWidthPct}%`,
            background: 'linear-gradient(90deg, #070281 0%, #2A0072 100%)',
          }}
        />
      </div>

      {step >= 1 && step <= steps.length && (
        <div className="mb-2 mt-6">
          <h2 className="text-3xl font-normal text-[#373636]">
            Step {step}: {steps[step - 1]?.label}
          </h2>
          <p className="mt-1 text-sm text-[#525151]">{steps[step - 1]?.subtitle}</p>
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-white bg-[#FFFFFF66] p-6">
        <div className="rounded-[22px]">
          {step === 1 ? (
            <CompanyInfo
              imageSrc={imageSrc}
              setImageSrc={setImageSrc}
              companyData={companyData}
              setCompanyData={setCompanyData}
              setStep={setStep}
            />
          ) : step === 2 ? (
            <ContactInfo
              companyData={companyData}
              setCompanyData={setCompanyData}
              setStep={setStep}
            />
          ) : step === 3 ? (
            <Address
              companyLegalAddress={companyLegalAddress}
              setCompanyLegalAddress={setCompanyLegalAddress}
              companyAddress={companyAddress}
              setCompanyAddress={setCompanyAddress}
              companyData={companyData}
              setCompanyData={setCompanyData}
              setStep={setStep}
            />
          ) : (
            <Verification
              companyLegalAddress={companyLegalAddress}
              setCompanyLegalAddress={setCompanyLegalAddress}
              companyAddress={companyAddress}
              setCompanyAddress={setCompanyAddress}
              imageSrc={imageSrc}
              setImageSrc={setImageSrc}
              companyData={companyData}
              setCompanyData={setCompanyData}
              setStep={setStep}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanySetup;
