"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { baseURL } from "../helpers/api";

const Banner = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      const payload = { email };
      try {
        const response = await fetch(
          `${baseURL}/public/live-demo`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        if (response.ok) {
          localStorage.setItem("email", email);
          setIsModalOpen(true);
          setTimeout(() => {
            setIsModalOpen(false);
            router.push("/demo");
          }, 3000); // Show modal for 3 seconds before redirecting
        } else {
          console.error("Failed to submit email");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center pb-10">
          <div className="max-w-xl space-y-6">
            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-white">
              AI That Runs Your Payroll, Accounting & HR Effortlessly.
            </h1>
            {/* Description */}
            <p className="text-white/90 text-lg leading-relaxed">
              Pilucent is your AI-powered financial partner, automating
              payroll, accounting, tax compliance, HR, and inventory. Ditch
              spreadsheets and guesswork—let AI streamline finances while you
              grow your business effortlessly.
            </p>
            {/* Email Input Section */}
            {/* <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row bg-white text-black rounded-lg w-full sm:w-fit gap-4"> */}
            {/* <input
                                type="email"
                                placeholder="Enter email"
                                className="outline-none px-4 py-3 rounded-lg sm:rounded-l-lg w-full sm:w-auto text-sm"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            /> */}
            <Link href={'/auth?action=sign-up'}>
              <button
                type="submit"
                className="bg-[#DED943] mt-8 rounded-lg sm:rounded-r-lg text-black font-semibold text-sm px-8 py-3 w-full sm:w-auto"
              >
                Sign Up for Free
              </button>
            </Link>
            {/* </form> */}
          </div>
          <div className="relative">
            {/* Main Image */}
            <Image
              src="/banne_2.png"
              alt="Pilucent Dashboard"
              width={800}
              height={600}
              className="rounded-lg shadow-2xl"
              priority
            />
            {/* Overlayed Image */}
            <div className="absolute -bottom-12 sm:-bottom-24 -left-8 sm:-left-16 w-[80%] lg:w-[70%]">
              <Image
                src="/banne3.png" // Replace with your actual image path
                alt="Pilucent Chart"
                width={500}
                height={300}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <FaCheckCircle className="mx-auto mb-4 text-green-500 text-5xl" />
              <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
              <p className="text-gray-600 mb-6">
                Your email has been successfully submitted.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banner;
