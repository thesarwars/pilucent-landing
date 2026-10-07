'use client';

import { useParams, useRouter } from 'next/navigation';
import Holiday from '../../_components/create-holiday';

const Page = () => {
  const router = useRouter();
  const { uid } = useParams<{ uid: string }>();
  const back = () => router.push('/dashboard/hris/employee/holiday');

  return <Holiday isOpen uid={uid} setIsOpen={back} refetch={back} />;
};

export default Page;
