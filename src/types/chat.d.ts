type TApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

type TChatRoomsResult = {
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
  member_count: number;
  created_at: string;
  updated_at: string;
};

type TChatRoomsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TChatRoomsResult[];
};

type TChatRoomResult = {
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
  members: {
    id: number;
    user: number;
    user_uid: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    joined_at: string;
  }[];
  created_at: string;
  updated_at: string;
};

type TChatRoomCreateResponse = {
  uid: string;
  slug: string;
  title: string;
  description: string;
};

type TAddChatRoomMemberResponse = {
  user_uids: string[];
  role: 'GROUP_ADMIN' | 'MODERATOR' | 'APPROVER' | 'FINANCE' | 'EMPLOYEE' | 'SYSTEM';
};

type TChatMessageUser = {
  uid: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  image: string;
};

type TChatMessage = {
  id: number;
  sender: TChatMessageUser;
  receiver: TChatMessageUser;
  content: string;
  message_type: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE';
  file_data: string | null;
  is_read: boolean;
  is_active: boolean;
  timestamp: string;
  read_at: string;
};

type TChatGroupMessage = {
  /** Present when API aligns with room WebSocket message shape */
  id?: number;
  room_uid: string;
  sender: TChatMessageUser;
  content: string;
  message_type: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE' | string;
  file_data: string | null;
  timestamp: string;
  created_time?: string;
  is_read?: boolean;
  read_count?: number;
  read_by?: { user_id: number; read_at: string }[];
};

type TChatMessageResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TChatMessage[];
};

type TChatGroupMessageResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TChatGroupMessage[];
};

type TUploadFilesResponse = {
  uid: string;
  title: string;
  file: string;
  description: string | null;
  status: string;
  kind: string;
  link: string | null;
  is_report: boolean;
  created_at: string;
  updated_at: string;
};
