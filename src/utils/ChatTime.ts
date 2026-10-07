import moment from 'moment';

export const formatChatTime = (timestamp: any) => {
  const now = moment();
  const time = moment(timestamp);
  const yesterday = moment().subtract(1, 'days');

  if (now.diff(time, 'seconds') < 60) {
    return 'Just now';
  } else if (now.diff(time, 'minutes') < 60) {
    return time.fromNow(); // e.g., "5 minutes ago"
  } else if (now.isSame(time, 'day')) {
    return time.format('h:mm A'); // e.g., "5:30 PM"
  } else if (yesterday.isSame(time, 'day')) {
    return `Yesterday at ${time.format('h:mm A')}`; // e.g., "Yesterday at 4:00 PM"
  } else {
    return time.format('MMM D, YYYY [at] h:mm A'); // e.g., "Mar 20, 2025 at 3:45 PM"
  }
};

// import { headers } from 'next/headers';

export function getBaseUrl() {
  //   const host = headers().get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  //   return `${protocol}://${host}`;
  return `${process.env.NEXT_PUBLIC_APP_URL}`;
}
