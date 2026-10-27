import dynamic from "next/dynamic";

import Invoicing from "../../components/invoicing";
import MarketingSection from "../../components/knowledge";
import Offer from "../../components/offer";
import Testimonial from "../../components/testimonial";
import Faq from "../../components/faq";
import Build from "../../components/V2/build";
import Recommend from "../../components/recommend";
import OnePlace from "../../components/onePlace";
// import HeroV2 from "../../components/V2/hero";
import Pricing from "../../components/V2/pricing";
import Review from "../../components/V2/review";
import SimpliFying from "../../components/V2/simplifying";
import Attendance from "../../components/V2/attendance";
import Collaboration from "../../components/V2/collaboration";
import Platform from "../../components/V2/platform";
import Operation from "../../components/V2/operation";
import Tool from "../../components/V2/tool";
import NewSection from "../../components/V2/NewSection";
import Stats from "../../components/V2/stats";
import Cta from "./about/_components/cta";
import HowItWorks from "./snap_expense/_components/how_it_works";

const HeroV2 = dynamic(() => import("../../components/V2/hero"), { ssr: true });


export default function HomePage() {
  return (
    <div className="font-jakarta">
      <HeroV2 />
      <div className="bg-[#0B0919]">
        {/* <Stats /> */}
        <Collaboration />
        <Platform />
        <Operation />
        <Tool />
        {/* <Testimonial /> */}
        <SimpliFying />
        {/* <Attendance /> */}
        <HowItWorks />
        <Review />
        <Pricing />
        <NewSection />
        {/* <Build /> */}
        {/* <Cta /> */}
      </div>
    </div>
  );
}
