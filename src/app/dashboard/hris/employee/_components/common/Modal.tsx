import { ReactNode, useEffect } from "react";
import { FiEdit3 } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  edit?: boolean;
  onEdit?: () => void;
  widthClass?: string;
  zIndex?:string
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  edit = false,
  onEdit,
  widthClass = "w-full md:w-[700px]",
  zIndex=''
}: ModalProps) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-[999] bg-black bg-opacity-40 transition-opacity duration-500 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } ${zIndex}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`fixed overflow-hidden right-0 top-0 h-screen z-50 bg-white p-6 overflow-y-auto transition-transform duration-500 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${widthClass}`}
      >
        <div className="flex mb-6 items-center justify-between">
          <h2 className="text-2xl font-semibold text-[#131523]">{title}</h2>

          <div className="flex items-center gap-5">
            {/* {edit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 border border-[#7E84A3] text-[#7E84A3] rounded-lg px-3 py-2 font-semibold hover:bg-[#7E84A3]/10 transition-colors"
              >
                Edit <FiEdit3 className="text-xl" />
              </button>
            )} */}

            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <RxCross1 className="text-2xl text-black" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;