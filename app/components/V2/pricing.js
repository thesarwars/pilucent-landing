'use client'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GradientBadge } from './review'
import AnimateOnScroll from './AnimateOnScroll'
import { useProvider } from '../../../context/ProviderContext'
import {
	postOTP,
	postPlanSubscription,
	postSubscription,
	captureSubscriptionCompanyUid,
	getSubscriptionCompanyUid,
	withSubscriptionCompany,
	clearSubscriptionCompanyUid,
} from '../../helpers/backend'

const API_BASE = 'https://balanzifyapi.jumatechs.xyz/api/v1/public/subscription-plans'

// Maps a plan's boolean flags -> a readable feature list (same keys as pricing_section.js)
const FEATURE_GROUPS = [
	{
		features: [
			{ key: 'is_chart_of_account', name: 'Chart of Account' },
			{ key: 'is_chart_of_account_tree', name: 'Chart of Account Tree' },
			{ key: 'is_journal_entry', name: 'Journal Entry' },
			{ key: 'is_bank_transaction', name: 'Bank Transaction' },
			{ key: 'is_company_setting', name: 'Company Settings' },
			{ key: 'is_configuration', name: 'Configuration' },
			{ key: 'is_user_profile', name: 'User Profile' },
			{ key: 'is_attachment', name: 'Attachments' },
			{ key: 'is_user_role_management', name: 'User Role Management' },
			{ key: 'is_audit_log', name: 'Audit Log' },
			{ key: 'is_employees', name: 'Employees' },
			{ key: 'is_payroll', name: 'Payroll' },
			{ key: 'is_attendance', name: 'Attendance' },
			{ key: 'is_punch_data_import', name: 'Punch Data Import' },
			{ key: 'is_sales', name: 'Sales' },
			{ key: 'is_customer', name: 'Customer Management' },
			{ key: 'is_inventory', name: 'Inventory' },
			{ key: 'is_warehouse', name: 'Warehouse' },
			{ key: 'is_expense', name: 'Expense' },
			{ key: 'is_supplier_management', name: 'Supplier Management' },
			{ key: 'is_standard_report', name: 'Standard Reports' },
			{ key: 'is_agency_tax', name: 'Agency Tax' },
			{ key: 'is_multicurrency', name: 'Multi-currency' },
			{ key: 'is_terms', name: 'Terms' },
			{ key: 'is_payment_management', name: 'Payment Management' },
			{ key: 'is_support_ticket', name: 'Support Ticket' },
			{ key: 'is_ai_finzify', name: 'AI Finzify' },
		],
	},
]

const ALL_FEATURES = FEATURE_GROUPS.flatMap((g) => g.features)
const BG_IMAGES = ['/V2/pricing_1.png', '/V2/pricing_2.png']
const MAX_FEATURES = 12

// Strip trailing zeros: 89.99 -> "89.99", 90 -> "90"
const money = (n) => {
	const v = Math.round(Number(n || 0) * 100) / 100
	return Number.isInteger(v) ? `${v}` : v.toFixed(2)
}

const CheckIcon = ({ white }) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 22 22" fill="none">
		<circle cx="11" cy="11" r="10" stroke={white ? 'white' : '#8B5CF6'} strokeWidth="2" />
		<path
			d="M8.7347 14.8422L5.16156 11.3561C5.05828 11.256 5 11.1196 5 10.9774C5 10.8352 5.05828 10.6988 5.16156 10.5985L5.9381 9.84088H5.93825C6.0417 9.7398 6.18209 9.68295 6.32865 9.68295C6.47505 9.68295 6.61545 9.7398 6.71905 9.84088L9.1251 12.1883L14.2811 7.15793C14.3846 7.05686 14.5249 7 14.6715 7C14.8179 7 14.9583 7.05686 15.0619 7.15793L15.8384 7.91555V7.9157C15.9419 8.01585 16 8.15221 16 8.29443C16 8.43665 15.9419 8.57301 15.8384 8.67332L9.51563 14.8421C9.41219 14.9431 9.27163 15 9.12523 15C8.97868 15 8.83827 14.9431 8.73483 14.8421L8.7347 14.8422Z"
			fill={white ? 'white' : '#8B5CF6'}
		/>
	</svg>
)

const Toggle = ({ on, white }) => (
	<div
		className="relative w-9 h-5 rounded-full flex items-center transition-colors duration-300 flex-shrink-0"
		style={{ background: on ? (white ? 'rgba(255,255,255,0.9)' : '#8B5CF6') : 'rgba(255,255,255,0.2)' }}
	>
		<span
			className="absolute w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-300"
			style={{ transform: on ? 'translateX(18px)' : 'translateX(3px)', background: white && on ? '#8B5CF6' : 'white' }}
		/>
	</div>
)

const Pricing = () => {
	const [annual, setAnnual] = useState(true)
	const [rawPlans, setRawPlans] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [checkoutSlug, setCheckoutSlug] = useState(null)
	const hasFetched = useRef(false)
	const router = useRouter()
	const { user, company } = useProvider()

	const handleChoosePlan = async (plan) => {
		if (!user?.uid) {
			router.push('/auth?action=sign-in')
			return
		}
		if (!user?.is_email_verified) {
			const res = await postOTP()
			if (res?.success) router.push('/auth?action=verify-email&from=registration')
			return
		}
		// Only block on the token-resolved company's plan status when there is NO
		// handed-off company. With a company_uid handoff we're subscribing a
		// specific (no-subscription) company from accounting — a *different*
		// company already having a plan must not block it.
		if (!getSubscriptionCompanyUid() && user?.uid && company?.is_company_subscription) {
			toast.info(
				'You already have a running plan. If you want to cancel please contact support from your company dashboard.',
				{ duration: 4000 }
			)
			return
		}
		if (checkoutSlug) return
		try {
			setCheckoutSlug(plan?.priceSlug)
			// 1) create the subscription for the chosen price (bill the handed-off company)
			await postPlanSubscription(
				withSubscriptionCompany({ subscription_price_slug: plan?.priceSlug })
			)
			// 2) start Stripe checkout and redirect to the hosted checkout page
			const res = await postSubscription(
				withSubscriptionCompany({
					billing_frequency: plan?.billingFrequency,
					plan_title: plan?.name,
				})
			)
			if (res?.success && res?.checkout_url) {
				// handoff consumed — clear so a later unrelated purchase isn't mis-billed
				clearSubscriptionCompanyUid()
				window.location.href = res.checkout_url
			} else {
				toast.error('Something went wrong. Please try again.')
				setCheckoutSlug(null)
			}
		} catch (err) {
			toast.error('Error occurred. Please try again.')
			setCheckoutSlug(null)
		}
	}

	useEffect(() => {
		// Persist the company handed off from accounting.balanzify.com (?company_uid)
		// so the right company is billed even after the sign-in round-trip drops the param.
		captureSubscriptionCompanyUid()
		if (hasFetched.current) return
		hasFetched.current = true

		const load = async () => {
			try {
				const res = await fetch(`${API_BASE}?kind=COMPANY_SUBSCRIPTION&page=1`)
				if (!res.ok) throw new Error('Failed to fetch subscription plans')
				const data = await res.json()
				const list = data?.results || []

				const withPrices = await Promise.all(
					list.map(async (plan) => {
						try {
							const pr = await fetch(`${API_BASE}/${plan.slug}/prices`)
							const pd = await pr.json()
							const prices = pd?.results || []
							const monthlyPrice =
								prices.find((p) => p.billing_frequency === 'MONTHLY') || prices[0] || null
							return { ...plan, monthlyPrice }
						} catch {
							return { ...plan, monthlyPrice: null }
						}
					})
				)

				// keep the same 2 cards as the existing design
				setRawPlans(withPrices.filter((p) => p.monthlyPrice).slice(0, 2))
			} catch (err) {
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}

		load()
	}, [])

	// Map API plan -> the shape the card UI expects
	const plans = rawPlans.map((plan, idx) => {
		const price = Number(plan.monthlyPrice?.price || 0)
		const discount = Number(plan.monthlyPrice?.discount || 0)
		const monthly = Math.round((price - discount) * 100) / 100
		const currency = plan.currency === 'USD' ? '$' : `${plan.currency || ''} `
		const features = ALL_FEATURES
			.filter((f) => plan[f.key])
			.slice(0, MAX_FEATURES)
			.map((f) => ({ text: f.name, active: true }))

		return {
			id: plan.slug,
			name: plan.title,
			description: plan.description,
			currency,
			priceSlug: plan.monthlyPrice?.slug,
			billingFrequency: plan.monthlyPrice?.billing_frequency,
			monthly,
			originalMonthly: price,
			annualTotal: Math.round(monthly * 10),
			savingsPerMonth: Math.round(discount),
			trialDays: plan.trial_period,
			highlight: idx === 1,
			bgImage: BG_IMAGES[idx] || BG_IMAGES[0],
			featuresLabel: idx === 0 ? 'Key Feature' : `Everything in ${rawPlans[0]?.title || 'Starter'}`,
			features,
		}
	})

	return (
		<section className="relative bg-[#0B0919] py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
			<div className="container mx-auto max-w-4xl relative z-10">
				{/* Header */}
				<div className="text-center mb-10 sm:mb-12">
					<AnimateOnScroll>
						<GradientBadge>Pricing</GradientBadge>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-medium leading-tight max-w-xl mx-auto">
							Half the cost of what you&apos;re using now.
						</h2>
					</AnimateOnScroll>
				</div>

				{loading ? (
					<div className="py-16 w-full flex items-center justify-center">
						<div className="animate-spin rounded-full h-14 w-14 border-[3px] border-white/10 border-t-[#8B5CF6]" />
					</div>
				) : error ? (
					<div className="py-12 text-center">
						<p className="text-red-400 text-sm">Error: {error}</p>
					</div>
				) : (
					/* Plan cards */
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
						{plans.map((plan, idx) => (
							<AnimateOnScroll
								key={plan.id}
								delay={idx * 120}
								className="relative rounded-3xl overflow-hidden hover:-translate-y-1.5 transition-transform duration-500"
								style={{ minHeight: 560 }}
							>
								{/* Background image */}
								<Image
									src={plan.bgImage}
									alt=""
									fill
									className="object-fill pointer-events-none select-none"
								/>

								{/* Content */}
								<div className="relative z-10 p-6 sm:p-7 flex flex-col h-full">
									{/* Popular badge */}
									{plan.highlight && (
										<div className="flex justify-end mb-1">
											<span
												className="text-[11px] font-semibold px-3 py-1 rounded-full text-white"
												style={{ background: '#8B5CF6' }}
											>
												Most Popular
											</span>
										</div>
									)}

									{/* Plan name + description */}
									<div className="mb-4">
										<h3 className="text-[#F9F9F9] font-semibold text-xl mb-1">{plan.name}</h3>
										<p className="text-white/50 text-xs leading-relaxed">{plan.description}</p>
									</div>

									{/* Price */}
									<div className="mb-4">
										<div className="flex items-baseline gap-2">
											{plan.originalMonthly > plan.monthly && (
												<span className="text-white/40 text-base line-through">
													{plan.currency}{money(plan.originalMonthly)}
												</span>
											)}
											<span className="text-[#F9F9F9] text-4xl font-bold">
												{plan.currency}{money(plan.monthly)}
											</span>
											<span className="text-white/50 text-sm">/month</span>
										</div>
									</div>

									{/* Annual toggle row */}
									<div className="flex items-center gap-3 mb-2">
										<button
											onClick={() => setAnnual(!annual)}
											className="flex items-center gap-2"
										>
											<Toggle on={annual} white={plan.highlight} />
											<span className="text-white/70 text-xs font-medium">Annual</span>
										</button>
										{annual && plan.savingsPerMonth > 0 && (
											<span
												className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
												style={{
													background: plan.highlight ? 'rgba(255,255,255,0.15)' : 'rgba(139,92,246,0.2)',
													color: plan.highlight ? 'white' : '#A78BFA',
												}}
											>
												Save {plan.currency}{plan.savingsPerMonth}/month forever
											</span>
										)}
									</div>

									{/* Annual total */}
									{annual && (
										<p className="text-white/60 text-xs mb-4">
											{plan.currency}{plan.annualTotal.toLocaleString()}/year -{' '}
											<span className={plan.highlight ? 'text-white font-semibold' : 'text-[#8B5CF6] font-semibold'}>
												2 Months free
											</span>
										</p>
									)}

									{/* CTA */}
									<button
										onClick={() => handleChoosePlan(plan)}
										disabled={checkoutSlug != null}
										className={`w-full py-3 rounded-full text-sm font-semibold mb-1.5 transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 ${
											plan.highlight
												? 'bg-[#8B5CF6] text-white shadow-[0_6px_20px_-6px_rgba(139,92,246,0.6)] hover:bg-[#7c3aed]'
												: 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
										}`}
									>
										{checkoutSlug === plan.priceSlug
											? 'Processing...'
											: `Start ${plan.trialDays || 14}–Day Free Trial`}
									</button>
									<p className="text-center text-white/35 text-[11px] mb-5">No credit card required</p>

									{/* Features */}
									<div className="border-t border-white/[0.1] pt-5">
										<p className="text-[#F9F9F9] text-sm font-semibold mb-4">{plan.featuresLabel}</p>
										<ul className="space-y-2.5">
											{plan.features.map((feature, fi) => (
												<li key={fi} className="flex items-start gap-2.5">
													<div className="mt-0.5 shrink-0 opacity-100">
														<CheckIcon white={plan.highlight} />
													</div>
													<span
														className={`text-xs leading-relaxed ${
															feature.active
																? plan.highlight ? 'text-white/85' : 'text-white/75'
																: 'text-white/30'
														}`}
													>
														{feature.text}
													</span>
												</li>
											))}
										</ul>
									</div>
								</div>
							</AnimateOnScroll>
						))}
					</div>
				)}

				{/* Footer note */}
				<AnimateOnScroll delay={200} className="text-center mt-8">
					<p className="text-white/50 text-sm">
						Two plans. Everything included.{' '}
						<Link href="/pricing" className="text-[#8B5CF6] font-medium hover:underline">
							Full pricing →
						</Link>
					</p>
				</AnimateOnScroll>
			</div>
		</section>
	)
}

export default Pricing
