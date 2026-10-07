const CompanyCard = ({ data }: { data: any }) => {
  return (
    <div style={{backgroundColor: data?.bgColor}} className={` max-w-56 md:w-56 rounded-lg px-5 py-4`}>
      <div style={{backgroundColor: data?.iconBgColor}} className={` size-10 inline-block rounded-md p-2`}>{data?.icon}</div>
      <p className="text-[#7E84A3] text-sm">{data?.title}</p>
      <h3 className="text-xl font-medium text-[#131523]">{data?.count}</h3>
    </div>
  );
};

export default CompanyCard;
