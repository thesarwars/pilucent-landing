'use client';

import { Suspense, useState } from 'react';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import { useFetch } from '@/app/helpers/hooks';
import { fetchARAgingSummary } from '@/app/helpers/backend';
import MainLoader from '@/components/MainLoader/MainLoader';
import LogoLoader from '@/components/MainLoader/logo-loader';
import ReportFilter from '../_components/filter';
import moment from 'moment';
import { useAppSelector } from '@/app/redux/store';
import { useRouter, useSearchParams } from 'next/navigation';

// Response shape — see ap_ar_frontend.md §4 (customer × bucket matrix).
interface Bucket {
	key: string;
	label: string;
}
interface SummaryRow {
	customer_uid?: string;
	customer_display_name: string;
	buckets: Record<string, number>;
	total: number;
}

// Body figures are plain numbers; the grand total carries the currency symbol (§6).
const formatNumber = (value: number) =>
	new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);

const formatCurrency = (value: number) =>
	new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(value);

// Negative totals are unapplied credits / overpayments — tinted red (§6).
const amountClass = (value: number) => (value < 0 ? 'text-red-600' : 'text-v-ink900');

// Leave zero cells blank so the eye lands on real balances (§4).
const renderCell = (value?: number) => (!value ? '' : formatNumber(value));

type SortDir = null | 'asc' | 'desc';

const ArAgingSummary = () => {
	const from = useSearchParams().get('from');
	const to = useSearchParams().get('to');
	const router = useRouter();
	const { Company } = useAppSelector((state) => state.CompanyData);

	const { data, isPending } = useFetch(['ar-aging-summary', from, to], fetchARAgingSummary, {
		start_date: from,
		end_date: to,
	});

	const buckets: Bucket[] = data?.buckets ?? [];
	const rows: SummaryRow[] = data?.rows ?? [];
	const columnTotals: Record<string, number> = data?.column_totals ?? {};
	const grandTotal: number = data?.total ?? 0;

	const [sortDir, setSortDir] = useState<SortDir>(null);
	const cycleSort = () =>
		setSortDir((prev) => (prev === null ? 'desc' : prev === 'desc' ? 'asc' : null));

	// Rows arrive sorted A→Z by name; the Total header offers an amount sort (§4).
	const displayRows = sortDir
		? [...rows].sort((a, b) => (sortDir === 'asc' ? a.total - b.total : b.total - a.total))
		: rows;

	const asOf = data?.as_of
		? moment(data.as_of).format('MMMM DD, YYYY')
		: to
			? moment(new Date(to)).format('MMMM DD, YYYY')
			: moment().format('MMMM DD, YYYY');

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

	const SortIcon = sortDir === 'desc' ? FaSortDown : sortDir === 'asc' ? FaSortUp : FaSort;

	return (
		<div>
			<ReportFilter
				OnPdfClick={() => printReport()}
				params={{}}
				value={{ created_at_after: from, created_at_before: to }}
				setParams={(newParams: any) =>
					router.push(
						`?from=${newParams?.created_at_after || ''}&to=${newParams?.created_at_before || ''}`,
					)
				}
				onFilterChange={() => {}}
			/>

			<div
				id="report-content"
				className="mx-auto mb-7 overflow-hidden rounded-2xl border border-v-border bg-white shadow-v-card"
			>
				{/* Header Section */}
				<div className="border-b border-v-border bg-gradient-to-b from-v-tint50 to-white px-6 py-7 text-center sm:px-10">
					<h1 className="text-3xl font-bold tracking-tight text-v-ink900">
						{Company?.name || 'Halo Axis'}
					</h1>
					<h2 className="mt-1 text-lg font-medium text-v-ink700">A/R Aging Summary Report</h2>
					<div className="mt-2 text-sm text-v-ink500">
						<p>
							{from && to
								? `From ${moment(new Date(from)).format('DD MMMM, YYYY')} to ${moment(
										new Date(to),
									).format('DD MMMM, YYYY')}`
								: 'All Dates'}
						</p>
						<p className="text-xs text-v-ink400">As of {asOf}</p>
					</div>
				</div>

				{/* Table Section */}
				<div className="overflow-x-auto p-2 sm:p-4">
					{isPending ? (
						<div className="flex items-center justify-center py-16">
							<LogoLoader size={50} color={'#16151c'} />
						</div>
					) : rows.length === 0 ? (
						<div className="py-16 text-center text-sm text-v-ink400">No data found</div>
					) : (
						<table className="min-w-full border-separate border-spacing-0 text-sm">
							<thead>
								<tr>
									<th className="border-b border-v-border bg-v-wash2 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-v-ink500">
										Customer
									</th>
									{buckets.map((bucket) => (
										<th
											key={bucket.key}
											className="whitespace-nowrap border-b border-v-border bg-v-wash2 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-v-ink500"
										>
											{bucket.label}
										</th>
									))}
									<th className="border-b border-v-border bg-v-wash2 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-v-ink500">
										<button
											type="button"
											onClick={cycleSort}
											className="ml-auto flex items-center gap-1.5 uppercase tracking-wider text-v-ink500 transition-colors hover:text-v-primary"
											title="Sort by amount"
										>
											<SortIcon className="h-3 w-3" />
											Total
										</button>
									</th>
								</tr>
							</thead>
							<tbody>
								{displayRows.map((row, idx) => (
									<tr key={row.customer_uid || idx} className="transition-colors hover:bg-v-tint50">
										<td className="whitespace-nowrap border-b border-v-border/60 px-4 py-2 font-medium text-v-ink700">
											{row.customer_display_name}
										</td>
										{buckets.map((bucket) => (
											<td
												key={bucket.key}
												className={`border-b border-v-border/60 px-4 py-2 text-right tabular-nums ${amountClass(row.buckets?.[bucket.key] ?? 0)}`}
											>
												{renderCell(row.buckets?.[bucket.key])}
											</td>
										))}
										<td
											className={`border-b border-v-border/60 px-4 py-2 text-right font-medium tabular-nums ${amountClass(row.total)}`}
										>
											{formatNumber(row.total)}
										</td>
									</tr>
								))}

								{/* Column totals + grand total */}
								<tr className="bg-v-tint100">
									<td className="rounded-bl-xl border-t-2 border-v-primary px-4 py-3 text-sm font-bold uppercase tracking-wide text-v-ink900">
										Total
									</td>
									{buckets.map((bucket) => (
										<td
											key={bucket.key}
											className={`border-t-2 border-v-primary px-4 py-3 text-right text-sm font-bold tabular-nums ${amountClass(columnTotals?.[bucket.key] ?? 0)}`}
										>
											{renderCell(columnTotals?.[bucket.key])}
										</td>
									))}
									<td
										className={`rounded-br-xl border-t-2 border-v-primary px-4 py-3 text-right text-base font-bold tabular-nums ${grandTotal < 0 ? 'text-red-600' : 'text-v-ink900'}`}
									>
										{formatCurrency(grandTotal)}
									</td>
								</tr>
							</tbody>
						</table>
					)}
				</div>

				{/* Footer — generation stamp */}
				<div className="border-t border-v-border bg-v-card-subtle px-6 py-3">
					<p className="text-right text-xs text-v-ink400">
						Generated {moment().format('MMMM DD, YYYY')} · Accrual basis · Aged by due date
					</p>
				</div>
			</div>
		</div>
	);
};

const Page = () => {
	return (
		<Suspense fallback={<MainLoader />}>
			<ArAgingSummary />
		</Suspense>
	);
};

export default Page;
