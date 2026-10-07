import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import ServiceOptions from "../ServiceOptions/ServiceOptions";
import AddInventoryProduct from "@/app/dashboard/sales/product_services/_components/AddInventoryProduct";
import NonInventoryProduct from "@/app/dashboard/sales/product_services/_components/AddNonInventoryProduct";
import ServiceProduct from "@/app/dashboard/sales/product_services/_components/Service";
import Bundle from "@/app/dashboard/sales/product_services/_components/Bundle";
import { useQuery } from "@tanstack/react-query";
import { GetData, GetProductData } from "@/services/FetchMethods";
import GetToken from "@/hooks/getToken";
import ImageUpload from "@/app/dashboard/sales/product_services/_components/ImageUpload";
import { fetchProduct } from "@/app/helpers/backend";
import MainLoader from "../MainLoader/MainLoader";

interface ProductManagerProps {
  onClose?: () => void;
  productUid?: string;
  onSuccess?: any;
  setProductType?: any;
  productType?: any;
}

const ProductManager = forwardRef(
  (
    {
      onClose = () => {},
      productUid = "",
      onSuccess,
      productType,
      setProductType,
    }: ProductManagerProps,
    ref,
  ) => {
    const [showServiceOptions, setShowServiceOptions] = useState(true);
    const [productData, setProductData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [image, setImage] = useState<any>();

    const resetState = () => {
      setShowServiceOptions(true);
      setProductType && setProductType("");
      setProductData(null);
    };

    useImperativeHandle(ref, () => ({
      resetState,
    }));

    useEffect(() => {
      if (productUid) {
        const fetchProductData = async () => {
          try {
            setIsLoading(true);
            setShowServiceOptions(false);
            const data = await fetchProduct(productUid);
            setProductData(data);
            if (data.kind === "PRODUCT") {
              if (data.is_inventory) {
                setProductType("inventory");
              } else {
                setProductType("non-inventory");
              }
            } else if (data.kind === "SERVICE") {
              setProductType("service");
            }
          } catch (error) {
            //error goes here
          } finally {
            setIsLoading(false);
          }
        };
        fetchProductData();
      } else {
        setProductData(null);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productUid]);

    useEffect(() => {
      return () => {
        resetState();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Data fetching hooks
    const { data: categoryData } = useQuery({
      queryKey: ["categories"],
      queryFn: async () => await GetData("we/categories", ""),
    });

    const { data: brandData } = useQuery({
      queryKey: ["brands"],
      queryFn: async () => await GetData("we/brands", ""),
    });

    const { data: accountData } = useQuery({
      queryKey: ["accounts"],
      queryFn: async () => await GetData("we/chart-of-accounts", ""),
    });

    // const { data: taxData } = useQuery({
    //   queryKey: ["taxes"],
    //   queryFn: async () => await GetData("we/agencies/taxes", ""),

    // });

    const { data: journalData } = useQuery({
      queryKey: ["journals"],
      queryFn: async () => await GetData("we/suppliers", ""),
    });

    const { data: allProductData, refetch } = useQuery({
      queryKey: ["products"],
      queryFn: async () => await GetData("we/products", ""),
    });

    const handleServiceSelect = (type: string) => {
      setShowServiceOptions(false);
      setProductType && setProductType(type);
    };

    if (isLoading) {
      return <MainLoader className="h-[70vh]" color="#9ca3af" />;
    }

    return (
      <>
        <ServiceOptions
          onServiceSelect={handleServiceSelect}
          className={showServiceOptions ? "" : "hidden"}
        />

        <div className={!showServiceOptions ? "" : "hidden"}>
          <div>
            <select
              onChange={(e) => {
                setProductType(e.target.value);
              }}
              value={productType}
              className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] bg-[#E6E9F4] px-6 font-semibold text-[#6A6EF6] outline-none"
              defaultValue="inventory"
              name="product_type"
            >
              <option value="inventory">Inventory</option>
              <option value="non-inventory">Non Inventory</option>
              <option value="service">Service</option>
              <option value="bundle">Bundle</option>
            </select>
          </div>
          <ImageUpload setFile={setImage} initialImageSrc={image} />
        </div>
        <div className={`${productType === "inventory" ? "" : "hidden"}`}>
          <AddInventoryProduct
            setImage={setImage}
            Image={image}
            categoryData={categoryData}
            brandData={brandData}
            onSuccess={onSuccess}
            taxData={[]}
            journalData={journalData}
            refetch={refetch}
            onClose={() => {
              onClose();
              resetState();
            }}
            productData={productData} // Pass productData to AddInventoryProduct
            productUid={productUid} // Pass productUid to AddInventoryProduct
          />
        </div>

        <div className={`${productType === "non-inventory" ? "" : "hidden"}`}>
          <NonInventoryProduct
            setImage={setImage}
            image={image}
            categoryData={categoryData}
            brandData={brandData}
            onSuccess={onSuccess}
            taxData={[]}
            journalData={journalData}
            refetch={refetch}
            onClose={() => {
              onClose();
              resetState();
            }}
            productData={productData} // Pass productData to NonInventoryProduct
            productUid={productUid} // Pass productUid to NonInventoryProduct
          />
        </div>

        <div className={`${productType === "service" ? "" : "hidden"}`}>
          <ServiceProduct
            setImage={setImage}
            image={image}
            categoryData={categoryData}
            brandData={brandData}
            onSuccess={onSuccess}
            taxData={[]}
            journalData={journalData}
            refetch={refetch}
            onClose={() => {
              onClose();
              resetState();
            }}
            productData={productData} // Pass productData to ServiceProduct
            productUid={productUid} // Pass productUid to ServiceProduct
          />
        </div>

        <div className={`${productType === "bundle" ? "" : "hidden"}`}>
          <Bundle
            setImage={setImage}
            image={image}
            categoryData={categoryData}
            brandData={brandData}
            accountData={accountData}
            taxData={[]}
            journalData={journalData}
            productData={allProductData}
            refetch={refetch}
            onClose={() => {
              onClose();
              resetState();
            }}
          />
        </div>
      </>
    );
  },
);

ProductManager.displayName = "ProductManager";

export default ProductManager;
