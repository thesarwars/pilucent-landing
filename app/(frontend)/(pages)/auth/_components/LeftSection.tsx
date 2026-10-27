import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";

const LeftSection = () => {
  return (
    <div className="text-white flex-1 space-y-6 px-2 md:px-0 font-jakarta animate-fade-in-up">
      <h1 className="text-[#F9F9F9] font-medium text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight">
        Save up to $8,000 a year in billable hours
      </h1>
      <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-md">
        Balanzify is preferred by business owners, their teams, and
        accountants.
      </p>

      <ul className="space-y-3">
        {[
          "Seamlessly migrate from your current software.",
          "Get access to live customer support.",
          "Your data is safe and secure.",
        ].map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-3 animate-fade-in-up"
            style={{ animationDelay: `${150 + i * 100}ms` }}
          >
            <FaCheckCircle className="w-5 h-5 text-[#A78BFA] shrink-0" />
            <span className="text-white/80 text-sm sm:text-base">{item}</span>
          </li>
        ))}
      </ul>

      <div className="pt-6 border-t border-white/10 animate-fade-in-up [animation-delay:450ms]">
        <p className="text-white/70 text-sm leading-relaxed mb-4 italic">
          "Balanzify helped tremendously with cash flow. We've collected on our
          accounts receivable at a higher percentage than we ever had before. A
          lot of our clients have responded well to Balanzify."
        </p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center overflow-hidden">
            <Image
              src="/david.png"
              alt="Esther Howard"
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Esther Howard</p>
            <p className="text-white/60 text-xs">Owner of Moonrock Tax Group</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSection;
