import ServiceCard from "@/components/Cards/ServiceCard/ServiceCard";

interface ServiceOptionsProps {
  onServiceSelect: (type: string) => void;
  className?: string;
}

const ServiceOptions = ({ onServiceSelect, className = "" }: ServiceOptionsProps) => {
  return (
    <div className={`grid grid-cols-2 gap-6 ${className}`}>
      <ServiceCard
        onClick={() => onServiceSelect("inventory")}
        title="Inventory"
        image="inventory"
        description="Products you buy and or sell and that you track quantities of."
      />
      <ServiceCard
        onClick={() => onServiceSelect("non-inventory")}
        title="Non Inventory"
        image="non-inventory"
        description="Products you buy and or sell don't need to track quantities"
      />
      <ServiceCard
        onClick={() => onServiceSelect("service")}
        title="Service"
        image="service"
        description="Services that you provide to customers."
      />
      <ServiceCard
        onClick={() => onServiceSelect("bundle")}
        title="Bundle"
        image="bundle"
        description="A Collection of products and services that you sell together."
      />
    </div>
  );
};

export default ServiceOptions;
