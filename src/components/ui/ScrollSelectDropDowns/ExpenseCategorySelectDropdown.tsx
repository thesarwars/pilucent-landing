import { handleOpenModalSM } from "@/components/ModalSM/ModalSM";
import GetToken from "@/hooks/getToken";
import { GetData } from "@/services/FetchMethods";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import TopModal from "./TopModal";
import AddAccountForm from "@/app/dashboard/transactions/coa_tree/_components/AddAccountForm";
import { useDebounce } from "use-debounce";

const ExpenseCategorySelectDropdown = ({
  view = false,
  row,
  setInvoiceRows,
  handleInvoiceInputChange,
  invoiceRows,
  index,
  handleSelectedProduct,
}: {
  view?: boolean;
  row: any;
  setInvoiceRows: any;
  handleInvoiceInputChange: any;
  invoiceRows: any;
  index: any;
  handleSelectedProduct: any;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<any>({});
  const [products, setProducts] = useState<any[]>([]);
  const [isRefetchAgain, setIsRefetchAgain] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchItem, setSearchItem] = useState<string>("");
  const [uniqueItems, setUniqueItems] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const DropDownRef = useRef<any>(null);
  const [searchText] = useDebounce(searchItem, 500);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["categories_list_expense", searchText, page],
    queryFn: async () => {
      setIsLoading(true);
      const response = await GetData(
        `we/chart-of-accounts?page=${page}&status=ACTIVE&search=${searchText}`,
        "",
      );
      if (response.next == null) {
        setHasMore(false);
      }
      if (!response?.detail) {
        setProducts((prev) => [...prev, ...response.results]);
      }
      setIsLoading(false);
      return response;
    },

    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const uniques = removeDuplicatesAndSort(products);
    if (JSON.stringify(uniques) == JSON.stringify(uniqueItems)) return;
    setUniqueItems(uniques);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const removeDuplicatesAndSort = (items: any) => {
    const uniqueItemsMap: any = {};
    items.forEach((item: any) => {
      uniqueItemsMap[item.uid] = item;
    });
    const uniqueItems = Object.values(uniqueItemsMap);
    return uniqueItems;
  };

  useEffect(() => {
    if (isMounted) {
      setProducts([]);
      setHasMore(true);
      setPage(1);
      refetch();
    } else {
      setIsMounted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetchAgain, searchText]);

  const handleClose = () => {
    const updatedRows = invoiceRows.map((row: any, rowIndex: any) => {
      if (rowIndex === index) {
        row.isPopupOpen = false;
        // console.log(true);
      }
      return row;
    });

    setInvoiceRows(updatedRows);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        DropDownRef.current &&
        !DropDownRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // console.log(selectedProduct);
  return (
    <>
      <div className="ml-2 w-80">
        <div className="custom-select flex items-center justify-between">
          <input
            type="text"
            placeholder="Select a Category.."
            value={row.category}
            onChange={(e) => {
              !view &&
                handleInvoiceInputChange(
                  index,
                  "category",
                  selectedProduct?.sku ? selectedProduct?.title : "",
                );
              //   setSearchProducts(e.target.value);
            }}
            onFocus={() => {
              setSearchItem("");
              const updatedRows = invoiceRows.map((row: any, rowIndex: any) => {
                if (rowIndex === index) {
                  row.isPopupOpen = !row.isPopupOpen;
                  // console.log(true);
                } else {
                  row.isPopupOpen = false;
                  // console.log(false);
                }
                return row;
              });
              !view && setInvoiceRows(updatedRows);
            }}
            className={`w-full border-b-2 bg-transparent px-6 py-2 capitalize outline-none focus:border-accent_soft_blue`}
            readOnly={view}
          />

          <IoIosArrowDown
            className={`${row.isPopupOpen ? "rotate-[180deg] text-[#565cfa]" : "rotate-0 text-gray-400"} -translate-x-4 translate-y-1 text-[1.3rem] transition-all duration-300`}
          />
        </div>
        <div className="my-1">
          <input
            type="text"
            className="h-full w-full border-accent_soft_blue px-2 outline-none hover:border-b-2 focus:border-b-2"
            value={row.description}
            placeholder="Description Here"
            onChange={(e) =>
              !view &&
              handleInvoiceInputChange(index, "description", e.target.value)
            }
            readOnly={view}
          />
        </div>
        {row.isPopupOpen && (
          <div
            ref={DropDownRef}
            className="absolute left-0 z-20 ml-16 mt-1 w-80 rounded-md border bg-white px-4 py-2 shadow-lg"
          >
            <div className="flex flex-col justify-center">
              <button
                onClick={() => {
                  setIsRefetchAgain(false);
                  setIsOpen(true);
                }}
                className="mb-4 py-2 font-medium text-accent_soft_blue"
              >
                + Add New
              </button>
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
                    // console.log(scrollHeight, scrollTop, clientHeight);
                    // console.log("object", hasMore);
                    if (hasMore && !isPending && !isLoading) {
                      setIsLoading(true);
                      setPage(page + 1);
                    }
                  }
                }}
                className={`${row.isOpen ? "translate-y-0 opacity-100" : "translate-y-[-5px]"} flex h-full w-full flex-col overflow-y-auto rounded py-1 duration-500`}
              >
                {uniqueItems?.map((product: any, idx: number) => (
                  <li
                    key={idx}
                    className="cursor-pointer items-center px-3 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setSelectedProduct(product);
                      handleClose();
                      handleSelectedProduct(index, product);
                    }}
                  >
                    <p className="gap flex w-full items-center flex-wrap justify-between">
                      <span>{product?.title || ""}</span>{" "}
                      <span className="text-right text-xs">
                        {" "}
                        {product?.account_type?.title || ""}
                      </span>
                    </p>
                  </li>
                ))}
                {(isPending || isLoading) && (
                  <li className="cursor-pointer px-3 py-2 text-center text-sm text-accent_soft_blue hover:bg-gray-100">
                    Loading...
                  </li>
                )}
                {!hasMore && (
                  <li className="cursor-pointer px-3 py-2 text-center text-xs text-accent_soft_blue hover:bg-gray-100">
                    End Of Data
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
      <TopModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Chart Of Account"
        // zIndex="z-[99999]"
        widthClass="w-full md:w-[550px]"
      >
        <AddAccountForm
          setIsOpen={setIsOpen}
          onSuccess={(e: any) => {
            handleSelectedProduct(index, e);
            setSelectedProduct(e);
            setIsRefetchAgain(true);
            handleClose();
            setIsOpen(false);
          }}
        />
      </TopModal>
    </>
  );
};

export default ExpenseCategorySelectDropdown;
