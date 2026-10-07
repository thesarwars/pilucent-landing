import moment from "moment";
import CurrencySelect from "@/app/dashboard/sales/all_sales/_components/CurrencySelect";
import DatePicker from "@/components/ui/DatePicker";
import { Currencies } from "@/lib/helpers/Customer";
import Label from "@/components/ui/RawLabel";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
const PayBillDetails = ({
  view = false,
  PaymentData,
  setPaymentData,
  paymentDate,
  setPaymentDate,
  currency,
  setCurrency,
}: {
  view?: boolean;
  PaymentData: any;
  setPaymentData: any;
  paymentDate: any;
  setPaymentDate: any;
  currency: any;
  setCurrency: any;
}) => {
  return (
    <div  style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }} className="rounded-2xl bg-white border  px-4 py-5">
      <div className="flex justify-between">
        <h1 className="text-[32px] font-semibold text-[#131523]">Pay Bills</h1>
        <div className="space-y-1 rounded-xl bg-[#F5F6FA] px-4 py-2 text-right">
          <p className="text-xs font-normal uppercase text-[#868DA6]">
            Amount Paying
          </p>
          <h1 className="text-2xl font-semibold text-[#19213D]">
            ${PaymentData.total}
          </h1>
          <p className="text-xs font-normal uppercase text-[#868DA6]">
            {moment(paymentDate).format("DD MMMM, YYYY")}
          </p>
        </div>
      </div>
      <div className="mt-9 flex gap-12">
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="flex-1 font-medium text-accent_text_gray">
              Payment Account
            </Label>
            <AccountSelectDropDown
              view={view}
              ClassName="border-b-2 focus:border-accent_soft_blue"
              parentClassName="-ml-12"
              setValue={(e:any)=>setPaymentData({...PaymentData, deposit_to: e})}
              value={PaymentData?.deposit_to}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label className="flex-1 font-medium text-accent_text_gray">
              Balance
            </Label>
            <input
              value={PaymentData?.deposit_to?.opening_balance || 0}
              placeholder=""
              className={`w-full flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue`}
              type="number"
              readOnly
              disabled
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label className="flex-1 font-medium text-accent_text_gray">
              Currency
            </Label>
            <select
              value={PaymentData.currency}
              onChange={(e) =>
                setPaymentData((prev: any) => ({
                  ...prev,
                  currency: e.target.value,
                }))
              }
              className="flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue"
              disabled={view}
            >
              {Currencies.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>

          <CurrencySelect
            view={view}
            customerCurrency={PaymentData?.currency}
            setRate={setCurrency}
            rate={currency}
          />
        </div>

        {/* part2 */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="flex-1 font-medium text-accent_text_gray">
              Payment date
            </Label>
            <div className="flex-1">
              <DatePicker
                view={view}
                onChange={setPaymentDate}
                value={paymentDate}
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
              value={PaymentData.reference_no}
              onChange={(e) =>
                setPaymentData({
                  ...PaymentData,
                  reference_no: e.target.value,
                })
              }
              placeholder=""
              className={`w-full flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue`}
              type="text"
              disabled={view}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayBillDetails;
