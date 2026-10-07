import { GetData } from "@/services/FetchMethods";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import TopModal from "./TopModal";
import ProductManager from "@/components/ProductManager/ProductManager";
import { useDebounce } from "use-debounce";
import { toast } from "@/lib/ToastService";

const ProductSelectDropdown = ({
  isStockShown = true,
  row,
  setInvoiceRows,
  handleInvoiceInputChange,
  invoiceRows,
  index,
  handleSelectedProduct,
  view = false,
}: {
  isStockShown?: boolean;
  row: any;
  setInvoiceRows: any;
  handleInvoiceInputChange: any;
  invoiceRows: any;
  index: any;
  handleSelectedProduct: any;
  view?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRefetchAgain, setIsRefetchAgain] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>({});
  const [products, setProducts] = useState<any[]>([]);
  const [searchItem, setSearchItem] = useState<string>("");
  const [uniqueItems, setUniqueItems] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText] = useDebounce(searchItem, 500);
  const [page, setPage] = useState(1);
  const DropDownRef = useRef<any>(null);
  const [productType, setProductType] = useState("");
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["products_list_invoice", searchText, page],
    queryFn: async () => {
      setIsLoading(true);
      const response = await GetData(
        `we/products?page=${page}&status=ACTIVE&search=${searchText}`,
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

  return (
    <>
      <div className="ml-2 w-80">
        <div className="custom-select flex items-center justify-between">
          <input
            type="text"
            placeholder="Select a product.."
            value={row.productService}
            onChange={(e) => {
              !view &&
                handleInvoiceInputChange(
                  index,
                  "productService",
                  selectedProduct?.sku ? selectedProduct?.title : "",
                );
              //   setSearchProducts(e.target.value);
            }}
            onFocus={() => {
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
            className={`w-full border-b-2 bg-transparent px-6 py-2 capitalize outline-none focus:border-accent_text_violet`}
            readOnly={view}
          />

          <IoIosArrowDown
            className={`${row.isPopupOpen ? "rotate-[180deg] text-[#565cfa]" : "rotate-0 text-gray-400"} -translate-x-4 translate-y-1 text-[1.3rem] transition-all duration-300`}
          />
        </div>
        <div className="my-1">
          <input
            type="text"
            className="h-full w-full border-accent_text_violet px-2 outline-none hover:border-b-2 focus:border-b-2"
            value={row.description}
            placeholder="Product Description Here"
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
            className="absolute -left-8 z-20 ml-12 mt-1 w-80 rounded-md border bg-white px-4 py-2 shadow-lg md:left-0"
          >
            <div className="flex flex-col justify-center">
              <button
                onClick={() => {
                  setIsRefetchAgain(false);
                  setIsOpen(true);
                }}
                className="mb-4 py-2 font-medium text-accent_text_violet"
              >
                + Add New
              </button>
              <input
                type="search"
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                placeholder="Search here"
                className="z-50 h-10 w-full flex-1 rounded-md border bg-white px-2 py-2 text-sm outline-none focus:border-accent_text_violet"
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
                      if (Number(product?.quantity || 0) < 1 && isStockShown) {
                        return toast.warning("Product is out of stock");
                      }
                      setSelectedProduct(product);
                      handleClose();
                      handleSelectedProduct(index, product);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className="inline-block text-left text-accent_text_gray">
                        <span className="capitalize">{product.title}</span>
                        <br /> <span className="text-xs">{product.code}</span>
                      </p>

                      <span className="text-xs text-gray-500">
                        {isStockShown
                          ? Number(product?.quantity || 0) < 1
                            ? "Out Of Stock"
                            : `$ ${product?.sale_price}`
                          : `$ ${product?.purchase_price || 0}`}
                      </span>
                    </div>
                  </li>
                ))}
                {(isPending || isLoading) && (
                  <li className="cursor-pointer px-3 py-2 text-center text-sm text-accent_text_violet hover:bg-gray-100">
                    Loading...
                  </li>
                )}
                {!hasMore && (
                  <li className="cursor-pointer px-3 py-2 text-center text-xs text-accent_text_violet hover:bg-gray-100">
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
        title="Product/Service"
        // zIndex="z-[99999]"
        widthClass="w-full md:w-[550px]"
      >
        <ProductManager
          setProductType={setProductType}
          productType={productType}
          onSuccess={(e: any) => {
            setIsRefetchAgain(true);
            setSelectedProduct(e);
            handleClose();
            handleSelectedProduct(index, e);
            setIsOpen(false);
          }}
        />
      </TopModal>
    </>
  );
};

export default ProductSelectDropdown;
