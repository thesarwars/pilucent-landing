'use client';
import DisableScrollValueChange from '@/components/DisableOnScrollValueChange/DisableScrollValueChange';
import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import MainLoader from '@/components/MainLoader/MainLoader';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { buildPricingHandoffUrl, getCompany, getUser, postRefreshToken, verifyAccessToken } from '../helpers/backend';
import { setUser } from '../redux/UserData/UserData';
import { setCompanyData } from '../redux/CompanyData/CompanyData';
import PermissionRoute from '@/components/PrivateRoute/PermissionRoute';
import { setPermissions } from '../redux/UserPermissionData/PermissionData';
import Sidebar from '@/components/SideBar/SideBar';
import TopNavbar from '@/components/DashboardHeader/DashboardHeader';
import { TooltipProvider } from '@/components/ui/tooltip';
import { permissions } from '@/lib/helpers/Permissions';
import { SubscriptionCheckoutReturnHandler } from '@/app/dashboard/admin/subscription/_components/SubscriptionCheckoutReturnHandler';

const LayoutContent = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const router = useRouter();
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const { trackerOn } = useAppSelector((state) => state.employee); //need to show tracker
  const [loading, setLoading] = useState(true);
  const paramsToken = useSearchParams().get('tkn');
  const refreshToken = useSearchParams().get('rt');
  const dispatch = useAppDispatch();
  console.log(Permissions);
  const validateAccessToken = async (access: string, refresh: string) => {
    try {
      const res = await verifyAccessToken(access);
      if (res?.success) {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        return res;
      } else {
        const res = await postRefreshToken(refresh);
        if (res?.success) {
          localStorage.setItem('access_token', res?.access);
          localStorage.setItem('refresh_token', res?.refresh);
          return res;
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          return (window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/pricing?action=logout`);
        }
      }
    } catch (error) {
      //err
    }
  };

  const handlePermissions = (permissions: any) => {
    const ExtraCodeNames = Object.values(permissions?.ext_permissions?.app_label).flatMap(
      (app: any) =>
        Object.values(app?.model || {}).flatMap((modelArray: any) =>
          modelArray.map((entry: any) => entry.codename)
        )
    );
    const RoleCodeNames = Object.values(permissions?.role_permissions?.app_label).flatMap(
      (app: any) =>
        Object.values(app?.model || {}).flatMap((modelArray: any) =>
          modelArray.map((entry: any) => entry.codename)
        )
    );
    dispatch(setPermissions([...ExtraCodeNames, ...RoleCodeNames]));
  };

  // useEffect(() => {
  //   const iframe = document.createElement("iframe");
  //   iframe.style.display = "none";
  //   iframe.src = "http://localhost:3001/token-bridge";
  //   document.body.appendChild(iframe);

  //   // Listen for messages BEFORE setting up the iframe
  //   const handleMessage = (event: any) => {
  //     console.log("Received message from origin:", event.origin);

  //     if (event.origin !== "http://localhost:3001") {
  //       console.log("Ignored message: Invalid origin", event.origin);
  //       return;
  //     }

  //     console.log("Received message data:", event.data);

  //     // Check if we received tokens
  //     if (event.data && event.data.access_token) {
  //       console.log("✅ Tokens received:", event.data.access_token);
  //     } else if (event.data && event.data.error) {
  //       console.log("❌ Error:", event.data.error);
  //     }
  //   };

  //   window.addEventListener("message", handleMessage);

  //   iframe.onload = () => {
  //     console.log("Iframe loaded, waiting a moment before sending message...");

  //     // Add a small delay to ensure the TokenBridge component is ready
  //     setTimeout(() => {
  //       console.log("Sending GET_TOKENS message to auth site");
  //       iframe.contentWindow?.postMessage(
  //         { type: "GET_TOKENS" },
  //         "http://localhost:3001",
  //       );
  //     }, 100);
  //   };

  //   // Cleanup function
  //   return () => {
  //     window.removeEventListener("message", handleMessage);
  //     if (iframe.parentNode) {
  //       iframe.parentNode.removeChild(iframe);
  //     }
  //   };
  // }, []);

  useEffect(() => {
    if (paramsToken && refreshToken) {
      const fn = async () => {
        const res = await validateAccessToken(paramsToken, refreshToken);
        if (res?.success) {
          try {
            //fetch user and company
            const user = await getUser();
            const company = await getCompany();

            //if email not verified
            if (!user?.is_email_verified && company?.is_company_subscription) {
              // return (window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth?action=verify-email`);
            }

            // if company not found
            if (!company?.success) {
              // return (window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/pricing?action=logout`);
            }

            //set user and company to redux
            dispatch(setUser(user));
            dispatch(setCompanyData(company));

            // if user is super user
            if (user?.is_superuser) {
              return router.replace('/admin');

              //if company has no subscriptions
            } else if (!company?.is_company_subscription) {
              // window.location.href = buildPricingHandoffUrl(company?.uid);
              // if company has subscription and status is draft
            } else if (company?.is_company_subscription && company.status == 'DRAFT') {
              // router.push(`/company/get_started?token=${paramsToken}`);
              // if all okay
            } else {
              handlePermissions(user?.permission);
              setLoading(false);
            }

            //if any err occurs
          } catch (error) {
            //err
          }
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/pricing?action=logout`;
        }
      };
      //call the fn
      fn();

      //params has no token
    } else {
      const fn = async () => {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        if (!token && !refreshToken) {
          return (window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/pricing?action=logout`);
        }
        const res = await validateAccessToken(token || '', refreshToken || '');
        if (res?.success) {
          try {
            //if user is a super user
            const user = await getUser();
            const company = await getCompany();

            //if email not verified
            if (!user?.is_email_verified && company?.is_company_subscription) {
              return (window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth?action=verify-email`);
            }

            // if company not found
            if (!company?.success) {
              window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/pricing?action=logout`;
            }

            //set user and company to redux
            dispatch(setUser(user));
            dispatch(setCompanyData(company));

            //if user is super admin
            if (user?.is_superuser) {
              router.replace('/admin');
              return;
            }

            //if company don't have subscription
            if (!company?.is_company_subscription) {
              // Hand off to the pricing site with company_uid + session tokens so
              // it bills the right company and keeps the user signed in.
              window.location.href = buildPricingHandoffUrl(company?.uid);

              //if company status is draft
            } else if (company?.is_company_subscription && company.status == 'DRAFT') {
              router.push(`/company/get_started?token=${token}`);

              //if no issues occurs
            } else {
              handlePermissions(user?.permission);
              setLoading(false);
            }

            //if any err occurs
          } catch (error) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/pricing`;
          }
        }
      };

      //call the fn
      fn();
    }
  }, [paramsToken]);

  if (loading) {
    return <MainLoader />;
  }

  return (
    <div
      className={`relative flex min-h-screen flex-col overflow-hidden px-4 font-inter md:px-7 lg:px-10 xl:px-12`}
      style={{ background: 'linear-gradient(135deg, #C7C0DF 0%, #E8E4F4 55%, #C8C1E2 100%)' }}
    >
      {/* Violet Suite decorative orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-36 h-[520px] w-[520px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(120,220,230,0.5), transparent 62%)',
          filter: 'blur(20px)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-40 h-[620px] w-[620px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(150,110,255,0.42), transparent 64%)',
          filter: 'blur(24px)',
        }}
      />
      <SubscriptionCheckoutReturnHandler />
      <div className={`relative z-[1] flex h-screen w-full flex-col overflow-hidden`}>
        <div
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="flex min-h-0 flex-1 gap-8 overflow-hidden"
        >
          {/* Sidebar runs full-height from the top */}
          <Sidebar />

          {/* Content column: header (with global search) aligned beside the sidebar */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <TopNavbar />
            <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
              <PermissionRoute>{children}</PermissionRoute>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main layout wrapper with Suspense (ReduxProvider is provided by root layout)
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <DisableScrollValueChange>
      <Suspense fallback={<MainLoader />}>
        <TooltipProvider>
          <LayoutContent>{children}</LayoutContent>
        </TooltipProvider>
      </Suspense>
    </DisableScrollValueChange>
  );
};

export default Layout;
