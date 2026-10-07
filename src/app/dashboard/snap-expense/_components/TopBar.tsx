'use client';

import { startTransition, useEffect, useState } from 'react';
import { GROUP_SETTINGS_ICON, MEMBER_ICON } from './constants/svg';
import { useSnapExpense } from './context/SnapExpense.Context';
import { canModerateGroup } from './utils/groupRoomRole';
import { GroupMembersModal } from './modals/GroupMembersModal';
import { GroupSettingsModal } from './modals/GroupSettingsModal';

function TopBar() {
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const {
    isGroupChatView,
    activeDmUid,
    groupRoomDetail,
    activeGroupRoomUid,
    currentUserGroupRole,
    groupRoomLoading,
  } = useSnapExpense();
  const hasThread = !!activeDmUid || !!activeGroupRoomUid;
  const groupSubtitle =
    groupRoomLoading && isGroupChatView
      ? 'Group'
      : isGroupChatView && currentUserGroupRole
        ? `Group · ${currentUserGroupRole.replace(/_/g, ' ')}`
        : isGroupChatView
          ? 'Group'
          : '';
  const subtitle = !hasThread ? '' : isGroupChatView ? groupSubtitle : 'Direct message';

  const groupSettingsDisabled =
    isGroupChatView && (groupRoomLoading || !canModerateGroup(currentUserGroupRole));

  useEffect(() => {
    if (!isGroupChatView) {
      startTransition(() => {
        setMembersModalOpen(false);
        setSettingsModalOpen(false);
      });
    }
  }, [isGroupChatView]);

  return (
    <header className="flex h-10 w-full shrink-0 items-center justify-between gap-4 overflow-hidden font-inter">
      <h1 className="text-2xl font-medium">
        {groupRoomDetail?.title || 'Select a chat'}
        {subtitle ? (
          <span className="text-sm font-normal text-[#6B7280]"> — {subtitle}</span>
        ) : null}
      </h1>
      {isGroupChatView && activeGroupRoomUid ? (
        <nav className="flex items-center rounded-lg bg-white">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-[#4B5563] transition-colors hover:bg-gray-200 hover:text-[#1F2937] disabled:opacity-50"
            onClick={() => setMembersModalOpen(true)}
            aria-label="View group members"
            title="Members"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 20 20"
              fill="#000000"
            >
              <g fill="#000000" fill-rule="evenodd" clip-rule="evenodd">
                <path d="M3.36 9.977a5.5 5.5 0 0 0-.923 3.05V14a.5.5 0 1 1-1 0v-.972A6.5 6.5 0 0 1 2.53 9.422l.108-.162a.5.5 0 1 1 .832.555l-.108.162Z" />
                <path d="M6.18 8.365c-1.09 0-2.107.544-2.711 1.45l-.832-.554a4.258 4.258 0 0 1 3.542-1.896h.22a.5.5 0 0 1 0 1h-.22Zm3.078 1.6c.47.706.721 1.534.721 2.382h1a5.289 5.289 0 0 0-.889-2.936l-.1-.15a.5.5 0 1 0-.832.554l.1.15Z" />
                <path d="M6.448 8.365c1.089 0 2.106.544 2.71 1.45l.832-.554a4.258 4.258 0 0 0-3.542-1.896h-.22a.5.5 0 1 0 0 1h.22Z" />
                <path d="M6.25 7.25a2.25 2.25 0 1 0 0-4.5a2.25 2.25 0 0 0 0 4.5Zm0 1a3.25 3.25 0 1 0 0-6.5a3.25 3.25 0 0 0 0 6.5Zm4.258 4.936a5.5 5.5 0 0 0-.923 3.051v1.034a.5.5 0 1 1-1 0v-1.034a6.5 6.5 0 0 1 1.091-3.605l.133-.2a.5.5 0 0 1 .832.556l-.133.198Z" />
                <path d="M13.42 11.5a3.34 3.34 0 0 0-2.78 1.488l-.831-.555A4.34 4.34 0 0 1 13.42 10.5h.224a.5.5 0 1 1 0 1h-.224Zm3.187 1.686a5.5 5.5 0 0 1 .924 3.051v1.034a.5.5 0 1 0 1 0v-1.034a6.5 6.5 0 0 0-1.092-3.605l-.133-.2a.5.5 0 1 0-.832.556l.133.198Z" />
                <path d="M13.695 11.5a3.34 3.34 0 0 1 2.78 1.488l.832-.555a4.34 4.34 0 0 0-3.612-1.933h-.225a.5.5 0 1 0 0 1h.225Z" />
                <path d="M13.5 10.5a2.25 2.25 0 1 0 0-4.5a2.25 2.25 0 0 0 0 4.5Zm0 1a3.25 3.25 0 1 0 0-6.5a3.25 3.25 0 0 0 0 6.5Z" />
              </g>
            </svg>
          </button>

          <button
            type="button"
            className="rounded-lg px-4 py-2 text-[#4B5563] transition-colors hover:bg-gray-200 hover:text-[#1F2937] disabled:opacity-50"
            disabled={groupSettingsDisabled}
            title={
              groupSettingsDisabled
                ? 'Only admins and moderators can change group settings'
                : 'Group settings'
            }
            aria-label="Group settings"
            onClick={() => setSettingsModalOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="#000000"
                d="M17.5 12a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11Zm-5.477 2a6.47 6.47 0 0 0-.709 1.5H4.253a.749.749 0 0 0-.75.75v.577c0 .535.192 1.053.54 1.46c1.253 1.469 3.22 2.214 5.957 2.214c.597 0 1.157-.035 1.68-.106c.246.495.553.954.912 1.367c-.795.16-1.66.24-2.592.24c-3.146 0-5.532-.906-7.098-2.74a3.75 3.75 0 0 1-.898-2.435v-.578A2.249 2.249 0 0 1 4.253 14h7.77Zm5.477 0l-.09.008a.5.5 0 0 0-.402.402L17 14.5V17h-2.496l-.09.008a.5.5 0 0 0-.402.402l-.008.09l.008.09a.5.5 0 0 0 .402.402l.09.008H17v2.5l.008.09a.5.5 0 0 0 .402.402l.09.008l.09-.008a.5.5 0 0 0 .402-.402L18 20.5V18h2.504l.09-.008a.5.5 0 0 0 .402-.402l.008-.09l-.008-.09a.5.5 0 0 0-.402-.402l-.09-.008H18v-2.5l-.008-.09a.5.5 0 0 0-.402-.402L17.5 14ZM10 2.005a5 5 0 1 1 0 10a5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z"
              />
            </svg>
          </button>
        </nav>
      ) : null}

      <GroupMembersModal
        setIsOpen={setMembersModalOpen}
        open={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
      />
      <GroupSettingsModal open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
    </header>
  );
}

export default TopBar;
