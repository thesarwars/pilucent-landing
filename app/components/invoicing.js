'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaGlobe } from 'react-icons/fa';
import PhilosophySection from './about/philoshphy';
import Testimonial from './testimonial';
import Faq from './faq';
import Build from './build';
import Analysis from './analysis';

const Invoicing = () => {
	const router = useRouter();

	return (
		<>
			<div className="container mx-auto p-4">
				{/* Header Section */}
				<div className="pt-16">
					<div className="bg-[#D3D5FF] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center h-auto md:h-[170px] space-y-4 md:space-y-0">
						<h2 className="text-xl md:text-3xl font-bold text-[#131523] text-center md:text-left">
							More Reason To
							<br className="hidden sm:block" />
							Love Pilucent
						</h2>
						<div className="flex space-x-3">
							<button
								onClick={() => router.push('/demo')}
								className="bg-[#2CAA28] hover:bg-[#16A34A] text-white px-6 md:px-8 py-2 md:py-3 
							rounded-lg text-sm md:text-base font-bold transition-colors duration-200"
							>
								Get Demo
							</button>
							<button
								onClick={() => router.push('/demo')}
								className="bg-transparent text-[#2CAA28] border border-[#2CAA28] px-6 md:px-8 py-2 md:py-3 
							rounded-lg text-sm md:text-base font-bold transition-colors duration-200"
							>
								Sign up
							</button>
						</div>
					</div>
				</div>
				{/* Stats Grid */}
				<Analysis />
				
			</div>
			
		</>
	);
};

export default Invoicing;