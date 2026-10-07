const WS_HOST = 'wss://balanzifyapi.jumatechs.xyz';

/** Base path for chat WebSocket. Backend routing must match (e.g. /api/v1/chat or /ws/chat) */
export const SOCKET_BASE = `${WS_HOST}/api/v1/chat`;

/** Build WebSocket URL for direct (DM) chat – path: /api/v1/chat/{userUid}/ */
export function getChatWsUrl(userUid: string, token: string | null): string {
  const base = `${SOCKET_BASE}/${userUid}/`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

/** Build WebSocket URL for group room chat – path: /api/v1/chat/room/{roomUid}/ */
export function getGroupChatWsUrl(roomUid: string, token: string | null): string {
  const base = `${SOCKET_BASE}/room/${roomUid}/`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

/** Build WebSocket URL for user list (single_chats) */
export function getUserListWsUrl(token: string | null): string {
  const base = `${SOCKET_BASE}/user-list/`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

export const RECONNECT_DELAY_MS = 2000;
export const MAX_RECONNECT_DELAY_MS = 30000;
export const RECONNECT_BACKOFF_MULTIPLIER = 1.5;
