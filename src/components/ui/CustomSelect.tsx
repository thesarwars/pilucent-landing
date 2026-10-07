import React, { useEffect, useState, useMemo } from "react";
import ReactSelect, { components } from "react-select";
import { FaPlus } from "react-icons/fa";
import { FetchData } from "@/services/company";
import { useQuery } from "@tanstack/react-query";

// Types for props
interface DynamicOptionsProps {
  endpoint: string;
  token: string;
  itemsPerPage: number;
}

interface CustomReactSelectProps {
  endpoint: string;
  token: string;
  itemsPerPage?: number;
  placeholder?: string;
  includeAddNew?: boolean;
  customComponents?: Record<string, any>;
  onAddNewClick?: () => void;
  defaultValue?: { label: string; value: string } | null;
  width?: string;
  name?:string;
  borderColor?: string; // New Prop
  borderRadius?: string; // New Prop
  controlHeight?: string; // New Prop
}

// Custom hook to fetch and manage options dynamically
const useDynamicOptions = ({
  endpoint,
  token,
  itemsPerPage,
}: DynamicOptionsProps) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { isLoading, data, isFetching, refetch, isError, error } = useQuery({
    queryKey: [endpoint, pageNumber],
    queryFn: () => FetchData(endpoint, token, pageNumber),
  });

  useEffect(() => {
    if (data) {
      const newOptions = data.results.map((item: { uid: string; title: string }) => ({
        label: item.title,
        value: item.uid,
      }));

      setOptions((prevOptions) => [...prevOptions, ...newOptions]);

      const totalPages = Math.ceil(data.count / itemsPerPage);
      if (pageNumber >= totalPages) {
        setHasMore(false);
      }
    }
  }, [data, pageNumber, itemsPerPage]);

  const handleMenuScrollToBottom = () => {
    if (hasMore && !isLoading && !isFetching) {
      setPageNumber((prevPage) => prevPage + 1);
    }
  };

  return {
    options,
    isLoading,
    isFetching,
    handleMenuScrollToBottom,
    refetch,
    isError,
    error,
  };
};

// Add New Option Component
const AddNewOption: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div
    className="flex w-full cursor-pointer items-center p-2 text-center text-blue-500 hover:bg-blue-100"
    onClick={onClick}
  >
    <FaPlus className="mr-2" />
    Add New
  </div>
);

// Custom ReactSelect Component
const CustomReactSelect: React.FC<CustomReactSelectProps> = ({
  endpoint,
  token,
  itemsPerPage = 10,
  placeholder = "Select an Option",
  includeAddNew = false,
  customComponents = {},
  onAddNewClick,
  defaultValue = null,
  name, // Add name prop
  width = "w-full", // Default width
  controlHeight,
  borderRadius,
  borderColor
}) => {
  const { options, isLoading, isFetching, handleMenuScrollToBottom, isError, error } =
    useDynamicOptions({ endpoint, token, itemsPerPage });

  // Extend default customComponents with "Add New" logic if enabled
  const finalComponents = useMemo(() => {
    if (includeAddNew) {
      return {
        ...customComponents,
        Option: (props: any) => {
          if (props.data.value === "addNew") {
            return <AddNewOption onClick={onAddNewClick!} />;
          }
          return components.Option ? <components.Option {...props} /> : null;
        },
      };
    }
    return customComponents;
  }, [includeAddNew, customComponents, onAddNewClick]);

  const optionsWithAddNew = useMemo(
    () =>
      includeAddNew ? [{ value: "addNew", label: "Add New" }, ...options] : options,
    [includeAddNew, options]
  );

  // Custom Styles
  const customStyles = useMemo(
    () => ({
      control: (baseStyles: any) => ({
        ...baseStyles,
        borderColor: borderColor || "#D2D4D7", // Use the passed prop or default
        borderRadius: borderRadius || "10px", // Use the passed prop or default
        height: controlHeight || "42px", // Use the passed prop or default
      }),
    }),
    [borderColor, borderRadius, controlHeight] // Memoize when these change
  );
  

  return (
    <div className="w-full" style={{ width }}>
      {isError && <div className="text-red-500">Error fetching data</div>}
      <ReactSelect
      name={name}
        options={
          optionsWithAddNew.length > 0
            ? optionsWithAddNew
            : [{ label: "No data", value: "" }]
        }
        defaultValue={defaultValue}
        placeholder={placeholder}
        isSearchable
        onMenuScrollToBottom={handleMenuScrollToBottom}
        isLoading={isLoading || isFetching}
        styles={customStyles}
        components={finalComponents}
      />
    </div>
  );
};

export default CustomReactSelect;
