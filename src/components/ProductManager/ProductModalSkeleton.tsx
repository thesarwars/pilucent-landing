import { ReactNode } from "react";
import { FiEdit3 } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";

export const handleOpenProductModal = () => {
  const popupContainer = document.querySelector(".product_popup");
  const modal_container = document.querySelector(".product_modal_container");

  if (popupContainer) {
    modal_container?.classList.remove("invisible");
    popupContainer.classList.remove("translate-x-[550px]");
    popupContainer.classList.add("translate-x-0");
  }
};
export const handleCloseProductModal = () => {
  const popupContainer = document.querySelector(".product_popup");
  const modal_container = document.querySelector(".product_modal_container");

  if (popupContainer) {
    popupContainer.classList.remove("translate-x-0");
    popupContainer.classList.add("translate-x-[550px]");
    setTimeout(() => {
      modal_container?.classList.add("invisible");
    }, 400);
  }
};

const ProductModalSkeleton = ({
  children,
  title,
  w,
  edit = false,
}: {
  children: ReactNode;
  title: string | null;
  edit?: boolean;
  w?: string;
}) => {
  return (
    <div className="product_modal_container z-[999] invisible absolute bottom-0 left-0 right-0 top-0 flex h-screen w-screen justify-end overflow-hidden bg-black bg-opacity-40 font-lexend transition duration-500">
      <div
        className={`product_popup fixed right-0 top-0 z-50 h-screen md:w-[550px] max-md:w-full translate-x-[550px] overflow-y-auto bg-white p-6 font-lexend transition duration-500`}
      >
        <div className="mb-6 flex items-center justify-between">
          {title && (
            <h2 className="text-2xl font-semibold text-[#131523]">{title}</h2>
          )}

          <div className="flex items-center gap-5">
            {edit && (
              <button className="flex items-center gap-1 rounded-lg border border-[#7E84A3] px-3 py-2 font-semibold text-[#7E84A3]">
                Edit <FiEdit3 className="text-xl text-[#7E84A3]" />
              </button>
            )}

            <button className="p-1 text-lg" onClick={handleCloseProductModal}>
              <RxCross1 className="text-2xl text-black" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ProductModalSkeleton;
