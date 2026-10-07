'use client';
import { useAppSelector } from '@/app/redux/store';
import ReportFilter from '../_components/filter';
import { useSearchParams } from 'next/navigation';
import moment from 'moment';

const customerData = [
  { name: 'Green Valley Organics', amount: 482.9 },
  { name: "Sally's Sweet Treats", amount: 90.5 },
  { name: 'Benjamin Harper', amount: 388.0 },
  { name: 'Cupcakes & Co.', amount: 82.75 },
  { name: 'Linda Zhao', amount: 274.2 },
  { name: 'MetroLab Pharmaceuticals', amount: 1025.1 },
  { name: 'Big Apple Diner', amount: 199.99 },
  { name: 'Fresh & Local Distributors', amount: 65.45 },
  { name: 'Ocean Breeze Seafood', amount: 789.3 },
  { name: 'Timothy’s Tech Supplies', amount: 432.0 },
  { name: 'Everfresh Produce Co.', amount: 120.1 },
  { name: 'Harvest Moon Bakery', amount: 91.0 },
  { name: "Kelly's Custom Cakes", amount: 348.6 },
  { name: 'Urban Farm Collective', amount: 257.75 },
  { name: "Nora's Natural Goods", amount: 118.9 },
  { name: 'Precision MedTools', amount: 989.5 },
  { name: 'Sunrise Café', amount: 310.0 },
  { name: 'Flora & Fauna Exports', amount: 144.8 },
  { name: "Chef's Pantry Supplies", amount: 276.0 },
  { name: 'Baker’s Box Express', amount: 84.25 },
];

const Page = () => {
  const { Company } = useAppSelector((state) => state.CompanyData);
  const from = useSearchParams().get('from');
  const to = useSearchParams().get('to');

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('report-content')?.innerHTML;
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch (error) {
          return '';
        }
      })
      .join('\n');

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
            <html>
            <head>
            <style>${styles}</style>
            </head>
            <body>${printContent}</body>
            </html>
    `);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
  };

  return (
    <div className="text-sm">
      <ReportFilter
        OnPdfClick={printReport}
        params={{}}
        setParams={(newParams: any) => {}}
        onFilterChange={() => {}}
      />
      <div
        id="report-content"
        className="mx-auto mb-7 max-w-screen-2xl rounded border bg-white/40 p-4 py-7 text-sm"
      >
        <div className="mb-4 border-b border-accent_soft_black pb-4 text-center">
          <h1 className="mb-2 text-2xl font-semibold">Supplier Balance Summary</h1>
          <h2 className="mb-1 text-lg">{Company?.name || ''}</h2>

          <div className="mt-2 text-center text-sm font-medium text-accent_soft_black">
            {from && to ? (
              <p>
                from {moment(new Date(from)).format('DD MMMM YYYY')} to{' '}
                {moment(new Date('DD MMMM YYYY')).format('DD MMMM YYYY')}
              </p>
            ) : (
              <p>As of {new Date().toLocaleDateString()}</p>
            )}
          </div>
        </div>
        <div className="rounded bg-white/60">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h2 className="text-base font-medium text-accent_soft_black">Supplier/Vendor</h2>
            <h2 className="text-base font-medium text-accent_soft_black">Total</h2>
          </div>

          {customerData?.map((d, idx) => (
            <div key={idx} className="divide-y divide-gray-100">
              <div className="flex items-center justify-between py-1 pl-2 text-accent_soft_black hover:bg-gray-50">
                <p className="flex flex-1 items-center space-x-2">{d?.name}</p>
                <p className="min-w-[100px] pr-4 text-right text-sm font-normal tracking-wide">
                  {new Intl.NumberFormat('en-us', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(d?.amount)}
                </p>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-t-accent_soft_black py-1 pl-2 font-semibold text-accent_soft_black hover:bg-gray-50">
            <p className="flex flex-1 items-center space-x-2">Total</p>
            <p className="min-w-[100px] pr-4 text-right tracking-wide">
              {new Intl.NumberFormat('en-us', {
                style: 'currency',
                currency: 'USD',
              }).format(customerData?.reduce((prev, current) => prev + Number(current?.amount), 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
