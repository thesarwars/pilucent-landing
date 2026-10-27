import Image from 'next/image';
import React from 'react';
import { FaGlobe } from 'react-icons/fa';

const Analysis = () => {
    return (
        <div className=''>
            <div className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Countries Card - 4 columns */}
                    <div className="md:col-span-3">
                        <div className="bg-[#6366F1] rounded-3xl p-8 h-full">
                            <FaGlobe className="w-8 h-8 text-white mb-6" />
                            <div className="space-y-3 lg:mt-24">
                                <h3 className="text-4xl font-bold text-white">5+</h3>
                                <p className="text-white text-lg leading-relaxed">
									People in over 5 Countries Have used Balanzify
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards Column - 4 columns */}
                    <div className="md:col-span-4 space-y-8">
                        {/* Small Business Card */}
                        <div className="bg-[#E6E9F4] rounded-3xl p-8">
                            <div className="space-y-3">
                                <h3 className="text-4xl font-bold text-gray-900">5 Thousands</h3>
                                <p className="text-gray-600 text-lg">
                                    5K small businesses have been using Balanzify
                                </p>
                            </div>
                        </div>

                        {/* Savings Card */}
                        <div className="bg-[#E6E9F4] rounded-3xl p-8">
                            <div className="space-y-3">
                                <h3 className="text-4xl font-bold text-gray-900">$8000</h3>
                                <p className="text-gray-600 text-lg">
									Save up to $8000 in billable hours every year
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Image Card - 4 columns */}
                    <div className="md:col-span-5">
                        <div className="rounded-3xl overflow-hidden h-full relative">
                            <Image
                                src="/image2.png"
                                alt="Professional using Balanzify"
                                width={500}
                                height={500}
                                className="rounded-3xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;