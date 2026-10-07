"use client";

import {
  fetchPublicSubscriptions,
  fetchPublicSubscriptionsPrices,
  postDemo,
} from "@/app/helpers/backend";
import { useAppSelector } from "@/app/redux/store";
import MainLoader from "@/components/MainLoader/MainLoader";
import InDev from "@/components/ui/InDev";
import { toast } from "@/lib/ToastService";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  packageName: string;
  price: string;
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  packageName,
  price,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm duration-200 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 max-w-md rounded-2xl bg-white p-8 shadow-2xl duration-300 animate-in zoom-in-95">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            Confirm Your Selection
          </h3>

          <p className="mb-6 text-gray-600">
            You're about to select the{" "}
            <span className="font-medium text-gray-900">{packageName}</span>
            {price !== "FREE" && (
              <span>
                {" "}
                for{" "}
                <span className="font-medium text-gray-900">{price}/month</span>
              </span>
            )}
            . Are you ready to proceed?
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-gray-800"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const GrowthFeatures = [
  {
    title: "Includes everything of Starter, plus:",
    value: "included",
  },
  {
    title: "Monthly Or Bi-Weekly Payroll Processing",
    value: "is_monthly_or_biweekly_payroll_processing",
  },
  {
    title: "Quarterly Tax Planning Reviews",
    value: "is_quarterly_tax_planning_reviews",
  },
  {
    title: "Budgeting And Cash Flow Forecasting",
    value: "is_budgeting_and_cash_flow_forecasting",
  },
  { title: "Sales Tax Filing", value: "is_sales_tax_filing" },
  { title: "Unlimited Email Support", value: "is_unlimited_email_support" },
  { title: "Dedicated Accountant", value: "is_dedicated_accountant" },
];

const PremiumFeatures = [
  {
    title: "Includes everything of the Growth Package, plus:",
    value: "included",
  },
  { title: "Virtual CFO Services", value: "is_Virtual_CFO_services" },
  {
    title: "Financial Modeling And Custom Dashboards",
    value: "is_financial_modeling_and_custom_dashboards",
  },
  {
    title: "Invest-Ready Financial Statements",
    value: "is_investo_ready_financial_statements",
  },
  {
    title: "Audit Support And Representation",
    value: "is_audit_support_and_representation",
  },
  {
    title: "Year-End Planning For Tax Minimization",
    value: "is_year_end_planning_for_tax_minimization",
  },
  {
    title: "Multi-Entity Or Multi-State Handling",
    value: "is_multi_entity_or_multi_state_handling",
  },
  { title: "Priority Support", value: "is_priority_support" },
];

const FeaturesArr = [
  {
    title: "Monthly Bookkeeping And Reconciliations",
    value: "is_monthly_bookkeeping_and_reconciliations",
  },
  {
    title: "Profit & Loss, Balance Sheet, Cash Flow reports",
    value: "is_reports",
  },
  {
    title: "Annual tax filing (business + personal if needed)",
    value: "is_annual_tax_filing",
  },
  { title: "1099 Preparation & Filing", value: "is_1099_preparation_filing" },
  {
    title: "30-Minute Consultation Per Quarter",
    value: "is_30_minute_consultation_per_quarter",
  },
  {
    title: "Monthly Or Bi-Weekly Payroll Processing",
    value: "is_monthly_or_biweekly_payroll_processing",
  },
  {
    title: "Quarterly Tax Planning Reviews",
    value: "is_quarterly_tax_planning_reviews",
  },
  {
    title: "Budgeting And Cash Flow Forecasting",
    value: "is_budgeting_and_cash_flow_forecasting",
  },
  { title: "Sales Tax Filing", value: "is_sales_tax_filing" },
  { title: "Unlimited Email Support", value: "is_unlimited_email_support" },
  { title: "Dedicated Accountant", value: "is_dedicated_accountant" },
  { title: "Virtual CFO Services", value: "is_Virtual_CFO_services" },
  {
    title: "Financial Modeling And Custom Dashboards",
    value: "is_financial_modeling_and_custom_dashboards",
  },
  {
    title: "Invest-Ready Financial Statements",
    value: "is_investo_ready_financial_statements",
  },
  {
    title: "Audit Support And Representation",
    value: "is_audit_support_and_representation",
  },
  {
    title: "Year-End Planning For Tax Minimization",
    value: "is_year_end_planning_for_tax_minimization",
  },
  {
    title: "Multi-Entity Or Multi-State Handling",
    value: "is_multi_entity_or_multi_state_handling",
  },
  { title: "Priority Support", value: "is_priority_support" },
];

export default function Page() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(true);
  const [Subscriptions, setSubscriptions] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const router = useRouter();
  const { Company } = useAppSelector((state) => state.CompanyData);
  const { isPending: is, data } = useQuery({
    queryKey: ["accountant_subscriptions"],
    queryFn: async () => {
      const res = await fetchPublicSubscriptions({
        kind: "ACCOUNTANT_SUBSCRIPTION",
      });
      setSubscriptions(res?.results);
    },
  });
  const [modalState, setModalState] = useState<any>({
    isOpen: false,
    packageName: "",
    price: "",
  });

  useEffect(() => {
    if (packages?.length > 0) {
      setIsVisible(true);
    }
  }, [packages]);

  useEffect(() => {
    if (Subscriptions?.length > 0) {
      const fn = async () => {
        const promises = await Promise.all(
          Subscriptions?.map((plan) => fetchSubscriptionPrices(plan.slug)),
        );
        setPackages(promises);
        setIsPending(false);
      };
      fn();
    }
  }, [Subscriptions]);

  const fetchSubscriptionPrices = async (planSlug: string) => {
    try {
      const response = await fetch(
        `https://balanzifyapi.jumatechs.xyz/api/v1/public/subscription-plans/${planSlug}/prices`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch prices for ${planSlug}`);
      }
      const data = await response.json();

      // Update prices state with the fetched prices
      const plans = Subscriptions?.filter((plan: any) => {
        if (plan.slug === planSlug) {
          const updatedPlans = [...Subscriptions];
          const planIndex = updatedPlans.findIndex((p) => p.slug === planSlug);
          if (planIndex !== -1) {
            updatedPlans[planIndex].prices = data.results[0];
          }

          return updatedPlans;
        }
      });
      return plans[0];
      // setPackages(plans);
      // const existPlans = plans?.filter((p: any) => p.slug);
      // console.log(existPlans);
      // setPrices(prevPrices => ({
      //     ...prevPrices,
      //     [planSlug]: data.results
      // }))
    } catch (err) {
      console.error(`Error fetching prices for ${planSlug}:`, err);
    }
  };

  // console.log(data);

  const handlePackageSelect = (packageData: any) => {
    setModalState({
      isOpen: true,
      ...packageData,
      packageName: packageData?.title,
      price: packageData?.prices?.price,
    });
  };

  const handleConfirm = async () => {
    // Handle the actual selection logic here
    router.push(
      `/dashboard/accountants/checkout?pay=${modalState?.prices?.slug}&currency=${
        modalState?.currency
      }&package=${
        modalState?.title ? modalState?.title : ""
      }&payment=${(Number(modalState?.prices?.price) - Number(modalState?.prices?.discount)).toFixed(2)}&billing=${modalState?.prices?.billing_frequency}`,
    );
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, packageName: "", price: "" });
  };

  // if (!isVisible) {
  //   return <MainLoader />;
  // }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="px-4 pb-12 pt-16 sm:px-6 lg:px-8">
        <div
          className={`transform text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Professional Accounting Services
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Choose the right package for your business needs
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {packages?.map((pkg, index) => (
            <div
              key={index}
              className={`relative transform transition-all duration-500 hover:-translate-y-1 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Popular Badge */}
              {pkg?.title == "Growth Package" && (
                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 transform">
                  <div className="rounded-full bg-gray-900 px-4 py-1 text-sm font-medium text-white">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card */}
              <div
                className={`flex h-full flex-col rounded-xl border bg-white transition-all duration-300 hover:shadow-lg ${
                  pkg?.title == "Growth Package"
                    ? "border-gray-900 shadow-md"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Card Header */}
                <div className="border-b border-gray-100 p-6">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {pkg?.title}
                  </h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      {Number(pkg?.prices?.price)
                        ? `$ ${Number(pkg?.prices?.price)}`
                        : "FREE"}
                    </span>
                    {Boolean(Number(pkg?.prices?.price)) && (
                      <span className="ml-1 text-sm text-gray-500">/month</span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-6">
                  <ul className="mb-8 space-y-3">
                    {(pkg?.title == "Growth Package"
                      ? GrowthFeatures
                      : pkg?.title == "Premium Package"
                        ? PremiumFeatures
                        : FeaturesArr
                    )?.map((feature: any, featureIndex: number) => {
                      return (
                        (pkg?.[feature.value] ||
                          feature?.value == "included") && (
                          <li
                            key={featureIndex}
                            className={`flex transform items-start text-sm transition-all duration-300 ${
                              isVisible
                                ? "translate-x-0 opacity-100"
                                : "translate-x-4 opacity-0"
                            }`}
                            style={{
                              transitionDelay: `${index * 150 + featureIndex * 50}ms`,
                            }}
                          >
                            <div className="mr-3 mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gray-900">
                              <svg
                                className="h-2.5 w-2.5 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <span className={`leading-relaxed text-gray-700`}>
                              {feature.title}
                            </span>
                          </li>
                        )
                      );
                    })}
                  </ul>

                  <div className="flex-1"></div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      if (Company?.is_accountant_subscription) {
                        toast.error("You already have a running subscription");
                        return;
                      }

                      handlePackageSelect(pkg);
                    }}
                    className={`w-full rounded-lg px-4 py-3 font-medium transition-all duration-200 ${
                      pkg.title == "Growth Package"
                        ? "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {pkg.title == "Growth Package" ? "Choose Growth" : "  "}
                    {pkg.title == "Premium Package" ? "Go Premium" : ""}
                    {Number(pkg.prices?.price) ? "" : "Get Started"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        {/* <div
          className={`mt-16 transform text-center transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-8">
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Need a Custom Solution?
            </h2>
            <p className="mb-6 text-gray-600">
              Let's discuss how we can tailor our services to meet your specific
              business needs.
            </p>
            <button className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-gray-800">
              Schedule Consultation
            </button>
          </div>
        </div> */}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        packageName={modalState.packageName}
        price={modalState.price}
      />
    </div>
  );
}
