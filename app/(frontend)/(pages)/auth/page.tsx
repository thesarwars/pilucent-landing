"use client";
import { useRouter, useSearchParams } from "next/navigation";
import LeftSection from "./_components/LeftSection";
import SignIn from "./_components/SignIn";
import SignUp from "./_components/SignUp";
import { Suspense } from "react";
import { useProvider } from "../../../../context/ProviderContext";
import ForgotPassword from "./_components/ForgotPassword";
import EmailVerification from "./_components/EmailVerification";

const AuthContent = () => {
  const params = useSearchParams();
  const isSignIn = params.get("action") === "sign-in";
  const isForgotPass = params.get("action") == "forgot-password";
  const isVerifyEmail = params.get("action") == "verify-email";
  if (isVerifyEmail) {
    return <EmailVerification />;
  } else if (isForgotPass) {
    return <ForgotPassword />;
  } else {
    return isSignIn ? <SignIn /> : <SignUp />;
  }
};

const Page = () => {
  const { user } = useProvider();
  const router = useRouter();

  return (
    <div
      className="relative min-h-screen font-jakarta bg-[#0E0825] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden"
      style={{
        backgroundImage: "url('/V2/hero_banner.png')",
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0E0825]/40 via-[#0E0825]/70 to-[#0B0919] pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-[420px] h-[420px] rounded-full bg-[#7C5BFF]/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-32 w-[420px] h-[420px] rounded-full bg-[#5A3FE5]/20 blur-[120px] pointer-events-none" />

      <div className="relative mt-32 w-full max-w-6xl flex flex-col-reverse md:flex-row gap-8 lg:gap-12 items-center z-10">
        <LeftSection />
        <Suspense
          fallback={
            <div className="h-full w-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
            </div>
          }
        >
          <AuthContent />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
