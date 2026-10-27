"use client";
import React, { useState } from 'react';
import { FaArrowCircleUp, FaArrowCircleDown } from "react-icons/fa";



const CollapsibleSections = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    // Sample data
    const sections = [
        {
            title: "What is Balanzify’s main purpose?",
            content:
                "Balanzify's main purpose is to simplify financial management by offering tools for tracking, reporting, and organization.",
        },
        {
            title: "Can Balanzify assist with tax preparation?",
            content:
                "Yes, Balanzify streamlines tax preparation by tracking expenses, organizing receipts, and generating accurate financial reports effortlessly.",
        },
        {
            title: "Does Balanzify offer invoice tracking features?",
            content:
                "AYes, Balanzify provides efficient invoice tracking, enabling businesses to manage billing, monitor payments, and maintain financial accuracy.",
        },
        {
            title: "Is Balanzify suitable for small businesses?",
            content:
                "Yes, Balanzify is specifically designed to meet small businesses' needs, offering simple, effective tools for managing finances efficiently.",
        },
    ];

    const toggleSection = (index) => {
        setActiveIndex(index === activeIndex ? 0 : index);
    };

    return (
        <div className="max-w-3xl mt-10 border-b-[6px] border-r-[6px] border-t-2 border-l-2 border-secondary_text rounded-xl bg-white ">
            {sections.map((section, index) => (
                <div
                    key={index}
                    className="border-b border-secondary_text last:border-none "
                >
                    <div
                        onClick={() => toggleSection(index)}
                        className="flex justify-between items-center px-8 py-4 cursor-pointer rounded-t-xl rounded-b-xl bg-white"
                    >
                        <h2 className="text-title_md text-secondary_text">
                            {section.title}
                        </h2>
                        <div className="">
                            {activeIndex === index ? <FaArrowCircleUp className='h-6 w-6' /> : <FaArrowCircleDown className='h-6 w-6' />}
                        </div>
                    </div>

                    {activeIndex === index && (
                        <div className="px-8 py-4 text-primary_text bg-gray-50">
                            {section.content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CollapsibleSections;