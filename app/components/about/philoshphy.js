import React from 'react';

const PhilosophySection = () => {
    const philosophyItems = [
        {
            icon: "/icon4.png",
            title: "Take Action",
            description: "Transform ideas into impactful solutions."
        },
        {
            icon: "/icon3.png",
            title: "Go Beyond",
            description: "Set new standards with AI-driven innovation."
        },
        {
            icon: "/icon2.png",
            title: "Enhance Experiences",
            description: "Design seamless, intuitive solutions for users."
        },
        {
            icon: "/icon2.png",
            title: "Consistency Matters",
            description: "Deliver outstanding service every single day."
        }
    ];

    return (
        <div className="pt-20 bg-white">
            <div className="container mx-auto px-4">
                {/* Philosophy Section */}
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold mb-8">Pilucent Philosophy</h2>
                    <div className="max-w-[780px]">
                        <p className="text-gray-600 mb-8 text-sm">
                            At Pilucent, we believe in action, innovation, and excellence. Turn ideas into impact, push boundaries with AI, create seamless user experiences, and deliver consistency daily. Together, we redefine financial management for a smarter future.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {philosophyItems.map((item, index) => (
                            <div key={index} className="p-4 rounded-lg transition-shadow">
                                <img src={item.icon} alt={item.title} className="w-8 h-8 mb-4" />
                                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                                <p className="text-[#7E84A3] text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Commitment Section */}
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center my-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">
                                Our Commitment to Diversity & Inclusivity and Belonging (DIBs)
                            </h2>
                            <p className="text-gray-600 mb-6">
							Pilucent is committed to fostering equitable opportunities and inclusive practices. Our DIBs Framework is built on three pillars: Our Team – A diverse workforce drives innovation.  Our Market – AI-driven solutions for businesses of all sizes.  Our Community – Supporting all businesses through AI-powered financial solutions.
                            </p>
                            <button className="bg-[#DED943] text-[#131523] px-6 py-2 rounded-md font-semibold hover:bg-[#F7D435]/90 transition-colors">
                                Learn More
                            </button>
                        </div>
                        <div className="relative">
                            <div className="rounded-2xl overflow-hidden shadow-lg">
                                <img
                                    src="/about2.png"
                                    alt="Diverse team members"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Decorative background element */}
                            <div className="absolute -z-10 top-4 right-4 w-full h-full bg-gray-100 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhilosophySection;