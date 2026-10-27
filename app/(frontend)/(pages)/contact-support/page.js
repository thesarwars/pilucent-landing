import Link from 'next/link';
import React from 'react';

const ContactSupport = () => {
	return (
		<div>
			<div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
				<div className="max-w-5xl">
					<div className="flex items-center justify-center">
						<Link href="/demo" className="text-5xl text-white font-bold mb-8 animate-pulse">
							Please Contact with customer support to know more about pricing .
						</Link>
					</div>
				</div>

			</div>
		</div>
	);
};

export default ContactSupport;