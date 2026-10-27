export const metadata = {
  title: "Cookie Policy | Balanzify",
  description:
	"Balanzify Cookie Policy — how we use cookies and similar technologies across our platform.",
};

export default function CookiePage() {
  return (
	<div className="bg-[#150B22]">
	  {/* Hero */}
	  <div
		className="relative pt-32 pb-12 sm:pt-36 sm:pb-16"
		style={{
		  backgroundImage: "url('/V2/section_banner.png')",
		  backgroundSize: "cover",
		  backgroundPosition: "top center",
		  backgroundRepeat: "no-repeat",
		}}
	  >
		<div className="container mx-auto px-4">
		  <div className="text-center mb-4">
			<h1 className="text-3xl md:text-4xl font-bold text-[#F9F9F9] mb-2 animate-fade-in-up">
			  Cookie Policy
			</h1>
		  </div>
		</div>
	  </div>

	  {/* Policy content */}
	  <div className="container mx-auto px-4 py-12">
		<div className="max-w-3xl mx-auto">
		  <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
			<li>Strictly necessary: session management, authentication, security</li>
			<li>Performance: analytics and usage tracking</li>
			<li>Functional: user preferences and settings</li>
			<li>Targeting: any cookies used for advertising or remarketing</li>
			<li>Must comply with GDPR for EU visitors and CCPA for California residents</li>
		  </ul>
		</div>
	  </div>
	</div>
  );
}
