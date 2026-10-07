import ReactSelect from "react-select";
interface props {
  options: any[];
  value: { label: string; value: string };
  onChange: any;
  hasMore: boolean;
  isPending: boolean;
  setPage: any;
  placeholder: string;
  required ?: boolean;
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
}: props) => {
  return (
    <div>
      <div className="mt-1 w-full">
        <ReactSelect
          options={
            options.length > 0
              ? [...options]
              : [{ label: "No data", value: "" }]
          }
          placeholder={placeholder}
          isSearchable={true}
          value={value}
          onChange={onChange}
          onMenuScrollToBottom={() => {
            if (hasMore) {
              setPage((prev: number) => prev + 1);
            }
          }} // Infinite scroll logic
          isLoading={isPending} // Show loading indicator while fetching
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              borderColor: "#A1A7C4",
              borderRadius: "10px",
              height: "48px",
              background: "transparent"
            }),
          }}
          classNames={{
            control: (state) =>
              state.isFocused ? "border-accent_soft_blue" : "border-grey-300",
          }}
          required={required}
        />
      </div>
    </div>
  );
};

export default ScrollSelect;
