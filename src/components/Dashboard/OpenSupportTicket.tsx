'use client';

import React from 'react';
import { Card } from '../ui/card';
import Image from 'next/image';
import { fetchSupportTickets } from '@/app/helpers/backend';
import { useFetch } from '@/app/helpers/hooks';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { cn } from '@/lib/utils';


type SupportTicket = {
  uid: string;
  title?: string | null;
  ticket_noumber?: string | null;
  created_at?: string | null;
  user?: {
    first_name?: string | null;
    last_name?: string | null;
    name?: string | null;
    image?: string | null;
  } | null;
};

const imageBaseURL = 'https://balanzifyapi.jumatechs.xyz';

function resolveImageUrl(src?: string | null) {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return `${imageBaseURL}${src}`;
}

function formatRelativeTime(iso?: string | null) {
  if (!iso) return '';
  return moment(iso).fromNow();
}

const OpenSupportTicket = () => {
  const { data, isPending } = useFetch(['/support/tickets/'], fetchSupportTickets);

  const router = useRouter();

  const tickets: SupportTicket[] = (data?.results ?? []) as SupportTicket[];

  return (
    <Card
      className={cn(
        'flex w-full flex-1 flex-col border border-white/80 bg-[#FFFFFF4D] shadow-sm',
        'rounded-[28px] p-6 2xl:p-8',
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-accent_primary sm:text-xl">
          Open Tickets
        </h2>
        <button
  type="button"
  onClick={() => router.push('/dashboard/support')}
  style={{background: 'linear-gradient(278deg, #3D29D0 46.69%, #C25FFF 101.09%)' }}
  className="shrink-0 rounded-full px-6 py-4 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
>
          Go to Support
        </button>
      </div>

      <div className="flex max-h-[420px] flex-col gap-5 overflow-y-auto pr-1">
        {isPending ? (
          <div className="text-sm text-accent_text_gray">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="text-sm text-accent_text_gray">No open tickets.</div>
        ) : (
          tickets.map((ticket, index) => {
            const displayName =
              ticket?.user?.name ||
              [ticket?.user?.first_name, ticket?.user?.last_name].filter(Boolean).join(' ') ||
              'Unknown';
            const avatarSrc = resolveImageUrl(ticket?.user?.image);
            const headline =
              (ticket?.title && ticket.title.trim()) ||
              ticket?.ticket_noumber ||
              'Support request';
            const description = [displayName, ticket?.ticket_noumber]
              .filter(Boolean)
              .join(' · ');
            const timeAgo = formatRelativeTime(ticket?.created_at);
            

            return (
              <div
                key={ticket.uid}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/dashboard/support/${ticket.uid}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/dashboard/support/${ticket.uid}`);
                  }
                }}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-2xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent_soft_blue/40 hover:bg-[#FFFFFF99] p-4',
                )}
              >
                <div
                  className={cn(
                    'relative flex size-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full',
                    'ring-1 ring-black/[0.06]',
                  )}
                >
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={displayName}
                      width={104}
                      height={104}
                      className={cn(
                        'size-full object-cover object-top',
                      )}
                    />
                  ) : (
                    <span
                      className={cn(
                        'text-lg font-bold text-accent_soft_blue',
                      )}
                    >
                      {(displayName.trim().charAt(0) || '?').toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={cn(
                        'line-clamp-2 text-sm font-bold leading-snug text-accent_primary',
                      )}
                    >
                      {headline}
                    </h3>
                    {!!timeAgo && (
                      <span className="shrink-0 text-xs font-medium text-accent_soft_blue">
                        {timeAgo}
                      </span>
                    )}
                  </div>
                  {!!description && (
                    <p className="mt-1 line-clamp-2 text-xs font-normal leading-relaxed text-accent_text_gray">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default OpenSupportTicket;
