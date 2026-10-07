import { fetchPaycheckDetails } from '@/app/helpers/backend';
import { ChevronDown, ChevronRight, X, HelpCircle } from 'lucide-react';
import moment from 'moment';
import React, { useEffect, useMemo, useState } from 'react';
import DotSpinner from '../../../employee/employees/_components/dot-spinner';
import { useRouter } from 'next/navigation';
import { getRelativePath } from '@/app/helpers/crypto';

type PayrollComponent = {
  uid?: string;
  payroll_type?: string;
  payroll_category?: string;
  current?: string;
  ytd?: string;
  hours?: string;
  rate?: string;
};

const formatLabel = (value?: string) =>
  value
    ? value
        .split('_')
        .join(' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : '-';

const formatMoney = (value?: string | number) => {
  const n = Number(value || 0);
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const sumCurrent = (rows?: PayrollComponent[]) =>
  (rows || []).reduce((acc, r) => acc + Number(r?.current || 0), 0);

const sumYtd = (rows?: PayrollComponent[]) =>
  (rows || []).reduce((acc, r) => acc + Number(r?.ytd || 0), 0);

const PaycheckDetails = ({
  employeeUID,
  payCheckUID,
  onClose,
}: {
  employeeUID: string;
  payCheckUID: string;
  onClose?: () => void;
}) => {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [openSections, setOpenSections] = useState({
    pay: true,
    otherPay: true,
    employeeTaxes: true,
    employerTaxes: true,
  });

  useEffect(() => {
    const fn = async () => {
      try {
        setIsPending(true);
        const response = await fetchPaycheckDetails(employeeUID, payCheckUID);
        setData(response);
      } catch (error) {
        //err
      } finally {
        setIsPending(false);
      }
    };
    employeeUID && payCheckUID && fn();
  }, [employeeUID, payCheckUID]);

  const components: PayrollComponent[] = data?.payroll_components || [];

  const grouped = useMemo(() => {
    const pay = components?.filter((c) => c?.payroll_category === 'PAY');
    const otherPay = components?.filter(
      (c) =>
        c?.payroll_category === 'EMPLOYEE_DEDUCTIONS' ||
        c?.payroll_category === 'COMPANY_PAID_CONTRIBUTIONS'
    );
    const employeeTaxes = components?.filter((c) => c?.payroll_category === 'EMPLOYEE_TAXES');
    const employerTaxes = components?.filter((c) => c?.payroll_category === 'EMPLOYER_TAXES');
    return { pay, otherPay, employeeTaxes, employerTaxes };
  }, [components]);

  const toggle = (key: keyof typeof openSections) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev?.[key] }));

  if (isPending) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white bg-opacity-50">
        <DotSpinner />
      </div>
    );
  }

  const printPaycheck = async () => {
    try {
      setIsPrinting(true);
      const res = await fetchPaycheckDetails(employeeUID, payCheckUID, {
        is_pdf: true,
      });
      if (res?.url) {
        window.open(
          `${process.env.NEXT_PUBLIC_APP_URL}/view?href=${getRelativePath(res?.url)}&base_type=s3`,
          '_blank'
        );
      }
    } catch (error) {
      //err
    } finally {
      setIsPrinting(false);
    }
  };

  const employee = data?.employee;
  const company = data?.company;

  return (
    <div className="flex flex-col bg-white text-sm text-[#1F2937]">
      <div className="mx-auto h-full w-full max-w-screen-xl flex-1 overflow-y-auto px-8 pb-10 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-6 rounded-xl border p-5 pb-6">
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Pay to</p>
            <h1 className="mt-0.5 text-xl font-medium text-[#111827]">
              {employee?.full_name || '-'}
            </h1>

            <div className="mt-5 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Employee address
                </p>
                <p className="mt-1 leading-5 text-gray-700">{employee?.work_locations || '-'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Pay date</p>
                <p className="mt-1 text-gray-700">
                  {data?.pay_date ? moment(data?.pay_date).format('MM/DD/YYYY') : '-'}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Pay period</p>
                <p className="mt-1 text-gray-700">{data?.pay_period || '-'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Paid from</p>
                <p className="mt-1 text-gray-700">
                  {data?.funding_account || company?.name || '-'}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500">Paid by</p>
                <p className="mt-1 text-gray-700">
                  {formatLabel(data?.pay_method)}
                  {data?.net_pay ? ` ($${formatMoney(data?.net_pay)})` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">Net pay</p>
            <p className="mt-0.5 text-3xl font-semibold text-[#111827]">
              ${formatMoney(data?.net_pay)}
            </p>
            {/* <select
              className="mt-4 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none"
              defaultValue=""
            >
              <option value="">Make adjustment</option>
            </select> */}
          </div>
        </div>

        <Section
          title="Pay"
          open={openSections?.pay}
          onToggle={() => toggle('pay')}
          columns={['TYPE', 'Hours', 'Rate', 'Current', 'YTD']}
          numericFromIndex={1}
        >
          {grouped?.pay?.map((row) => (
            <tr key={row?.uid} className="border-t border-gray-100">
              <td className="px-3 py-2.5 text-gray-700">{formatLabel(row?.payroll_type)}</td>
              <td className="px-3 py-2.5 text-right text-gray-700">{row?.hours || '-'}</td>
              <td className="px-3 py-2.5 text-right text-gray-700">
                {row?.rate ? `$${formatMoney(row?.rate)}` : '-'}
              </td>
              <td className="px-3 py-2.5 text-right text-gray-700">${formatMoney(row?.current)}</td>
              <td className="px-3 py-2.5 text-right text-gray-700">${formatMoney(row?.ytd)}</td>
            </tr>
          ))}
          <tr className="border-t border-gray-200 bg-[#F3F4F6]">
            <td className="px-3 py-2.5 text-gray-700">Total</td>
            <td className="px-3 py-2.5 text-right text-gray-700"></td>
            <td className="px-3 py-2.5 text-right text-gray-700"></td>
            <td className="px-3 py-2.5 text-right font-medium text-gray-800">
              ${formatMoney(sumCurrent(grouped?.pay))}
            </td>
            <td className="px-3 py-2.5 text-right font-medium text-gray-800">
              ${formatMoney(sumYtd(grouped?.pay))}
            </td>
          </tr>
        </Section>

        <Section
          title="Other Pay"
          open={openSections?.otherPay}
          onToggle={() => toggle('otherPay')}
          columns={['TYPE', 'Hours', 'Rate', 'Current', 'YTD']}
          numericFromIndex={1}
        >
          {grouped?.otherPay?.map((row) => (
            <tr key={row?.uid} className="border-t border-gray-100">
              <td className="px-3 py-2.5 text-gray-700">{formatLabel(row?.payroll_type)}</td>
              <td className="px-3 py-2.5 text-right text-gray-700">{row?.hours || '-'}</td>
              <td className="px-3 py-2.5 text-right text-gray-700">
                {row?.rate ? `$${formatMoney(row?.rate)}` : '-'}
              </td>
              <td className="px-3 py-2.5 text-right text-gray-700">${formatMoney(row?.current)}</td>
              <td className="px-3 py-2.5 text-right text-gray-700">${formatMoney(row?.ytd)}</td>
            </tr>
          ))}
          <tr className="border-t border-gray-200 bg-[#F3F4F6]">
            <td className="px-3 py-2.5 text-gray-700">Total</td>
            <td className="px-3 py-2.5 text-right text-gray-700"></td>
            <td className="px-3 py-2.5 text-right text-gray-700"></td>
            <td className="px-3 py-2.5 text-right font-medium text-gray-800">
              ${formatMoney(sumCurrent(grouped?.otherPay))}
            </td>
            <td className="px-3 py-2.5 text-right font-medium text-gray-800">
              ${formatMoney(sumYtd(grouped?.otherPay))}
            </td>
          </tr>
        </Section>

        <Section
          title="Employee taxes"
          open={openSections?.employeeTaxes}
          onToggle={() => toggle('employeeTaxes')}
          columns={['TYPE', 'Current', 'YTD']}
          numericFromIndex={1}
        >
          {grouped?.employeeTaxes?.map((row) => (
            <tr key={row?.uid} className="border-t border-gray-100">
              <td className="px-3 py-2.5 text-gray-700">{formatLabel(row?.payroll_type)}</td>
              <td className="px-3 py-2.5 text-right text-gray-700">${formatMoney(row?.current)}</td>
              <td className="px-3 py-2.5 text-right text-gray-700">${formatMoney(row?.ytd)}</td>
            </tr>
          ))}
          <tr className="border-t border-gray-200 bg-[#F3F4F6]">
            <td className="px-3 py-2.5 text-gray-700">Total</td>
            <td className="px-3 py-2.5 text-right font-medium text-gray-800">
              ${formatMoney(sumCurrent(grouped?.employeeTaxes))}
            </td>
            <td className="px-3 py-2.5 text-right font-medium text-gray-800">
              ${formatMoney(sumYtd(grouped?.employeeTaxes))}
            </td>
          </tr>
        </Section>

        <Section
          title="Employer taxes"
          open={openSections?.employerTaxes}
          onToggle={() => toggle('employerTaxes')}
          columns={['TYPE', 'Current', 'YTD']}
          numericFromIndex={1}
        >
          {grouped?.employerTaxes?.map((row) => (
            <tr key={row?.uid} className="border-t border-gray-100">
              <td className="px-3 py-2.5 text-gray-700">{formatLabel(row?.payroll_type)}</td>
              <td className="px-3 py-2.5 text-right text-gray-700">${formatMoney(row?.current)}</td>
              <td className="px-3 py-2.5 text-right text-gray-700">${formatMoney(row?.ytd)}</td>
            </tr>
          ))}
          <tr className="border-t border-gray-200 bg-[#F3F4F6]">
            <td className="px-3 py-2.5 text-gray-700">Total</td>
            <td className="px-3 py-2.5 text-right font-medium text-gray-800">
              ${formatMoney(sumCurrent(grouped?.employerTaxes))}
            </td>
            <td className="px-3 py-2.5 text-right font-medium text-gray-800">
              ${formatMoney(sumYtd(grouped?.employerTaxes))}
            </td>
          </tr>
        </Section>

        {/* <div className="mt-8 max-w-md">
          <label className="text-[11px] uppercase tracking-wide text-gray-500">Memo</label>
          <textarea
            readOnly
            value={data?.memo || ''}
            className="mt-1 h-20 w-full resize-none rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none"
          />
        </div> */}
      </div>

      <div className="sticky bottom-0 left-0 right-0 flex h-16 items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
        <button
          type="button"
          disabled={isPrinting}
          onClick={() => onClose?.()}
          className="border border-accent_soft_black px-7 py-2 text-sm font-medium text-accent_soft_black hover:underline"
        >
          Close
        </button>

        <div className="flex items-center gap-3">
          {/* <button
            type="button"
            className="rounded border border-[#2CA01C] px-4 py-1.5 text-sm font-medium text-[#2CA01C] hover:bg-[#2CA01C]/5"
          >
            Transaction journal
          </button> */}
          <button
            disabled={isPrinting}
            onClick={() => printPaycheck()}
            type="button"
            className="rounded bg-accent_soft_black px-7 py-2 text-sm font-medium text-white hover:bg-accent_soft_black/80"
          >
            {isPrinting ? 'Printing...' : 'Print'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({
  title,
  open,
  onToggle,
  columns,
  numericFromIndex = 1,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  columns: string[];
  numericFromIndex?: number;
  children: React.ReactNode;
}) => {
  return (
    <div className="mt-6 rounded-xl border p-5">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-base font-medium text-[#111827]"
      >
        {open ? (
          <ChevronDown className="size-4 text-gray-600" />
        ) : (
          <ChevronRight className="size-4 text-gray-600" />
        )}
        {title}
      </button>

      {open && (
        <table className="mt-3 w-full">
          <thead>
            <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wide text-gray-500">
              {columns?.map((c, i) => (
                <th
                  key={c}
                  className={`px-3 py-2 font-medium ${i >= numericFromIndex ? 'text-right' : 'text-left'}`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      )}
    </div>
  );
};

export default PaycheckDetails;
