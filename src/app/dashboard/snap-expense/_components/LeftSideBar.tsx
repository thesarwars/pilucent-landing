'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { SearchInput } from './ui/Input';
import Button from './ui/Button';
import { useSnapExpense } from './context/SnapExpense.Context';
import Avatar from './ui/Avatar';
import { PlusIcon, Users } from 'lucide-react';
import { CreateGroupModal } from './modals/CreateGroupModal';
import { DirectChatModal } from './modals/DirectChatModal';
import type { RoomChatItem, SingleChatItem } from './types/chat';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type ChatFilter = 'all' | 'groups' | 'direct';

function LeftSideBar() {
  const pathname = usePathname();
  const { singleChats, roomChats, userListStatus, userLoading } = useSnapExpense();
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [directChatOpen, setDirectChatOpen] = useState(false);
  const [chatFilter, setChatFilter] = useState<ChatFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { roomUid } = useParams();
  const { userUid } = useParams();

  const pathThreadUid = useMemo(() => {
    if (!pathname) return null;
    const dm = pathname.match(/^\/snap-expense\/dm\/([^/]+)/);
    if (dm?.[1]) return { kind: 'dm' as const, uid: dm[1] };
    const gr = pathname.match(/^\/snap-expense\/group\/([^/]+)/);
    if (gr?.[1]) return { kind: 'group' as const, uid: gr[1] };
    return null;
  }, [pathname]);

  const isDmActive = (userUid: string) =>
    pathThreadUid?.kind === 'dm' && pathThreadUid.uid === userUid;
  const isGroupActive = (roomUid: string) =>
    pathThreadUid?.kind === 'group' && pathThreadUid.uid === roomUid;

  const directItems = useMemo(() => {
    let list: { type: 'direct'; uid: string; chat: SingleChatItem }[] = singleChats.map((chat) => ({
      type: 'direct' as const,
      uid: chat.user.uid,
      chat,
    }));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(({ chat }) => {
        const name = [chat.user.first_name, chat.user.last_name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        const email = (chat.user.email ?? '').toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }
    return list;
  }, [singleChats, searchQuery]);

  const groupItems = useMemo(() => {
    let list: { type: 'group'; item: RoomChatItem }[] = roomChats.map((item) => ({
      type: 'group' as const,
      item,
    }));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(({ item }) => item.room.title?.toLowerCase().includes(q));
    }
    return list;
  }, [roomChats, searchQuery]);

  const filteredList = useMemo(() => {
    const direct = chatFilter === 'groups' ? [] : directItems;
    const groups = chatFilter === 'direct' ? [] : groupItems;
    if (chatFilter === 'all') return [...groups, ...direct];
    if (chatFilter === 'groups') return groups;
    return direct;
  }, [chatFilter, directItems, groupItems]);

  const isLoading =
    userLoading ||
    ((userListStatus === 'connecting' || userListStatus === 'disconnected') &&
      singleChats.length === 0 &&
      roomChats.length === 0);

  return (
    <aside className="sticky top-8 flex h-[calc(100vh-80px)] w-[30%] shrink-0 flex-col rounded-3xl border-2 border-white bg-white/30 p-4 font-inter shadow-md backdrop-blur-lg">
      <div className="mb-4 inline-flex items-center justify-start gap-2 rounded-xl bg-white/30 px-2 py-1.5">
        <Button
          variant={chatFilter === 'all' ? 'default' : 'outline'}
          size="large"
          className={cn('rounded-md', chatFilter === 'all' && 'bg-snap_black text-white')}
          onClick={() => setChatFilter('all')}
        >
          All
        </Button>
        <Button
          variant={chatFilter === 'groups' ? 'default' : 'outline'}
          size="large"
          className={cn('rounded-md', chatFilter === 'groups' && 'bg-snap_black text-white')}
          onClick={() => setChatFilter('groups')}
        >
          Groups
        </Button>
        <Button
          variant={chatFilter === 'direct' ? 'default' : 'outline'}
          size="large"
          className={cn('rounded-md', chatFilter === 'direct' && 'bg-snap_black text-white')}
          onClick={() => setChatFilter('direct')}
        >
          Direct
        </Button>
      </div>

      <SearchInput
        placeholder="Search conversations..."
        containerClassName="mb-4"
        className="inline-flex rounded-[10px] px-5 py-4 outline outline-1 outline-offset-[-1px] outline-zinc-200 placeholder:text-[#A1A7C4]"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {isLoading && singleChats.length === 0 && roomChats.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#9CA3AF]">Loading chats...</p>
        ) : filteredList.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#9CA3AF]">No chats yet</p>
        ) : (
          filteredList.map((item) => {
            if (item.type === 'group') {
              const { item: roomChat } = item;
              const { room }: any = roomChat;
              const isActive = isGroupActive(room.uid);
              const subtitle = roomChat.last_message
                ? roomChat.last_message_sender?.first_name
                  ? `${roomChat.last_message_sender.first_name}: ${roomChat.last_message}`
                  : roomChat.last_message
                : 'No messages yet';
              return (
                <Link
                  key={`group-${room.uid}`}
                  href={`/dashboard/snap-expense/group/${room.uid}`}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-white/80',
                    roomUid === room.uid && 'bg-white/80'
                  )}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#9B98C5]/40">
                    {room?.room_icon_url ? (
                      <Image
                        src={room?.room_icon_url}
                        alt={room?.title}
                        width={100}
                        height={100}
                        className="h-full w-full rounded-full object-cover object-top"
                      />
                    ) : (
                      <Users className="h-6 w-6 text-snap_black" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-snap_black">
                    <p className="truncate text-sm font-semibold">{room.title}</p>
                    <p className="truncate text-xs text-[#9FAAB8]">{subtitle}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-snap_black">
                    {roomChat.unread_count > 0 && (
                      <div className="flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-snap_black px-2">
                        <span className="text-xs font-semibold text-white">
                          {roomChat.unread_count}
                        </span>
                      </div>
                    )}
                    <div
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        isActive ? 'bg-snap_black' : 'bg-transparent'
                      )}
                    />
                  </div>
                </Link>
              );
            }
            const { chat } = item;
            const { user } = chat;
            const displayName =
              [user.first_name, user.last_name].filter(Boolean).join(' ') ||
              user.email ||
              'Unknown';
            const isActive = isDmActive(user.uid);
            return (
              <Link
                key={`direct-${user.uid}`}
                href={`/dashboard/snap-expense/dm/${user.uid}`}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-white/80',
                  userUid === user.uid && 'bg-white/80'
                )}
              >
                <div className="relative shrink-0">
                  <Avatar
                    className="h-12 w-12 shrink-0 bg-[#9B98C5]/40"
                    image={user.image && `https://balanzifyapi.jumatechs.xyz/${user.image}`}
                  />
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-snap_black">
                  <p className="truncate text-sm font-semibold">{displayName}</p>
                  <p className="truncate text-xs text-[#9FAAB8]">
                    {chat.last_message || 'No messages yet'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-snap_black">
                  {chat.unread_count > 0 && (
                    <div className="flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-snap_black px-2">
                      <span className="text-xs font-semibold text-white">{chat.unread_count}</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      isActive ? 'bg-snap_black' : 'bg-transparent'
                    )}
                  />
                </div>
              </Link>
            );
          })
        )}
      </div>
      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          size="large"
          className="inline-flex items-center gap-3 rounded-md border-none bg-white/70 text-black"
          onClick={() => setCreateGroupOpen(true)}
        >
          <PlusIcon className="h-5 w-5" /> Create Group
        </Button>
        <Button
          variant="outline"
          size="large"
          className="inline-flex items-center gap-3 rounded-md border-none bg-white/70 text-black"
          onClick={() => setDirectChatOpen(true)}
        >
          <PlusIcon className="h-5 w-5" /> New Direct Chat
        </Button>
      </div>

      <CreateGroupModal open={createGroupOpen} onClose={() => setCreateGroupOpen(false)} />
      <DirectChatModal open={directChatOpen} onClose={() => setDirectChatOpen(false)} />
    </aside>
  );
}

export default LeftSideBar;
