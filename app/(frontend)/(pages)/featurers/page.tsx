import React, { Suspense } from "react";
import FeaturesTabs from "../../../components/V2/FeaturesTabs";

export const metadata = {
    title: "Features | Pilucent",
    description:
        "Payroll, Tax, Accounting, HR, Employee Portal, Payments Infrastructure, and Reports — connected and unified in one platform.",
};

const Page = () => {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0B0919]" />}>
            <FeaturesTabs />
        </Suspense>
    );
};

export default Page;
