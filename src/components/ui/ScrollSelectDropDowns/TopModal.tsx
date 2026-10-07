import { ReactNode, useEffect } from "react";
import ReactDOM from "react-dom";
import { RxCross1 } from "react-icons/rx";

interface TopModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  zIndex?: number;
  widthClass: string;
}

const TopModal = ({
  isOpen,
  onClose,
  title,
  children,
  zIndex = 90000,
  widthClass,
}: TopModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      style={{ zIndex }}
      className={`fixed inset-0 z-[99999] bg-black bg-opacity-40 transition-opacity duration-500 ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      } ${zIndex}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`fixed right-0 top-0 z-50 h-screen overflow-hidden overflow-y-auto bg-white p-6 transition-transform duration-500 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${widthClass}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#131523]">{title}</h2>

          <div className="flex items-center gap-5">
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
    </div>,
    document.getElementById("modal-root")!,
  );
};

export default TopModal;
