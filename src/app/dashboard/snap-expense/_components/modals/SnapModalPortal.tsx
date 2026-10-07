'use client';

import { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { RxCross1 } from 'react-icons/rx';

type SnapModalPortalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Omit when using custom header via children only */
  title?: string;
  children: ReactNode;
  widthClass?: string;
  classNames?: string;
  disableClose?: boolean;
  /** Hide default title row (use for full custom layouts) */
  hideHeader?: boolean;
};

export function SnapModalPortal({
  isOpen,
  onClose,
  title,
  children,
  widthClass = 'w-full max-w-lg',
  classNames = 'bg-white/95 shadow-xl backdrop-blur-sm',
  disableClose = false,
  hideHeader = false,
}: SnapModalPortalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const modalRoot = typeof document !== 'undefined' ? document.getElementById('modal-root') : null;
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div
      className={`${isOpen ? 'visible' : 'invisible'} fixed inset-0 left-0 top-0 z-[200000000] flex h-screen w-full items-center justify-center bg-black/50 transition-all duration-300`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/40 transition-all duration-300 ${widthClass} ${classNames}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={hideHeader ? 'relative' : undefined}>
          {!hideHeader && (
            <div className="flex items-center justify-between border-b border-white/60 px-6 py-4">
              <h2 className="text-lg font-semibold text-snap_black">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                disabled={disableClose}
                className="rounded-full p-1.5 text-[#6B7280] transition-colors hover:bg-white/80 hover:text-snap_black disabled:opacity-50"
              >
                <RxCross1 className="text-2xl" />
              </button>
            </div>
          )}
          {hideHeader && (
            <button
              type="button"
              onClick={onClose}
              disabled={disableClose}
              className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-[#6B7280] transition-colors hover:bg-white/80 hover:text-snap_black disabled:opacity-50"
            >
              <RxCross1 className="text-2xl" />
            </button>
          )}
          <div className="overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>,
    modalRoot
  );
}
