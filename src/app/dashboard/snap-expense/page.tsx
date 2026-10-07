'use client';
import { useSnapExpense } from './_components/context/SnapExpense.Context';

function SnapExpenseHome() {
  const { singleChats, userListStatus, userLoading } = useSnapExpense();

  const loading =
    userLoading ||
    userListStatus === 'connecting' ||
    (userListStatus === 'disconnected' && singleChats.length === 0);
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-260px)] flex-col items-center justify-center gap-4">
        <p className="text-sm text-[#9CA3AF]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-260px)] flex-col items-center justify-center gap-4">
      <p className="text-center text-sm text-[#9CA3AF]">
        Select a room from the sidebar or create one to start chatting.
      </p>
    </div>
  );
}

export default SnapExpenseHome;
