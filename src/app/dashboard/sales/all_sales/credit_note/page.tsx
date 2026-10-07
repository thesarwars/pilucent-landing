import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";
import CreditNote from "./_components/CreditNote";

const page = () => {
  return (
    <>
      <ManualBreadcrumbs
        items={[
          { label: "Sales", href: "/dashboard/sales/all_sales" },
          { label: "Credit Note", href: "/dashboard/sales/credit_note" },
        ]}
        className="mb-5 mt-0"
      />
      <CreditNote />
    </>
  );
};

export default page;
