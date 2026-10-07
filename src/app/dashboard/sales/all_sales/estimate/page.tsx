import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";
import Estimate from "./_components/Estimate";

const page = () => {
  return (
    <>
      <ManualBreadcrumbs
        items={[
          { label: "Sales", href: "/dashboard/sales/all_sales" },
          { label: "Estimate", href: "/dashboard/sales/estimate" },
        ]}
        className="mb-5 mt-0"
      />
      <Estimate />
    </>
  );
};

export default page;
