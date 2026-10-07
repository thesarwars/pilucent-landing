'use client';
import MainLoader from '@/components/MainLoader/MainLoader';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push('/dashboard');
  }, []);

  return (
    <main>
      {/* <SignIn /> */}
      {/* <MainLoader/> */}
    </main>
  );
}
