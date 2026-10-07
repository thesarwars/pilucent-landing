import React from "react";

const SupportOverview = () => {
  // Data for ticket metrics
  const ticketData = [
    {
      title: "All Tickets",
      value: 110,
      percentage: 74,
      bgColor: "bg-blue-100",
      ringColor: "text-blue-500",
    },
    {
      title: "Closed Tickets",
      value: 20,
      percentage: 74,
      bgColor: "bg-purple-100",
      ringColor: "text-purple-500",
    },
    {
      title: "Pending Tickets",
      value: 110,
      percentage: 74,
      bgColor: "bg-amber-100",
      ringColor: "text-amber-500",
    },
    {
      title: "Tickets Created Today",
      value: 110,
      percentage: 74,
      bgColor: "bg-gray-100",
      ringColor: "text-gray-500",
    },
    {
      title: "Open Tickets",
      value: 110,
      percentage: 74,
      bgColor: "bg-green-100",
      ringColor: "text-green-500",
    },
  ];

  return (
    <div className="flex flex-wrap lg:justify-between gap-4 w-full flex-shrink-0 overflow-hidden rounded-lg">
      {ticketData.map((item, index) => (
        <div
          key={index}
          className={`w-60 rounded-lg px-4 py-1 ${item.bgColor}`}
        >
          <div className="pb-1 pt-2 text-left text-sm text-gray-600">
            {item.title}
          </div>
          <div className="flex items-center justify-end">
            <div className="relative flex h-[66px] w-[66px] items-center justify-center">
              {/* SVG Circle Progress */}
              <svg
                className="h-full w-full -rotate-90 transform"
                viewBox="0 0 36 36"
              >
                <circle
                  className="stroke-current text-gray-200"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="transparent"
                  r="16"
                  cx="18"
                  cy="18"
                />
                <circle
                  className={`stroke-current ${item.ringColor}`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="transparent"
                  r="16"
                  cx="18"
                  cy="18"
                  strokeDasharray="100"
                  strokeDashoffset={100 - item.percentage}
                />
              </svg>
              <div className="absolute text-lg">
                {item.percentage}%
              </div>
            </div>
          </div>
          <div className="mt-1 pb-2  text-2xl  font-medium">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupportOverview;
