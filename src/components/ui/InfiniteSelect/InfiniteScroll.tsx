import { useState, useEffect } from "react";
import ReactSelect from "react-select";

interface props {
  options: any[];
  value: { label: string; value: string } | null;
  onChange: any;
  hasMore?: boolean;
  isPending?: boolean;
  setPage?: (page: number) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
  className?: string;
  optionsClassName?: string;
  optionClassName?: string;
  onSearch?: (query: string) => void;
  onLoadMore?: () => void;
}

const ScrollSelect = ({
  options,
  value,
  onChange,
  hasMore,
  isPending,
  setPage,
  placeholder,
  required = true,
  name,
  className,
  optionsClassName,
  optionClassName,
  onSearch,
  onLoadMore,
}: props) => {
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle search input changes
  const handleInputChange = (newValue: string) => {
    setSearchValue(newValue);
    if (onSearch) {
      onSearch(newValue);
    }
  };

  // Handle scroll events for infinite loading
  const handleScrollToBottom = () => {
    if (hasMore && !isPending && !isLoading && onLoadMore) {
      setIsLoading(true);
      onLoadMore();
    }
  };

  useEffect(() => {
    if (!isPending) {
      setIsLoading(false);
    }
  }, [isPending]);

  return (
    <div>
      <div className={`mt-1 w-full ${className}`}>
        {name && (
          <input
            type="hidden"
            name={name}
            value={value?.value || ''}
          />
        )}
        <ReactSelect
          options={
            options.length > 0
              ? options
              : [{ label: "No data", value: "", isDisabled: true }]
          }
          placeholder={placeholder}
          isSearchable={true}
          value={value}
          onChange={onChange}
          onInputChange={handleInputChange}
          onMenuScrollToBottom={handleScrollToBottom}
          isLoading={isPending || isLoading}
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              borderColor: "#A1A7C4",
              borderRadius: "10px",
              height: "48px",
              background: "transparent"
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999
            })
          }}
          classNames={{
            control: (state) =>
              state.isFocused ? "border-accent_soft_blue" : "border-grey-300",
            menu: () => optionsClassName || "",
            option: () => optionClassName || "",
          }}
          required={required}
        />
      </div>
    </div>
  );
};

export default ScrollSelect;
