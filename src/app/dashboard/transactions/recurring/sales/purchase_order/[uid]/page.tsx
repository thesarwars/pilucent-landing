'use client';
import { useParams } from 'next/navigation';
import RecurringPurchaseOrder from '../_components/RecurringPurchaseOrder';

const Page = () => {
  const { uid } = useParams();
  return <RecurringPurchaseOrder uid={uid as string} />;
};

export default Page;
