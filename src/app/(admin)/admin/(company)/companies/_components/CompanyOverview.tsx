import CompanyCard from "@/app/(admin)/_components/CompanyCard";
import SubscriptionsInsight from "@/app/(admin)/_components/SubscriptionsInsight";
import { fetchCompanies } from "@/app/helpers/backend";
import { useFetch } from "@/app/helpers/hooks";
import { useEffect, useState } from "react";

const data = {
  icon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="25"
      viewBox="0 0 24 25"
      fill="none"
    >
      <path
        d="M21 5H3C2.60218 5 2.22064 5.15804 1.93934 5.43934C1.65804 5.72064 1.5 6.10218 1.5 6.5V18.5C1.5 18.8978 1.65804 19.2794 1.93934 19.5607C2.22064 19.842 2.60218 20 3 20H21C21.3978 20 21.7794 19.842 22.0607 19.5607C22.342 19.2794 22.5 18.8978 22.5 18.5V6.5C22.5 6.10218 22.342 5.72064 22.0607 5.43934C21.7794 5.15804 21.3978 5 21 5ZM21 6.5V8.75H3V6.5H21ZM21 18.5H3V10.25H21V18.5ZM19.5 16.25C19.5 16.4489 19.421 16.6397 19.2803 16.7803C19.1397 16.921 18.9489 17 18.75 17H15.75C15.5511 17 15.3603 16.921 15.2197 16.7803C15.079 16.6397 15 16.4489 15 16.25C15 16.0511 15.079 15.8603 15.2197 15.7197C15.3603 15.579 15.5511 15.5 15.75 15.5H18.75C18.9489 15.5 19.1397 15.579 19.2803 15.7197C19.421 15.8603 19.5 16.0511 19.5 16.25ZM13.5 16.25C13.5 16.4489 13.421 16.6397 13.2803 16.7803C13.1397 16.921 12.9489 17 12.75 17H11.25C11.0511 17 10.8603 16.921 10.7197 16.7803C10.579 16.6397 10.5 16.4489 10.5 16.25C10.5 16.0511 10.579 15.8603 10.7197 15.7197C10.8603 15.579 11.0511 15.5 11.25 15.5H12.75C12.9489 15.5 13.1397 15.579 13.2803 15.7197C13.421 15.8603 13.5 16.0511 13.5 16.25Z"
        fill="white"
      />
    </svg>
  ),
  iconBgColor: "#2CC133",
  bgColor: "#D6F2DE",
  title: "Subscription insights",
  count: 300,
};

const CompanyOverview = () => {
  const { data: companies, isPending } = useFetch(
    ["company_overview"],
    fetchCompanies,
  );
  const [overviewData, setOverviewData] = useState<any[]>([]);

  useEffect(() => {
    if (!isPending) {
      setOverviewData([
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
            >
              <path
                d="M18 15.5H16V17.5H18M18 11.5H16V13.5H18M20 19.5H12V17.5H14V15.5H12V13.5H14V11.5H12V9.5H20M10 7.5H8V5.5H10M10 11.5H8V9.5H10M10 15.5H8V13.5H10M10 19.5H8V17.5H10M6 7.5H4V5.5H6M6 11.5H4V9.5H6M6 15.5H4V13.5H6M6 19.5H4V17.5H6M12 7.5V3.5H2V21.5H22V7.5H12Z"
                fill="#F5F6FA"
              />
            </svg>
          ),
          iconBgColor: "#78B7EF",
          bgColor: "#D4EBFF",
          title: "Total Company",
          count: companies?.total_company,
        },
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
            >
              <path
                d="M2 2.5H22"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M4 2.5H20V12.77C20 14.11 20 14.779 19.732 15.37C19.464 15.96 18.959 16.4 17.951 17.282L15.951 19.031C14.068 20.677 13.127 21.5 12 21.5C10.873 21.5 9.932 20.677 8.049 19.03L6.049 17.282C5.04 16.4 4.536 15.96 4.269 15.37C4 14.78 4 14.11 4 12.77V2.5Z"
                stroke="white"
                stroke-width="1.5"
              />
              <path
                d="M8.5 13.5H15.5M8.5 8.5H15.5"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          ),
          iconBgColor: "#2CC133",
          bgColor: "#D6F2DE",
          title: "Active Company",
          count: companies?.active_company,
        },
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
            >
              <path
                d="M11 11.5H8M14 7.5H8M4 19.146V8.554C4 5.7 4 4.274 4.879 3.387C5.757 2.5 7.172 2.5 10 2.5H14C16.828 2.5 18.243 2.5 19.121 3.387C20 4.273 20 5.7 20 8.554V19.146C20 20.657 20 21.413 19.538 21.711C18.783 22.197 17.616 21.177 17.029 20.807C16.544 20.501 16.302 20.349 16.032 20.34C15.742 20.33 15.495 20.477 14.971 20.807L13.06 22.012C12.544 22.337 12.287 22.5 12 22.5C11.713 22.5 11.456 22.337 10.94 22.012L9.03 20.807C8.544 20.501 8.302 20.349 8.033 20.34C7.742 20.33 7.495 20.477 6.971 20.807C6.384 21.177 5.217 22.197 4.461 21.711C4 21.413 4 20.658 4 19.146Z"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          ),
          iconBgColor: "#d64343",
          bgColor: "#F9DEDE",
          title: "Inactive Company",
          count: companies?.inactive_company,
        },
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
            >
              <path
                d="M21 5H3C2.60218 5 2.22064 5.15804 1.93934 5.43934C1.65804 5.72064 1.5 6.10218 1.5 6.5V18.5C1.5 18.8978 1.65804 19.2794 1.93934 19.5607C2.22064 19.842 2.60218 20 3 20H21C21.3978 20 21.7794 19.842 22.0607 19.5607C22.342 19.2794 22.5 18.8978 22.5 18.5V6.5C22.5 6.10218 22.342 5.72064 22.0607 5.43934C21.7794 5.15804 21.3978 5 21 5ZM21 6.5V8.75H3V6.5H21ZM21 18.5H3V10.25H21V18.5ZM19.5 16.25C19.5 16.4489 19.421 16.6397 19.2803 16.7803C19.1397 16.921 18.9489 17 18.75 17H15.75C15.5511 17 15.3603 16.921 15.2197 16.7803C15.079 16.6397 15 16.4489 15 16.25C15 16.0511 15.079 15.8603 15.2197 15.7197C15.3603 15.579 15.5511 15.5 15.75 15.5H18.75C18.9489 15.5 19.1397 15.579 19.2803 15.7197C19.421 15.8603 19.5 16.0511 19.5 16.25ZM13.5 16.25C13.5 16.4489 13.421 16.6397 13.2803 16.7803C13.1397 16.921 12.9489 17 12.75 17H11.25C11.0511 17 10.8603 16.921 10.7197 16.7803C10.579 16.6397 10.5 16.4489 10.5 16.25C10.5 16.0511 10.579 15.8603 10.7197 15.7197C10.8603 15.579 11.0511 15.5 11.25 15.5H12.75C12.9489 15.5 13.1397 15.579 13.2803 15.7197C13.421 15.8603 13.5 16.0511 13.5 16.25Z"
                fill="white"
              />
            </svg>
          ),
          iconBgColor: "#60AAC6",
          bgColor: "#E0F3FA",
          title: "New Company",
          count: companies?.new_company,
        },
      ]);
    }
  }, [companies, isPending]);

  return (
    <>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 items-center justify-between">
        {overviewData?.map((data, idx) => (
          <CompanyCard key={idx} data={data} />
        ))}
        {/* <SubscriptionsInsight data={data} /> */}
      </div>
    </>
  );
};

export default CompanyOverview;
