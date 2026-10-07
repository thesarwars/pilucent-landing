import React, { useState } from "react";
import { PatternInput } from "./BankAccounts/pattern-input";
import Button from "@/components/ui/RawButton";
import { USStates } from "@/lib/helpers/UsaStates";
import { postTaxBanditsBusiness } from "@/app/helpers/backend";
import { toast } from "@/lib/ToastService";

const data = {
  ESTE: [
    { code: "ADMINISTRATOR", label: "Administrator" },
    { code: "EXECUTOR", label: "Executor" },
    { code: "TRUSTEE", label: "Trustee" },
    { code: "FIDUCIARY", label: "Fiduciary" },
  ],

  PART: [
    { code: "PARTNER", label: "Partner" },
    { code: "GENERALPARTNER", label: "General partner" },
    { code: "LIMITEDPARTNER", label: "Limited partner" },
    { code: "LLCMEMBER", label: "LLC member" },
    { code: "MANAGINGMEMBER", label: "Managing member" },
    { code: "MEMBER", label: "Member" },
    { code: "MANAGER", label: "Manager" },
    { code: "PRESIDENT", label: "President" },
    { code: "OWNER", label: "Owner" },
    { code: "TAXMATTERPARTNER", label: "Tax matter partner" },
  ],
  CORP: [
    { code: "PRESIDENT", label: "President" },
    { code: "VICEPRESIDENT", label: "Vice president" },
    { code: "TREASURER", label: "Treasurer" },
    { code: "ASSISTANTTREASURER", label: "Assistant treasurer" },
    { code: "CHIEFACCOUNTINGOFFICER", label: "Chief accounting officer" },
    { code: "TAXOFFICER", label: "Tax officer" },
    { code: "CHIEFOPERATINGOFFICER", label: "Chief operating officer" },
    { code: "CORPORATESECRETARY", label: "Corporate secretary" },
    { code: "SECRETARYTREASURER", label: "Secretary treasurer" },
    { code: "CORPORATEOFFICER", label: "Corporate officer" },
    { code: "MEMBER", label: "Member" },
  ],
  EORG: [
    { code: "PRESIDENT", label: "President" },
    { code: "VICEPRESIDENT", label: "Vice president" },
    { code: "CORPORATETREASURER", label: "Corporate treasurer" },
    { code: "TREASURER", label: "Treasurer" },
    { code: "ASSISTANTTREASURER", label: "Assistant treasurer" },
    { code: "CHIEFACCOUNTINGOFFICER", label: "Chief accounting officer" },
    { code: "CHIEFEXECUTIVEOFFICER", label: "Chief executive officer" },
    { code: "CHIEFFINANCIALOFFICER", label: "Chief financial officer" },
    { code: "TAXOFFICER", label: "Tax officer" },
    { code: "CHIEFOPERATINGOFFICER", label: "Chief operating officer" },
    { code: "CORPORATEOFFICER", label: "Corporate officer" },
    { code: "EXECUTIVEDIRECTOR", label: "Executive director" },
    { code: "DIRECTOR", label: "Director" },
    { code: "CHAIRMAN", label: "Chairman" },
    { code: "EXECUTIVEADMINISTRATOR", label: "Executive administrator" },
    { code: "ADMINISTRATOR", label: "Administrator" },
    { code: "RECEIVER", label: "Receiver" },
    { code: "TRUSTEE", label: "Trustee" },
    { code: "PASTOR", label: "Pastor" },
    {
      code: "ASSISTANTTORELIGIOUSLEADER",
      label: "Assistant religious leader",
    },
    { code: "REVEREND", label: "Reverend" },
    { code: "PRIEST", label: "Priest" },
    { code: "MINISTER", label: "Minister" },
    { code: "RABBI", label: "Rabbi" },
    {
      code: "LEADEROFRELIGIOUSORGANIZATION",
      label: "Leader of religious organization",
    },
    { code: "SECRETARY", label: "Secretary" },
    { code: "DIRECTOROFTAXATION", label: "Director of taxation" },
    { code: "DIRECTOROFPERSONNEL", label: "Director of personnel" },
  ],
  SPRO: [
    { code: "OWNER", label: "Owner" },
    { code: "SOLEPROPRIETOR", label: "Soleproprietor" },
    { code: "MEMBER", label: "Member" },
    { code: "SOLEMEMBER", label: "Solemember" },
  ],
};

const TaxesAndFormsModalForm = () => {
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({
    BusinessNm: "",
    FirstNm: "",
    MiddleNm: "",
    PayerRef: "",
    TradeNm: "",
    IsDefaultBusiness: true,
    IsEIN: true,
    EINorSSN: "",
    Email: "",
    ContactNm: "",
    Phone: "",
    PhoneExtn: "1",
    Fax: "",
    BusinessType: "", // "ESTE", "PART", "CORP", "EORG", "SPRO"
    BusinessMemberType: "",
    KindOfEmployer: "",
    KindOfPayer: "",
    IsBusinessTerminated: false,
    IsForeign: false,
    Address1: "",
    Address2: "",
    City: "",
    State: "",
    ZipCd: "",
  });

  const getBusinessMemberOptions = () => {
    return data[formData.BusinessType as keyof typeof data] || [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    const data = {
      BusinessNm: formData.BusinessNm,
      FirstNm: formData.FirstNm,
      MiddleNm: formData.MiddleNm,
      PayerRef: formData.PayerRef,
      TradeNm: formData.TradeNm,
      IsDefaultBusiness: formData.IsDefaultBusiness,
      IsEIN: formData.IsEIN,
      EINorSSN: formData.EINorSSN,
      Email: formData.Email,
      ContactNm: formData.ContactNm,
      Phone: formData.Phone,
      PhoneExtn: formData.PhoneExtn,
      Fax: formData.Fax,
      BusinessType: formData.BusinessType,
      SigningAuthority: {
        Name: formData.ContactNm,
        Phone: formData.Phone,
        BusinessMemberType: formData.BusinessMemberType,
      },
      KindOfEmployer: formData.KindOfEmployer,
      KindOfPayer: formData.KindOfPayer,
      IsBusinessTerminated: false,
      IsForeign: false,
      USAddress: {
        Address1: formData.Address1,
        Address2: formData.Address2,
        City: formData.City,
        State: formData.State,
        ZipCd: formData.ZipCd,
      },
    };
    try {
      setIsPending(true);
      const res = await postTaxBanditsBusiness(data);
      if (res?.success) {
        
        toast.success("Business information saved successfully");
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="text-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Legal business name
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              maxLength={50}
              type="text"
              value={formData.BusinessNm}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  BusinessNm: e.target.value,
                })
              }
              required
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Business email
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              //   disabled={!!uid}
              type="email"
              required
              value={formData.Email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  Email: e.target.value,
                })
              }
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Trade Name</label>
            <input
              type="text"
              value={formData.TradeNm}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  TradeNm: e.target.value,
                })
              }
              required
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Employer Type</label>
            <select
              value={formData.KindOfEmployer}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  KindOfEmployer: e.target.value,
                })
              }
              required
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Select Employer Type</option>
              <option value="FEDERALGOVT">Federal Government</option>
              <option value="STATEORLOCAL501C">State or Local 501(c)</option>
              <option value="NONGOVT501C">Non-Government 501C</option>
              <option value="STATEORLOCALNON501C">
                State or Local non 501(c)
              </option>
              <option value="NONEAPPLY">None Apply</option>
            </select>
          </div>
        </div>

        {/* Industry and Business Type Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Payer Type
              <span className="text-base text-red-500">*</span>
            </label>
            <select
              value={formData.KindOfPayer}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  KindOfPayer: e.target.value,
                })
              }
              required
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Choose your industry</option>
              <option value="REGULAR941">Regular 941</option>
              <option value="REGULAR944">REGULAR 944</option>
              <option value="AGRICULTURAL943">Agricultural 943</option>
              <option value="HOUSEHOLD ">HOUSEHOLD</option>
              <option value="MILITARY">MILITARY </option>
              <option value="MEDICAREQUALGOVEM">MEDICAREQUALGOVEM </option>
              <option value="RAILROADFORMCT1">RAILROADFORMCT1</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Business phone number
              <span className="text-base text-red-500">*</span>
            </label>
            <input
              //   disabled={!!uid}
              value={formData.Phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  Phone: e.target.value,
                })
              }
              maxLength={20}
              type="tel"
              required
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>

        {/* Business Type */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Business type
              <span className="text-base text-red-500">*</span>
            </label>
            <select
              value={formData.BusinessType}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  BusinessType: e.target.value,
                  BusinessMemberType: "",
                });
              }}
              required
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Choose your business type</option>
              <option value="SPRO">Sole Proprietor</option>
              <option value="ESTE">Estates</option>
              <option value="PART">Partnership</option>
              <option value="CORP">Corporation</option>
              <option value="EORG">Exempt Organization</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">
              Business Member type
              <span className="text-base text-red-500">*</span>
            </label>
            <select
              value={formData.BusinessMemberType}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  BusinessMemberType: e.target.value,
                });
              }}
              required
              className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            >
              <option value="">Choose your type</option>
              {getBusinessMemberOptions().map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 flex flex-col gap-2">
            <label className="text-accent_soft_black">
              {!formData?.IsEIN ? "EIN" : "SSN"}
              <span className="text-base text-red-500"> *</span>{" "}
              {/* {uid && (
                <span className="text-xs font-light text-accent_soft_black">
                  (contact support for any change)
                </span>
              )} */}
            </label>
            {false ? (
              <p className="cursor-not-allowed rounded-md border bg-gray-100 px-4 py-2.5">
                Provided <br />
              </p>
            ) : (
              <div className="flex items-center gap-4">
                <PatternInput
                  value={formData.EINorSSN}
                  setValue={(value: any) =>
                    setFormData({ ...formData, EINorSSN: value })
                  }
                />
                <Button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, IsEIN: !formData?.IsEIN });
                  }}
                  className="px-2 py-1 text-sm font-light hover:bg-gray-200"
                >
                  Use {formData?.IsEIN ? "EIN" : "SSN"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <hr className="py-2" />
        {/* Address Section */}
        <div className="space-y-4">
          <h1 className="my-2 text-lg font-normal">Business address</h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">
                Address line 1<span className="text-base text-red-500">*</span>
              </label>
              <input
                value={formData.Address1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Address1: e.target.value,
                  })
                }
                maxLength={50}
                type="text"
                required
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">
                Address line 2<span className="text-base text-red-500">*</span>
              </label>
              <input
                value={formData.Address2}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Address2: e.target.value,
                  })
                }
                maxLength={50}
                type="text"
                required
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">
                ZIP code
                <span className="text-base text-red-500">*</span>
              </label>
              <input
                maxLength={10}
                type="text"
                value={formData.ZipCd}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ZipCd: e.target.value,
                  })
                }
                required
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">
                City
                <span className="text-base text-red-500">*</span>
              </label>
              <input
                maxLength={20}
                type="text"
                value={formData.City}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    City: e.target.value,
                  })
                }
                required
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">
                State
                <span className="text-base text-red-500">*</span>
              </label>
              <select
                required
                value={formData.State}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    State: e.target.value,
                  })
                }
                className="max-w-sm rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              >
                {USStates?.map((state) => {
                  return (
                    <option key={state.value} value={state.value}>
                      {state.title}
                    </option>
                  );
                })}

                <option value="">Select state</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="py-2" />
        <h1 className="my-2 text-lg font-normal">Personal Information</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">First Name</label>
            <input
              type="text"
              value={formData.FirstNm}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  FirstNm: e.target.value,
                })
              }
              required
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Middle Name</label>
            <input
              type="text"
              value={formData.MiddleNm}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  MiddleNm: e.target.value,
                })
              }
              required
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Payer Reference</label>
            <input
              type="text"
              value={formData.PayerRef}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  PayerRef: e.target.value,
                })
              }
              required
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Contact Name</label>
            <input
              type="text"
              value={formData.ContactNm}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  ContactNm: e.target.value,
                })
              }
              required
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-accent_soft_black">Fax</label>
            <input
              type="text"
              value={formData.Fax}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  Fax: e.target.value,
                })
              }
              required
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        </div>

        <div className="flex w-full justify-center gap-7 bg-white pt-12">
          <Button
            type="button"
            className="rounded border border-accent_soft_black px-12 py-2 text-accent_soft_black transition-all hover:bg-accent_soft_black hover:text-white"
          >
            Cancel
          </Button>
          <Button
            isLoading={isPending}
            type="submit"
            disabled={isPending}
            className="rounded bg-accent_soft_black px-12 py-2 text-white"
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaxesAndFormsModalForm;
