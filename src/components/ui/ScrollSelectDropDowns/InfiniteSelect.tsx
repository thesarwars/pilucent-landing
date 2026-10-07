import { get } from "@/app/helpers/api";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

const InfiniteSelect = ({
  isAddNew = true,
  ClassName = "",
  parentClassName = "",
  onAddClick,
  apiEndPoint,
  onSelect,
  value,
  setValue,
  filters = {},
  formatter,
  isRefetchAgain = false,
  setIsRefetchAgain,
  valueFormatter,
  placeholder = "Select a Item",
  view = false,
  required = true,
  excludeUids = [],
}: {
  required?: boolean;
  isAddNew?: boolean;
  view?: boolean;
  valueFormatter: any;
  isRefetchAgain?: boolean;
  setIsRefetchAgain?: any;
  formatter: any;
  parentClassName?: string;
  ClassName?: string;
  apiEndPoint: string;
  onAddClick?: any;
  onSelect?: any;
  value: any;
  setValue: any;
  filters?: any;
  placeholder?: string;
  excludeUids?: string[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [uniqueItems, setUniqueItems] = useState<any[]>([]);
  const [searchItem, setSearchItem] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const DropDownRef = useRef<any>(null);
  const [searchText] = useDebounce(searchItem, 500);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [apiEndPoint, page, filters, searchText],
    queryFn: async () => {
      const response = await get(`${apiEndPoint}`, {
        page: page,
        ...filters,
        search: searchText,
      });
      // console.log(response);
      if (response.next == null) {
        setHasMore(false);
      }
      if (!response?.detail) {
        setItems((prev) => [...prev, ...response.results]);
      }
      setIsLoading(false);
      return response;
    },
    refetchOnWindowFocus: false,
    enabled: isOpen,
  });

  useEffect(() => {
    const uniques = removeDuplicatesAndSort(items);
    if (JSON.stringify(uniques) == JSON.stringify(uniqueItems)) return;
    setUniqueItems(uniques);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const removeDuplicatesAndSort = (items: any) => {
    const uniqueItemsMap: any = {};
    items.forEach((item: any) => {
      uniqueItemsMap[item.uid] = item;
    });
    const uniqueItems = Object.values(uniqueItemsMap);
    return uniqueItems;
  };

  const excludeSet = new Set((excludeUids || []).filter(Boolean));
  const visibleItems = excludeSet.size
    ? uniqueItems.filter((item: any) => item?.uid && !excludeSet.has(item.uid))
    : uniqueItems;

  const handleSelectItem = (item: any) => {
    // setSelectedItem(valueFormatter(item));
    setValue(item);
    setSearchItem("");
  };

  // useEffect(() => {
  //   if (value?.uid){
  //     onSelect && onSelect(value);
  //     // setSelectedItem(valueFormatter(value));
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        DropDownRef.current &&
        !DropDownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      setItems([]);
      setHasMore(true);
      setPage(1);
      refetch();
    } else {
      setIsMounted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetchAgain, searchText]);

  return (
    <>
      <div
        ref={DropDownRef}
        className={`relative w-full flex-1 ${parentClassName}`}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={valueFormatter(value)}
          // onChange={(e) => {
          //   // setSearchCustomer(e.target.value);
          //   handleSelectItem(e.target.value);
          // }}
          disabled={view}
          onClick={() => !view && setIsOpen(!isOpen)}
          // onFocus={() => !view && setIsOpen(!isOpen)}
          required={required}
          className={`w-full flex-1 cursor-pointer bg-transparent px-6 py-2 outline-none focus:caret-transparent ${ClassName}`}
        />

        <IoIosArrowDown
          onClick={() => !view && setIsOpen(!isOpen)}
          className={`${isOpen ? "rotate-[180deg]" : "rotate-0"} absolute right-3 top-[50%] translate-y-[-50%] transform text-[1.3rem] text-gray-500 transition-all duration-300`}
        />

        {isOpen && (
          <div className="absolute left-0 z-20 mt-1 w-full rounded-md border bg-white px-4 py-2 shadow-lg">
            <div className="flex flex-col items-center bg-white">
              {onAddClick && isAddNew && (
                <button
                  type="button"
                  onClick={() => {
                    onAddClick();
                    setIsRefetchAgain && setIsRefetchAgain(false);
                  }}
                  className="py-2 text-center font-medium text-accent_soft_blue"
                >
                  + Add New
                </button>
              )}
              <input
                type="search"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                placeholder="Search here"
                className="z-50 h-10 w-full flex-1 rounded-md border bg-white px-2 py-2 text-sm outline-none focus:border-accent_soft_blue"
              />
            </div>

            <div className="h-72 space-y-2 overflow-y-auto">
              <ul
                onScroll={(e) => {
                  const { scrollTop, scrollHeight, clientHeight } =
                    e.currentTarget;
                  if (scrollHeight - scrollTop === clientHeight) {
                    if (hasMore && !isPending && !isLoading) {
                      setIsLoading(true);
                      setPage(page + 1);
                    }
                  }
                }}
                className={`${isOpen ? "z-20 translate-y-0 opacity-100" : "z-[-1] translate-y-[-5px] opacity-0"} absolute right-0 ${!isAddNew ? "top-20" : "top-13"} flex max-h-80 w-full flex-col overflow-y-auto rounded bg-white py-1 duration-500`}
              >
                {visibleItems?.map((item: any, idx: number) => (
                  <li
                    key={idx}
                    className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm text-[#5A607F] hover:bg-gray-100"
                    onClick={() => {
                      handleSelectItem(item);
                      if (onSelect) {
                        onSelect(item);
                      }
                      setIsOpen(false);
                    }}
                  >
                    {formatter(item)}
                  </li>
                ))}
                {!isPending && !visibleItems?.length && (
                  <li className="cursor-pointer px-3 py-2 text-center text-sm text-accent_soft_blue hover:bg-gray-100">
                    No Item Found!
                  </li>
                )}
                {(isPending || isLoading) && (
                  <li className="cursor-pointer px-3 py-2 text-center text-sm text-accent_soft_blue hover:bg-gray-100">
                    Loading...
                  </li>
                )}
                {!hasMore && !(items?.length == 0) && (
                  <li className="cursor-pointer px-3 py-2 text-center text-xs text-accent_soft_blue hover:bg-gray-100">
                    End Of Data
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InfiniteSelect;
