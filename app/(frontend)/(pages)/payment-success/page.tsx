"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Animation from "../../../helpers/Animation-tick.json";
import AnimationLoading from "../../../helpers/Animation-loading.json";
import FailedAnimation from "../../../helpers/Animation-failed.json";
import {
  fetchCompany,
  fetchUser,
  patchPlanSubscription,
  postOTP,
} from "../../../helpers/backend";
import { toast } from "sonner";
import { useProvider } from "../../../../context/ProviderContext";
import dynamic from "next/dynamic";
import EmailVerification from "../auth/_components/EmailVerification";
import { FaCheckCircle } from "react-icons/fa";
import { GradientBadge } from "../../../components/V2/review";

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
});

const TickAnimation = () => {
  return (
    <div className="size-72 sm:size-96">
      <Lottie animationData={Animation} loop={true} />
    </div>
  );
};

const AnimationFailed = () => {
  return (
    <div className="size-36 my-8 sm:my-12">
      <Lottie animationData={FailedAnimation} loop={true} />
    </div>
  );
};

const PaymentSuccess = () => {
  const intent = useSearchParams().get("intentId");
  const amount = useSearchParams().get("amount");
  const currency = useSearchParams().get("currency");
  const status = useSearchParams().get("success");
  const [isOtpSending, setIsOtpSending] = useState(false);
  const uid = useSearchParams().get("sub-uid");
  const calledRef = useRef<any>(false);
  const { user, setCompany, company, setUser } = useProvider();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifyShow, setIsVerifyShow] = useState(false);

  const handleSentOtp = async () => {
    try {
      setIsOtpSending(true);
      const res = await postOTP();
      if (res.success) {
        setIsVerifyShow(true);
      } else {
        toast.error("Failed to send OTP. Please try again");
      }
    } catch (error) {
      toast.error("Something went wrong. Please contact support", {
        duration: 7000,
      });
    } finally {
      setIsOtpSending(false);
    }
  };

  useEffect(() => {
    const fn = async () => {
      try {
        setIsLoading(true);
        const company = await fetchCompany();
        setCompany(company);
      } catch (err) {
        //err
      } finally {
        setIsLoading(false);
      }
    };
    fn();
  }, [user?.uid]);

  const handleRedirect = () => {
    const token = localStorage.getItem("access_token");
    const refresh_token = localStorage.getItem("refresh_token");
    if (user?.uid && token) {
      window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth?action=company_setup&tkn=${token}&action=setup&rt=${refresh_token}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center font-jakarta min-h-[70vh] flex-col justify-center bg-[#0B0919]">
        <div className="size-40 md:size-72">
          <Lottie animationData={AnimationLoading} loop={true} />
        </div>
        <h1 className="text-xl md:text-2xl font-semibold mt-4 text-[#F9F9F9] tracking-widest">
          PROCESSING...
        </h1>
      </div>
    );
  }

  const isSuccess = status == "true" && company?.is_company_subscription;

  return (
    <div className="font-jakarta bg-[#0B0919] min-h-screen">
      <section
        className="relative w-full overflow-hidden pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 px-4"
        style={{
          backgroundImage: "url('/V2/hero_banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-40 sm:h-56 lg:h-64 bg-gradient-to-b from-transparent via-[#0B0919]/70 to-[#0B0919] pointer-events-none" />
        <div className="container mx-auto max-w-3xl relative z-10 flex flex-col items-center text-center">
          <div className="animate-fade-in-up">
            <GradientBadge>{isSuccess ? "Payment Confirmed" : "Payment Status"}</GradientBadge>
          </div>

          <div
            className="w-full rounded-3xl p-6 sm:p-10 mt-2 animate-fade-in-up [animation-delay:100ms] flex flex-col items-center"
            style={{
              background: "linear-gradient(145deg, #13102280, #1a163a)",
              border: "1px solid rgba(249,249,249,0.15)",
            }}
          >
            {isSuccess ? (
              <>
                <TickAnimation />
                <h1 className="text-3xl md:text-4xl font-semibold -mt-28 sm:-mt-40 mb-4 text-[#F9F9F9]">
                  Payment Success
                </h1>
                <span className="inline-block text-[#F9F9F9] text-xs sm:text-sm font-semibold tracking-widest uppercase px-5 py-2 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 mb-6">
                  Paid {amount} {currency}
                </span>
                <p className="text-[#F9F9F9] opacity-70 text-sm sm:text-base max-w-md leading-relaxed mb-6">
                  Your subscription is active. Continue to your company setup to start using Pilucent.
                </p>
                <button
                  onClick={handleRedirect}
                  className="bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] text-white text-sm font-semibold px-7 py-3.5 rounded-full shadow-[0_8px_24px_-8px_rgba(124,91,255,0.6)] hover:opacity-95 hover:scale-105 transition-all duration-300"
                >
                  Go To Company Setup
                </button>

                {isVerifyShow && (
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
                    <div
                      className="rounded-3xl p-6 md:p-8 w-full md:max-w-md overflow-hidden"
                      style={{
                        background: "linear-gradient(145deg, #13102280, #1a163a)",
                        border: "1px solid rgba(249,249,249,0.15)",
                      }}
                    >
                      {!user?.is_email_verified ? (
                        <EmailVerification />
                      ) : (
                        <div className="text-center">
                          <FaCheckCircle className="mx-auto mb-4 text-[#8B5CF6] text-5xl" />
                          <h2 className="text-2xl font-semibold mb-3 text-[#F9F9F9]">
                            Your Email is Verified
                          </h2>
                          <p className="text-[#F9F9F9] opacity-70 mb-6 text-sm">
                            Your email verification completed successfully.
                          </p>
                        </div>
                      )}
                      <div className="flex justify-center">
                        <button
                          onClick={() => setIsVerifyShow(false)}
                          className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <AnimationFailed />
                <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-[#F9F9F9]">
                  Payment Failed
                </h1>
                <span className="inline-block text-[#F9F9F9] text-xs sm:text-sm font-semibold tracking-widest uppercase px-5 py-2 rounded-full bg-red-500/20 border border-red-500/40 mb-6">
                  Failed to Pay {amount} {currency}
                </span>
                <p className="text-[#F9F9F9] opacity-70 text-sm sm:text-base max-w-md leading-relaxed mb-6">
                  We could not complete your payment. Please try again or reach out to our team if the
                  issue persists.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] text-white text-sm font-semibold px-7 py-3.5 rounded-full shadow-[0_8px_24px_-8px_rgba(124,91,255,0.6)] hover:opacity-95 hover:scale-105 transition-all duration-300"
                >
                  Go To Home
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] w-full flex items-center justify-center bg-[#0B0919]">
          <p className="inline-block h-20 w-20 animate-spin rounded-full border-[3px] border-white/10 border-t-[#8B5CF6]" />
        </div>
      }
    >
      <PaymentSuccess />
    </Suspense>
  );
};

export default Page;
