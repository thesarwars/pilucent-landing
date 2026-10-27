import { FormEvent, useEffect, useRef, useState } from "react";
import { fetchUser, postOTP, verifyOTP } from "../../../../helpers/backend";
import { FaCheckCircle, FaRegClock } from "react-icons/fa";
import { toast } from "sonner";
import { useProvider } from "../../../../../context/ProviderContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const EmailVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [countdown, setCountdown] = useState(60);
  const from = useSearchParams().get("from");
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [activeInputIndex, setActiveInputIndex] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | any>>([]);
  const { user, setUser, isLoading: isPending, company } = useProvider();
  const router = useRouter();
  const calledRef = useRef<any>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ModalOpen, setModalOpen] = useState(false);
  const path = usePathname();
  const [isOTPLoading, setIsOTPLoading] = useState(false);

  // Redirect if already verified
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return router.push("/pricing");
    }

    calledRef.current = true;
    startCountdown();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown === 0) {
      setIsResendDisabled(false);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Whenever activeInputIndex changes, focus that input
  useEffect(() => {
    const ref = inputRefs.current[activeInputIndex];
    if (ref) ref.focus();
  }, [activeInputIndex]);

  const startCountdown = () => {
    setCountdown(60);
    setIsResendDisabled(true);
  };

  const handleResendOTP = async () => {
    try {
      setIsOTPLoading(true);
      const res = await postOTP();
      if (res?.success) {
        toast.success("OTP sent to your email");
        // else setIsModalOpen(true);
        startCountdown();
      }
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setIsOTPLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to next input
    if (value && index < otp.length - 1) {
      setActiveInputIndex(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index]) {
      // if current box is already empty, go back
      if (index > 0) {
        setActiveInputIndex(index - 1);
        const prevOtp = [...otp];
        prevOtp[index - 1] = "";
        setOtp(prevOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    const cleanedData = pastedData.replace(/\D/g, "");
    const otpArray = cleanedData.slice(0, otp.length).split("");
    const newOtp = [...otp];
    otpArray.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);
    setActiveInputIndex(Math.min(otp.length - 1, otpArray.length));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const otpCode = otp.join("");
      if (otpCode.length !== otp.length) {
        toast.error(`Please enter a ${otp.length}-digit OTP`);
        return;
      }
      const result = await verifyOTP({ otp: otpCode });
      if (result?.success) {
        // toast.success("OTP verified successfully!");
        const userRes = await fetchUser();
        setUser(userRes);
        setModalOpen(true);
        if (from == "registration") {
          router.push("/pricing");
        }
        // router.push("/dashboard");
      }
    } catch (error) {
      //   toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white md:flex-1 rounded-2xl pt-4 md:p-8 p-4 w-full md:max-w-md mx-auto">
      {!ModalOpen && user?.is_email_verified && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-lg p-4 md:p-8 ">
            <div className="text-center">
              <FaCheckCircle className="mx-auto mb-4 text-green-500 text-5xl" />
              <h2 className="text-2xl font-bold mb-4">
                Email Already Verified
              </h2>
              <p className="text-gray-600 mb-6">
                Your email address has already been verified earlier.
              </p>
              <button
                onClick={() => router.push("/")}
                className="bg-[#5A5FEE] text-white px-6 py-2 rounded-md hover:bg-[#4A4FDE] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {!user?.is_email_verified && (
        <div className="space-y-3 md:space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
            <p className="text-gray-600 mt-2  text-wrap max-md:text-sm">
              We've sent a 6-digit code to your registered email
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex justify-center gap-3">
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-9 h-10 sm:w-10 sm:h-10 md:w-12 md:h-12 text-2xl text-center border-2 rounded-md
                           focus:outline-none focus:border-[#5A5FEE] focus:ring-1 focus:ring-[#5A5FEE]
                           transition-all duration-200 ${
                             index === activeInputIndex
                               ? "border-[#5A5FEE]"
                               : "border-gray-300"
                           }`}
                  maxLength={1}
                  inputMode="numeric"
                />
              ))}
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-[#5A5FEE] text-white rounded-md
                         hover:bg-[#4A4FDE] transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-white border-t-transparent" />
                ) : (
                  "Verify OTP"
                )}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              {isResendDisabled ? (
                <div className="inline-flex items-center gap-2">
                  <FaRegClock className="animate-pulse" />
                  <span>Resend OTP in {countdown} seconds</span>
                </div>
              ) : (
                <button
                  disabled={isOTPLoading}
                  type="button"
                  onClick={handleResendOTP}
                  className="text-[#5A5FEE] hover:text-[#4A4FDE] transition-colors"
                >
                  {isOTPLoading ? "......." : "Resend OTP"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
      {/* 
      {(isModalOpen && path !== '/payment-success') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <FaCheckCircle className="mx-auto mb-4 text-green-500 text-5xl" />
              <h2 className="text-2xl font-bold mb-4">OTP has been sent!</h2>
              <p className="text-gray-600 mb-6">
                Your verification OTP (one time password) has been sent to your
                email address. Please check your email inbox.
              </p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-[#5A5FEE] text-white px-6 py-2 rounded-md hover:bg-[#4A4FDE] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )} */}
      {ModalOpen && path !== "/payment-success" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white rounded-lg p-4 md:p-8 max-w-md w-full">
            <div className="text-center">
              <FaCheckCircle className="mx-auto mb-4 text-green-500 text-5xl" />
              <h2 className="text-xl md:text-2xl font-bold mb-4">
                Email has Been verified
              </h2>
              <p className="text-gray-600 max-md:text-sm mb-6">
                Your email verification completed successfully.
              </p>
              {company?.is_company_subscription && (
                <button
                  className="relative overflow-hidden w-full font-semibold text-base px-4 py-2 border rounded-md mt-8 
                   bg-[#5A5FEE] text-white mb-4 max-w-full transition-all duration-300 
                    hover:shadow-lg 
                   active:scale-95
                   before:absolute before:inset-0 before:bg-gradient-to-r 
                   before:from-white/50 before:to-transparent before:-translate-x-full 
                   before:transition-transform before:duration-300 
                   hover:before:translate-x-full"
                  onClick={() => {
                    const token = localStorage.getItem("access_token");
                    const refresh_token = localStorage.getItem("refresh_token");
                    if (from == "registration") {
                      router.push("/pricing");
                      return;
                    }
                    if (company?.status == "DRAFT") {
                      window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth?action=company_setup&tkn=${token}&rt=${refresh_token}`;
                    } else {
                      window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth?tkn=${token}&rt=${refresh_token}`;
                    }
                  }}
                >
                  {!company?.is_company_subscription
                    ? "Go to Pricing"
                    : company?.status == "DRAFT"
                    ? "Go to company setup"
                    : "Go to Dashboard"}
                </button>
              )}
              <button
                onClick={() => {
                  if (from == "registration") {
                    router.push("/pricing");
                    return;
                  }
                  setModalOpen(false);
                  router.push("/");
                }}
                className="bg-[#5A5FEE] mx-auto text-white px-6 py-2 rounded-md hover:bg-[#4A4FDE] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailVerification;
