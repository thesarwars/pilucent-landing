'use client';
import { useParams } from 'next/navigation';
import RecurringEstimate from '../_components/RecurringEstimate';

const Page = () => {
  const { uid } = useParams();
  return <RecurringEstimate uid={uid as string} />;
};

export default Page;
