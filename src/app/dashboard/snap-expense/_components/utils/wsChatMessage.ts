import type { ChatMessage } from '../types/chat';

function pickMessageTime(o: Record<string, unknown>): string {
  if (typeof o.timestamp === 'string' && o.timestamp) return o.timestamp;
  if (typeof o.created_time === 'string' && o.created_time) return o.created_time;
  return new Date().toISOString();
}

/** Strip WS envelope fields; ensure `timestamp` exists for sorting / UI. */
function toChatMessageShape(o: Record<string, unknown>): ChatMessage | null {
  const ts = pickMessageTime(o);
  const { event: _event, id: rawId, content: rawContent, ...rest } = o;

  const idNum =
    typeof rawId === 'number'
      ? rawId
      : typeof rawId === 'string' && rawId !== ''
        ? Number(rawId)
        : NaN;

  if (Number.isNaN(idNum)) return null;

  return {
    ...(rest as unknown as ChatMessage),
    id: idNum,
    content: typeof rawContent === 'string' ? rawContent : '',
    timestamp: ts,
    created_time: typeof o.created_time === 'string' ? o.created_time : ts,
    file_data:
      o.file_data === null || o.file_data === undefined
        ? null
        : (o.file_data as string | Record<string, unknown> | null),
  } as ChatMessage;
}

/**
 * Normalize heterogeneous WebSocket payloads into a `ChatMessage` when possible.
 * Room chat uses `event: "room_message"`; DM may use `new_message` or a bare payload.
 */
export function tryExtractChatMessage(data: unknown): ChatMessage | null {
  console.log(data, 'data from socket web tryExtractChatMessage');
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  if (o.event === 'new_message' || o.event === 'room_message') {
    const msg = toChatMessageShape(o);
    if (!msg) return null;
    if (msg.sender?.uid && (typeof msg.content === 'string' || msg.content === '')) {
      return msg;
    }
    return null;
  }

  if (o.event === 'message' && o.payload && typeof o.payload === 'object') {
    return tryExtractChatMessage(o.payload);
  }
  if (o.event === 'message' && o.data && typeof o.data === 'object') {
    return tryExtractChatMessage(o.data);
  }

  if (o.message && typeof o.message === 'object') {
    return tryExtractChatMessage(o.message);
  }

  const rawId = o.id;
  const idNum =
    typeof rawId === 'number'
      ? rawId
      : typeof rawId === 'string' && rawId !== ''
        ? Number(rawId)
        : NaN;

  if (
    !Number.isNaN(idNum) &&
    o.sender &&
    typeof o.sender === 'object' &&
    typeof (o.sender as { uid?: unknown }).uid === 'string' &&
    (typeof o.content === 'string' || o.content === '')
  ) {
    return toChatMessageShape(o);
  }

  return null;
}

/** Detect expense report payloads in `content` or `file_data` (API shapes vary). */
export function parseExpenseReportPayload(message: ChatMessage): Record<string, unknown> | null {
  // console.log(message);
  const looksExpense = (obj: Record<string, unknown>): boolean =>
    'amount' in obj || 'report_uid' in obj || ('supplier' in obj && 'expense_date' in obj);

  const tryParse = (raw: unknown): Record<string, unknown> | null => {
    if (raw == null) return null;
    // handle already-parsed object (e.g. file_data comes as an object from WS)
    if (typeof raw === 'object' && !Array.isArray(raw)) {
      const obj = raw as Record<string, unknown>;
      if (looksExpense(obj)) return obj;
      return null;
    }
    const str = String(raw).trim();
    if (str === '') return null;
    try {
      const v = JSON.parse(str) as unknown;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const obj = v as Record<string, unknown>;
        if (looksExpense(obj)) return obj;
      }
    } catch {
      /* not JSON */
    }
    return null;
  };

  const t = String(message.message_type || '').toUpperCase();
  if (
    t === 'EXPENSE_REPORT' ||
    t === 'EXPENSE' ||
    t === 'EXPENSE_REPORT_MESSAGE' ||
    t == 'EXPENSE_DATA'
  ) {
    return tryParse(message.file_data || message.content || undefined);
  }

  const fromFile = tryParse(message.file_data ?? undefined);
  if (fromFile) return fromFile;
  const fromContent = tryParse(message.content);
  if (fromContent && ('amount' in fromContent || 'report_uid' in fromContent)) return fromContent;

  return null;
}

/** Deterministic pseudo-id for WS-only expense rows (avoids clashing with positive DB message ids). */
function expenseReportSavedMessageId(reportUid: string): number {
  const s = `expense_report_saved:${reportUid}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return -Math.abs(h) - 1;
}

/**
 * Turns `expense_report_saved` socket payload into a `ChatMessage` rendered by `ExpenseReportChatCard`.
 */
export function chatMessageFromExpenseReportSaved(
  raw: Record<string, unknown>,
  roomUid: string
): ChatMessage | null {
  if (raw.event !== 'expense_report_saved') return null;
  const result = raw.result;
  if (!result || typeof result !== 'object') return null;
  const r = result as Record<string, unknown>;
  if (r.success === false) return null;

  const reportUid = String(r.uid ?? '');
  if (!reportUid) return null;

  const userUid = String(raw.user_uid ?? '');
  const ts = String(r.created_time ?? r.updated_time ?? new Date().toISOString());

  const vendor = r.vendor != null && r.vendor !== '' ? String(r.vendor) : '';
  const category = r.category != null && r.category !== '' ? String(r.category) : '';
  const slug = r.slug != null ? String(r.slug) : '';

  const description =
    [vendor && `Vendor ${vendor}`, category && `Category ${category}`]
      .filter(Boolean)
      .join(' · ') ||
    slug ||
    'Expense report';

  const filePayload = {
    report_uid: reportUid,
    uid: reportUid,
    amount: parseFloat(String(r.amount ?? 0)),
    currency: (typeof r.currency === 'string' && r.currency) || 'USD',
    description,
    expense_date: String(r.expense_date ?? ''),
    reference_number: slug || undefined,
    status: String(r.status ?? 'DRAFT').toUpperCase(),
    supplier: vendor || undefined,
    category: category || undefined,
  };

  return {
    id: expenseReportSavedMessageId(reportUid),
    sender: {
      id: 0,
      uid: userUid,
      first_name: typeof raw.first_name === 'string' ? raw.first_name : undefined,
      last_name: typeof raw.last_name === 'string' ? raw.last_name : undefined,
      image: undefined,
    },
    receiver: {
      id: 0,
      uid: roomUid,
    },
    content: '',
    message_type: 'EXPENSE_REPORT',
    file_data: JSON.stringify(filePayload),
    is_read: false,
    timestamp: ts,
    created_time: ts,
    read_count: 0,
    read_by: [],
  };
}

export function messagesShareExpenseReportUid(messages: ChatMessage[], reportUid: string): boolean {
  return messages.some((m) => {
    if (m.message_type !== 'EXPENSE_REPORT' || !m.file_data) return false;
    try {
      const p =
        typeof m.file_data === 'object'
          ? (m.file_data as { report_uid?: string; uid?: string })
          : (JSON.parse(m.file_data) as { report_uid?: string; uid?: string });
      return p.report_uid === reportUid || p.uid === reportUid;
    } catch {
      return false;
    }
  });
}
