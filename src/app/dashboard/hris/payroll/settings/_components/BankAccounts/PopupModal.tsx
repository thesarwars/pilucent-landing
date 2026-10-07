import { ReactNode, useEffect } from "react";
import { FiEdit3 } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: any;
  children: ReactNode;
  edit?: boolean;
  onEdit?: () => void;
  widthClass?: string;
  zIndex?: string;
  classNames?: string;
}

const RootPopup = ({
  isOpen,
  onClose,
  title,
  children,
  edit = false,
  onEdit,
  widthClass = "w-full md:w-[700px]",
  classNames = "bg-white",
  zIndex = "",
}: ModalProps) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  return ReactDOM.createPortal(
    <div
      className={`${
        isOpen ? "visible" : "invisible"
      } fixed inset-0 left-0 top-0 z-[200000000] flex h-screen w-full items-center justify-center bg-[#0000002a] bg-opacity-40 transition-all duration-300 dark:bg-black/40 ${zIndex}`}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className={` ${
          isOpen ? "scale-[1] opacity-100" : "scale-[0] opacity-0"
        } fixed left-[50%] z-50 w-[90%] -translate-x-[50%] overflow-hidden overflow-y-auto rounded-lg p-4 px-4 transition-all duration-500 sm:w-[80%] md:w-[50%] lg:w-[40%] xl:w-[30%] ${widthClass} ${classNames}`}
      >
        <div className="mb-6 flex items-center justify-between px-2 pt-2">
          {title && (
            <h2 className="text-2xl font-medium text-[#131523]">{title}</h2>
          )}

          <div className="flex items-center gap-5">
            {edit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 rounded-lg border border-[#7E84A3] px-3 py-2 font-semibold text-[#7E84A3] transition-colors hover:bg-[#7E84A3]/10"
              >
                Edit <FiEdit3 className="text-xl" />
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="rounded-full p-1 transition-colors hover:bg-gray-100"
              >
                <RxCross1 className="text-2xl text-black" />
              </button>
            )}
          </div>
        </div>
        <div className="overflow-y-auto px-2">{children}</div>
      </div>
    </div>,
    document.getElementById("modal-root")!,
  );
};

export default RootPopup;
