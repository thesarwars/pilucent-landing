import BoxWrapper from "@/components/Pages/Company/BoxWrapper";
import Button from "@/components/Pages/Company/ui/Button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <BoxWrapper className=" bg-accent_bg_light_blue mt-12 md:pl-[71px] font-lexend p-4 md:pr-[60px] pb-9 pt-[57px] flex flex-col-reverse md:flex-row justify-between">
      <div className=" md:w-[50%] flex-grow flex-1 flex-col mb-8">
        <h1 className="max-md:hidden font-bold text-accent_soft_blue text-xl md:text-[48px] text-wrap leading-[74.88px] tracking-[1%]">
          Let&apos;s Get you Set Up &<br />
          Running
        </h1>
        <h1 className="md:hidden font-bold text-accent_soft_blue text-xl md:text-[48px] w-full my-4 md:leading-[74.88px] md:tracking-[1%]">
          {"Let's"} Get you Set Up & Running
        </h1>
        <p className=" text-accent_text_slate text-[24px] leading-[29px] tracking-[1%] mb-12">
          Create your company profile
        </p>
        <Link href="/company/setup">
          <Button className=" w-[142px]">Get Started</Button>
        </Link>
      </div>
      <Image
        className="flex w-full md:w-[50%] md:max-w-[564px] md:max-h-[356px] h-auto"
        src="/images/company/get_started.png"
        width={564}
        height={356}
        alt="company"
      />
    </BoxWrapper>
  );
};

export default page;
