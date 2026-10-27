import Link from "next/link";

export const metadata = {
  title: "Data Retention and Deletion Policy | Balanzify",
  description:
    "Balanzify Data Retention and Deletion Policy — how we retain, manage, and securely delete data across our accounting, payroll, and financial management platform.",
};

export default function DataRetentionPolicyPage() {
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
              Data Retention and Deletion Policy
            </h1>
            <p className="text-[#F9F9F9]/70 font-semibold animate-fade-in-up [animation-delay:120ms]">
              Effective Date: March 19, 2026
            </p>
          </div>
        </div>
      </div>

      {/* Policy content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#F9F9F9]/75 leading-relaxed mt-10">
            Balanzify (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) maintains this Data
            Retention and Deletion Policy to define how data is retained, managed,
            and securely deleted across our accounting, payroll, and financial
            management platform, in alignment with business needs and applicable
            data protection regulations.
          </p>

          <hr className="border-white/10 my-8" />

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">1. Purpose</h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              This policy establishes guidelines for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
              <li>Retaining data only as long as necessary to deliver Balanzify services</li>
              <li>Protecting sensitive financial and operational data throughout its lifecycle</li>
              <li>Ensuring secure and compliant deletion of data when no longer required</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">2. Scope</h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              This policy applies to all data processed within Balanzify, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
              <li>Customer and organization account data</li>
              <li>Financial data (bank transactions, reconciliations, reports)</li>
              <li>Payroll and employee-related data</li>
              <li>Bank-connected data from linked financial accounts</li>
              <li>Application logs, audit logs, and system-generated data</li>
              <li>Internal operational and support data</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              3. Data Retention Principles
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Balanzify follows these principles:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
              <li>Data is retained based on business necessity and service delivery requirements</li>
              <li>Retention aligns with financial compliance, audit requirements, and regulatory obligations</li>
              <li>Sensitive data is protected using role-based access controls and restricted access policies</li>
              <li>Data minimization is enforced wherever possible</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              4. Retention Periods
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-6">
              Balanzify retains data based on the following guidelines:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">
                  Customer Account Data
                </h3>
                <p className="text-[#F9F9F9]/75 leading-relaxed">
                  Retained for the duration of the active subscription. After account closure, data is retained for a limited period to support compliance, audits, and dispute resolution.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">
                  Financial and Accounting Data
                </h3>
                <p className="text-[#F9F9F9]/75 leading-relaxed">
                  Includes transactions, ledgers, reports, and reconciliation records. Retained in accordance with financial compliance requirements, typically for multiple years depending on jurisdiction.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">
                  Payroll and Employee Data
                </h3>
                <p className="text-[#F9F9F9]/75 leading-relaxed">
                  Retained as required for payroll processing, tax reporting, and legal compliance, in alignment with applicable statutory requirements.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">
                  Bank-Connected Data
                </h3>
                <p className="text-[#F9F9F9]/75 leading-relaxed">
                  Only necessary data is stored to support transaction syncing, categorization, and reconciliation. Retention aligns with applicable legal, compliance, and service requirements.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#F9F9F9] mb-2">
                  Logs and Audit Trails
                </h3>
                <p className="text-[#F9F9F9]/75 leading-relaxed">
                  Includes activity logs, system logs, and audit trails. Retained for a limited duration to support monitoring, debugging, fraud detection, and security investigations.
                </p>
              </div>
            </div>

            <p className="text-[#F9F9F9]/75 leading-relaxed mt-6">
              Retention periods are periodically reviewed and adjusted based on evolving compliance requirements.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              5. Data Deletion
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Balanzify implements structured and secure deletion processes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
              <li>Data is deleted or anonymized when no longer required for operational or legal purposes</li>
              <li>Users may request account and data deletion, subject to compliance obligations</li>
              <li>Deletion workflows apply across primary systems, caches, and associated environments</li>
              <li>Backup data is purged according to defined retention cycles</li>
              <li>Sensitive data is permanently removed using secure deletion practices</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">6. User Rights</h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Balanzify supports user data rights, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75 mb-4">
              <li>Access your personal data</li>
              <li>Update or correct your information</li>
              <li>Request deletion of your data, subject to regulatory and record-keeping requirements</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              Requests can be submitted at:{" "}
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
              7. Security Controls
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              To protect retained data, Balanzify enforces:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
              <li>Encryption in transit (TLS 1.2 or higher)</li>
              <li>Encryption at rest for sensitive data</li>
              <li>Role-based access control (RBAC) and secure authentication mechanisms</li>
              <li>Monitoring and audit logging of system activities</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              8. Policy Review
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              This policy is reviewed periodically and updated as Balanzify's systems, infrastructure, and regulatory obligations evolve.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              9. Compliance and Enforcement
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              Balanzify is committed to maintaining compliance with applicable data
              protection, financial, and privacy regulations. This policy is
              continuously refined as part of our broader compliance and governance
              program.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">10. Contact</h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              For any questions regarding this policy:
            </p>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
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
