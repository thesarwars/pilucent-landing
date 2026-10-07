import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import { GetData } from "@/services/FetchMethods";
import GetToken from "@/hooks/getToken";

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

const ProductSelectDropDown2 = ({ value, setValue, placeholder = "Select product" }: ProductSelectDropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const dropDownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const token = GetToken();

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  // Reset products when opening dropdown
  const handleOpen = () => {
    if (!isOpen) {
      updateDropdownPosition();
      setProducts([]); // Clear previous products
      setPage(1); // Reset page
      setHasMore(true); // Reset hasMore
      setTimeout(() => {
        refetch(); // Fetch first page
      }, 0);
    }
    setIsOpen(!isOpen);
  };

  const { data, isPending, refetch } = useQuery({
    queryKey: ["products_list", page],
    queryFn: async () => {
      const response = await GetData(`we/products?page=${page}&limit=10`, token);
      if (response.next === null) {
        setHasMore(false);
      }
      if (!response?.detail) {
        if (page === 1) {
          setProducts(response.results);
        } else {
          setProducts((prev) => [...prev, ...response.results]);
        }
      }
      setIsLoading(false);
      return response;
    },
    enabled: isOpen,
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

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropDownRef} className="custom-select relative flex-1" style={{ position: 'static' }}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={isOpen ? searchTerm : (value?.label || "")}
        onChange={handleInputChange}
        onFocus={() => {
          setSearchTerm(value?.label || "");
        }}
        onClick={handleOpen}
        className="w-full flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue"
      />

      <IoIosArrowDown
        className={`${
          isOpen ? "rotate-[180deg]" : "rotate-0"
        } absolute right-3 top-[50%] translate-y-[-50%] transform text-[1.3rem] text-gray-500 transition-all duration-300`}
      />

      {isOpen && (
        <div
          className="fixed z-[9999] rounded-md border bg-white px-4 py-2 shadow-lg"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          <div className="space-y-2">
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
              className="max-h-80 w-full overflow-y-auto rounded bg-white py-1"
            >
              {filteredProducts.map((product) => (
                <li
                  key={product.uid}
                  className="flex cursor-pointer items-center justify-between px-3 py-2 text-[#5A607F] hover:bg-gray-100"
                  onClick={() => handleSelectProduct(product)}
                >
                  <span>{product.title}</span>
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

              {!hasMore && filteredProducts.length > 0 && (
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

export default ProductSelectDropDown2;