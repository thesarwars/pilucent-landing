import Link from "next/link";

export const metadata = {
	title: "Terms of Service | Balanzify",
	description:
		"Balanzify Terms of Service — Legal agreement governing the use of our accounting, payroll, and financial management platform.",
};

export default function TermsPage() {
	return (
		<div className="bg-[#150B22]">
			{/* Hero */}
			<div
				className="relative pt-32 pb-12 sm:pt-36 sm:pb-16"
				style={{
					backgroundImage: "url('/V2/section_banner.png')",
					backgroundSize: "cover",
					backgroundPosition: "top center",
					backgroundRepeat: "no-repeat",
				}}
			>
				<div className="container mx-auto px-4">
					<div className="text-center mb-4">
						<h1 className="text-3xl md:text-4xl font-bold text-[#F9F9F9] mb-2 animate-fade-in-up">
							Terms of Service
						</h1>
						<p className="text-[#F9F9F9]/70 font-semibold animate-fade-in-up [animation-delay:120ms]">
							Effective Date: April 18, 2026
						</p>
					</div>
				</div>
			</div>

			{/* Policy content */}
			<div className="container mx-auto px-4 py-12">
				<div className="max-w-3xl mx-auto">
					<div className="bg-white/5 border-l-4 border-yellow-400 p-4 mb-5 mt-8">
						<p className="text-[#F9F9F9]/75 font-semibold">
							PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE ACCESSING OR USING THE BALANZIFY PLATFORM.
						</p>
						<p className="text-[#F9F9F9]/75 mt-2">
							By creating an account, clicking "I Agree," or otherwise accessing or using the Services, you agree to be legally bound by these Terms. If you do not agree, do not access or use the Services.
						</p>
						<p className="text-[#F9F9F9]/75 mt-2">
							These Terms constitute a legally binding agreement between you and Balanzify Inc.
						</p>
					</div>

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">1. DEFINITIONS</h2>
						<p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
							As used in these Terms, the following capitalized terms have the meanings set forth below:
						</p>
						<ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
							<li><strong>&quot;Agreement&quot;</strong> means these Terms of Service, together with all incorporated policies, schedules, and addenda, as amended from time to time.</li>
							<li><strong>&quot;Authorized User&quot;</strong> means any employee, contractor, or agent of Customer who is authorized by Customer to access the Platform on Customer&apos;s behalf.</li>
							<li><strong>&quot;Customer,&quot; &quot;you,&quot; or &quot;your&quot;</strong> means the business entity that has accepted these Terms and is accessing or using the Services.</li>
							<li><strong>&quot;Customer Data&quot;</strong> means all data, information, and content submitted by Customer or Authorized Users to the Platform, including but not limited to payroll data, employee information, financial records, tax identification numbers, and bank account information.</li>
							<li><strong>&quot;Documentation&quot;</strong> means the technical and operational documentation, guides, and specifications made available by Balanzify at balanzify.com or within the Platform.</li>
							<li><strong>&quot;Intellectual Property Rights&quot;</strong> means all patents, copyrights, trademarks, trade secrets, and other proprietary rights.</li>
							<li><strong>&quot;Order Form&quot;</strong> means the subscription order or pricing agreement executed by Customer specifying the applicable Services, fees, and subscription term.</li>
							<li><strong>&quot;Platform&quot;</strong> means Balanzify&apos;s proprietary software-as-a-service platform, including all modules for payroll automation, accounting, expense management, human resources information management, and related tools, accessible at balanzify.com and through associated APIs.</li>
							<li><strong>&quot;Services&quot;</strong> means the software platform, automation tools, workflow facilitation, and related services provided by Balanzify as described herein and in the applicable Documentation.</li>
							<li><strong>&quot;Tax Filing Provider&quot;</strong> means Balanzify&apos;s designated third-party tax form filing and electronic submission infrastructure provider.</li>
						</ul>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">2. PLATFORM DESCRIPTION AND NATURE OF SERVICES</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">2.1 Software Platform</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify is a software platform that provides accounting, payroll automation, expense management, and human resources information tools to businesses. Balanzify is not a bank, money transmitter, financial institution, certified public accounting firm, tax preparer, registered investment advisor, or employer of record. Balanzify does not provide legal, tax, accounting, or financial advice.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">2.2 Automation and Facilitation</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify automates business workflows, including payroll calculations, tax liability determinations, filing deadline notifications, and submission workflow triggers. These automated actions are performed based on Customer-configured settings, Customer-provided data, and Customer authorization within the Platform. Balanzify&apos;s role is to provide the software and automation layer that facilitates Customer&apos;s own business operations.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">2.3 Customer Remains Responsible</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									The Customer remains solely responsible for the accuracy of all data entered into the Platform, all decisions made using Platform outputs, compliance with all applicable federal, state, and local laws, and the review and authorization of all transactions, filings, and submissions before they are executed. Balanzify provides tools to assist Customer in meeting these responsibilities — it does not assume them.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">2.4 Third-Party Infrastructure</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Certain Platform functions are delivered through third-party infrastructure providers, including payment processing, bank account connectivity, and tax form filing partners. Tax form filing and submission workflows are processed through Balanzify&apos;s designated Tax Filing Provider. These providers operate under their own terms and Balanzify is not responsible for their availability, performance, or decisions.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">2.5 No CPA or Tax Agency Relationship</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify does not act as Customer&apos;s certified public accountant, tax agent, or authorized representative before any taxing authority. Balanzify prepares and pre-fills tax-related workflows based on Customer-provided data and automates submission flows through its designated Tax Filing Provider. The Customer reviews, approves, and authorizes all submissions. The Customer remains the responsible party for all tax filings, remittances, and compliance obligations. Nothing in this Agreement creates an agency, fiduciary, or professional services relationship between Balanzify and Customer with respect to tax or financial matters.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">3. ELIGIBILITY AND ACCOUNT REGISTRATION</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">3.1 Eligibility</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									The Services are available only to business entities operating lawfully in the United States. By accessing the Services, you represent and warrant that: (i) you are a validly organized business entity in good standing under applicable law; (ii) you have full legal authority to enter into this Agreement on behalf of your organization; (iii) all information you provide is accurate, complete, and current; and (iv) your use of the Services will comply with all applicable laws and regulations.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">3.2 Account Registration</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									To access the Services, Customer must complete the registration process, including business verification (KYB) as required by Balanzify&apos;s banking and payment partners. Customer must designate at least one administrator account. Customer is responsible for maintaining the accuracy of account information and updating it promptly when changes occur.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">3.3 Authorized Users</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Customer may grant Authorized Users access to the Platform. Customer is responsible for all actions taken by Authorized Users and for ensuring that Authorized Users comply with this Agreement. Customer shall promptly revoke access for any individual who is no longer authorized or employed by Customer.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">3.4 Account Security</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Customer is responsible for maintaining the confidentiality and security of all login credentials. Customer shall immediately notify Balanzify at{" "}
									<Link
										href="mailto:security@balanzify.com"
										className="text-[#5A5FEE] font-medium hover:underline"
									>
										security@balanzify.com
									</Link>{" "}
									upon becoming aware of any unauthorized access to or use of Customer&apos;s account. Balanzify shall not be liable for any loss or damage arising from Customer&apos;s failure to maintain the security of its credentials.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">3.5 Identity Verification</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify and its banking partners may require Customer and its principals to undergo identity verification (KYC) as a condition of accessing payment-related Services. Customer consents to the collection and processing of information necessary to complete such verification, including personal information of Customer&apos;s beneficial owners and authorized signatories.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">4. PAYROLL AUTOMATION SERVICES</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">4.1 Payroll Calculation and Automation</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify&apos;s payroll module automates the calculation of gross pay, net pay, federal and state tax withholdings, deductions, and employer payroll tax liabilities based on data provided by Customer. All calculations are based on Customer-configured settings, tax tables maintained within the Platform, and data entered by Customer or its Authorized Users. Customer is responsible for verifying the accuracy of all inputs and reviewing all calculated outputs before authorizing payroll.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">4.2 Customer Authorization Required</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									No payroll run shall be initiated without Customer&apos;s affirmative authorization through the Platform. Customer&apos;s authorization of a payroll run constitutes Customer&apos;s representation that: (i) all payroll data is accurate and complete; (ii) all applicable employment laws have been complied with; (iii) sufficient funds are available in the designated bank account; and (iv) Customer has reviewed and approved the calculated amounts.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">4.3 Direct Deposit</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Employee direct deposit payments are initiated by Balanzify through its designated payment processing partners following Customer&apos;s authorization of a payroll run. ACH transactions are subject to standard banking processing times, NACHA Operating Rules, and the policies of the receiving financial institution. Balanzify is not responsible for delays caused by banking system processing times, federal holidays, incorrect employee banking information provided by Customer, or insufficient funds in Customer&apos;s account.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">4.4 Payroll Errors</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									If Balanzify&apos;s software produces an incorrect calculation due to a Platform error, Balanzify will work with Customer to identify and correct the error in the next payroll cycle at no additional charge. If an error results from Customer-provided incorrect data, Customer-configured settings, or Customer&apos;s failure to review and approve accurate information, Customer bears sole responsibility for any resulting errors, penalties, or correction costs. Balanzify&apos;s liability for payroll calculation errors is limited as set forth in Section 14.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">4.5 Supported Jurisdictions</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Full-service payroll tax calculation and compliance workflow automation is available for employers in supported jurisdictions as disclosed in the Platform Documentation and updated from time to time. Balanzify will notify Customers of any changes to supported jurisdictions. Customer is responsible for verifying that the Platform supports the jurisdictions in which their employees are located prior to use.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">5. TAX COMPLIANCE WORKFLOW AUTOMATION</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">5.1 Nature of Tax Services</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify&apos;s tax compliance features are software automation tools, not tax preparation services or tax advice. Balanzify automates compliance workflows by: (i) calculating estimated tax liabilities based on Customer-provided payroll data and applicable tax tables; (ii) pre-filling tax forms and schedules based on calculated data; (iii) determining applicable filing deadlines based on Customer&apos;s configured deposit schedule and jurisdiction; (iv) surfacing required filings and remittances within the Platform dashboard; and (v) triggering submission workflows through Balanzify&apos;s designated Tax Filing Provider upon Customer authorization.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">5.2 Customer Authorization and Responsibility</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									All tax filings and remittances are executed only upon Customer&apos;s express review and authorization within the Platform. By authorizing a tax filing or remittance, Customer represents and warrants that: (i) Customer has reviewed all pre-filled information and confirmed its accuracy; (ii) Customer has verified that all underlying payroll data is correct; (iii) Customer understands it is the responsible taxpayer for all filings submitted; and (iv) Customer authorizes Balanzify to transmit the filing data to the designated Tax Filing Provider for submission to the applicable taxing authority.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">5.3 Tax Filing Provider as Submission Infrastructure</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Tax form submission and electronic filing are executed through Balanzify&apos;s designated Tax Filing Provider, an IRS-authorized e-file provider. The Tax Filing Provider operates as an independent third-party service provider. Balanzify transmits Customer-authorized filing data to the Tax Filing Provider for submission. The Tax Filing Provider&apos;s submission of such filings is subject to the Tax Filing Provider&apos;s own terms of service. Balanzify is not responsible for errors, delays, rejections, or failures caused by the Tax Filing Provider, the applicable taxing authority&apos;s systems, or connectivity issues between the Tax Filing Provider and such authorities.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">5.4 Customer Remains Responsible Taxpayer</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Notwithstanding any automation provided by the Platform, Customer remains the sole responsible party for: (i) the accuracy and completeness of all tax filings; (ii) the timely remittance of all payroll tax obligations; (iii) compliance with all applicable federal, state, and local tax laws, regulations, and deadlines; (iv) responding to tax authority inquiries, audits, or notices; and (v) any penalties, interest, or assessments arising from tax filings or payments. Balanzify&apos;s tax automation tools do not constitute tax advice, tax preparation services, or representation before any taxing authority.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">5.5 Tax Table Accuracy</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify maintains payroll tax tables and rates within the Platform based on publicly available regulatory information. While Balanzify makes reasonable efforts to maintain accurate and current tax tables, Balanzify does not warrant that tax tables are current, complete, or error-free. Customer is responsible for verifying that applicable tax rates and rules are correctly reflected in Customer&apos;s Platform configuration and for notifying Balanzify of any discrepancies.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">6. PAYMENT PROCESSING AND FUND MOVEMENT</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">6.1 Payment Processing Partners</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Payment processing, ACH origination, direct deposit, and related fund movement for Balanzify are provided by Balanzify&apos;s designated third-party payment processing partners. Balanzify is not a money transmitter and does not hold, transfer, or process funds directly. All fund movement is executed by such partners under their applicable licensing and regulatory framework.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">6.2 Customer Agreement to Payment Partner Terms</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									By using Balanzify&apos;s payment-related features, Customer agrees to be bound by the applicable terms of Balanzify&apos;s payment processing partners, as disclosed in the Platform or Documentation and as amended from time to time. Customer acknowledges that: (i) payment transactions are processed by such partners and are subject to their terms; (ii) the designated payment processor is responsible for fund movement; and (iii) payment partners may impose additional requirements, limitations, or restrictions on payment transactions in accordance with their own compliance obligations.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">6.3 ACH Authorization</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									By linking a bank account and authorizing a payroll run or other payment, Customer expressly authorizes Balanzify and its payment processing partners to initiate ACH debit and credit entries from and to Customer&apos;s designated bank account(s) in the amounts and at the times specified by Customer&apos;s authorized instructions. This authorization remains in effect until Customer revokes it in writing with sufficient notice to allow Balanzify and its partners to process the revocation before the next scheduled transaction.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">6.4 Sufficient Funds</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Customer is solely responsible for maintaining sufficient funds in its designated bank account to cover all authorized payroll disbursements, tax remittances, and applicable fees. Customer shall be liable for all costs, fees, and penalties arising from insufficient funds, returned ACH items, or failed transactions, including any returned item fees assessed by payment processing partners or Customer&apos;s financial institution.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">6.5 Transaction Monitoring and Compliance</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify and its payment processing and banking partners may monitor transactions for compliance with applicable law, including anti-money laundering regulations and OFAC requirements. Transactions may be delayed, held, rejected, or reported to appropriate authorities if they are flagged for compliance review. Balanzify is not liable for any losses arising from transaction holds or rejections initiated by such partners in furtherance of compliance obligations.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">6.6 Fund Custody Disclosure</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Payroll funds in transit are held in accounts maintained by Balanzify&apos;s payment processing partners and their sponsor banking partners. These funds are not deposits of Balanzify Inc. and are not FDIC-insured as obligations of Balanzify. Balanzify does not earn interest on funds in transit. Customer funds held by payment partners may be subject to the protections available under applicable state money transmission laws.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">6.7 Bank Account Verification</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Bank account verification and connectivity services are provided by Balanzify&apos;s designated third-party integration partners. By linking a bank account through the Platform, Customer agrees to the applicable terms and privacy policies of such partners as disclosed in the Platform or Documentation. Customer represents that it has the authority to link and authorize transactions from any bank account connected through the Platform.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">7. ACCOUNTING AND FINANCIAL REPORTING TOOLS</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">7.1 Nature of Accounting Services</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify&apos;s accounting module provides bookkeeping automation tools, including automated journal entry creation, general ledger management, financial report generation, and expense categorization. These tools automate routine accounting workflows based on Customer-configured settings and data entered into the Platform. Balanzify&apos;s accounting tools do not constitute the provision of accounting services, audit services, or financial statement preparation by a licensed accounting firm.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">7.2 Customer Responsibility for Financial Records</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Customer is solely responsible for the accuracy, completeness, and integrity of its financial records. Automated journal entries and reports generated by the Platform are based on Customer-provided data and Customer-configured mapping rules. Customer is responsible for reviewing all automated entries, reconciling its accounts, and maintaining accurate financial records in accordance with applicable accounting standards and legal requirements.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">7.3 No Audit or Assurance Services</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify does not provide audit, review, compilation, or any other assurance services with respect to Customer&apos;s financial statements. Financial reports generated by the Platform have not been audited, reviewed, or compiled by a certified public accountant. Customer should not represent Balanzify-generated reports as audited financial statements.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">8. FEES, BILLING, AND PAYMENT</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">8.1 Subscription Fees</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Customer agrees to pay Balanzify&apos;s then-current subscription fees as set forth in the applicable Order Form or pricing schedule published at balanzify.com. Subscription fees consist of a flat monthly base fee plus a per-employee fee based on the number of active employees during each billing period. An active employee is defined as any individual who receives at least one paycheck processed through the Platform during the applicable billing month.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">8.2 Annual and Monthly Billing</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Subscription fees are available on a monthly or annual basis. Annual subscriptions are billed upfront for the full twelve-month term at a discounted rate as specified in the applicable pricing schedule. Monthly subscriptions are billed in advance at the beginning of each calendar month. Customer&apos;s selection of monthly or annual billing is set forth in the applicable Order Form.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">8.3 Transaction and Processing Fees</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									ACH transaction fees and other payment processing fees charged by Balanzify&apos;s payment partners in connection with Customer&apos;s use of the Platform&apos;s payment features are incorporated into Balanzify&apos;s subscription pricing and are not separately itemized to Customer under standard subscription plans. Balanzify reserves the right to separately disclose and charge for transaction fees in excess of standard usage thresholds with 30 days written notice.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">8.4 Fee Adjustments</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify reserves the right to adjust subscription fees upon 30 days written notice to Customer delivered via email to the address on file. Fee adjustments shall take effect at the beginning of Customer&apos;s next billing cycle following the notice period. Customer&apos;s continued use of the Services after the effective date of a fee adjustment constitutes acceptance of the new fees.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">8.5 Late Payments</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Subscription fees not paid within 15 days of the due date are subject to a late fee of 1.5% per month on the outstanding balance, or the maximum rate permitted by applicable law, whichever is less. Balanzify reserves the right to suspend access to the Services for accounts with outstanding balances more than 30 days past due, upon written notice to Customer.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">8.6 Taxes on Services</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									All fees are exclusive of applicable sales, use, value-added, or similar taxes. Customer is responsible for all such taxes imposed on the Services, if any. Balanzify will add applicable taxes to invoices where required by law.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">8.7 Refunds</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Subscription fees are non-refundable except where required by applicable law. If Balanzify makes a billing error resulting in an overcharge, Balanzify will credit or refund the overcharge within 10 business days of Customer&apos;s written notice identifying the error. Unused portions of annual subscriptions are non-refundable upon termination except as required by law.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">9. CUSTOMER DATA AND PRIVACY</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">9.1 Customer Ownership of Data</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Customer retains all ownership rights in and to Customer Data. Balanzify acquires no ownership interest in Customer Data by virtue of this Agreement. Customer grants Balanzify a limited, non-exclusive license to use, process, store, and transmit Customer Data solely as necessary to provide the Services and as described in the Privacy Policy.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">9.2 Data Processing</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify processes Customer Data in accordance with its Privacy Policy available at balanzify.com/privacy. By using the Services, Customer consents to the collection, use, and processing of Customer Data as described in the Privacy Policy. Customer Data may be shared with Balanzify&apos;s designated payment processing partners, bank connectivity partners, Tax Filing Provider, and other service providers solely as necessary to provide the Services.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">9.3 Customer Data Accuracy</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Customer is solely responsible for the accuracy, quality, and legality of Customer Data submitted to the Platform. Balanzify is not responsible for any errors, inaccuracies, or legal violations arising from Customer-provided data. Customer represents and warrants that it has obtained all necessary consents from employees and other individuals whose personal information is submitted to the Platform.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">9.4 Security</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify maintains an information security program designed to protect Customer Data against unauthorized access, disclosure, or use, as further described in Balanzify&apos;s Information Security Program. Balanzify will notify Customer within 72 hours of becoming aware of a security breach affecting Customer Data, to the extent required by applicable law.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">9.5 Data Retention and Deletion</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Upon termination of this Agreement, Customer has 90 days to export its data from the Platform. After the 90-day period, Balanzify may delete Customer Data, subject to any legal retention requirements. Balanzify retains certain data as required by applicable law, including financial records and transaction logs.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">9.6 Employee Data</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Customer represents and warrants that it has obtained all legally required consents from its employees to share employee personal information — including Social Security numbers, date of birth, compensation information, and bank account details — with Balanzify and its third-party service providers for the purpose of providing the Services. Customer shall maintain records of such consents and provide them to Balanzify upon request.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">10. COMPLIANCE AND ACCEPTABLE USE</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">10.1 Customer Compliance Obligations</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
									Customer is solely responsible for ensuring that its use of the Services complies with all applicable federal, state, and local laws and regulations, including without limitation:
								</p>
								<ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
									<li>Fair Labor Standards Act</li>
									<li>Applicable state wage and hour laws</li>
									<li>Employee Retirement Income Security Act (ERISA), where applicable</li>
									<li>Internal Revenue Code and applicable Treasury Regulations</li>
									<li>State payroll tax laws</li>
									<li>Bank Secrecy Act and anti-money laundering regulations</li>
									<li>Applicable data privacy laws including state consumer privacy statutes</li>
								</ul>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">10.2 Prohibited Uses</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed mb-2">
									Customer shall not use the Services to:
								</p>
								<ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
									<li>Process payroll for individuals who are not legitimate employees or contractors of Customer&apos;s business</li>
									<li>Make payments to individuals or entities on OFAC&apos;s Specially Designated Nationals list or other applicable sanctions lists</li>
									<li>Circumvent applicable payroll, tax, employment, or financial laws or regulations</li>
									<li>Engage in money laundering, fraud, or any illegal financial activity</li>
									<li>Process payroll for businesses engaged in activities prohibited under Balanzify&apos;s or its partners&apos; acceptable use policies</li>
									<li>Submit false or misleading data to the Platform</li>
									<li>Reverse-engineer, copy, or create competing services based on Balanzify&apos;s proprietary systems</li>
									<li>Access the Platform through unauthorized means or attempt to circumvent security controls</li>
								</ul>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">10.3 Transaction Monitoring</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify and its payment processing partners may monitor transactions for compliance with applicable law. Balanzify reserves the right to delay, hold, or reject transactions that appear to violate applicable law or this Agreement, or that are flagged by compliance monitoring systems. Balanzify will make reasonable efforts to notify Customer of any such action, except where prohibited by law.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">10.4 Cooperation with Authorities</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify may be required by law to disclose Customer information or transaction records to government authorities, regulatory bodies, or law enforcement. Balanzify will make reasonable efforts to notify Customer of such disclosures to the extent permitted by applicable law.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">11. INTELLECTUAL PROPERTY</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">11.1 Balanzify Proprietary Rights</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify retains all Intellectual Property Rights in and to the Platform, Services, Documentation, and all software, algorithms, tax calculation engines, user interfaces, and technology underlying the Services. Customer acquires no ownership interest in the Platform or Services by virtue of this Agreement. The license granted herein is the sole right granted to Customer with respect to the Platform.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">11.2 License Grant</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Subject to Customer&apos;s compliance with this Agreement and payment of applicable fees, Balanzify grants Customer a limited, non-exclusive, non-transferable, non-sublicensable license to access and use the Platform solely for Customer&apos;s internal business operations during the subscription term.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">11.3 Restrictions</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed mb-2">
									Customer shall not:
								</p>
								<ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
									<li>Copy, modify, or create derivative works of the Platform</li>
									<li>Reverse engineer, disassemble, or decompile the Platform</li>
									<li>Sell, resell, sublicense, or transfer access to the Platform to any third party</li>
									<li>Use the Platform to build a competing product or service</li>
									<li>Remove or alter any proprietary notices or labels on the Platform</li>
								</ul>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">11.4 Feedback</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									If Customer provides Balanzify with feedback, suggestions, or recommendations regarding the Platform, Balanzify may use such feedback without restriction and without obligation to Customer. Customer assigns to Balanzify all rights in any such feedback.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">12. WARRANTIES AND DISCLAIMERS</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">12.1 Balanzify Warranties</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed mb-2">
									Balanzify warrants that:
								</p>
								<ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
									<li>The Platform will perform materially in accordance with the Documentation under normal use</li>
									<li>Balanzify will implement reasonable security measures to protect Customer Data as described in the Information Security Program</li>
								</ul>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">12.2 Customer Warranties</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed mb-2">
									Customer warrants that:
								</p>
								<ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
									<li>It has the legal authority to enter into this Agreement</li>
									<li>Its use of the Services will comply with all applicable laws</li>
									<li>All Customer Data submitted to the Platform is accurate, complete, and legally obtained</li>
									<li>It has obtained all necessary consents from employees and other individuals whose data is processed through the Platform</li>
								</ul>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">12.3 Disclaimer of Warranties</h3>
								<div className="p-4 rounded border border-white/10">
									<p className="text-[#F9F9F9]/75 leading-relaxed font-semibold">
										EXCEPT AS EXPRESSLY SET FORTH IN SECTION 12.1, THE PLATFORM AND SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTY OF ANY KIND. BALANZIFY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY. BALANZIFY DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE FROM VIRUSES OR OTHER HARMFUL COMPONENTS. BALANZIFY DOES NOT WARRANT THE ACCURACY OF ANY TAX CALCULATIONS, FILING DETERMINATIONS, OR FINANCIAL DATA GENERATED BY THE PLATFORM.
									</p>
								</div>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">13. LIMITATION OF LIABILITY</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">13.1 Exclusion of Consequential Damages</h3>
								<div className="p-4 rounded border border-white/10">
									<p className="text-[#F9F9F9]/75 leading-relaxed font-semibold">
										TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL BALANZIFY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOST PROFITS, LOST REVENUE, LOSS OF DATA, BUSINESS INTERRUPTION, OR COST OF SUBSTITUTE SERVICES, ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT OR THE USE OF THE SERVICES, REGARDLESS OF THE THEORY OF LIABILITY AND EVEN IF BALANZIFY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
									</p>
								</div>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">13.2 Aggregate Liability Cap</h3>
								<div className="p-4 rounded border border-white/10">
									<p className="text-[#F9F9F9]/75 leading-relaxed font-semibold">
										TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, BALANZIFY&apos;S TOTAL AGGREGATE LIABILITY TO CUSTOMER FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED THE TOTAL FEES PAID BY CUSTOMER TO BALANZIFY IN THE THREE (3) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
									</p>
								</div>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">13.3 Specific Exclusions</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed mb-2">
									Without limiting the foregoing, Balanzify is not liable for:
								</p>
								<ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
									<li>Losses arising from Customer-provided incorrect or incomplete data</li>
									<li>Tax penalties, interest, or assessments arising from Customer&apos;s failure to review and approve accurate filings</li>
									<li>Banking system delays or errors outside Balanzify&apos;s control</li>
									<li>Employee failure to provide correct bank account information</li>
									<li>Losses from ACH returns caused by insufficient funds in Customer&apos;s account</li>
									<li>Third-party service provider errors, outages, or actions, including Balanzify&apos;s Tax Filing Provider and other infrastructure partners</li>
									<li>Losses arising from Customer&apos;s violation of applicable law</li>
								</ul>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">13.4 Essential Basis</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									The parties acknowledge that the limitations of liability in this Section reflect a reasonable allocation of risk and are an essential basis of the bargain between the parties. Balanzify would not have entered into this Agreement without these limitations.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">14. INDEMNIFICATION</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">14.1 Customer Indemnification</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed mb-2">
									Customer shall defend, indemnify, and hold harmless Balanzify, its officers, directors, employees, agents, and successors from and against any claims, damages, losses, penalties, fines, and expenses (including reasonable attorneys&apos; fees) arising out of or relating to:
								</p>
								<ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
									<li>Customer&apos;s violation of this Agreement</li>
									<li>Incorrect, incomplete, or fraudulent Customer Data submitted to the Platform</li>
									<li>Customer&apos;s violation of applicable employment, tax, or financial laws</li>
									<li>Customer&apos;s failure to review and authorize payroll runs, filings, or payments accurately</li>
									<li>Claims by Customer&apos;s employees or contractors arising from payroll errors caused by Customer-provided data</li>
									<li>Customer&apos;s unauthorized use of the Platform</li>
								</ul>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">14.2 Indemnification Procedure</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed mb-2">
									Balanzify shall:
								</p>
								<ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
									<li>Promptly notify Customer in writing of any claim for which indemnification is sought</li>
									<li>Give Customer sole control of the defense and settlement of such claim</li>
									<li>Provide Customer with reasonable assistance in connection with such defense</li>
								</ul>
								<p className="text-[#F9F9F9]/75 leading-relaxed mt-4">
									Customer shall not settle any claim that imposes obligations on Balanzify without Balanzify&apos;s prior written consent.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">15. TERM AND TERMINATION</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">15.1 Term</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									This Agreement commences on the date Customer accepts it and continues for the subscription term specified in the applicable Order Form. Monthly subscriptions renew automatically on a month-to-month basis. Annual subscriptions renew automatically for successive one-year terms unless either party provides written notice of non-renewal at least 30 days before the end of the then-current term.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">15.2 Termination by Customer</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Customer may terminate this Agreement at any time upon 30 days written notice to Balanzify. Customer remains responsible for all fees accrued through the termination effective date and for any payroll runs initiated prior to termination. Annual subscription fees paid in advance are non-refundable upon early termination except as required by applicable law.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">15.3 Termination by Balanzify</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed mb-2">
									Balanzify may terminate this Agreement immediately upon written notice if:
								</p>
								<ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
									<li>Customer fails to pay subscription fees within 30 days of the due date</li>
									<li>Customer materially breaches this Agreement and fails to cure such breach within 10 days of written notice</li>
									<li>Customer engages in fraud, money laundering, or illegal activity</li>
									<li>Customer&apos;s actions create unacceptable compliance or financial risk for Balanzify or its banking partners</li>
									<li>Balanzify is required to terminate by applicable law or regulatory directive</li>
								</ul>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">15.4 Effect of Termination</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed mb-2">
									Upon termination:
								</p>
								<ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
									<li>Customer&apos;s license to access the Platform terminates immediately</li>
									<li>Balanzify will provide Customer with access to export Customer Data for 90 days following termination</li>
									<li>Customer remains responsible for all outstanding fees</li>
									<li>All provisions of this Agreement that by their nature should survive termination shall survive, including Sections 9, 11, 13, 14, 16, and 17</li>
								</ul>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">16. DISPUTE RESOLUTION</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">16.1 Informal Resolution</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Before initiating formal dispute proceedings, the parties agree to attempt to resolve any dispute through good-faith negotiation. The disputing party shall provide written notice describing the dispute in reasonable detail, and the parties shall meet and confer within 15 business days of such notice.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">16.2 Binding Arbitration</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									If informal resolution is unsuccessful, any dispute, controversy, or claim arising out of or relating to this Agreement, or the breach, termination, or validity thereof, shall be resolved exclusively by binding arbitration administered by the American Arbitration Association (&quot;AAA&quot;) under its Commercial Arbitration Rules, as amended from time to time. The arbitration shall be conducted by a single arbitrator in Wilmington, Delaware. The arbitrator&apos;s decision shall be final, binding, and enforceable in any court of competent jurisdiction.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">16.3 Class Action Waiver</h3>
								<div className="p-4 rounded border border-white/10">
									<p className="text-[#F9F9F9]/75 leading-relaxed font-semibold">
										CUSTOMER WAIVES ANY RIGHT TO PARTICIPATE IN A CLASS ACTION, CONSOLIDATED ACTION, OR REPRESENTATIVE ACTION AGAINST BALANZIFY. ALL ARBITRATIONS SHALL PROCEED ON AN INDIVIDUAL BASIS.
									</p>
								</div>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">16.4 Injunctive Relief</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Notwithstanding the foregoing, either party may seek injunctive or other equitable relief from a court of competent jurisdiction to prevent irreparable harm pending arbitration, including with respect to intellectual property infringement or unauthorized use of the Platform.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">16.5 Governing Law</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles. For matters not subject to arbitration, the parties consent to exclusive jurisdiction and venue in the state and federal courts located in Wilmington, Delaware.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">17. GENERAL PROVISIONS</h2>

						<div className="space-y-6">
							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">17.1 Entire Agreement</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									This Agreement, together with the applicable Order Form, Privacy Policy, and all incorporated policies, constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements, understandings, negotiations, and representations, whether written or oral, relating to the same subject matter.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">17.2 Amendments</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Balanzify may amend these Terms by providing Customer with 30 days written notice via email to Customer&apos;s address on file. Customer&apos;s continued use of the Services after the effective date of an amendment constitutes acceptance. If Customer does not agree to an amendment, Customer may terminate this Agreement prior to the effective date of the amendment pursuant to Section 15.2.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">17.3 Severability</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									If any provision of this Agreement is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">17.4 Waiver</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									No waiver by either party of any breach or default under this Agreement shall be deemed a waiver of any subsequent breach or default. A waiver shall be effective only if made in writing and signed by an authorized representative of the waiving party.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">17.5 Force Majeure</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Neither party shall be liable for any failure or delay in performance caused by circumstances beyond its reasonable control, including without limitation acts of God, natural disasters, pandemic, war, terrorism, government action, banking system failures, telecommunications infrastructure failures, or power outages, provided that the affected party provides prompt written notice and uses commercially reasonable efforts to resume performance.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">17.6 Assignment</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									Customer may not assign or transfer this Agreement or any rights hereunder without Balanzify&apos;s prior written consent. Balanzify may assign this Agreement in connection with a merger, acquisition, or sale of all or substantially all of its assets without Customer&apos;s consent. Any purported assignment in violation of this Section is void.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">17.7 Notices</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									All notices under this Agreement shall be in writing and delivered by email (with confirmation of receipt) or certified mail to the addresses on file. Notices to Balanzify shall be sent to{" "}
									<Link
										href="mailto:legal@balanzify.com"
										className="text-[#5A5FEE] font-medium hover:underline"
									>
										legal@balanzify.com
									</Link>
									. Notices to Customer shall be sent to the email address associated with Customer&apos;s account.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">17.8 Relationship of the Parties</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									The parties are independent contractors. Nothing in this Agreement creates a partnership, joint venture, agency, fiduciary, or employment relationship between the parties. Neither party has authority to bind the other in any respect.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">17.9 Third-Party Beneficiaries</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									This Agreement is for the sole benefit of the parties and their permitted successors and assigns. Nothing in this Agreement, express or implied, is intended to or shall create any rights in any third party.
								</p>
							</div>

							<div>
								<h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">17.10 Counterparts and Electronic Signatures</h3>
								<p className="text-[#F9F9F9]/75 leading-relaxed">
									This Agreement may be executed in counterparts, each of which shall be deemed an original. Electronic acceptance of these Terms — including by clicking &quot;I Agree&quot; or any similar button — shall constitute a valid, binding, and enforceable signature for all purposes.
								</p>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-10">
						<h2 className="text-xl font-bold text-[#F9F9F9] mb-4">18. CONTACT INFORMATION</h2>
						<p className="text-[#F9F9F9]/75 leading-relaxed mb-6">
							For questions, notices, or concerns regarding these Terms:
						</p>
						<div className="space-y-3 text-[#F9F9F9]/75">
							<div>
								<p className="font-semibold">General inquiries</p>
								<Link
									href="mailto:support@balanzify.com"
									className="text-[#5A5FEE] font-medium hover:underline"
								>
									support@balanzify.com
								</Link>
							</div>
							<div>
								<p className="font-semibold">Legal notices</p>
								<Link
									href="mailto:legal@balanzify.com"
									className="text-[#5A5FEE] font-medium hover:underline"
								>
									legal@balanzify.com
								</Link>
							</div>
							<div>
								<p className="font-semibold">Security concerns</p>
								<Link
									href="mailto:security@balanzify.com"
									className="text-[#5A5FEE] font-medium hover:underline"
								>
									security@balanzify.com
								</Link>
							</div>
							<div>
								<p className="font-semibold">Privacy requests</p>
								<Link
									href="mailto:privacy@balanzify.com"
									className="text-[#5A5FEE] font-medium hover:underline"
								>
									privacy@balanzify.com
								</Link>
							</div>
							<div>
								<p className="font-semibold">Mailing address</p>
								<p>Balanzify Inc., 2415 Emerson Avenue South, Suite 302, Minneapolis, Minnesota 55405</p>
							</div>
							<div>
								<p className="font-semibold">Website</p>
								<Link
									href="https://www.balanzify.com"
									target="_blank"
									rel="noopener noreferrer"
									className="text-[#5A5FEE] font-medium hover:underline"
								>
									balanzify.com
								</Link>
							</div>
						</div>
					</section>

					<hr className="border-white/10 my-8" />

					<section className="mb-16 bg-white/5 p-6 rounded">
						<p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
							These Terms of Service are effective as of April 18, 2026.
						</p>
						<p className="text-[#F9F9F9]/75 font-semibold mb-8">BALANZIFY INC.</p>
						<div className="border-t border-gray-300 pt-4">
							<p className="text-[#F9F9F9]/75 font-semibold">Osman Aden</p>
							<p className="text-[#F9F9F9]/75">Founder & Chief Executive Officer</p>
							<p className="text-[#F9F9F9]/75">Date: April 18, 2026</p>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
