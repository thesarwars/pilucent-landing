"use client";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { postPlanSubscription } from "../../../../helpers/backend";
import { toast } from "@/lib/ToastService";
import { Router } from "lucide-react";
import MainLoader from "@/components/MainLoader/MainLoader";

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
  const calledRef = useRef<any>(false);
  const [subscriptionUID, setSubscriptionUID] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (paymentSlug && !calledRef.current) {
      calledRef.current = true;
      const fn = async () => {
        try {
          const res = await postPlanSubscription({
            subscription_price_slug: paymentSlug,
          });
          setSubscriptionUID(res?.uid);
          setClientSecret(res?.client_secret);
          setIntentId(res?.payment_intent_id);
        } catch (error) {
          toast.error("Error occurred. Please try again.");
        }
      };
      fn();
    }
  }, [paymentSlug]);

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    setIsLoading(true);
    if (!stripe || !elements) return;

    const { error: submitErr } = await elements.submit();

    if (submitErr) {
      setError(submitErr?.message || "");
      setTimeout(() => {
        setError("");
      }, 7000);
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/accountants/success?amount=${amount}&intentId=${intentId}&currency=${currency}&sub-uid=${subscriptionUID}&title=${title}&tkn=${token}`,
      },
    });

    if (error) {
      setError(error?.message || "");
    } else {
      // router.push(
      //   `/dashboard/accountants/success?amount=${amount}&intentId=${intentId}&currency=${currency}&sub-uid=${subscriptionUID}&title=${title}`,
      // );
    }
    setIsLoading(false);
  };

  if (!stripe || !elements) {
    return <MainLoader />;
  }

  return (
    <div className="max-w-lg flex-1">
      <div className="flex items-center justify-between px-1">
        <h1 className="hidden py-4 text-center text-base font-semibold text-white md:flex md:text-xl">
          Your Plan
        </h1>
        <h1 className="py-4 text-center text-base font-semibold text-white md:text-xl">
          {title}
        </h1>

        <p className="text-base font-semibold md:text-xl">
          {amount} {currency} /
          <span className="text-xs capitalize md:text-sm">
            {billing?.split("_").join(" ")}
          </span>
        </p>
      </div>
      <form onSubmit={handlePay} className="relative">
        {clientSecret && <PaymentElement />}

        {error && (
          <p className="-mt-3 rounded-md bg-white py-1 pt-4 text-center text-base text-red-500">
            {error}
          </p>
        )}
        <button
          disabled={!stripe || isLoading || !elements || !clientSecret}
          className="w-full rounded-md bg-black px-6 py-3 text-center text-lg text-white hover:bg-opacity-80 disabled:cursor-not-allowed"
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
