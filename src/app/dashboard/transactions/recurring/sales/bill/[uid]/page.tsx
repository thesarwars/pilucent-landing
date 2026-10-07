'use client';
import { useParams } from 'next/navigation';
import RecurringBill from '../_components/RecurringBill';

const Page = () => {
  const { uid } = useParams();
  return <RecurringBill uid={uid as string} />;
};

export default Page;
