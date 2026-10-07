"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import About from "./About";
import AboutThePrincipal from "./AboutThePrincipal";
import ReviewAndPay from "./ReviewAndPay";
import { useFetch } from "@/app/helpers/hooks";
import {
  fetchMoovAccount,
  fetchMoovAccountDetails,
  fetchMoovIndustries,
  fetchMoovRepresentative,
} from "@/app/helpers/backend";
import DotSpinner from "@/app/dashboard/hris/employee/employees/_components/dot-spinner";

export default function BusinessForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [RenderAgain, setRenderAgain] = useState<boolean>(false);
  const [moovUID, setMoovUID] = useState("");
  const [representativeUID, setRepresentativeUID] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const fetchRef = useRef<any>(undefined);
  const [isInitial, setIsInitial] = useState(true);
  const { data, isPending: isIndustriesPending } = useFetch(
    ["/moov/industries"],
    fetchMoovIndustries,
  );
  // The endpoint has been seen returning both a bare array and { industries: [] };
  // normalise once so the lookup below and the <About /> prop can't disagree.
  const industryList = Array.isArray(data?.data)
    ? data.data
    : (data?.data?.industries ?? []);
  const [formData, setFormData] = useState({
    account_type: "BUSINESS",
    legal_business_name: "",
    ein: "",
    phone: "",
    email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state_or_province: "",
    postal_code: "",
    country: "US",
    website: "",
    industry: "",
    business_type: "",
  });
  const [RepresentativeData, setRepresentativeData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state_or_province: "",
    postal_code: "",
    country: "US",
    itin_or_ssn: "",
    is_itin: false,
    ownership_percentage: "",
    job_title: "",
    isOwner: true,
    isController: true,
    date_of_birth: "",
  });

  useEffect(() => {
    const fn = async () => {
      if (isIndustriesPending) return;
      if (fetchRef.current) return;
      try {
        setIsLoading(true);
        fetchRef.current = true;
        const res = await fetchMoovAccount();
        if (res?.data?.moov_account_uid) {
          setCompletedSteps([1, 2]);
          setRepresentativeUID(res?.data?.moov_representative_uid);
          setMoovUID(res?.data?.moov_account_uid);
          const moovDetails = await fetchMoovAccountDetails(
            res?.data?.moov_account_uid,
          );

          if (res?.data?.moov_representative_uid) {
            const repDetails = await fetchMoovRepresentative(
              res?.data?.moov_representative_uid,
            );
            setCompletedSteps([1, 2, 3]);
            if (repDetails) {
              const rep = repDetails?.data;
              setRepresentativeData({
                first_name: rep?.name?.first_name ?? "",
                last_name: rep?.name?.last_name ?? "",
                phone: rep?.phone?.number ?? "",
                email: rep?.email ?? "",
                address_line1: rep?.address?.address_line1 ?? "",
                address_line2: rep?.address?.address_line2 ?? "",
                city: rep?.address?.city ?? "",
                state_or_province: rep?.address?.state_or_province ?? "",
                postal_code: rep?.address?.postal_code ?? "",
                country: "US",
                // Moov never returns raw SSN/ITIN or date of birth — only the
                // *_provided booleans — so these stay blank and the form shows
                // "Provided" instead whenever rUID is set.
                itin_or_ssn: "",
                is_itin: false,
                // ?? not ||: a controller who owns 0% is legitimate, and
                // `0 || ""` would blank the field.
                ownership_percentage:
                  rep?.responsibilities?.ownership_percentage ?? "",
                job_title: rep?.responsibilities?.job_title ?? "",
                isOwner: rep?.responsibilities?.is_owner ?? false,
                isController: rep?.responsibilities?.is_controller ?? true,
                date_of_birth: "",
              });
            }
          }

          if (moovDetails) {
            const codes =
              moovDetails?.data?.profile?.business?.industry_codes;
            const codesOf = (ind: any) => ind?.raw ?? ind;
            // Exact triple match first, then fall back to MCC alone: About only
            // ever sends industry_codes.mcc, so naics/sic come back derived by
            // Moov and won't always line up with our own industry list.
            const industry =
              industryList.find((ind: any) => {
                const c = codesOf(ind);
                return (
                  c?.naics == codes?.naics &&
                  c?.sic == codes?.sic &&
                  c?.mcc == codes?.mcc
                );
              }) ??
              industryList.find(
                (ind: any) =>
                  (codesOf(ind)?.mcc ?? ind?.default_mcc) == codes?.mcc,
              );

            const business = moovDetails?.data?.profile?.business;
            setFormData({
              account_type: moovDetails?.data?.account_type || "BUSINESS",
              legal_business_name: business?.legal_business_name ?? "",
              // Moov only reports tax_id_provided, never the EIN itself. Keep
              // the key present so the input stays controlled; About renders
              // "EIN Provided" instead once uid is set.
              ein: "",
              phone: business?.phone?.number ?? "",
              email: business?.email ?? "",
              address_line1: business?.address?.address_line1 ?? "",
              address_line2: business?.address?.address_line2 ?? "",
              city: business?.address?.city ?? "",
              state_or_province: business?.address?.state_or_province ?? "",
              postal_code: business?.address?.postal_code ?? "",
              country: "US",
              website: business?.website ?? "",
              business_type: business?.business_type ?? "",
              industry: industry?.industry ?? "",
            });
          }
        }
      } catch (error) {
        // Swallowing this silently made a prefill failure look like an empty
        // form with no clue why — surface it at least in the console.
        console.error("Failed to prefill Moov business form:", error);
      } finally {
        fetchRef.current = false;
        setIsLoading(false);
        setIsInitial(false);
      }
    };
    fn();
  }, [RenderAgain, isIndustriesPending]);

  const handleSave = () => {
    if (currentStep === 1) {
      setIsAnimating(true);
      setTimeout(() => {
        if (!completedSteps.includes(1)) {
          setCompletedSteps([1]);
        }
        setCurrentStep(2);
        setIsEditing(false);
        setIsAnimating(false);
      }, 500);
    } else if (currentStep === 2) {
      setIsAnimating(true);
      setTimeout(() => {
        if (!completedSteps.includes(2)) {
          setCompletedSteps([1, 2]);
        }
        setCurrentStep(3);
        setIsAnimating(false);
      }, 500);
    } else if (currentStep === 3) {
      if (!completedSteps.includes(3)) {
        setCompletedSteps([1, 2, 3]);
      }
      // Handle final submission here
      console.log("Form completed!");
    }
  };

  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step)) {
      if (currentStep == step) {
        setCurrentStep(0);
      } else {
        setCurrentStep(step);
      }
      setIsEditing(step === 1 ? false : false);
    }
  };

  if (isLoading && isInitial) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <DotSpinner />
      </div>
    );
  }

  return (
    <div className="mb-7 space-y-4">
      {/* Step 1: About your business */}
      <div className="transform overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-700 ease-in-out">
        <div className="p-6">
          <div
            className={`mb-4 flex items-center justify-between ${completedSteps.includes(1) ? "cursor-pointer" : "cursor-default"}`}
            onClick={() => handleStepClick(1)}
          >
            <div className="flex items-center">
              {currentStep === 1 && !completedSteps.includes(1) ? (
                <ChevronDownIcon className="mr-2 h-5 w-5 rotate-0 transform text-gray-600 transition-all duration-500 ease-out" />
              ) : (
                <ChevronRightIcon className="mr-2 h-5 w-5 rotate-0 transform text-gray-600 transition-all duration-500 ease-out hover:rotate-12" />
              )}
              <h2 className="text-lg font-medium text-gray-900 transition-colors duration-300">
                About your business
              </h2>
            </div>
            {completedSteps.includes(1) && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 duration-700 ease-out animate-in fade-in zoom-in-50">
                <CheckIcon className="h-4 w-4 text-white delay-300 duration-500 ease-out animate-in zoom-in-75" />
              </div>
            )}
          </div>

          <div
            className={`origin-top transform transition-all duration-1000 ease-in-out will-change-transform ${
              (currentStep === 1 || !completedSteps.includes(1)) && !isAnimating
                ? "translate-z-0 max-h-[3000px] translate-y-0 opacity-100"
                : "translate-z-0 max-h-0 -translate-y-6 overflow-hidden opacity-0"
            }`}
          >
            {(currentStep === 1 || !completedSteps.includes(1)) && (
              <div
                className={`transform transition-all delay-200 duration-700 ease-out will-change-transform ${
                  (currentStep === 1 || !completedSteps.includes(1)) &&
                  !isAnimating
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
              >
                {(currentStep === 1 || !completedSteps.includes(1)) && (
                  <About
                    setRenderAgain={setRenderAgain}
                    RenderAgain={RenderAgain}
                    uid={moovUID || ""}
                    industries={industryList}
                    formData={formData}
                    setFormData={setFormData}
                    handleNext={handleSave}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Step 2: About the principal officer */}
      <div className="transform overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-700 ease-in-out">
        <div className="p-6">
          <div
            className={`mb-4 flex items-center justify-between ${completedSteps.includes(2) ? "cursor-pointer" : "cursor-default"}`}
            onClick={() => handleStepClick(2)}
          >
            <div className="flex items-center gap-2">
              {currentStep === 2 ? (
                <ChevronDownIcon className="mr-2 h-5 w-5 rotate-0 transform text-gray-600 transition-all duration-500 ease-out" />
              ) : (
                <ChevronRightIcon className="mr-2 h-5 w-5 rotate-0 transform text-gray-600 transition-all duration-500 ease-out hover:rotate-12" />
              )}
              <h2 className="text-lg font-medium text-gray-900 transition-colors duration-300">
                About the business representative
              </h2>
            </div>
            {completedSteps.includes(2) && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 duration-700 ease-out animate-in fade-in zoom-in-50">
                <CheckIcon className="h-4 w-4 text-white delay-300 duration-500 ease-out animate-in zoom-in-75" />
              </div>
            )}
          </div>

          <div
            className={`origin-top transform transition-all duration-1000 ease-in-out will-change-transform ${
              currentStep === 2 && !isAnimating
                ? "translate-z-0 max-h-[3000px] translate-y-0 scale-y-100 opacity-100"
                : "translate-z-0 max-h-0 -translate-y-6 scale-y-90 overflow-hidden opacity-0"
            }`}
          >
            {currentStep === 2 && (
              <div
                className={`duration-800 transform transition-all delay-300 ease-out will-change-transform ${
                  currentStep === 2 && !isAnimating
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-8 scale-95 opacity-0"
                }`}
              >
                <AboutThePrincipal
                  setRenderAgain={setRenderAgain}
                  RenderAgain={RenderAgain}
                  rUID={representativeUID}
                  uid={moovUID || ""}
                  data={RepresentativeData}
                  setData={setRepresentativeData}
                  handleNext={handleSave}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="transform overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-700 ease-in-out hover:shadow-lg">
        <div className="p-6">
          <div
            className={`mb-4 flex items-center justify-between ${completedSteps.includes(3) ? "cursor-pointer" : "cursor-default"}`}
            onClick={() => handleStepClick(3)}
          >
            <div className="flex items-center">
              {currentStep === 3 ? (
                <ChevronDownIcon className="mr-2 h-5 w-5 rotate-0 transform text-gray-600 transition-all duration-500 ease-out" />
              ) : (
                <ChevronRightIcon className="mr-2 h-5 w-5 rotate-0 transform text-gray-600 transition-all duration-500 ease-out hover:rotate-12" />
              )}
              <h2 className="text-lg font-medium text-gray-900 transition-colors duration-300">
                Your bank account
              </h2>
            </div>
            {completedSteps.includes(3) && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 duration-700 ease-out animate-in fade-in zoom-in-50">
                <CheckIcon className="h-4 w-4 text-white delay-300 duration-500 ease-out animate-in zoom-in-75" />
              </div>
            )}
          </div>

          <div
            className={`origin-top transform transition-all duration-1000 ease-in-out will-change-transform ${
              currentStep === 3 && !isAnimating
                ? "translate-z-0 max-h-[3000px] translate-y-0 opacity-100"
                : "translate-z-0 max-h-0 -translate-y-6 overflow-hidden opacity-0"
            }`}
          >
            {currentStep === 3 && (
              <div
                className={`duration-800 transform transition-all delay-300 ease-out will-change-transform ${
                  currentStep === 3 && !isAnimating
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
              >
                <ReviewAndPay handleNext={() => {}} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
