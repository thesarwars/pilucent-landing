'use client';
import { useParams } from 'next/navigation';
import RecurringExpense from '../_components/RecurringExpense';

const Page = () => {
  const { uid } = useParams();
  return <RecurringExpense uid={uid as string} />;
};

export default Page;
