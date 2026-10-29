import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Pilucent",
  description:
    "Pilucent Privacy Policy — how we collect, use, store, and share information when you use our accounting, payroll, and financial management platform.",
};

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-[#F9F9F9]/70 font-semibold animate-fade-in-up [animation-delay:120ms]">
              How we collect, use, store, and share your information
            </p>
          </div>
        </div>
      </div>

      {/* Policy content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#F9F9F9]/50 text-sm mt-8">
            <strong>Effective Date:</strong> March 19, 2026
          </p>
          <p className="text-[#F9F9F9]/75 leading-relaxed mb-10">
            Pilucent ("we," "our," or "us") is committed to protecting the privacy and security of your data. This Privacy Policy explains how we collect, use, store, and share information when you use our accounting, payroll, and financial management platform.
          </p>

          <hr className="border-white/10 my-8" />

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Information We Collect
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-6">
              We collect information to provide and improve our services. This
              includes:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">
                  Personal Information
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-[#F9F9F9]/75">
                  <li>Name, email address, phone number</li>
                  <li>Business details (company name, address, tax-related information)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">
                  Financial Information
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-[#F9F9F9]/75">
                  <li>Bank account and transaction data (via secure third-party integrations)</li>
                  <li>Accounting records, invoices, expenses, payroll data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">
                  Usage and Technical Data
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-[#F9F9F9]/75">
                  <li>Device information, IP address, browser type</li>
                  <li>Application usage logs and interaction data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">
                  Support and Communication Data
                </h3>
                <p className="text-[#F9F9F9]/75 leading-relaxed">
                  Messages, support requests, and feedback
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              How We Use Information
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              We use collected data to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
              <li>Provide and operate Pilucent services</li>
              <li>Process financial data and generate reports</li>
              <li>Enable payroll processing and compliance features</li>
              <li>Synchronize bank transactions and categorize financial data</li>
              <li>Improve system performance and user experience</li>
              <li>Detect fraud, prevent unauthorized access, and maintain platform security</li>
              <li>Communicate updates, service notices, and support responses</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Financial Data and Bank Integration
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              When you connect your financial accounts:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
              <li>Data is accessed securely through authorized third-party providers</li>
              <li>We retrieve only the data necessary to provide our services</li>
              <li>We do not store banking credentials (e.g., usernames or passwords)</li>
              <li>Access to financial data occurs only with your explicit consent</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed mt-4">
              When you connect financial accounts through a third-party provider, you are also subject to that provider&apos;s applicable privacy policy and terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Data Sharing and Disclosure
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-6">
              We do not sell your data. We may share information only in the
              following cases:
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">
                  Service Providers
                </h3>
                <p className="text-[#F9F9F9]/75 leading-relaxed">
                  With trusted third-party vendors (e.g., payment processors, cloud
                  providers) to operate the platform
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">
                  Legal and Compliance
                </h3>
                <p className="text-[#F9F9F9]/75 leading-relaxed">
                  When required by law, regulation, or legal process
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">
                  Business Operations
                </h3>
                <p className="text-[#F9F9F9]/75 leading-relaxed">
                  In case of merger, acquisition, or restructuring, with
                  appropriate safeguards
                </p>
              </div>
            </div>

            <p className="text-[#F9F9F9]/75 leading-relaxed">
              All third parties are required to protect your data and use it only
              for specified purposes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Data Retention
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              We retain data only as long as necessary to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75 mb-4">
              <li>Provide services</li>
              <li>Meet legal and financial reporting obligations</li>
              <li>Resolve disputes and enforce agreements</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              Retention periods vary depending on data type and applicable
              regulations.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Data Security
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              We implement industry-standard security measures, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75 mb-4">
              <li>Encryption in transit (TLS 1.2 or higher)</li>
              <li>Encryption at rest</li>
              <li>Role-based access controls</li>
              <li>Secure infrastructure and monitoring systems</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              Despite these measures, no system can guarantee absolute security.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Your Rights and Choices
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              You may have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75 mb-4">
              <li>Access your personal data</li>
              <li>Update or correct your information</li>
              <li>Request deletion of your data (subject to legal and compliance requirements)</li>
              <li>Disconnect financial account integrations at any time</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              To exercise these rights, contact us at:{" "}
              <Link
                href="mailto:support@balanzify.com"
                className="text-[#5A5FEE] font-medium hover:underline"
              >
                support@balanzify.com
              </Link>
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Cookies and Tracking
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Pilucent uses cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75 mb-4">
              <li>Maintain session security</li>
              <li>Improve performance and user experience</li>
              <li>Analyze usage patterns</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              International Data Transfers
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              Your data may be processed in regions where our infrastructure or service providers operate. We take appropriate measures to ensure your data is protected.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Changes to This Policy
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              We may update this Privacy Policy from time to time. Updates will
              be posted on our website with the revised effective date.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">Contact</h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy:
            </p>
            <p className="text-[#F9F9F9]/75 leading-relaxed space-y-2">
              Email:{" "}
              <Link
                href="mailto:support@balanzify.com"
                className="text-[#5A5FEE] font-medium hover:underline"
              >
                support@balanzify.com
              </Link>
              <br />
              Website:{" "}
              <Link
                href="https://www.balanzify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5A5FEE] font-medium hover:underline"
              >
                https://www.balanzify.com
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
