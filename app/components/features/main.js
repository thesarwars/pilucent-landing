'use client'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

const MainSection = ({ data }) => {
    const router = useRouter();
    return (
        <div className='container mx-auto px-4'>
            <div className='grid md:grid-cols-2 grid-cols-1 gap-5 justify-center items-center py-12'>
                {/* in there one site is some text and button and other is image */}
                <div>
                    <h1 className='text-h2 font-bold'>{data?.title}</h1>
                    <p className='text-p1 text-body_text_2 mt-4'>{data?.description}</p>
                    <button onClick={() => router.push('/demo')} className='bg-primary_btn text-text_blue font-bold px-4 py-2 mt-6 rounded-md'>Get free demo</button>
                </div>
                <div className=''>
                    <Image src={data?.image} alt='hero' width={500} height={500} className='rounded-[16px] w-full h-full border-[#C1C3F4] border-4' />
                </div>
            </div>
        </div>
    );
};

export default MainSection;