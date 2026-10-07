'use client';

import React, { useMemo, useState } from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useAppSelector } from '@/app/redux/store';
import moment from 'moment';
import ReportFilter from '../_components/filter';
import { useFetch } from '@/app/helpers/hooks';
import { fetchInventoryValuationSummary } from '@/app/helpers/backend';
import LogoLoader from '@/components/MainLoader/logo-loader';

// Response shape — see inventory_tax_frontend.md §2 (one row per inventory item + a
// weighted total). Inventory Valuation Summary is a CURRENT snapshot; it ignores dates.
interface SummaryRow {
	uid?: string;
	product: string; // item name
	sku?: string;
	quantity: number;
	asset_value: number; // cost value of on-hand units
	calc_avg: number; // asset_value / quantity (avg unit cost)
}

const formatNumber = (value: number) =>
	value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatCurrency = (value: number) => `$${formatNumber(value)}`;

// Negatives are flagged in red.
const signClass = (value: number) => (value < 0 ? 'text-red-600' : '');

// Read the avg unit cost as given; fall back to asset_value / quantity if omitted (§2).
const avgOf = (row: SummaryRow) =>
	typeof row.calc_avg === 'number' ? row.calc_avg : row.quantity ? row.asset_value / row.quantity : 0;

type SortDir = null | 'asc' | 'desc';

const InventoryValuationSummaryReport = () => {
	const { Company } = useAppSelector((state) => state.CompanyData);
	const [params, setParams] = useState<any>({});
	// Calc. Avg sort control: cycles unsorted → ascending → descending.
	const [sortDir, setSortDir] = useState<SortDir>(null);

	// Snapshot report — no date params (§2). Keyed once; ReportFilter drives print only.
	const { data, isPending } = useFetch(
		['inventory-valuation-summary'],
		fetchInventoryValuationSummary,
	);

	const rows: SummaryRow[] = data?.rows ?? [];
	const total = data?.total ?? { quantity: 0, asset_value: 0, calc_avg: 0 };

	const cycleSort = () =>
		setSortDir((prev) => (prev === null ? 'asc' : prev === 'asc' ? 'desc' : null));

	const sortedProducts = useMemo(() => {
		if (!sortDir) return rows;
		return [...rows].sort((a, b) => {
			const diff = avgOf(a) - avgOf(b);
			return sortDir === 'asc' ? diff : -diff;
		});
	}, [rows, sortDir]);

	const asOf = data?.as_of ? moment(data.as_of).format('DD MMMM, YYYY') : null;

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
		<div className="">
			<ReportFilter
				OnPdfClick={printReport}
				defaultRange="all_dates"
				setParams={setParams}
				params={params}
				onFilterChange={() => {}}
			/>

			<div id="report-content" className="rounded border bg-white/40 p-4 py-7 text-sm">
				<div className="mb-4 border-b border-b-accent_soft_black pb-4 text-center">
					<h1 className="mb-2 text-2xl font-bold">{Company?.name || 'Jumatech Accounting Firm'}</h1>
					<h2 className="mb-1 text-base">Inventory Valuation Summary</h2>
					{/* Date basis — inventory value is a point-in-time snapshot (§2 / §6) */}
					<div className="mt-1 text-center text-sm font-medium text-gray-900">
						{asOf ? <p>As of {asOf}</p> : <p className="text-gray-600">Current snapshot</p>}
					</div>
				</div>

				{/* Table Section */}
				<div className="overflow-x-auto bg-white/60">
					{isPending ? (
						<div className="flex items-center justify-center py-16">
							<LogoLoader size={50} color={'#16151c'} />
						</div>
					) : rows.length === 0 ? (
						<div className="py-16 text-center text-sm text-gray-400">No data found</div>
					) : (
						<table className="min-w-full">
							<thead>
								<tr className="bg-gray-50">
									{/* The item name occupies the first, unlabeled column */}
									<th className="border-b px-4 py-2 text-left"></th>
									<th className="border-b px-4 py-2 text-left">SKU</th>
									<th className="border-b px-4 py-2 text-right">Qty</th>
									<th className="border-b px-4 py-2 text-right">Asset Value</th>
									<th className="border-b px-4 py-2 text-right">
										<button
											type="button"
											onClick={cycleSort}
											className="ml-auto flex items-center gap-1 hover:text-accent_soft_black"
											title="Sort by per-unit cost"
										>
											{sortDir === 'asc' ? (
												<FaSortUp className="h-3 w-3" />
											) : sortDir === 'desc' ? (
												<FaSortDown className="h-3 w-3" />
											) : (
												<FaSort className="h-3 w-3 text-gray-400" />
											)}
											Calc. Avg
										</button>
									</th>
								</tr>
							</thead>
							<tbody>
								{/* One row per inventory item */}
								{sortedProducts.map((product, idx) => {
									const avg = avgOf(product);
									return (
										<tr key={product.uid || idx} className="hover:bg-gray-50">
											<td className="border-b px-4 py-2 font-medium">{product.product}</td>
											<td className="border-b px-4 py-2">{product.sku || ''}</td>
											<td className={`border-b px-4 py-2 text-right ${signClass(product.quantity)}`}>
												{formatNumber(product.quantity)}
											</td>
											<td className={`border-b px-4 py-2 text-right ${signClass(product.asset_value)}`}>
												{formatNumber(product.asset_value)}
											</td>
											<td className={`border-b px-4 py-2 text-right ${signClass(avg)}`}>
												{formatNumber(avg)}
											</td>
										</tr>
									);
								})}

								{/* Total row — company-wide totals with a weighted blended average (§2) */}
								<tr className="bg-gray-100 font-bold">
									<td colSpan={2} className="border-b border-r px-4 py-2">
										TOTAL
									</td>
									<td className={`border-b px-4 py-2 text-right ${signClass(total.quantity)}`}>
										{formatNumber(total.quantity)}
									</td>
									<td className={`border-b px-4 py-2 text-right ${signClass(total.asset_value)}`}>
										{formatCurrency(total.asset_value)}
									</td>
									<td className={`border-b px-4 py-2 text-right ${signClass(total.calc_avg)}`}>
										{formatCurrency(total.calc_avg)}
									</td>
								</tr>
							</tbody>
						</table>
					)}
				</div>

				{/* Footer — generation stamp: inventory value is a point-in-time snapshot */}
				<p className="text-gray-400 text-xs mt-4 text-right">
					{moment().format('dddd, MMMM DD, YYYY hh:mm A')}
				</p>
			</div>
		</div>
	);
};

export default InventoryValuationSummaryReport;
