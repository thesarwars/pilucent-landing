'use client';
import { useParams } from 'next/navigation';
import RecurringPayment from '../_components/RecurringPayment';

const Page = () => {
  const { uid } = useParams();
  return <RecurringPayment uid={uid as string} />;
};

export default Page;
