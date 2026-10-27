import React from "react";
import Image from "next/image";
import AnimateOnScroll from "./AnimateOnScroll";

const reviews = [
  {
    rating: 5.0,
    text: "Balanzify made our daily accounting process much easier. We can now track expenses, manage reports, and understand our financial position without feeling overwhelmed by complicated numbers.",
    author: "David Miller",
    role: "Small Business Owner",
    avatar: "/david.png",
  },
  {
    rating: 5.0,
    text: "The dashboard feels simple, clean, and very helpful. I can quickly see cash flow, invoices, payroll updates, and business insights in one place, which saves our team a lot of time.",
    author: "Emily Carter",
    role: "Operations Manager",
    avatar: "/emily.png",
  },
  {
    rating: 5.0,
    text: "Balanzify gives us better control over accounting and HR tasks. From reports to attendance and payroll, everything feels connected, organized, and easy to understand.",
    author: "Daniel Brooks",
    role: "Finance Consultant",
    avatar: "/daniel.png",
  },
];

const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Stars = ({ count }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} className="w-4 h-4" viewBox="0 0 16 16" fill="#EFA241">
        <path d="M8 1l1.854 3.756 4.146.602-3 2.924.708 4.126L8 10.347l-3.708 1.061.708-4.126-3-2.924 4.146-.602L8 1z" />
      </svg>
    ))}
  </div>
);

const ReviewCard = ({ review, idx = 0, raised = false }) => (
  <AnimateOnScroll
    className={`relative flex-1 min-h-[280px] hover:-translate-y-2 transition-transform duration-500 ${raised ? "" : "md:mt-12"}`}
    delay={idx * 120}
  >
    <Image
      src="/V2/review_card.png"
      alt=""
      fill
      className="object-fill pointer-events-none select-none"
    />
    <div className="relative h-full min-h-[320px] sm:min-h-[350px] flex flex-col justify-between p-5 sm:p-6">
      <div>
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <span className="text-[#F9F9F9] text-base sm:text-lg font-bold">
            {review.rating.toFixed(1)}
          </span>
          <Stars count={review.rating} />
        </div>

        <div className="border-t border-[#A1A7C4] mb-3 sm:mb-4" />

        <p className="text-[#FFFFFFA3] text-sm sm:text-base leading-relaxed">
          {review.text}
        </p>
      </div>

      <div className="flex items-center gap-3 mt-6 sm:mt-8">
        <div>
          <Image src={review.avatar} alt={review.author} height={30} width={30} className="object-cover" />
        </div>

        <div>
          <p className="text-[#F9F9F9] text-sm font-medium mb-0.5">
            {review.author}
          </p>
          <p className="text-[#7E84A3] text-xs">{review.role}</p>
        </div>
      </div>
    </div>
  </AnimateOnScroll>
);

export const GradientBadge = ({ children }) => (
  <span
    className="inline-block text-[#F9F9F9] text-xs px-5 py-1.5 rounded-full mb-6"
    style={{
      border: "1px solid transparent",
      backgroundImage: `
        linear-gradient(#0B0919, #0B0919),
        linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0))
      `,
      backgroundOrigin: "border-box",
      backgroundClip: "padding-box, border-box",
      backdropFilter: "blur(10px)",
    }}
  >
    {children}
  </span>
);

const Review = () => {
  return (
    <section className="bg-[#0B0919] py-12 sm:py-16 lg:py-20 px-4">
      <div className="container mx-auto max-w-6xl">

        <div className="text-center mb-10 sm:mb-12 lg:mb-14">
          <AnimateOnScroll>
            <GradientBadge>Feedback</GradientBadge>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-5">
              What Our Clients are Saying
            </h2>
          </AnimateOnScroll>

          <AnimateOnScroll delay={200}>
            <p className="text-[#F9F9F9] text-xs sm:text-sm max-w-2xl opacity-70 mt-2 mx-auto px-2">
              Our innovative AI platform empowers you to achieve more with less effort,
              guiding you from quick setup to impactful outcomes.
            </p>
          </AnimateOnScroll>
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-4 sm:gap-5">
          {reviews.map((review, i) => (
            <ReviewCard key={i} review={review} idx={i} raised={i === 1} />
          ))}
        </div>

        <AnimateOnScroll className="flex items-center justify-center gap-4 mt-10 sm:mt-12" delay={150}>
          <button
            type="button"
            aria-label="Previous review"
            className="w-11 h-11 rounded-full flex items-center justify-center border border-[#7C4DFF] text-[#F9F9F9] transition-all duration-300 hover:bg-[#7C4DFF]/20"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Next review"
            className="w-11 h-11 rounded-full flex items-center justify-center bg-[#7C4DFF] text-white transition-all duration-300 hover:bg-[#6b3ee0] hover:-translate-y-0.5"
          >
            <ChevronRight />
          </button>
        </AnimateOnScroll>
      </div>
    </section>
  );
};

export default Review;
