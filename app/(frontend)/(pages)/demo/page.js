"use client"

import Image from "next/image"
import Link from "next/link"
import { FaCheckCircle } from "react-icons/fa"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import React, { useEffect, useState } from "react"
import dayjs from "dayjs"
import { postDemo } from "../../../helpers/backend"
import TimePicker from "./_components/TimePicker"

const DemoForm = () => {
  const [email, setEmail] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [time, setTime] = useState('22:00')
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    const storedEmail = localStorage.getItem("email")
    if (storedEmail) {
      setEmail(storedEmail)
    }
  }, [])

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
  
    const payload = {
      full_name: formData.get("fullName"),
      work_email: formData.get("workEmail"),
      company_name: formData.get("companyName"),
      phone_number: formData.get("phoneNumber"),
      email: email ? email : formData.get("workEmail"),
      status: "REQUESTED",
      preferable_version: formData.get("preferableVersion"),
      preferable_date: dayjs(formData.get("preferableDate")).format("YYYY-MM-DD"),
      preferable_time: time,
      agent_count: formData.get("agent_count"),
      comment: formData.get("comment"),
      terms: formData.get("terms") ? true : false,
    };
  
    // console.log("Payload:", payload);
  
    try {
      setIsLoading(true)
      const response = await postDemo(payload)
      if (response.success) {
        // console.log("Form submitted successfully");
        setIsModalOpen(true)
      } else {
        console.error("Failed to submit form");
      }
    } catch (error) {
      console.error("Error:", error);
    }finally{
      setIsLoading(false)
    }
  };

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const labelCls = "block text-xs font-medium text-white/80 uppercase tracking-wider"
  const inputCls =
    "mt-2 block w-full px-4 py-3 bg-[#150B22] border border-white/10 rounded-xl text-white placeholder-white/40 text-sm shadow-inner focus:outline-none focus:border-[#7C5BFF] focus:ring-2 focus:ring-[#7C5BFF]/30 transition-all"

  return (
    <div className="min-h-screen bg-[#150B22] flex items-center justify-center p-4">
      <div className="w-full max-w-7xl grid md:grid-cols-2 gap-8 items-start">
        {/* Left Section */}
        <div className="text-[#F9F9F9] space-y-6 px-4 md:px-0 lg:mt-60 mt-28">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight animate-fade-in-up">Save up to $8,000 a year in billable hours</h1>
          <p className="text-[#F9F9F9]/75 animate-fade-in-up [animation-delay:120ms]">Pilucent is preferred by business owners, their teams, and accountants.</p>

          <ul className="space-y-3 text-[#F9F9F9]/75">
            <li className="flex items-center gap-3">
              <FaCheckCircle className="w-5 h-5 text-[#5A5FEE]" />
              <span>Seamlessly migrate from your current software.</span>
            </li>
            <li className="flex items-center gap-3">
              <FaCheckCircle className="w-5 h-5 text-[#5A5FEE]" />
              <span>Get access to live customer support.</span>
            </li>
            <li className="flex items-center gap-3">
              <FaCheckCircle className="w-5 h-5 text-[#5A5FEE]" />
              <span>Your data is safe and secure.</span>
            </li>
          </ul>

          <div className="pt-6">
            <p className="text-sm text-[#F9F9F9]/75 mb-4">
              "Pilucent helped tremendously with cash flow. We've collected on our accounts receivable at a higher
              percentage than we ever had before. A lot of our clients have responded well to Pilucent."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <Image src="/david.png" alt="Esther Howard" width={48} height={48} className="rounded-full" />
              </div>
              <div>
                <p className="font-semibold text-[#F9F9F9]">Esther Howard</p>
                <p className="text-sm text-[#F9F9F9]/75">Owner of Moonrock Tax Group</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex-1 w-full lg:mt-32 mt-10 font-jakarta animate-fade-in-up">
          <div className="relative bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
            <div className="mx-auto space-y-6">
              <div className="text-center">
                <h2 className="text-white text-2xl sm:text-3xl font-semibold tracking-tight">Try Pilucent free</h2>
                <p className="text-white/60 text-sm mt-2">Try it free for 30 days. No credit card required. Cancel anytime.</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="fullName" className={labelCls}>
                    Full Name <span className="text-[#7C5BFF]">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className={inputCls}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="workEmail" className={labelCls}>
                    Work Email <span className="text-[#7C5BFF]">*</span>
                  </label>
                  <input
                    type="email"
                    id="workEmail"
                    name="workEmail"
                    className={inputCls}
                    placeholder="Enter your work email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="companyName" className={labelCls}>
                    Company Name <span className="text-[#7C5BFF]">*</span>
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    className={inputCls}
                    placeholder="Enter your company name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className={labelCls}>
                    Phone Number <span className="text-[#7C5BFF]">*</span>
                  </label>
                  <div className="mt-2">
                    <PhoneInput
                      country={"us"}
                      enableSearch={true}
                      inputProps={{
                        name: "phoneNumber",
                        required: true,
                        autoFocus: false,
                      }}
                      containerClass="w-full"
                      inputClass="!w-full !h-[46px] !py-3 !pl-12 !pr-4 !bg-white/[0.04] !border !border-white/10 !rounded-xl !text-white !text-sm focus:!border-[#7C5BFF]"
                      buttonClass="!bg-white/[0.04] !border !border-white/10 !rounded-l-xl"
                      dropdownClass="!bg-[#1a1330] !text-white"
                      searchClass="!bg-white/10 !text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="preferableVersion" className={labelCls}>
                    Preferable Version <span className="text-[#7C5BFF]">*</span>
                  </label>
                  <select
                    id="preferableVersion"
                    name="preferableVersion"
                    className={inputCls + " [color-scheme:dark] bg-[#150B22]"}
                    required
                  >
                    <option value="Basic">Basic</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="Number of Agents" className={labelCls}>
                    Number of Agents
                  </label>
                  <input
                    type="number"
                    id="Number of Agents"
                    name="agent_count"
                    className={inputCls}
                    placeholder="Enter number of agents"
                    defaultValue={1}
                  />
                </div>

                <div className="grid lg:grid-cols-2 grid-cols-1 gap-2">
                  <div>
                    <label htmlFor="preferableDate" className={labelCls}>
                      Preferable Date <span className="text-[#7C5BFF]">*</span>
                    </label>
                    <input
                      type="date"
                      id="preferableDate"
                      name="preferableDate"
                      className={inputCls + " [color-scheme:dark]"}
                      required
                    />
                  </div>

                  {/* make preferred_time */}
                  <div>
                    <label htmlFor="preferableTime" className={labelCls}>
                      Preferable Time <span className="text-[#7C5BFF]">*</span>
                    </label>
                    <TimePicker value={time} onChange={setTime} className={inputCls} />
                  </div>
                </div>

                {/* comment textarea */}
                <div>
                  <label htmlFor="comment" className={labelCls}>
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows="4"
                    className={inputCls}
                    placeholder="Enter your comment here..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 font-semibold text-sm px-6 py-3.5 rounded-full
                             bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] text-white
                             shadow-[0_8px_24px_-8px_rgba(124,91,255,0.6)]
                             hover:opacity-95 hover:scale-[1.02] active:scale-95
                             transition-all duration-300 flex items-center justify-center"
                >
                  {isLoading ? (
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white align-middle" />
                  ) : (
                    "Submit"
                  )}
                </button>

                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 mt-0.5 accent-[#7C5BFF] border-white/20 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-white/60">
                    I confirm that I have read and agree to Pilucent{" "}
                    <Link href="#" className="text-[#A78BFA] hover:text-white transition-colors">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-[#A78BFA] hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-jakarta">
          <div className="bg-[#1a1330] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] animate-fade-in-up">
            <div className="text-center">
              <FaCheckCircle className="mx-auto mb-4 text-[#7C5BFF] text-5xl" />
              <h2 className="text-2xl font-semibold text-white mb-4">Thank You!</h2>
              <p className="text-white/60 mb-6">
                Your demo request has been successfully submitted. Our team will connect with you shortly to schedule
                your personalized demo.
              </p>
              <button
                onClick={closeModal}
                className="font-semibold text-sm px-6 py-3 rounded-full bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] text-white shadow-[0_8px_24px_-8px_rgba(124,91,255,0.6)] hover:opacity-95 hover:scale-[1.02] active:scale-95 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DemoForm

