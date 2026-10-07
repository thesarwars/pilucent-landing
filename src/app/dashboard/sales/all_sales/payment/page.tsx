import React from "react";
import PaymentReceived from "./_components/PaymentReceived";
import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";

const page = () => {
  return (
    <>
      <ManualBreadcrumbs
        items={[
          { label: "Sales", href: "/dashboard/sales/all_sales" },
          { label: "Payment", href: "/dashboard/sales/payment" },
        ]}
        className="mb-5 mt-0"
      />
      <PaymentReceived />
    </>
  );
};

export default page;
