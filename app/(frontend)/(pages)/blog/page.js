'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GradientBadge } from '../../../components/V2/review'
import AnimateOnScroll from '../../../components/V2/AnimateOnScroll'

const POSTS_PER_PAGE = 9

const featuredPost = {
	_id: 1,
	title: 'The SMB Financial Stack in 2026: What Every Operator Needs',
	image: '/V2/blog_banner.png',
	category: 'Payroll',
	readTime: '12 min',
	excerpt:
		"Small business owners aren't just building products. But when they do succeed, there are several key strategies that drive growth and keep operations lean. We explore the tools and workflows behind the most organized SMBs in 2026.",
	author: { name: 'Jon Wayne', avatar: '/V2/user.png' },
	date: 'April 10, 2026',
}

const allPosts = Array.from({ length: 27 }, (_, i) => ({
	_id: String(i + 1),
	title: 'Multi-State Payroll: A Practical Guide for Growing Teams',
	image: ['/blog1.png', '/blog2.png', '/blog3.png'][i % 3],
	category: ['Payroll', 'Ebook', 'Finance'][i % 3],
	readTime: `${10 + (i % 5)} min`,
	author: { name: 'Dana Royce, CPA', avatar: '/V2/user.png' },
	date: 'April 10, 2026',
}))

const CategoryBadge = ({ label }) => (
	<span className="text-[#F9F9F9] text-xs px-3 py-1 rounded-full"
		style={{ background: 'rgba(139,92,246,0.25)', border: '1px solid rgba(139,92,246,0.45)' }}>
		{label}
	</span>
)

const AuthorRow = ({ author, date }) => (
	<div className="flex items-center gap-2 mt-auto pt-4">
		<img src={author.avatar} alt={author.name} className="w-7 h-7 rounded-full object-cover" />
		<span className="text-white/60 text-xs">{author.name}</span>
		{date && (
			<>
				<span className="text-white/30 text-xs">·</span>
				<span className="text-white/40 text-xs">{date}</span>
			</>
		)}
	</div>
)

export default function Blog() {
	const router = useRouter()
	const [page, setPage] = useState(1)
	const [email, setEmail] = useState('')
	const [subscribing, setSubscribing] = useState(false)

	const handleSubscribe = async (e) => {
		e.preventDefault()
		if (subscribing) return

		const trimmed = email.trim()
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
			toast.error('Please enter a valid email address.')
			return
		}

		setSubscribing(true)
		try {
			const res = await fetch('/api/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: trimmed }),
			})
			const data = await res.json()
			if (res.ok && data.success) {
				toast.success("You're subscribed! Check your inbox for a confirmation.")
				setEmail('')
			} else {
				toast.error(data.message || 'Something went wrong. Please try again.')
			}
		} catch {
			toast.error('Network error. Please try again.')
		} finally {
			setSubscribing(false)
		}
	}

	const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE)
	const pagePosts = allPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE)

	const getPageNumbers = () => {
		const pages = []
		for (let i = 1; i <= totalPages; i++) {
			if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i)
			else if (pages[pages.length - 1] !== '...') pages.push('...')
		}
		return pages
	}

	return (
		<div className="font-jakarta bg-[#0B0919] min-h-screen">
			{/* Hero */}
			<section
				className="relative w-full overflow-hidden pt-28 sm:pt-32 lg:pt-40 pb-14 sm:pb-18 lg:pb-24 px-4"
				style={{
					backgroundImage: "url('/V2/section_banner.png')",
					backgroundSize: 'cover',
					backgroundPosition: 'top center',
					backgroundRepeat: 'no-repeat',
				}}
			>
				<div className="container mx-auto max-w-6xl relative z-10 text-center">
					<AnimateOnScroll>
						<GradientBadge>Browse our Blog</GradientBadge>
					</AnimateOnScroll>
					<AnimateOnScroll delay={100}>
						<h1 className="text-[#F9F9F9] font-medium text-3xl sm:text-5xl lg:text-[64px] leading-tight sm:leading-snug lg:leading-[1.1] mx-auto max-w-3xl">
							Insights for growing businesses.
						</h1>
					</AnimateOnScroll>
					<AnimateOnScroll delay={200}>
						<p className="text-white/60 text-sm sm:text-base lg:text-lg mt-5 sm:mt-6 max-w-2xl mx-auto leading-relaxed px-2">
							Practical guides, concise cases, and financial intelligence for the SMB majority —
							written by people who&apos;ve run businesses, not just the idea of them.
						</p>
					</AnimateOnScroll>
					<AnimateOnScroll delay={300}>
						<form
							onSubmit={handleSubscribe}
							className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
						>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Get updates"
								className="w-full sm:flex-1 bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 px-5 py-3 rounded-full outline-none focus:border-[#8B5CF6] transition-colors"
							/>
							<button
								type="submit"
								disabled={subscribing}
								className="w-full sm:w-auto bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] text-white text-sm font-semibold px-7 py-3 rounded-full shadow-[0_8px_24px_-8px_rgba(124,91,255,0.6)] hover:opacity-95 hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
							>
								{subscribing ? 'Subscribing…' : 'Subscribe'}
							</button>
						</form>
					</AnimateOnScroll>
				</div>
			</section>

			{/* Featured Post */}
			<section className="relative py-10 sm:py-14 px-4">
				<div className="container mx-auto max-w-6xl">
					<AnimateOnScroll
						className="rounded-3xl overflow-hidden flex flex-col lg:flex-row hover:-translate-y-1 transition-all duration-500 cursor-pointer"
						style={{
							background: 'linear-gradient(145deg, #13102280, #1a163a)',
							border: '1px solid rgba(249,249,249,0.12)',
						}}
						onClick={() => router.push(`/blog/${featuredPost._id}`)}
					>
						{/* Image */}
						<div className="lg:w-[55%] aspect-[16/10] lg:aspect-auto overflow-hidden">
							<img
								src={featuredPost.image || '/V2/blog_banner.png'}
								alt={featuredPost.title}
								className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
							/>
						</div>

						{/* Content */}
						<div className="lg:w-[45%] p-7 sm:p-9 flex flex-col justify-center">
							<div className="flex items-start flex-col gap-2 mb-5">
								<span className="text-[#F9F9F9] text-xs px-4 py-1.5 rounded-full font-medium"
									style={{ background: 'rgba(139,92,246,0.35)', border: '1px solid rgba(139,92,246,0.5)' }}>
									Featured
								</span>
								<span className="text-white/50 text-xs px-3 py-1 rounded-full border border-white/15">
									{featuredPost.readTime}
								</span>
								<CategoryBadge label={featuredPost.category} />
							</div>

							<h2 className="text-[#F9F9F9] font-semibold text-xl sm:text-2xl lg:text-5xl leading-snug mb-4">
								{featuredPost.title}
							</h2>
							<p className="text-white/55 text-sm leading-relaxed mb-6">{featuredPost.excerpt}</p>

							<AuthorRow author={featuredPost.author} date={featuredPost.date} />
						</div>
					</AnimateOnScroll>
				</div>
			</section>

			{/* Posts Grid */}
			<section className="relative py-6 sm:py-8 px-4">
				<div className="container mx-auto max-w-6xl">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
						{pagePosts.map((post, idx) => (
							<AnimateOnScroll
								key={post._id}
								delay={idx * 60}
								className="rounded-3xl overflow-hidden flex flex-col hover:-translate-y-1.5 transition-all duration-500 cursor-pointer"
								style={{
									background: 'linear-gradient(145deg, #13102280, #1a163a)',
									border: '1px solid rgba(249,249,249,0.12)',
								}}
								onClick={() => router.push(`/blog/${post._id}`)}
							>
								{/* Image */}
								<div className="aspect-[16/9] relative overflow-hidden bg-white/5">
									<img
										src={post.image || '/placeholder.svg'}
										alt={post.title}
										className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
									/>
									{/* Overlay badges */}
									<div className="absolute top-3 left-3 flex items-center gap-2">
										<span className="text-white/70 text-[11px] bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
											{post.readTime}
										</span>
									</div>
									<div className="absolute top-3 right-3">
										<CategoryBadge label={post.category} />
									</div>
								</div>

								{/* Content */}
								<div className="p-5 flex flex-col flex-1">
									<h3 className="font-semibold text-sm sm:text-base text-[#F9F9F9] leading-snug">
										{post.title}
									</h3>
									<AuthorRow author={post.author} date={post.date} />
								</div>
							</AnimateOnScroll>
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<AnimateOnScroll className="flex items-center justify-center gap-2 mt-10 sm:mt-12">
							{getPageNumbers().map((p, i) =>
								p === '...' ? (
									<span key={`ellipsis-${i}`} className="text-white/40 text-sm px-1">…</span>
								) : (
									<button
										key={p}
										onClick={() => setPage(p)}
										className={`w-9 h-9 rounded-full text-sm font-medium transition-all duration-300 ${
											p === page
												? 'bg-[#8B5CF6] text-white shadow-[0_4px_14px_-4px_rgba(139,92,246,0.6)]'
												: 'text-white/50 hover:text-white hover:bg-white/10 border border-white/10'
										}`}
									>
										{p}
									</button>
								)
							)}
						</AnimateOnScroll>
					)}
				</div>
			</section>
		</div>
	)
}
