import CurrencySelect from "@/app/dashboard/sales/all_sales/_components/CurrencySelect";
import DatePicker from "@/components/ui/DatePicker";
import SupplierSelectDropDown from "../../../../../../components/ui/ScrollSelectDropDowns/SupplierSelectDropDown";
import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import moment from "moment";
import Label from "@/components/ui/RawLabel";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import PayMethodSelectDropdown from "@/components/ui/ScrollSelectDropDowns/PayMethodSelectDropdown";
import Button from "@/components/ui/RawButton";
import { useRouter } from "next/navigation";

type expenseProps = {
  view?: any;
  data: any;
  setData: any;
  billDate: any;
  setBillDate: any;
  purchaseData: any;
  selectedSupplier: any;
  setSelectedSupplier: any;
  OnSupplierSelect: any;
  currency: any;
  setCurrency: any;
};

const ExpenseDetails = ({
  view = false,
  data,
  setData,
  billDate,
  setBillDate,
  purchaseData,
  selectedSupplier,
  setSelectedSupplier,
  OnSupplierSelect,
  currency,
  setCurrency,
}: expenseProps) => {
  const router = useRouter();
  return (
    <div>
      <div>
        <Button
          onClick={() => router.back()}
          className="mb-4 mt-0 flex items-center gap-1 p-1 text-accent_soft_blue"
        >
          <IoIosArrowBack /> Back
        </Button>
        <div
          style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
          className="rounded-2xl bg-white/60 px-4 py-5"
        >
          <div className="flex justify-between">
            <h1 className="text-[32px] font-semibold text-[#131523]">
              Expense
            </h1>
            <div className="space-y-1 rounded-xl bg-[#F5F6FA] px-4 py-2 text-right">
              <p className="text-xs font-normal uppercase text-[#868DA6]">
                Amount Due
              </p>
              <h1 className="text-2xl font-semibold text-[#19213D]">
                $ {purchaseData.total}
              </h1>
              <p className="text-xs font-normal uppercase text-[#868DA6]">
                {moment(billDate).format("DD MMMM, YYYY")}
              </p>
            </div>
          </div>
          <div className="mt-9 flex gap-12">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="flex-1 font-medium text-accent_text_gray">
                  Payee
                </Label>
                {view ? (
                  <input
                    value={`${selectedSupplier?.first_name || ""} ${selectedSupplier?.last_name || ""}`}
                    className={`w-full flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue`}
                    type="text"
                    disabled
                    readOnly
                  />
                ) : (
                  <SupplierSelectDropDown
                    ClassName="border-b-2 focus:border-accent_soft_blue"
                    parentClassName="-ml-12"
                    setValue={setSelectedSupplier}
                    value={selectedSupplier}
                    OnSelect={OnSupplierSelect}
                  />
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label className="flex-1 font-medium text-accent_text_gray">
                  Payment Account
                </Label>
                <AccountSelectDropDown
                  ClassName="border-b-2 focus:border-accent_soft_blue"
                  parentClassName="-ml-12"
                  view={view}
                  filters={{ kind: "ASSETS" }}
                  setValue={(e: any) => setData({ ...data, deposit_to: e })}
                  value={data?.deposit_to}
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <Label className="flex-1 font-medium text-accent_text_gray">
                  Balance
                </Label>
                <input
                  value={data?.deposit_to?.opening_balance || 0}
                  // onChange={(e) =>
                  //   setData({ ...data, mailing_address: e.target.value })
                  // }
                  placeholder=""
                  className={`flex-1 bg-transparent px-6 py-2 outline-none`}
                  type="text"
                  readOnly={view}
                />
              </div>

              <div className="flex-1 space-y-3"></div>

              <CurrencySelect
                view={view}
                customerCurrency={selectedSupplier?.currency}
                setRate={setCurrency}
                rate={currency}
              />
            </div>

            {/* part2 */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="flex-1 font-medium text-accent_text_gray">
                  Payment Date
                </Label>

                <div className="flex-1">
                  <DatePicker
                    view={view}
                    value={billDate}
                    onChange={setBillDate}
                    ClassName="bg-transparent border-b-2 -ml-5 py-2 flex-1 focus:border-accent_soft_blue rounded-none w-full"
                    placeholder="DD-MM-YYYY"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label className="flex-1 font-medium text-accent_text_gray">
                  Ref No
                </Label>
                <input
                  value={data.reference_no}
                  onChange={(e) =>
                    setData({ ...data, reference_no: e.target.value })
                  }
                  placeholder=""
                  className={`flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue`}
                  type="text"
                  readOnly={view}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label className="flex-1 font-medium text-accent_text_gray">
                  Payment Method
                </Label>

                <PayMethodSelectDropdown
                  parentClassName="-ml-12"
                  filters={{ status: "ACTIVE" }}
                  ClassName="border-b-2 focus:border-accent_soft_blue"
                  setValue={(e: any) => setData({ ...data, payment_method: e })}
                  value={data.payment_method}
                  view={view}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails;
