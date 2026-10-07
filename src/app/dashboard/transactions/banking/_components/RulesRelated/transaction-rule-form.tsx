/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import type React from "react";

import { useState, useEffect, type ChangeEvent } from "react";
import { FiChevronDown, FiX, FiTrash2 } from "react-icons/fi";
import type { Condition, SplitDetail } from "./types";
import CustomDropdown from "./RulesDropdown";
import { useFetch } from "@/app/helpers/hooks";
import { fetchBankOverview, postRules } from "@/app/helpers/backend";
import CheckboxMultiSelect from "./MultiSelectDropdown";
import AccountSelectDropDown from "@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown";
import CustomerSupplierSelectDropdown from "@/components/ui/ScrollSelectDropDowns/CustomerSupplierSelectDropdown";
import CustomerSelectDropDown from "@/components/ui/ScrollSelectDropDowns/CustomerSelectDropDown";
import { toast } from "@/lib/ToastService";
import SupplierSelectDropDown from "@/components/ui/ScrollSelectDropDowns/SupplierSelectDropDown";
import Button from "@/components/ui/RawButton";

// Custom dropdown component

const transactionsType = [
  { title: "Money out", value: "SPENT" },
  { title: "Money in", value: "RECEIVED" },
  // { title: "All transactions", value: "ALL" },
];

// Options arrays with proper typing
const fieldOptions: any[] = [
  { title: "Bank text", value: "BANK_TEXT" },
  { title: "Amount", value: "AMOUNT" },
  // { title: "Date", value: "date" },
  { title: "Description", value: "DESCRIPTION" },
  // { title: "Reference", value: "REFERENCE" },
];
const operatorOptions: any[] = [
  { title: "Is exactly", value: "IS_EXACTLY" },
  { title: "Contains", value: "CONTAINS" },
  // { title: "Starts with", value: "STARTS_WITH" },
  { title: "Equal", value: "EQUAL" },
  { title: "Is greater than", value: "GREATER_THAN" },
  { title: "Is less than", value: "LESS_THAN" },
];
const transactionTypeOptions: any[] = [
  { title: "Expense", value: "EXPENSE" },
  { title: "Check", value: "CHECK" },
  { title: "Transfer", value: "TRANSFER" },
  { title: "Deposit", value: "DEPOSIT" },
];

const splitByOptions = [
  { title: "Percentage (%)", value: "PERCENTAGE" },
  { title: "Amount ($)", value: "AMOUNT" },
  { title: "Shares", value: "SHARES" },
];
const TransactionRuleForm = ({
  setIsOpen,
  data,
  refetch,
}: {
  setIsOpen?: any;
  data?: any;
  refetch?: any;
}) => {
  const [selectedAccounts, setSelectedAccounts] = useState<any[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [accountOptions, setAccountOptions] = useState<any[]>([]);
  const {
    data: Accounts,
    isPending: isAccountsPending,
    refetch: AccountRefetch,
  } = useFetch(["transactions_overview23"], fetchBankOverview);

  useEffect(() => {
    if (!isAccountsPending && Accounts.length) {
      const data = Accounts?.map((data: any) => {
        return data?.chart_of_account;
      });
      setAccountOptions(data);
    }
  }, [Accounts, isAccountsPending]);

  const [TransactionRule, setTransactionRule] = useState<any>({
    uid: "",
    title: "",
    transaction_type: "",
    all_account: false,
    bank_accounts: [],
    is_all: true,
    auto_add: true,
    is_excluded: false,
  });
  const [conditions, setConditions] = useState<any[]>([
    { uid: "", field: "", operator: "", value: "" },
  ]);
  const [splitDetails, setSplitDetails] = useState<SplitDetail[]>([
    { percentage: "", category: "" },
    { percentage: "", category: "" },
    { percentage: "", category: "" },
  ]);
  const [splitBy, setSplitBy] = useState<string>("Percentage (%)");
  const [assignOptions, setAssignOptions] = useState<any>({
    uid: "",
    trx_type: "EXPENSE",
    chart_of_account: "",
    payee: "",
    customer: "",
    memo: "",
    is_split: false,
  });
  const [showAdditionalFields, setShowAdditionalFields] =
    useState<boolean>(false);

  const addCondition = (): void => {
    setConditions([
      ...conditions,
      { field: "Bank text", operator: "Is exactly", value: "" },
    ]);
  };

  useEffect(() => {
    if (data) {
      setAssignOptions({
        ...assignOptions,
        uid: data?.assign?.uid,
        trx_type: {
          value: data?.assign?.trx_type,
          title: data?.assign?.trx_type,
        },
        chart_of_account: data?.assign?.chart_of_account,
        payee: data?.assign?.payee,
        customer: data?.assign?.customer,
        memo: data?.assign?.memo,
        is_split: data?.assign?.is_split,
      });
      const bank_accounts = data?.bank_accounts?.map((account: any) => {
        return account?.uid;
      });
      setSelectedAccounts(bank_accounts);
      setTransactionRule({
        ...TransactionRule,
        uid: data?.uid,
        title: data?.title,
        transaction_type: {
          value: data?.transaction_type,
          title: data?.transaction_type == "SPENT" ? 'Money Out' : "Money In",
        },
        all_account: data?.all_account,
        bank_accounts: bank_accounts,
        is_all: data?.is_all,
        auto_add: data?.auto_add,
        is_excluded: data?.is_excluded,
      });

      const params = data?.params?.map((param: any) => {
        return {
          uid: param?.uid,
          field: { value: param?.field, title: param?.field },
          operator: { value: param?.operation, title: param?.operation },
          value: param?.value,
        };
      });

      setConditions(params);
    } else {
      ResetForm();
    }
  }, [data]);

  const removeCondition = (index: number): void => {
    const newConditions: Condition[] = [...conditions];
    newConditions.splice(index, 1);
    setConditions(newConditions);
  };

  const updateCondition = (
    index: number,
    field: keyof Condition,
    value: string,
  ): void => {
    const newConditions: Condition[] = [...conditions];
    newConditions[index][field] = value;
    setConditions(newConditions);
  };

  const addSplitLine = (): void => {
    setSplitDetails([...splitDetails, { percentage: "", category: "" }]);
  };

  const removeSplitDetail = (index: number): void => {
    const newSplitDetails: SplitDetail[] = [...splitDetails];
    newSplitDetails.splice(index, 1);
    setSplitDetails(newSplitDetails);
  };

  const updateSplitDetail = (
    index: number,
    field: keyof SplitDetail,
    value: string,
  ): void => {
    const newSplitDetails: SplitDetail[] = [...splitDetails];
    newSplitDetails[index][field] = value;
    setSplitDetails(newSplitDetails);
  };

  const toggleAssignMode = (): void => {
    setTransactionRule({
      ...TransactionRule,
      is_excluded: !TransactionRule?.is_excluded,
    });
  };

  const toggleAdditionalFields = (): void => {
    setShowAdditionalFields(!showAdditionalFields);
  };

  const handleConditionValueChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>,
  ): void => {
    updateCondition(index, "value", e.target.value);
  };

  const ResetForm = () => {
    setSelectedAccounts([]);
    setAssignOptions({
      trx_type: "EXPENSE",
      chart_of_account: "",
      payee: "",
      customer: "",
      memo: "",
      is_split: false,
    });
    setTransactionRule({
      title: "",
      transaction_type: "",
      all_account: false,
      bank_accounts: [],
      is_all: true,
      auto_add: true,
      is_excluded: false,
    });
    setConditions([{ field: "", operator: "", value: "" }]);
  };

  const handlePatchData = async () => {
    const params = conditions?.map((condition) => {
      return {
        uid: condition?.uid,
        field: condition?.field?.value,
        operation: condition?.operator?.value,
        value: condition?.value,
      };
    });

    const isAllSelected =
      selectedAccounts.length == accountOptions?.length &&
      accountOptions?.length > 0;
    const transaction_rule = {
      title: TransactionRule?.title,
      transaction_type: TransactionRule?.transaction_type?.value,
      all_account: isAllSelected,
      bank_accounts: selectedAccounts,
      is_all: TransactionRule?.is_all,
      auto_add: TransactionRule?.auto_add,
      is_excluded: TransactionRule?.is_excluded,
    };

    const assignData = {
      uid: assignOptions?.uid,
      trx_type: assignOptions?.trx_type?.value,
      chart_of_account: assignOptions?.chart_of_account?.uid,
      payee: assignOptions?.payee?.uid,
      customer: assignOptions?.customer?.uid,
      memo: assignOptions?.memo,
      is_split: false,
    };

    const data: any = {
      uid: TransactionRule?.uid,
      transaction_rule: transaction_rule,
      params: params,
    };

    if (!transaction_rule?.is_excluded) {
      data.assign = assignData;
    }

    try {
      setIsPending(true);
      const res = await postRules(data);
      if (res?.success) {
        toast.success("Rule updated.")
        refetch && refetch();
        ResetForm();
        setIsOpen && setIsOpen(false);
      }
    } catch (error) {
      //error here
    } finally {
      setIsPending(false);
    }
  };

  const handleSave = async () => {
    if (TransactionRule.uid) {
      handlePatchData();
      return;
    }
    const params = conditions?.map((condition) => {
      return {
        field: condition?.field?.value,
        operation: condition?.operator?.value,
        value: condition?.value,
      };
    });

    const isAllSelected =
      selectedAccounts.length == accountOptions?.length &&
      accountOptions?.length > 0;
    const transaction_rule = {
      title: TransactionRule?.title,
      transaction_type: TransactionRule?.transaction_type?.value,
      all_account: isAllSelected,
      bank_accounts: selectedAccounts,
      is_all: TransactionRule?.is_all,
      auto_add: TransactionRule?.auto_add,
      is_excluded: TransactionRule?.is_excluded,
    };

    const assignData = {
      trx_type: assignOptions?.trx_type?.value,
      chart_of_account: assignOptions?.chart_of_account?.uid,
      payee: assignOptions?.payee?.uid,
      customer: assignOptions?.customer?.uid,
      memo: assignOptions?.memo,
      is_split: false,
    };

    const data: any = {
      transaction_rule: transaction_rule,
      params: params,
    };

    if (!transaction_rule?.is_excluded) {
      data.assign = assignData;
    }

    try {
      setIsPending(true);
      const res = await postRules(data);
      if (res?.success) {
        toast.success("Rule created.");
        setIsOpen && setIsOpen(false);
        refetch && refetch();
        ResetForm();
      }
      console.log(data);
    } catch (error) {
      //error here
    } finally {
      setIsPending(false);
    }
  };

  const handleTestRule = (): void => {
    // Handle rule testing
    console.log("Testing rule...");
  };

  return (
    <div className="">
      <p className="mb-6 text-sm text-gray-600">
        Rules only apply to unreviewed transactions.
      </p>

      {/* Rule Name */}
      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          What do you want to call this rule?{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter rule name"
          value={TransactionRule.title}
          onChange={(e) =>
            setTransactionRule({ ...TransactionRule, title: e.target.value })
          }
        />
      </div>

      {/* Conditions */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-gray-700">
          Apply this to transactions that are
        </p>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <CustomDropdown
            options={transactionsType}
            value={TransactionRule?.transaction_type}
            onChange={(e) => {
              setTransactionRule({ ...TransactionRule, transaction_type: e });
            }}
            className="w-full flex-1"
          />

          <span className="self-center text-sm text-gray-700">in</span>

          <div className="flex-1">
            <CheckboxMultiSelect
              options={accountOptions}
              value={selectedAccounts}
              onChange={(values) => setSelectedAccounts(values)}
              placeholder="Select accounts"
              allOptionText="All accounts"
              className="w-full max-w-sm"
            />
          </div>
        </div>

        <p className="mb-2 text-sm font-medium text-gray-700">
          and include the following:
        </p>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <CustomDropdown
            options={[
              { title: "All", value: "ALL" },
              { title: "Any", Value: "ANY" },
            ]}
            value={
              TransactionRule?.is_all
                ? { title: "All", value: "ALL" }
                : { title: "Any", Value: "ANY" }
            }
            onChange={(e: any) =>
              setTransactionRule({
                ...TransactionRule,
                is_all: e?.value == "ALL" ? true : false,
              })
            }
            className="w-full sm:w-40"
          />
        </div>

        {conditions.map((condition: Condition, index: number) => (
          <div
            key={index}
            className="mb-4 flex flex-col items-start gap-2 sm:flex-row"
          >
            <CustomDropdown
              options={fieldOptions}
              value={condition.field}
              onChange={(value: string) =>
                updateCondition(index, "field", value)
              }
              className="flex-1"
            />

            <CustomDropdown
              options={operatorOptions}
              value={condition.operator}
              onChange={(value: string) =>
                updateCondition(index, "operator", value)
              }
              className="flex-1"
            />

            <div className="flex flex-1">
              <input
                type="text"
                className="w-full rounded-l border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Value"
                value={condition.value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleConditionValueChange(index, e)
                }
              />
              {conditions.length > 1 && (
                <button
                  className="rounded-r border border-l-0 border-gray-300 bg-gray-100 p-2 hover:bg-gray-200"
                  onClick={() => removeCondition(index)}
                >
                  <FiTrash2 className="text-gray-500" />
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          className="flex items-center text-sm font-medium text-blue-500 hover:text-blue-700"
          onClick={addCondition}
        >
          <span className="mr-1">+</span> Add a condition
        </button>
      </div>

      {/* Test Rule Button */}
      {/* <div className="mb-8">
        <button
          className="rounded border border-accent_soft_blue px-4 py-2 font-medium text-accent_soft_blue hover:bg-green-50"
          onClick={handleTestRule}
        >
          Test rule
        </button>
      </div> */}

      {/* Then Assign/Exclude Section */}
      <div className="mb-6">
        <div className="mb-4 flex items-center">
          <span className="mr-2 text-sm font-medium text-gray-700">Then</span>
          <div className="relative inline-block">
            <button
              onClick={toggleAssignMode}
              className="flex items-center text-sm font-medium text-blue-500 hover:text-blue-700"
            >
              {TransactionRule?.is_excluded ? "Assign" : "Exclude"}{" "}
              <FiChevronDown className="ml-1" />
            </button>
          </div>
        </div>

        {!TransactionRule?.is_excluded && (
          <div className="space-y-4">
            {/* Transaction Type */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm text-gray-700">Transaction type</label>
              <div className="col-span-2">
                <CustomDropdown
                  options={transactionTypeOptions}
                  value={assignOptions.trx_type}
                  onChange={(value: string) =>
                    setAssignOptions({ ...assignOptions, trx_type: value })
                  }
                />
              </div>
            </div>

            {/* Category */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm text-gray-700">Category</label>
              <div className="col-span-2">
                <AccountSelectDropDown
                  value={assignOptions.chart_of_account}
                  ClassName="w-full border rounded-md border-gray-300"
                  setValue={(value: any) =>
                    setAssignOptions({
                      ...assignOptions,
                      chart_of_account: value,
                    })
                  }
                />
              </div>
            </div>

            {/* {!showSplit ? (
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-sm text-gray-700">Product/service</label>
                <div className="col-span-2">
                  <CustomDropdown
                    options={productOptions}
                    value={assignOptions.productService}
                    placeholder="Select product/service"
                    onChange={(value: string) =>
                      handleAssignOptionChange("productService", value)
                    }
                    borderColor="border-green-500"
                  />
                </div>
              </div> */}
            {/* ) : (
              <div className="my-4 border-b border-t border-gray-200 py-4">
                <div className="mb-4 grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">Split by</label>
                  <div className="col-span-2">
                    <CustomDropdown
                      options={splitByOptions}
                      value={splitBy}
                      onChange={setSplitBy}
                    />
                  </div>
                </div>

                {splitDetails.map((detail: SplitDetail, index: number) => (
                  <div key={index} className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700">
                        Split detail #{index + 1}
                      </h3>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => removeSplitDetail(index)}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">
                          Percentage
                        </label>
                        <input
                          type="text"
                          className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                          value={detail.percentage}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleSplitDetailChange(index, "percentage", e)
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-600">
                          Category
                        </label>
                        <CustomDropdown
                          options={categoryOptions}
                          value={detail.category}
                          placeholder="Select a category"
                          onChange={(value: string) =>
                            updateSplitDetail(index, "category", value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  className="mx-auto mt-2 flex items-center text-sm font-medium text-blue-500 hover:text-blue-700"
                  onClick={addSplitLine}
                >
                  <span className="mr-1">+</span> Add a line
                </button>
              </div>
            )} */}

            {/* {!showSplit && (
              <div className="text-center">
                <button
                  className="text-sm font-medium text-blue-500 hover:text-blue-700"
                  onClick={() => setShowSplit(true)}
                >
                  + Add a split
                </button>
              </div>
            )} */}

            {/* Payee */}
            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm text-gray-700">Payee</label>
              <div className="col-span-2">
                <SupplierSelectDropDown
                  ClassName="w-full border rounded-md border-gray-300 px-2"
                  value={assignOptions.payee}
                  setValue={(value: string) =>
                    setAssignOptions({ ...assignOptions, payee: value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <label className="text-sm text-gray-700">Customer</label>
              <div className="col-span-2">
                <CustomerSelectDropDown
                  ClassName="w-full border rounded-md border-gray-300 px-2"
                  value={assignOptions.customer}
                  setValue={(value: string) =>
                    setAssignOptions({ ...assignOptions, customer: value })
                  }
                />
              </div>
            </div>

            {showAdditionalFields && (
              <div>
                {/* Replace bank memo */}
                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-sm text-gray-700">
                    Replace bank memo
                  </label>
                  <div className="col-span-2">
                    <input
                      type="text"
                      className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter text (required)"
                      value={assignOptions.memo}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAssignOptions({
                          ...assignOptions,
                          memo: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          className="mt-4 flex items-center text-sm font-medium text-blue-500 hover:text-blue-700"
          onClick={toggleAdditionalFields}
        >
          {showAdditionalFields ? (
            "Clear"
          ) : (
            <>
              <span className="mr-1">+</span>Assign more
            </>
          )}
        </button>
      </div>

      {/* Auto Confirm Toggle */}
      <div className="mb-8">
        <p className="mb-1 text-sm font-medium text-gray-700">
          Automatically confirm transactions this rule applies to
        </p>
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-700">Auto-add</span>
          <button
            className={`h-6 w-12 rounded-full p-1 transition-colors duration-300 focus:outline-none ${TransactionRule?.auto_add ? "bg-accent_soft_blue" : "bg-gray-300"}`}
            onClick={() => {
              setTransactionRule({
                ...TransactionRule,
                auto_add: !TransactionRule?.auto_add,
              });
            }}
          >
            <div
              className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${TransactionRule?.auto_add ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-center gap-4">
        <button
          className="min-w-32 rounded border border-accent_soft_blue px-4 py-2 font-medium text-accent_soft_blue hover:bg-green-50"
          onClick={() => setIsOpen && setIsOpen(false)}
        >
          Cancel
        </button>
        <Button
          disabled={isPending}
          className="hover:bg-accent_soft_blue-700 min-w-32 rounded bg-accent_soft_blue px-4 py-2 font-medium text-white"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default TransactionRuleForm;
