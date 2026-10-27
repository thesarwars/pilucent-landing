'use client'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FaArrowUp } from 'react-icons/fa';

const Offer = () => {
    const { push } = useRouter();

    const categories = [
        {
            title: "Freelancers",
            link: "For Freelancers",
            href: "/business",
            description: "AI-powered invoicing and bookkeeping to streamline your workflow."
        },
        {
            title: "Solopreneurs",
            link: "For Solopreneurs",
            href: "/business",
            description: "Simplify your finances with AI-driven accounting."
        },
        {
            title: "Businesses with Contractors",
            link: "Businesses with Contractors",
            href: "/business",
            description: "Keep track of payments and taxes effortlessly."
        },
        {
            title: "Businesses with Employees",
            link: "Businesses with Employees",
            href: "/business",
            description: "AI-driven payroll and financial automation."
        }
    ]

    return (
        <section>
            {/* Categories Section */}
            <div className="bg-[#5A5FEE] px-4 py-16">
                <div className="container mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
                        Designed for Every Business Type
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                className="bg-[#D6E4FF] backdrop-blur-sm rounded-2xl p-6 transition-colors"
                            >
                                <h3 className="text-xl font-bold text-[#131523] mb-3">
                                    {category.title}
                                </h3>
                                <p className="text-[#5A607F] mb-4">
                                    {category.description}
                                </p>
                                <a
                                    href={category.href}
                                    className="inline-flex items-center text-[#6A6EF6] font-bold underline"
                                >
                                    {category.link} <FaArrowUp className="ml-1 h-4 w-4" />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonial Section */}
            <div className="bg-[#FFFEE2] rounded-2xl p-8 md:p-12">
                <div className="container mx-auto lg:px-20">
                    <div className="flex gap-x-8 lg:flex-row flex-col items-center">

                        <img
                            src="/image3.png"
                            alt="Testimonial"
                            className="object-cover rounded-xl"
                        />
                        <div className="space-y-4">
                            <img src='/quotes.png' alt="Quote" />
                            <blockquote className="text-xl md:text-2xl text-[#5A607F]">
                                "We're basically saving $2000 a month. And that doesn't include all the things that we were able to do in place of all that admin."
                            </blockquote>
                            <div className="space-y-1">
                                <p className="font-bold text-[#5A607F]">Alice Aedy</p>
                                <p className="text-gray-600">Co-Founder & CEO of Earthrich</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Offer;