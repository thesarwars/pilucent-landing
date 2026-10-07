import React, { ReactNode, useEffect, useState } from "react";
import ReactDOM from "react-dom";
// react icons
import { RxCross1 } from "react-icons/rx";

const PDFModal = ({
  children,
  isOpen,
  onClose,
  title,
  bgClass = "bg-white",
  isPadding = true,
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose: any;
  title?: any;
  bgClass?: string;
  isPadding?: boolean;
}) => {
  return ReactDOM.createPortal(
    <div
      className={`${
        isOpen ? "visible" : "invisible"
      } fixed left-0 top-0 z-[1000] flex h-screen w-full items-end justify-end transition-all duration-1000`}
    >
      <div
        className={`${
          isOpen ? "translate-y-[0px] opacity-100" : "-translate-y-[100vh]"
        } mx-auto mt-4 h-full w-full overflow-y-scroll ${bgClass} transition-all duration-500`}
      >
        <div
          className={`flex w-full items-end justify-between border-b bg-white p-4 font-lexend`}
        >
          <div></div>
          <div className="text-xl font-medium">{title || ""}</div>
          <RxCross1
            className="cursor-pointer rounded-full p-2 text-[2.5rem] transition-all duration-300 hover:bg-[#e7e7e7]"
            onClick={() => onClose()}
          />
        </div>
        <div className={` ${isPadding ? "p-4" : ""} font-lexend`}>
          {children}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")!,
  );
};

export default PDFModal;
