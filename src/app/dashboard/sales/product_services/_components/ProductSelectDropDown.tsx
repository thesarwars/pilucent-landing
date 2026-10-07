import { handleOpenModalSM } from "@/components/ModalSM/ModalSM";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import GetToken from "@/hooks/getToken";
import { GetData } from "@/services/FetchMethods";
import { useQuery } from "@tanstack/react-query";

interface Product {
  uid: string;
  title: string;
  sku?: string;
}

interface ProductSelectDropDownProps {
  value: { label: string; value: string } | null;
  setValue: (option: { label: string; value: string }) => void;
  placeholder?: string;
}

const ProductSelectDropDown = ({ value, setValue, placeholder = "Select product" }: ProductSelectDropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropDownRef = useRef<any>(null);
  const token = GetToken();

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset products when opening dropdown
  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setProducts([]); // Clear previous products
      setPage(1); // Reset page
      setHasMore(true); // Reset hasMore
      setTimeout(() => {
        refetch(); // Fetch first page
      }, 0);
    }
  };

  // Modify the query function
  const { data, isPending, refetch } = useQuery({
    queryKey: ["products_list", page],
    queryFn: async () => {
      const response = await GetData(`we/products?page=${page}&limit=10`, token);
      if (response.next === null) {
        setHasMore(false);
      }
      if (!response?.detail) {
        if (page === 1) {
          setProducts(response.results); // Replace for first page
        } else {
          setProducts((prev) => [...prev, ...response.results]); // Append for subsequent pages
        }
      }
      setIsLoading(false);
      return response;
    },
    enabled: isOpen, // Only fetch when dropdown is open
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isMounted) {
      refetch();
    } else {
      setIsMounted(true);
    }
  }, [page, isMounted, refetch]);

  const handleSelectProduct = (product: Product) => {
    setValue({ label: product.title, value: product.uid });
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (!newValue) {
      setValue({ label: "", value: "" });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropDownRef} className="custom-select relative flex-1">
      <input
        type="text"
        placeholder={placeholder}
        value={isOpen ? searchTerm : (value?.label || "")}
        onChange={handleInputChange}
        onFocus={() => {
          setSearchTerm(value?.label || "");  // Set search term to current value
        }}
        onClick={handleOpen}  // Toggle dropdown on click
        className="w-full flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue"
      />

      <IoIosArrowDown
        className={`${isOpen ? "rotate-[180deg]" : "rotate-0"} absolute right-3 top-[50%] translate-y-[-50%] transform text-[1.3rem] text-gray-500 transition-all duration-300`}
      />

      {isOpen && (
        <div className="absolute left-0 z-20 mt-1 w-full rounded-md border bg-white px-4 py-2 shadow-lg">
          <div className="space-y-2 overflow-y-auto">
            <ul
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                if (Math.abs(scrollHeight - scrollTop - clientHeight) < 1) {
                  if (hasMore && !isPending && !isLoading) {
                    setIsLoading(true);
                    setPage((prev) => prev + 1);
                  }
                }
              }}
              className={`${
                isOpen ? "z-20 translate-y-0 opacity-100" : "z-[-1] translate-y-[-5px] opacity-0"
              } absolute right-0 flex max-h-80 w-full flex-col overflow-y-auto rounded bg-white py-1 duration-500`}
            >
              {filteredProducts.map((product) => (
                <li
                  key={product.uid}
                  className="flex cursor-pointer items-center justify-between px-3 py-2 text-[#5A607F] hover:bg-gray-100"
                  onClick={() => handleSelectProduct(product)}
                >
                  <span>{product.title}</span>
                  {/* {product.sku && <span className="text-sm text-gray-400">SKU: {product.sku}</span>} */}
                </li>
              ))}
              
              {!filteredProducts.length && (
                <li className="cursor-pointer px-3 py-2 text-center text-accent_soft_blue">
                  No Products Found!
                </li>
              )}
              
              {(isPending || isLoading) && (
                <li className="cursor-pointer px-3 py-2 text-center text-accent_soft_blue hover:bg-gray-100">
                  Loading...
                </li>
              )}
              
              {(!hasMore && filteredProducts.length > 0) && (
                <li className="cursor-pointer px-3 py-2 text-center text-accent_soft_blue hover:bg-gray-100">
                  End Of Data
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelectDropDown;
