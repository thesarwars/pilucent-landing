import Image from 'next/image';
import React from 'react';

const BussinessMain = () => {
    return (
        <div className='container mx-auto px-4'>
            <div className='grid md:grid-cols-2 grid-cols-1 gap-5 justify-center items-center py-12'>
                {/* in there one site is some text and button and other is image */}
                <div>
                    <h1 className='text-h2 font-bold'>Online Payments Seamlessly Link With Pilucent</h1>
                    <p className='text-p1 text-body_text_2 mt-4'>Pilucent Double-Entry Accounting gives you everything you need to stayorganized for tax time, stay compliant with regulations, and make decisions basedon up-to-date insights. And with a customizable Chart of Accounts, you can keep track of every number as your business grows.</p>
                    <button className='bg-primary_btn text-text_blue font-bold px-6 py-3 mt-6 rounded-md'>Try It Free </button>
                </div>
                <div className=''>
                    <Image src="/bus_main.png" alt='hero' width={500} height={500} className='rounded-[16px] w-full h-full border-[#C1C3F4] border-[10px]' />
                </div>
            </div>
        </div>
    );
};

export default BussinessMain;