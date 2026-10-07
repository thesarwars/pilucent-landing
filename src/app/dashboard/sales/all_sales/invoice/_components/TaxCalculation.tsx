import { useMemo, useState } from "react";

const NY_BREAKDOWN_LABELS: Record<string, string> = {
  state: "New York State",
  mctd: "MCTD",
  local: "Local",
};

const MN_BREAKDOWN_LABELS: Record<string, string> = {
  state_rate: "Minnesota State",
  other_local_rate: "Metro Housing",
  other_area_rate: "Metro Transportation",
  county_other_local_rate: "County Other Local",
  county_transit_rate: "County Transit",
  city_rate: "Local (City)",
};

const TaxCalculation = ({
  invoiceData,
  invoiceItems,
}: {
  invoiceData: any;
  invoiceItems: any;
}) => {
  const [collapsedItems, setCollapsedItems] = useState<any[]>([]);
  const { sales_tax } = invoiceData;

  const breakdownRows = useMemo(() => {
    if (sales_tax?.tax_group?.length > 0) {
      return sales_tax.tax_group.map((t: any) => ({
        label: t.nickname,
        rate: Number(t.rate),
      }));
    }
    const raw = sales_tax?.apiResponse?.tax?.breakdown;
    if (!raw) return [];
    const labels =
      sales_tax?.state === "MN" ? MN_BREAKDOWN_LABELS : NY_BREAKDOWN_LABELS;
    return Object.entries(raw)
      .filter(([, v]) => Number(v) > 0)
      .map(([key, val]) => ({
        label: labels[key] || key,
        rate: Number(val) * 100,
      }));
  }, [sales_tax]);

  const toggleExpand = (product_uid: string) => {
    if (collapsedItems.includes(product_uid)) {
      const updated = collapsedItems?.filter((i) => i != product_uid);
      setCollapsedItems(updated);
    } else {
      setCollapsedItems([...collapsedItems, product_uid]);
    }
  };

  console.log(sales_tax);

  return (
    <div className="text-sm">
      <div className="mb-6 flex items-start gap-4">
        <div className="mt-1 flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100">
          <svg
            className="size-6 text-teal-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <h2>Product and Services Tax Calculation</h2>
          </div>
          <p className="text-[13px] text-gray-600">
            {sales_tax?.auto_calculated 
              ? `Auto-calculated ${sales_tax?.state || 'NY'} sales tax (${(sales_tax?.total_rate || 0).toFixed(3)}%) for ${sales_tax?.county} County`
              : "Manage the tax rates being applied to each line item on your invoice:"
            }
          </p>
        </div>
      </div>
      
      {sales_tax?.auto_calculated && breakdownRows.length > 0 && (
        <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Tax Rate Breakdown</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {breakdownRows.map((row: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span className="text-blue-700">{row.label}:</span>
                <span className="text-blue-900 font-medium">{row.rate.toFixed(3)}%</span>
              </div>
            ))}
            <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between font-medium col-span-2">
              <span className="text-blue-700">Total:</span>
              <span className="text-blue-900">{(sales_tax?.total_rate || 0).toFixed(3)}%</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="text-sm font-medium uppercase tracking-wide text-gray-700">
          PRODUCT
        </div>
        <div className="text-right text-sm font-medium uppercase tracking-wide text-gray-700">
          SALE AMOUNT
        </div>
      </div>

      {invoiceItems?.map((row: any, index: number) => {
        if (row?.product_service?.uid && row?.is_tax) {
          return (
            <div key={index} className="mb-4">
              <div className="overflow-hidden rounded-lg bg-gray-50">
                <div
                  className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-100"
                  onClick={() => toggleExpand(row?.product_service?.uid)}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${!collapsedItems?.includes(row?.product_service?.uid) ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span className="font-medium text-gray-900">
                      {row?.product_service?.title}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">
                    ${row?.price}
                  </span>
                </div>

                <div
                  className={`w-full transition-all duration-300 ease-in-out ${!collapsedItems?.includes(row?.product_service?.uid) ? "opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
                >
                  <div className="px-4 pb-4">
                    <p className="mb-4 text-xs text-gray-600">
                      {sales_tax?.auto_calculated 
                        ? `Auto-calculated for ${sales_tax?.county} County, ${sales_tax?.state || 'NY'}`
                        : "Uncategorized - standard rate applied"
                      }
                    </p>

                    <div className="rounded border bg-white">
                      <div className="grid grid-cols-4 gap-4 border-b bg-gray-50 px-2 py-2 text-xs font-medium uppercase tracking-wide text-gray-700">
                        <div className="">AGENCY</div>
                        <div className="text-center">TAXABLE AMOUNT</div>
                        <div className="text-center">TAX RATE</div>
                        <div className="text-right">SALES TAX TOTAL</div>
                      </div>
                      {breakdownRows.map((br: any, brIdx: number) => (
                        <div
                          key={brIdx}
                          className="grid grid-cols-4 gap-4 border-b p-2 text-sm font-light last:border-b-0"
                        >
                          <div className="line-clamp-2 text-xs text-gray-900">
                            {br.label}
                          </div>
                          <div className="text-center text-gray-700">
                            ${row.price}
                          </div>
                          <div className="text-nowrap text-center text-[13px] text-gray-700">
                            {br.label} - {br.rate.toFixed(3)}%
                          </div>
                          <div className="text-right text-sm text-gray-700">
                            ${(
                              (Number(row?.price || 0) / 100) *
                              br.rate
                            ).toFixed(2)}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 font-medium">
                        <p>Total sales tax for {row?.product_service?.title}</p>
                        <p>
                          ${" "}
                          {Number(
                            (Number(row?.price || 0) / 100) *
                              (sales_tax?.total_rate || 0),
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      })}
      <div className="flex items-center text-base border-t border-t-accent_soft_black justify-between px-4 py-2">
        <p>Total sales tax </p>
        <p>
          $ {invoiceData?.total_tax}
        </p>
      </div>
    </div>
  );
};

export default TaxCalculation;
