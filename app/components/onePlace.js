import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { MdOutlineArrowOutward } from 'react-icons/md'

const OnePlace = () => {
    return (
        <div className="py-12">
            <div className="container mx-auto py-[120px]">
                <div className='grid grid-cols-1 md:grid-cols-2 gap-5 font-inter'>
                    <div className='space-y-4'>
                        <div className="">
                            <h1 className="text-[44px] font-semibold mb-2 font-sfPro">
                                Why Businesses Choose Balanzify ?
                            </h1>
                            <p className="text-base font-medium text-[#A1A7C4]">
                            Balanzify simplifies financial management with AI-driven automation. It streamlines payroll, tax filing, and compliance while handling accounting tasks like reconciliations and expense tracking. Gain valuable cash flow insights, optimize expenses, and prevent financial risks effortlessly. Plus, automate inventory, fraud detection, and workforce management—all in one seamless, intelligent platform.
                            </p>
                        </div>
                        <div className="bg-[#D3D5FF] p-6 rounded-3xl">
                            <div className="mb-8">
                                <h2 className="text-[24px] font-bold mb-4">More Features</h2>
                                <div className="space-y-2 grid grid-cols-2">
                                    {[
                                        { name: 'Standard report' },
                                        { name: 'Payroll' },
                                        { name: 'Estimation' },
                                        { name: 'Payslip' },
                                        { name: 'HR' },
                                        { name: 'Three & agency' },
                                        { name: 'Journal' },
                                        { name: 'Supplier Management' }
                                    ].map((feature) => (
                                        <div key={feature.name} className="flex text-base font-bold items-center text-blue-600 hover:text-blue-700">
                                            <span>{feature.name}</span>
                                            <MdOutlineArrowOutward size={24} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <OnePlaceCard title="Sales on Autopilot" description="Optimize your sales process with AI-driven insights, automated invoicing, and seamless payment tracking—all in one place." link="Lean More" href="#" bgColor="#D3F9E5" image="/one_2.png" />
                    </div>
                    <div className='space-y-4'>
                        <OnePlaceCard title="Smart Bank Transactions" description="Automatically categorize and reconcile transactions, track payments in real time, and simplify financial management with AI-driven automation." link="Lean More" href="#" bgColor="#FFDBEE" image="/one_1.png" />
                        <div className="bg-[#00035F] rounded-3xl flex md:flex-row flex-col text-white">
                            <div className='p-6 lg:w-[60%]'>
                                <h2 className="text-[24px] font-semibold mb-3 font-sfPro">AI-Powered Expense Tracking</h2>
                                <p className="text-white text-base mb-2">
                                Say goodbye to manual entry—capture, categorize, and analyze expenses effortlessly with intelligent automation.
                                </p>
                                <Link href={"#"} className="flex text-base font-bold items-center text-[#6A6EF6] hover:text-blue-700">
                                    <span>{'Lean More'}</span>
                                    <MdOutlineArrowOutward size={20} />
                                </Link>
                            </div>
                            <div className='flex justify-end pt-6 w-[45%]'>
                                <img src={'/one_3.png'} alt="one-place" className='object-contain'  />
                            </div>
                        </div>
                        <OnePlaceCard title="Instant Invoicing" description="Create, customize, and send invoices in minutes. Automate recurring payments, tax calculations, and payment reminders for faster payouts." link="Lean More" href="#" bgColor="#FFFEE2" image="/one_1.png" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OnePlace

const OnePlaceCard = ({ title, description, link, href, bgColor, image, className }) => {
    return (
        <div className={`rounded-3xl ${className}`} style={{ backgroundColor: bgColor }}>
            <div className='p-6'>
                <h2 className="text-[24px] font-semibold mb-3 font-sfPro">{title}</h2>
                <p className="text-[#5A607F] text-base font-medium mb-2">
                    {description}
                </p>
                <Link href={href || "#"} className="flex text-base font-bold items-center text-[#6A6EF6] hover:text-blue-700">
                    <span>{link}</span>
                    <MdOutlineArrowOutward size={20} />
                </Link>
            </div>
            <div className='px-6 flex justify-end'>
                <Image className='w-[85%]' src={image} alt="one-place" width={500} height={500} />
            </div>
        </div>
    )
}