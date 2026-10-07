import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";
import Invoice from "../_components/Invoice";

const page = () => {
  return (
    <div>
      <ManualBreadcrumbs
        items={[
          { label: "Sales", href: "/dashboard/sales/all_sales" },
          { label: "Invoice", href: "/dashboard/sales/invoice" },
        ]}
        className="mb-5 mt-0"
      />
      <Invoice />
    </div>
  );
};

export default page;
