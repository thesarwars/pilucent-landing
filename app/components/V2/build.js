import React from 'react';
import AnimateOnScroll from './AnimateOnScroll';

const Build = () => {
    return (
        <section className="relative bg-[#0B0919] py-8 sm:py-10 lg:py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <AnimateOnScroll
                    className="relative rounded-3xl overflow-hidden text-center px-6 py-12 sm:px-10 sm:py-16 lg:py-20"
                    style={{
                        backgroundImage: 'url(/V2/build_bg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#1E123F',
                    }}
                >
                    <div className="relative z-10 max-w-2xl mx-auto font-jakarta">
                        <p className="text-white/55 text-xs sm:text-sm tracking-wide mb-4">
                            Seamless Migration — Free with Every Plan
                        </p>

                        <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-semibold tracking-tight leading-snug sm:leading-[1.3] mb-5">
                            Your data. Fully migrated.<br className="hidden sm:block" /> In one afternoon.
                        </h2>

                        <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-8 max-w-xl mx-auto">
                            QuickBooks · Gusto · Excel · Bank statements · Inventory · All of it. Guaranteed.
                        </p>

                        <button className="bg-[#8B5CF6] text-white text-xs sm:text-sm font-semibold px-7 sm:px-9 py-3 rounded-full hover:bg-[#7c3aed] hover:scale-105 transition-all duration-300">
                            See How It Works
                        </button>
                    </div>
                </AnimateOnScroll>
            </div>
        </section>
    );
};

export default Build;
