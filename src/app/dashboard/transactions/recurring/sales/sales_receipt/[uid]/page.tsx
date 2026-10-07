'use client';
import { useParams } from 'next/navigation';
import RecurringSalesReceipt from '../_components/RecurringSalesReceipt';

const Page = () => {
  const { uid } = useParams();
  return <RecurringSalesReceipt uid={uid as string} />;
};

export default Page;
