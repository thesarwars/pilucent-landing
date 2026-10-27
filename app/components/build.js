'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

const Build = () => {
    const router = useRouter();
    return (
        <div className="bg-[#000235] py-28 relative overflow-hidden">
            {/* Wave-like background pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="w-full h-[700px] bg-[url('/banner.png')] bg-cover bg-center" />
            </div>
            
            <div className="relative z-10 container mx-auto px-4 text-center">
                <h1 className="text-white text-4xl md:text-5xl font-bold mb-6">
                    Let's build your business together
                </h1>
                
                <button onClick={() => router.push('/demo')} className="bg-[#4CAF50] text-white px-8 py-2.5 rounded-md text-lg font-medium mb-6 hover:bg-[#45a049] transition-colors">
                    Book Demo
                </button>
                
                <div>
                    <a href="#" className="text-white/80 hover:text-white underline text-sm">
                        Important offers, pricing details, and disclaimers
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Build;