"use client";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useProvider } from "../../../../../context/ProviderContext";
import {
  postPlanSubscription,
  postSubscription,
  captureSubscriptionCompanyUid,
  getSubscriptionCompanyUid,
  withSubscriptionCompany,
  clearSubscriptionCompanyUid,
} from "../../../../helpers/backend";
import { toast } from "sonner";

const Checkout = ({ amount }: { amount?: any }) => {
  const params = useSearchParams();
  const paymentSlug = params.get("pay");
  const billing = params.get("billing");
  const stripe = useStripe();
  const elements = useElements();
  const currency = useSearchParams().get("currency");
  const title = useSearchParams().get("package");
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [intentId, setIntentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, company } = useProvider();
  const calledRef = useRef<any>(false);
  const [subscriptionUID, setSubscriptionUID] = useState("");

  // Persist the company handed off from the Pilucent app (?company_uid)
  // so the right company is billed even after the sign-in round-trip drops the param.
  useEffect(() => {
    captureSubscriptionCompanyUid();
  }, []);

  useEffect(() => {
    if (paymentSlug && user?.uid && !calledRef.current) {
      calledRef.current = true;
      const fn = async () => {
        try {
          const res = await postPlanSubscription(
            withSubscriptionCompany({
              subscription_price_slug: paymentSlug,
            })
          );
          setSubscriptionUID(res?.uid);
          setClientSecret(res?.client_secret);
          setIntentId(res?.payment_intent_id);
        } catch (error) {
          toast.error("Error occurred. Please try again.");
        }
      };
      fn();
    }
  }, [paymentSlug, user?.uid]);

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await postSubscription(
        withSubscriptionCompany({
          billing_frequency: billing,
          plan_title: title,
        })
      );
      if (res?.success) {
        if (res?.checkout_url) {
          // handoff consumed — clear so a later unrelated purchase isn't mis-billed
          clearSubscriptionCompanyUid();
          window.location.href = res?.checkout_url;
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      }
    } catch (error) {
      //err
    } finally {
      // if (!stripe || !elements) return;

      // const { error: submitErr } = await elements.submit();

      // if (submitErr) {
      //   setError(submitErr?.message);
      //   setTimeout(() => {
      //     setError("");
      //   }, 7000);
      //   setIsLoading(false);
      //   return;
      // }

      // const { error } = await stripe.confirmPayment({
      //   elements,
      //   clientSecret,
      //   confirmParams: {
      //     return_url: `https://www.pilucent.com/payment-success?amount=${amount}&intentId=${intentId}&currency=${currency}&sub-uid=${subscriptionUID}`,
      //   },
      // });

      // if (error) {
      //   setError(error?.message);
      // } else {
      //   // payment success
      // }
      setIsLoading(false);
    }
  };

  if (!stripe || !elements) {
    return (
      <div className="h-[50vh] w-full flex items-center justify-center">
        <p className="inline-block h-20 w-20 animate-spin rounded-full border-[4px] border-gray-100 border-t-[#6A6EF6]" />
      </div>
    );
  }

  return (
    <div className="max-w-lg flex-1">
      <div className="flex px-1 items-center justify-between">
        <h1 className="text-base hidden md:flex md:text-xl font-semibold text-center text-white py-4">
          Your Plan
        </h1>
        <h1 className="text-base md:text-xl font-semibold text-center text-white py-4">
          {title}
        </h1>

        <p className="text-base md:text-xl font-semibold">
          {amount} {currency} /
          <span className="text-xs md:text-sm capitalize">
            {billing.split("_").join(" ")}
          </span>
        </p>
      </div>
      <form onSubmit={handlePay} className="relative">
        {(!user?.uid ||
          (!getSubscriptionCompanyUid() && company?.is_company_subscription)) && (
          <div className="w-full rounded-lg z-[9999] bg-black bg-opacity-20 h-full cursor-not-allowed absolute top-0 left-0 text-sm text-black flex items-center justify-center">
            <p className="bg-white px-2 py-1 rounded-sm">
              Please SignUp or SignIn to make payment
            </p>
          </div>
        )}
        {/* {clientSecret && <PaymentElement />} */}

        {error && (
          <p className="text-base rounded-md py-1 pt-4 -mt-3 text-red-500 bg-white text-center">
            {error}
          </p>
        )}

        <button
          disabled={isLoading}
          className="bg-black disabled:cursor-not-allowed text-white text-lg py-3 w-full text-center rounded-md hover:bg-opacity-80 px-6"
        >
          {!isLoading ? (
            <>
              PAY {amount ? amount : ""} {currency ? currency : ""}
            </>
          ) : (
            "Processing..."
          )}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
