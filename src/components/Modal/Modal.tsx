import { ReactNode } from "react";
import { FiEdit3 } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";

export const handleOpenModal = () => {
  const popupContainer = document.querySelector(".popup022");
  const modal_container = document.querySelector(".modal_container022");

  if (popupContainer) {
    modal_container?.classList.remove("invisible");
    popupContainer.classList.remove("translate-x-[700px]");
    popupContainer.classList.add("translate-x-0");
  }
};
export const CloseModal=()=>{
  const popupContainer = document.querySelector(".popup022");
  const modal_container =
    document.querySelector(".modal_container022");
  if (popupContainer) {
    popupContainer.classList.remove("translate-x-0");
    popupContainer.classList.add("translate-x-[700px]");
    setTimeout(() => {
      modal_container?.classList.add("invisible");
    }, 400);
  }

}
const Modal = ({
  children,
  title,
  edit = false,
}: {
  children: ReactNode;
  title: string;
  edit?: boolean;
}) => {
  return (
    <div className="modal_container022 z-[999] font-lexend absolute top-0 left-0 right-0 bottom-0 h-screen w-screen  bg-black bg-opacity-40 flex justify-end overflow-hidden invisible transition duration-500">
      <div
        className={`popup022 fixed h-screen z-50 w-full md:w-[700px] bg-white p-6  top-0 right-0 translate-x-[700px] overflow-y-auto transition duration-500 font-lexend`}
      >
        <div className="flex mb-6 items-center justify-between">
          {title && (
            <h2 className="text-2xl font-semibold text-[#131523]">{title}</h2>
          )}

          <div className="flex items-center gap-5">
            {edit && (
              <button className="flex items-center gap-1 border border-[#7E84A3] text-[#7E84A3] rounded-lg px-3 py-2 font-semibold">
                Edit <FiEdit3 className=" text-xl text-[#7E84A3]" />
              </button>
            )}

            <button
              className="text-lg  p-1 "
              onClick={() => {
                const popupContainer = document.querySelector(".popup022");
                const modal_container =
                  document.querySelector(".modal_container022");

                if (popupContainer) {
                  popupContainer.classList.remove("translate-x-0");
                  popupContainer.classList.add("translate-x-[700px]");
                  setTimeout(() => {
                    modal_container?.classList.add("invisible");
                  }, 400);
                }
              }}
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
