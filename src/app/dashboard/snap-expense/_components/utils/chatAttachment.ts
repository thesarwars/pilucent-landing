/** Payload shape returned from `uploadFiles` / `TUploadFilesResponse`, sent as `file_data` on the socket. */
export type ChatAttachmentPayload = {
  uid: string;
  title: string;
  file: string;
  link: string | null;
  description: string | null;
  kind: string;
};

export function parseAttachmentData(file_data: any): ChatAttachmentPayload | string | null {
  if (file_data == null || file_data === '') return null;
  try {
    const o = JSON.parse(file_data) as ChatAttachmentPayload;
    if (o && typeof o === 'object' && typeof o.uid === 'string') return o;
  } catch {
    return file_data;
  }
  return file_data;
}

export function attachmentUrl(p: ChatAttachmentPayload | string): string {
  if (typeof p === 'string') return p;
  return p.link || p.file || '';
}

export function attachmentTitle(p: ChatAttachmentPayload | string, fallback: string): string {
  if (typeof p === 'string') return fallback;
  return p.title || fallback;
}

/** Heuristic: show inline preview for FILE messages whose URL looks like an image. */
export function isProbablyImageFileUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp|avif|svg|bmp)(\?|#|$)/i.test(url);
}
