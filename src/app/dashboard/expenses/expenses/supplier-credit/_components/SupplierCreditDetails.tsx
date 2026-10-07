import CurrencySelect from "@/app/dashboard/sales/all_sales/_components/CurrencySelect";
import DatePicker from "@/components/ui/DatePicker";
import Label from "@/components/ui/RawLabel";
import moment from "moment";
import SupplierSelectDropDown from "../../../../../../components/ui/ScrollSelectDropDowns/SupplierSelectDropDown";

type props = {
  purchaseData: any;
  paymentDate: any;
  setPaymentDate: any;
  selectedSupplier: any;
  setSelectedSupplier: any;
  data: any;
  setData: any;
  view?: any;
  setCurrency: any;
  currency: any;
  OnSupplierSelect?: any;
};

const SupplierCreditDetails = ({
  purchaseData,
  paymentDate,
  setPaymentDate,
  selectedSupplier,
  setSelectedSupplier,
  data,
  setData,
  view = false,
  setCurrency,
  currency,
  OnSupplierSelect,
}: props) => {
  return (
    <div>
      <div style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }} className="rounded-2xl bg-white/60 px-4 py-5">
        <div className="flex justify-between">
          <h1 className="text-[32px] font-semibold text-[#131523]">
            Supplier Credit
          </h1>
          <div className="space-y-1 rounded-xl bg-[#F5F6FA] px-4 py-2 text-right">
            <p className="text-xs font-normal uppercase text-[#868DA6]">
              Amount to Credit
            </p>
            <h1 className="text-2xl font-semibold text-[#19213D]">
              $ {purchaseData.total}
            </h1>
            <p className="text-xs font-normal uppercase text-[#868DA6]">
              {moment(paymentDate).format("DD MMMM, YYYY")}
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
                Open Balance
              </Label>
              <input
                value={`${selectedSupplier?.opening_balance || 0} ${selectedSupplier?.currency || ""}`}
                // onChange={(e) =>
                //   setData({ ...data, mailing_address: e.target.value })
                // }
                placeholder=""
                className={`flex-1 bg-transparent px-6 py-2 outline-none`}
                type="text"
              />
            </div>
            {/* <CurrencySelect
              customerCurrency={selectedSupplier?.currency}
              setRate={setCurrency}
              rate={currency}
              view={view}
            /> */}
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
                  value={paymentDate}
                  onChange={setPaymentDate}
                  ClassName="bg-transparent border-b-2 -ml-5 py-2 flex-1 focus:border-accent_soft_blue rounded-none w-full"
                  placeholder="DD-MM-YYYY"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label className="flex-1 font-medium text-accent_text_gray">
                Credit Note No
              </Label>
              <input
                value={data.credit_no}
                onChange={(e) =>
                  setData({ ...data, credit_no: e.target.value })
                }
                readOnly={view}
                placeholder=""
                className={`flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue`}
                type="text"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierCreditDetails;
