"use client";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FaHeadphones, FaPlay } from 'react-icons/fa';


const Testimonial = () => {
    const router = useRouter();
    return (
        <div className="py-8">
            <div className="container">
                <div className="space-y-6">
                    <h2 className="text-2xl md:text-4xl font-bold text-center">
                        In your corner when you need us
                    </h2>

                    <div className="grid md:grid-cols-2 gap-3 py-4">
                        {/* Sales Card */}
                        <div className="">
                            <div className="rounded-3xl bg-[#00035F] text-white p-8">
                                <FaHeadphones className="w-12 h-12 mb-4" />
                                <h3 className="text-3xl font-bold mb-4">Talk to sales</h3>
                                <p className="mb-6 text-[#E1E1E1] text-sm">
                                    Give us a call if you need help picking a Pilucent product.
                                </p>
                                <button className="bg-[#4CAF50] text-white px-8 py-2.5 rounded-md text-sm font-medium mb-6 transition-colors">
                                    Call: +8801790048605
                                </button>
                                <p className="text-sm text-[#E1E1E1]">
                                24/7 , Anyime

                                </p>
                            </div>
                        </div>

                        {/* Support Hub Card */}
                        <div className="">
                            <div className="rounded-3xl bg-[#F2F2F2] p-8">
                                <FaPlay className="w-12 h-12 mb-4 text-[#00035F]" />
                                <h3 className="text-3xl font-bold mb-4 text-[#00035F]">
                                    Visit our support hub
                                </h3>
                                <p className="mb-6 text-[#A49191]">
                                    Find help articles, video tutorials, and connect with other businesses in our online community.
                                </p>
                                <div className="lg:space-x-4">
                                    <button onClick={() => router.push('/launching')} className="bg-[#4CAF50] text-white px-8 py-2.5 rounded-md font-bold text-sm mb-6 transition-colors">
                                        See resources
                                    </button>
                                    <button onClick={() => router.push('/launching')} className="bg-white border-[#4CAF50] border text-[#4CAF50] px-8 py-2.5 rounded-md font-bold text-sm mb-6 transition-colors">
                                        Need Help Signing In
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Testimonial;


