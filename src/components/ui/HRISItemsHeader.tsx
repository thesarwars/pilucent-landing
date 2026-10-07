import { IoSettingsOutline } from "react-icons/io5";
import Search from "./Search";
import { Dispatch, FormEvent, SetStateAction } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { BsPrinter } from "react-icons/bs";
import Button from "./RawButton";

type itemsProps = {
  itemsTitle: string;
  handleSearch: (e: FormEvent<HTMLFormElement>) => void;
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  btnOnclick: () => void;
  btnText: string;
};

const HRISItemsHeader = ({
  itemsTitle,
  handleSearch,
  searchText,
  setSearchText,
  btnOnclick,
  btnText,
}: itemsProps) => {
  return (
    <div className="mt-5 flex items-center justify-between font-lexend">
      <div>
        <h2 className="text-2xl font-semibold text-[#131523]">{itemsTitle}</h2>
      </div>

      <div className="flex items-center gap-4">
        <Search
          onSubmit={handleSearch}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button type="button" className="p-1">
          <IoSettingsOutline className="text-2xl text-[#7E84A3]" />
        </Button>
        <Button type="button" className="p-1">
          <BsPrinter className="text-2xl text-[#7E84A3]" />
        </Button>

        <button
          className="flex items-center gap-1 rounded-lg bg-[#00035F] px-6 py-3 font-medium text-white"
          onClick={btnOnclick}
        >
          {btnText} <IoIosArrowDown className="text-2xl text-white" />
        </button>
      </div>
    </div>
  );
};

export default HRISItemsHeader;
