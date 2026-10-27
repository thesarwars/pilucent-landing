"use client";
import React from 'react';
import { FaStar } from "react-icons/fa";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Hero = () => {
	const { push } = useRouter();

    return (
        <>
            <div className="h-auto lg:h-[634px] bg-[#F5F8FF] ">
                {/* Hero Section */}
                <div className="container mx-auto">
                    <div className="py-16 flex flex-col lg:flex-row justify-between items-center h-full">
                        {/* Left Section */}
                        <div className="max-w-[650px] mb-8 lg:mb-0">
                            <div className="space-y-8">
                                {/* Trustpilot Rating */}
                                <div className="flex items-center space-x-2">
                                    <FaStar className="h-5 w-5 fill-green-600 text-green-600" />
                                    <span className="paragraph_3 text-[#1E1E1E]">Trustpilot</span>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <span className="text-[#334155]">4900+ 5 Stars</span>
                                </div>

                                {/* Easy Transactions Badge */}
                                <div className="inline-block bg-[#E8FFE9] px-5 border-2 border-[#202020] py-2 text-sm transform rotate-[5deg] shadow-md paragraph_3 rounded-sm">
                                    Easy Transactions
                                </div>

                                {/* Hero Text */}
                                <div className="space-y-6">
                                    <h1 className="xl:text-[48px] xl:leading-9 md:!header_3 paragraph_4 font-bold !leading-10">
                                        <span className='header_2'>Take Control Of</span><br />
                                        <span className="md:mt-2 xl:text-[48px] xl:leading-9 inline-block bg-[#FFD7C3] md:px-4 px-2 py-2 border border-black rounded-lg transform rotate-[-8deg] shadow-md md:header_3 paragraph_4">
                                            Finances
                                        </span>{" "}
                                        <span className='header_2'>With Confidence</span>
                                    </h1>
                                    <p className="text-[#595959] paragraph_2 text-base sm:text-lg lg:text-xl sm:max-w-[80%]">
                                        Gain Financial Clarity With Balanzify's Tools For Tracking Expenses,
                                        Managing Payments, And Creating Detailed Reports Effortlessly And
                                        Accurately.
                                    </p>
                                </div>

                                {/* CTA Buttons */}
                                <div className="relative sm:max-w-[80%]">
                                    {/* Foreground Box */}
                                    <div className="z-40 bg-white flex justify-between flex-wrap md:gap-4 gap-2 border-2 border-black w-full py-2 md:px-3 px-2 rounded-lg relative sm:px-2 sm:py-2">
                                        <button onClick={() => push('/launching')} className="md:px-6 px-2 md:py-3 py-2 text-black rounded-lg text-base sm:px-4 sm:py-2 sm:text-sm paragraph_3">
                                            Get Started Now
                                        </button>
                                        <button onClick={() => push('/launching')} className="md:px-6 px-2 md:py-3 py-2 bg-[#FFD7E0] text-black rounded-lg hover:bg-[#FFD7E0] border-2 border-black paragraph_6 sm:px-4 sm:py-2 sm:text-sm">
                                            Try For Free
                                        </button>
                                    </div>
                                    {/* Background Shadow Box */}
                                    <div className="z-10 flex justify-between flex-wrap gap-4 border-2 border-black w-full h-full rounded-lg absolute -bottom-1 left-1 sm:px-2"></div>
                                </div>

                            </div>
                        </div>

                        {/* Right Section - Hero Image */}
                        <div className="relative w-full lg:w-auto">
                            <div className="flex justify-center lg:justify-end">
                                <Image
                                    src="/hero.png"
                                    alt="Financial Management Illustration"
                                    width={600}
                                    height={400}
                                    className="w-full h-auto max-w-md lg:max-w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-black h-16 flex items-center justify-center">
                <div className="container">
                    <div className="flex items-center justify-center">
                        <div className="border border-white w-full h-0.5"></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Hero;