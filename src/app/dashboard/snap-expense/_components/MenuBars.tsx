'use client';

import { ReactNode } from 'react';
import LeftSideBar from './LeftSideBar';
import Header from './Header';
import TopBar from './TopBar';
import { useSnapExpense } from './context/SnapExpense.Context';
import MainLoader from '@/components/MainLoader/MainLoader';

function MenuBars({ children }: { children: ReactNode }) {
  const { userLoading } = useSnapExpense();

  if (userLoading) {
    return <MainLoader />;
  }

  return (
    <>
      {/* <Header /> */}
      <div className="relative flex gap-5 ">
        <LeftSideBar />
        <div className="flex-1 rounded-3xl border-2 border-white bg-white/30 p-4 font-inter backdrop-blur-lg">
          <div className="flex w-full flex-1 flex-col gap-4 rounded-2xl bg-white/60 p-4">
            <TopBar />
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default MenuBars;
