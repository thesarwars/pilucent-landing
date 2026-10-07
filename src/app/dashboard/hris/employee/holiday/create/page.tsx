'use client';

import { useRouter } from 'next/navigation';
import Holiday from '../_components/create-holiday';

const Page = () => {
  const router = useRouter();
  const back = () => router.push('/dashboard/hris/employee/holiday');

  return <Holiday isOpen setIsOpen={back} refetch={back} />;
};

export default Page;
