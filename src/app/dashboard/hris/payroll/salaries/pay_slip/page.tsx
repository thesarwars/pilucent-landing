// "use client";
// import PaySlip from "../../_components/PaySlip";
// import { useSearchParams } from "next/navigation";
// import { GET_PAYSLIP } from "../queries/queries";

// const PaySlipPage = () => {
//   const searchParams = useSearchParams();
//   const id = Number(searchParams.get("id"));
//   const { data, loading, error } = useQuery(GET_PAYSLIP, {
//     variables: { id },
//     skip: !id,
//   });

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error loading payslip.</div>;

//   return <PaySlip payslip={data?.payslip} />;
// };

// export default PaySlipPage;

import React from 'react';

const page = () => {
  return (
    <div>
      
    </div>
  );
};

export default page;