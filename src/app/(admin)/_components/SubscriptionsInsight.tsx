import { Circle } from "rc-progress";

const SubscriptionsInsight = ({ data }: { data: any }) => {
  return (
    <div
      style={{ backgroundColor: data?.bgColor }}
      className={`w-60 max-w-60  rounded-lg px-5 py-4`}
    >
      <div
        style={{ backgroundColor: data?.iconBgColor }}
        className={`inline-block size-10 rounded-md p-2`}
      >
        {data?.icon}
      </div>
     
      <div className="gap-2 flex ">
        <div>
          <p className="text-sm text-[#7E84A3]">{data?.title}</p>
          <h3 className="text-xl font-medium text-[#131523]">{data?.count}</h3>
        </div>
        <div className="relative">

        <Circle className="size-12"  percent={60} strokeWidth={10} trailWidth={10}  strokeColor="#0EBE41" />
        <p className="absolute -translate-x-[50%] -translate-y-[50%] top-[50%] text-sm font-semibold left-[50%]">60%</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsInsight;
