import Label from "@/components/ui/RawLabel";
import PhoneInput from "react-phone-input-2";
import Input from "@/components/ui/RawInput";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { countryList, Currencies } from "@/lib/helpers/Customer";
import Button from "@/components/ui/RawButton";
import "react-phone-input-2/lib/style.css";
import "./PhoneInput.module.css";
import Image from "next/image";
import { FiEdit } from "react-icons/fi";
import { BiTrash } from "react-icons/bi";
import TermSelectDropDown from "../../../../../components/ui/ScrollSelectDropDowns/TermsSelectDropDown";
import {
  fetchSingleCustomer,
  patchCustomer,
  postCustomer,
} from "@/app/helpers/backend";
import MainLoader from "@/components/MainLoader/MainLoader";
import { USStates } from "@/lib/helpers/UsaStates";

type customerType = {
  currency: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  company_name: string;
  company_email: string;
  email: string;
  telephone_number: string;
  mobile_number: string;
  image: any;
  fax: string;
  website: string;
  date: string;
  opening_balance: string;
  description: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  term_uid: string;
  payment_method: string;
  delivery_option: string;
  files: FileList | null;
};

const DeliveryOptions = [
  {
    value: "PRINT_LATTER",
    label: "Print Latter",
  },
  {
    value: "SEND_LETTER",
    label: "Send Latter",
  },
  {
    value: "COMPANY_DEFAULT",
    label: "Company Default",
  },
];

const PaymentOptions = [
  {
    value: "CASH",
    label: "Cash",
  },
  {
    value: "CHEQUE",
    label: "Cheque",
  },
  {
    value: "CREDIT_CARD",
    label: "Credit Card",
  },
  {
    value: "DIRECT_DEBIT",
    label: "Direct Card",
  },
];

const CreateCustomer = ({
  setValue,
  refetch,
  setIsOpen,
  onSuccess,
  uid,
}: {
  uid?: string;
  setValue?: any;
  onSuccess?: any;
  refetch?: any;
  setIsOpen?: any;
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [parent, setParent] = useState<any>(null);
  const [customerData, setCustomerData] = useState<customerType>({
    currency: "USD",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    company_name: "",
    company_email: "",
    email: "",
    telephone_number: "",
    mobile_number: "",
    fax: "",
    website: "",
    image: "",
    date: "",
    opening_balance: "",
    description: "",
    street: "",
    city: "",
    province: "",
    postal_code: "",
    country: "",
    term_uid: "",
    payment_method: "CASH",
    delivery_option: "COMPANY_DEFAULT",
    files: null,
  });

  useEffect(() => {
    if (uid) {
      const fn = async () => {
        try {
          setIsPending(true);
          const res = await fetchSingleCustomer(uid);
          if (res?.uid) {
            setParent(res?.term_items || null);
            setImageSrc(res.image || "");
            setCustomerData({
              currency: res.currency,
              first_name: res.first_name,
              middle_name: res.middle_name || "",
              last_name: res.last_name || "",
              suffix: res.suffix || "",
              company_name: res.company_name || "",
              company_email: res.company_email || "",
              email: res.email || "",
              telephone_number: res.telephone_number || "",
              mobile_number: res.mobile_number || "",
              fax: res.fax || "",
              website: res.website || "",
              image: res.image || "",
              date: res.date || "",
              opening_balance: res.opening_balance || 0,
              description: res.description || "",
              street: res?.address?.street || "",
              city: res?.address?.city || "",
              province: res?.address?.province || "",
              postal_code: res?.address?.postal_code || "",
              country: res?.address?.country || "",
              term_uid: parent?.value || "",
              payment_method: res.payment_method || "",
              delivery_option: res.delivery_option || "",
              files: null,
            });
          }
        } catch (error) {
          toast.error("Failed to fetch customer");
        } finally {
          setIsPending(false);
        }
      };
      fn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const handleCreateCustomer = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const formData = new FormData();
    formData.append("currency", customerData.currency);
    formData.append("first_name", customerData.first_name);
    formData.append("middle_name", customerData.middle_name);
    formData.append("last_name", customerData.last_name);
    formData.append("suffix", customerData.suffix);
    formData.append("company_name", customerData.company_name);
    formData.append("company_email", customerData.company_email);
    formData.append("email", customerData.email);
    formData.append("fax", customerData.fax);
    formData.append("mobile_number", customerData.mobile_number);
    formData.append("telephone_number", customerData.telephone_number);
    formData.append("opening_balance", customerData.opening_balance || "0");
    formData.append("description", customerData.description);
    formData.append("street", customerData.street);
    formData.append("city", customerData.city);
    formData.append("province", customerData.province);
    formData.append("postal_code", customerData.postal_code);
    formData.append("term_uid", parent?.uid || "");
    formData.append("payment_method", customerData.payment_method);
    formData.append("delivery_option", customerData.delivery_option);
    formData.append("website", customerData.website);
    formData.append("country", customerData.country);
    formData.append("status", "ACTIVE");
    if (customerData.image && customerData?.image?.name) {
      formData.append("image", customerData.image);
    }
    if (customerData.files != null) {
      if (customerData?.files[0]?.size > 50 * 1024 * 1024) {
        return toast.warning("File Size Can't be larger than 50 MB");
      }
      formData.append("files", customerData.files[0]);
    }
    try {
      setIsLoading(true);
      if (uid) {
        const res: any = await patchCustomer(uid, formData);
        if (res.success) {
          toast.success("Customer updated");
          refetch && refetch();
          setIsOpen && setIsOpen(false);
        }
      } else {
        const res: any = await postCustomer(formData);
        if (res?.success) {
          setDefaultValue();
          toast.success("Customer created");
          onSuccess && onSuccess(res);
          setValue && setValue(res);
          refetch && refetch();
          setIsOpen && setIsOpen(false);
        }
      }
    } catch (error) {
      //error goes here
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!uid) {
      setDefaultValue();
    }
  }, [uid]);

  const setDefaultValue = () => {
    setCustomerData({
      currency: "USD",
      first_name: "",
      middle_name: "",
      last_name: "",
      suffix: "",
      company_name: "",
      company_email: "",
      email: "",
      image: "",
      telephone_number: "",
      mobile_number: "",
      fax: "",
      website: "",
      date: "",
      opening_balance: "",
      description: "",
      street: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
      term_uid: "",
      payment_method: "",
      delivery_option: "",
      files: null,
    });
    setImageSrc("");
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setCustomerData({ ...customerData, image: files[0] });
    }
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setImageSrc(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // useEffect(() => {
  //   if (isSuccess) {
  //     onSuccess && onSuccess(data);
  //     setValue && setValue(data);
  //     setIsOpen(false);
  //     if (Refetch) {
  //       Refetch();
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isSuccess]);

  if (isPending) {
    return <MainLoader className="h-50vh" color="#9ca3af" />;
  }

  return (
    <div>
      <form onSubmit={handleCreateCustomer}>
        {/* shift info */}
        <div
          style={{ boxShadow: "0px 4px 40px 0px #0000001A" }}
          className="rounded-xl bg-white p-4"
        >
          <div className="uppercase text-[#7E84A3]">
            <p>Customer</p>
          </div>
          <hr className="mb-2 mt-2 bg-[#D7DBEC]" />
          <div className="grid grid-cols-2 items-center gap-5">
            <div className="mt-4 flex flex-col gap-2">
              <Label className="block text-[#5A607F]">Profile Image</Label>
              <div className="flex items-center gap-2">
                <div className="h-24 w-24 rounded-full bg-[#D9D9D9]">
                  {imageSrc && (
                    <Image
                      src={imageSrc}
                      width={93}
                      height={85}
                      alt="avatar"
                      className="h-full w-full rounded-full object-cover"
                    />
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden overflow-hidden"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="picture-upload">
                    <FiEdit className="ml-4 mr-2 cursor-pointer text-2xl text-[#7E84A3]" />
                  </label>
                  <Button
                    onClick={() => {
                      setImageSrc("");
                      setCustomerData({ ...customerData, image: "" });
                    }}
                    type="button"
                    className="p-1"
                  >
                    <BiTrash className="text-2xl text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <Label className="block text-[#5A607F]">Currency</Label>

              <select
                value={customerData.currency}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    currency: e.target.value,
                  }))
                }
                className="mt-2 w-full rounded-lg border bg-transparent px-4 py-2.5 outline-none"
              >
                {Currencies.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 mt-2">
              <div className="uppercase text-[#7E84A3]">Name and Contacts</div>
              <hr className="mt-2 bg-[#D7DBEC]" />
            </div>

            <div>
              <Label className="block text-[#5A607F]">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={customerData.first_name}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    first_name: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
                required
              />
            </div>
            <div>
              <Label className="block text-[#5A607F]">Middle Name</Label>
              <Input
                value={customerData.middle_name}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    middle_name: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>

            <div>
              <Label className="block text-[#5A607F]">Last Name</Label>
              <Input
                value={customerData.last_name}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    last_name: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>

            <div>
              <Label className="block text-[#5A607F]">Suffix</Label>
              <Input
                value={customerData.suffix}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    suffix: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>
            <div>
              <Label className="block text-[#5A607F]">Company Name</Label>
              <Input
                value={customerData.company_name}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    company_name: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>
            <div>
              <Label className="block text-[#5A607F]">Company Email</Label>
              <Input
                value={customerData.company_email}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    company_email: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>
            <div>
              <Label className="block text-[#5A607F]">Email</Label>
              <Input
                value={customerData.email}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>
            <div>
              <Label className="block text-[#5A607F]">Phone</Label>
              <Input
                value={customerData.telephone_number}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    telephone_number: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>
            <div>
              <Label className="mb-2 block text-[#5A607F]">Mobile Number</Label>

              <PhoneInput
                inputProps={{
                  name: "phone",
                  required: false,
                  autoFocus: true,
                }}
                isValid={false}
                inputStyle={{
                  height: "44px",
                  background: "transparent",
                  borderColor: "#A1A7C4",
                  width: "100%",
                }}
                country={"us"}
                buttonStyle={{
                  background: "transparent",
                  borderColor: "#A1A7C4",
                }}
                value={customerData.mobile_number}
                onChange={(value) => {
                  setCustomerData((prev) => ({
                    ...prev,
                    mobile_number: `+${value}`,
                  }));
                }}
                enableSearch={true}
                disableSearchIcon={true}
              />
            </div>
            <div>
              <Label className="block text-[#5A607F]">Fax</Label>
              <Input
                value={customerData.fax}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    fax: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>
            <div>
              <Label className="block text-[#5A607F]">Other</Label>
              <Input
                // value={customerData.telephone_number}
                // onChange={(e) =>
                //   setCustomerData((prev) => ({
                //     ...prev,
                //     telephone_number: e.target.value,
                //   }))
                // }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>
            <div>
              <Label className="block text-[#5A607F]">Website</Label>
              <Input
                value={customerData.website}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    website: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>
          </div>
        </div>

        {/* billing address */}
        <div
          style={{ boxShadow: "0px 4px 40px 0px #0000001A" }}
          className="mt-4 rounded-xl bg-[#FFF] p-4"
        >
          <div className="uppercase text-[#7E84A3]">
            <p>ADDRESS</p>
          </div>
          <hr className="mb-5 mt-2 bg-[#D7DBEC]" />
          <div className="grid grid-cols-2 items-center gap-5">
            <div>
              <Label className="block text-[#5A607F]">Street</Label>
              <Input
                value={customerData.street}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    street: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>
            <div>
              <Label className="block text-[#5A607F]">City</Label>
              <Input
                value={customerData.city}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>
            <div>
              <Label className="block text-[#5A607F]">State or Province</Label>
              <select
                value={customerData.province}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    province: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
                // required
              >
                <option value="">Select</option>
                {USStates?.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="block text-[#5A607F]">Postal Code</Label>
              <Input
                value={customerData.postal_code}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    postal_code: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>
            <div>
              <Label className="block text-[#5A607F]">Country</Label>
              <select
                value={customerData.country}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    country: e.target.value,
                  }))
                }
                defaultValue=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
              >
                <option value="" defaultChecked>
                  Select Country
                </option>
                {countryList.map((country) => (
                  <option key={country.tld} value={country.tld}>
                    {country.country}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* <div className="mt-1">
              <a className="text-sm font-semibold text-[#6A6EF6]">
                Preview address
              </a>
            </div> */}
        </div>

     
        <div
          style={{ boxShadow: "0px 4px 40px 0px #0000001A" }}
          className="mt-4 rounded-xl bg-[#FFF] p-4"
        >
          <div className="uppercase text-[#7E84A3]">
            <p>Notes and attachments</p>
          </div>
          <hr className="mb-5 mt-2 bg-[#D7DBEC]" />
          <div>
            <Label className="block text-[#5A607F]">Notes</Label>
            <textarea
              value={customerData.description}
              onChange={(e) =>
                setCustomerData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder=""
              className="mt-2 h-20 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-6 py-4 outline-none"
            ></textarea>
          </div>
          <div className="mb-6 mt-4 rounded-lg">
            <div className="rounded-xl border border-dashed border-accent_soft_blue bg-[#F8F8FF] p-3">
              <h1 className="mb-2 font-semibold text-[#414042]">
                Upload your Documents
              </h1>
              <div className="flex w-full max-w-lg items-center gap-4">
                <div
                  className=""
                  // onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <p className="text-gray-500">
                    Click to browse or drag and drop your files or{" "}
                  </p>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="file-upload_customer"
                      className="mt-2 cursor-pointer rounded-xl border border-[#7E84A3] px-2 py-1 text-[#7E84A3]"
                    >
                      Browse files
                    </label>
                    <input
                      // value={customerData.files}
                      onChange={(e) => {
                        setCustomerData((prev) => ({
                          ...prev,
                          files: e.target.files,
                        }));
                      }}
                      id="file-upload_customer"
                      type="file"
                      placeholder="Browse Files"
                      accept=".pdf, .png, .jpg, .jpeg, .docx"
                      className="hidden h-full w-full cursor-pointer opacity-0"
                      // onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    />
                    {customerData.files && <p>{customerData.files[0]?.name}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{ boxShadow: "0px 4px 40px 0px #0000001A" }}
          className="mt-4 rounded-xl bg-[#FFF] p-4"
        >
          <div className="text-[#7E84A3]">
            <p>PAYMENTS</p>
          </div>
          <hr className="mb-5 mt-2 bg-[#D7DBEC]" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-[#5A607F]">
                Primary Payment Method
              </Label>
              <select
                value={customerData.payment_method}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    payment_method: e.target.value,
                  }))
                }
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-[#5A607F] outline-none"
              >
                {PaymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="block text-[#5A607F]">Terms</Label>
              <TermSelectDropDown
                parentClassName="mt-2"
                ClassName="border border-accent_text_slate rounded-md "
                setValue={(e: any) => setParent(e)}
                value={parent}
                required={false}
              />
              {/* <TermsSelect value={parent} onChange={setParent} /> */}
              {/* <select
                value={customerData.term_uid}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    term_uid: e.target.value,
                  }))
                }
                defaultValue=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-[#5A607F] outline-none"
                required
              >
                <option value="" defaultChecked>
                  Select Terms
                </option>
                {terms.map((term) => (
                  <option key={term.uid} value={term.uid}>
                    {term.title}
                  </option>
                ))}
              </select> */}
            </div>
            <div>
              <Label className="block text-[#5A607F]">Delivery Options</Label>
              <select
                value={customerData.delivery_option}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    delivery_option: e.target.value,
                  }))
                }
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 text-[#5A607F] outline-none"
              >
                {DeliveryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div
          style={{ boxShadow: "0px 4px 40px 0px #0000001A" }}
          className="mt-4 rounded-xl bg-[#FFF] p-4"
        >
          <div className="uppercase text-[#7E84A3]">Additional info</div>
          <hr className="mb-5 mt-2 bg-[#D7DBEC]" />
          <div className="flex gap-4">
            <div className="w-full">
              <Label className="block text-[#5A607F]">Opening Balance</Label>
              <input
                value={customerData.opening_balance}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    opening_balance: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-6 py-4"
                type="number"
                disabled={uid ? true : false}
              />
            </div>
            <div className="w-full">
              <Label className="block text-[#5A607F]">As Of</Label>
              <input
                value={customerData.date}
                onChange={(e) =>
                  setCustomerData((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }))
                }
                className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-6 py-4"
                type="date"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex items-center justify-center gap-10">
          <a
            onClick={() => {
              setIsOpen && setIsOpen(false);
            }}
            className="min-w-40 max-w-80 cursor-pointer rounded-lg border border-[#6A6EF6] px-6 py-3 text-center font-semibold text-[#6A6EF6]"
          >
            Cancel
          </a>
          <Button
            className="flex min-w-40 max-w-80 items-center justify-center bg-[#00035F] text-white"
            type="submit"
            isLoading={isLoading}
          >
            {isLoading ? "Saving..." : uid ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCustomer;
