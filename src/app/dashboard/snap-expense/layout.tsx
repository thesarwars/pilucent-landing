import { ReactNode } from 'react';
import MenuBars from './_components/MenuBars';
import { SnapExpenseProvider } from './_components/context/SnapExpense.Context';

function SnapExpenseLayout({ children }: { children: ReactNode }) {
  return (
    <main className="snap_background h-[calc(100vh-80px)] w-full overflow-hidden font-inter">
      {/* <SnapBackground /> */}
      <SnapExpenseProvider>
        <MenuBars>{children}</MenuBars>
      </SnapExpenseProvider>
    </main>
  );
}

export default SnapExpenseLayout;
