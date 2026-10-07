import Button from "@/components/ui/RawButton";

const Tabs = ({
  items,
  selectedTab,
  setSelectedTab,
  selectedDataCount = 0,
}: {
  items?: any[];
  selectedTab?: string;
  setSelectedTab?: any;
  selectedDataCount?: any;
}) => {
  return (
    <div className="flex items-center flex-wrap gap-4">
      {items?.map((tab) => (
        <Button
          onClick={() => setSelectedTab(tab.value)}
          key={tab.value}
          className={`border py-[8px] bg-white text-nowrap ${tab.value == selectedTab ? "bg-accent_soft_blue text-white" : "border-[#7E84A3] text-accent_soft_black"}`}
        >
          {tab?.title}
          {tab.value == selectedTab && ` (${selectedDataCount})`}
        </Button>
      ))}
    </div>
  );
};

export default Tabs;
