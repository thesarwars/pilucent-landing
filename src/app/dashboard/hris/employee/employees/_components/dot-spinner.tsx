"use client";

export default function DotSpinner() {
  return (
    <>
      <style jsx>{`
        @keyframes pulse-dot {
          0%,
          100% {
            transform: scale(0);
            opacity: 0.5;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-pulse-dot {
          animation: pulse-dot 1s ease-in-out infinite;
        }

        .animate-pulse-dot-2 {
          animation: pulse-dot 1s ease-in-out infinite;
          animation-delay: -0.875s;
        }

        .animate-pulse-dot-3 {
          animation: pulse-dot 1s ease-in-out infinite;
          animation-delay: -0.75s;
        }

        .animate-pulse-dot-4 {
          animation: pulse-dot 1s ease-in-out infinite;
          animation-delay: -0.625s;
        }

        .animate-pulse-dot-5 {
          animation: pulse-dot 1s ease-in-out infinite;
          animation-delay: -0.5s;
        }

        .animate-pulse-dot-6 {
          animation: pulse-dot 1s ease-in-out infinite;
          animation-delay: -0.375s;
        }

        .animate-pulse-dot-7 {
          animation: pulse-dot 1s ease-in-out infinite;
          animation-delay: -0.25s;
        }

        .animate-pulse-dot-8 {
          animation: pulse-dot 1s ease-in-out infinite;
          animation-delay: -0.125s;
        }
      `}</style>

      <div className="">
        <div className="relative flex h-20 w-20 items-center justify-start">
          {/* Dot 1 - 0deg */}
          <div className="absolute left-0 top-0 flex h-full w-full items-center justify-start">
            <div className="animate-pulse-dot h-[20%] w-[20%] scale-0 rounded-full bg-accent_soft_blue opacity-50 shadow-lg shadow-slate-700/30" />
          </div>

          {/* Dot 2 - 45deg */}
          <div className="absolute left-0 top-0 flex h-full w-full rotate-45 items-center justify-start">
            <div className="animate-pulse-dot-2 h-[20%] w-[20%] scale-0 rounded-full bg-accent_soft_blue opacity-50 shadow-lg shadow-slate-700/30" />
          </div>

          {/* Dot 3 - 90deg */}
          <div className="absolute left-0 top-0 flex h-full w-full rotate-90 items-center justify-start">
            <div className="animate-pulse-dot-3 h-[20%] w-[20%] scale-0 rounded-full bg-accent_soft_blue opacity-50 shadow-lg shadow-slate-700/30" />
          </div>

          {/* Dot 4 - 135deg */}
          <div className="absolute left-0 top-0 flex h-full w-full rotate-[135deg] items-center justify-start">
            <div className="animate-pulse-dot-4 h-[20%] w-[20%] scale-0 rounded-full bg-accent_soft_blue opacity-50 shadow-lg shadow-slate-700/30" />
          </div>

          {/* Dot 5 - 180deg */}
          <div className="absolute left-0 top-0 flex h-full w-full rotate-180 items-center justify-start">
            <div className="animate-pulse-dot-5 h-[20%] w-[20%] scale-0 rounded-full bg-accent_soft_blue opacity-50 shadow-lg shadow-slate-700/30" />
          </div>

          {/* Dot 6 - 225deg */}
          <div className="absolute left-0 top-0 flex h-full w-full rotate-[225deg] items-center justify-start">
            <div className="animate-pulse-dot-6 h-[20%] w-[20%] scale-0 rounded-full bg-accent_soft_blue opacity-50 shadow-lg shadow-slate-700/30" />
          </div>

          {/* Dot 7 - 270deg */}
          <div className="absolute left-0 top-0 flex h-full w-full rotate-[270deg] items-center justify-start">
            <div className="animate-pulse-dot-7 h-[20%] w-[20%] scale-0 rounded-full bg-accent_soft_blue opacity-50 shadow-lg shadow-slate-700/30" />
          </div>

          {/* Dot 8 - 315deg */}
          <div className="absolute left-0 top-0 flex h-full w-full rotate-[315deg] items-center justify-start">
            <div className="animate-pulse-dot-8 h-[20%] w-[20%] scale-0 rounded-full bg-accent_soft_blue opacity-50 shadow-lg shadow-slate-700/30" />
          </div>
        </div>
      </div>
    </>
  );
}
