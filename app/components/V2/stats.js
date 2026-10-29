import React from 'react';



const stats = [
	{ value: "$401", label: "Saved per month vs. the alternative stack" },
	{ value: "6 hrs", label: "Average month-end close (was 4 days)" },
	{ value: "1 Day", label: "Average time to go fully live" },
	{ value: "5 to 1", label: "Tools replaced by Pilucent" },
];

const Stats = () => {
	return (
		<div className="max-w-5xl">
			{/* Stat cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
					{stats.map((stat, idx) => (
						<div
							key={stat.value}
							className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 animate-fade-in-up"
							style={{ animationDelay: `${400 + idx * 80}ms` }}
						>
							<p className="text-[#F9F9F9] text-3xl sm:text-4xl font-semibold leading-none mb-3">
								{stat.value}
							</p>
							<p className="text-white/55 text-xs sm:text-[13px] leading-relaxed">{stat.label}</p>
						</div>
					))}
				</div>
		</div>
	);
};

export default Stats;