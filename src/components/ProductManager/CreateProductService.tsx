import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

interface ProductManagerProps {
  onClose?: () => void;
  productUid?: string;
}

const CreateProductAndService = forwardRef(
  ({ onClose = () => {}, productUid = "" }: ProductManagerProps, ref) => {
    // const [showServiceOptions, setShowServiceOptions] = useState(true);
    // const [productType, setProductType] = useState("");
    // const [productData, setProductData] = useState(null);
    // const [image, setImage] = useState<any>();
    // const token = GetToken();

    // const resetState = () => {
    //   setShowServiceOptions(true);
    //   setProductType("");
    //   setProductData(null);
    // };

    // useImperativeHandle(ref, () => ({
    //   resetState,
    // }));

    // useEffect(() => {
    //   if (productUid) {
    //     const fetchProductData = async () => {
    //       const data = await GetProductData(productUid, token);
    //       console.log(data);
    //       setProductData(data);
    //       if (data.kind === "PRODUCT") {
    //         if (data.is_inventory) {
    //           setProductType("inventory");
    //         } else {
    //           setProductType("non-inventory");
    //         }
    //       } else if (data.kind === "SERVICE") {
    //         setProductType("service");
    //       }
    //       setShowServiceOptions(false);
    //     };
    //     fetchProductData();
    //   }
    // }, [productUid, token]);

    // useEffect(() => {
    //   return () => {
    //     resetState();
    //   };
    // }, []);

    // // Data fetching hooks
    // const { data: categoryData } = useQuery({
    //   queryKey: ["categories"],
    //   queryFn: async () => await GetData("we/categories", token),
 
    // });

    // const { data: brandData } = useQuery({
    //   queryKey: ["brands"],
    //   queryFn: async () => await GetData("we/brands", token),

    // });

    // const { data: accountData } = useQuery({
    //   queryKey: ["accounts"],
    //   queryFn: async () => await GetData("we/chart-of-accounts", token),

    // });

    // const { data: taxData } = useQuery({
    //   queryKey: ["taxes"],
    //   queryFn: async () => await GetData("we/agencies/taxes", token),

    // });

    // const { data: journalData } = useQuery({
    //   queryKey: ["journals"],
    //   queryFn: async () => await GetData("we/suppliers", token),

    // });

    // const { data: allProductData, refetch } = useQuery({
    //   queryKey: ["products"],
    //   queryFn: async () => await GetData("we/products", token),

    // });

    // const handleServiceSelect = (type: string) => {
    //   setShowServiceOptions(false);
    //   setProductType(type);
      
    // };


    return (
      <>
        {/* <ServiceOptions
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
            accountData={accountData}
            taxData={taxData}
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
            accountData={accountData}
            taxData={taxData}
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
            accountData={accountData}
            taxData={taxData}
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
            taxData={taxData}
            journalData={journalData}
            productData={allProductData}
            refetch={refetch}
            onClose={() => {
              onClose();
              resetState();
            }}
          />
        </div> */}
      </>
    );
  },
);

CreateProductAndService.displayName = "ProductManager";

export default CreateProductAndService;
