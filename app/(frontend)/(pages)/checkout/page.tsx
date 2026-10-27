"use client";

import { Suspense, useState } from "react";
import { useProvider } from "../../../../context/ProviderContext";
import SignUp from "../auth/_components/SignUp";
import SignIn from "../auth/_components/SignIn";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Checkout from "./_components/Checkout";
import { useSearchParams } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUB_KEY);


const CheckoutPage = () => {
  const { user, company } = useProvider();
  const [isSignIn, setIsSignIn] = useState(false);
  const payment = Number(useSearchParams().get("payment") || 0);
  const currency = useSearchParams().get("currency");

  const convertToSubCurrency = (amount: number) => {
    return Math.ceil(amount * 100);
  };

  return (
    <div className="bg-[#5A5FEE]">
      <div className="flex max-w-7xl mx-auto flex-col lg:flex-row items-center justify-center gap-8 ">
        <div className="mb-8 max-w-lg">
          {user?.uid ? (
            ""
          ) : !isSignIn ? (
            <SignUp setIsSignIn={setIsSignIn} />
          ) : (
            <SignIn setIsSignIn={setIsSignIn} />
          )}
        </div>
        <div className="flex-1">
          <div className="text-5xl flex-1 text-white relative flex justify-center mb-8 items-start">
            <Elements
              stripe={stripePromise}
              options={{
                amount: convertToSubCurrency(payment),
                mode: "payment",
                currency: currency.toLocaleLowerCase(),
              }}
            >
              <Checkout amount={payment} />
            </Elements>
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
        <div className="h-full w-full flex items-center justify-center">
          <p className="inline-block h-24 w-24 animate-spin rounded-full border-[3px] border-gray-100 border-t-[#6A6EF6]" />
        </div>
      }
    >
      <CheckoutPage />
    </Suspense>
  );
};

export default Page;
