'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { FileText, Paperclip, Send, X } from 'lucide-react';
import Button from './ui/Button';
import { cn } from '@/lib/utils';
import { ChatExpenseModal } from './modals/ChatExpenseModal';
import { uploadFiles } from '@/services/chat';

export type ChatInputBarProps = {
  onSendMessage: (
    content: string,
    messageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'VOICE',
    fileData?: string
  ) => boolean;
  onMarkAsRead?: () => void;
  disabled?: boolean;
  placeholder?: string;
  /** Required to upload attachments before sending over the socket */
  token?: string | null;
  isExpenseEnabled?: boolean;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function ChatInputBar({
  onSendMessage,
  onMarkAsRead,
  disabled = false,
  placeholder = 'Type a message...',
  token = null,
  isExpenseEnabled = false,
}: ChatInputBarProps) {
  const [value, setValue] = useState('');
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearPendingFile = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingFile(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onPickFile = useCallback(() => {
    if (disabled) return;
    setUploadError(null);
    fileInputRef.current?.click();
  }, [disabled]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingFile(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (disabled || uploading) return;

    if (pendingFile) {
      if (!token) {
        setUploadError('Sign in to send files.');
        return;
      }
      setUploading(true);
      setUploadError(null);
      try {
        const res = await uploadFiles(token, pendingFile);
        if (!res.success || !res.data) {
          setUploadError(res.message ?? 'Upload failed');
          return;
        }
        const fileUrl = (res.data.link || res.data.file || '').trim();
        if (!fileUrl) {
          setUploadError('Upload succeeded but no file URL was returned.');
          return;
        }
        const caption = value.trim() || pendingFile.name;
        const ok = onSendMessage(caption, 'FILE', fileUrl);
        if (ok) {
          clearPendingFile();
          setValue('');
          if (textareaRef.current) textareaRef.current.style.height = 'auto';
        }
      } finally {
        setUploading(false);
      }
      return;
    }

    const trimmed = value.trim();
    if (!trimmed) return;
    const ok = onSendMessage(trimmed, 'TEXT');
    if (ok) {
      setValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [value, disabled, uploading, pendingFile, token, onSendMessage, clearPendingFile]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const canSend =
    !disabled &&
    !uploading &&
    (Boolean(value.trim()) || Boolean(pendingFile)) &&
    (!pendingFile || Boolean(token));

  return (
    <div className="mt-auto flex w-full flex-col gap-3 px-4">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip"
        onChange={onFileChange}
      />

      {pendingFile ? (
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="flex gap-3 p-3">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#F3F4F6]">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#9CA3AF]">
                  <FileText className="h-10 w-10" strokeWidth={1.25} />
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
              <p className="truncate text-sm font-medium text-[#1F2937]">{pendingFile.name}</p>
              <p className="text-xs text-[#6B7280]">
                {pendingFile.type || 'File'} · {formatBytes(pendingFile.size)}
              </p>
              <p className="text-xs text-[#9CA3AF]">
                Add an optional caption below, then Send to upload and deliver.
              </p>
            </div>
            <button
              type="button"
              onClick={clearPendingFile}
              disabled={uploading}
              className="shrink-0 self-start rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151] disabled:opacity-50"
              aria-label="Remove attachment"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {uploadError ? (
            <p className="border-t border-red-100 bg-red-50/80 px-3 py-2 text-xs text-red-700">
              {uploadError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm">
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onMarkAsRead}
            disabled={disabled || uploading}
            className={cn(
              'max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-sm text-[#4F4F4F] placeholder:text-[#9CA3AF]',
              'min-w-0 outline-none disabled:cursor-not-allowed disabled:opacity-60'
            )}
            aria-label="Message input"
          />
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={onPickFile}
            className="shrink-0 text-[#9CA3AF] transition-colors hover:text-[#6B7280] disabled:opacity-50"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5" strokeWidth={1.5} />
          </button>
          {isExpenseEnabled && (
            <Button
              size="medium"
              className="whitespace-nowrap bg-[#3462FA] text-white hover:bg-[#2A54E8]"
              onClick={() => setExpenseOpen(true)}
            >
              Expense
            </Button>
          )}
          <Button
            size="medium"
            className="whitespace-nowrap bg-black text-white hover:bg-gray-800"
            disabled={!canSend}
            onClick={() => void handleSend()}
          >
            <Send className="mr-1.5 h-4 w-4" strokeWidth={2} />
            {uploading ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </div>

      {/* <p className="text-right text-xs text-[#9FAAB8]">
        Submit expenses directly from chat. Upload receipt for OCR.
      </p> */}

      <ChatExpenseModal open={expenseOpen} onClose={() => setExpenseOpen(false)} />
    </div>
  );
}

export default ChatInputBar;
