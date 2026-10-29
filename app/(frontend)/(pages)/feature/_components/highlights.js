'use client'
import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import AnimateOnScroll from '../../../../components/V2/AnimateOnScroll'

const SECTION_GROUPS = [
  {
    banner: {
      eyebrow: 'Finance',
      title: 'Close your books in hours. Know your numbers in real time.',
      description:
        'Accounting, invoicing, and reporting share one ledger — so every transaction lands in your books and updates your numbers the moment it happens.',
    },
    sections: [
      {
        eyebrow: 'Accounting & Financials',
        eyebrowIcon: 'ti-calculator',
        title: 'Get a real-time P&L without touching a spreadsheet.',
        description:
          'Every transaction flows straight into your ledger and reconciles automatically. No more month-end scramble — your financials are always current and ready to share.',
        points: [
          'Double-entry general ledger with full audit trail',
          'Real-time P&L, balance sheet, and cash flow',
          'Automated bank reconciliation — 21,000+ institutions supported',
          'Multi-currency support for international transactions',
          'Accountant access mode with read-only permissions',
          'Export-ready reports for your tax preparer',
          'Journal entries, adjustments, and period locking',
          'Chart of accounts customizable to your business structure',
        ],
        before: [
          'Expense reimbursements take 3 weeks',
          'Vendor payments tracked on a spreadsheet',
        ],
        after: [
          'Expenses reimbursed on next payroll run',
          'Vendor payments scheduled and auto-reconciled',
        ],
        image: '/V2/feature_1.png',
      },
      {
        eyebrow: 'Invoicing & Payments',
        eyebrowIcon: 'ti-receipt',
        title: 'Get paid faster. Stay on top of cash flow. Every time.',
        description:
          'Send professional invoices, accept online payments, and let Pilucent chase overdue accounts — so cash hits your account faster without extra admin.',
        points: [
          'Professional invoices with your branding',
          'Automatic payment reminders and follow-ups',
          'Online payments via ACH, card, and bank transfer',
          'Recurring invoices for retainers and subscriptions',
          'Partial payments and credit notes supported',
          'Aging reports with one-click collections view',
          'Quotes that convert to invoices in one click',
          'Payment status synced to your books instantly',
        ],
        before: [
          'Invoices sent manually and chased over email',
          'No visibility into who has paid and who has not',
        ],
        after: [
          'Invoices go out automatically on schedule',
          'Real-time AR dashboard shows every open balance',
        ],
        image: '/V2/feature_2.png',
      },
      {
        eyebrow: 'Reporting',
        eyebrowIcon: 'ti-chart-bar',
        title: 'Show your board real numbers. Any time they ask.',
        description:
          'Custom dashboards, budget vs. actuals, and export-ready reports — always current, always accurate. No more waiting until month-end to answer a simple question.',
        points: [
          'Live P&L, balance sheet, and cash flow',
          'Drill down to source transactions',
          'Board-ready reports on demand',
          'Scheduled report delivery to stakeholders',
          'Custom date ranges and filters',
          'Export to PDF or CSV instantly',
          'Budget vs. actuals by department',
          'Multi-company consolidated reporting',
        ],
        before: [
          'Reports prepared manually each quarter',
          'No visibility until month-end close',
        ],
        after: [
          'Live financials updated in real time',
          'Board pack ready in one click',
        ],
        image: '/V2/feature_3.png',
      },
    ],
  },
  {
    banner: {
      eyebrow: 'People',
      title: 'Run payroll in minutes. Onboard a new hire in an afternoon.',
      description:
        'Payroll and HR share the same data — so every hire, raise, and departure flows through without a single manual step between systems.',
    },
    sections: [
      {
        eyebrow: 'Payroll',
        eyebrowIcon: 'ti-cash',
        title: 'Payroll made easy. Compliance handled for you.',
        description:
          'Run payroll in two clicks with automated tax calculations, direct deposit, and W-2/1099 filing — all included. Multi-state compliance is built in, not bolted on.',
        points: [
          'Automated payroll with multi-state tax compliance',
          'Direct deposit and pay stub delivery',
          'W-2 and 1099 filing included',
          'Overtime and bonus calculations handled automatically',
          'Payroll journal entries posted to your books',
          'Employee self-service pay history access',
          'Garnishments and deductions managed in one place',
          'Year-end tax forms generated and filed',
        ],
        before: [
          'Payroll takes a full day every two weeks',
          'Tax filings handled by a separate provider',
        ],
        after: [
          'Payroll runs in minutes with one approval',
          'Tax compliance and filings included in-platform',
        ],
        image: '/V2/feature_4.png',
      },
      {
        eyebrow: 'HR & Workforce',
        eyebrowIcon: 'ti-users',
        title: 'The full employee lifecycle. From offer letter to last day.',
        description:
          'Hiring, onboarding, PTO, performance, and offboarding — all connected to payroll so every change flows through without a single manual step.',
        points: [
          'Digital offer letters and onboarding workflows',
          'PTO accrual, requests, and approval routing',
          'Employee profiles with full employment history',
          'Document storage for contracts and compliance',
          'Org chart and department management',
          'Attendance and timesheet integration',
          'Offboarding checklists with access revocation',
          'HR reports tied directly to payroll data',
        ],
        before: [
          'New hire paperwork spread across five tools',
          'PTO balances tracked in a shared spreadsheet',
        ],
        after: [
          'New hires onboarded digitally in one afternoon',
          'PTO synced to payroll with zero manual entry',
        ],
        image: '/V2/feature_5.png',
      },
      {
        eyebrow: 'Security & Admin',
        eyebrowIcon: 'ti-shield',
        title: 'Role-based access. Audit logs. Built in by default.',
        description:
          'Enterprise-grade security without enterprise complexity. Control who sees what, track every change, and stay compliant without hiring a dedicated admin.',
        points: [
          'Granular role-based permissions per module',
          'Full audit log of every user action',
          'Two-factor authentication for all accounts',
          'Session management and forced logout',
          'IP allowlisting for sensitive operations',
          'SOC 2 compliant infrastructure',
          'Data encryption at rest and in transit',
          'Compliance-ready access controls out of the box',
        ],
        before: [
          'Everyone has the same login with full access',
          'No record of who changed what and when',
        ],
        after: [
          'Custom roles limit access to what each person needs',
          'Every action logged with timestamp and user',
        ],
        image: '/V2/feature_6.png',
      },
    ],
  },
  {
    banner: {
      eyebrow: 'Operations',
      title: "Know exactly what you have. Know exactly what you've spent.",
      description:
        'Inventory, customers, and sales connect to your books — so stock levels, COGS, and cash all stay in sync without a single re-entry.',
    },
    sections: [
      {
        eyebrow: 'Spend Management',
        eyebrowIcon: 'ti-wallet',
        title: 'Never oversell. Never stockout. Know your COGS in real time.',
        description:
          'Track inventory across every location, get reorder alerts before you run out, and let COGS post to your books automatically when items sell.',
        points: [
          'Real-time inventory across all locations',
          'Automatic reorder alerts and low-stock warnings',
          'COGS posted to books on every sale',
          'Purchase orders linked to vendor bills',
          'Multi-warehouse transfer tracking',
          'Barcode and SKU management',
          'Inventory valuation reports on demand',
          'Shrinkage and adjustment workflows',
        ],
        before: [
          'Stock counts done manually once a month',
          'COGS calculated in a spreadsheet after close',
        ],
        after: [
          'Inventory updates live with every transaction',
          'COGS flows to your P&L automatically',
        ],
        image: '/V2/feature_7.png',
      },
      {
        eyebrow: 'Customers & CRM',
        eyebrowIcon: 'ti-address-book',
        title: "See every customer's complete financial picture in one place.",
        description:
          'CRM with transaction history, payment terms, and aging reports — directly connected to AR and collections so you always know where you stand with every account.',
        points: [
          'Full customer transaction and payment history',
          'Payment terms and credit limits per account',
          'AR aging and collections dashboard',
          'Contact management with activity timeline',
          'Customer statements generated on demand',
          'Notes and tags for account management',
          'Linked invoices, quotes, and payments',
          'Revenue by customer reporting',
        ],
        before: [
          'Customer data split between CRM and accounting',
          'Collections chased without payment context',
        ],
        after: [
          'One profile shows every invoice, payment, and balance',
          'Collections prioritized by real-time aging data',
        ],
        image: '/V2/feature_6.png',
      },
      {
        eyebrow: 'Sales & Processing',
        eyebrowIcon: 'ti-scan',
        title: 'Quote to cash in one system. 10x faster.',
        description:
          'Quotes become invoices, invoices become payments, and payments reconcile automatically. From first contact to cash in the bank — no handoffs, no re-entry.',
        points: [
          'Quotes that convert to invoices in one click',
          'Sales orders linked to inventory and fulfillment',
          'Receipt scanning with automatic categorization',
          'Expense approvals routed to the right manager',
          'Multi-line invoices with tax calculations',
          'Payment collection synced to bank reconciliation',
          'Sales pipeline connected to revenue reports',
          'End-to-end audit trail from quote to deposit',
        ],
        before: [
          'Quotes retyped as invoices in a separate tool',
          'Receipts photographed and entered manually',
        ],
        after: [
          'Quote accepted and invoiced in one workflow',
          'Receipts scanned, categorized, and posted automatically',
        ],
        image: '/V2/feature_7.png',
      },
    ],
  },
]

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-[2px]">
    <circle cx="8" cy="8" r="7" stroke="#7C5BFF" strokeWidth="1.2" />
    <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#7C5BFF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const BeforeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
    <path d="M14.5628 14.0904C14.4138 14.0904 14.269 14.0411 14.151 13.9502L12.315 12.5342C12.2331 12.4711 12.1668 12.3901 12.1212 12.2974C12.0755 12.2047 12.0518 12.1027 12.0518 11.9994V9.21016C12.0518 9.03114 12.1229 8.85945 12.2495 8.73286C12.376 8.60627 12.5477 8.53516 12.7268 8.53516C12.9058 8.53516 13.0775 8.60627 13.2041 8.73286C13.3306 8.85945 13.4018 9.03114 13.4018 9.21016V11.6672L14.9753 12.8807C15.0869 12.9667 15.1689 13.0855 15.2096 13.2205C15.2503 13.3555 15.2477 13.4998 15.2022 13.6333C15.1567 13.7667 15.0706 13.8825 14.9559 13.9645C14.8412 14.0465 14.7037 14.0905 14.5628 14.0904Z" fill="#F0F0F0" />
    <path d="M12.7287 1.55273C7.6737 1.55273 3.39345 5.24573 2.47845 10.0712L2.02995 9.50498C1.97485 9.43555 1.9066 9.37765 1.82912 9.33458C1.75164 9.29152 1.66643 9.26414 1.57836 9.25401C1.40051 9.23354 1.22181 9.28457 1.08158 9.39586C0.941343 9.50715 0.851064 9.66959 0.830599 9.84745C0.810134 10.0253 0.86116 10.204 0.972451 10.3442L2.44095 12.1982C2.49591 12.2678 2.56404 12.3258 2.64146 12.369C2.71887 12.4122 2.80404 12.4397 2.89209 12.4499C2.98014 12.4602 3.06935 12.453 3.15461 12.4287C3.23986 12.4044 3.3195 12.3636 3.38895 12.3085L5.24295 10.84C5.38328 10.7288 5.4737 10.5664 5.4943 10.3886C5.51491 10.2107 5.46402 10.0319 5.35283 9.89161C5.24163 9.75128 5.07925 9.66086 4.90139 9.64026C4.72354 9.61965 4.54478 9.67054 4.40445 9.78173L3.81645 10.2475C4.6422 6.08198 8.3532 2.90423 12.7295 2.90423C17.7447 2.90273 21.8255 6.98348 21.8255 11.9995C21.8255 17.0155 17.7455 21.0962 12.7287 21.0962C11.08 21.0984 9.46195 20.6513 8.04821 19.8031C6.63447 18.9549 5.4785 17.7376 4.70445 16.282C4.66359 16.2023 4.60727 16.1315 4.53878 16.0738C4.4703 16.0161 4.39101 15.9726 4.30554 15.9458C4.22007 15.9191 4.13013 15.9096 4.04096 15.9179C3.95179 15.9263 3.86517 15.9523 3.78615 15.9944C3.70713 16.0366 3.63728 16.094 3.58068 16.1634C3.52409 16.2328 3.48187 16.3128 3.45649 16.3987C3.43111 16.4846 3.42307 16.5747 3.43285 16.6637C3.44263 16.7527 3.47003 16.8389 3.51345 16.9172C4.40233 18.5891 5.72984 19.9872 7.35341 20.9614C8.97697 21.9357 10.8353 22.4492 12.7287 22.447C18.4895 22.447 23.1762 17.7602 23.1762 12.0002C23.1762 6.24023 18.4887 1.55273 12.7287 1.55273Z" fill="#F0F0F0" />
    <path d="M12.729 18.6025C16.3695 18.6025 19.3327 15.6407 19.3327 11.9995C19.3327 8.35823 16.3702 5.39648 12.729 5.39648C9.08773 5.39648 6.12598 8.35898 6.12598 11.9995C6.12598 15.64 9.08773 18.6025 12.729 18.6025ZM12.729 6.74648C15.6255 6.74648 17.982 9.10298 17.982 11.9995C17.982 14.896 15.6255 17.2525 12.729 17.2525C9.83323 17.2525 7.47673 14.896 7.47673 11.9995C7.47673 9.10298 9.83248 6.74648 12.729 6.74648Z" fill="#F0F0F0" />
  </svg>
)

const AfterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
    <path d="M21.1875 4.96875H12.1875V3.5625H10.7812V4.96875H5.625V6.375H10.7812V9.1875H12.1875V6.375H21.1875C21.9629 6.375 22.5938 7.00584 22.5938 7.78125V16.2188C22.5938 16.9942 21.9629 17.625 21.1875 17.625H12.1875V14.8125H10.7812V17.625H5.625V19.0312H10.7812V20.4375H12.1875V19.0312H21.1875C22.7383 19.0312 24 17.7696 24 16.2188V7.78125C24 6.23044 22.7383 4.96875 21.1875 4.96875ZM1.40625 16.2188V14.8125H0V16.2188C0 17.7696 1.26169 19.0312 2.8125 19.0312H4.21875V17.625H2.8125C2.03709 17.625 1.40625 16.9942 1.40625 16.2188ZM0 7.78125V9.1875H1.40625V7.78125C1.40625 7.00584 2.03709 6.375 2.8125 6.375H4.21875V4.96875H2.8125C1.26169 4.96875 0 6.23044 0 7.78125ZM0 10.5938H1.40625V13.4062H0V10.5938Z" fill="white" />
    <path d="M10.7812 10.5938H12.1875V13.4062H10.7812V10.5938Z" fill="white" />
  </svg>
)

const EyebrowBadge = ({ icon, label }) => (
  <span
    className="inline-flex items-center gap-1.5 text-[#F9F9F9] text-xs px-4 py-1.5 rounded-full w-fit mb-5"
    style={{
      border: '1px solid transparent',
      backgroundImage: `
        linear-gradient(#0B0919, #0B0919),
        linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0))
      `,
      backgroundOrigin: 'border-box',
      backgroundClip: 'padding-box, border-box',
    }}
  >
    <i className={`ti ${icon} text-[11px]`} aria-hidden="true" />
    {label}
  </span>
)

const SectionBanner = ({ eyebrow, title, description }) => (
  <AnimateOnScroll className="py-10 sm:py-12">
    <div className="relative rounded-3xl overflow-hidden">
      <Image
        src="/V2/feature_card.png"
        alt=""
        fill
        className="object-cover pointer-events-none select-none"
      />
      <div className="relative px-6 py-12 sm:px-10 sm:py-14 text-center">
        <span
          className="inline-block text-[#F9F9F9] text-xs px-5 py-1.5 rounded-full mb-5"
          style={{
            border: '1px solid transparent',
            backgroundImage: `
              linear-gradient(#140E26, #140E26),
              linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0))
            `,
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
          }}
        >
          {eyebrow}
        </span>
        <h2 className="text-[#F9F9F9] font-semibold text-2xl sm:text-3xl lg:text-[40px] leading-tight max-w-2xl mx-auto">
          {title}
        </h2>
        {description && (
          <p className="text-white/55 text-sm sm:text-base leading-relaxed mt-4 max-w-xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  </AnimateOnScroll>
)

const FeatureSection = ({ item }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6 py-12 sm:py-14 border-b border-white/[0.07] last:border-b-0">
    {/* Text — always left */}
    <AnimateOnScroll animation="animate-fade-in-left" className="flex flex-col justify-start lg:order-1 lg:pr-4">
      <EyebrowBadge icon={item.eyebrowIcon} label={item.eyebrow} />

      <h2 className="text-[#F9F9F9] font-medium text-2xl sm:text-[28px] lg:text-[32px] leading-tight tracking-tight mb-3 whitespace-pre-line">
        {item.title}
      </h2>
      <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-lg">{item.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {item.points.map((point) => (
          <div key={point} className="flex items-start gap-2">
            {/* <CheckIcon /> */}
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="#595959" stroke-width="2" />
              <path d="M8.7347 14.8422L5.16156 11.3561C5.05828 11.256 5 11.1196 5 10.9774C5 10.8352 5.05828 10.6988 5.16156 10.5985L5.9381 9.84088H5.93825C6.0417 9.7398 6.18209 9.68295 6.32865 9.68295C6.47505 9.68295 6.61545 9.7398 6.71905 9.84088L9.1251 12.1883L14.2811 7.15793C14.3846 7.05686 14.5249 7 14.6715 7C14.8179 7 14.9583 7.05686 15.0619 7.15793L15.8384 7.91555V7.9157C15.9419 8.01585 16 8.15221 16 8.29443C16 8.43665 15.9419 8.57301 15.8384 8.67332L9.51563 14.8421C9.41219 14.9431 9.27163 15 9.12523 15C8.97868 15 8.83827 14.9431 8.73483 14.8421L8.7347 14.8422Z" fill="#595959" />
            </svg>
            <span className="text-white/70 text-[13px] leading-snug">{point}</span>
          </div>
        ))}
      </div>
    </AnimateOnScroll>

    {/* Image — always right */}
    <AnimateOnScroll animation="animate-fade-in-right" delay={150} className="flex items-start lg:order-2 lg:pl-4">
      <div
        className="rounded-3xl overflow-hidden w-full"
        style={{
          border: '1px solid rgba(124,91,255,0.2)',
          background: 'linear-gradient(180deg, #1e1040 0%, rgba(80,40,180,0.08) 100%)',
        }}
      >
        <Image
          src={item.image}
          alt={item.eyebrow}
          width={720}
          height={450}
          className="w-full h-auto object-cover"
        />
      </div>
    </AnimateOnScroll>

    {/* Before — left column */}
    <AnimateOnScroll animation="animate-fade-in-up" delay={200} className="lg:order-3">
      <div className="rounded-2xl p-5 sm:p-6 h-full bg-white/[0.03] border border-white/[0.10]">
        <p className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
          <BeforeIcon />
          Before
        </p>
        {item.before.map((b) => (
          <div key={b} className="flex items-start gap-2.5 mb-2.5 last:mb-0">
            <div className="w-1 h-1 rounded-full bg-white/35 shrink-0 mt-[7px]" />
            <span className="text-white/55 text-sm leading-relaxed">{b}</span>
          </div>
        ))}
      </div>
    </AnimateOnScroll>

    {/* After — right column */}
    <AnimateOnScroll animation="animate-fade-in-up" delay={280} className="lg:order-4">
      <div
        className="rounded-2xl p-5 sm:p-6 h-full"
        style={{
          background: 'linear-gradient(135deg, #5B3FD4 0%, #4A32B0 100%)',
          border: '1px solid rgba(124,91,255,0.35)',
        }}
      >
        <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <AfterIcon />
          After
        </p>
        {item.after.map((a) => (
          <div key={a} className="flex items-start gap-2.5 mb-2.5 last:mb-0">
            <div className="w-1 h-1 rounded-full bg-white/80 shrink-0 mt-[7px]" />
            <span className="text-white/90 text-sm leading-relaxed">{a}</span>
          </div>
        ))}
      </div>
    </AnimateOnScroll>
  </div>
)

const FeatureCTA = () => {
  const router = useRouter()

  return (
    <AnimateOnScroll className="py-12 sm:py-16">
      <div
        className="rounded-3xl overflow-hidden text-center px-6 py-12 sm:px-10 sm:py-16"
        style={{
          backgroundImage: 'url(/V2/feature_card.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          //   backgroundColor: '#1E123F',
          //   border: '1px solid rgba(124,91,255,0.3)',
        }}
      >
        <h2 className="text-[#F9F9F9] font-medium text-2xl sm:text-3xl lg:text-[40px] leading-tight mb-4 max-w-xl mx-auto">
          The business platform for the modern world.
        </h2>
        <p className="text-white/55 text-sm leading-relaxed mb-8 max-w-md mx-auto">
          Accounting, payroll, HR, and operations — connected in one place. Start free and see the difference.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.push('/auth?action=sign-in')}
            className="bg-white text-[#1a163a] text-sm font-semibold px-8 py-3 rounded-full hover:bg-white/90 hover:scale-105 transition-all duration-300"
          >
            Get Started
          </button>
          <button
            onClick={() => router.push('/contact')}
            className="border border-white/30 text-white text-sm font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-all duration-300"
          >
            Learn More
          </button>
        </div>
      </div>
    </AnimateOnScroll>
  )
}

const Highlights = () => {
  return (
    <section className="relative bg-[#0B0919] py-0 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        {SECTION_GROUPS.map((group) => (
          <div key={group.banner.title}>
            <SectionBanner
              eyebrow={group.banner.eyebrow}
              title={group.banner.title}
              description={group.banner.description}
            />
            {group.sections.map((item) => (
              <FeatureSection key={item.title} item={item} />
            ))}
          </div>
        ))}
        <FeatureCTA />
      </div>
    </section>
  )
}

export default Highlights
