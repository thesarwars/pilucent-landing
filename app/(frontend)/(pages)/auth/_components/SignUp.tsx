"use client";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import React, { FormEvent, useEffect, useState } from "react";
import { companyChoices } from "../../../../helpers/companyChoices";
import PasswordInput from "./PasswordInput";
import {
  fetchCompany,
  fetchUser,
  postCompany,
  postOTP,
  postUserRegister,
} from "../../../../helpers/backend";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProvider } from "../../../../../context/ProviderContext";
import { toast } from "sonner";

const SignUp = ({ setIsSignIn }: { setIsSignIn?: any }) => {
  const path = usePathname();
  const searchParams = useSearchParams();
  // When the user comes from the in-app "Create company" flow they already have
  // an account — prefill their identity and hide the password step.
  const isWorkspace = searchParams.get("is_workspace") === "true";
  const wsEmail = searchParams.get("email") || "";
  const wsName = searchParams.get("full_name") || "";

  const [isValid, setIsValid] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const router = useRouter();

  useEffect(() => {
    if (isWorkspace) {
      setUserData((prev) => ({ ...prev, name: wsName, email: wsEmail }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWorkspace, wsName, wsEmail]);
  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "",
    kind: "",
    status: "DRAFT",
  });
  const { setUser, setCompany } = useProvider();
  const [isTermsChecked, setIsTermsChecked] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isWorkspace && !isValid) {
      return toast.info("Password doesn't meet the requirements.");
    }
    if (!isTermsChecked) {
      return toast.error(
        "You have to confirm that you agree with our terms and conditions to continue"
      );
    }
    try {
      setIsLoading(true);
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const ipData = await ipResponse.json();
      const payload = {
        ...userData,
        ip_address: ipData.ip,
        is_terms_service: isTermsChecked,
      };
      const userRes = await postUserRegister(payload);
      if (userRes?.success) {
        localStorage.setItem("access_token", userRes?.token?.access_token);
        localStorage.setItem("refresh_token", userRes?.token?.refresh_token);
        const res = await postCompany(companyData);
        if (res?.success) {
          const Company = await fetchCompany();
          const userInfo = await fetchUser();
          setCompany(Company);
          setUser(userInfo);
          const OtpRes = await postOTP();
          if (OtpRes?.success) {
            router.push("/auth?action=verify-email&from=register");
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    "mt-2 block w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/40 text-sm shadow-inner focus:outline-none focus:border-[#7C5BFF] focus:ring-2 focus:ring-[#7C5BFF]/30 transition-all";

  const labelCls =
    "block text-xs font-medium text-white/80 uppercase tracking-wider";

  return (
    <div className="flex-1 w-full font-jakarta animate-fade-in-up">
      <div className="relative bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-white text-2xl sm:text-3xl font-semibold tracking-tight">
              Create your account
            </h2>
            <p className="text-white/60 text-sm mt-2">
              Try it free for 30 days. No credit card required. Cancel anytime.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className={labelCls}>
                Full Name <span className="text-[#7C5BFF]">*</span>
              </label>
              <input
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
                type="text"
                readOnly={isWorkspace}
                className={
                  inputCls + (isWorkspace ? " opacity-70 cursor-not-allowed" : "")
                }
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="workEmail" className={labelCls}>
                Email <span className="text-[#7C5BFF]">*</span>
              </label>
              <input
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
                type="email"
                readOnly={isWorkspace}
                className={
                  inputCls + (isWorkspace ? " opacity-70 cursor-not-allowed" : "")
                }
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="companyName" className={labelCls}>
                Company Name <span className="text-[#7C5BFF]">*</span>
              </label>
              <input
                type="text"
                value={companyData.name}
                onChange={(e) =>
                  setCompanyData({ ...companyData, name: e.target.value })
                }
                className={inputCls}
                placeholder="Enter your company name"
                required
              />
            </div>

            <div>
              <label htmlFor="preferableVersion" className={labelCls}>
                Company Type <span className="text-[#7C5BFF]">*</span>
              </label>
              <select
                value={companyData.kind}
                onChange={(e) =>
                  setCompanyData({ ...companyData, kind: e.target.value })
                }
                className={inputCls + " appearance-none cursor-pointer"}
                required
              >
                <option value="" className="bg-[#0E0825] text-white">
                  Select Type
                </option>
                {companyChoices?.map((kind) => (
                  <option
                    key={kind?.value}
                    value={kind?.value}
                    className="bg-[#0E0825] text-white"
                  >
                    {kind?.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="phoneNumber" className={labelCls}>
                Phone Number <span className="text-[#7C5BFF]">*</span>
              </label>
              <div className="mt-2 v2-phone-input">
                <PhoneInput
                  country={"us"}
                  enableSearch={true}
                  inputProps={{
                    name: "phoneNumber",
                    required: true,
                    autoFocus: false,
                  }}
                  value={userData?.phone}
                  onChange={(e: any) =>
                    setUserData({ ...userData, phone: `+${e}` })
                  }
                  containerClass="w-full"
                  inputClass="!w-full !pl-12 !pr-4 !py-3 !h-auto !bg-white/[0.04] !border !border-white/10 !rounded-xl !text-white !text-sm focus:!outline-none focus:!border-[#7C5BFF] focus:!ring-2 focus:!ring-[#7C5BFF]/30"
                  buttonClass="!bg-white/[0.04] !border !border-white/10 !rounded-l-xl !rounded-r-none"
                  dropdownClass="!bg-[#1a1330] !text-white !rounded-xl !shadow-xl"
                  searchClass="!bg-[#0E0825] !text-white"
                />
              </div>
            </div>

            {!isWorkspace && (
              <div>
                <label htmlFor="password" className={labelCls}>
                  Password <span className="text-[#7C5BFF]">*</span>
                </label>
                <PasswordInput
                  setIsValid={setIsValid}
                  password={userData?.password}
                  setPassword={(value: any) =>
                    setUserData({ ...userData, password: value })
                  }
                />
              </div>
            )}

            <div className="flex items-start pt-2">
              <input
                checked={isTermsChecked}
                onChange={(e) => setIsTermsChecked(e.target.checked)}
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 mt-0.5 accent-[#7C5BFF] bg-white/5 border-white/20 rounded cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-white/70 leading-relaxed"
              >
                I confirm that I have read and agree to Pilucent{" "}
                <Link
                  href="/privacy-policy"
                  className="text-[#A78BFA] hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/terms"
                  className="text-[#A78BFA] hover:text-white transition-colors"
                >
                  Terms & Condition
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={!isTermsChecked}
              className="w-full mt-2 font-semibold text-sm px-6 py-3.5 rounded-full
                         bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] text-white
                         shadow-[0_8px_24px_-8px_rgba(124,91,255,0.6)]
                         hover:opacity-95 hover:scale-[1.02] active:scale-95
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                         transition-all duration-300"
            >
              {isLoading ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white align-middle" />
              ) : (
                "Sign Up"
              )}
            </button>

            <div className="text-center text-sm text-white/60 pt-2">
              Already have an account?{" "}
              {path == "/checkout" ? (
                <button
                  type="button"
                  onClick={() => setIsSignIn && setIsSignIn(true)}
                  className="text-[#A78BFA] hover:text-white font-medium transition-colors"
                >
                  Sign In
                </button>
              ) : (
                <Link
                  href="/auth?action=sign-in"
                  className="text-[#A78BFA] hover:text-white font-medium transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
