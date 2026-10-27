import Image from 'next/image';
import React from 'react';

const MainFeatureSection = ({ data }) => {
    return (
        <div className='container mx-auto px-4'>
            <div className='grid md:grid-cols-2 grid-cols-1 gap-16 justify-center items-center py-12 bg-bg_gray rounded-[24px] px-5'>
                {/* in there one site is some text and button and other is image */}
                <div>
                    <h1 className='text-h3'>{data?.features?.main?.title}</h1>
                    <p className='text-p1 text-body_text_2 mt-4'>{data?.features?.main?.description}</p>
                    <button className='bg-primary_btn text-text_blue font-bold px-4 py-2 mt-6 rounded-md'>Get demo</button>
                </div>
                <div className=''>
                    <Image src={data?.features?.main?.image} alt='hero' width={500} height={500} className='rounded-[16px] w-full h-full' />
                </div>
            </div>

            <div className='grid md:grid-cols-2 grid-cols-1 gap-5 justify-center items-stretch py-12 '>
                <div className='flex flex-col bg-[#FFFEE2] p-6 rounded-[24px] gap-5 flex-1'>
                    <h4 className='text-h3'>{data?.features?.secondary_1?.title}</h4>
                    <p className='text-p1 text-body_text_2 mt-4'>{data?.features?.secondary_1?.description}</p>
                    <Image src={data?.features?.secondary_1?.image} alt='hero' width={500} height={200} className='rounded-xl w-full h-full mt-3' />
                </div>
                <div className='flex flex-col bg-[#FFDBEE] p-6 rounded-[24px] gap-5 flex-1'>
                    <h4 className='text-h3'>{data?.features?.secondary_2?.title}</h4>
                    <p className='text-p1 text-body_text_2 mt-4'>{data?.features?.secondary_2?.description}</p>
                    <Image src={data?.features?.secondary_2?.image} alt='hero' width={500} height={200} className='rounded-xl w-full h-full mt-3' />
                </div>
            </div>

        </div>
    );
};

export default MainFeatureSection;