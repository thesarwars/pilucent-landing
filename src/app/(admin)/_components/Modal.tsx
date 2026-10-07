import { cn } from '@/lib/utils';
import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiEdit3 } from 'react-icons/fi';
import { RxCross1 } from 'react-icons/rx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  edit?: boolean;
  onEdit?: () => void;
  widthClass?: string;
  zIndex?: string;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  edit = false,
  onEdit,
  widthClass = ' md:w-[700px]',
  zIndex = '',
}: ModalProps) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] h-screen w-screen bg-black bg-opacity-40 transition-opacity duration-500 ${
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      } ${zIndex}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cn(
          `absolute right-0 top-0 z-50 h-screen overflow-hidden overflow-y-auto bg-white p-6 transition-transform duration-500`,
          isOpen ? 'translate-x-0' : 'translate-x-full',
          widthClass
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-medium text-[#131523]">{title}</h2>

          <div className="flex items-center gap-5">
            {edit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 rounded-lg border border-[#7E84A3] px-3 py-2 font-semibold text-[#7E84A3] transition-colors hover:bg-[#7E84A3]/10"
              >
                Edit <FiEdit3 className="text-xl" />
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-full p-1 transition-colors hover:bg-gray-100"
            >
              <RxCross1 className="text-2xl text-black" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.getElementById('modal-root') ?? document.body);
};

export default Modal;
