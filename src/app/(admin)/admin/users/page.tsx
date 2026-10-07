"use client";
import Button from "@/components/Pages/Company/ui/Button";
import Link from "next/link";

import RoleCarousel from "@/app/dashboard/admin/roles/_components/RoleCarousel";

interface FilterState {
  SL: boolean;
  User: boolean;
  Status: boolean;
  Email: boolean;
  Phone: boolean;
  Verified: boolean;
  Code: boolean;
}

interface UserData {
  data: {
    uid: string;
    name: string;
    email: string;
    phone: string;
    image: string;
    status: string;
    employee: any;
    company_user: {
      uid: string;
      permissions: any[];
      role: string;
      role_uid: string;
      company: string;
    };
    is_email_verified: boolean;
    created_at: string;
  };
}

const Page = () => {
  const initialFilters: FilterState = {
    SL: true,
    User: true,
    Status: true,
    Email: true,
    Phone: true,
    Verified: true,
    Code: true,
  };

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 4,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  return (
    <section className="mt-4">
      <div className="flex justify-between">
        <h2 className="text-[24px] font-semibold leading-9">
          User Role Management
        </h2>
        <div className="flex gap-x-3">
          <Link href="/admin/users/create">
            {" "}
            <Button>Create Role</Button>
          </Link>
        </div>
      </div>
      <RoleCarousel />
    </section>
  );
};

export default Page;
