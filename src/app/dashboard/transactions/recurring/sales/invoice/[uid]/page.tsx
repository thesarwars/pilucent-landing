'use client';
import { useParams } from 'next/navigation';
import RecurringInvoice from '../_components/RecurringInvoice';

const Page = () => {
  const { uid } = useParams();
  return <RecurringInvoice uid={uid as string} />;
};

export default Page;
