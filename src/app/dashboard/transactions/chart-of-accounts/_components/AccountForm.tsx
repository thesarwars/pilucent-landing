import React from "react";
import Button from "@/components/ui/RawButton";
import { CloseModal } from "@/components/ModalSM/ModalSM";

const AccountForm = ({
  formData,
  handleChange,
  handleSubmit,
  isLoading,
  parentAccounts,
  // onClose,
  accountTypeChoices,
  detailTypeChoices,
  currencyChoices,
}: any) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mt-6 block text-sm font-medium leading-[21px] text-accent_text_gray">
          Account Name*
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full rounded border border-accent_text_slate px-2 py-3"
          required
        />
      </div> 
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mt-6 block text-sm font-medium leading-[21px] text-accent_text_gray">
            Account Code
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Salary Expense"
            className="w-full rounded border border-accent_text_slate px-2 py-3"
            required
          />
        </div>
        <div>
          <label className="mt-6 block text-sm font-medium leading-[21px] text-accent_text_gray">
            Account type*
          </label>
          <select
            name="account_type_data"
            value={formData.account_type_data}
            onChange={handleChange}
            className="w-full rounded border border-accent_text_slate bg-white px-2 py-3"
          >
            {accountTypeChoices.map((type: any) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mt-6 block text-sm font-medium leading-[21px] text-accent_text_gray">
          Detail Type*
        </label>
        <select
          name="detail_type_data"
          value={formData.detail_type_data}
          onChange={handleChange}
          className="w-full rounded border border-accent_text_slate bg-white px-2 py-3"
        >
          {detailTypeChoices?.map((detail: any) => (
            <option key={detail.value} value={detail.value}>
              {detail.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex items-center space-x-2">
        <input
          type="checkbox"
          name="is_sub_account"
          checked={formData.is_sub_account}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
        />
        <label className="text-sm text-gray-600">
          Make this a sub account
        </label>
      </div>

      {formData.is_sub_account && (
        <div>
          <label className="mt-6 block text-sm font-medium leading-[21px] text-accent_text_gray">
            Parent account*
          </label>
          <select
            name="parent_uid"
            value={formData.parent_uid}
            onChange={handleChange}
            className="w-full rounded border border-accent_text_slate bg-white px-2 py-3"
          >
            <option value="">Select...</option>
            {parentAccounts.map((account: any) => (
              <option key={account.uid} value={account.uid}>
                {account.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mt-6 block text-sm font-medium leading-[21px] text-accent_text_gray">
            Opening balance
          </label>
          <input
            type="text"
            name="opening_balance"
            value={formData.opening_balance}
            onChange={handleChange}
            className="w-full rounded border border-accent_text_slate px-2 py-3"
            required
          />
          <div className="mt-1 text-xs text-blue-600">
            More info on opening balances
          </div>
        </div>
        <div>
          <label className="mt-6 block text-sm font-medium leading-[21px] text-accent_text_gray">
            As of
          </label>
          <input
            type="date"
            name="as_of"
            value={formData.as_of}
            onChange={handleChange}
            className="w-full rounded border border-accent_text_slate px-2 py-3"
          />
          <div className="mt-1 text-xs text-gray-500">
            Well start tracking from dd/mm/year onwards.
          </div>
        </div>
      </div>

      <div>
        <label className="mt-6 block text-sm font-medium leading-[21px] text-accent_text_gray">
          Currency
        </label>
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          className="w-full rounded border border-accent_text_slate bg-white px-2 py-3"
        >
          {currencyChoices.map((currency: any) => (
            <option key={currency.value} value={currency.value}>
              {currency.value} - {currency.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mt-6 block text-sm font-medium leading-[21px] text-accent_text_gray">
          Description
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded border border-accent_text_slate px-2 py-3"
        />
      </div>

      <div className="flex justify-center space-x-4">
        <Button
          type="button"
          onClick={CloseModal}
          className="rounded-lg border border-accent_soft_blue bg-white px-[43.5px] py-3 text-sm font-semibold leading-[21px] text-accent_soft_blue"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="rounded-lg bg-accent_bg_blue px-[43.5px] py-3 text-sm font-semibold leading-[21px] text-white"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default AccountForm;
