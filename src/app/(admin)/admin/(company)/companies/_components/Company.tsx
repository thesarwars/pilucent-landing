import Modal from "@/app/(admin)/_components/Modal";
import {
  fetchSingleCompany,
  fetchUserIdentity,
  patchCompany,
  postCompany,
  postSACompany,
} from "@/app/helpers/backend";
import { useFetch } from "@/app/helpers/hooks";
import MainLoader from "@/components/MainLoader/MainLoader";
import Button from "@/components/ui/RawButton";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import { currencyChoices } from "@/lib/helpers/COAData";
import { industries } from "@/lib/helpers/companyChoices";
import { countryList } from "@/lib/helpers/Customer";
import { toast } from "@/lib/ToastService";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { FiEdit } from "react-icons/fi";
import TimezoneSelect, { type ITimezone } from "react-timezone-select";

const Company = ({
  isOpen,
  setIsOpen,
  uid = "",
  refetch,
}: {
  isOpen: any;
  setIsOpen: any;
  uid?: string | null;
  refetch?: any;
}) => {
  const [imageSrc, setImageSrc] = useState("");
  const [companyData, setCompanyData] = useState<any>({
    name: "",
    legal_name: "",
    kind: "",
    status: "ACTIVE",
    business_id_no: "",
    vat_number: "",
    time_zone: "",
    email: "",
    phone: "",
    website: "",
    company_address: "",
    customer_facing_address: "",
    legal_address: "",
    logo: null,
    user_email: "",
    user_uid: "",
  });
  const [selectedTimezone, setSelectedTimezone] = useState<any>(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    data,
    isPending,
    refetch: SingleRefetch,
  } = useQuery({
    queryKey: ["company", uid],
    queryFn: async () => fetchSingleCompany(uid),
    enabled: !!uid,
  });

  useEffect(() => {
    if (!isPending && data) {
      data?.company_user?.forEach((user: any) => {
        if (user?.is_admin) setUser(user);
      });
      setCompanyData({
        name: data?.name || "",
        legal_name: data?.legal_name || "",
        kind: data?.kind || "",
        status: data?.status || "ACTIVE",
        business_id_no: data?.business_id_no || "",
        vat_number: data?.vat_number || "",
        time_zone: data?.time_zone || "",
        email: data?.email || "",
        phone: data?.phone || "",
        website: data?.website || "",
        company_address: data?.company_address || "",
        customer_facing_address: data?.customer_facing_address || "",
        legal_address: data?.legal_address || "",
        logo: data?.logo || null,
        user_email: "",
        user_uid: "",
      });
      setImageSrc(data?.logo || ""); // Set image preview from fetched data
    }
  }, [data, isPending]);

  useEffect(() => {
    if (!uid) {
      setCompanyData({
        name: "",
        legal_name: "",
        kind: "",
        status: "ACTIVE",
        business_id_no: "",
        vat_number: "",
        time_zone: "",
        email: "",
        phone: "",
        website: "",
        company_address: "",
        customer_facing_address: "",
        legal_address: "",
        logo: null,
        user_email: "",
        user_uid: "",
      });
    }
  }, [uid]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setCompanyData({ ...companyData, logo: files[0] });
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (uid) {
        const data = {
          ...companyData,
          time_zone: selectedTimezone?.label,
          user_uid: user?.uid,
        };
        const response = await patchCompany(uid, data);
        if (response.success) {
          setIsOpen(false);
          refetch && refetch();
          toast.success("Company updated.");
        }
      } else {
        const result = await fetchUserIdentity(companyData?.user_email);
        if (result?.success) {
          const data = {
            ...companyData,
            time_zone: selectedTimezone?.label,
            user_uid: result?.uid,
          };
          const response = await postSACompany(data);
          if (response.success) {
            setIsOpen(false);
            refetch && refetch();
            toast.success("Company created.");
          }
        } else {
          toast.info("User doesn't exist.");
        }
      }
    } catch (error) {
      // toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Company"
        widthClass="w-full md:w-[720px]"
      >
        {uid && isPending ? (
          <MainLoader />
        ) : (
          <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-4">
            <div
              style={{ boxShadow: "0px 4px 40px 0px #0000001A" }}
              className="rounded-xl bg-[#F5F6FA] p-4"
            >
              <div className="uppercase text-[#7E84A3]">
                <p>Company Information</p>
              </div>
              <hr className="mb-2 mt-2 bg-[#D7DBEC]" />
              <div className="grid grid-cols-2 items-center gap-5">
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-24 w-52 rounded-xl bg-[#D9D9D9]">
                      {imageSrc && (
                        <Image
                          src={imageSrc}
                          width={200}
                          height={200}
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
                          // setCustomerData({ ...customerData, image: "" });
                        }}
                        type="button"
                        className="p-1"
                      >
                        <BiTrash className="text-2xl text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 mt-2">
                  <div className="uppercase text-[#7E84A3]">
                    Name and Contacts
                  </div>
                  <hr className="mt-2 bg-[#D7DBEC]" />
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-[#5A607F]">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={companyData.name}
                      onChange={(e) =>
                        setCompanyData((prev: any) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                      required
                    />
                  </div>
                  <div>
                    <Label className="block text-[#5A607F]">Legal Name</Label>
                    <Input
                      value={companyData.legal_name}
                      onChange={(e) =>
                        setCompanyData((prev: any) => ({
                          ...prev,
                          legal_name: e.target.value,
                        }))
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                    />
                  </div>
                  <div>
                    <Label className="block text-[#5A607F]">
                      Company Type <span className="text-red-500">*</span>
                    </Label>
                    <select
                      value={companyData.kind}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          kind: e.target.value,
                        })
                      }
                      className="mt-2 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-2 py-2.5 outline-none"
                      required
                    >
                      <option defaultChecked value="">
                        Select Type
                      </option>
                      {industries?.map((c) => (
                        <option value={c.value} key={c.value}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  {uid ? (
                    <div>
                      <Label className="block text-[#5A607F]">
                        User<span className="text-red-500">*</span>
                      </Label>
                      <input
                        value={user?.username || "Unknown"}
                        onChange={(e) =>
                          setCompanyData((prev: any) => ({
                            ...prev,
                            user_email: e.target.value,
                          }))
                        }
                        placeholder=""
                        className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-6 py-4"
                        type="text"
                        readOnly
                      />
                    </div>
                  ) : (
                    <div>
                      <Label className="block text-[#5A607F]">
                        User Email<span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={companyData.user_email}
                        onChange={(e) =>
                          setCompanyData((prev: any) => ({
                            ...prev,
                            user_email: e.target.value,
                          }))
                        }
                        placeholder=""
                        className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                        type="text"
                      />
                    </div>
                  )}
                  <div>
                    <Label className="block text-[#5A607F]">Business ID</Label>
                    <Input
                      value={companyData.business_id_no}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          business_id_no: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                    />
                  </div>
                  <div>
                    <Label className="block text-[#5A607F]">VAT#</Label>
                    <Input
                      value={companyData.vat_number}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          vat_number: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="block text-[#5A607F]">Time Zone</Label>
                    <div className="select-wrapper">
                      <TimezoneSelect
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            borderColor: "#A1A7C4",
                            borderRadius: "10px",
                            height: "44px",
                            background: "transparent",
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                        value={selectedTimezone}
                        onChange={setSelectedTimezone}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{ boxShadow: "0px 4px 40px 0px #0000001A" }}
              className="rounded-xl bg-[#F5F6FA] p-4"
            >
              <div className="">
                <div className="col-span-2 mt-2">
                  <div className="uppercase text-[#7E84A3]">Contact info</div>
                  <hr className="mt-2 bg-[#D7DBEC]" />
                </div>

                <div className="col-span-2 mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-[#5A607F]">
                      Company Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={companyData.email}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          email: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                      required
                    />
                  </div>
                  <div>
                    <Label className="block text-[#5A607F]">
                      Company Phone
                    </Label>
                    <Input
                      value={companyData.phone}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          phone: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="block text-[#5A607F]">Website</Label>
                    <Input
                      value={companyData.website}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          website: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{ boxShadow: "0px 4px 40px 0px #0000001A" }}
              className="rounded-xl bg-[#F5F6FA] p-4"
            >
              <div className="">
                <div className="col-span-2 mt-2">
                  <div className="uppercase text-[#7E84A3]">address</div>
                  <hr className="mt-2 bg-[#D7DBEC]" />
                </div>

                <div className="col-span-2 mt-2 grid grid-cols-2 gap-4">
                  {/* <div>
                    <Label className="block text-[#5A607F]">Country</Label>
                    <select
                      // value={customerData.country}
                      // onChange={(e) =>
                      //   setCustomerData((prev) => ({
                      //     ...prev,
                      //     country: e.target.value,
                      //   }))
                      // }
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
                  <div>
                    <Label className="block text-[#5A607F]">City</Label>
                    <Input
                      //   value={customerData.first_name}
                      //   onChange={(e) =>
                      //     setCustomerData((prev) => ({
                      //       ...prev,
                      //       first_name: e.target.value,
                      //     }))
                      //   }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                    />
                  </div> */}
                  <div className="col-span-2">
                    <Label className="block text-[#5A607F]">
                      Company Address
                    </Label>
                    <Input
                      value={companyData.company_address}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          company_address: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                    />
                  </div>
                  {/* <div>
                    <Label className="block text-[#5A607F]">Zip Code</Label>
                    <Input
                      //   value={customerData.first_name}
                      //   onChange={(e) =>
                      //     setCustomerData((prev) => ({
                      //       ...prev,
                      //       first_name: e.target.value,
                      //     }))
                      //   }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                    />
                  </div> */}
                  <div className="col-span-2">
                    <Label className="block text-[#5A607F]">
                      Customer Facing Address
                    </Label>
                    <Input
                      value={companyData.customer_facing_address}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          customer_facing_address: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="block text-[#5A607F]">
                      Legal Address
                    </Label>
                    <Input
                      value={companyData.legal_address}
                      onChange={(e) =>
                        setCompanyData({
                          ...companyData,
                          legal_address: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* <div
            style={{ boxShadow: "0px 4px 40px 0px #0000001A" }}
            className="rounded-xl bg-[#F5F6FA] p-4"
          >
            <div className="">
              <div className="col-span-2 mt-2">
                <div className="uppercase text-[#7E84A3]">
                  Billing & subscription information{" "}
                </div>
                <hr className="mt-2 bg-[#D7DBEC]" />
              </div>

              <div className="col-span-2 mt-2 grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-[#5A607F]">
                    Subscription Plan<span className="text-red-500">*</span>
                  </Label>
                  <select
                    // value={customerData.country}
                    // onChange={(e) =>
                    //   setCustomerData((prev) => ({
                    //     ...prev,
                    //     country: e.target.value,
                    //   }))
                    // }
                    className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
                    required
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
                <div>
                  <Label className="block text-[#5A607F]">Billing Cycle</Label>
                  <select
                    // value={customerData.country}
                    // onChange={(e) =>
                    //   setCustomerData((prev) => ({
                    //     ...prev,
                    //     country: e.target.value,
                    //   }))
                    // }
                    className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
                    required
                  >
                    <option value="" defaultChecked>
                      Select 
                    </option>
                    {countryList.map((country) => (
                      <option key={country.tld} value={country.tld}>
                        {country.country}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="block text-[#5A607F]">
                    Billing Status{" "}
                  </Label>
                  <select
                    // value={customerData.country}
                    // onChange={(e) =>
                    //   setCustomerData((prev) => ({
                    //     ...prev,
                    //     country: e.target.value,
                    //   }))
                    // }
                    className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
                    required
                  >
                    <option value="" defaultChecked>
                      Select 
                    </option>
                    {countryList.map((country) => (
                      <option key={country.tld} value={country.tld}>
                        {country.country}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="block text-[#5A607F]">Currency</Label>
                  <select
                    // value={customerData.country}
                    // onChange={(e) =>
                    //   setCustomerData((prev) => ({
                    //     ...prev,
                    //     country: e.target.value,
                    //   }))
                    // }
                    className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
                    required
                  >
                    <option value="" defaultChecked>
                      Select Currency
                    </option>
                    {currencyChoices.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="block text-[#5A607F]">
                    Number of Users
                  </Label>
                  <select
                    // value={customerData.country}
                    // onChange={(e) =>
                    //   setCustomerData((prev) => ({
                    //     ...prev,
                    //     country: e.target.value,
                    //   }))
                    // }
                    className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
                    required
                  >
                    <option value="" defaultChecked>
                      Select
                    </option>
                    {countryList.map((country) => (
                      <option key={country.tld} value={country.tld}>
                        {country.country}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="block text-[#5A607F]">Account Status</Label>
                  <select
                    // value={customerData.country}
                    // onChange={(e) =>
                    //   setCustomerData((prev) => ({
                    //     ...prev,
                    //     country: e.target.value,
                    //   }))
                    // }
                    className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
                    required
                  >
                    <option value="" defaultChecked>
                      Select
                    </option>
                    {countryList.map((country) => (
                      <option key={country.tld} value={country.tld}>
                        {country.country}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 mt-2 flex items-center gap-1">
                <Input
                    //   value={customerData.first_name}
                    //   onChange={(e) =>
                    //     setCustomerData((prev) => ({
                    //       ...prev,
                    //       first_name: e.target.value,
                    //     }))
                    //   }
                    placeholder="https://www.pinterest.com/"
                    className=" h-11 w-full rounded-lg placeholder:text-gray-400 border border-[#A1A7C4] px-6 py-4"
                    type="text"
                    required
                  />
                  <Button type="button" className="text-accent_soft_blue h-11 bg-[#D3D4FA] border border-accent_soft_blue">Copy</Button>
                </div>
              </div>
            </div>
          </div> */}

            <div className="mx-auto mt-14 flex max-w-[325px] items-center justify-center gap-10">
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-[142px] cursor-pointer rounded-lg border border-[#6A6EF6] py-3 text-center font-semibold text-[#6A6EF6]"
              >
                Cancel
              </Button>
              <Button
                className="w-[142px] bg-[#00035F] text-white"
                type="submit"
                isLoading={isLoading}
              >
                {uid ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default Company;
