import React from 'react';

const Features = () => {
	return (
		<div className='lg:max-h-[680px]'>
			<div className="bg-[#FFF6F7] py-12 px-6">
				<div className="max-w-[1320px] mx-auto">

					<div className="max-w-[636px] mx-auto">
						<div className="font-bold mb-8 flex items-center justify-center text-center relative">
							<img src='/star.png' alt='star' className='h-14 w-14 absolute -left-4 top-[-1rem]' />
							<h3 className='header_1 mt-3 pl-8'>
								Contains Modern Features For Better Experience
							</h3>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						<div className="bg-white shadow-lg p-6 rounded-md border border-[#202020] box-shadow duration-500 cursor-pointer">
							<div className=" rounded-full w-12 h-12 flex items-center justify-center mb-4 text-pink-500">
								<img src='/f2.png' alt='f1' className='h-10 w-10' />
							</div>
							<div className="py-4">
								<h3 className="paragraph_4 text-[#202020] mb-2">Payroll</h3>
								<p className="text-[#595959] paragraph_1">Streamline payroll processing effortlessly with accurate, secure, and efficient solutions.</p>
							</div>
						</div>

						<div className="bg-white shadow-lg p-6 rounded-md border border-black box-shadow duration-500 cursor-pointer">
							<div className=" rounded-full w-12 h-12 flex items-center justify-center mb-4 text-pink-500">
								<img src='/f1.png' alt='f1' className='h-10 w-10' />
							</div>
							<h3 className="paragraph_4 text-[#202020] mb-2">HRIS</h3>
							<p className="text-[#595959] paragraph_1">Optimize workforce management with integrated, intuitive, and scalable HRIS solutions.</p>
						</div>


						<div className="bg-white shadow-lg p-6 rounded-md border border-black box-shadow duration-500 cursor-pointer">
							<div className=" rounded-full w-12 h-12 flex items-center justify-center mb-4 text-pink-500">
								<img src='/f3.png' alt='f1' className='h-10 w-10' />
							</div>
							<h3 className="paragraph_4 text-[#202020] mb-2">Invoice</h3>
							<p className="text-[#595959] paragraph_1">Generate and send professional invoices easily for efficient billing and payment processing.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Features;