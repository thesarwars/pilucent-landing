export const convertToUsableArr = (PurchaseItems: any, PurchaseData: any) => {
  const PurchaseArray: any = [];
  const CategoryArray: any = [];
  //purchase items
  PurchaseItems?.map((data: any) => {
    if ((data?.section || data?.note) && data?.kind == 'PRODUCT') {
      //if section exists
      data?.section &&
        PurchaseArray.push({
          type: 'section',
          mainPrice: 0,
          productService: '',
          description: data?.section,
          qty: 0,
          price: 0,
          amount: 0,
          tax: 0,
          productTaxRate: 0,
          productTaxType: '',
          productCode: 0,
          isPopupOpen: false,
        });
      //if note exists
      data?.note &&
        PurchaseArray.push({
          type: 'note',
          mainPrice: 0,
          productService: '',
          description: data?.note,
          qty: 0,
          price: 0,
          amount: 0,
          tax: 0,
          productTaxRate: 0,
          productTaxType: '',
          productCode: 0,
          isPopupOpen: false,
        });

      PurchaseArray.push({
        uid: data?.uid,
        type: 'product',
        product_uid: data?.product?.uid,
        mainPrice: data?.purchase_price,
        productService: data?.product?.title,
        description: data?.description,
        qty: data?.opening_quantity,
        remaining_qty: data?.quantity,
        price: data?.purchase_price,
        amount: data?.total,
        tax: (data?.purchase_price || 0 / 100) * (data?.tax?.rate || 0) * data?.quantity,
        productTaxInfo: {
          rate: data?.tax?.rate || 0,
          title: data?.tax?.title || '',
          uid: data?.tax?.uid || '',
        },
        productTaxRate: data?.tax?.rate || 0,
        productTaxType: PurchaseData?.tax_kind,
        productCode: 0,
        isPopupOpen: false,
      });
    } else if (data?.kind == 'PRODUCT') {
      PurchaseArray.push({
        uid: data?.uid,
        type: 'product',
        product_uid: data?.product?.uid,
        mainPrice: data?.purchase_price,
        productService: data?.product?.title,
        description: data?.description,
        qty: data?.opening_quantity,
        remaining_qty: data?.quantity,
        price: data?.purchase_price,
        amount: data?.total,
        tax: (data?.purchase_price / 100) * (data?.tax?.rate || 0) * data?.quantity,
        productTaxInfo: {
          rate: data?.tax?.rate || 0,
          title: data?.tax?.title || '',
          uid: data?.tax?.uid || '',
        },
        productTaxRate: data?.tax?.rate || 0,
        productTaxType: PurchaseData?.tax_kind,
        productCode: 0,
        isPopupOpen: false,
      });
    }
  });

  //category items
  PurchaseItems?.map((data: any) => {
    if ((data.section || data?.note) && data?.kind == 'EXPENSE') {
      data?.section &&
        CategoryArray.push({
          type: 'section',
          description: data?.section,
          productTaxRate: 0,
          productTaxType: '',
          category: '',
          category_uid: '',
          amount: 0,
          tax: 0,
          productTaxInfo: '',
          isPopupOpen: false,
        });

      data?.note &&
        CategoryArray.push({
          type: 'note',
          description: data?.note,
          productTaxRate: 0,
          productTaxType: '',
          category: '',
          category_uid: '',
          amount: 0,
          tax: 0,
          productTaxInfo: '',
          isPopupOpen: false,
        });

      CategoryArray.push({
        uid: data?.uid,
        type: 'category',
        description: data?.description,
        productTaxRate: data?.tax?.rate || 0,
        productTaxType: PurchaseData?.tax_kind,
        category: data?.charter_account?.title,
        category_uid: data?.charter_account?.uid,
        amount: data?.total,
        tax: (data?.total / 100) * (data?.tax?.rate || 0),
        productTaxInfo: {
          rate: data?.tax?.rate || 0,
          title: data?.tax?.title || '',
          uid: data?.tax?.uid || '',
        },
        isPopupOpen: false,
      });
    } else if (data?.kind == 'EXPENSE') {
      CategoryArray.push({
        uid: data?.uid,
        type: 'category',
        description: data?.description,
        productTaxRate: data?.tax?.rate || 0,
        productTaxType: PurchaseData?.tax_kind,
        category: data?.charter_account?.title,
        category_uid: data?.charter_account?.uid,
        amount: data?.total,
        tax: (data?.total / 100) * (data?.tax?.rate || 0),
        productTaxInfo: {
          rate: data?.tax?.rate || 0,
          title: data?.tax?.title || '',
          uid: data?.tax?.uid || '',
        },
        isPopupOpen: false,
      });
    }
  });

  return { PurchaseArray, CategoryArray };
};
export const convertBillPaymentToFrontendData = (PurchaseItems: any) => {
  const Purchases: any = [];
  const Credits: any = [];
  PurchaseItems?.map((data: any) => {
    if (data?.purchase?.uid) {
      Purchases.push({
        purchase_uid: data?.purchase?.uid,
        kind: 'PURCHASE',
        uid: data?.uid,
        due_date: data?.purchase?.due_date,
        original_amount: data?.purchase?.total,
        due_total: data?.purchase?.due_total,
        payment: data?.used_total,
      });
    }
  });
  //category items
  PurchaseItems.results.map((data: any) => {
    if (data?.credit_note?.uid) {
      Credits.push({
        credit_uid: data?.credit_note?.uid,
        uid: data?.uid,
        kind: 'CREDIT_NOTE',
        credit_number: data?.credit_note?.credit_note_number,
        original_amount: data?.total,
        remaining_balance: Number(data?.total) - Number(data?.used_total),
        payment: data?.used_total,
      });
    }
  });

  return { Purchases, Credits };
};

export const convertToCreditUsableArr = (PurchaseItems: any, PurchaseData: any) => {
  const PurchaseArray: any = [];
  const CategoryArray: any = [];
  //purchase items
  PurchaseItems?.map((data: any) => {
    if ((data.section || data?.note) && data?.product) {
      data?.section &&
        PurchaseArray.push({
          type: 'section',
          mainPrice: 0,
          productService: '',
          description: data.section,
          qty: 0,
          price: 0,
          amount: 0,
          tax: 0,
          productTaxRate: 0,
          productTaxType: '',
          productCode: 0,
          isPopupOpen: false,
        });

      data?.note &&
        PurchaseArray.push({
          type: 'note',
          mainPrice: 0,
          productService: '',
          description: data.note,
          qty: 0,
          price: 0,
          amount: 0,
          tax: 0,
          productTaxRate: 0,
          productTaxType: '',
          productCode: 0,
          isPopupOpen: false,
        });

      PurchaseArray.push({
        uid: data?.uid,
        type: 'product',
        product_uid: data?.product?.uid,
        mainPrice: data?.item_credit,
        productService: data?.product?.title,
        description: data?.description,
        qty: data.quantity,
        price: data?.item_credit,
        amount: data.total,
        tax: (data?.item_credit / 100) * (data?.tax?.rate || 0) * data.quantity,
        productTaxInfo: {
          rate: data?.tax?.rate || 0,
          title: data?.tax?.title || '',
          uid: data?.tax?.uid || '',
        },
        productTaxRate: data?.tax?.rate || 0,
        productTaxType: PurchaseData.tax_kind,
        productCode: 0,
        isPopupOpen: false,
      });
    } else if (data?.product) {
      PurchaseArray.push({
        uid: data?.uid,
        type: 'product',
        product_uid: data?.product?.uid,
        mainPrice: data?.item_credit,
        productService: data?.product?.title,
        description: data?.description,
        qty: data.quantity,
        price: data?.item_credit,
        amount: data.total,
        tax: (data?.item_credit / 100) * (data?.tax?.rate || 0) * data.quantity,
        productTaxInfo: {
          rate: data?.tax?.rate || 0,
          title: data?.tax?.title || '',
          uid: data?.tax?.uid || '',
        },
        productTaxRate: data?.tax?.rate || 0,
        productTaxType: PurchaseData.tax_kind,
        productCode: 0,
        isPopupOpen: false,
      });
    }
  });

  //category items
  PurchaseItems.results.map((data: any) => {
    if ((data?.section || data?.note) && !data?.product) {
      data?.section &&
        CategoryArray.push({
          type: 'section',
          description: data.section,
          productTaxRate: 0,
          productTaxType: '',
          category: '',
          category_uid: '',
          amount: 0,
          tax: 0,
          productTaxInfo: '',
          isPopupOpen: false,
        });

      data?.note &&
        CategoryArray.push({
          type: 'note',
          description: data?.note,
          productTaxRate: 0,
          productTaxType: '',
          category: '',
          category_uid: '',
          amount: 0,
          tax: 0,
          productTaxInfo: '',
          isPopupOpen: false,
        });

      CategoryArray.push({
        uid: data?.uid,
        type: 'category',
        description: data.description,
        productTaxRate: data?.tax?.rate || 0,
        productTaxType: PurchaseData.tax_kind,
        category: data?.charter_account?.title,
        category_uid: data?.charter_account?.uid,
        amount: data?.total,
        tax: (data.total / 100) * (data?.tax?.rate || 0),
        productTaxInfo: {
          rate: data?.tax?.rate || 0,
          title: data?.tax?.title || '',
          uid: data?.tax?.uid || '',
        },
        isPopupOpen: false,
      });
    } else if (!data?.product) {
      CategoryArray.push({
        uid: data?.uid,
        type: 'category',
        description: data.description,
        productTaxRate: data?.tax?.rate || 0,
        productTaxType: PurchaseData.tax_kind,
        category: data?.charter_account?.title,
        category_uid: data?.charter_account?.uid,
        amount: data?.total,
        tax: (data.total / 100) * (data?.tax?.rate || 0),
        productTaxInfo: {
          rate: data?.tax?.rate || 0,
          title: data?.tax?.title || '',
          uid: data?.tax?.uid || '',
        },
        isPopupOpen: false,
      });
    }
  });

  return { PurchaseArray, CategoryArray };
};

export const ConvertToBackendData = (purchaseItems: any, CategoryItems: any) => {
  const PurArr: any = [];
  let note = '';
  let section = '';
  purchaseItems.map((data: any) => {
    if (data.type === 'product' && data?.product_uid) {
      PurArr.push({
        uid: data?.uid || '',
        product_uid: data.product_uid,
        kind: 'PRODUCT',
        quantity: data.qty,
        opening_quantity: data?.qty,
        total: (data.price * data.qty).toFixed(2),
        tax_uid: '',
        purchase_price: data?.price,
        note: note ? note : '',
        section: section ? section : '',
        description: data.description,
      });

      note = '';
      section = '';
    } else if (data.type === 'note') {
      note = data.description;
    } else if (data.type === 'section') {
      section = data.description;
    }
  });
  const CatArr: any = [];
  let note1 = '';
  let section1 = '';
  CategoryItems.map((data: any) => {
    if (data.type === 'category') {
      CatArr.push({
        uid: data?.uid || '',
        kind: 'EXPENSE',
        charter_account_uid: data.category_uid,
        total: data?.amount,
        tax_uid: '',
        note: note1 ? note1 : '',
        section: section1 ? section1 : '',
        description: data.description,
      });

      note1 = '';
      section1 = '';
    } else if (data.type === 'note') {
      note1 = data.description;
    } else if (data.type === 'section') {
      section1 = data.description;
    }
  });

  return { CatArr, PurArr };
};
export const ConvertToSupplierCreditBackendData = (purchaseItems: any, CategoryItems: any) => {
  const PurArr: any = [];
  let note = '';
  let section = '';
  purchaseItems.map((data: any) => {
    if (data.type === 'product' && data?.product_uid) {
      if (data?.uid) {
        PurArr.push({
          uid: data?.uid || '',
          product_uid: data.product_uid,
          kind: 'PRODUCT',
          quantity: data.qty,
          total: (data.price * data.qty).toFixed(2),
          tax_uid: data.productTaxInfo.uid,
          item_credit: data?.price,
          note: note ? note : '',
          section: section ? section : '',
          description: data.description,
        });

        note = '';
        section = '';
      } else {
        PurArr.push({
          product_uid: data.product_uid,
          kind: 'PRODUCT',
          quantity: data.qty,
          total: (data.price * data.qty).toFixed(2),
          tax_uid: data.productTaxInfo.uid,
          item_credit: data?.price,
          note: note ? note : '',
          section: section ? section : '',
          description: data.description,
        });

        note = '';
        section = '';
      }
    } else if (data.type === 'note') {
      note = data.description;
    } else if (data.type === 'section') {
      section = data.description;
    }
  });
  const CatArr: any = [];
  let note1 = '';
  let section1 = '';
  CategoryItems.map((data: any) => {
    if (data.type === 'category') {
      if (data?.uid) {
        CatArr.push({
          uid: data?.uid || '',
          kind: 'EXPENSE',
          charter_account_uid: data.category_uid,
          quantity: 1,
          total: data?.amount,
          item_credit: data?.amount,
          tax_uid: data.productTaxInfo.uid,
          note: note1 ? note1 : '',
          section: section1 ? section1 : '',
          description: data.description,
        });

        note1 = '';
        section1 = '';
      } else {
        CatArr.push({
          kind: 'EXPENSE',
          charter_account_uid: data.category_uid,
          quantity: 1,
          total: data?.amount,
          item_credit: data?.amount,
          tax_uid: data.productTaxInfo.uid,
          note: note1 ? note1 : '',
          section: section1 ? section1 : '',
          description: data.description,
        });

        note1 = '';
        section1 = '';
      }
    } else if (data.type === 'note') {
      note1 = data.description;
    } else if (data.type === 'section') {
      section1 = data.description;
    }
  });

  return { CatArr, PurArr };
};

export const convertPayBillDataForFrontend = (items: any) => {
  const formattedData = items.map((item: any) => {
    return {
      item_uid: item?.uid,
      name: item?.supplier?.first_name
        ? item?.supplier?.first_name
        : '' + ' ' + item?.supplier?.middle_name
          ? item?.supplier?.middle_name
          : '' + ' ' + item?.supplier?.last_name
            ? item?.supplier?.last_name
            : '',
      uid: item?.supplier?.uid,
      open_balance: item?.supplier?.opening_balance,
      total_credit: item?.supplier?.total_credit,
      credit_applied: item?.applied_credit,
      payment: Number(item?.total) - Number(item?.applied_credit),
      total_amount: item?.total,
    };
  });

  return formattedData;
};
