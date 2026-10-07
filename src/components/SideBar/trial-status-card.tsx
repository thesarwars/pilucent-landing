import { Star } from "lucide-react";
import Image from "next/image";

export default function TrialStatus({
  isCollapsed,
  isHovering,
}: {
  isCollapsed: any;
  isHovering: any;
}) {
  return (
    <div className={`2xl:sticky 2xl:bottom-2 w-full cursor-pointer rounded-3xl bg-[#F2EDFF]  py-4 transition-all ${isCollapsed && !isHovering ? "" : "px-4"}`}>
      <div className="relative">
        {/* Subtle glow effect */}
        <svg
          className={`mb-7 ${isCollapsed && !isHovering ? "size-12" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
        >
          <path
            d="M25.6012 16.2973C26.4595 14.1209 29.5396 14.1209 30.398 16.2973L32.8271 22.456C34.3993 26.4428 37.5551 29.5986 41.542 31.1709L47.7007 33.6C49.8769 34.4584 49.8769 37.5384 47.7007 38.3968L41.542 40.8258C37.5551 42.3981 34.3993 45.5538 32.8271 49.5408L30.398 55.6994C29.5396 57.8757 26.4595 57.8757 25.6012 55.6994L23.1722 49.5408C21.5999 45.5538 18.444 42.3981 14.4572 40.8258L8.29856 38.3968C6.12216 37.5384 6.12216 34.4584 8.29856 33.6L14.4572 31.1709C18.444 29.5986 21.5999 26.4428 23.1722 22.456L25.6012 16.2973Z"
            fill="#5CCD49"
            stroke="#335990"
            strokeWidth="1.4"
          />
          <path
            d="M48.4343 7.27714C48.7561 6.46101 49.9113 6.46101 50.2332 7.27714L51.1439 9.58663C51.7337 11.0817 52.9172 12.2651 54.4121 12.8548L56.7217 13.7656C57.5377 14.0875 57.5377 15.2426 56.7217 15.5644L54.4121 16.4753C52.9172 17.0649 51.7337 18.2484 51.1439 19.7434L50.2332 22.0529C49.9113 22.8691 48.7561 22.8691 48.4343 22.0529L47.5236 19.7434C46.9337 18.2484 45.7503 17.0649 44.2553 16.4753L41.9457 15.5644C41.1297 15.2426 41.1297 14.0875 41.9457 13.7656L44.2553 12.8548C45.7503 12.2651 46.9337 11.0817 47.5236 9.58663L48.4343 7.27714Z"
            fill="#EDA147"
            stroke="#335990"
            strokeWidth="1.4"
          />
        </svg>
        <h1
          className={`mb-2 text-nowrap text-base font-semibold text-[#090E4F] ${isCollapsed && !isHovering ? "hidden" : ""}`}
        >
          Free trial 14 days left
        </h1>
        {/* Star icon */}
        <p
          className={`flex items-center justify-center gap-1 text-xs text-[#090E4F] ${isCollapsed && !isHovering ? "hidden" : ""}`}
        >
          Experience all features with a free trial.
        </p>
        <hr className="my-4 border-t border-[#090E4F]" />
        <button
          className={`group relative inline-flex text-sm items-center justify-center overflow-hidden rounded-md font-medium text-[#7E54D9] ${isCollapsed && !isHovering ? "hidden" : ""}`}
        >
          <span>Upgrade Plan</span>
          <div className="ml-1 transition duration-300 group-hover:rotate-[360deg]">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
            >
              <path
                d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
