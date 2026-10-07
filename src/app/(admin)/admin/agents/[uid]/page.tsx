import Table from "@/app/(admin)/_components/Table";
import Image from "next/image";
const ticketData = [
  {
    title: "All Tickets",
    value: 110,
    percentage: 74,
    bgColor: "bg-blue-100",
    ringColor: "text-blue-500",
  },
  {
    title: "Close Tickets",
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
    title: "Create Today Tickets",
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

const Page = () => {
  return (
    <>
    <div className="flex gap-4 items-start">
      <div className="max-w-md w-full w-md overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="h-[150px] w-full rounded-lg">
          <Image
            src="/images/rainbow-back.png"
            alt="back"
            width={387}
            height={580}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex -translate-y-12 flex-col items-start pl-4">
          <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-300">
            <Image
              src="/images/model.png"
              width={200}
              height={200}
              alt="profile"
              className="h-full w-full rounded-full border-accent_soft_blue object-cover"
            />
          </div>
        </div>
        <div className="flex -translate-y-10 flex-col items-start px-6 pb-4">
          {/* Profile information */}
          <div className="w-full">
            <h2 className="mb-1 text-xl font-bold">Hello Angel</h2>
            <p className="mb-2 text-sm text-gray-500">Agent</p>

            {/* Rating */}
            <div className="mb-3 flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${i < 4 ? "text-yellow-400" : "text-gray-300"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-500">(46 reviews)</span>
            </div>

            {/* Contact information */}
            <div className="space-y-1 text-sm">
              <p className="text-gray-600">helloangel@mail.love</p>
              <p className="text-gray-600">+1 514 2254</p>
              <p className="text-gray-600">
                2715 Ash Dr, San Jose, South Dakota 83475
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full gap-4 flex-wrap  rounded-lg">
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
                <div className="absolute text-lg">{item.percentage}%</div>
              </div>
            </div>
            <div className="mt-1 pb-2 text-2xl font-medium">{item.value}</div>
          </div>
        ))}
      </div>

    </div>
      <Table title="Tickets" data={{results: [], count: 0, next: null, previous: null }}/>
      </>
  );
};

export default Page;
