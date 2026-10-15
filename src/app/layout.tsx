/* eslint-disable @next/next/no-sync-scripts */
'use client';
import './globals.css';
import QueryClientProviderWrapper from '@/components/Global/TanstackQuery';
import ReduxProvider from './redux/ReduxProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { ToastProvider } from '@/components/Toast/ToastProvider';
import { ToastContainer as ToastifyContainer } from 'react-toastify';
import { ToastContainer } from '@/components/Toast/ToastContainer';
import { Inter, JetBrains_Mono, Lexend, Noto_Sans_Bengali, Plus_Jakarta_Sans } from 'next/font/google';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';

// export const metadata: Metadata = {
//   title: 'Pilucent',
//   description: 'Pilucent Accounting',
// };

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

// Violet Suite design system font. Exposed as the --font-jakarta CSS var and
// consumed via the Tailwind `font-jakarta` class. Additive only — does not
// change the app's default font.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

// Bangla text (any element with lang="bn", see globals.css) and the rail's
// monospace tags. Exposed as CSS vars only — nothing changes until used.
const bengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  variable: '--font-bengali',
  weight: ['400', '500', '600', '700'],
});
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jbmono',
  weight: ['400', '500', '600', '700'],
});

const useSecurePage = () => {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase();
      const ctrl = e.ctrlKey;
      const meta = e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      const isF12 = key === 'f12';
      const isInspect = (ctrl || meta) && shift && (key === 'i' || key === 'j' || key === 'c');
      const isMacInspect =
        meta && alt && (key === 'i' || key === 'j' || key === 'c' || key === 'u');
      const isViewSource = (ctrl || meta) && key === 'u';
      const isSavePage = (ctrl || meta) && key === 's';
      const isPrint = (ctrl || meta) && key === 'p';

      if (isF12 || isInspect || isMacInspect || isViewSource || isSavePage || isPrint) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleSelectStart = (e: Event) => e.preventDefault();
    const handleDragStart = (e: Event) => e.preventDefault();
    const handleCopy = (e: Event) => e.preventDefault();

    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('selectstart', handleSelectStart, true);
    window.addEventListener('dragstart', handleDragStart, true);
    window.addEventListener('copy', handleCopy, true);

    let detector: number | null = null;
    const threshold = 160;
    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > threshold || heightDiff > threshold) {
        setBlocked(true);
      } else {
        setBlocked(false);
      }
    };
    detector = window.setInterval(checkDevTools, 800);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('selectstart', handleSelectStart, true);
      window.removeEventListener('dragstart', handleDragStart, true);
      window.removeEventListener('copy', handleCopy, true);
      if (detector) window.clearInterval(detector);
    };
  }, []);

  return blocked;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const blocked = useHardenPage();

  useEffect(() => {
    document.title = 'Pilucent';
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', 'Pilucent Accounting');
  }, []);

  return (
    <html lang="en" data-theme="light">
      <head>
        <script src="https://js.moov.io/v1"></script>
      </head>
      <body className={`${lexend.variable} ${inter.variable} ${jakarta.variable} ${bengali.variable} ${mono.variable} antialiased`}>
        {/* {blocked ? (
          <div className="flex h-screen w-full items-center justify-center bg-black text-center text-white">
            <div>
              <h1 className="text-2xl font-semibold">Access blocked</h1>
              <p className="mt-2 text-sm text-gray-300">
                Please close developer tools to continue viewing this page.
              </p>
            </div>
          </div>
        ) : ( */}
        <div id="root" className="font-inter">
          <div id="modal-root" />
          <div id="toast-root" />
          <div id="popup-root" />
          <div id="select-root" />

          <ToastContainer position="top-center" />

          <ToastProvider>
            <ReduxProvider>
              <QueryClientProviderWrapper>{children}</QueryClientProviderWrapper>
            </ReduxProvider>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
