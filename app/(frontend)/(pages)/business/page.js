import { FaPlay, FaRegClock, FaStar } from "react-icons/fa";
import Recommend from "../../../components/recommend";
import PricingSection from "../../../components/pricing_section";
import MarketingSection from "../../../components/knowledge";
import Testimonial from "../../../components/testimonial";
import Faq from "../../../components/faq";
import Build from "../../../components/build";
import { CiBag1 } from "react-icons/ci";
import Image from "next/image";
import BussinesTab from "../../../components/bussines-tab";
import BussinessMain from "../../../components/bussiness-main";
import { Suspense } from "react";

export default function AccountingSoftwareSection() {
  return (
    <div className="">
      <section>
        <div className="bg-[#F2F3FF]">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 py-12 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4 lg:max-w-xl">
                <h1 className="text-[48px] font-semibold text-[#00035F] leading-[57px]">
                  Accounting Software for Businesses With Employees
                </h1>
                <p className="text-[#7E84A3] text-base">
                  Unlock the future of financial management with Balancify. Our
                  innovative software combines ease of use with powerful.
                </p>
                <button className="bg-[#DED943] text-[#00035F] font-bold px-8 py-3 rounded-lg">
                  Talk to Specialist
                </button>
              </div>

              <div className="md:flex items-center gap-8">
                <div className="bg-[#6A6EF6] relative">
                  {/* <h1 className="text-[24px] font-inter text-white p-3">HRIS- Employee</h1>
									<div className="absolute r md:-right-16 top-20 bg-white px-4 py-2 rounded-full flex items-center gap-2">
										<CiBag1 className="w-4 h-4" />
										<span className="text-sm font-medium">Payroll</span>
									</div>

									<div className="absolute -left-5 md:-left-12 top-2/3 bg-white px-4 py-2 rounded-full flex items-center gap-2">
										<FaRegClock className="w-4 h-4" />
										<span className="text-sm font-medium">Attendance</span>
									</div> */}

                  <img
                    src="/business.png"
                    className=""
                    height={470}
                    alt="image"
                  />
                </div>
                <div className="bg-transparent border-[1px] border-white px-6 py-4 rounded-xl h-fit my-6 md:my-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[48px] font-medium">5.0</span>
                    <FaStar className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-base text-[#7E84A3]">Excellent Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto">
          <div className="text-[18px] text-[#333752] font-inter font-semibold rounded-2xl bg-white p-5 grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="max-w-[260px]">
              <img src="/bag_icon.png" />
              <p className="text-[#333752] font-semibold mt-4">
                Integrate Payroll and Empower Your Teams{" "}
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="max-w-[250px]">
                <p className="text-[#333752] lg:mt-16">
                  Save Big on Card Fees and transactions Rate{" "}
                </p>
              </div>
              <div className="lg:ml-12">
                <img src="/user_icon.png" />
                <p className="text-[#333752] mt-8 text-[16px]">
                  Set your team up for success with customer Onboarding{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <BussinesTab />
      <BussinessMain />
      <Recommend />
      <Suspense
        fallback={
          <div className="h-full w-full flex items-center justify-center">
            <p className="inline-block h-24 w-24 animate-spin rounded-full border-[3px] border-gray-100 border-t-[#6A6EF6]" />
          </div>
        }
      >
        <PricingSection />
      </Suspense>
      <MarketingSection />
      <Testimonial />
      <Faq />
      <Build />
    </div>
  );
}
