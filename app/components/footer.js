import Link from 'next/link';
import React from 'react';
import Cta from '../(frontend)/(pages)/about/_components/cta';

const linkColumns = [
    {
        title: 'Products',
        links: [
            { label: 'Features', href: '/features' },
            { label: 'Pricing', href: '/pricing' },
            { label: 'Migration', href: '#' },
            { label: 'Snap Expense', href: '#' },
            { label: 'Changelog', href: '#' },
            { label: 'Security', href: '/security' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About', href: '/about' },
            { label: 'Blog', href: '/blog' },
            { label: 'Careers', href: '#' },
            { label: 'Contact', href: '/contact' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy Policy', href: '/privacy-policy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Security', href: '/security' },
            { label: 'Date Retention Policy', href: '/data-retention-policy' },
            { label: 'Cookies Policy', href: '/cookies' },
        ],
    },
];

const Footer = () => {
    return (
        <>
        <Cta />
        <div className="relative bg-[#0B0919] overflow-hidden font-jakarta">
            <footer className="container mx-auto px-4 max-w-6xl relative z-10">

                {/* Main grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 py-14">

                    {/* Brand col */}
                    <div className="sm:col-span-2 lg:col-span-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2 mb-6">
                            <Link href="/" className="flex items-center gap-2">
                                <img
                                    src="/logo.png"
                                    alt="Pilucent"
                                    className="h-12 w-auto brightness-0 invert"
                                />
                            </Link>

                        </div>
                        <p className="text-[#D1D1D6] text-sm leading-relaxed mb-8 max-w-xs">
                            The all-in-one business platform for the 5-200 employee company. Cheaper than the
                            tools you&apos;re already using — and they actually work together.
                        </p>

                        {/* Socials */}
                        <div className="flex items-center gap-3">
                            <a href="#" aria-label="Instagram"
                                className="w-10 h-10 rounded-full border border-[#9191A8] flex items-center justify-center text-[#666] hover:text-white hover:border-[#8B5CF6] transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M7.8 2H16.2C19.4 2 22 4.6 22 7.8V16.2C22 17.7383 21.3889 19.2135 20.3012 20.3012C19.2135 21.3889 17.7383 22 16.2 22H7.8C4.6 22 2 19.4 2 16.2V7.8C2 6.26174 2.61107 4.78649 3.69878 3.69878C4.78649 2.61107 6.26174 2 7.8 2ZM7.6 4C6.64522 4 5.72955 4.37928 5.05442 5.05442C4.37928 5.72955 4 6.64522 4 7.6V16.4C4 18.39 5.61 20 7.6 20H16.4C17.3548 20 18.2705 19.6207 18.9456 18.9456C19.6207 18.2705 20 17.3548 20 16.4V7.6C20 5.61 18.39 4 16.4 4H7.6ZM17.25 5.5C17.5815 5.5 17.8995 5.6317 18.1339 5.86612C18.3683 6.10054 18.5 6.41848 18.5 6.75C18.5 7.08152 18.3683 7.39946 18.1339 7.63388C17.8995 7.8683 17.5815 8 17.25 8C16.9185 8 16.6005 7.8683 16.3661 7.63388C16.1317 7.39946 16 7.08152 16 6.75C16 6.41848 16.1317 6.10054 16.3661 5.86612C16.6005 5.6317 16.9185 5.5 17.25 5.5ZM12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 13.3261 16.4732 14.5979 15.5355 15.5355C14.5979 16.4732 13.3261 17 12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 10.6739 7.52678 9.40215 8.46447 8.46447C9.40215 7.52678 10.6739 7 12 7ZM12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9Z" fill="#E5E5EF" />
                                </svg>
                            </a>
                            <a href="#" aria-label="Facebook"
                                className="w-10 h-10 rounded-full border border-[#9191A8] flex items-center justify-center text-[#666] hover:text-white hover:border-[#8B5CF6] transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V15H8V12H10V9.5C10 7.57 11.57 6 13.5 6H16V9H14C13.45 9 13 9.45 13 10V12H16V15H13V21.95C18.05 21.45 22 17.19 22 12Z" fill="#E5E5EF" />
                                </svg>
                            </a>
                            <a href="#" aria-label="LinkedIn"
                                className="w-10 h-10 rounded-full border border-[#9191A8] flex items-center justify-center text-[#666] hover:text-white hover:border-[#8B5CF6] transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M4.98292 2.8208C4.69559 2.8208 4.41107 2.8774 4.14561 2.98735C3.88015 3.09731 3.63895 3.25848 3.43577 3.46165C3.2326 3.66483 3.07143 3.90603 2.96147 4.17149C2.85152 4.43695 2.79492 4.72147 2.79492 5.0088C2.79492 5.29613 2.85152 5.58065 2.96147 5.84611C3.07143 6.11157 3.2326 6.35278 3.43577 6.55595C3.63895 6.75912 3.88015 6.92029 4.14561 7.03025C4.41107 7.14021 4.69559 7.1968 4.98292 7.1968C5.27025 7.1968 5.55477 7.14021 5.82023 7.03025C6.08569 6.92029 6.3269 6.75912 6.53007 6.55595C6.73325 6.35278 6.89441 6.11157 7.00437 5.84611C7.11433 5.58065 7.17092 5.29613 7.17092 5.0088C7.17092 4.72147 7.11433 4.43695 7.00437 4.17149C6.89441 3.90603 6.73325 3.66483 6.53007 3.46165C6.3269 3.25848 6.08569 3.09731 5.82023 2.98735C5.55477 2.8774 5.27025 2.8208 4.98292 2.8208ZM9.23692 8.8548V20.9938H13.0059V14.9908C13.0059 13.4068 13.3039 11.8728 15.2679 11.8728C17.2049 11.8728 17.2289 13.6838 17.2289 15.0908V20.9948H20.9999V14.3378C20.9999 11.0678 20.2959 8.5548 16.4739 8.5548C14.6389 8.5548 13.4089 9.5618 12.9059 10.5148H12.8549V8.8548H9.23692ZM3.09492 8.8548H6.86992V20.9938H3.09492V8.8548Z" fill="#E5E5EF" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Link columns */}
                    {linkColumns.map(column => (
                        <div key={column.title} className="font-jakarta lg:col-span-2">
                            <h3 className="text-[#F9F9F9] text-[18px] font-semibold mb-4">{column.title}</h3>
                            <ul className="space-y-2.5">
                                {column.links.map(link => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-[#D1D1D6] hover:text-white text-xs transition-colors">{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Early Access card */}
                    <div className="sm:col-span-2 lg:col-span-2">
                        <div className="relative rounded-2xl border border-[#8B5CF6]/40 bg-[#15102b]/60 p-5 overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-[#8B5CF6]/20 blur-2xl pointer-events-none" />
                            <h3 className="text-[#F9F9F9] text-[16px] font-semibold mb-4 relative z-10">Early Access</h3>
                            <ul className="space-y-2.5 mb-4 relative z-10">
                                {['17 spots remaining', 'Starter — $119/mo', 'Growth — $239/mo'].map(item => (
                                    <li key={item} className="flex items-center gap-2 text-[#D1D1D6] text-xs">
                                        <span className="w-1 h-1 rounded-full bg-[#8B5CF6] shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/contact" className="text-[#8B5CF6] hover:text-[#a482ff] text-xs font-medium transition-colors relative z-10">
                                Get in touch
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-[#FFFFFF33] py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                        <p className="text-[#F9F9F9] text-sm">© 2025 Pilucent Inc. All rights reserved.</p>
                        <p className="text-[#D1D1D6] text-sm">Built for operators. Trusted by growing teams.</p>
                    </div>
                </div>

            </footer>
        </div>
        </>
    );
};

export default Footer;