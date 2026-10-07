'use client'
import React from 'react';
import { XCircle } from 'lucide-react';

const CancelPage = () => {
	return (
		<div className="bg-gray-50 flex items-center justify-center px-4 py-8">
			<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
				{/* Cancel Icon */}
				<div className="flex justify-center mb-6">
					<div className="rounded-full bg-red-100 p-3">
						<XCircle className="h-12 w-12 text-red-600" />
					</div>
				</div>

				{/* Cancel Title */}
				<h1 className="text-2xl font-bold text-gray-900 mb-4">
					Form Submission Cancelled
				</h1>

				{/* Cancel Message */}
				<p className="text-gray-600 mb-6 leading-relaxed">
					The IRS Form 941 submission process has been cancelled.
					No forms were submitted to the IRS.
				</p>

				{/* Additional Information */}
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
					<h3 className="text-sm font-semibold text-yellow-900 mb-2">
						What you can do next:
					</h3>
					<ul className="text-sm text-yellow-800 space-y-1 text-left">
						<li>• Return to the tax filing section</li>
						<li>• Review your information and try again</li>
						<li>• Contact support if you need assistance</li>
					</ul>
				</div>

				{/* Action Buttons */}
				<div className="space-y-3">
					<button
						onClick={() => window.close()}
						className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
					>
						Close Window
					</button>

					<button
						onClick={() => window.location.href = '/dashboard/hris/payroll/payroll-tax'}
						className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200"
					>
						Return to Tax Filing
					</button>
				</div>

				{/* Footer */}
				<div className="mt-8 pt-6 border-t border-gray-200">
					<p className="text-xs text-gray-500">
						For support, contact our team at support@balanzify.com
					</p>
				</div>
			</div>
		</div>
	);
};

export default CancelPage;