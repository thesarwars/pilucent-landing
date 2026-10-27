'use client'
import Image from 'next/image';
import React from 'react';
import CollapsibleSections from './collapse';
import { useRouter } from 'next/navigation';


const ControlSection = () => {
	const { push } = useRouter();

    return (
        <div className=' bg-[#D9F7BE] border border-black border-t-2 border-b-2'>
            <div className="max-w-[1320px] mx-auto">
                <div className='flex flex-col md:flex-row gap-4 px-2.5'>
                    <div className="flex flex-col items-start py-10 md:block hidden">
                        <div className="max-w-[320px]">
                            <div className="text-6xl mb-6">
                                <Image
                                    src="/control.png"
                                    alt="Quote icon"
                                    width={395}
                                    height={360}
                                    className='object-cover'
                                />
                            </div>
                            <div className='absolute'>
                                <button onClick={() => push('/launching')}  className="px-8 py-2.5 border-2 border-black rounded-sm bg-[#FFD7E0]  text-black">
                                    Easy Transactions
                                </button>
                                <Image
                                    src="/net_profit.png"
                                    alt="Semicircle"
                                    width={245}
                                    height={190}
                                    className='hidden lg:block relative left-10 bottom-2' />
                            </div>
                        </div>
                    </div>
                    {/* i want to add a divider here between the two sections. */}
                    <div className="border-l-2 border-black h-auto xl:mx-24 lg:mx-10 md:block hidden"></div>

                    
                    <div className='md:px-0 px-2.5 py-14'>
                        <div className='flex flex-col md:flex-row justify-between items-center'>
                            <div className='flex flex-col gap-4 max-w-[480px]'>
                                <h3 className='text-5xl font-bold'>
                                    Software that
                                </h3>
                                <h3 className='text-5xl font-bold'>
                                    keeps you in control
                                </h3>
                            </div>
                            <div className='flex flex-col gap-4 md:mt-0 mt-5'>
                                <button onClick={() => push('/launching')}  className="px-8 py-2.5 border-2 border-black rounded-sm bg-[#F9C6B1] text-black">
                                    Easy Transactions
                                </button>
                                <button onClick={() => push('/launching')}  className="px-8 py-2.5 border-2 border-black rounded-sm bg-[#FFD7E0] text-black">
                                    Invoicing
                                </button>
                            </div>
                        </div>
                        <CollapsibleSections />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlSection;