import { useState } from "react";
import TopModal from "./TopModal";
import ProductManager from "@/components/ProductManager/ProductManager";
import InfiniteSelect from "./InfiniteSelect";

const ProductServicesDropdown = ({
  required = true,
  isAddNew = true,
  view = false,
  OnSelect,
  value,
  setValue,
  ClassName = "",
  parentClassName = "",
  filters = {},
  isStockShown = true,
}: {
  required?: boolean;
  isAddNew?: boolean;
  filters?: any;
  OnSelect?: any;
  value: any;
  setValue: any;
  ClassName?: string;
  parentClassName?: string;
  isStockShown?: boolean;
  view?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRefetchAgain, setIsRefetchAgain] = useState(false);
  const [productType, setProductType] = useState("");

  return (
    <>
      <InfiniteSelect
        valueFormatter={(item: any) => item?.title || ""}
        apiEndPoint="/we/products"
        setValue={(e: any) => {
          setValue(e);
        }}
        view={view}
        filters={filters}
        ClassName={ClassName}
        parentClassName={parentClassName}
        value={value}
        formatter={(product: any) => (
          <div className="flex w-full items-center justify-between">
            <p className="inline-block text-left text-accent_text_gray">
              <span className="capitalize">{product?.title}</span>
              <br /> <span className="text-xs">{product?.code}</span>
            </p>

            <span className="text-xs text-gray-500">
              {isStockShown
                ? Number(product?.quantity || 0) < 1 &&
                  product?.kind == "PRODUCT"
                  ? "Out Of Stock"
                  : `$ ${product?.sale_price}`
                : `$ ${product?.purchase_price || 0}`}
            </span>
          </div>
        )}
        required={required}
        isAddNew={isAddNew}
        onAddClick={() => setIsOpen(true)}
        isRefetchAgain={isRefetchAgain}
        setIsRefetchAgain={setIsRefetchAgain}
        onSelect={OnSelect}
        placeholder="Select a product/service"
      />

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
            setValue(e);
            setIsOpen(false);
            setIsRefetchAgain(true);
          }}
        />
      </TopModal>
    </>
  );
};

export default ProductServicesDropdown;
