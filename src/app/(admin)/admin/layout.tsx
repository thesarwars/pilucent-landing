'use client';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import { lexend } from '@/lib/font';
import DisableScrollValueChange from '@/components/DisableOnScrollValueChange/DisableScrollValueChange';
import AdminSideBar from '../_components/AdminSideBar';
import ReduxProvider from '@/app/redux/ReduxProvider';
import { useAppDispatch, useAppSelector } from '@/app/redux/store';
import { Suspense, useEffect, useState } from 'react';
import MainLoader from '@/components/MainLoader/MainLoader';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCompany, getUser } from '@/app/helpers/backend';
import { setUser } from '@/app/redux/UserData/UserData';
import { setCompanyData } from '@/app/redux/CompanyData/CompanyData';
import TopNavbar from '@/components/DashboardHeader/DashboardHeader';
import { useIsMobile } from '@/hooks/use-mobile';

// export const metadata: Metadata = {
//   title: "Dashboard",
//   description: "Balanzify - Accounting",
// };

const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;

const LayoutContent = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [isLoading, setIsLoading] = useState(true);
  const paramsToken = useSearchParams().get('tkn');
  const dispatch = useAppDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (paramsToken) {
      //set params token to localStorage
      localStorage.setItem('access_token', paramsToken);
      const fn = async () => {
        try {
          //get user info
          const user = await getUser();
          const res = await getCompany();

          //set user & company in redux
          dispatch(setUser(user));
          dispatch(setCompanyData(res));

          // if user is superuser
          if (user?.is_superuser) {
            setIsLoading(false);
            //if user is not super user
          } else {
            return (window.location.href = `${redirectUrl}/pricing?action=logout`);
          }
        } catch (error) {
          localStorage.removeItem('access_token');
          return (window.location.href = `${redirectUrl}/pricing?action=logout`);
        }
      };
      fn();

      //if token not in the params url
    } else {
      const token = localStorage.getItem('access_token');
      if (!token) window.location.href = `${redirectUrl}/pricing?action=logout`;
      const fn = async () => {
        try {
          //get company info
          const user = await getUser();
          const res = await getCompany();
          //set user & company in redux
          dispatch(setUser(user));
          dispatch(setCompanyData(res));
          // if user is superuser
          if (user?.is_superuser) {
            setIsLoading(false);

            //if user is not super user
          } else {
            return (window.location.href = `${redirectUrl}/pricing?action=logout`);
          }

          //if any other error occurs
        } catch (error) {
          localStorage.removeItem('access_token');
          return (window.location.href = `${redirectUrl}/pricing?action=logout`);
        }
      };
      fn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsToken]);

  if (isLoading) {
    return <MainLoader />;
  }

  return (
    <div className={`${lexend.variable} flex h-screen bg-gray-50 font-lexend`}>
      <AdminSideBar
        collapsed={collapsed}
        onToggle={toggleSidebar}
        mobileOpen={mobileOpen}
        onMobileToggle={toggleMobileSidebar}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNavbar onMobileMenuToggle={toggleMobileSidebar} onSidebarToggle={toggleSidebar} />
        <main className="scrollbar-thin md:scrollbar scrollbar-thumb-green-500 scrollbar-track-green-100 mt-5 flex-1 overflow-y-auto bg-accent_bluish_gray px-4 lg:px-6 xl:px-10">
          <>{children}</>
        </main>
      </div>
    </div>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReduxProvider>
      <DisableScrollValueChange>
        <Suspense fallback={<MainLoader />}>
          <LayoutContent>{children} </LayoutContent>
        </Suspense>
      </DisableScrollValueChange>
    </ReduxProvider>
  );
};

export default Layout;
