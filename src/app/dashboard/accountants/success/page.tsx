"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Animation from "../../../helpers/animations/Animation-tick.json";
import AnimationLoading from "../../../helpers/animations/Animation-loading.json";
import FailedAnimation from "../../../helpers/animations/Animation-failed.json";
import { patchPlanSubscription, postDemo } from "../../../helpers/backend";
import dynamic from "next/dynamic";
import { toast } from "@/lib/ToastService";
import { useAppDispatch, useAppSelector } from "@/app/redux/store";
import moment from "moment";
import Link from "next/link";

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
});

const TickAnimation = () => {
  return (
    <div className="size-96">
      <Lottie animationData={Animation} loop={true} />
    </div>
  );
};
const AnimationFailed = () => {
  return (
    <div className="my-16 size-36">
      <Lottie animationData={FailedAnimation} loop={true} />
    </div>
  );
};

const PaymentSuccess = () => {
  const intent = useSearchParams().get("intentId");
  const amount = useSearchParams().get("amount");
  const currency = useSearchParams().get("currency");
  const title = useSearchParams().get("title");
  const status = useSearchParams().get("redirect_status");
  const uid = useSearchParams().get("sub-uid");
  const override = useSearchParams().get("override");
  const calledRef = useRef<any>(false);
  const router = useRouter();
  const { UserData: user } = useAppSelector((state) => state.userData);
  const { Company } = useAppSelector((state) => state.CompanyData);
  const [isLoading, setIsLoading] = useState(true);

  const confirmSubscription = async () => {
    try {
      setIsLoading(true);
      const res = await patchPlanSubscription(uid, {
        payment_intent_id: intent || "",
      });
      if (res.success) {
        handlePostAccountantRequest();
      }
    } catch (error) {
      toast.error("Something went wrong. Please contact support");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!calledRef.current && status == "succeeded" && !override) {
      calledRef.current = true;
      confirmSubscription();
    }
  }, []);

  useEffect(() => {
    if (!calledRef.current && status == "succeeded" && override) {
      calledRef.current = true;
      handlePostAccountantRequest();
    }
  }, [override]);

  const handlePostAccountantRequest = async () => {
    const data = {
      work_email: user?.email,
      full_name: user?.name,
      phone_number: user?.phone,
      company_name: Company?.name,
      preferred_date: moment(new Date()).format("YYYY-MM-DD"),
      comment: JSON.stringify({
        title: title,
        subscription_uid: uid,
        payment_amount: amount,
        intent,
      }),
      request_type: "ACCOUNTANT_SERVICE",
      status: "REQUESTED",
    };
    try {
      setIsLoading(true);
      const res = await postDemo(data);
      if (res?.success) {
        toast.success("Activated. You will get an confirmation email soon.");
      }
    } catch (error) {
      //error
      toast.success("Failed. Please contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !override) {
    return (
      <div className="font-inter my-16 flex flex-col items-center justify-center">
        <div className="size-40 md:size-80">
          <Lottie animationData={AnimationLoading} loop={true} />
        </div>
        <h1 className="font-inter mt-4 text-xl font-semibold md:text-2xl">
          PROCESSING...
        </h1>
      </div>
    );
  }

  return (
    <div className="font-inter mx-auto mb-8 flex max-w-7xl flex-col items-center justify-center border-b pb-16">
      {status == "succeeded" || override ? (
        <>
          <TickAnimation />
          <h1 className="-mt-40 mb-4 text-3xl font-semibold text-[#4f54f7] md:text-4xl">
            Payment Success
          </h1>
          <h1 className="rounded-md bg-green-500 px-4 py-2 font-medium text-white md:text-lg">
            PAID {amount} {currency}
          </h1>

          <Link href="/dashboard">
            <button className="relative mt-8 overflow-hidden rounded-md border bg-[#6A6EF6] px-4 py-2 text-base text-white transition-all duration-300 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-white/20 before:to-transparent before:transition-transform before:duration-300 hover:scale-105 hover:shadow-lg hover:before:translate-x-full active:scale-95">
              <span className="relative z-10">Go To Dashboard</span>
            </button>
          </Link>
        </>
      ) : (
        <>
          <AnimationFailed />
          <h1 className="mb-4 text-4xl font-semibold text-red-500">
            Payment Failed
          </h1>
          <h1 className="rounded-md bg-red-500 px-4 py-2 text-lg font-medium text-white">
            FAILED TO PAY {amount} {currency}
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="relative mt-8 overflow-hidden rounded-md border bg-[#6A6EF6] px-4 py-2 text-base text-white transition-all duration-300 before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-white/20 before:to-transparent before:transition-transform before:duration-300 hover:scale-105 hover:shadow-lg hover:before:translate-x-full active:scale-95"
          >
            <span className="relative z-10">Go To Dashboard</span>
          </button>
        </>
      )}
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="my-12 flex h-full w-full items-center justify-center">
          <p className="inline-block h-24 w-24 animate-spin rounded-full border-[3px] border-gray-100 border-t-[#6A6EF6]" />
        </div>
      }
    >
      <PaymentSuccess />
    </Suspense>
  );
};

export default Page;
