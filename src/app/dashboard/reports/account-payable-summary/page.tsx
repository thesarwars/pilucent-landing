"use client";

import { Suspense, useEffect, useState } from "react";
import ReportFilter from "../_components/filter";
import moment from "moment";
import { useAppSelector } from "@/app/redux/store";

// Mock data for the A/P Aging Report
const mockData = {
	company_name: "Craig's Design and Landscaping Services",
	report_date: "July 14, 2025",
	vendors: [
		{
			id: "1",
			name: "Brosnahan Insurance Agency",
			current: 0,
			days_1_30: 0,
			days_31_60: 241.23,
			days_61_90: 0,
			days_91_over: 0,
			total: 241.23
		},
		{
			id: "2",
			name: "Diego's Road Warrior Bodyshop",
			current: 0,
			days_1_30: 755.00,
			days_31_60: 0,
			days_61_90: 0,
			days_91_over: 0,
			total: 755.00
		},
		{
			id: "3",
			name: "Norton Lumber and Building Materials",
			current: 0,
			days_1_30: 0,
			days_31_60: 205.00,
			days_61_90: 0,
			days_91_over: 0,
			total: 205.00
		},
		{
			id: "4",
			name: "PG&E",
			current: 0,
			days_1_30: 0,
			days_31_60: 86.44,
			days_61_90: 0,
			days_91_over: 0,
			total: 86.44
		},
		{
			id: "5",
			name: "Robertson & Associates",
			current: 0,
			days_1_30: 0,
			days_31_60: 315.00,
			days_61_90: 0,
			days_91_over: 0,
			total: 315.00
		}
	],
	totals: {
		current: 0,
		days_1_30: 755.00,
		days_31_60: 847.67,
		days_61_90: 0,
		days_91_over: 0,
		total: 1602.67
	}
};

const LogoLoader = ({ size = 50, color = "#16151c" }) => (
	<div className="flex items-center justify-center">
		<div
			className="animate-spin rounded-full border-2 border-gray-300 border-t-current"
			style={{ width: size, height: size, borderTopColor: color }}
		/>
	</div>
);

const MainLoader = () => (
	<div className="flex items-center justify-center min-h-screen">
		<LogoLoader size={50} color="#16151c" />
	</div>
);

// Import ReportFilter from your existing components
// import ReportFilter from "../_components/filter";

const APAgingReport = () => {
	const [reportData, setReportData] = useState(mockData);
	const [isPending, setIsPending] = useState(false);
	const from = "2025-07-01"; // You can get this from useSearchParams().get("from");
	const to = "2025-07-14"; // You can get this from useSearchParams().get("to");

	// Initialize with mockData directly instead of waiting for useEffect
	// This ensures data is available immediately

	const formatAmount = (amount: any) => {
		if (amount === 0 || amount === null || amount === undefined) return "-";
		const formatted = Math.abs(amount).toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
		return amount < 0 ? `-$${formatted}` : `$${formatted}`;
	};

	const refetch = () => {
		setIsPending(true);
		// Simulate a refresh with a short delay
		setTimeout(() => {
			// Use the mock data directly
			setReportData({ ...mockData });
			setIsPending(false);
		}, 500);
	};

	const printReport = () => {
		const printWindow = window.open("", "_blank");
		const printContent = document.getElementById("report-content")?.innerHTML;

		// Get all styles from the main document
		const styles = Array.from(document.styleSheets)
			.map((styleSheet) => {
				try {
					return Array.from(styleSheet.cssRules)
						.map((rule) => rule.cssText)
						.join("\n");
				} catch (error) {
					return ""; // Ignore cross-origin stylesheets
				}
			})
			.join("\n");

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
				// printWindow.close();
			};
		}
	};

	const { Company } = useAppSelector((state) => state.CompanyData);
	

	return (
		<div className="">
			<ReportFilter
				OnPdfClick={() => printReport()}
				params={{}}
				refetch={refetch}
				value={{ created_at_after: from, created_at_before: to }}
				setParams={(newParams: any) => {
					// Handle params change - you can use router.push like in your original code
					// router.push(`?from=${newParams?.created_at_after || ""}&to=${newParams?.created_at_before || ""}`);
				}}
				onFilterChange={() => {
					// refetch();
				}}
			/>
			<div
				id="report-content"
				className="mx-auto mb-7 max-w-screen-2xl rounded border bg-white p-4 py-7 text-sm"
			>
				<div className="mb-4 border-b border-b-gray-300 pb-4 text-center">
					<h1 className="mb-2 text-2xl font-bold">A/P Aging Summary Report</h1>
					<h2 className="mb-1 text-lg">
						{Company?.name || "Binary Burst "} {"  "}
					</h2>
					<div className="mt-2 text-center text-sm font-medium text-gray-900">
						{from && to ? (
							<p>
								From{" "}
								{moment(
									new Date(from || new Date().toLocaleDateString()),
								).format("DD MMMM YYYY")}{" "}
								to{" "}
								{moment(
									new Date(from || new Date().toLocaleDateString()),
								).format("DD MMMM YYYY")}
							</p>
						) : (
							<p className="text-gray-600">
								As of {new Date().toLocaleDateString()}
							</p>
						)}
					</div>
				</div>

				{isPending ? (
					<div className="flex items-center justify-center">
						<LogoLoader size={50} color={"#16151c"} />
					</div>
				) : (
					<div className="rounded bg-white">
						{/* Header */}
						<div className="grid grid-cols-7 gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3">
							<div className="text-left">
								<h3 className="text-sm font-semibold text-gray-900">Vendor</h3>
							</div>
							<div className="text-center">
								<h3 className="text-sm font-semibold text-gray-900">CURRENT</h3>
							</div>
							<div className="text-center">
								<h3 className="text-sm font-semibold text-gray-900">1 - 30</h3>
							</div>
							<div className="text-center">
								<h3 className="text-sm font-semibold text-gray-900">31 - 60</h3>
							</div>
							<div className="text-center">
								<h3 className="text-sm font-semibold text-gray-900">61 - 90</h3>
							</div>
							<div className="text-center">
								<h3 className="text-sm font-semibold text-gray-900">91 AND OVER</h3>
							</div>
							<div className="text-right">
								<h3 className="text-sm font-semibold text-gray-900">Total</h3>
							</div>
						</div>

						{/* Vendor Rows */}
						<div className="divide-y divide-gray-100">
							{reportData.vendors.map((vendor) => (
								<div key={vendor.id} className="grid grid-cols-7 gap-4 px-4 py-2 hover:bg-gray-50">
									<div className="text-left">
										<span className="text-sm font-normal text-gray-900">{vendor.name}</span>
									</div>
									<div className="text-center">
										<span className="text-sm font-normal text-gray-900">{formatAmount(vendor.current)}</span>
									</div>
									<div className="text-center">
										<span className="text-sm font-normal text-gray-900">{formatAmount(vendor.days_1_30)}</span>
									</div>
									<div className="text-center">
										<span className="text-sm font-normal text-gray-900">{formatAmount(vendor.days_31_60)}</span>
									</div>
									<div className="text-center">
										<span className="text-sm font-normal text-gray-900">{formatAmount(vendor.days_61_90)}</span>
									</div>
									<div className="text-center">
										<span className="text-sm font-normal text-gray-900">{formatAmount(vendor.days_91_over)}</span>
									</div>
									<div className="text-right">
										<span className="text-sm font-normal text-gray-900">{formatAmount(vendor.total)}</span>
									</div>
								</div>
							))}

							{/* Total Row */}
							<div className="grid grid-cols-7 gap-4 border-t-2 border-gray-400 bg-gray-50 px-4 py-2">
								<div className="text-left">
									<span className="text-sm font-bold text-gray-900">TOTAL</span>
								</div>
								<div className="text-center">
									<span className="text-sm font-bold text-gray-900">{formatAmount(reportData.totals.current)}</span>
								</div>
								<div className="text-center">
									<span className="text-sm font-bold text-gray-900">{formatAmount(reportData.totals.days_1_30)}</span>
								</div>
								<div className="text-center">
									<span className="text-sm font-bold text-gray-900">{formatAmount(reportData.totals.days_31_60)}</span>
								</div>
								<div className="text-center">
									<span className="text-sm font-bold text-gray-900">{formatAmount(reportData.totals.days_61_90)}</span>
								</div>
								<div className="text-center">
									<span className="text-sm font-bold text-gray-900">{formatAmount(reportData.totals.days_91_over)}</span>
								</div>
								<div className="text-right">
									<span className="text-sm font-bold text-gray-900">{formatAmount(reportData.totals.total)}</span>
								</div>
							</div>
						</div>

						{/* Footer with timestamp */}
						<div className="mt-4 text-center">
							<p className="text-xs text-gray-500">
								Monday, July 14, 2025 01:08 PM GMT-06:00
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

const Page = () => {
	return (
		<Suspense fallback={<MainLoader />}>
			<APAgingReport />
		</Suspense>
	);
};

export default Page;