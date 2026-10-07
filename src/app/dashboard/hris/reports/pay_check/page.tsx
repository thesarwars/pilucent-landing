'use client';
import { useAppSelector } from '@/app/redux/store';
import { Fragment, useEffect, useState } from 'react';
import moment from 'moment';
import { ChevronDown, ChevronRight } from 'lucide-react';
import ReportFilter from '../../payroll/report/_components/filter2';
import { useFetch } from '@/app/helpers/hooks';
import { fetchPaycheckReport } from '@/app/helpers/backend';
import PDFModal from '@/app/dashboard/reports/_components/PDFModal';
import PaycheckDetails from './_components/PaycheckDetails';

const getCurrentMonthStartAndEndDates = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startOfMonth: startOfMonth.toISOString().split('T')[0],
    endOfMonth: endOfMonth.toISOString().split('T')[0],
  };
};

const PaycheckHistoryPage = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [employeeUID, setEmployeeUID] = useState<string | null>(null);
  const [payCheckUID, setPayCheckUID] = useState<string | null>(null);
  const [params, setParams] = useState({
    created_at_after: getCurrentMonthStartAndEndDates().startOfMonth,
    created_at_before: getCurrentMonthStartAndEndDates().endOfMonth,
  });

  const {
    data,
    isPending,
    setQueryParams,
    params: queryParams,
  } = useFetch(['paycheck-report', params], fetchPaycheckReport);
  const { Company } = useAppSelector((state) => state.CompanyData);

  useEffect(() => {
    setQueryParams({
      ...queryParams,
      start_date: params?.created_at_after,
      end_date: params?.created_at_before,
    });
  }, [params]);

  return (
    <div className="mx-auto p-4">
      {/* Header */}

      <ReportFilter
        params={params}
        setParams={setParams}
        // onFilterChange={handleFilterChange}
      />

      <div id="report-content" className="rounded-xl border bg-white px-7 py-12 text-sm">
        <div className="mb-8 flex flex-col justify-center text-center">
          <h1 className="mb-2 text-3xl font-medium">Paycheck History</h1>
          <h2 className="mb-1 text-lg">{Company?.name || 'Binary Burst'}</h2>
          <div className="mt-2 text-center text-sm font-medium text-gray-900">
            From{' '}
            {moment(new Date(params?.created_at_after || '01/01/2025')).format('DD MMMM, YYYY')}
            {'  '} to{' '}
            {moment(new Date(params?.created_at_before || '12/31/2025')).format('DD MMMM, YYYY')}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white">
            <thead>
              <tr className="bg-gray-50 text-left text-base font-normal">
                <th className="w-10 border-b px-4 py-2.5 font-normal"></th>
                <th className="border-b px-4 py-2 font-normal">Name</th>
                <th className="border-b px-4 py-2 font-normal">Pay period</th>
                <th className="border-b px-4 py-2 font-normal">Total pay</th>
                <th className="border-b px-4 py-2 font-normal">Net pay</th>
                <th className="border-b px-4 py-2 font-normal">Pay method</th>
                <th className="border-b px-4 py-2 font-normal">Check number</th>
                <th className="border-b px-4 py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.results?.map((row: any) => {
                const employee = row?.employee;
                const uid = employee?.uid;
                const isOpen = expanded === uid;
                const runs = row?.processed_data || [];

                return (
                  <Fragment key={uid}>
                    <tr
                      onClick={() => setExpanded(isOpen ? null : uid)}
                      className="cursor-pointer border-b text-sm font-normal hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        {isOpen ? (
                          <ChevronDown className="size-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="size-4 text-gray-600" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{employee?.full_name}</td>
                      <td className="px-4 py-3">{employee?.pay_period}</td>
                      <td className="px-4 py-3">${employee?.total_pay}</td>
                      <td className="px-4 py-3">${employee?.net_pay}</td>
                      <td className="px-4 py-3">
                        {employee?.pay_method ? employee.pay_method.split('_').join(' ') : '-'}
                      </td>
                      <td className="px-4 py-3">{employee?.check_number || '-'}</td>
                      <td className="px-4 py-3">{employee?.status || '-'}</td>
                    </tr>

                    {isOpen && runs.length > 0 && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="px-4 py-3 pl-12">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs uppercase text-gray-500">
                                <th className="px-3 py-2 font-medium">Pay date</th>
                                <th className="px-3 py-2 font-medium">Pay period</th>
                                <th className="px-3 py-2 font-medium">Gross pay</th>
                                <th className="px-3 py-2 font-medium">Net pay</th>
                                <th className="px-3 py-2 font-medium">Pay method</th>
                                <th className="px-3 py-2 font-medium">Details</th>
                              </tr>
                            </thead>
                            <tbody>
                              {runs.map((run: any) => (
                                <tr key={run?.uid} className="border-t border-gray-200">
                                  <td className="px-3 py-2">
                                    {run?.pay_date
                                      ? moment(run.pay_date).format('DD MMM, YYYY')
                                      : '-'}
                                  </td>
                                  <td className="px-3 py-2">{run?.pay_period}</td>
                                  <td className="px-3 py-2">${run?.gross_pay}</td>
                                  <td className="px-3 py-2">${run?.net_pay}</td>
                                  <td className="px-3 py-2">
                                    {run?.pay_method ? run.pay_method.split('_').join(' ') : '-'}
                                  </td>
                                  <td
                                    onClick={() => {
                                      setIsOpen(true);
                                      setEmployeeUID(employee?.uid);
                                      setPayCheckUID(run?.uid);
                                    }}
                                    className="cursor-pointer px-3 py-2 text-blue-600 hover:underline"
                                  >
                                    View details
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {!isPending && !data?.results?.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    No paycheck records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary section */}
        <PDFModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Paycheck History">
          <PaycheckDetails
            onClose={() => {
              setIsOpen(false);
              setEmployeeUID(null);
              setPayCheckUID(null);
            }}
            employeeUID={employeeUID as string}
            payCheckUID={payCheckUID as string}
          />
        </PDFModal>
      </div>
    </div>
  );
};

export default PaycheckHistoryPage;
