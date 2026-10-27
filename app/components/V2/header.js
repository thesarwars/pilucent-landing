"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";

const HeaderV2 = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const router = useRouter();

    const navItems = [
        {
            label: "Features",
            children: [
                { label: "Payroll", link: "/featurers?tab=payroll" },
                { label: "Tax", link: "/featurers?tab=tax" },
                { label: "Accounting", link: "/featurers?tab=accounting" },
                { label: "HR", link: "/featurers?tab=hr" },
                { label: "Employee Portal", link: "/featurers?tab=employee-portal" },
                { label: "Payments Infrastructure", link: "/featurers?tab=payments-infrastructure" },
                { label: "Reports", link: "/featurers?tab=reports" },
            ],
        },
        { label: "Pricing", link: "/pricing" },
        {
            label: "Solutions",
            children: [
                { label: "For SMBs", link: "/smb" },
                { label: "For Startups", link: "/startups" },
                { label: "For Agencies", link: "/agencies" },
                { label: "For Enterprises", link: "/enterprises" },
            ],
        },
        {
            label: "Resources",
            children: [
                { label: "Blog", link: "/blog" },
                { label: "Help Center", link: "/help-center" },
                { label: "Case Studies", link: "/case-studies" },
                { label: "API Documentation", link: "/api-documentation" },
                

            ],
        },
        { label: "Blog", link: "/blog" },
        { label: "About Us", link: "/about" },
        { label: "Contact", link: "/contact" },
    ];

    return (
        <header className="absolute top-0 left-0 right-0 z-50 font-jakarta">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <img
                            src="/Frame_1.webp"
                            alt="balanzify"
                            className="h-7 w-auto brightness-0 invert"
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-full px-2 py-1.5">
                        {navItems.map((item, idx) =>
                            item.children ? (
                                <div
                                    key={idx}
                                    className="relative"
                                    onMouseEnter={() => setOpenDropdown(idx)}
                                    onMouseLeave={() => setOpenDropdown(null)}
                                >
                                    <button
                                        type="button"
                                        className="flex items-center gap-1 text-white/90 text-sm font-medium px-5 py-2 rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        {item.label}
                                        <FaChevronDown className="w-3 h-3 mt-0.5" />
                                    </button>
                                    {openDropdown === idx && (
                                        <div className="absolute left-0 top-full pt-2 min-w-[200px]">
                                            <div className="flex flex-col bg-[#1a1330]/95 backdrop-blur-md border border-white/10 rounded-2xl p-2 shadow-xl">
                                                {item.children.map((child, cIdx) => (
                                                    <Link
                                                        key={cIdx}
                                                        href={child.link}
                                                        className="text-white/90 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
                                                    >
                                                        {child.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    key={idx}
                                    href={item.link}
                                    className="text-white/90 text-sm font-medium px-5 py-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            )
                        )}
                    </nav>

                    {/* Log In + Start Free Trial grouped */}
                    <div className="hidden lg:flex items-center gap-2">
                        <Link
                            href="/auth?action=sign-in"
                            className="text-white/80 text-sm font-medium px-4 py-2 hover:text-white transition-colors"
                        >
                            Log In
                        </Link>
                        <button
                            onClick={() => router.push("/auth?action=sign-up")}
                            className="inline-flex items-center justify-center bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] text-white text-sm font-semibold px-7 py-3 rounded-full shadow-[0_8px_24px_-8px_rgba(124,91,255,0.6)] hover:opacity-95 transition"
                        >
                            Start Free Trial
                        </button>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="lg:hidden text-white focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? (
                            <FaTimes className="w-6 h-6" />
                        ) : (
                            <FaBars className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="lg:hidden flex flex-col gap-2 pb-6 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl mt-2 p-4">
                        {navItems.map((item, idx) =>
                            item.children ? (
                                <div key={idx} className="flex flex-col">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenDropdown(
                                                openDropdown === idx ? null : idx
                                            )
                                        }
                                        className="flex items-center justify-between text-white/90 text-base font-medium px-3 py-2 rounded-lg hover:bg-white/10"
                                    >
                                        {item.label}
                                        <FaChevronDown
                                            className={`w-3 h-3 transition-transform ${
                                                openDropdown === idx
                                                    ? "rotate-180"
                                                    : ""
                                            }`}
                                        />
                                    </button>
                                    {openDropdown === idx && (
                                        <div className="flex flex-col pl-3">
                                            {item.children.map((child, cIdx) => (
                                                <Link
                                                    key={cIdx}
                                                    href={child.link}
                                                    onClick={() => {
                                                        setMenuOpen(false);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="text-white/80 text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10"
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    key={idx}
                                    href={item.link}
                                    onClick={() => setMenuOpen(false)}
                                    className="text-white/90 text-base font-medium px-3 py-2 rounded-lg hover:bg-white/10"
                                >
                                    {item.label}
                                </Link>
                            )
                        )}
                        <Link
                            href="/auth?action=sign-in"
                            onClick={() => setMenuOpen(false)}
                            className="text-white/80 text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10"
                        >
                            Log In
                        </Link>
                        <button
                            onClick={() => {
                                setMenuOpen(false);
                                router.push("/auth?action=sign-up");
                            }}
                            className="mt-2 bg-gradient-to-b from-[#7C5BFF] to-[#5A3FE5] text-white text-sm font-semibold px-6 py-3 rounded-full"
                        >
                            Start Free Trial
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default HeaderV2;