import React, { ReactNode, useEffect, useState } from "react";
import ReactDOM from "react-dom";
// react icons
import { RxCross1 } from "react-icons/rx";
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";

const PermissionsPopup = ({
  isOpen = false,
  setIsOpen,
  children,
}: {
  isOpen: any;
  setIsOpen: any;
  children: any;
}) => {
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "auto";
//     }
//   }, [isOpen]);

//   if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className={`${
        isOpen ? "visible" : "invisible"
      } fixed left-0 top-0 z-[200000000] flex h-full w-full items-center justify-center bg-[#0000002a] transition-all duration-300`}
    >
      <div
        className={`${
          isOpen ? "scale-[1] opacity-100" : "scale-[0] opacity-0"
        } w-full h-full overflow-y-scroll max-h-[100vh]  rounded-lg bg-[#fff] p-4 transition-all duration-300 `}
      >
        <div className="flex w-full items-end justify-end">
          <RxCross1
            className="cursor-pointer rounded-full p-2 text-[2.5rem] transition-all duration-300 hover:bg-[#e7e7e7]"
            onClick={() => setIsOpen(false)}
          />
        </div>

        <div className="flex w-full flex-col items-center justify-center">
         {children}
        </div>
      </div>
    </div>,
    document.getElementById("popup-root")!,
  );
};

export default PermissionsPopup;
