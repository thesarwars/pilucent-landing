import Button from "@/components/ui/RawButton";
import Checkbox from "@/components/ui/Checkbox/Checkbox";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import GetToken from "@/hooks/getToken";
import { currencyChoices } from "@/lib/helpers/COAData";
import { GetData, Patch } from "@/services/FetchMethods";
import { toastApiError } from "@/lib/helpers/apiErrors";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { RiErrorWarningLine } from "react-icons/ri";
import Select from "./Select";
import { CloseModal } from "@/components/ModalSM/ModalSM";
import DatePicker from "@/components/ui/DatePicker";
import { getAccountTypes, getRootAccountTypes } from "@/app/helpers/backend";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import { toast } from "@/lib/ToastService";

const UpdateAccount = ({
  uid,
  refetch,
  setIsOpen,
}: {
  uid: string;
  refetch: any;
  setIsOpen?: any;
}) => {
  const [accountData, setAccountData] = useState<any>({
    title: "",
    date: "",
    code: "",
    account_type_data: "",
    detail_type_data: "",
    opening_balance: "",
    currency: "",
    description: "",
    parent_uid: "",
  });
  const [isSubAccount, setIsSubAccount] = useState(false);
  const [parent, setParent] = useState<any>(null);
  const [accountTypeData, setAccountTypeData] = useState<any[]>([]);
  const [accountDetailTypeData, setAccountDetailTypeData] = useState<any[]>([]);
  const token = GetToken();
  const { data: Account, isPending } = useQuery({
    queryKey: ["single_account", uid],
    queryFn: async () => {
      const response = await GetData(`we/chart-of-accounts/${uid}`, token);
      // console.log(response);
      return response;
    },
    enabled: !!uid,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (Account) {
      setAccountData({
        title: Account.title,
        date: Account.date,
        code: Account.code,
        account_type_data: Account?.account_type,
        detail_type_data: Account?.detail_type,
        opening_balance: Account.opening_balance,
        currency: Account.currency,
        description: Account.description,
        parent_uid: Account.parent?.uid,
      });
      if (Account.parent) {
        setParent(Account?.parent);
        setIsSubAccount(true);
      } else {
        setParent(null);
        setIsSubAccount(false);
      }
    }
  }, [Account]);

  const {
    mutate: UpdateAccount,
    isPending: isUpdating,
    error,
    isError,
  } = useMutation({
    mutationFn: async (data: any) => {
      const res = await Patch(`we/chart-of-accounts/${uid}`, data, token);
      return res;
    },
    onSuccess: () => {
      toast.success("Account updated");
      setIsOpen && setIsOpen(false);
      refetch();
      CloseModal();
    },
    onError: () => {
      // console.log(res);
      // toast.error("An Unknown Error Occurred!");
    },
  });

  useEffect(() => {
    // Renaming onto an existing title now fails (case-insensitively), and any
    // edit to a control account returns { message: "Fixed account cannot be
    // modified." } — both land here.
    if (isError) toastApiError(error?.message, "Could not update the account.");
  }, [error, isError]);

  const handleUpdateAccount = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const Data1: any = {
      title: accountData.title,
      code: accountData.code,
      currency: accountData.currency,
      account_type_slug: accountData.account_type_data?.slug,
      detail_type_slug: accountData.detail_type_data?.slug,
      date: accountData.date,
      description: accountData.description,
      opening_balance: accountData.opening_balance
        ? accountData.opening_balance
        : 0,
    };

    let Data2: any;
    if (parent && isSubAccount) {
      Data2 = {
        title: accountData.title,
        code: accountData.code,
        currency: accountData.currency,
        account_type_slug: accountData.account_type_data?.slug,
        detail_type_slug: accountData.detail_type_data?.slug,
        date: accountData.date,
        description: accountData.description,
        opening_balance: accountData.opening_balance
          ? accountData.opening_balance
          : 0,
        parent_uid: parent.uid,
      };
    }

    const data = parent !== null ? Data2 : Data1;

    UpdateAccount(data);
  };

  useEffect(() => {
    const fn = async () => {
      const rootAccountType = await getRootAccountTypes();
      const promises = rootAccountType.results.map((type: any) =>
        getAccountTypes(type.slug),
      );
      const results = await Promise.allSettled([...promises]);
      const responses = results.map((response: any) => {
        return response.value.options;
      });
      setAccountTypeData(responses.flat());
    };
    fn();
  }, []);

  const handleChangeAccountType = async (slug: string) => {
    setAccountDetailTypeData([]);
    if (slug) {
      const detailTypes = await getAccountTypes(slug);
      setAccountDetailTypeData(detailTypes.options);
    }
  };

  console.log(accountData);

  return (
    <>
      {isPending ? (
        <>
          <div className="mb-6">
            <div className="mb-2 h-4 w-32 animate-pulse rounded-lg bg-gray-300"></div>
            <div className="h-11 w-full animate-pulse rounded-lg bg-gray-300"></div>
          </div>
          <div className="flex w-full items-center gap-4">
            <div className="mb-4 flex-1">
              <div className="mb-2 h-4 w-32 animate-pulse rounded-lg bg-gray-300"></div>
              <div className="h-11 w-full animate-pulse rounded-lg bg-gray-300"></div>
            </div>
            <div className="mb-4 flex-1">
              <div className="mb-2 h-4 w-32 animate-pulse rounded-lg bg-gray-300"></div>
              <div className="h-11 w-full animate-pulse rounded-lg bg-gray-300"></div>
            </div>
          </div>
          <div className="mb-6">
            <div className="mb-2 h-4 w-32 animate-pulse rounded-lg bg-gray-300"></div>
            <div className="h-11 w-full animate-pulse rounded-lg bg-gray-300"></div>
          </div>
          <div className="mb-4 h-7 w-64 animate-pulse rounded-lg bg-gray-300"></div>
          <div className="mb-4">
            <div className="mb-2 h-4 w-32 animate-pulse rounded-lg bg-gray-300"></div>
            <div className="h-11 w-full animate-pulse rounded-lg bg-gray-300"></div>
          </div>
          <div className="flex w-full items-center gap-4">
            <div className="mb-4 flex-1">
              <div className="mb-2 h-4 w-32 animate-pulse rounded-lg bg-gray-300"></div>
              <div className="h-11 w-full animate-pulse rounded-lg bg-gray-300"></div>
            </div>
            <div className="mb-4 flex-1">
              <div className="mb-2 h-4 w-32 animate-pulse rounded-lg bg-gray-300"></div>
              <div className="h-11 w-full animate-pulse rounded-lg bg-gray-300"></div>
            </div>
          </div>
          <div className="mb-6 flex gap-4">
            <div className="mb-2 h-4 w-full animate-pulse rounded-lg bg-gray-300"></div>
            <div className="h-4 w-full animate-pulse rounded-lg bg-gray-300"></div>
          </div>
          <div className="mb-4">
            <div className="mb-2 h-4 w-32 animate-pulse rounded-lg bg-gray-300"></div>
            <div className="h-11 w-full animate-pulse rounded-lg bg-gray-300"></div>
          </div>
          <div className="mb-4">
            <div className="mb-2 h-4 w-32 animate-pulse rounded-lg bg-gray-300"></div>
            <div className="h-11 w-full animate-pulse rounded-lg bg-gray-300"></div>
          </div>
          <div className="mb-4 mt-10 flex justify-center gap-4">
            <div className="mb-2 h-11 w-40 animate-pulse rounded-lg bg-gray-300"></div>
            <div className="h-11 w-40 animate-pulse rounded-lg bg-gray-300"></div>
          </div>
        </>
      ) : (
        <form
          onSubmit={handleUpdateAccount}
          className="flex flex-col gap-4 font-lexend"
        >
          <div>
            <Label className="block font-medium text-[#5A607F]">
              Account Name*
            </Label>
            <Input
              value={accountData.title}
              onChange={(e) =>
                setAccountData((prev: any) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder=""
              className="mt-2 h-12 w-full rounded-lg border border-accent_text_slate px-6 py-4 placeholder:text-accent_text_slate"
              type="text"
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-full">
              <Label className="block font-medium text-[#5A607F]">
                Account Code
              </Label>
              <Input
                value={accountData?.code}
                onChange={(e) =>
                  setAccountData((prev: any) => ({
                    ...prev,
                    code: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-12 w-full rounded-lg border border-accent_text_slate px-6 py-4 placeholder:text-sm placeholder:text-accent_text_slate"
                type="text"
                required
              />
            </div>
            <div className="w-full">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-accent_text_gray">
                  Account Type*
                </Label>
                <RiErrorWarningLine className="text-2xl text-accent_text_gray" />
              </div>
              <select
                value={accountData?.account_type_data?.slug}
                onChange={(e) => {
                  accountTypeData.map((type) => {
                    if (type.slug == e.target.value) {
                      console.log(type);
                      setAccountData({
                        ...accountData,
                        account_type_data: type,
                        detail_type_data: "",
                      });
                    }
                  });
                  handleChangeAccountType(e.target.value);
                }}
                className="mt-2 h-11 w-full rounded-lg border border-accent_text_slate bg-transparent px-6 text-sm text-accent_text_slate outline-none"
                required
              >
                <option value={accountData?.account_type_data?.slug}>
                  {accountData?.account_type_data?.title}
                </option>

                {accountTypeData.map((type) => (
                  <option key={type.slug} value={type.slug}>
                    {type.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full">
            <Label className="block font-medium text-accent_text_gray">
              Detail Type*
            </Label>
            <select
              value={accountData?.detail_type_data?.slug}
              onChange={(e) => {
                accountDetailTypeData.map((type) => {
                  if (type.slug == e.target.value) {
                    setAccountData({
                      ...accountData,
                      detail_type_data: type,
                    });
                  }
                });
              }}
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-6 text-sm text-accent_text_slate outline-none"
              required
            >
              <option value={accountData?.detail_type_data?.slug}>
                {accountData?.detail_type_data?.title}
              </option>
              {accountDetailTypeData.map((type) => (
                <option key={type.slug} value={type.slug}>
                  {type.title}
                </option>
              ))}
            </select>
          </div>
          <Checkbox
            value={isSubAccount}
            onChange={() => setIsSubAccount(!isSubAccount)}
            labelText="Make this a sub account"
            className="text-[#5A607F]"
            checkboxClass="rounded-md"
          />
          {isSubAccount && (
            <div className="w-full">
              <Label className="block font-medium text-accent_text_gray">
                Parent account
              </Label>
              <AccountSelectDropDown
                removeItemUIDS={[uid]}
                parentClassName="mt-2"
                filters={
                  accountData?.account_type_data
                    ? { account_type__slug: accountData.account_type_data }
                    : {}
                }
                setValue={(item: any) => {
                  if (item?.uid == uid) {
                    return toast.error(
                      "You can't select same account as parent account",
                    );
                  } else {
                    setParent(item);
                  }
                }}
                value={parent}
                isAddNew={false}
                ClassName="border border-gray-400 rounded-md focus:border-accent_soft_blue"
                required={isSubAccount}
              />
            </div>
          )}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-accent_text_gray">
                  Opening balance
                </Label>
                <RiErrorWarningLine className="text-2xl text-accent_text_gray" />
              </div>
              <input
                value={accountData?.opening_balance}
                // onChange={(e) =>
                //   setAccountData((prev: any) => ({
                //     ...prev,
                //     opening_balance: e.target.value,
                //   }))
                // }
                placeholder=""
                className="mt-2 h-12 w-full rounded-lg border border-accent_text_slate bg-transparent px-6 py-4 placeholder:text-accent_text_slate disabled:bg-gray-100"
                type="number"
                readOnly
                disabled
              />
              <a className="text-sm font-semibold text-accent_soft_blue hover:underline">
                More info on opening balances
              </a>
            </div>
            <div className="flex-1">
              <Label className="font-medium text-accent_text_gray">As of</Label>
              <DatePicker
                ClassName="border border-[#A1A7C4]"
                value={accountData?.date}
                onChange={(date) =>
                  setAccountData((prev: any) => ({ ...prev, date: date }))
                }
                placeholder="Select date"
              />
              <p className="text-[13px] text-[#7E84A3]">
                We’ll start tracking from dd/mm/year onwards.
              </p>
            </div>
          </div>
          <div className="w-full">
            <Label className="block font-medium text-accent_text_gray">
              Currency*
            </Label>
            <select
              value={accountData.currency}
              onChange={(e) =>
                setAccountData((prev: any) => ({
                  ...prev,
                  currency: e.target.value,
                }))
              }
              className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-6 text-sm text-accent_text_slate outline-none"
              required
            >
              {currencyChoices.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full">
            <Label className="block font-medium text-[#5A607F]">
              Description
            </Label>
            <Input
              value={accountData.description}
              onChange={(e) =>
                setAccountData((prev: any) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder=""
              className="mt-2 h-12 w-full rounded-lg border border-accent_text_slate px-6 py-4 placeholder:text-accent_text_slate"
              type="text"
            />
          </div>
          <div className="mx-auto flex max-w-[325px] items-center justify-center gap-10">
            <a
              onClick={() => {
                CloseModal();
                setIsOpen && setIsOpen(false);
              }}
              className="w-[144px] cursor-pointer rounded-lg border border-[#6A6EF6] py-3 text-center font-semibold text-[#6A6EF6]"
            >
              Cancel
            </a>
            <Button
              className="flex w-40 min-w-40 max-w-40 items-center justify-center bg-[#00035F] text-white"
              type="submit"
              isLoading={isUpdating}
            >
              {isUpdating ? "Updating.." : "Update"}
            </Button>
          </div>
        </form>
      )}
    </>
  );
};

export default UpdateAccount;
