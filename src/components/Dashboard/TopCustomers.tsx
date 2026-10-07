'use client';

import React from 'react';
import { ClipboardList } from 'lucide-react';

const avatars = [
	'/images/admin/role/dummyuser1.svg',
	'/images/admin/role/dummyuser2.svg',
	'/images/admin/role/dummyuser3.svg',
];

const TopCustomers = () => {
	return (
		<div className="relative h-full min-h-[280px] rounded-2xl overflow-hidden">
			{/* Background Image */}
			<img
				src="/images/top_customer.png"
				alt=""
				className="w-full h-full object-cover"
			/>

			{/* Content overlay */}
			<div className="absolute inset-0 flex flex-col justify-between p-6">
				{/* Top Section: Top Customers with Avatar Stack */}
				<div className="flex items-center justify-between">
					<div>
						<p className="text-white/70 text-sm font-medium mb-1">Top Customers</p>
						<p className="text-white text-4xl font-bold leading-none">82%</p>
						<p className="text-white/60 text-xs mt-1">Success Rate</p>
					</div>

					<div className="flex items-center gap-3">
						{/* Avatar stack */}
						<div className="flex -space-x-3">
							{avatars.map((src, i) => (
								<img
									key={i}
									src={src}
									alt={`Customer ${i + 1}`}
									className="w-10 h-10 rounded-full border-2 border-white object-cover"
								/>
							))}
							{/* +4 badge */}
							<div className="w-10 h-10 rounded-full border-2 border-white bg-purple-500/80 flex items-center justify-center">
								<span className="text-white text-[11px] font-semibold">+4</span>
							</div>
						</div>

						{/* Clipboard icon button */}
						<div className="w-10 h-10 rounded-full border-2 border-yellow-400 flex items-center justify-center">
							<ClipboardList className="text-yellow-400" size={18} />
						</div>
					</div>
				</div>

				{/* Bottom Section: Recently Paid */}
				<div className="flex items-end justify-between">
					<div>
						<p className="text-white/70 text-sm font-medium mb-1">Recently Paid</p>
						<p className="text-white text-4xl font-bold leading-none">1.4k</p>
						<div className="flex items-center gap-2 mt-1">
							<p className="text-white/60 text-xs">No. of Invoice</p>
							<div className="flex items-center gap-1">
								<div className="w-2 h-2 rounded-full bg-yellow-400"></div>
								<span className="text-yellow-400 text-xs font-semibold">+15%</span>
							</div>
						</div>
					</div>

					{/* Decorative wave line */}
					<svg
						viewBox="0 0 150 60"
						className="w-32 h-16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						preserveAspectRatio="none"
					>
						<path
							d="M0 40 Q30 10, 60 30 T120 30 Q135 25, 150 35"
							stroke="url(#wave-gradient)"
							strokeWidth="4"
							strokeLinecap="round"
						/>
						<defs>
							<linearGradient id="wave-gradient" x1="0" y1="0" x2="150" y2="0" gradientUnits="userSpaceOnUse">
								<stop offset="0%" stopColor="#ec4899" />
								<stop offset="100%" stopColor="#facc15" />
							</linearGradient>
						</defs>
					</svg>
				</div>
			</div>
		</div>
	);
};

export default TopCustomers;
