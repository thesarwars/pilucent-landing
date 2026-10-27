import Image from 'next/image';
import React from 'react';

const Offers = () => {
	return (
		<div>
			<div className="container mx-auto px-4 py-16 max-w-7xl">
				{/* Main Heading */}
				<h1 className="header_3 font-bold text-center mb-12 mx-auto w-full lg:w-[636px]">
					Offers Advanced Features For Enhanced Experience
				</h1>

				{/* Feature Tabs */}
				<div className="flex flex-wrap justify-center gap-4 mb-20">
					<button className="px-6 py-2 paragraph_3 border-2 border-[#202020] rounded-sm bg-pink-100 hover:bg-pink-200 text-black">
						Invoicing
					</button>
					<button className="px-6 py-2 paragraph_3 border-2 border-[#202020] rounded-sm bg-green-100 hover:bg-green-200 text-black">
						Payroll
					</button>
					<button className="px-6 py-2 paragraph_3 border-2 border-[#202020] rounded-sm bg-orange-100 hover:bg-orange-200 text-black">
						Accounting
					</button>
					<button className="px-6 py-2 paragraph_3 border-2 border-[#202020] rounded-sm bg-gray-100 hover:bg-gray-200 text-black">
						Payments
					</button>
					<button className="px-6 py-2 paragraph_3 border-2 border-[#202020] rounded-sm bg-blue-100 hover:bg-blue-200 text-black">
						Reports
					</button>
				</div>

				{/* Feature Content */}
				<div className="grid md:grid-cols-2 gap-12 items-center">
					<div className="space-y-6 w-full lg:w-[545px] mx-auto">
						<h2 className="header_1 font-bold">
							Invoicing
						</h2>
						<h3 className="paragraph_4 text-[#202020] font-semibold">
							Know Where Your Money Is Going
						</h3>
						<p className="text-[#595959] paragraph_5">
							Invoicing is the process of creating and sending itemized bills to clients or customers for goods or services provided. It ensures accurate record-keeping, tracks payments, and establishes a professional impression. Modern invoicing solutions offer automation, customization, and secure payment options, streamlining the billing process for businesses of all sizes.
						</p>
						<button className="px-10 py-2 paragraph_3 border-2 border-[#202020] rounded-sm bg-pink-100 hover:bg-pink-200 text-black">
							Invoicing
						</button>
					</div>
					<div className="relative aspect-[4/3] w-full">
						<div className="absolute inset-0 bg-pink-50 rounded-3xl p-4">
							<div className="relative w-full h-full">
								<Image
									src="/invoice.png"
									alt="Invoicing interface"
									className="object-contain rounded-2xl"
									priority
								/>
							</div>
						</div>
					</div>

				</div>
			</div>
		</div>
	);
};

export default Offers;