import React from 'react';

const FeaturesTestimonial = () => {
    return (
        <div className="bg-[#F5F6FA] rounded-2xl p-8 md:p-12">
            <div className="container mx-auto lg:px-20">
                <div className="flex gap-20 lg:flex-row flex-col items-center">

                    <img
                        src="/testimo.png"
                        alt="Testimonial"
                        className=" rounded-[24px] border-t-[16px] border-l-[16px] border-[#6A6EF6] "
                    />
                    <div className="space-y-4">
                        <img src='/quotes.png' alt="Quote" />
                        <blockquote className="text-xl md:text-2xl text-[#5A607F]">
                            "We're basically saving $2000 a month. And that doesn't include all the things that we were able to do in place of all that admin."
                        </blockquote>
                        <div className="space-y-1">
                            <p className="font-bold text-[#5A607F]">Cody Fisher</p>
                            <p className="text-gray-600">Founder</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturesTestimonial;