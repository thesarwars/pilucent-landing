'use client';


import * as React from 'react';
import { Layers, Loader2 } from 'lucide-react';
import { Temporal } from '@js-temporal/polyfill';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Post, Patch, GetData } from '@/services/FetchMethods';
import { toastApiError } from '@/lib/helpers/apiErrors';
import { getAccountTypes, getRootAccountTypes } from '@/app/helpers/backend';
import { currencyChoices } from '@/lib/helpers/COAData';
import GetToken from '@/hooks/getToken';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import {
  Drawer,
  VioletButton,
  VioletInput,
  VioletSelect,
  VioletTextarea,
  Toggle,
} from '@/components/violet';

/* ── shared bits ─────────────────────────────────────────────────────── */

function Footer({
  onCancel,
  formId,
  saving,
  label,
  savingLabel,
}: {
  onCancel: () => void;
  formId: string;
  saving: boolean;
  label: string;
  savingLabel: string;
}) {
  return (
    <>
      <VioletButton type="button" variant="outline" className="flex-1" onClick={onCancel}>
        Cancel
      </VioletButton>
      <VioletButton
        type="submit"
        form={formId}
        variant="primary"
        className="flex-1"
        disabled={saving}
        leftIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
      >
        {saving ? savingLabel : label}
      </VioletButton>
    </>
  );
}

function SubAccountCard({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-v-input border border-v-border bg-v-card-subtle px-3.5 py-3">
      <div>
        <div className="text-[13px] font-semibold text-v-ink900">Make this a sub-account</div>
        <div className="text-[11px] text-v-ink400">Nest it under a parent account</div>
      </div>
      <Toggle checked={checked} onChange={onChange} aria-label="Make this a sub-account" />
    </div>
  );
}

const PARENT_FIELD_CLASS =
  'rounded-v-input w-full border border-v-border bg-white px-3.5 py-2.5 text-[13.5px] outline-none focus:border-v-primary';

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-11 w-full animate-pulse rounded-v-input bg-v-wash2" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
        <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
      </div>
      <div className="h-11 w-full animate-pulse rounded-v-input bg-v-wash2" />
      <div className="h-14 w-full animate-pulse rounded-v-input bg-v-wash2" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
        <div className="h-11 animate-pulse rounded-v-input bg-v-wash2" />
      </div>
      <div className="h-11 w-full animate-pulse rounded-v-input bg-v-wash2" />
    </div>
  );
}


const NO_OPENING_BALANCE_TITLES = [
  'Other Expenses',
  'Expense',
  'Cost of Goods Sold (COGS)',
  'Other Income',
  'Income',
  'Accounts Receivable (A/R)',
  'Accounts Payable (A/P)',
];

/* ── create ──────────────────────────────────────────────────────────── */

function CreateBody({ onClose, refetch }: { onClose: () => void; refetch?: () => void }) {
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [isSubAccount, setIsSubAccount] = React.useState(false);
  const [parent, setParent] = React.useState<any>(null);
  const [disableOpenBalance, setDisableOpenBalance] = React.useState(false);
  const [accountTypeData, setAccountTypeData] = React.useState<any[]>([]);
  const [accountDetailTypeData, setAccountDetailTypeData] = React.useState<any[]>([]);
  const [accountData, setAccountData] = React.useState<any>({
    title: '',
    date: todayDate,
    code: '',
    status: 'ACTIVE',
    account_type_data: '',
    detail_type_data: '',
    opening_balance: '',
    currency: 'USD',
    description: '',
    parent_uid: '',
  });

  const {
    mutate: CreateAccount,
    isPending,
    error,
    isError,
  } = useMutation({
    mutationFn: async (data: any) => {
      const res = await Post(`we/chart-of-accounts`, { body: data, token: '' });
      return res;
    },
    onSuccess: () => {
      toast.success('Account Added Successfully');
      refetch?.();
      onClose();
    },
    onError: () => {},
  });

  React.useEffect(() => {
    // Handles both shapes the API returns: field-scoped ({ title: "…" }) and
    // form-scoped ({ message: "Fixed account cannot be modified." }).
    if (isError) toastApiError((error as any)?.message, 'Could not create the account.');
  }, [error, isError]);

  React.useEffect(() => {
    const fn = async () => {
      const rootAccountType = await getRootAccountTypes();
      const promises = rootAccountType?.results?.map((type: any) => getAccountTypes(type?.slug));
      const results = await Promise?.allSettled([...promises]);
      const responses = results?.map((response: any) => response?.value?.options);
      setAccountTypeData(responses?.flat());
    };
    fn();
  }, []);

  const handleChangeAccountType = async (slug: string) => {
    setAccountDetailTypeData([]);
    if (slug) {
      const detailTypes = await getAccountTypes(slug);
      setDisableOpenBalance(NO_OPENING_BALANCE_TITLES.includes(detailTypes?.title));
      setAccountDetailTypeData(detailTypes?.options);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const Data1: any = {
      title: accountData.title,
      code: accountData.code,
      account_type_slug: accountData.account_type_data,
      currency: accountData.currency,
      date: accountData.date,
      description: accountData.description,
      detail_type_slug: accountData.detail_type_data,
      opening_balance:
        accountData.opening_balance && !disableOpenBalance ? accountData.opening_balance : 0,
      status: accountData.status,
    };

    let Data2: any;
    if (parent && isSubAccount) {
      Data2 = { ...Data1, parent_uid: parent.uid };
    }

    const data = parent !== null ? Data2 : Data1;
    CreateAccount(data);
  };

  return (
    <Drawer
      open
      onClose={onClose}
      icon={<Layers />}
      title="Create account"
      sub="Add a new ledger account to your chart"
      width={520}
      footer={
        <Footer
          onCancel={onClose}
          formId="coa-create-form"
          saving={isPending}
          label="Save account"
          savingLabel="Saving…"
        />
      }
    >
      <form id="coa-create-form" onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <VioletInput
          label="Account name"
          required
          value={accountData.title}
          onChange={(e) => setAccountData((p: any) => ({ ...p, title: e.target.value }))}
          placeholder="e.g. Business Checking"
        />

        <div className="grid grid-cols-2 gap-3">
          <VioletInput
            label="Account code"
            required
            hideRequiredMark
            value={accountData.code}
            onChange={(e) => setAccountData((p: any) => ({ ...p, code: e.target.value }))}
            placeholder="e.g. 1010"
          />
          <VioletSelect
            label="Account type"
            required
            value={accountData.account_type_data}
            onChange={(e) => {
              setAccountData((p: any) => ({ ...p, account_type_data: e.target.value }));
              handleChangeAccountType(e.target.value);
            }}
          >
            <option value="">Select type</option>
            {accountTypeData?.map((type) => (
              <option key={type?.slug} value={type?.slug}>
                {type?.title}
              </option>
            ))}
          </VioletSelect>
        </div>

        <VioletSelect
          label="Detail type"
          required
          value={accountData.detail_type_data}
          onChange={(e) => setAccountData((p: any) => ({ ...p, detail_type_data: e.target.value }))}
        >
          <option value="">Select detail type</option>
          {accountDetailTypeData?.map((type) => (
            <option key={type.slug} value={type.slug}>
              {type.title}
            </option>
          ))}
        </VioletSelect>

        <SubAccountCard checked={isSubAccount} onChange={() => setIsSubAccount((v) => !v)} />

        {isSubAccount && (
          <div className="font-jakarta">
            <label className="mb-1.5 block text-xs font-semibold text-v-ink700">
              Parent account
            </label>
            <AccountSelectDropDown
              filters={
                accountData?.account_type_data
                  ? { account_type__slug: accountData.account_type_data }
                  : {}
              }
              setValue={setParent}
              value={parent}
              isAddNew={false}
              ClassName={PARENT_FIELD_CLASS}
              required={isSubAccount}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <VioletInput
            label="Opening balance"
            money
            type="number"
            placeholder="0.00"
            value={disableOpenBalance ? '' : accountData.opening_balance}
            onChange={(e) => setAccountData((p: any) => ({ ...p, opening_balance: e.target.value }))}
            disabled={disableOpenBalance}
            hint={
              disableOpenBalance
                ? 'Income, expense, A/R and A/P accounts can’t take a typed opening balance — A/R and A/P take theirs from open invoices and bills.'
                : undefined
            }
          />
          <VioletInput
            label="As of"
            type="date"
            value={accountData.date}
            onChange={(e) => setAccountData((p: any) => ({ ...p, date: e.target.value }))}
          />
        </div>
        <p className="-mt-2 text-[11px] text-v-ink400">
          We&rsquo;ll start tracking this account from the chosen date onwards.
        </p>

        <VioletSelect
          label="Currency"
          required
          hideRequiredMark
          value={accountData.currency}
          onChange={(e) => setAccountData((p: any) => ({ ...p, currency: e.target.value }))}
        >
          {currencyChoices.map((currency) => (
            <option key={currency.value} value={currency.value}>
              {currency.value} — {currency.label}
            </option>
          ))}
        </VioletSelect>

        <VioletTextarea
          label="Description"
          rows={2}
          value={accountData.description}
          onChange={(e) => setAccountData((p: any) => ({ ...p, description: e.target.value }))}
          placeholder="Optional note about this account"
        />
      </form>
    </Drawer>
  );
}

/* ── edit ────────────────────────────────────────────────────────────── */

function EditBody({
  onClose,
  uid,
  refetch,
}: {
  onClose: () => void;
  uid: string;
  refetch?: () => void;
}) {
  const token = GetToken();
  const [accountData, setAccountData] = React.useState<any>({
    title: '',
    date: '',
    code: '',
    account_type_data: '',
    detail_type_data: '',
    opening_balance: '',
    currency: '',
    description: '',
    parent_uid: '',
  });
  const [isSubAccount, setIsSubAccount] = React.useState(false);
  const [parent, setParent] = React.useState<any>(null);
  const [accountTypeData, setAccountTypeData] = React.useState<any[]>([]);
  const [accountDetailTypeData, setAccountDetailTypeData] = React.useState<any[]>([]);

  const { data: Account, isPending } = useQuery({
    queryKey: ['single_account', uid],
    queryFn: async () => {
      const response = await GetData(`we/chart-of-accounts/${uid}`, token);
      return response;
    },
    enabled: !!uid,
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
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
    mutate: doUpdate,
    isPending: isUpdating,
    error,
    isError,
  } = useMutation({
    mutationFn: async (data: any) => {
      const res = await Patch(`we/chart-of-accounts/${uid}`, data, token);
      return res;
    },
    onSuccess: () => {
      toast.success('Account updated');
      refetch?.();
      onClose();
    },
    onError: () => {},
  });

  React.useEffect(() => {
    // Renaming onto an existing title now fails (case-insensitively), and any
    // edit to a control account returns { message: "Fixed account cannot be
    // modified." } — both land here.
    if (isError) toastApiError((error as any)?.message, 'Could not update the account.');
  }, [error, isError]);

  React.useEffect(() => {
    const fn = async () => {
      const rootAccountType = await getRootAccountTypes();
      const promises = rootAccountType.results.map((type: any) => getAccountTypes(type.slug));
      const results = await Promise.allSettled([...promises]);
      const responses = results.map((response: any) => response.value.options);
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

  const handleSubmit = (e: React.FormEvent) => {
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
      opening_balance: accountData.opening_balance ? accountData.opening_balance : 0,
    };

    let Data2: any;
    if (parent && isSubAccount) {
      Data2 = { ...Data1, parent_uid: parent.uid };
    }

    const data = parent !== null ? Data2 : Data1;
    doUpdate(data);
  };

  return (
    <Drawer
      open
      onClose={onClose}
      icon={<Layers />}
      title="Edit account"
      sub="Update this ledger account"
      width={520}
      footer={
        <Footer
          onCancel={onClose}
          formId="coa-edit-form"
          saving={isUpdating}
          label="Update account"
          savingLabel="Updating…"
        />
      }
    >
      {isPending ? (
        <FormSkeleton />
      ) : (
        <form id="coa-edit-form" onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <VioletInput
            label="Account name"
            required
            value={accountData.title}
            onChange={(e) => setAccountData((p: any) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Business Checking"
          />

          <div className="grid grid-cols-2 gap-3">
            <VioletInput
              label="Account code"
              required
              hideRequiredMark
              value={accountData?.code}
              onChange={(e) => setAccountData((p: any) => ({ ...p, code: e.target.value }))}
              placeholder="e.g. 1010"
            />
            <VioletSelect
              label="Account type"
              required
              value={accountData?.account_type_data?.slug}
              onChange={(e) => {
                accountTypeData.forEach((type) => {
                  if (type.slug == e.target.value) {
                    setAccountData((prev: any) => ({
                      ...prev,
                      account_type_data: type,
                      detail_type_data: '',
                    }));
                  }
                });
                handleChangeAccountType(e.target.value);
              }}
            >
              <option value={accountData?.account_type_data?.slug}>
                {accountData?.account_type_data?.title}
              </option>
              {accountTypeData.map((type) => (
                <option key={type.slug} value={type.slug}>
                  {type.title}
                </option>
              ))}
            </VioletSelect>
          </div>

          <VioletSelect
            label="Detail type"
            required
            value={accountData?.detail_type_data?.slug}
            onChange={(e) => {
              accountDetailTypeData.forEach((type) => {
                if (type.slug == e.target.value) {
                  setAccountData((prev: any) => ({ ...prev, detail_type_data: type }));
                }
              });
            }}
          >
            <option value={accountData?.detail_type_data?.slug}>
              {accountData?.detail_type_data?.title}
            </option>
            {accountDetailTypeData.map((type) => (
              <option key={type.slug} value={type.slug}>
                {type.title}
              </option>
            ))}
          </VioletSelect>

          <SubAccountCard checked={isSubAccount} onChange={() => setIsSubAccount((v) => !v)} />

          {isSubAccount && (
            <div className="font-jakarta">
              <label className="mb-1.5 block text-xs font-semibold text-v-ink700">
                Parent account
              </label>
              <AccountSelectDropDown
                removeItemUIDS={[uid]}
                filters={
                  accountData?.account_type_data
                    ? { account_type__slug: accountData.account_type_data }
                    : {}
                }
                setValue={(item: any) => {
                  if (item?.uid == uid) {
                    return toast.error("You can't select same account as parent account");
                  } else {
                    setParent(item);
                  }
                }}
                value={parent}
                isAddNew={false}
                ClassName={PARENT_FIELD_CLASS}
                required={isSubAccount}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <VioletInput
              label="Opening balance"
              money
              type="number"
              value={accountData?.opening_balance}
              readOnly
              disabled
            />
            <VioletInput
              label="As of"
              type="date"
              value={accountData?.date}
              onChange={(e) => setAccountData((p: any) => ({ ...p, date: e.target.value }))}
            />
          </div>
          <p className="-mt-2 text-[11px] text-v-ink400">
            We&rsquo;ll start tracking this account from the chosen date onwards.
          </p>

          <VioletSelect
            label="Currency"
            required
            hideRequiredMark
            value={accountData.currency}
            onChange={(e) => setAccountData((p: any) => ({ ...p, currency: e.target.value }))}
          >
            {currencyChoices.map((currency) => (
              <option key={currency.value} value={currency.value}>
                {currency.value} — {currency.label}
              </option>
            ))}
          </VioletSelect>

          <VioletTextarea
            label="Description"
            rows={2}
            value={accountData.description}
            onChange={(e) => setAccountData((p: any) => ({ ...p, description: e.target.value }))}
            placeholder="Optional note about this account"
          />
        </form>
      )}
    </Drawer>
  );
}

/* ── public component ────────────────────────────────────────────────── */

export interface AccountFormDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  uid?: string;
  refetch?: () => void;
}

export default function AccountFormDrawer({
  open,
  onClose,
  mode,
  uid,
  refetch,
}: AccountFormDrawerProps) {
  if (!open) return null;
  return mode === 'edit' && uid ? (
    <EditBody onClose={onClose} uid={uid} refetch={refetch} />
  ) : (
    <CreateBody onClose={onClose} refetch={refetch} />
  );
}
