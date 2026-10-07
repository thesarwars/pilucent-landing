"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import { RiBankFill } from "react-icons/ri";
import LinkButton from "../banking/_components/LinkButton";
import { toast } from "@/lib/ToastService";

const PaymentSetup: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [animateCards, setAnimateCards] = useState(false);
  const [isBankLinked, setIsBankLinked] = useState(false);

  useEffect(() => {
    document.title = "Payment Setup";
    const isLinked = localStorage.getItem("is_bank_linked_for_payment");
    if (isLinked == "true") {
      setIsBankLinked(true);
      setCompletedSteps((prev: any) => new Set([...prev, "bank-connection"]));
    }
    // Trigger card animations on mount
    setTimeout(() => setAnimateCards(true), 200);
  }, []);

  useEffect(() => {
    if (isBankLinked) {
      localStorage.setItem("is_bank_linked_for_payment", "true");
      setCompletedSteps((prev: any) => new Set([...prev, "bank-connection"]));
    }
  }, [isBankLinked]);

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps((prev: any) => new Set([...prev, stepId]));
  };

  const progressPercentage = completedSteps.size * 100;

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-semibold text-gray-900">
            Payment Setup
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Configure your payment systems to streamline your business
            operations
          </p>

          {/* Progress Bar */}
          {/* <div className="mx-auto mt-8 max-w-md"> */}
          {/* <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm text-gray-600">
                {completedSteps.size}/2 completed
              </span>
            </div> */}
          {/* <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div> */}
        </div>

        {/* Setup Cards */}
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {/* Bank Connection Card */}
          <div
            style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
            className={`relative overflow-hidden rounded-xl border-[3px] border-black bg-yellow-50 shadow-sm transition-all duration-500 ${
              animateCards
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            } hover:-translate-y-1 hover:shadow-md`}
          >
            {/* Close button */}
            {/* <button className="absolute right-4 top-4 z-10 text-gray-400 transition-colors hover:text-gray-600">
              <FiX className="h-5 w-5" />
            </button> */}

            {/* Completion indicator */}
            {completedSteps.has("bank-connection") && (
              <div className="animate-scale-in absolute left-4 top-4 z-10 rounded-full bg-green-500 p-1">
                <FiCheck className="h-4 w-4 text-white" />
              </div>
            )}

            <div className="p-8">
              {/* Icon Section - Overlapping Circles */}
              <div className="mb-8 flex items-center justify-center">
                <div className="flex items-center">
                  {/* Blue circle with bank icon */}
                  <div className="z-10 -mr-10 flex h-24 w-24 items-center justify-center rounded-full border-2 border-black bg-blue-500 shadow-lg transition-transform duration-300 hover:scale-105">
                    <RiBankFill className="size-12 text-white" />
                  </div>
                  <div className="h-24 w-24 items-center justify-center rounded-full border-2 border-black bg-white shadow-lg transition-transform duration-300 hover:scale-105"></div>
                </div>
              </div>

              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Save Time With Automatic Expense Tracking
              </h3>
              <p className="mb-8 leading-relaxed text-gray-700">
                Stay up-to-date on your business expenses with automatic expense
                imports from your bank account or credit card.
              </p>

              <div
                onClick={() => {
                  if (isBankLinked) {
                    toast.warning(
                      "Already linked with a bank account, if you link another previous one will be unlinked!",
                    );
                  }
                }}
                // disabled={completedSteps.has("bank-connection")}
                className={`w-full rounded-lg text-center font-medium transition-all duration-300 ${
                  isBankLinked
                    ? "cursor-not-allowed bg-green-600 text-white"
                    : "transform bg-gray-900 text-white hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-lg"
                }`}
              >
                <LinkButton
                  className="w-full px-6 py-3"
                  isLinkBank={true}
                  setIsLinkBank={setIsBankLinked}
                  btnText={
                    isBankLinked ? "Bank Connected" : "Connect Your Bank"
                  }
                />
              </div>
            </div>
          </div>

          {/* Online Payments Card */}
          <div
            className={`relative overflow-hidden rounded-xl border-[3px] border-black bg-white shadow-sm transition-all duration-500 ${
              animateCards
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0"
            } hover:-translate-y-1 hover:shadow-md`}
            style={{
              transitionDelay: "100ms",
              boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)",
            }}
          >
            {/* Close button */}
            {/* <button className="absolute right-4 top-4 z-10 text-gray-400 transition-colors hover:text-gray-600">
              <FiX className="h-5 w-5" />
            </button> */}

            {/* Completion indicator */}
            {completedSteps.has("online-payments") && (
              <div className="animate-scale-in absolute left-4 top-4 z-10 rounded-full bg-green-500 p-1">
                <FiCheck className="h-4 w-4 text-white" />
              </div>
            )}

            <div className="p-8">
              {/* Payment Methods Section */}
              <div className="mb-8 rounded-lg border-2 border-black p-4">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  <span className="font-medium text-gray-900">
                    Online Payments
                  </span>
                </div>

                {/* Payment Icons */}
                <div className="flex items-center space-x-3">
                  <div className="flex h-6 w-10 items-center justify-center rounded bg-blue-600 px-1 text-xs font-bold text-white transition-transform hover:scale-105">
                    VISA
                  </div>
                  <div className="flex h-6 w-10 items-center justify-center rounded bg-gradient-to-r from-red-500 to-yellow-500 px-1 text-xs text-white transition-transform hover:scale-105">
                    <div className="mr-1 h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="-ml-2 h-3 w-3 rounded-full bg-yellow-500"></div>
                  </div>
                  <div className="flex h-6 w-10 items-center justify-center rounded bg-blue-500 px-1 text-xs font-bold text-white transition-transform hover:scale-105">
                    AMEX
                  </div>
                  <div className="flex h-6 w-10 items-center justify-center rounded bg-black px-1 text-xs text-white transition-transform hover:scale-105">
                    Pay
                  </div>
                  <div className="flex h-6 w-10 items-center justify-center rounded bg-gray-400 px-1 text-xs font-bold text-white transition-transform hover:scale-105">
                    BANK
                  </div>
                </div>
              </div>

              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Get Paid Faster With Online Payments
              </h3>
              <p className="mb-8 leading-relaxed text-gray-700">
                Let your clients pay instantly via their invoice. It's easy for
                them to do and easy for you to keep track of the money coming
                in.
              </p>
            </div>
            <div className="mx-8 mb-2 max-md:mb-4">
              <button
                onClick={() => {
                  // handleStepComplete("online-payments")
                  toast.info("Online payment system coming soon...");
                }}
                disabled={completedSteps.has("online-payments")}
                className={`mb-2 w-full rounded-lg px-6 py-3 font-medium transition-all duration-300 ${
                  completedSteps.has("online-payments")
                    ? "cursor-not-allowed bg-green-600 text-white"
                    : "transform bg-gray-900 text-white hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-lg"
                }`}
              >
                {completedSteps.has("online-payments")
                  ? "Online Payments Enabled"
                  : "Enable Online Payments"}
              </button>
            </div>
          </div>
        </div>

        {/* Completion Message */}
        {completedSteps.size === 2 && (
          <div className="animate-fade-in mx-auto mt-12 max-w-2xl rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <FiCheck className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-gray-900">
              Setup Complete!
            </h2>
            <p className="mb-6 text-gray-600">
              Your payment systems are now configured and ready to use.
            </p>
            <button className="rounded-lg border-2 border-black bg-white px-8 py-3 font-medium text-black transition-colors hover:bg-black hover:text-white">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentSetup;
