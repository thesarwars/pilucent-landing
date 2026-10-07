"use client";

import { fetchSalesByProductServiceDetail } from "@/app/helpers/backend";
import SalesDetailReport from "../_components/SalesDetailReport";


const SalesByProductServiceDetail = () => (
  <SalesDetailReport
    queryKey="sales-by-product-service-detail"
    fetcher={fetchSalesByProductServiceDetail}
    fallbackTitle="Sales by Product/Service Detail"
  />
);

export default SalesByProductServiceDetail;
