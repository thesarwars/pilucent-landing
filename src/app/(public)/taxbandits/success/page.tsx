'use client'
import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { post941Transmit } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';

const SuccessPage = () => {
	useEffect(() => {
		const transmitForm941 = async () => {
			try {
				// Get URL parameters
				const urlParams = new URLSearchParams(window.location.search);
				const recordId = urlParams.get('recordId');
				const submissionId = urlParams.get('submissionId');

				if (recordId && submissionId) {
					const payload = {
						SubmissionId: submissionId,
						RecordIds: [recordId]
					};

					const response = await post941Transmit(payload);
					if(response?.StatusCode === 200) {
						toast.success('Form 941 transmitted successfully to the IRS.');
					} else {
						toast.error('Failed to transmit Form 941. Please try again later.');
					}
					console.log('Form 941 transmitted successfully:', response);
					
				}
			} catch (error) {
				console.error('Error transmitting Form 941:', error);
			}
		};

		transmitForm941();
	}, []);
	
	return (
		<div className="bg-gray-50 flex items-center justify-center px-4 py-12">
			<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
				{/* Success Icon */}
				<div className="flex justify-center mb-6">
					<div className="rounded-full bg-green-100 p-3">
						<CheckCircle className="h-12 w-12 text-green-600" />
					</div>
				</div>

				{/* Success Title */}
				<h1 className="text-2xl font-bold text-gray-900 mb-4">
					Form Submitted Successfully!
				</h1>

				{/* Success Message */}
				<p className="text-gray-600 mb-6 leading-relaxed">
					Your IRS Form 941 has been successfully submitted and signed.
					You will receive a confirmation email shortly with your filing details.
				</p>

				{/* Additional Information */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
					<h3 className="text-sm font-semibold text-blue-900 mb-2">
						What happens next?
					</h3>
					<ul className="text-sm text-blue-800 space-y-1 text-left">
						<li>• IRS will process your submission</li>
						<li>• You'll receive an acknowledgment</li>
						<li>• Keep this confirmation for your records</li>
					</ul>
				</div>

				{/* Action Buttons */}
				<div className="space-y-3">
					<button
						onClick={() => window.close()}
						className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
					>
						Close Window
					</button>

					<button
						onClick={() => window.location.href = '/dashboard'}
						className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200"
					>
						Return to Dashboard
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

export default SuccessPage;