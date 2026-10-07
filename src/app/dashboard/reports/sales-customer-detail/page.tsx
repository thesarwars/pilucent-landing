"use client";

import { fetchSalesByCustomerDetail } from "@/app/helpers/backend";
import SalesDetailReport from "../_components/SalesDetailReport";

/**
 * Sales by Customer Detail — one row per transaction line, grouped by customer, with a
 * running balance per group. Identical in shape to the product/service detail report (the
 * grouping and one column differ, and both come off the response metadata), so both render
 * through SalesDetailReport. See SALES_REPORTS.md.
 */
const SalesByCustomerDetail = () => (
  <SalesDetailReport
    queryKey="sales-by-customer-detail"
    fetcher={fetchSalesByCustomerDetail}
    fallbackTitle="Sales by Customer Detail"
  />
);

export default SalesByCustomerDetail;
