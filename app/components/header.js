"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes, FaAngleDown } from "react-icons/fa";
import { useProvider } from "../../context/ProviderContext";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const router = useRouter();
  const dropdownRef = useRef(null);
  const dropdownRef2 = useRef(null);
  const { user, company, setUser, setCompany } = useProvider();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileDropdownOpen1, setIsProfileDropdownOpen1] = useState(false);
  const path = usePathname();
  const dropdownMenus = {
    "Bill & Get Paid": [
      { label: "Invoicing", link: "/features/invoice" },
      { label: "Payments", link: "/features/payments" },
      { label: "Time Tracking", link: "/features/time-tracking" },
    ],
    "Accounting & Taxes": [
      { label: "Accounting", link: "/features/accounting" },
      { label: "Expenses and Receipts", link: "/features/expense" },
      { label: "Journal Entry", link: "/launching" },
      { label: "Customer Management", link: "/launching" },
      { label: "Inventory Management", link: "/launching" },
    ],
    "Enable Your Team": [
      { label: "Payroll", link: "/features/payroll" },
      { label: "Team Management", link: "/launching" },
    ],
    "Business Apps": [
      { label: "App Store", link: "/launching" },
      { label: "iOS & Android Apps", link: "/launching" },
    ],
  };

  const businessTypeMenus = {
    "Business Size": [
      { label: "Freelancers", link: "/business" },
      { label: "Self-Employed Professional", link: "/business" },
      { label: "Business With Employees", link: "/business" },
      { label: "Business With Contractors", link: "/business" },
    ],
    "Industry Type": [
      { label: "Marketing & Agencies", link: "/industry/marketing" },
      { label: "Creatives", link: "/industry/creatives" },
      { label: "Construction & Traders", link: "/industry/construction" },
      { label: "Consulting", link: "/industry/consulting" },
      { label: "IT & Technology", link: "/industry/technology" },
      { label: "Blog", link: "/blog" },
    ],
  };

  const items = [
    {
      link: "/launching",
      label: "Features",
      hasDropdown: true,
      isFeatures: true,
    },
    {
      link: "/launching",
      label: "Small Business",
      hasDropdown: true,
      isSmallBusiness: true,
    },
    { link: "/launching", label: "Accountants" },
    { link: "/about", label: "About Us" },
    { link: "/pricing", label: "Pricing" },
    { link: "/contact", label: "Contact Us" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef2.current &&
        !dropdownRef2.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
        setIsProfileDropdownOpen1(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDropdownClick = (label) => {
    if (activeDropdown === label) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(label);
    }
  };

  const handleLinkClick = () => {
    setActiveDropdown(null);
    setMenuOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const LogOut = () => {
    localStorage.removeItem("access_token");
    setUser({});
    setIsProfileDropdownOpen(false);
    setIsProfileDropdownOpen1(false);
    setCompany({});
    if (company?.is_company_subscription && path != "/checkout") {
      return (window.location.href =
        `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth?action=logout`);
    }
    if (path == "/checkout") location.reload();
  };

  const renderFeatureDropdown = () => (
    <div
      ref={dropdownRef}
      className="absolute -left-[10rem] font-inter top-full mt-5 w-[800px] bg-white rounded-xl shadow-lg z-50 before:content-[''] before:absolute before:top-[-8px] before:left-[calc(25%-8px)] before:w-4 before:h-4 before:bg-white before:transform before:rotate-45 before:border-t before:border-l before:border-gray-100"
    >
      <div className="relative bg-white rounded-xl p-8 grid grid-cols-4 gap-8">
        {Object.entries(dropdownMenus).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-semibold text-gray-800 mb-4 text-sm">
              {category}
            </h3>
            <ul className="space-y-3">
              {items.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.link}
                    className="text-[#5A5FEE] hover:text-[#4045B6] text-sm block transition-colors duration-200 font-semibold"
                    onClick={handleLinkClick}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSmallBusinessDropdown = () => (
    <div
      ref={dropdownRef}
      className="absolute font-inter -left-[10rem] top-full mt-5 w-[600px] bg-white rounded-xl shadow-lg z-50 before:content-[''] before:absolute before:top-[-8px] before:left-[calc(25%-8px)] before:w-4 before:h-4 before:bg-white before:transform before:rotate-45 before:border-t before:border-l before:border-gray-100"
    >
      <div className="relative bg-white rounded-xl p-8 grid grid-cols-2 gap-8">
        {Object.entries(businessTypeMenus).map(([category, items]) => (
          <div key={category}>
            <h3 className="font-semibold text-gray-800 mb-4 text-sm">
              {category}
            </h3>
            <ul className="space-y-3">
              {items.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.link}
                    className="text-[#5A5FEE] hover:text-[#4045B6] text-sm block transition-colors duration-200 font-semibold"
                    onClick={handleLinkClick}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-[#5A5FEE] font-inter">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between py-5">
          <div className="flex items-center gap-12 relative">
            <Link href="/">
              <img src="/logo.png" alt="logo" className="h-auto max-w-36" />
            </Link>
            <p
              title="The beta version does not represent the final quality."
              className={`-translate-x-11 uppercase -translate-y-2 rounded bg-white px-2 py-0.5 text-[11px] font-bold text-[#5A5FEE]`}
            >
              Beta
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-8">
            {items.map((item, index) => (
              <div key={index} className="relative group">
                <Link
                  href={item.link}
                  className="text-white hover:text-white/90 flex items-center gap-1"
                  onClick={(e) => {
                    if (item.hasDropdown) {
                      e.preventDefault();
                      handleDropdownClick(item.label);
                    }
                  }}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <FaAngleDown
                      className={`transition-transform duration-200 ${
                        activeDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </Link>
                {item.hasDropdown &&
                  activeDropdown === item.label &&
                  (item.isFeatures
                    ? renderFeatureDropdown()
                    : renderSmallBusinessDropdown())}
              </div>
            ))}
          </div>
          {user?.uid ? (
            <div className="relative" ref={dropdownRef2}>
              <button
                id="profile-trigger"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="hidden lg:flex items-center gap-2"
              >
                <>
                  {user?.image?.original ? (
                    <Image
                      src={user?.image?.original}
                      height={300}
                      width={300}
                      className="h-10 w-10 rounded-full border-2 border-accent_text_violet object-cover"
                      alt="profileImage"
                    />
                  ) : (
                    <div className="flex size-10 border-2 items-center justify-center uppercase rounded-full border-accent_text_violet bg-gray-200 text-2xl md:text-2xl">
                      {user?.name?.split("")?.[0]}
                    </div>
                  )}
                </>
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div
                  id="profile-dropdown"
                  className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg py-2 z-50"
                >
                  {company?.is_company_subscription &&
                    company.status == "ACTIVE" &&
                    !user?.is_superuser && (
                      <button
                        onClick={() => {
                          const token = localStorage.getItem("access_token");
                          const refresh_token =
                            localStorage.getItem("refresh_token");
                          window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth?tkn=${token}&rt=${refresh_token}`;
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <span>Dashboard</span>
                      </button>
                    )}
                  {user?.is_superuser && (
                    <button
                      onClick={() => {
                        const token = localStorage.getItem("access_token");
                        const refresh_token =
                          localStorage.getItem("refresh_token");
                        window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/admin?tkn=${token}&rt=${refresh_token}`;
                      }}
                      className=" text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                  {company?.is_company_subscription &&
                    company.status == "DRAFT" && (
                      <button
                        onClick={() => {
                          const token = localStorage.getItem("access_token");
                          const refresh_token =
                            localStorage.getItem("refresh_token");
                          window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth?action=company_setup&tkn=${token}&rt=${refresh_token}`;
                        }}
                        className="w-full text-left text-sm px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <span>Go to company setup</span>
                      </button>
                    )}
                  {!company?.is_company_subscription && (
                    <button
                      onClick={() => {
                        router.push("/pricing");
                      }}
                      className="w-full text-left text-sm px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <span>Go to pricing</span>
                    </button>
                  )}
                  <button
                    onClick={LogOut}
                    //   disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-4">
              <button
                onClick={() => router.push("/auth?action=sign-in")}
                className="text-white hover:text-white/90"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/demo")}
                className="relative overflow-hidden  font-semibold text-base px-4 py-2  rounded-md 
       bg-[#2CAA28]  transition-all duration-300 
        hover:shadow-lg 
       active:scale-95
       before:absolute before:inset-0 before:bg-gradient-to-r 
       before:from-white/50 before:to-transparent before:-translate-x-full text-white
       before:transition-transform before:duration-300 
       hover:before:translate-x-full"
              >
                Get Demo
              </button>
            </div>
          )}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-white focus:outline-none"
            >
              {menuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden flex flex-col items-start space-y-4 mt-4 pb-6 w-full">
            {items.map((item, index) => (
              <div key={index} className="w-full">
                <Link
                  href={item.link}
                  className="text-white hover:text-white/90 flex items-center gap-1"
                  onClick={(e) => {
                    if (item.hasDropdown) {
                      e.preventDefault();
                      handleDropdownClick(item.label);
                    }
                  }}
                >
                  {item.label}
                  {item.hasDropdown && (
                    <FaAngleDown
                      className={`transition-transform duration-200 ${
                        activeDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </Link>
                {item.hasDropdown && activeDropdown === item.label && (
                  <div className="bg-white rounded-lg shadow-lg p-4 mt-2 w-full">
                    {Object.entries(
                      item.isFeatures ? dropdownMenus : businessTypeMenus
                    ).map(([category, items]) => (
                      <div key={category} className="mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2 text-sm">
                          {category}
                        </h3>
                        <ul className="space-y-2">
                          {items.map((item, idx) => (
                            <li key={idx}>
                              <Link
                                href={item.link}
                                className="text-[#5A5FEE] hover:text-[#4045B6] text-sm block transition-colors duration-200"
                                onClick={handleLinkClick}
                              >
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {user?.uid ? (
              <div className="relative" ref={dropdownRef2}>
                <button
                  id="profile-trigger"
                  onClick={() =>
                    setIsProfileDropdownOpen1(!isProfileDropdownOpen1)
                  }
                  className="flex lg:hidden items-center gap-2"
                >
                  <>
                    {user?.image?.original ? (
                      <Image
                        src={user?.image?.original}
                        height={300}
                        width={300}
                        className="h-10 w-10 rounded-full border-2 border-accent_text_violet object-cover"
                        alt="profileImage"
                      />
                    ) : (
                      <div className="flex size-10 border-2 items-center justify-center uppercase rounded-full border-accent_text_violet bg-gray-200 text-2xl md:text-2xl">
                        {user?.name?.split("")?.[0]}
                      </div>
                    )}
                    {/* <IoMdArrowDropdown className={`text-xl transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} /> */}
                  </>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen1 && (
                  <div
                    id="profile-dropdown"
                    className="absolute left-0 mt-2 w-48 rounded-lg bg-white shadow-lg py-2 z-50"
                  >
                    {!user?.is_email_verified &&
                      company?.is_company_subscription && (
                        <button
                          onClick={() => {
                            router.push("/auth?action=verify-email");
                          }}
                          className="w-full text-left text-sm px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <span>Verify Email</span>
                        </button>
                      )}
                    {company?.is_company_subscription &&
                      company.status == "ACTIVE" &&
                      !user?.is_superuser &&
                      user?.is_email_verified && (
                        <button
                          onClick={() => {
                            const token = localStorage.getItem("access_token");
                            const refresh_token =
                              localStorage.getItem("refresh_token");
                            window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth?tkn=${token}&rt=${refresh_token}`;
                          }}
                          className="w-full text-left text-sm px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <span>Dashboard</span>
                        </button>
                      )}
                    {company?.is_company_subscription &&
                      company.status == "DRAFT" &&
                      user?.is_email_verified && (
                        <button
                          onClick={() => {
                            const token = localStorage.getItem("access_token");
                            const refresh_token =
                              localStorage.getItem("refresh_token");
                            window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth?action=company_setup&tkn=${token}&rt=${refresh_token}`;
                          }}
                          className="w-full text-xs text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          <span>Go to company setup</span>
                        </button>
                      )}
                    {user?.is_superuser && (
                      <button
                        onClick={() => {
                          const token = localStorage.getItem("access_token");
                          const refresh_token =
                            localStorage.getItem("refresh_token");
                          window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/admin?tkn=${token}&rt=${refresh_token}`;
                        }}
                        className="text-sm text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <button
                      onClick={LogOut}
                      //   disabled={isLoggingOut}
                      className="w-full  text-sm text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full space-y-2">
                <button
                  onClick={() => router.push("/auth?action=sign-in")}
                  className="w-full text-white hover:text-white/90 text-base font-normal py-2"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/demo")}
                  className="relative overflow-hidden w-full font-semibold text-base px-4 py-2  rounded-md 
       bg-[#2CAA28] text-white transition-all duration-300 
        hover:shadow-lg 
       active:scale-95
       before:absolute before:inset-0 before:bg-gradient-to-r 
       before:from-white/30 before:to-transparent before:-translate-x-full 
       before:transition-transform before:duration-300 
       hover:before:translate-x-full"
                >
                  Get Demo
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Header;
