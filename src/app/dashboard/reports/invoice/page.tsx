import React from 'react';

const InvoiceReport = () => {
	
	return (
		<div>
			<div className="p-2 mx-auto">
				{/* Header Section */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2">Binary Burst</h1>
					<h2 className="text-xl mb-1">Invoice List by Date</h2>
					<p className="text-gray-600">All Dates</p>
				</div>

				{/* Table Section */}
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border border-gray-200">
						<thead>
							<tr className="bg-gray-50">
								<th className="border-b px-4 py-2 text-left">DATE</th>
								<th className="border-b px-4 py-2 text-left">TRANSACTION TYPE</th>
								<th className="border-b px-4 py-2 text-left">NO.</th>
								<th className="border-b px-4 py-2 text-left">NAME</th>
								<th className="border-b px-4 py-2 text-left">LOCATION FULL NAME</th>
								<th className="border-b px-4 py-2 text-left">MEMO/DESCRIPTION</th>
								<th className="border-b px-4 py-2 text-left">DUE DATE</th>
								<th className="border-b px-4 py-2 text-right">AMOUNT</th>
								<th className="border-b px-4 py-2 text-right">OPEN BALANCE</th>
								<th className="border-b px-4 py-2 text-left">ACCOUNT</th>
							</tr>
						</thead>
						<tbody>
							<tr className="hover:bg-gray-50">
								<td className="border-b px-4 py-2">12/09/2024</td>
								<td className="border-b px-4 py-2">Invoice</td>
								<td className="border-b px-4 py-2">1001</td>
								<td className="border-b px-4 py-2">Nijum</td>
								<td className="border-b px-4 py-2"></td>
								<td className="border-b px-4 py-2"></td>
								<td className="border-b px-4 py-2">12/10/2024</td>
								<td className="border-b px-4 py-2 text-right">US$150,000.00</td>
								<td className="border-b px-4 py-2 text-right">US$0.00</td>
								<td className="border-b px-4 py-2">Debtors</td>
							</tr>
							{/* Add more rows following the same pattern */}
							<tr className="hover:bg-gray-50">
								<td className="border-b px-4 py-2">28/01/2025</td>
								<td className="border-b px-4 py-2">Invoice</td>
								<td className="border-b px-4 py-2">1024</td>
								<td className="border-b px-4 py-2">Suzon</td>
								<td className="border-b px-4 py-2">Main</td>
								<td className="border-b px-4 py-2"></td>
								<td className="border-b px-4 py-2">27/02/2025</td>
								<td className="border-b px-4 py-2 text-right">US$250,000.00</td>
								<td className="border-b px-4 py-2 text-right">US$245,595.82</td>
								<td className="border-b px-4 py-2">Debtors - BDT</td>
							</tr>
						</tbody>
						<tfoot>
							<tr className="bg-gray-50 font-semibold">
								<td colSpan={7} className="border-b px-4 py-2 text-right">
									Total:
								</td>
								<td className="border-b px-4 py-2 text-right">US$1,950,600.00</td>
								<td className="border-b px-4 py-2 text-right">US$661,735.82</td>
								<td className="border-b px-4 py-2"></td>
							</tr>
						</tfoot>
					</table>
				</div>
			</div>
		</div>
	);
};

export default InvoiceReport;