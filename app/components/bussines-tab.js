"use client";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const BussinesTab = () => {
    const [selectedFeature, setSelectedFeature] = useState(null);
    const router = useRouter();
    const tabs = [
        {
            slug: "invoice",
            head: "Invoicing",
        },
        {
            slug: "expense",
            head: "Expenses",
        },
        {
            slug: "time-tracking",
            head: "Time Tracking",
        },
        {
            slug: 'payments',
            head: 'Payments',
        },
        {
            slug: 'accounting',
            head: 'Accounting',
        },
        {
            slug: 'Reports',
            head: 'Reports',
        },
        {
            slug: 'payroll',
            head: 'Payroll',
        }
    ];

    const onTabClick = (slug) => {
        router.push(`/features/${slug}`);
    };

    return (
        <section className=" text-center py-12">
            <div className="container mx-auto px-4">
                {/* Tabs */}
                <div className="flex flex-wrap justify-center mt-8 gap-2">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            onClick={() => onTabClick(tab?.slug)}
                            className={`px-4 py-2 border border-[#7E84A3] text-[#7E84A3] rounded-md font-medium hover:bg-[#00035F] hover:text-white transition duration-200 ${selectedFeature?.slug === tab?.slug ? 'bg-[#00035F] !text-white' : ''}`}
                        >
                            {tab.head}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BussinesTab;