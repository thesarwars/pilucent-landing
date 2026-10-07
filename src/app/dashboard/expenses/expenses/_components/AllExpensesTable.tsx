import React, {  useEffect, useState } from "react";
import AllBillTable from "./AllExpensesTables/AllBillTable";
import AllPurchaseTable from "./AllExpensesTables/AllPurchaseTable";
import AllExpenseListTable from "./AllExpensesTables/AllExpenseListTable";
import AllChequeListTable from "./AllExpensesTables/AllChequesListTable";
import AllPaymentListTable from "./AllExpensesTables/AllPaymentListTable";
import AllCreditListTable from "./AllExpensesTables/AllCreditListTable";
import AllPayBillTable from "./AllExpensesTables/AllPayBillTable";
import { useSearchParams } from "next/navigation";







const AllExpensesTable = () => {
  const [tableType, setTableType] = useState("bill")
  const tbl = useSearchParams().get("tbl")

  useEffect(()=>{
    if(tbl){
      setTableType(tbl)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])
  
  return (
    <>
      { (tableType != "purchase" && tableType != "expense" && tableType != "cheque" && tableType != "payment" && tableType != "credit" && tableType != "payBill") && <AllBillTable setType={setTableType} type={tableType} /> }
      { tableType === "purchase" && <AllPurchaseTable setType={setTableType} type={tableType} />  }
      { tableType === "expense" && <AllExpenseListTable setType={setTableType} type={tableType} />  }
      { tableType === "cheque" && <AllChequeListTable setType={setTableType} type={tableType} />  }
      { tableType === "payment" && <AllPaymentListTable setType={setTableType} type={tableType} />  }
      { tableType === "credit" && <AllCreditListTable setType={setTableType} type={tableType} />  }
      { tableType === "payBill" && <AllPayBillTable setType={setTableType} type={tableType} />  }
    </>
  );
};

export default AllExpensesTable;
