import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";
import Bill from "./_components/Bill";

const page = () => {
  return (
    <div>
      <ManualBreadcrumbs
        items={[
          { label: "Expenses", href: "/dashboard/expenses/expenses" },
          { label: "Bill", href: "/dashboard/expenses/bill" },
        ]}
        className="mb-5 mt-0"
      />
      <Bill />
    </div>
  );
};

export default page;
