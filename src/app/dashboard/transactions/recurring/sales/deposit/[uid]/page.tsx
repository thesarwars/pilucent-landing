'use client';
import { useParams } from 'next/navigation';
import RecurringDeposit from '../_components/RecurringDeposit';

const Page = () => {
  const { uid } = useParams();
  return <RecurringDeposit uid={uid as string} />;
};

export default Page;
