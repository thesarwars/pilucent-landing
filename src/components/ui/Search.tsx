import { cn } from "@/lib/utils";
import { ChangeEvent, FormEvent } from "react";
import { FiSearch } from "react-icons/fi";

type props = {
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  value?: string;
  className?: string;
  width?: number;
};

const Search = ({ onChange, onSubmit, value, className }: props) => {
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "flex h-12 w-96 max-w-96 items-center rounded-3xl border border-[#D7DBEC] px-6 py-3",
        className,
      )}
    >
      <input
        onChange={onChange}
        value={value}
        placeholder="Search"
        type="text"
        className="h-full flex-1 bg-transparent text-lg outline-none placeholder:text-[#A1A7C4]"
      />
      <button type="submit">
        <FiSearch className="text-3xl text-[#A1A7C4]" />
      </button>
    </form>
  );
};

export default Search;
