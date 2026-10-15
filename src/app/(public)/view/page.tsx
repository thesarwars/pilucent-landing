'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const useHardenPage = () => {
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

const PageContent = () => {
  const params = useSearchParams();
  const baseType = params.get('base_type');
  const baseURL =
    baseType === 's3'
      ? 'https://balanzify-s3-511590151275-us-east-2-an.s3.us-east-2.amazonaws.com'
      : baseType == 'api'
        ? 'https://balanzifyapi.jumatechs.xyz'
        : baseType == 'external'
          ? ''
          : 'https://balanzify-s3-511590151275-us-east-2-an.s3.us-east-2.amazonaws.com';
  const href = params.get('href');
  if (!href) {
    return <div className="text-accent_primary">No href provided</div>;
  }

  return (
    <iframe
      className="h-screen w-full"
      src={`${baseURL}${href?.startsWith('/') ? href : `/${href}`}`}
      width="100%"
      height="100%"
    />
  );
};

const Page = () => {
  const blocked = useHardenPage();

  return (
    <div
      className="min-h-screen w-full select-none"
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {blocked ? (
        <div className="flex h-screen w-full items-center justify-center bg-black text-center text-white">
          <div>
            <h1 className="text-2xl font-semibold">Access blocked</h1>
            <p className="mt-2 text-sm text-gray-300">
              Please close developer tools to continue viewing this page.
            </p>
          </div>
        </div>
      ) : (
        <Suspense fallback={<div className="text-accent_primary">Loading...</div>}>
          <div>
            <h1 className="bg-accent_soft_black py-1 text-center text-sm font-light text-white">
              Pilucent Accounting
            </h1>
          </div>
          <PageContent />
        </Suspense>
      )}
    </div>
  );
};

export default Page;
