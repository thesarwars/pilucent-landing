import Image from "next/image";
import { useState } from "react";
import { BsPrinter } from "react-icons/bs";
import { IoIosArrowDown } from "react-icons/io";
import { RiFileExcel2Line } from "react-icons/ri";

const PdfExcelDropDown = ({
  OnPdfClick,
  OnExcelClick,
}: {
  OnPdfClick: any;
  OnExcelClick: any;
}) => {
  const [isButtonActive, setIsButtonActive] = useState(false);

  const handlePdfClick = () => {
    OnPdfClick();
    setIsButtonActive(false);
  };

  const handleExcelClick = () => {
    OnExcelClick();
    setIsButtonActive(false);
  };

  return (
    <>
      <div className="relative flex items-center justify-between  hover:outline-gray-50 px-5 py-4 rounded-[10px] outline outline-1 outline-offset-[-1px] outline-gray-200">
        <button
          onClick={OnPdfClick}
          className="cursor-pointer transition-all duration-300"
        >
          <Image
            src="/icons/print-v2.svg"
            width={200}
            height={200}
            alt="printer"
            className="mr-1 h-6 w-6 object-contain"
          />
        </button>

        <div
          onClick={() => setIsButtonActive(!isButtonActive)}
          className="cursor-pointer border-l border-l-[#090E4F] pl-1"
        >
          <IoIosArrowDown className="text-base text-[#090E4F]" />
        </div>

        <ul
          className={`${isButtonActive ? "z-20 translate-y-0 border opacity-100" : "z-[-1] translate-y-[-5px] opacity-0"} absolute right-0 top-[46px] flex w-full flex-col rounded bg-white py-1 duration-500`}
        >
          <li
            className="flex cursor-pointer justify-center gap-[5px] rounded-t px-3 py-2 hover:bg-gray-100"
            onClick={handlePdfClick}
          >
            <Image
              src="/icons/print-v2.svg"
              width={200}
              height={200}
              alt="printer"
              className="mr-1 h-6 w-6 object-contain"
            />
          </li>
          <li
            className="flex cursor-pointer justify-center gap-[5px] rounded-t px-3 py-2 hover:bg-gray-100"
            onClick={handleExcelClick}
          >
            <RiFileExcel2Line className="text-xl text-[#090E4F]" />
          </li>
        </ul>
      </div>
    </>
  );
};

export default PdfExcelDropDown;
