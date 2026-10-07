'use client';
import { useParams } from 'next/navigation';
import RecurringCreditMemo from '../_components/RecurringCreditMemo';

const Page = () => {
  const { uid } = useParams();
  return <RecurringCreditMemo uid={uid as string} />;
};

export default Page;
