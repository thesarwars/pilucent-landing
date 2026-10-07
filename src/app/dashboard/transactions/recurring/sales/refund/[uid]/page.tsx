'use client';
import { useParams } from 'next/navigation';
import RecurringRefundReceipt from '../_components/RecurringRefundReceipt';

const Page = () => {
  const { uid } = useParams();
  return <RecurringRefundReceipt uid={uid as string} />;
};

export default Page;
