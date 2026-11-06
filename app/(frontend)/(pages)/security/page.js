import Link from "next/link";

export const metadata = {
  title: "Security | Pilucent",
  description:
    "Pilucent Security Policy — our commitment to protecting customer data, maintaining system resilience, and reducing security exposure across our accounting and payroll platform.",
};

export default function SecurityPage() {
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
              Security at Pilucent
            </h1>
            <p className="text-[#F9F9F9]/70 font-semibold animate-fade-in-up [animation-delay:120ms]">
              Our commitment to protecting your data and maintaining system resilience
            </p>
          </div>
        </div>
      </div>

      {/* Policy content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#F9F9F9]/50 text-sm mt-8 mb-5">
            <strong>Effective Date:</strong> March 19, 2026
          </p>
          <p className="text-[#F9F9F9]/75 leading-relaxed mb-10">
            Pilucent is committed to protecting the confidentiality, integrity, and availability of customer data across our accounting, payroll, and financial management platform. We recognize that our customers rely on Pilucent to handle sensitive financial, payroll, employee, and operational information, and we take that responsibility seriously.
          </p>
          <p className="text-[#F9F9F9]/75 leading-relaxed mb-10">
            Our security program is designed to support secure product development, controlled access to sensitive systems and data, strong operational safeguards, and ongoing risk management across our platform and supporting infrastructure.
          </p>

          <hr className="border-white/10 my-8" />

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Our Security Approach
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-6">
              Pilucent follows a practical, risk-based security model focused on protecting customer data, maintaining system resilience, and reducing security exposure across the software lifecycle. Our approach includes administrative, technical, and operational safeguards intended to support secure service delivery and ongoing improvement.
            </p>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Our security priorities include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
              <li>Protecting customer and financial data</li>
              <li>Restricting unauthorized access</li>
              <li>Maintaining secure software and infrastructure</li>
              <li>Monitoring for vulnerabilities and operational risk</li>
              <li>Supporting secure integrations with third-party providers</li>
              <li>Strengthening internal policies and controls as the platform evolves</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Application and Platform Security
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Pilucent is designed with security controls intended to help safeguard platform operations and customer information. Our security measures include, where applicable:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75 mb-6">
              <li>Secure transport of data using modern encryption protocols</li>
              <li>Encryption at rest for sensitive data</li>
              <li>Role-based access controls for authorized users and internal personnel</li>
              <li>Authentication and permission controls to restrict access based on business need</li>
              <li>System monitoring, logging, and audit trails to support accountability and investigation</li>
              <li>Secure infrastructure and environment management practices</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              Access to production systems and sensitive operational data is limited to authorized personnel with legitimate business requirements and appropriate permissions.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Development and Vulnerability Management
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Pilucent maintains internal development and maintenance practices intended to reduce software risk and improve overall platform security. Security considerations are incorporated into product development, deployment, and operational review workflows.
            </p>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Our vulnerability management practices include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75 mb-4">
              <li>Monitoring software dependencies, libraries, frameworks, and supporting components for known security issues</li>
              <li>Reviewing and prioritizing vulnerabilities based on severity, exploitability, and business impact</li>
              <li>Applying patches, upgrades, or mitigations through planned maintenance and deployment processes</li>
              <li>Maintaining internal workflows to track and address identified risks</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              We continuously review and improve these processes as our product, infrastructure, and integrations expand.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Software Lifecycle and End-of-Life (EOL) Management
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Pilucent monitors software components and supporting technologies for lifecycle and support status, including end-of-life and end-of-support conditions. This includes relevant application dependencies, frameworks, infrastructure components, and other technologies used to support service delivery.
            </p>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              When a component is identified as nearing or reaching end-of-life status, we evaluate appropriate remediation actions, which may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75 mb-4">
              <li>Version upgrades</li>
              <li>Supported replacements</li>
              <li>Security mitigations</li>
              <li>Deprecation planning</li>
              <li>Internal tracking and remediation prioritization</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              This process is part of our broader development and vulnerability management practice and is intended to reduce security and operational risk associated with unsupported software.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Access Control and Internal Security
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Pilucent applies access management principles intended to ensure that data and systems are available only to appropriately authorized users. Our internal access control practices include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75 mb-4">
              <li>Role-based access permissions</li>
              <li>Restricted access to sensitive systems and production environments</li>
              <li>Access granted based on job responsibility and business need</li>
              <li>Periodic review and adjustment of access privileges where appropriate</li>
              <li>Logging of key administrative and system activities</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              Sensitive information is handled under controlled access conditions and is not made broadly available internally.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Data Protection
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Pilucent processes data needed to provide accounting, payroll, reconciliation, reporting, and related operational services. We implement safeguards intended to protect sensitive customer and financial data throughout its lifecycle.
            </p>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              These safeguards include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75 mb-6">
              <li>Encryption in transit</li>
              <li>Encryption at rest for sensitive data</li>
              <li>Access restrictions for sensitive records</li>
              <li>Security monitoring and operational controls</li>
              <li>Structured data retention and deletion processes</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              For more information about how we collect, use, retain, and delete information, please review our{" "}
              <Link
                href="/privacy-policy"
                className="text-[#5A5FEE] font-medium hover:underline"
              >
                Privacy Policy
              </Link>
              {" "}and if needed, our Data Retention and Deletion Policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Monitoring, Logging, and Operational Security
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Pilucent uses system monitoring, event logging, and operational review processes to help identify service issues, abnormal activity, and security-relevant events. These practices support:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75 mb-4">
              <li>System reliability and performance monitoring</li>
              <li>Troubleshooting and operational diagnostics</li>
              <li>Fraud prevention and misuse detection</li>
              <li>Auditability of key administrative and application activities</li>
              <li>Incident investigation and response</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              Logs and audit trails are retained in accordance with internal operational requirements and applicable policy standards.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Third-Party Services and Financial Integrations
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Pilucent may rely on trusted third-party service providers and infrastructure partners to deliver specific features and supporting services. These may include cloud infrastructure, payment-related services, communications tooling, and financial data integrations.
            </p>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              For connected financial account experiences, Pilucent may integrate with authorized third-party providers. When customers choose to connect financial accounts through such providers:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75 mb-4">
              <li>Access occurs only through authorized integration flows</li>
              <li>Customer authorization is required</li>
              <li>Pilucent does not store online banking usernames or passwords</li>
              <li>Only the data necessary to support platform functionality is accessed and processed</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              Customers using such integrations are also subject to the applicable provider's policies and terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Incident Response
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Pilucent maintains internal processes to review, manage, and respond to operational and security-related issues as appropriate to the nature and severity of the event. Our response approach may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75 mb-4">
              <li>Issue identification and internal escalation</li>
              <li>Containment and remediation actions</li>
              <li>Impact assessment</li>
              <li>Logging and review of the event</li>
              <li>Improvement of internal controls and procedures where needed</li>
            </ul>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              We continue to refine our response capabilities as our platform and customer base grow.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Data Retention and Deletion
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Pilucent retains data only as long as necessary to operate the service, meet legal and financial recordkeeping requirements, support audits and dispute resolution, and maintain platform security and operational integrity.
            </p>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              When data is no longer required, we apply deletion or anonymization processes in accordance with our internal retention standards and applicable legal or compliance obligations.
            </p>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              For detailed information, please review our Data Retention and Deletion Policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Continuous Improvement
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Security is an ongoing process. Pilucent continuously evaluates and improves its security, operational, and governance practices as our platform, infrastructure, and customer requirements evolve.
            </p>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              This includes review and refinement of:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#F9F9F9]/75">
              <li>Internal access controls</li>
              <li>Vulnerability management practices</li>
              <li>Software lifecycle management</li>
              <li>Data handling procedures</li>
              <li>Operational security processes</li>
              <li>Policy and governance documentation</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">
              Responsible Disclosure
            </h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              If you believe you have discovered a security issue related to Pilucent, we encourage responsible disclosure. Please report security concerns to:
            </p>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              Email:{" "}
              <Link
                href="mailto:security@pilucent.com"
                className="text-[#5A5FEE] font-medium hover:underline"
              >
                security@pilucent.com
              </Link>
            </p>
            <p className="text-[#F9F9F9]/75 leading-relaxed">
              Please include sufficient detail to help us review and investigate the issue.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#F9F9F9] mb-4">Contact</h2>
            <p className="text-[#F9F9F9]/75 leading-relaxed mb-4">
              For security questionnaires, trust inquiries, or general security-related questions:
            </p>
            <p className="text-[#F9F9F9]/75 leading-relaxed space-y-2">
              Security:{" "}
              <Link
                href="mailto:security@pilucent.com"
                className="text-[#5A5FEE] font-medium hover:underline"
              >
                security@pilucent.com
              </Link>
              <br />
              Support:{" "}
              <Link
                href="mailto:support@pilucent.com"
                className="text-[#5A5FEE] font-medium hover:underline"
              >
                support@pilucent.com
              </Link>
              <br />
              Website:{" "}
              <Link
                href="https://www.pilucent.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5A5FEE] font-medium hover:underline"
              >
                https://www.pilucent.com
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
