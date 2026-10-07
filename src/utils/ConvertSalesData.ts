export const convertBackendToFrontendData = (
  SalesItems: any,
  SalesData: any,
) => {
  const array: any = [];
  SalesItems?.map((data: any) => {
    if (data?.section || data?.note) {
      data?.section &&
        array.push({
          type: "section",
          uid: "",
          product_uid: "",
          product_service: "",
          description: data.section,
          qty: 0,
          price: 0,
          amount: 0,
        });
      data?.note &&
        array.push({
          type: "note",
          uid: data?.uid,
          product_uid: "",
          product_service: "",
          description: data.note,
          qty: 0,
          price: 0,
          amount: 0,
        });
      array.push({
        type: "product",
        uid: data?.uid,
        product_service: data.product,
        description: data?.description,
        qty: data?.quantity,
        price: data?.sale_price,
        amount: data?.total,
        is_tax: data?.tax?.uid ? true : false,
      });
    } else {
      array.push({
        type: "product",
        uid: data?.uid,
        product_service: data.product,
        description: data?.description,
        qty: data?.quantity,
        price: data?.sale_price,
        amount: data?.total,
        is_tax: data?.tax?.uid ? true : false,
      });
    }
  });
  return array;
};
export const convertSaleCreditToFrontendData = (
  SalesItems: any,
  SalesData: any,
) => {
  const array: any = [];
  SalesItems?.map((data: any) => {
    if (data?.section || data?.note) {
      data?.section &&
        array.push({
          type: "section",
          uid: "",
          product_uid: "",
          mainPrice: 0,
          productService: "",
          description: data.section,
          qty: 0,
          price: 0,
          amount: 0,
          tax: 0,
          productTaxRate: 0,
          productTaxType: "",
          productCode: 0,
          isPopupOpen: false,
        });
      data?.note &&
        array.push({
          type: "note",
          uid: data?.uid,
          product_uid: "",
          mainPrice: 0,
          productService: "",
          description: data.note,
          qty: 0,
          price: 0,
          amount: 0,
          tax: 0,
          productTaxRate: 0,
          productTaxType: "",
          productCode: 0,
          isPopupOpen: false,
        });
      array.push({
        type: "product",
        uid: data?.uid,
        product_uid: data?.product?.uid,
        product_service: data.product, // Pass the full product object like in estimates
        mainPrice: data?.item_credit,
        productService: data.product?.title, // Keep this for backward compatibility
        description: data?.description,
        qty: data?.quantity,
        price: data?.item_credit,
        amount: data?.total,
        is_tax: data?.tax?.uid ? true : false, // Add is_tax field for consistency
        tax:
          (data?.item_credit / 100) * (data?.tax?.rate || 0) * data?.quantity,
        productTaxInfo: {
          rate: data?.tax?.rate || 0,
          title: data?.tax?.title || "",
          uid: data?.tax?.uid || "",
        },
        productTaxRate: data?.tax?.rate || 0,
        productTaxType: SalesData.tax_kind,
        productCode: 0,
        isPopupOpen: false,
      });
    } else {
      array.push({
        type: "product",
        uid: data?.uid,
        product_uid: data?.product?.uid,
        product_service: data.product, // Pass the full product object like in estimates
        mainPrice: data?.item_credit,
        productService: data.product?.title, // Keep this for backward compatibility
        description: data?.description,
        qty: data?.quantity,
        price: data?.item_credit,
        amount: data?.total,
        is_tax: data?.tax?.uid ? true : false, // Add is_tax field for consistency
        tax:
          (data?.item_credit / 100) * (data?.tax?.rate || 0) * data?.quantity,
        productTaxInfo: {
          rate: data?.tax?.rate || 0,
          title: data?.tax?.title || "",
          uid: data?.tax?.uid || "",
        },
        productTaxRate: data?.tax?.rate || 0,
        productTaxType: SalesData.tax_kind,
        productCode: 0,
        isPopupOpen: false,
      });
    }
  });
  return array;
};
