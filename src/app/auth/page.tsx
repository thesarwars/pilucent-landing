'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect } from 'react';

const PageContent = () => {
  const paramsToken = useSearchParams().get('tkn');
  const refreshToken = useSearchParams().get('rt');
  const action = useSearchParams().get('action');
  const router = useRouter();

  useEffect(() => {
    if (action == 'logout') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/pricing?action=logout`;
      return;
    }

    if (paramsToken && refreshToken) {
      localStorage.setItem('access_token', paramsToken);
      localStorage.setItem('refresh_token', refreshToken);
      if (action == 'company_setup') {
        router.push(`/company/get_started`);
        return;
      }
    }
    router.push('/dashboard');
    // window.location.href = "https://balanzify-seven.vercel.app/dashboard";
  }, [action, paramsToken, refreshToken]);
  return <></>;
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
