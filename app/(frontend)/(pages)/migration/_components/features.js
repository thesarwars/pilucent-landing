'use client'
import React from 'react'
import { GradientBadge } from '../../../../components/V2/review'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const dataItems = [
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <path d="M20 40C31.0432 40 40 31.0432 40 20C40 8.95678 31.0432 0 20 0C8.95678 0 0 8.95678 0 20C0 31.0432 8.95028 40 20 40Z" fill="white"/>
  <path d="M13.3311 12.2185C9.03469 12.2185 5.55078 15.7025 5.55078 19.9988C5.55078 24.2952 9.02819 27.7726 13.3311 27.7726H14.4426V24.8867H13.3311C10.6337 24.8867 8.44321 22.6963 8.44321 19.9988C8.44321 17.3014 10.6337 15.111 13.3311 15.111H16.0025V30.2231C16.0025 31.8155 17.296 33.109 18.8884 33.109V12.2185H13.3311ZM26.6688 27.7726C30.9651 27.7726 34.4491 24.2887 34.4491 19.9988C34.4491 15.709 30.9716 12.225 26.6688 12.225H25.5573V15.111H26.6688C29.3662 15.111 31.5566 17.3014 31.5566 19.9988C31.5566 22.6963 29.3662 24.8867 26.6688 24.8867H23.9973V9.7746C23.9973 8.18214 22.7039 6.88867 21.1114 6.88867V27.7726H26.6688Z" fill="black"/>
</svg>
		),
		title: 'QuickBooks Online',
		features: [
			'Connection: Direct API connection',
			'Chart of accounts — fully mapped',
			'Transaction history — years of data',
			'Customer and vendor lists',
			'Open invoices and bills',
			'Bank reconciliation history',
			'Journal entries and adjustments',
		],
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <path d="M20 40C31.0432 40 40 31.0432 40 20C40 8.95678 31.0432 0 20 0C8.95678 0 0 8.95678 0 20C0 31.0432 8.95028 40 20 40Z" fill="white"/>
  <path d="M13.3311 12.2185C9.03469 12.2185 5.55078 15.7025 5.55078 19.9988C5.55078 24.2952 9.02819 27.7726 13.3311 27.7726H14.4426V24.8867H13.3311C10.6337 24.8867 8.44321 22.6963 8.44321 19.9988C8.44321 17.3014 10.6337 15.111 13.3311 15.111H16.0025V30.2231C16.0025 31.8155 17.296 33.109 18.8884 33.109V12.2185H13.3311ZM26.6688 27.7726C30.9651 27.7726 34.4491 24.2887 34.4491 19.9988C34.4491 15.709 30.9716 12.225 26.6688 12.225H25.5573V15.111H26.6688C29.3662 15.111 31.5566 17.3014 31.5566 19.9988C31.5566 22.6963 29.3662 24.8867 26.6688 24.8867H23.9973V9.7746C23.9973 8.18214 22.7039 6.88867 21.1114 6.88867V27.7726H26.6688Z" fill="black"/>
</svg>
		),
		title: 'QuickBooks Desktop',
		features: [
			'Connection: File export (IIF and QBB)',
			'Full chart of accounts',
			'Complete transaction history',
			'Customer and vendor records',
			'Inventory items and quantities',
			'Open AR and AP balances',
		],
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <path d="M9.77466 6.48813C11.7018 4.06006 14.5438 2.43253 17.5583 2.08517C20.2521 1.74701 23.0399 2.42563 25.3243 3.94619C25.3232 3.46426 25.3232 2.98232 25.3243 2.50154C27.2138 2.50039 29.1033 2.50039 30.9928 2.50154C30.9939 9.13819 30.9928 15.7748 30.9939 22.4103C30.9684 23.9516 31.0658 25.4986 30.9032 27.0341C30.5071 30.571 28.5424 33.856 25.7082 35.8435C23.6251 37.3261 21.0807 38.0933 18.5573 37.9909C16.5505 37.9196 14.5758 37.2824 12.8589 36.2058C13.7815 34.492 14.7252 32.7909 15.6522 31.0805C16.9355 31.9052 18.4986 32.2629 19.991 31.9938C21.9513 31.6717 23.7102 30.3053 24.5864 28.4569C25.1086 27.4091 25.29 26.2175 25.2634 25.0466C23.0222 26.5165 20.303 27.1756 17.6678 26.8743C14.2716 26.5177 11.0889 24.5302 9.15404 21.6121C7.67165 19.4118 6.90722 16.703 7.009 14.0196C7.09418 11.2822 8.0865 8.58955 9.77466 6.48813ZM17.8504 8.0087C15.9078 8.35375 14.1776 9.71904 13.3103 11.5559C12.5746 13.0914 12.4496 14.9317 12.9817 16.5581C13.505 18.2098 14.6931 19.6211 16.2009 20.3756C17.7143 21.1589 19.5419 21.2452 21.1216 20.6206C22.4303 20.1122 23.5609 19.1334 24.2855 17.8924C25.1849 16.3764 25.4416 14.4705 24.9891 12.7533C24.6052 11.2546 23.6826 9.91687 22.4502 9.04502C21.126 8.09036 19.4357 7.71539 17.8504 8.0087Z" fill="white"/>
</svg>
		),
		title: 'Gusto',
		features: [
			'Connection: Direct API connection',
			'Employee records and profiles',
			'Compensation and pay history',
			'Direct deposit information',
			'Tax withholding settings (W-4 data)',
			'PTO balances and accrual rules',
			'Historical payroll runs',
		],
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <path d="M31.068 2.72L28.618 0H9.324C7.932 0 7.394 1.032 7.394 1.838V9.098H10.1V3.306C10.1 2.998 10.36 2.738 10.66 2.738H24.466C24.77 2.738 24.922 2.792 24.922 3.042V12.682H34.748C35.134 12.682 35.284 12.882 35.284 13.174V36.714C35.284 37.206 35.084 37.28 34.784 37.28H10.66C10.5112 37.2764 10.3697 37.2151 10.2652 37.1092C10.1607 37.0032 10.1015 36.8608 10.1 36.712V34.56H7.412V37.95C7.376 39.15 8.016 40 9.324 40H36.12C37.52 40 37.998 38.986 37.998 38.062V10.374L37.298 9.614L31.068 2.72ZM27.672 3.04L28.446 3.908L33.638 9.614L33.924 9.96H28.618C28.218 9.96 27.9647 9.89333 27.858 9.76C27.7513 9.62933 27.6893 9.42067 27.672 9.134V3.04ZM25.492 21.334H34.646V24.002H25.49L25.492 21.334ZM25.492 16.002H34.646V18.668H25.49L25.492 16.002ZM25.492 26.668H34.646V29.336H25.49L25.492 26.668ZM2 11.252V32.586H22.93V11.252H2ZM12.466 23.66L11.186 25.616H12.466V28H6.032L10.7 20.98L6.564 14.668H10.02L12.468 18.34L14.914 14.668H18.368L14.224 20.98L18.898 28H15.312L12.466 23.66Z" fill="white"/>
</svg>
		),
		title: 'Excel & CSV Files',
		features: [
			'Connection: File upload — specialist maps columns',
			'Any spreadsheet format accepted',
			'Customer and vendor lists',
			'Inventory with quantities and costs',
			'Transaction history exports',
			'Employee records and HR data',
		],
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <path d="M31.9256 12.4853C31.531 11.9672 31.0173 11.5518 30.4281 11.2744C29.8388 10.997 29.1913 10.8658 28.5406 10.892C26.4656 10.892 24.7822 12.1537 24.7822 13.7103C24.7822 15.267 26.4672 16.5303 28.5406 16.5303C30.6139 16.5303 32.2972 17.7903 32.2972 19.347C32.2972 20.9037 30.6139 22.1653 28.5406 22.1653C27.8898 22.1915 27.2423 22.0603 26.6531 21.783C26.0638 21.5056 25.5501 21.0902 25.1556 20.572M28.5406 10.892V9.01367M28.5406 22.167V24.0437" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20.0003 30.4167V36.25M11.667 36.25H28.3337M7.70366 11.1483H17.7237M7.70366 17.525H17.7237M7.70366 23.9017H12.7137M33.9237 3.75H6.07699C4.90739 3.75 3.78569 4.21462 2.95865 5.04166C2.13162 5.86869 1.66699 6.9904 1.66699 8.16V26.0067C1.66699 27.1763 2.13162 28.298 2.95865 29.125C3.78569 29.952 4.90739 30.4167 6.07699 30.4167H33.9237C34.5028 30.4167 35.0762 30.3026 35.6113 30.081C36.1463 29.8594 36.6325 29.5345 37.042 29.125C37.4515 28.7155 37.7763 28.2293 37.998 27.6943C38.2196 27.1593 38.3337 26.5858 38.3337 26.0067V8.16C38.3337 7.58087 38.2196 7.00741 37.998 6.47237C37.7763 5.93732 37.4515 5.45117 37.042 5.04166C36.6325 4.63215 36.1463 4.30731 35.6113 4.08569C35.0762 3.86407 34.5028 3.75 33.9237 3.75Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
		),
		title: 'Bank Statements',
		features: [
			'Connection: CSV export or PDF upload',
			'CSV export from any bank',
			'PDF statements with OCR text extraction',
			'Transactions auto-categorized on import',
			'Matched against your chart of accounts',
			'Opening balances verified before sign-off',
			'Reconciliation history preserved',
		],
	},
	{
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <path d="M35 11.6667C35 15.35 28.2833 18.3333 20 18.3333C11.7167 18.3333 5 15.35 5 11.6667M35 11.6667C35 7.98333 28.2833 5 20 5C11.7167 5 5 7.98333 5 11.6667M35 11.6667V20M5 11.6667V20M35 20C35 23.6833 28.2833 26.6667 20 26.6667C11.7167 26.6667 5 23.6833 5 20M35 20V28.3333C35 32.0167 28.2833 35 20 35C11.7167 35 5 32.0167 5 28.3333V20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
		),
		title: 'Inventory Data',
		features: [
			'Connection: Any format — spreadsheet, CSV, or system export',
			'Product names, SKUs, and descriptions',
			'Current quantities on hand',
			'Cost and pricing information',
			'Supplier and vendor links',
			'Reorder points and minimum quantities',
		],
	},
]

const CheckIcon = () => (
	<svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-[2px]">
		<circle cx="8" cy="8" r="7.5" stroke="#22C55E" strokeWidth="1" />
		<path d="M5 8l2 2 4-4" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

const Features = () => {
	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-24 px-4 overflow-hidden">
			<div className="container mx-auto max-w-6xl">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
					{/* Left: text */}
					<AnimateOnScroll animation="animate-fade-in-left" className="lg:sticky lg:top-32">
						<GradientBadge>What We Migrate</GradientBadge>
						<h2 className="text-[#F9F9F9] font-medium text-2xl sm:text-3xl md:text-4xl lg:text-[44px] leading-tight sm:leading-snug lg:leading-[1.15] mt-2 mb-5">
							Bring everything you have.{' '}
							<br className="hidden sm:block" />
							We handle all of it.
						</h2>
						<p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6 max-w-md">
							Whatever tool you are coming from, whatever format your data is in —
							we have migrated it before.
						</p>
					</AnimateOnScroll>

					{/* Right: feature grid */}
					<AnimateOnScroll animation="animate-fade-in-right" delay={150}>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
							{dataItems.map((item, idx) => (
								<AnimateOnScroll
									key={item.title}
									delay={idx * 60}
									className="rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-[0_16px_36px_-12px_rgba(79,35,180,0.35)] transition-all duration-400"
									style={{
										borderRadius: '24px',
										border: '1px solid #fff',
										backdropFilter: 'blur(8px)',
										WebkitBackdropFilter: 'blur(8px)',
									}}
								>
									{/* Icon */}
									<div>{item.icon}</div>

									{/* Title */}
									<p className="text-[#F9F9F9] font-semibold text-base sm:text-lg">
										{item.title}
									</p>

									{/* Feature list */}
									<ul className="flex flex-col gap-2">
										{item.features.map((feature) => (
											<li key={feature} className="flex items-start gap-2">
												<CheckIcon />
												<span className="text-white/70 text-xs sm:text-sm leading-relaxed">
													{feature}
												</span>
											</li>
										))}
									</ul>
								</AnimateOnScroll>
							))}
						</div>
					</AnimateOnScroll>
				</div>
			</div>
		</section>
	)
}

export default Features