'use client';

import React, { Suspense, useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useFetch } from '@/app/helpers/hooks';
import { fetchAPAgingDetail } from '@/app/helpers/backend';
import MainLoader from '@/components/MainLoader/MainLoader';
import LogoLoader from '@/components/MainLoader/logo-loader';
import ReportFilter from '../_components/filter';
import moment from 'moment';
import { useAppSelector } from '@/app/redux/store';
import { useRouter, useSearchParams } from 'next/navigation';

// Response shape — see ap_ar_frontend.md §3 (transactions grouped into aging bands).
interface DetailRow {
	uid?: string;
	transaction_type: string;
	date: string | null;
	num: string;
	vendor_display_name: string;
	store_full_name: string;
	due_date: string | null;
	past_due: number | null;
	amount: number;
	open_balance: number;
}
interface AgingBand {
	key: string;
	label: string;
	count: number;
	rows: DetailRow[];
	subtotal: { amount: number; open_balance: number };
}

// Body figures are plain numbers; subtotals and the grand total carry the currency symbol (§6).
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

// Vendor credits are negative and tinted red (§6).
const amountClass = (value: number) => (value < 0 ? 'text-red-600' : 'text-v-ink900');

// Dates arrive ISO (or null); render mm/dd/yyyy, blank when absent.
const formatDate = (value: string | null) => (value ? moment(value).format('MM/DD/YYYY') : '');

const ApAgingDetail = () => {
	const from = useSearchParams().get('from');
	const to = useSearchParams().get('to');
	const router = useRouter();
	const { Company } = useAppSelector((state) => state.CompanyData);

	// Collapsed aging bands (keyed by band.key). Empty = every band expanded by default;
	// clicking a band header toggles its detail rows while the subtotal stays visible.
	const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
	const toggleBand = (key: string) =>
		setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

	const { data, isPending } = useFetch(['ap-aging-detail', from, to], fetchAPAgingDetail, {
		start_date: from,
		end_date: to,
	});

	const bands: AgingBand[] = data?.bands ?? [];
	const grandTotal = data?.total ?? { amount: 0, open_balance: 0 };

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
					<h2 className="mt-1 text-lg font-medium text-v-ink700">A/P Aging Detail Report</h2>
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
					) : bands.length === 0 ? (
						<div className="py-16 text-center text-sm text-v-ink400">No data found</div>
					) : (
						<table className="min-w-full border-separate border-spacing-0 text-sm">
							<thead>
								<tr className="[&>th]:border-b [&>th]:border-v-border [&>th]:bg-v-wash2 [&>th]:px-4 [&>th]:py-3 [&>th]:text-xs [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-v-ink500">
									<th className="text-left">Date</th>
									<th className="text-left">Transaction Type</th>
									<th className="text-left">Num</th>
									<th className="text-left">Vendor</th>
									<th className="text-left">Store</th>
									<th className="text-left">Due Date</th>
									<th className="text-right">Past Due</th>
									<th className="text-right">Amount</th>
									<th className="text-right">Open Balance</th>
								</tr>
							</thead>
							<tbody>
								{bands.map((band) => {
									const isCollapsed = collapsed[band.key];
									return (
										<React.Fragment key={band.key}>
											{/* Aging band header with line count — click to collapse/expand */}
											<tr
												className="cursor-pointer select-none bg-v-tint150 transition-colors hover:bg-v-tint100"
												onClick={() => toggleBand(band.key)}
											>
												<td
													colSpan={9}
													className="px-4 py-2.5 text-left font-semibold text-v-ink900"
												>
													<div className="flex items-center gap-2">
														{isCollapsed ? (
															<FaChevronRight className="h-3.5 w-3.5 text-v-ink500" />
														) : (
															<FaChevronDown className="h-3.5 w-3.5 text-v-ink500" />
														)}
														<span>
															{band.label} ({band.count})
														</span>
													</div>
												</td>
											</tr>

											{/* Detail rows — hidden while the band is collapsed */}
											{!isCollapsed &&
												band.rows.map((row, idx) => (
													<tr
														key={row.uid || idx}
														className="transition-colors hover:bg-v-tint50 [&>td]:border-b [&>td]:border-v-border/60 [&>td]:px-4 [&>td]:py-2"
													>
														<td className="whitespace-nowrap text-v-ink700">
															{formatDate(row.date)}
														</td>
														<td className="whitespace-nowrap text-v-ink700">
															{row.transaction_type}
														</td>
														<td className="text-v-ink700">{row.num}</td>
														<td className="whitespace-nowrap text-v-ink700">
															{row.vendor_display_name}
														</td>
														<td className="text-v-ink700">{row.store_full_name}</td>
														<td className="whitespace-nowrap text-v-ink700">
															{formatDate(row.due_date)}
														</td>
														<td className="text-right tabular-nums text-v-ink700">
															{row.past_due !== null ? row.past_due : ''}
														</td>
														<td className={`text-right tabular-nums ${amountClass(row.amount)}`}>
															{formatNumber(row.amount)}
														</td>
														<td
															className={`text-right tabular-nums ${amountClass(row.open_balance)}`}
														>
															{formatNumber(row.open_balance)}
														</td>
													</tr>
												))}

											{/* Band subtotal — stays visible even when collapsed */}
											<tr className="bg-v-wash [&>td]:border-b [&>td]:border-v-border [&>td]:px-4 [&>td]:py-2">
												<td colSpan={7} className="text-right text-sm font-semibold text-v-ink700">
													Total for {band.label}
												</td>
												<td
													className={`text-right text-sm font-semibold tabular-nums ${amountClass(band.subtotal.amount)}`}
												>
													{formatCurrency(band.subtotal.amount)}
												</td>
												<td
													className={`text-right text-sm font-semibold tabular-nums ${amountClass(band.subtotal.open_balance)}`}
												>
													{formatCurrency(band.subtotal.open_balance)}
												</td>
											</tr>
										</React.Fragment>
									);
								})}

								{/* Grand total */}
								<tr className="bg-v-tint100 [&>td]:border-t-2 [&>td]:border-v-primary [&>td]:px-4 [&>td]:py-3">
									<td colSpan={7} className="text-right text-sm font-bold uppercase tracking-wide text-v-ink900">
										Total
									</td>
									<td
										className={`text-right text-base font-bold tabular-nums ${grandTotal.amount < 0 ? 'text-red-600' : 'text-v-ink900'}`}
									>
										{formatCurrency(grandTotal.amount)}
									</td>
									<td
										className={`text-right text-base font-bold tabular-nums ${grandTotal.open_balance < 0 ? 'text-red-600' : 'text-v-ink900'}`}
									>
										{formatCurrency(grandTotal.open_balance)}
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
			<ApAgingDetail />
		</Suspense>
	);
};

export default Page;
