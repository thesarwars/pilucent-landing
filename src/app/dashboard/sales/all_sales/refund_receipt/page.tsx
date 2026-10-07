import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";
import RefundReceipt from "./_components/RefundReceipt";

const page = () => {
  return (
    <>
      <ManualBreadcrumbs
        items={[
          { label: "Sales", href: "/dashboard/sales/all_sales" },
          { label: "Refund Receipt", href: "/dashboard/sales/refund_receipt" },
        ]}
        className="mb-5 mt-0"
      />
      <RefundReceipt />
    </>
  );
};

export default page;
