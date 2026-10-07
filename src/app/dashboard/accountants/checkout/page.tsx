"use client";

import { Suspense, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter, useSearchParams } from "next/navigation";
import Checkout from "./_components/Checkout";
import { postPlanSubscription } from "@/app/helpers/backend";
import { toast } from "@/lib/ToastService";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUB_KEY || "");

const CheckoutPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const payment = Number(useSearchParams().get("payment") || 0);
  const title = useSearchParams().get("package");
  const billing = useSearchParams().get("billing");
  const currency = useSearchParams().get("currency");
  const paymentSlug = useSearchParams().get("pay");
  const router = useRouter();
  const convertToSubCurrency = (amount: number) => {
    return Math.ceil(amount * 100);
  };

  const handleConfirm = async () => {
    try {
      // const res = await postPlanSubscription({
      //   subscription_price_slug: paymentSlug,
      // });
      // setClientSecret(res?.client_secret);
      // setIntentId(res?.payment_intent_id);
      // if (res?.status == "SUCCEEDED") {
        router.push(
          `/dashboard/accountants/success?amount=${payment}&currency=${currency}&title=${title}&status=succeeded&override=true`,
        )
      // }else{
      //   toast.error("Something went wrong while creating the subscription.Please contact support.")
      // }
    } catch (error) {
      toast.error("Error occurred. Please try again.");
    }
  };

  return (
    <div>
      <div
        style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
        className="mx-auto mt-10 flex max-w-7xl justify-center gap-8 rounded-xl border-2 bg-white"
      >
        <div className="flex-1">
          <div className="relative mb-8 flex flex-1 items-start justify-center text-5xl text-white">
            {payment > 0 ? (
              <Elements
                stripe={stripePromise}
                options={{
                  amount: convertToSubCurrency(payment),
                  mode: "payment",
                  currency: currency?.toLocaleLowerCase(),
                }}
              >
                <Checkout amount={payment} />
              </Elements>
            ) : (
              <div className="max-w-xl flex-1">
                <div className="flex items-center justify-between px-1">
                  <h1 className="hidden py-4 text-center text-base font-medium text-accent_soft_black md:flex md:text-xl">
                    Your Plan
                  </h1>
                  <h1 className="py-4 text-center text-base font-medium text-accent_soft_black md:text-xl">
                    {title}
                  </h1>

                  <p className="text-base font-medium text-accent_soft_black md:text-xl">
                    {payment} {currency} /
                    <span className="text-xs capitalize text-accent_soft_black md:text-sm">
                      {billing?.split("_").join(" ")}
                    </span>
                  </p>
                </div>
                <button
                  onClick={handleConfirm}
                  className="w-full rounded-md bg-black px-6 py-3 text-center text-lg text-white hover:bg-opacity-80 disabled:cursor-not-allowed"
                >
                  {!isLoading ? <>CONFIRM</> : "Processing..."}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <p className="inline-block h-24 w-24 animate-spin rounded-full border-[3px] border-gray-100 border-t-[#6A6EF6]" />
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
};

export default Page;
