import { useSearchParams } from "next/navigation";
import AllListTable from "./AllListTable";
import InvoiceListTable from "./InvoiceListTable";
import EstimateListTable from "./EstimateListTable";
import SalesReceiptsTable from "./SalesReceiptsTable";
import RefundReceiptsListTable from "./RefundReceiptsListTable";
import CreditNoteListTable from "./CreditNoteListTable";
import PaymentListTable from "./PaymentListTable";

const AllSalesTable = () => {
  // ?sale_type holds the readable/spaced value (e.g. "sale receipt"); default "all".
  const saleType = useSearchParams().get("sale_type") || "all";

  return (
    <div className="mt-8">
      {saleType === "all" && <AllListTable />}
      {saleType === "invoice" && <InvoiceListTable />}
      {saleType === "estimate" && <EstimateListTable />}
      {saleType === "sale receipt" && <SalesReceiptsTable />}
      {saleType === "refund receipt" && <RefundReceiptsListTable />}
      {saleType === "credit note" && <CreditNoteListTable />}
      {saleType === "payment received" && <PaymentListTable />}
    </div>
  );
};

export default AllSalesTable;
