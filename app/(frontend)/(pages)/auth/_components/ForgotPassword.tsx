"use client";
import { FormEvent, useState } from "react";
import { postForgotPassword } from "../../../../helpers/backend";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await postForgotPassword({ email });
      if (result?.success) {
        setIsModalOpen(true);
      }
    } catch (error) {
      toast.error("Something Went Wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full font-jakarta animate-fade-in-up">
      <div className="relative bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-white text-2xl sm:text-3xl font-semibold tracking-tight">
              Forgot Password
            </h2>
            <p className="text-white/60 text-sm mt-2">
              Enter your email and we'll send you a reset link.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="workEmail"
                className="block text-xs font-medium text-white/80 uppercase tracking-wider"
              >
                Enter your email <span className="text-[#7C5BFF]">*</span>
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="mt-2 block w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/40 text-sm shadow-inner focus:outline-none focus:border-[#7C5BFF] focus:ring-2 focus:ring-[#7C5BFF]/30 transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

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
                "Submit"
              )}
            </button>

            {isModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
                <div className="bg-[#0E0825] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-[0_20px_60px_-20px_rgba(124,91,255,0.4)] animate-fade-in-up">
                  <div className="text-center">
                    <FaCheckCircle className="mx-auto mb-4 text-[#7C5BFF] text-5xl" />
                    <h2 className="text-white text-2xl font-semibold mb-3">
                      Password Reset Link Sent!
                    </h2>
                    <p className="text-white/60 text-sm mb-6 leading-relaxed">
                      Your password reset link has been sent to your email
                      address. Please check your email inbox.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="font-semibold text-sm px-8 py-3 rounded-full
                                 bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] text-white
                                 shadow-[0_8px_24px_-8px_rgba(124,91,255,0.6)]
                                 hover:opacity-95 hover:scale-105 transition-all duration-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
