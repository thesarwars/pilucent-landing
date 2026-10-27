"use client";
import Link from "next/link";
import "react-phone-input-2/lib/style.css";
import React, { FormEvent, useState } from "react";
import {
  fetchCompany,
  fetchUser,
  postOTP,
  postUserSingIn,
} from "../../../../helpers/backend";
import { usePathname, useRouter } from "next/navigation";
import { useProvider } from "../../../../../context/ProviderContext";
import { toast } from "sonner";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

const SignIn = ({ setIsSignIn }: { setIsSignIn?: any }) => {
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  const path = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser, company, setCompany } = useProvider();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await postUserSingIn(userData);
      if (res.success) {
        cookies.set("refresh_token", res?.refresh);
        cookies.set("access_token", res?.access);

        localStorage.setItem("access_token", res?.access);
        localStorage.setItem("refresh_token", res?.refresh);
        const Company = await fetchCompany();
        const userInfo = await fetchUser();
        setCompany(Company);
        setUser(userInfo);

        if (Company.success) {
          if (!userInfo?.is_email_verified) {
            const res = await postOTP();
            if (res?.success) return router.push("/auth?action=verify-email");
          }
          if (userInfo?.is_superuser) {
            return (window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/admin?tkn=${res?.access}&action=none&rt=${res?.refresh}`);
          }
          if (Company?.is_company_subscription && Company.status == "ACTIVE") {
            window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/workspace?tkn=${res?.access}&rt=${res?.refresh}`;
          } else if (
            Company?.is_company_subscription &&
            Company.status == "DRAFT"
          ) {
            window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth?action=company_setup&tkn=${res?.access}&action=setup&rt=${res?.refresh}`;
          } else if (!Company?.is_company_subscription) {
            path != "/checkout" && router.push("/pricing");
          }
        } else {
          localStorage.removeItem("access_token");
          setUser({});
          toast.error("Company not found!");
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

  return (
    <div className="flex-1 w-full font-jakarta animate-fade-in-up">
      <div className="relative bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-white text-2xl sm:text-3xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="text-white/60 text-sm mt-2">
              Try it free for 30 days. No credit card required. Cancel anytime.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="workEmail"
                className="block text-xs font-medium text-white/80 uppercase tracking-wider"
              >
                Email <span className="text-[#7C5BFF]">*</span>
              </label>
              <input
                value={userData?.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
                type="email"
                className={inputCls}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 uppercase tracking-wider">
                Password <span className="text-[#7C5BFF]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={userData?.password}
                  onChange={(e) =>
                    setUserData({ ...userData, password: e.target.value })
                  }
                  className={inputCls + " pr-16"}
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 mt-1 text-xs font-medium text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {path != "/checkout" && (
              <div className="flex justify-end">
                <Link
                  href={"/auth?action=forgot-password"}
                  className="text-[#A78BFA] hover:text-white text-sm transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 font-semibold text-sm px-6 py-3.5 rounded-full
                         bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] text-white
                         shadow-[0_8px_24px_-8px_rgba(124,91,255,0.6)]
                         hover:opacity-95 hover:scale-[1.02] active:scale-95
                         transition-all duration-300"
            >
              {isLoading ? (
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white align-middle" />
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center text-sm text-white/60 pt-2">
              Don't have an account?{" "}
              {path == "/checkout" ? (
                <button
                  type="button"
                  onClick={() => setIsSignIn && setIsSignIn(false)}
                  className="text-[#A78BFA] hover:text-white font-medium transition-colors"
                >
                  Sign Up
                </button>
              ) : (
                <Link
                  href="/auth?action=sign-up"
                  className="text-[#A78BFA] hover:text-white font-medium transition-colors"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
