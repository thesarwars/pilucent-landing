'use client';
export const dynamic = 'force-dynamic';
import MainLoader from '@/components/MainLoader/MainLoader';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { buildPricingHandoffUrl, getCompany, getUser } from '../helpers/backend';
import { ToastContainer } from 'react-toastify';
import { TooltipProvider } from '@/components/ui/tooltip';
import { lexend } from '@/lib/font';

const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;

const LayoutContent = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const paramsToken = useSearchParams().get('tkn');

  useEffect(() => {
    if (paramsToken) {
      //set params token to localStorage
      localStorage.setItem('access_token', paramsToken);
      const fn = async () => {
        try {
          //get company info
          const res = await getCompany();
          const user = await getUser();

          //if email not verified
          if (!user?.is_email_verified && res?.is_company_subscription) {
            return (window.location.href = `${redirectUrl}/auth?action=verify-email`);
          }

          // if company don't have subscription
          if (!res?.is_company_subscription) {
            // Hand off to the pricing site with company_uid + session tokens so
            // it bills the right company and keeps the user signed in.
            return (window.location.href = buildPricingHandoffUrl(res?.uid));

            //if company status is not draft
          } else if (res?.is_company_subscription && res?.status != 'DRAFT') {
            router.push(`/dashboard?token=${paramsToken}`);

            // finally
          } else {
            setIsLoading(false);
          }
        } catch (error) {
          localStorage.removeItem('access_token');
          return (window.location.href = `${redirectUrl}`);
        }
      };
      fn();
    } else {
      //   console.log("hopped without token", paramsToken);
      const token = localStorage.getItem('access_token');
      if (!token) window.location.href = `${redirectUrl}`;
      const fn = async () => {
        try {
          //get company info
          const res = await getCompany();
          const user = await getUser();

          //if email not verified
          if (!user?.is_email_verified && res?.is_company_subscription) {
            return (window.location.href = `${redirectUrl}/auth?action=verify-email`);
          }

          // if company don't have subscription
          if (!res?.is_company_subscription) {
            // Hand off to the pricing site with company_uid + session tokens so
            // it bills the right company and keeps the user signed in.
            return (window.location.href = buildPricingHandoffUrl(res?.uid));

            //if company status is not draft
          }
          // else if (res?.is_company_subscription && res?.status != 'DRAFT') {
          //   router.push(`/dashboard`);

          //   // finally
          // }
          else {
            setIsLoading(false);
          }
        } catch (error) {
          localStorage.removeItem('access_token');
          return (window.location.href = `${redirectUrl}`);
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
    <main className="min-h-screen flex-1 overflow-y-auto bg-[url(/snap-expense/snap_bg.webp)] bg-cover bg-fixed bg-center bg-no-repeat px-4 py-8 sm:px-6 lg:px-8">
      <ToastContainer
        hideProgressBar={true}
        pauseOnHover={false}
        pauseOnFocusLoss={false}
        theme="light"
        autoClose={1500}
        closeButton={false}
        limit={3}
        newestOnTop={false}
        toastClassName="font-lexend"
      />
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              window.location.href = `${redirectUrl}/pricing?action=logout`;
            }}
            className="rounded-lg border border-white/80 bg-white/40 px-4 py-2 text-sm font-medium text-[#373636] backdrop-blur-sm transition-all hover:bg-white/60"
          >
            Logout
          </button>
        </div>
        <div className={`${lexend.variable} font-lexend`}>{children}</div>
      </div>
    </main>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<MainLoader />}>
      <TooltipProvider>
        <LayoutContent>{children}</LayoutContent>
      </TooltipProvider>
    </Suspense>
  );
};

export default Layout;
