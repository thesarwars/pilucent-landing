import { MouseEvent, useEffect, useRef, useState } from "react";
import { CustomDropdownProps } from "./types";
import { FiChevronDown } from "react-icons/fi";

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  borderColor = "border-gray-300",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<any>(value || "");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent<Document>) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside as any);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as any);
    };
  }, []);

  const handleSelect = (option: string): void => {
    setSelectedValue(option);
    onChange?.(option);
    setIsOpen(false);
  };

  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`flex items-center justify-between p-2 ${borderColor} cursor-pointer rounded border bg-white`}
        onClick={toggleDropdown}
      >
        <span
          className={`${!selectedValue ? "text-gray-500" : "text-gray-900"}`}
        >
          {selectedValue?.title || placeholder}
        </span>
        <FiChevronDown
          className={`transition-transform duration-200 ${isOpen ? "rotate-180 transform" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow-lg">
          {options.map((option: any, index: number) => (
            <div
              key={index}
              className="cursor-pointer p-2 hover:bg-gray-100"
              onClick={() => handleSelect(option)}
            >
              {option?.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default CustomDropdown;