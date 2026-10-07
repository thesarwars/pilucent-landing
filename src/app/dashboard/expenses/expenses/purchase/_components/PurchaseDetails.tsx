import moment from "moment";
import React from "react";
import SupplierSelectDropDown from "../../../../../../components/ui/ScrollSelectDropDowns/SupplierSelectDropDown";
import EmailPopup from "@/app/dashboard/sales/all_sales/_components/EmailPopup";
import CurrencySelect from "@/app/dashboard/sales/all_sales/_components/CurrencySelect";
import DatePicker from "@/components/ui/DatePicker";
import LocationSelectDropDown from "@/components/ui/ScrollSelectDropDowns/LocationSelectDropDown";
import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import Label from "@/components/ui/RawLabel";
import { toast } from "react-toastify";
import Button from "@/components/ui/RawButton";
import { useRouter } from "next/navigation";

type purchaseProps = {
  purchaseData: any;
  estimateDate: any;
  setEstimateDate: any;
  setSelectedSupplier: any;
  selectedSupplier: any;
  OnSupplierSelect?: any;
  emails: any;
  setEmails: any;
  data: any;
  setData: any;
  currency: any;
  setCurrency: any;
  view?: boolean;
  setShipDate: any;
  shipDate: any;
};

const PurchaseDetails = ({
  view = false,
  purchaseData,
  estimateDate,
  setEstimateDate,
  setSelectedSupplier,
  selectedSupplier,
  OnSupplierSelect,
  emails,
  setEmails,
  data,
  setData,
  currency,
  setCurrency,
  setShipDate,
  shipDate,
}: purchaseProps) => {
  const router = useRouter();
  return (
    <>
      <div>
        <div>
          <Button
            onClick={() => router.back()}
            className="text-accent_soft_blue mb-4 mt-0 flex items-center gap-1 p-1"
          >
            <IoIosArrowBack /> Back
          </Button>
          <div
            style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
            className="rounded-2xl bg-white/60 px-4 py-5"
          >
            <div className="flex justify-between">
              <h1 className="text-[32px] font-semibold text-[#131523]">
                Purchase Order
              </h1>
              <div className="space-y-1 rounded-xl bg-[#F5F6FA] px-4 py-2 text-right">
                <p className="text-xs font-normal uppercase text-[#868DA6]">
                  Amount Due
                </p>
                <h1 className="text-2xl font-semibold text-[#19213D]">
                  $ {purchaseData.total}
                </h1>
                <p className="text-xs font-normal uppercase text-[#868DA6]">
                  {moment(estimateDate).format("DD MMMM, YYYY")}
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
                    value={emails.email}
                    onChange={(e) =>
                      setEmails({ ...emails, email: e.target.value })
                    }
                    placeholder="Type email"
                    className={`w-full flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue`}
                    type="email"
                    readOnly={view}
                  />
                </div>
                <EmailPopup view={view} emails={emails} setEmails={setEmails} />
                <div className="flex items-center justify-between gap-2">
                  <Label className="flex-1 font-medium text-accent_text_gray">
                    Mailing Address
                  </Label>
                  <input
                    value={data.mailing_address}
                    onChange={(e) =>
                      setData({ ...data, mailing_address: e.target.value })
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
                    Purchase Order Date
                  </Label>

                  <div className="flex-1">
                    <DatePicker
                      view={view}
                      value={estimateDate}
                      onChange={setEstimateDate}
                      ClassName="bg-transparent border-b-2 -ml-5 py-2 flex-1 focus:border-accent_soft_blue rounded-none w-full"
                      placeholder="DD-MM-YYYY"
                    />
                  </div>
                </div>
                <div className="">
                  <div className="mt-3 flex">
                    <Label className="flex-1 font-medium text-accent_text_gray">
                      Status
                    </Label>

                    <div className="flex flex-1 items-start justify-start border-b">
                      <select
                        value={data?.status}
                        onChange={(e) =>
                          setData({ ...data, status: e.target.value })
                        }
                        className={`${data?.status === "PENDING" ? "border-[#EF9B0D] bg-[#FCF7EE] text-[#EF9B0D]" : data?.status === "ACCEPTED" ? "border-green-500 bg-green-100 text-green-500" : data?.status === "CLOSED" ? "border-gray-500 bg-gray-100 text-gray-500" : data?.status === "REJECTED" ? "border-red-500 bg-red-100 text-red-500" : data?.status === "OPEN" && "bg-[#DDEDFD] text-[#286AC5]"} mb-1 rounded-3xl border px-2 py-1 text-sm outline-none`}
                        disabled={view}
                      >
                        <option value="OPEN">Open</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="CLOSED">Closed</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
          className="mt-4 flex gap-12 rounded-2xl bg-white/60 p-4"
        >
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="flex-1 font-medium text-accent_text_gray">
                Shipping To
              </Label>
              <input
                value={data.shipping_to}
                onChange={(e) =>
                  setData({ ...data, shipping_to: e.target.value })
                }
                placeholder=""
                className={`flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue`}
                type="text"
                readOnly={view}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label className="flex-1 font-medium text-accent_text_gray">
                Ship Via
              </Label>
              <input
                value={data.ship_via}
                onChange={(e) => setData({ ...data, ship_via: e.target.value })}
                placeholder=""
                className={`flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue`}
                type="text"
                readOnly={view}
              />
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="flex-1 font-medium text-accent_text_gray">
                Location
              </Label>
              <LocationSelectDropDown
                view={view}
                ClassName="border-b-2 focus:border-accent_soft_blue"
                parentClassName="-ml-12"
                setValue={(e: any) => setData({ ...data, location: e })}
                value={data.location}
              />
            </div>{" "}
            <div className="flex items-center justify-between gap-2">
              <Label className="flex-1 font-medium text-accent_text_gray">
                Ship Date
              </Label>
              <div className="flex-1">
                <DatePicker
                  view={view}
                  value={shipDate}
                  onChange={(date) => {
                    if (
                      new Date(estimateDate).getTime() >
                      new Date(date).getTime()
                    ) {
                      return toast.info(
                        "Ship date can't be previous date of Purchase date",
                      );
                    } else {
                      setShipDate(date);
                    }
                  }}
                  ClassName="bg-transparent border-b-2 -ml-5 py-2 flex-1 focus:border-accent_soft_blue rounded-none w-full"
                  placeholder="DD-MM-YYYY"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchaseDetails;
