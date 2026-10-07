'use client';
import { useParams } from 'next/navigation';
import RecurringCheque from '../_components/RecurringCheque';

const Page = () => {
  const { uid } = useParams();
  return <RecurringCheque uid={uid as string} />;
};

export default Page;
