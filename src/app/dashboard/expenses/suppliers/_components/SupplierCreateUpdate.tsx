import FileUpload from "../../../../../components/FileUpload/FileUpload";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { countryList } from "@/lib/helpers/Customer";
import { currencyChoices } from "@/lib/helpers/COAData";
import Button from "@/components/ui/RawButton";
import {
  getSingleSupplier,
  patchSupplier,
  postSupplier,
} from "@/app/helpers/backend";
import TermSelectDropDown from "@/components/ui/ScrollSelectDropDowns/TermsSelectDropDown";
import { FiEdit } from "react-icons/fi";
import { BiTrash } from "react-icons/bi";
import Label from "@/components/ui/RawLabel";
import Image from "next/image";
import MainLoader from "@/components/MainLoader/MainLoader";
interface Option {
  uid?: string;
  refetchData?: any;
  setIsRefetchAgain?: any;
  isRefetchAgain?: any;
  setIsOpen: any;
  setValue?: any;
  onSuccess?: any;
}

const SupplierCreateUpdate = ({
  setValue,
  onSuccess,
  refetchData,
  uid,
  setIsRefetchAgain,
  isRefetchAgain,
  setIsOpen,
}: Option) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [image, setImage] = useState<any>("");
  const [selectedCountryFlag, setSelectedCountryFlag] = useState("us");
  const [isInitial, setIsInitial] = useState(true);
  const [supplierData, setSupplierData] = useState<any>({
    currency: "USD",
    title: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    display_name: "",
    suffix: "",
    company_name: "",
    email: "",
    telephone_number: "",
    mobile_number: "",
    fax: "",
    website: "",
    business_id: "",
    billing_rate: "",
    account_number: "",
    opening_balance: "",
    kind: "",
    description: "",
    country: "",
    street: "",
    city: "",
    province: "",
    postal_code: "",
    status: "ACTIVE",
  });
  const [terms, setTerms] = useState<any>({});
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    const getSupplierDetails = async () => {
      try {
        setIsPending(true);
        const supplierDetails = await getSingleSupplier(uid);
        setTerms({
          label: supplierDetails?.term_items?.title || "",
          value: supplierDetails?.term_items?.uid || "",
        });
        setImageSrc(supplierDetails.image || "");
        setSupplierData({
          ...supplierData,
          currency: supplierDetails?.currency,
          title: supplierDetails?.title,
          first_name: supplierDetails?.first_name,
          middle_name: supplierDetails?.middle_name,
          last_name: supplierDetails?.last_name,
          display_name: supplierDetails?.display_name,
          suffix: supplierDetails?.suffix,
          company_name: supplierDetails?.company_name,
          email: supplierDetails?.email,
          telephone_number: supplierDetails?.telephone_number,
          mobile_number: supplierDetails?.mobile_number,
          fax: supplierDetails?.fax,
          website: supplierDetails?.website,
          business_id: supplierDetails?.business_id,
          billing_rate: supplierDetails?.billing_rate,
          account_number: supplierDetails?.account_number,
          opening_balance: supplierDetails?.opening_balance,
          kind: supplierDetails?.kind,
          description: supplierDetails?.description,
          country: supplierDetails?.address?.country,
          street: supplierDetails?.address?.street,
          city: supplierDetails?.address?.city,
          province: supplierDetails?.address?.province,
          postal_code: supplierDetails?.address?.postal_code,
        });
      } catch (error) {
        toast.error("Something went wrong while getting the supplier details");
      } finally {
        setIsPending(false);
      }
    };
    if (uid) {
      getSupplierDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const handleFileInputChangeSupplier = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPostLoading(true);

    // Remove empty file field from FormData
    // terms.value && setEditData({ ...editData, term: terms.value || "" });
    // editData?.display_name && setEditData((prev)=> ({...prev, display_name: editData?.first_name}))
    const formData = new FormData();
    Object.keys(supplierData).forEach((key) => {
      formData.append(
        key,
        supplierData[key as keyof typeof supplierData] || "",
      );
    });
    terms?.uid && formData.append("term", terms.uid || "");

    if (selectedFile) {
      formData.append("file", selectedFile);
    }
    if (image) {
      formData.append("image", image);
    }

    try {
      if (uid) {
        const result = await patchSupplier(uid, formData);
        if (result.success) {
          toast.success("Supplier Updated");
          setValue && setValue(result);
          onSuccess && onSuccess(result);
          setIsOpen(false);
          resetForm();
          if (refetchData) refetchData();
          if (setIsRefetchAgain) {
            setIsRefetchAgain(!isRefetchAgain);
          }
        }
      } else {
        const result = await postSupplier(formData);
        if (result.success) {
          toast.success("Supplier Created successfully!");
          setIsOpen(false);
          resetForm();
          refetchData && refetchData();
          if (setIsRefetchAgain) {
            setIsRefetchAgain(!isRefetchAgain);
          }
        }
      }
    } catch (error) {
      if (setIsRefetchAgain) {
        setIsRefetchAgain(!isRefetchAgain);
      }
      // toast.error("Something went wrong.");
      // console.error("Error:", error);
    } finally {
      if (setIsRefetchAgain) {
        setIsRefetchAgain(!isRefetchAgain);
      }
      setPostLoading(false);
    }
  };

  const handleFlagChange = (value: string) => {
    setSelectedCountryFlag(value);
  };

  const resetForm = () => {
    setSupplierData({
      currency: "USD",
      title: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      display_name: "",
      suffix: "",
      company_name: "",
      email: "",
      telephone_number: "",
      mobile_number: "",
      fax: "",
      website: "",
      business_id: "",
      billing_rate: "",
      account_number: "",
      opening_balance: "",
      kind: "",
      description: "",
      country: "",
      street: "",
      city: "",
      province: "",
      postal_code: "",
      status: "ACTIVE",
      image: "",
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setImage(files[0]);
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

  useEffect(() => {
    resetForm();
  }, [uid]);

  if (isPending) {
    return <MainLoader color="#9ca3af" />;
  }

  return (
    <div>
      <>
        <form onSubmit={handleSubmit}>
          <div className="bg-[#F5F6FA] px-5 py-8 text-[#5A607F]">
            <div className="mb-4 flex flex-col gap-2">
              <Label className="block text-[#5A607F]">Profile Image</Label>
              <div className="flex items-center gap-2">
                <div className="h-24 w-24 rounded-full bg-[#D9D9D9]">
                  {imageSrc && (
                    <Image
                      src={imageSrc}
                      width={100}
                      height={100}
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
                      setImage("");
                    }}
                    type="button"
                    className="p-1"
                  >
                    <BiTrash className="text-2xl text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
            <h2 className="text-[20px]">Name & Contact</h2>
            <div className="mt-3 flex justify-between gap-4">
              <div className="w-full">
                <label
                  htmlFor="currency"
                  className="mb-2 block text-sm font-medium text-accent_text_gray"
                >
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  value={supplierData?.currency}
                  onChange={(e) => {
                    setSupplierData({
                      ...supplierData,
                      currency: e.target.value,
                    });
                    currencyChoices?.map((currency) => {
                      if (currency.value == e.target.value) {
                        handleFlagChange(currency.flag);
                      }
                    });
                  }}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
                  required
                >
                  <option value="" disabled selected>
                    Select currency
                  </option>
                  {currencyChoices.map((currency) => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5 flex gap-x-3">
              <div>
                <p className="pb-2 text-[14px] font-medium">Title</p>
                <div>
                  <input
                    type="text"
                    value={supplierData?.title}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        title: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-full border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Title"
                  />
                </div>
              </div>
              <div>
                <p className="pb-2 text-[14px] font-medium">
                  First Name <span className="text-red-500">*</span>
                </p>
                <div>
                  <input
                    type="text"
                    value={supplierData?.first_name}
                    onChange={(e) => {
                      setSupplierData({
                        ...supplierData,
                        first_name: e.target.value,
                      });
                    }}
                    className="input input-bordered rounded-md px-4 py-2 w-full border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="First Name"
                    required
                  />
                </div>
              </div>
              <div>
                <p className="pb-2 text-[14px] font-medium">Middle Name</p>
                <div>
                  <input
                    type="text"
                    value={supplierData?.middle_name}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        middle_name: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-full border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Middle Name"
                  />
                </div>
              </div>
              <div>
                <p className="pb-2 text-[14px] font-medium">Last Name</p>
                <div>
                  <input
                    type="text"
                    value={supplierData?.last_name}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        last_name: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-full border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Last Name"
                  />
                </div>
              </div>
              <div>
                <p className="pb-2 text-[14px] font-medium">Suffix</p>
                <div>
                  <input
                    type="text"
                    value={supplierData?.suffix}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        suffix: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-full border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Suffix"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-between">
              <div>
                <p className="pb-2 text-[14px] font-medium">
                  Supplier Display Name
                </p>
                <div>
                  <input
                    type="text"
                    value={
                      !isInitial
                        ? supplierData?.display_name
                        : supplierData?.first_name
                    }
                    onChange={(e) => {
                      setSupplierData({
                        ...supplierData,
                        display_name: e.target.value,
                      });
                      setIsInitial(false);
                    }}
                    className="input input-bordered rounded-md px-4 py-2 w-[413px] flex-1 border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Supplier Display Name"
                  />
                </div>
              </div>
              <div>
                <p className="pb-2 text-[14px] font-medium">Company Name</p>
                <div className="w-full">
                  <input
                    type="text"
                    value={supplierData?.company_name}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        company_name: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-[413px] border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Company Name"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <div>
                <p className="pb-2 text-[14px] font-medium">Email</p>
                <div>
                  <input
                    type="email"
                    value={supplierData?.email}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        email: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-[413px] border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Email"
                  />
                </div>
              </div>
              <div>
                <p className="pb-2 text-[14px] font-medium">Telephone Number</p>
                <div className="w-full">
                  <input
                    type="tel"
                    value={supplierData?.telephone_number}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        telephone_number: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-[413px] border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Telephone Number"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <div className="flex-1">
                <p className="pb-2 text-[14px] font-medium">Mobile Number</p>
                <div>
                  <PhoneInput
                    key={selectedCountryFlag}
                    inputProps={{
                      name: "phone",
                      required: true,
                      autoFocus: true,
                    }}
                    isValid={false}
                    inputStyle={{
                      height: "44px",
                      background: "transparent",
                      borderColor: "#A1A7C4",
                      width: "90%",
                      flex: 1,
                    }}
                    onlyCountries={[selectedCountryFlag]}
                    country={selectedCountryFlag}
                    buttonStyle={{
                      background: "transparent",
                      borderColor: "#A1A7C4",
                    }}
                    value={supplierData?.mobile_number}
                    onChange={(value) =>
                      setSupplierData({
                        ...supplierData,
                        mobile_number: `+${value}`,
                      })
                    }
                    enableSearch={true}
                    disableSearchIcon={true}
                  />
                </div>
              </div>
              <div>
                <p className="pb-2 text-[14px] font-medium">Fax</p>
                <div className="w-full">
                  <input
                    type="text"
                    value={supplierData?.fax}
                    onChange={(e) =>
                      setSupplierData({ ...supplierData, fax: e.target.value })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-[413px] border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Fax"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-between">
              <div>
                <p className="pb-2 text-[14px] font-medium">Website</p>
                <div className="w-full">
                  <input
                    type="url"
                    value={supplierData?.website}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        website: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-[413px] border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Website"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="mt-[30px] bg-[#F5F6FA] p-4 text-[#5A607F]">
            <div>
              <p className="pb-2 text-[14px] font-medium">Street</p>
              <div>
                <input
                  type="text"
                  value={supplierData?.street}
                  onChange={(e) =>
                    setSupplierData({ ...supplierData, street: e.target.value })
                  }
                  className="input input-bordered rounded-md px-4 py-2 w-full border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                  placeholder="Street"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-x-3">
              <div>
                <p className="pb-2 text-[14px] font-medium">City</p>
                <div>
                  <input
                    type="text"
                    value={supplierData?.city}
                    onChange={(e) =>
                      setSupplierData({ ...supplierData, city: e.target.value })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-full border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="City"
                  />
                </div>
              </div>
              <div>
                <p className="pb-2 text-[14px] font-medium">Province</p>
                <div>
                  <input
                    type="text"
                    value={supplierData?.province}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        province: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-full border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Province"
                  />
                </div>
              </div>
              <div>
                <p className="pb-2 text-[14px] font-medium">Postal Code</p>
                <div>
                  <input
                    type="text"
                    value={supplierData?.postal_code}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        postal_code: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-full border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Postal Code"
                  />
                </div>
              </div>
              <div className="w-[250px]">
                <label
                  htmlFor="country"
                  className="mb-2 block text-sm font-medium text-accent_text_gray"
                >
                  Country
                </label>
                <div className=" ">
                  <select
                    value={supplierData?.country}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        country: e.target.value,
                      })
                    }
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
                  >
                    <option value="" disabled selected>
                      Select Country
                    </option>
                    {countryList.map((currency) => (
                      <option key={currency.tld} value={currency.tld}>
                        {currency.country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-[30px] bg-[#F5F6FA] p-4 text-[#5A607F]">
            <div>
              <h2 className="text-[20px]">Notes & Documents</h2>
              <div className="mt-2 rounded-xl">
                <p className="pb-2 text-[14px] font-medium">Notes:</p>
                <textarea
                  value={supplierData?.description}
                  onChange={(e) =>
                    setSupplierData({
                      ...supplierData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Write notes"
                  className="textarea textarea-bordered rounded-md px-4 py-2 h-[96px] w-full border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                />
              </div>
              <FileUpload
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleFileInputChangeSupplier={handleFileInputChangeSupplier}
                selectedFile={selectedFile}
                required={false} // Add this prop to FileUpload component
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-[#F5F6FA] px-5 py-8 text-[#5A607F]">
            <h2 className="text-[20px]">Additional Information</h2>
            <div className="mt-3 flex justify-between">
              <div>
                <p className="pb-2 text-[14px] font-medium">
                  Business ID No/ Social Insurance No{" "}
                </p>
                <div>
                  <input
                    type="text"
                    value={supplierData?.business_id}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        business_id: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-[413px] border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Business ID No/ Social Insurance No"
                  />
                </div>
              </div>
              <div>
                <p className="pb-2 text-[14px] font-medium">Billing Rate/ hr</p>
                <div className="w-full">
                  <input
                    type="number"
                    value={supplierData?.billing_rate}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        billing_rate: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-[413px] border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Billing Rate/ hr"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-between">
              {/* <div>
                  <p className="pb-2 text-[14px] font-medium">Bank Name</p>
                  <div>
                    <input
                      type="text"
                      name="bank_name"
                      defaultValue={editData?.bank_name}
                      className="input input-bordered h-[42px] w-[413px] border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                      placeholder="Bank Name"
                    />
                  </div>
                </div> */}
              <div>
                <p className="pb-2 text-[14px] font-medium">Opening balance</p>
                <div className="w-full">
                  <input
                    type="number"
                    value={supplierData?.opening_balance}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        opening_balance: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-[413px] border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="0.0"
                    disabled={Boolean(uid)}
                  />
                </div>
              </div>
              <div>
                <p className="pb-2 text-[14px] font-medium">Bank Account No</p>
                <div className="w-full">
                  <input
                    type="text"
                    value={supplierData?.account_number}
                    onChange={(e) =>
                      setSupplierData({
                        ...supplierData,
                        account_number: e.target.value,
                      })
                    }
                    className="input input-bordered rounded-md px-4 py-2 w-[413px] border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Bank Account No"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-between gap-x-4">
              {/* <div>
                <p className="pb-2 text-[14px] font-medium">Bank Routing No</p>
                <div>
                  <input
                    type="text"
                    value={editData?.}
                   onChange={(e)=>setEditData({...editData, description: e.target.value})}
                    className="input input-bordered h-[42px] w-[413px] border border-gray-300 focus:border-[#2684FF] focus:outline-none"
                    placeholder="Bank Routing No"
                  />
                </div>
              </div> */}
              <div className="flex-1">
                <p className="pb-2 text-[14px] font-medium">Payment Terms</p>

                <div>
                  <TermSelectDropDown
                    required={false}
                    parentClassName="mt-2"
                    ClassName="border border-accent_text_slate rounded-md "
                    setValue={(e: any) => setTerms(e)}
                    value={terms}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-between gap-x-4">
              <div className="w-full">
                <label
                  htmlFor="kind"
                  className="mb-2 block text-sm font-medium text-accent_text_gray"
                >
                  Type
                </label>
                <select
                  value={supplierData?.kind}
                  onChange={(e) =>
                    setSupplierData({ ...supplierData, kind: e.target.value })
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
                >
                  <option value="" disabled selected>
                    Select Type
                  </option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="UN_CATEGORIZED_EXPENSE">
                    Un Categorized Expense
                  </option>
                  <option value="COST_OF_SELL">Cost Of Sell</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-x-4">
            <Button
              type="button"
              onClick={() => setIsOpen(false)} // Use onClose to handle modal close
              className="flex h-[45px] w-[142px] items-center justify-center rounded-md border border-accent_soft_black text-accent_soft_black"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={postLoading}
              className="flex min-w-[144px] items-center justify-center rounded-md bg-accent_soft_black text-white"
            >
              {!uid
                ? postLoading
                  ? "Creating..."
                  : "Create"
                : postLoading
                  ? "Updating..."
                  : "Update"}
            </Button>
          </div>
        </form>
      </>
    </div>
  );
};
export default SupplierCreateUpdate;
