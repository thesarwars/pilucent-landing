import { CloseModal } from "@/components/ModalSM/ModalSM";
import Button from "@/components/ui/RawButton";
import Checkbox from "@/components/ui/Checkbox/Checkbox";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import GetToken from "@/hooks/getToken";
import {
  AccountTypeData,
  currencyChoices,
  DetailsType,
} from "@/lib/helpers/COAData";
import { GetData, Post } from "@/services/FetchMethods";
import { toastApiError } from "@/lib/helpers/apiErrors";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";
import { RiErrorWarningLine } from "react-icons/ri";
import { toast } from "react-toastify";
import Select from "./Select";
import DatePicker from "@/components/ui/DatePicker";
import { getAccountTypes, getRootAccountTypes } from "@/app/helpers/backend";
import { Temporal } from "@js-temporal/polyfill";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";

// Account types that can never take a typed opening balance (COA doc §2, §10.2).
const NO_OPENING_BALANCE_TITLES = [
  "Other Expenses",
  "Expense",
  "Cost of Goods Sold (COGS)",
  "Other Income",
  "Income",
  "Accounts Receivable (A/R)",
  "Accounts Payable (A/P)",
];

interface AccountType {
  title: string;
  date: string;
  code: string;
  status: "ACTIVE";
  account_type_data: string;
  detail_type_data: string;
  opening_balance: number | string;
  currency: string;
  description: string;
  parent_uid: string | null;
}

const AddAccountForm = ({
  setValue,
  setIsOpen,
  refetchTreeData,
  parentUID,
  onCancel,
  onClose,
  onSuccess,
}: {
  setValue?: any;
  onSuccess?: any;
  setIsOpen?: any;
  refetchTreeData?: any;
  onClose?: any;
  parentUID?: any;
  onCancel?: any;
}) => {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [isSubAccount, setIsSubAccount] = useState(false);
  const [parent, setParent] = useState<any>(null);
  const [disableOpenBalance, setDisableOpenBalance] = useState<any>(false);
  const [accountTypeData, setAccountTypeData] = useState<any[]>([]);
  const [accountDetailTypeData, setAccountDetailTypeData] = useState<any[]>([]);
  const [accountData, setAccountData] = useState<AccountType>({
    title: "",
    date: todayDate,
    code: "",
    status: "ACTIVE",
    account_type_data: "",
    detail_type_data: "",
    opening_balance: "",
    currency: "USD",
    description: "",
    parent_uid: "",
  });

  useEffect(() => {
    if (parentUID) {
      setIsSubAccount(true);
      GetData(`we/chart-of-accounts/${parentUID}`, "")
        .then((res) => {
          setAccountData({ ...accountData, parent_uid: res?.uid });
          setParent({ label: res?.title, value: res?.uid });
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      setIsSubAccount(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentUID]);

  const {
    mutate: CreateAccount,
    isPending: isCatCreating,
    error,
    isError,
    isSuccess,
    data,
  } = useMutation({
    mutationFn: async (data: any) => {
      const res = await Post(`we/chart-of-accounts`, { body: data, token: "" });
      return res;
    },
    onSuccess: (res) => {
      toast.success("Account Added Successfully");
      setAccountData({
        title: "",
        date: todayDate,
        code: "",
        status: "ACTIVE",
        account_type_data: "DEBTORS",
        detail_type_data: "DEVELOPMENT_COSTS",
        opening_balance: "",
        currency: "USD",
        description: "",
        parent_uid: "",
      });
      CloseModal();
    },
    onError: (res) => {
      // console.log(res);
      // toast.error("An Unknown Error Occurred!");
    },
  });

  useEffect(() => {
    if (isSuccess) {
      setValue && setValue(data);
      onSuccess && onSuccess(data);
      if (refetchTreeData) refetchTreeData();
      setIsOpen && setIsOpen(false);
      if (onClose) {
        onClose(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    // Handles both shapes the API returns: field-scoped ({ title: "…" }) and
    // form-scoped ({ message: "Fixed account cannot be modified." }).
    if (isError) toastApiError(error?.message, "Could not create the account.");
  }, [error, isError]);

  const handleAddAccount = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const Data1 = {
      title: accountData.title,
      code: accountData.code,
      account_type_slug: accountData.account_type_data,
      currency: accountData.currency,
      date: accountData.date,
      description: accountData.description,
      detail_type_slug: accountData.detail_type_data,
      opening_balance:
        accountData.opening_balance && !disableOpenBalance
          ? accountData.opening_balance
          : 0,
      status: accountData.status,
    };

    let Data2;
    if (parent && isSubAccount) {
      Data2 = {
        title: accountData.title,
        code: accountData.code,
        account_type_slug: accountData.account_type_data,
        currency: accountData.currency,
        date: accountData.date,
        description: accountData.description,
        detail_type_slug: accountData.detail_type_data,
        opening_balance:
          accountData.opening_balance && !disableOpenBalance
            ? accountData.opening_balance
            : 0,
        status: accountData.status,
        parent_uid: parent.uid,
      };
    }

    const data = parent !== null ? Data2 : Data1;
    CreateAccount(data);
  };

  useEffect(() => {
    const fn = async () => {
      const rootAccountType = await getRootAccountTypes();
      const promises = rootAccountType?.results?.map((type: any) =>
        getAccountTypes(type?.slug),
      );
      const results = await Promise?.allSettled([...promises]);
      const responses = results?.map((response: any) => {
        return response?.value?.options;
      });
      setAccountTypeData(responses?.flat());
    };
    fn();
  }, []);

  const handleChangeAccountType = async (slug: string) => {
    setAccountDetailTypeData([]);
    if (slug) {
      const detailTypes = await getAccountTypes(slug);
      // Income/expense accounts start each period at zero (COA doc §2); A/R
      // and A/P take their balance from open invoices/bills, not a typed
      // figure, so the server now refuses an opening_balance there too (§10.2).
      setDisableOpenBalance(NO_OPENING_BALANCE_TITLES.includes(detailTypes?.title));
      setAccountDetailTypeData(detailTypes?.options);
    }
  };

  return (
    <>
      <form
        onSubmit={handleAddAccount}
        className="flex flex-col gap-4 font-lexend text-sm"
      >
        <div className="flex w-full flex-col gap-2">
          <label className="text-accent_soft_black">Account Name*</label>
          <Input
            value={accountData.title}
            onChange={(e) =>
              setAccountData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder=""
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            type="text"
            required
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex w-full flex-col gap-2">
            <label className="text-accent_soft_black">Account Code</label>
            <Input
              value={accountData.code}
              onChange={(e) =>
                setAccountData((prev) => ({ ...prev, code: e.target.value }))
              }
              placeholder=""
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              type="text"
              required
            />
          </div>
          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-accent_soft_black">Account Type*</label>
              <RiErrorWarningLine className="text-2xl text-accent_soft_black" />
            </div>
            <select
              value={accountData.account_type_data}
              onChange={(e) => {
                setAccountData((prev) => ({
                  ...prev,
                  account_type_data: e.target.value,
                }));
                handleChangeAccountType(e.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              required
            >
              <option defaultChecked value="">
                Select Account Type
              </option>
              {accountTypeData.map((type) => (
                <option key={type?.slug} value={type?.slug}>
                  {type?.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2">
          <label className="text-accent_soft_black">Detail Type*</label>
          <select
            value={accountData.detail_type_data}
            onChange={(e) =>
              setAccountData((prev) => ({
                ...prev,
                detail_type_data: e.target.value,
              }))
            }
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            required
          >
            <option defaultChecked value="">
              Select Detail Type
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
          className="text-sm font-normal text-accent_soft_black"
          checkboxClass="rounded-md"
        />
        {isSubAccount && (
          <div className="flex w-full flex-col gap-2">
            <label className="text-accent_soft_black">Parent account</label>
            <AccountSelectDropDown
              parentClassName="mt-2"
              filters={
                accountData?.account_type_data
                  ? { account_type__slug: accountData.account_type_data }
                  : {}
              }
              setValue={setParent}
              value={parent}
              isAddNew={false}
              ClassName="rounded-md w-full  border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              required={isSubAccount}
            />
          </div>
        )}
        <div className="flex gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex w-full items-center gap-1">
              <label className="text-accent_soft_black">Opening balance</label>
              <RiErrorWarningLine className="text-xl text-accent_soft_black" />
            </div>
            <input
              value={disableOpenBalance ? "" : accountData.opening_balance}
              onChange={(e) =>
                setAccountData((prev) => ({
                  ...prev,
                  opening_balance: e.target.value,
                }))
              }
              placeholder="0.00"
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              type="number"
              disabled={disableOpenBalance}
            />
            <a
              className="text-xs text-accent_soft_blue hover:underline"
              href=""
            >
              More info on opening balances
            </a>
          </div>
          <div className="flex-1">
            <Label className="text-sm font-normal text-accent_text_gray">
              As of
            </Label>
            <DatePicker
              ClassName="border border-[#A1A7C4]"
              value={accountData.date}
              onChange={(date) =>
                setAccountData((prev) => ({ ...prev, date: date }))
              }
            />
            <p className="text-xs text-[#5a5e70]">
              We’ll start tracking from dd/mm/year onwards.
            </p>
          </div>
        </div>
        <div className="w-full">
          <Label className="block text-sm font-normal text-accent_text_gray">
            Currency*
          </Label>
          <select
            value={accountData.currency}
            onChange={(e) =>
              setAccountData((prev) => ({ ...prev, currency: e.target.value }))
            }
            className="mt-2 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-6 py-2.5 text-sm text-accent_text_slate outline-none"
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
          <Label className="block text-sm font-normal text-[#5A607F]">
            Description
          </Label>
          <Input
            value={accountData.description}
            onChange={(e) =>
              setAccountData((prev) => ({
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
          <button
            type="button"
            onClick={() => {
              if (onCancel) return onCancel();
              !setIsOpen && CloseModal();
              setIsOpen && setIsOpen(false);
            }}
            className="w-[144px] cursor-pointer rounded-lg border border-accent_soft_black py-2.5 text-center font-semibold text-accent_soft_black active:scale-95"
          >
            Cancel
          </button>
          <Button
            className="flex w-40 min-w-40 max-w-40 items-center justify-center bg-accent_soft_black text-white"
            type="submit"
            isLoading={isCatCreating}
          >
            {isCatCreating ? "Saving.." : "Save"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default AddAccountForm;
