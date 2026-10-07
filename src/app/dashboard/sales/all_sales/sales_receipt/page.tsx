import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";
import SalesReceipt from "./_components/SalesReceipt";

const page = () => {
  return (
    <>
      <ManualBreadcrumbs
        items={[
          { label: "Sales", href: "/dashboard/sales/all_sales" },
          { label: "Sales Receipt", href: "/dashboard/sales/sales_receipt" },
        ]}
        className="mb-5 mt-0"
      />
      <SalesReceipt />
    </>
  );
};

export default page;
