export type RoomListItem = {
  uid: string;
  title: string;
  slug?: string;
};

export type User = {
  uid: string;
  first_name: string;
  last_name: string;
  image?: string;
  email: string;
  token: string;
  refresh_token: string;
};

/** Single chat item from user_list WebSocket event (single_chats) */
export type SingleChatItem = {
  user: {
    uid: string;
    first_name: string;
    last_name: string;
    image?: string;
    email: string;
  };
  online: boolean;
  unread_count: number;
  last_message: string | null;
  last_message_time: string | null;
};

/** Aligns with `TChatRoomResult` from chat API (members include `role`). */
export type SnapGroupRoomMember = {
  id: number;
  user: number;
  user_uid: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  joined_at: string;
};

export type SnapGroupRoomDetail = {
  uid: string;
  title: string;
  slug: string;
  description: string;
  created_by_detail: {
    id: number;
    uid: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  members: SnapGroupRoomMember[];
  created_at: string;
  updated_at: string;
};

/** Room chat item from user_list WebSocket event (room_chats) */
export type RoomChatItem = {
  room: {
    uid: string;
    title: string;
    slug?: string;
  };
  unread_count: number;
  last_message: string | null;
  last_message_time: string | null;
  last_message_sender: {
    uid: string;
    first_name?: string;
  } | null;
};

export type UserListEvent = {
  event: 'user_list';
  single_chats: SingleChatItem[];
  room_chats?: RoomChatItem[];
};

export type SnapExpenseContextValue = {
  // User auth (loaded via getUser)
  user: User | null;
  userLoading: boolean;
  userUid: string | null;
  token: string | null;

  // Chat list (from user-list WebSocket)
  singleChats: SingleChatItem[];
  roomChats: RoomChatItem[];
  /** Update a group row when settings change (WS may not push immediately). */
  patchRoomChatInList: (
    roomUid: string,
    patch: Partial<Pick<RoomChatItem['room'], 'title' | 'slug'>>,
    /** Match rows where `room.uid` or `room.slug` equals any of these (handles slug vs uid in list). */
    extraMatchKeys?: string[]
  ) => void;
  removeRoomChatFromList: (roomUid: string, extraMatchKeys?: string[]) => void;
  userListStatus: ConnectionStatus;
  /** True after first user_list event (so we know room vs direct for WS URL) */
  listReceived: boolean;

  /** Active DM peer (user uid) — set on `/snap-expense/dm/[userUid]` */
  activeDmUid: string | null;
  setActiveDm: (uid: string | null) => void;
  /** Active group room uid — set on `/snap-expense/group/[roomUid]` */
  activeGroupRoomUid: string | null;
  setActiveGroupRoom: (uid: string | null) => void;
  /** True when viewing a group thread (derived from activeGroupRoomUid). */
  isGroupChatView: boolean;

  /** `getChatRoom` payload while in a group thread; null for DM or idle. */
  groupRoomDetail: SnapGroupRoomDetail | null;
  groupRoomLoading: boolean;
  /** Current user's `role` from `groupRoomDetail.members` (API). */
  currentUserGroupRole: string | null;
  refetchGroupRoom: () => Promise<void>;

  messages: ChatMessage[];
  status: ConnectionStatus;
  sendMessage: (
    content: string,
    type?: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE',
    fileData?: string
  ) => boolean;
  /** Low-level socket send for room-only actions (expense report, status changes). */
  sendRoomAction: (payload: unknown) => boolean;
  markAsRead: (messageIds?: number[]) => boolean;
};

export type ChatMessage = {
  event?: 'new_message';
  id: number;
  origin_message_id?: number;
  receiver: {
    id: number;
    uid: string;
    first_name?: string;
    last_name?: string;
    image?: string;
  };
  sender: {
    id: number;
    uid: string;
    first_name?: string;
    last_name?: string;
    image?: string;
  };
  content: string;
  message_type: string;
  file_data?: any;
  is_read?: boolean;
  timestamp: string;
  /** Alias for display; API uses timestamp */
  created_time?: string;
  read_count?: number;
  read_by?: { user_id: number; read_at: string }[];
};

/** room_joined event */
export type RoomJoinedEvent = {
  event: 'room_joined';
  room_id: string;
  room_name: string;
  room_slug: string;
  your_role: string;
};

/** room_user_status event */
export type RoomUserStatusEvent = {
  event: 'room_user_status';
  room_name: string;
  room_slug: string;
  user_uid: string;
  first_name: string;
  user_email: string;
  role: string;
  status: 'joined' | 'left';
};

/** room_messages_read event */
export type RoomMessagesReadEvent = {
  event: 'room_messages_read';
  reader: { user_id: number; user_uid: string; first_name: string };
  message_ids: number[];
  read_info: Record<
    string,
    { read_count: number; read_by: { user_id: number; read_at: string }[] }
  >;
};

export type RoomChatWsEvent =
  | ChatMessage
  | RoomJoinedEvent
  | RoomUserStatusEvent
  | RoomMessagesReadEvent;

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'closed';
