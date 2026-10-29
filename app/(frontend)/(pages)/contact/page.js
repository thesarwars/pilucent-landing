'use client'

import { useState } from 'react'
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GradientBadge } from '../../../components/V2/review'
import Build from '../../../components/V2/build'
import Faq from '../../../components/faq'

const channels = [
	{
		icon: <FaPhone className="w-5 h-5 text-white" />,
		title: 'Call Sales',
		subtitle: 'USA',
		value: 'Coming soon',
	},
	{
		icon: <FaEnvelope className="w-5 h-5 text-white" />,
		title: 'Email Us',
		subtitle: 'Anytime, any day',
		value: 'support@balanzify.com',
	},
	{
		icon: <FaMapMarkerAlt className="w-5 h-5 text-white" />,
		title: 'Visit Us',
		subtitle: 'Our headquarters',
		value: 'United States',
	},
]

const Contact = () => {
	const router = useRouter()

	const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' })
	const [submitting, setSubmitting] = useState(false)

	const handleChange = (e) => {
		const { name, value } = e.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (submitting) return

		if (!form.firstName.trim() || !form.email.trim() || !form.message.trim()) {
			toast.error('Please fill in your name, email and message.')
			return
		}

		setSubmitting(true)
		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form),
			})
			const data = await res.json()
			if (res.ok && data.success) {
				toast.success("Message sent! We'll be in touch shortly.")
				setForm({ firstName: '', lastName: '', email: '', message: '' })
			} else {
				toast.error(data.message || 'Something went wrong. Please try again.')
			}
		} catch {
			toast.error('Network error. Please try again.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="font-jakarta bg-[#0B0919]">
			{/* Hero */}
			<section
				className="relative w-full overflow-hidden pt-28 sm:pt-32 lg:pt-40 pb-12 sm:pb-16 lg:pb-20 px-4"
				style={{
					backgroundImage: "url('/V2/hero_banner.png')",
					backgroundSize: 'cover',
					backgroundPosition: 'top center',
					backgroundRepeat: 'no-repeat',
				}}
			>
				<div className="absolute bottom-0 left-0 right-0 h-40 sm:h-56 lg:h-64 bg-gradient-to-b from-transparent via-[#0B0919]/70 to-[#0B0919] pointer-events-none" />
				<div className="container mx-auto max-w-6xl relative z-10 text-center">
					<div className="animate-fade-in-up">
						<GradientBadge>Contact Us</GradientBadge>
					</div>
					<h1 className="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[64px] leading-tight sm:leading-snug lg:leading-[1.1] max-w-3xl mx-auto animate-fade-in-up [animation-delay:100ms]">
						Want to Talk to Sales <br className="hidden sm:block" /> About Pilucent?
					</h1>
					<p className="text-white/70 text-sm sm:text-base lg:text-lg mt-5 sm:mt-6 max-w-2xl mx-auto leading-relaxed px-2 animate-fade-in-up [animation-delay:200ms]">
						Our team is ready to help you simplify accounting, payroll, and operations—reach out and we
						will get back to you shortly.
					</p>
				</div>
			</section>

			{/* Channels */}
			<section className="relative py-12 sm:py-16 px-4">
				<div className="container mx-auto max-w-6xl">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
						{channels.map((channel, idx) => (
							<div
								key={channel.title}
								className="rounded-3xl p-6 sm:p-7 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(79,35,180,0.4)] transition-all duration-500 animate-fade-in-up"
								style={{
									animationDelay: `${idx * 120}ms`,
									background: idx === 0 ? '#4F23B4' : 'linear-gradient(145deg, #13102280, #1a163a)',
									border: idx === 0 ? 'none' : '1px solid #F9F9F9',
								}}
							>
								<div className="w-12 h-12 rounded-2xl bg-[#8B5CF6] flex items-center justify-center mb-5">
									{channel.icon}
								</div>
								<p className="text-[#F9F9F9] opacity-60 text-xs uppercase tracking-widest mb-1">
									{channel.subtitle}
								</p>
								<h3 className="text-[#F9F9F9] text-lg sm:text-xl font-semibold mb-2">{channel.title}</h3>
								<p className="text-[#F9F9F9] opacity-80 text-sm">{channel.value}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Form */}
			<section className="relative py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
				<div className="container mx-auto max-w-5xl">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
						<div className="animate-fade-in-left">
							<GradientBadge>Get in Touch</GradientBadge>
							<h2 className="text-[#F9F9F9] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-5 leading-tight">
								Let&apos;s Build Smarter <br className="hidden sm:block" /> Operations Together
							</h2>
							<p className="text-[#F9F9F9] opacity-70 text-xs sm:text-sm leading-relaxed mb-6 max-w-md">
								Whether you have a question about features, pricing, or anything else—our team is ready
								to answer all your questions.
							</p>
							<button
								onClick={() => router.push('/demo')}
								className="bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] text-white text-sm font-semibold px-7 py-3.5 rounded-full shadow-[0_8px_24px_-8px_rgba(124,91,255,0.6)] hover:opacity-95 hover:scale-105 transition-all duration-300"
							>
								Book a Demo
							</button>
						</div>

						<form
							onSubmit={handleSubmit}
							className="rounded-3xl p-6 sm:p-8 space-y-4 animate-fade-in-right"
							style={{
								background: 'linear-gradient(145deg, #13102280, #1a163a)',
								border: '1px solid rgba(249,249,249,0.15)',
							}}
						>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="text-[#F9F9F9] opacity-80 text-xs">First Name</label>
									<input
										type="text"
										name="firstName"
										value={form.firstName}
										onChange={handleChange}
										className="w-full mt-1.5 bg-[#0B0919] border border-white/10 rounded-full px-4 py-3 text-sm text-[#F9F9F9] placeholder:text-white/40 focus:outline-none focus:border-[#8B5CF6] transition-colors"
										placeholder="John"
									/>
								</div>
								<div>
									<label className="text-[#F9F9F9] opacity-80 text-xs">Last Name</label>
									<input
										type="text"
										name="lastName"
										value={form.lastName}
										onChange={handleChange}
										className="w-full mt-1.5 bg-[#0B0919] border border-white/10 rounded-full px-4 py-3 text-sm text-[#F9F9F9] placeholder:text-white/40 focus:outline-none focus:border-[#8B5CF6] transition-colors"
										placeholder="Doe"
									/>
								</div>
							</div>
							<div>
								<label className="text-[#F9F9F9] opacity-80 text-xs">Email</label>
								<input
									type="email"
									name="email"
									value={form.email}
									onChange={handleChange}
									className="w-full mt-1.5 bg-[#0B0919] border border-white/10 rounded-full px-4 py-3 text-sm text-[#F9F9F9] placeholder:text-white/40 focus:outline-none focus:border-[#8B5CF6] transition-colors"
									placeholder="you@company.com"
								/>
							</div>
							<div>
								<label className="text-[#F9F9F9] opacity-80 text-xs">Message</label>
								<textarea
									rows={4}
									name="message"
									value={form.message}
									onChange={handleChange}
									className="w-full mt-1.5 bg-[#0B0919] border border-white/10 rounded-3xl px-4 py-3 text-sm text-[#F9F9F9] placeholder:text-white/40 focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
									placeholder="Tell us a little about your business..."
								/>
							</div>
							<button
								type="submit"
								disabled={submitting}
								className="w-full bg-[#8B5CF6] hover:bg-[#7c3aed] text-white text-sm font-semibold py-3.5 rounded-full hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
							>
								{submitting ? 'Sending…' : 'Send Message'}
							</button>
						</form>
					</div>
				</div>
			</section>

			<div className="px-4 [&_h1]:text-white [&_.text-\[\#5A607F\]]:text-white/80 [&_p]:text-white/70 [&_button]:text-white [&_.border-b]:border-white/10">
				<Faq />
			</div>
			{/* <Build /> */}
		</div>
	)
}

export default Contact
