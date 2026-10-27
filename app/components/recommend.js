'use client';
import Image from 'next/image';
import React from 'react';
import { FaStar } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Navigation } from 'swiper/modules';
import { MdOutlineArrowBackIos, MdOutlineArrowForwardIos } from 'react-icons/md';
import { useRouter } from 'next/navigation';

const Recommend = () => {
    const router = useRouter();
    const testimonials = [
        {
            rating: 5.0,
            text: "Balanzify streamlined our payroll and accounting—it’s like having a full finance team for a fraction of the cost.",
            author: 'Emily T.',
            role: 'CEO',
        },
        {
            rating: 5.0,
            text: "AI automation has saved us hundreds of hours and improved accuracy across the board.",
            author: 'Jason R.',
            role: 'Entrepreneur',
        },
        {
            rating: 5.0,
            text: "We cut accounting costs by 70% while getting even better financial insights—Balanzify is a game changer.",
            author: 'Mike L.',
            role: 'Founder',
        },
    ];

    return (
        <div className="container mx-auto py-16 px-4 md:px-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-center font-semibold md:py-8">
                Your Entire Financial Workflow—Automated
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Card */}
                <div className="rounded-2xl p-6 md:p-8 bg-[#F3F4FF] border border-[#6A6EF6]">
                    <div className="space-y-6 h-full flex flex-col justify-between">
                        <div className="space-y-3">
                            <h3 className="text-3xl md:text-4xl font-bold">556hrs</h3>
                            <p className="text-[#7E84A3] text-sm md:text-base">
                            Save up to 556 hours each year by using Balanzify
                            </p>
                        </div>
                        <div className="flex items-center justify-between mt-6">
                            <button onClick={() => router.push('/demo')} className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white py-2 px-4 md:py-2.5 md:px-5 rounded-lg transition-colors">
                                Get Demo
                            </button>
                            <div className="flex items-center gap-2 md:gap-3">
                                <button className="swiper-button-prev border border-[#A1A7C4] p-2 md:p-3 rounded-full hover:bg-gray-100 transition-colors">
                                    <MdOutlineArrowBackIos className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                                </button>
                                <button className="swiper-button-next border border-[#A1A7C4] p-2 md:p-3 rounded-full hover:bg-gray-100 transition-colors">
                                    <MdOutlineArrowForwardIos className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testimonials Slider */}
                <div className="md:col-span-2">
                    <Swiper
                        modules={[Navigation]}
                        navigation={{
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        }}
                        slidesPerView={1}
                        spaceBetween={16}
                        loop={true}
                        breakpoints={{
                            640: {
                                slidesPerView: 1,
                                spaceBetween: 16,
                            },
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 16,
                            },
                            1024: {
                                slidesPerView: 2,
                                spaceBetween: 24,
                            },
                        }}
                        className="h-full"
                    >
                        {testimonials.map((testimonial, index) => (
                            <SwiperSlide key={index}>
                                <div className="h-full rounded-2xl p-6 bg-[#F3F4FF]">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-[#A1A7C4] pb-4">
                                            <span className="font-semibold">{testimonial.rating.toFixed(1)}</span>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar key={i} className="h-4 w-4 text-[#EFA241]" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm md:text-base line-clamp-4">
                                            {testimonial.text}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden">
                                                <Image
                                                    src="/users.png"
                                                    alt={testimonial.author}
                                                    width={40}
                                                    height={40}
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm md:text-base">{testimonial.author}</p>
                                                <p className="text-xs md:text-sm text-gray-500">{testimonial.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    );
};

export default Recommend;