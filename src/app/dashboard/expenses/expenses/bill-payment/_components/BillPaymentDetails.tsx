import CurrencySelect from "@/app/dashboard/sales/all_sales/_components/CurrencySelect";
import EmailPopup from "@/app/dashboard/sales/all_sales/_components/EmailPopup";
import Label from "@/components/ui/RawLabel";
import SupplierSelectDropDown from "../../../../../../components/ui/ScrollSelectDropDowns/SupplierSelectDropDown";
import moment from "moment";
import DatePicker from "@/components/ui/DatePicker";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";

const BillPaymentDetails = ({
  view = false,
  PaymentData,
  paymentDate,
  setPaymentData,
  setSelectedSupplier,
  selectedSupplier,
  OnSupplierSelect,
  emails,
  setEmails,
  setCurrency,
  currency,
  setPaymentDate,
}: {
  view?: any;
  PaymentData: any;
  paymentDate: any;
  setPaymentData: any;
  setSelectedSupplier: any;
  selectedSupplier: any;
  OnSupplierSelect: any;
  emails: any;
  setEmails: any;
  setCurrency: any;
  currency: any;
  setPaymentDate: any;
}) => {
  return (
    <div
      style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
      className="rounded-2xl bg-white/60 px-4 py-5"
    >
      <div className="flex justify-between">
        <h1 className="text-[32px] font-semibold text-[#131523]">
          Bill Payment
        </h1>
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
              Supplier
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
              Email
            </Label>
            <input
              value={emails.email || ""}
              onChange={(e) => setEmails({ ...emails, email: e.target.value })}
              placeholder="Type email"
              className={`w-full flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue`}
              type="email"
              readOnly={view}
            />
          </div>
          <EmailPopup emails={emails} setEmails={setEmails} />
          <div className="flex items-center justify-between gap-2">
            <Label className="flex-1 font-medium text-accent_text_gray">
              Mailing Address
            </Label>
            <input
              value={PaymentData.mailing_address}
              onChange={(e) =>
                setPaymentData({
                  ...PaymentData,
                  mailing_address: e.target.value,
                })
              }
              placeholder="Type Mailing Address"
              className={`flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue`}
              type="text"
              readOnly={view}
            />
          </div>

          <CurrencySelect
            view={view}
            customerCurrency={selectedSupplier?.currency}
            setRate={setCurrency}
            rate={currency}
          />
        </div>

        {/* part2 */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="flex-1 font-medium text-accent_text_gray">
              Bill No
            </Label>
            <input
              value={PaymentData.bill_no}
              onChange={(e) =>
                setPaymentData({
                  ...PaymentData,
                  bill_no: e.target.value,
                })
              }
              placeholder=""
              className={`w-full flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue`}
              type="text"
              readOnly={view}
            />
          </div>
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
              Payment Account
            </Label>
            <AccountSelectDropDown
              ClassName="border-b-2 focus:border-accent_soft_blue"
              parentClassName="-ml-12"
              setValue={(e: any) =>
                setPaymentData({ ...PaymentData, deposit_to: e })
              }
              filters={{ account_type__title: "Bank" }}
              value={PaymentData?.deposit_to}
              view={view}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Label className="flex-1 font-medium text-accent_text_gray">
              Balance
            </Label>
            <input
              value={`${PaymentData?.deposit_to?.opening_balance || 0} ${PaymentData?.deposit_to?.currency || ""}`}
              readOnly
              placeholder=""
              className={`w-full flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue`}
              type="text"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillPaymentDetails;
