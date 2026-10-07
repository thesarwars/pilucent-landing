'use client';
import DatePicker from '@/components/ui/DatePicker';
import Button from '@/components/ui/RawButton';
import Label from '@/components/ui/RawLabel';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import SmoothCheckbox from '@/components/ui/SmoothCheckbox';
import React, { useEffect, useState } from 'react';
import AddToFundTable from './AddToFundTable';
import PayMethodSelectDropdown from '@/components/ui/ScrollSelectDropDowns/PayMethodSelectDropdown';
import TagInput from '@/app/dashboard/sales/all_sales/_components/TagInput';
import TextEditor from '@/app/dashboard/sales/all_sales/_components/TextEditor';
import { fetchUndeposit, postBankDeposit } from '@/app/helpers/backend';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/lib/ToastService';
import LogoLoader from '@/components/MainLoader/logo-loader';
import moment from 'moment';
import { useRouter } from 'next/navigation';

const BankDeposit = () => {
  const [date, setDate] = useState<any>('');
  const [data, setData] = useState<any>({ account: '', paymentListTotal: 0 });
  const [othersData, setOthersData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState<any[]>([]);
  const [fundsData, setFundsData] = useState<any[]>([
    {
      received_from: '',
      account: '',
      description: '',
      payment_method: '',
      reference_no: '',
      amount: '',
    },
  ]);
  const [hasMore, setHasMore] = useState(true);
  const [PaymentList, setPaymentList] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const paymentListTotal = PaymentList?.reduce(
      (prev, row) => prev + Number(row?.is_checked ? row?.amount || 0 : ''),
      0
    );
    const FundsTotal = fundsData?.reduce((prev, row) => prev + Number(row?.amount || 0), 0);
    setData({
      ...data,
      paymentListTotal: Number(paymentListTotal).toFixed(2),
      fundsTotal: Number(FundsTotal).toFixed(2),
    });
  }, [PaymentList, fundsData]);

  const { data: undepositedFund, isPending } = useQuery({
    queryKey: ['undeposited-funds', page],
    queryFn: async () => {
      const res = await fetchUndeposit({ page: page });
      const arr = res?.results.map((fund: any) => {
        return {
          ...fund,
          receivedFrom: fund?.customer?.uid ? fund?.customer : fund?.supplier,
          date: fund?.date,
          type: fund?.journal?.kind,
          payment_method: {},
          memo: '',
          amount: fund?.amount,
          is_checked: false,
        };
      });
      setPaymentList([...PaymentList, ...arr]);
      if (!res?.next) {
        setHasMore(false);
      }
      return res;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const paymentTotal = PaymentList?.reduce((acc: any, item: any) => {
      if (item?.is_checked) item?.amount;
      else 0;
    }, 0);

    const fundsTotal = fundsData?.reduce((acc: any, item) => {
      item?.amount;
    }, 0);

    setOthersData({ ...othersData, total: paymentTotal + fundsTotal });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PaymentList, fundsData]);

  const handleInputChange = (index: number, field: any, value: any) => {
    const updatedRows = PaymentList.map((row: any, rowIndex: any) => {
      if (rowIndex == index) {
        let updatedRow = { ...row };
        updatedRow = { ...row, [field]: value };

        return updatedRow;
      }
      return row;
    });
    setPaymentList(updatedRows);
  };

  const handleSelectAll = () => {
    const updated = PaymentList?.map((item) => ({ ...item, is_checked: true }));
    setPaymentList(updated);
  };
  const handleUnSelectAll = () => {
    const updated = PaymentList?.map((item) => ({
      ...item,
      is_checked: false,
    }));
    setPaymentList(updated);
  };

  console.log(fundsData);

  const handleSave = async () => {
    const PaymentListData = PaymentList?.filter((p) => p?.is_checked == true);
    const paymentListItems = PaymentListData?.map((d) => {
      return {
        date: d?.date,
        description: d?.memo,
        reference_number: d?.refNo,
        type: d?.type,
        amount: d?.amount,
        payment_method_uid: d?.payment_method?.uid || '',
        received_from_account_uid: d?.account?.uid || '',
        customer_uid: d?.customer?.uid || '',
        supplier_uid: d?.supplier?.uid || '',
        journal_entry_connector_uid: d?.uid,
      };
    });

    const FundListData = fundsData?.filter((p) => p?.account?.uid && p?.amount > 0);

    const fundListItems = FundListData?.map((d) => {
      return {
        date: moment(new Date()).format('YYYY-MM-DD'),
        description: d?.description,
        reference_number: d?.ref_number,
        type: '',
        amount: d?.amount,
        payment_method_uid: d?.payment_method?.uid || '',
        received_from_account_uid: d?.account?.uid || '',
        customer_uid: d?.received_from?.type == 'Customer' ? d?.received_from?.uid : '',
        supplier_uid: d?.received_from?.type == 'Supplier' ? d?.received_from?.uid : '',
      };
    });

    if (!paymentListItems?.length && !fundListItems?.length) {
      toast.error('Still staring? add items, or go cry to someone else.');
      return;
    }
    if (!data?.account?.uid) {
      toast.error('Still here? Pathetic. Pick an account and stop wasting bandwidth.');
      return;
    }

    const payloadData = {
      date: date,
      description: data?.description || '',
      bank_chart_of_account_uid: data?.account?.uid,
      cash_back_amount: othersData?.cash_back_amount,
      cash_back_memo: othersData?.cash_back_memo || '',
      cash_back_account_uid: othersData?.cash_back_account?.uid || '',
      tag_title_list: tags,
      deposit_items: [...paymentListItems, ...fundListItems],
    };

    const formData = new FormData();
    formData.append('date', date);
    formData.append('description', payloadData.description);
    formData.append('bank_chart_of_account_uid', payloadData.bank_chart_of_account_uid);
    formData.append('cash_back_account_uid', payloadData.cash_back_account_uid);
    formData.append('cash_back_amount', payloadData.cash_back_amount || 0);
    formData.append('cash_back_memo', payloadData.cash_back_memo);
    formData.append('deposit_items', JSON.stringify(payloadData.deposit_items));
    formData.append('tag_title_list', JSON.stringify(payloadData.tag_title_list));

    try {
      setIsLoading(true);
      const res = await postBankDeposit(formData);
      if (res?.success) {
        toast.success('Deposited to bank completed');
        setData({});
        setOthersData({});
        setTags([]);
        setFundsData([]);
        const uids = paymentListItems?.map((p) => p.journal_entry_connector_uid);
        const filtered = PaymentList.filter((value) => !uids?.includes(value?.uid));
        setPaymentList(filtered);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-sm">
      <div
        style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.05)' }}
        className="rounded-2xl border-2 bg-white/60 px-4 py-5"
      >
        <div className="flex justify-between">
          <h1 className="text-2xl font-semibold text-[#131523]">Bank Deposit</h1>
          <div className="space-y-1 pr-4 text-right">
            <p className="text-sm font-normal uppercase text-accent_soft_black">Amount</p>
            <h1 className="text-2xl font-medium text-accent_soft_black">
              ${' '}
              {(
                Number(data?.fundsTotal) +
                Number(data?.paymentListTotal) -
                Number(othersData?.cash_back_amount || 0)
              ).toFixed(2) || 0.0}
            </h1>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-start gap-12 lg:flex-row">
          <div className="flex flex-col justify-center space-y-3">
            <div className="flex w-96 max-w-md flex-col justify-between gap-8 md:flex-row md:items-center">
              <Label className="inline-block font-medium text-accent_text_gray">Account</Label>
              <AccountSelectDropDown
                ClassName="border-b-2 w-full focus:border-accent_soft_blue"
                parentClassName="w-full"
                filters={{ account_type__title: 'Bank' }}
                setValue={(e: any) => setData({ ...data, account: e })}
                value={data?.account}
              />
            </div>
            {data?.account?.uid && (
              <div className="flex items-center gap-4">
                <Label className="font-normal text-accent_soft_black">Balance</Label>
                <p>{data?.account?.opening_balance}</p>
              </div>
            )}
          </div>

          {/* part2 */}
          <div className="flex items-center gap-4">
            <Label className="font-medium text-accent_text_gray">Date</Label>
            <div className="">
              <DatePicker
                calenderClassName="max-md:left-1 max-md:right-1"
                onChange={setDate}
                value={date}
                ClassName="bg-transparent border-b-2  py-1 flex-1 focus:border-accent_soft_blue rounded-none w-full"
                placeholder="DD/MM/YYYY"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border-2 bg-white/60 p-4">
        <h2 className="text-lg font-normal text-accent_soft_black">
          Select the payments included in this deposit
        </h2>
        <div className="mt-2 w-full max-md:overflow-x-auto">
          {' '}
          <Table className="bg-white/60 font-lexend">
            <TableHeader className="rounded-t-xl bg-accent_bluish_gray">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-5 pl-3">{/* <Checkbox /> */}</TableHead>
                <TableHead className="text-left font-normal text-accent_soft_black">
                  RECEIVED FROM
                </TableHead>
                <TableHead className="px-1">DATE</TableHead>
                <TableHead className="px-1">TYPE</TableHead>
                <TableHead className="px-1">PAYMENT METHOD</TableHead>
                <TableHead className="px-1">MEMO</TableHead>
                <TableHead className="px-1">REF NO.</TableHead>
                <TableHead className="px-1">AMOUNT</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {PaymentList?.map((item: any, idx) => (
                <TableRow className="hover:bg-transparent" key={idx}>
                  <TableCell className="py-5 pl-3">
                    <SmoothCheckbox
                      checked={item?.is_checked}
                      onCheckedChange={() =>
                        handleInputChange(idx, 'is_checked', !item?.is_checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="cursor-pointer text-wrap px-2">
                    {item?.receivedFrom?.first_name || ''} {item?.receivedFrom?.middle_name || ''}{' '}
                    {item?.receivedFrom?.last_name || ''}
                  </TableCell>
                  <TableCell className="px-1">{item?.date}</TableCell>
                  <TableCell className="px-1"> {item?.type}</TableCell>

                  <TableCell className="px-2">
                    <PayMethodSelectDropdown
                      ClassName="rounded-lg border bg-white/60 px-2 py-2 outline-none disabled:bg-gray-200"
                      value={item?.payment_method}
                      setValue={(e: any) => {
                        handleInputChange(idx, 'payment_method', e);
                      }}
                    />
                  </TableCell>

                  <TableCell className="px-2">
                    <input
                      type="text"
                      value={item?.memo}
                      onChange={(e) => {
                        handleInputChange(idx, 'memo', e.target.value);
                      }}
                      placeholder=""
                      className="rounded-lg border px-3 py-2 outline-none disabled:bg-gray-200"
                    />
                  </TableCell>
                  <TableCell className="px-2">
                    <input
                      type="text"
                      value={item?.refNo}
                      onChange={(e) => {
                        handleInputChange(idx, 'refNo', e.target.value);
                      }}
                      placeholder=""
                      className="rounded-lg border bg-transparent px-3 py-2 outline-none"
                    />
                  </TableCell>
                  <TableCell>{item?.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>{' '}
          {isPending && (
            <div className="my-4 flex items-center justify-center">
              <LogoLoader size={50} color="#000000" />
            </div>
          )}
          {PaymentList?.length ? (
            <div className="flex items-center justify-center">
              <button
                disabled={!hasMore || isPending}
                onClick={() => setPage(page + 1)}
                className="bg-blue-200 px-2 py-1 text-accent_soft_blue hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-500"
              >
                Load more
              </button>
            </div>
          ) : (
            ''
          )}
          {!isPending && !PaymentList?.length ? (
            <div className="my-4 flex items-center justify-center">
              <p className="px-2 py-1 text-base text-accent_soft_blue">All set. Nothing here!</p>
            </div>
          ) : (
            ''
          )}
        </div>
        {!!PaymentList?.length && (
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSelectAll}
              // style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
              className="border px-4 py-2 text-sm font-normal hover:shadow-md"
            >
              Select all
            </Button>
            <Button
              onClick={handleUnSelectAll}
              // style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
              className="border px-4 py-2 text-sm font-normal hover:shadow-md"
            >
              Unselect all
            </Button>
          </div>
        )}
      </div>

      <AddToFundTable items={fundsData} setItems={setFundsData} />

      <div className="flex justify-end">
        <div
          className="space-y-4 rounded-xl border-2 bg-white/60 p-4"
          style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.05)' }}
        >
          <div className="flex items-center gap-4">
            <div>
              <label>Cash back goes to</label>
              <AccountSelectDropDown
                ClassName="placeholder:text-gray-500  placeholder:text-sm placeholder:font-light border rounded-md"
                setValue={(e: any) => setOthersData({ ...othersData, cash_back_account: e })}
                value={othersData?.cash_back_account}
              />
            </div>
            <div className="flex flex-col">
              <label>Cash back memo</label>
              <input
                className="rounded-md border px-4 py-2 outline-none"
                onChange={(e: any) =>
                  setOthersData({
                    ...othersData,
                    cash_back_memo: e.target.value,
                  })
                }
                value={othersData?.cash_back_memo}
              />
            </div>
            <div className="flex flex-col">
              <label>Cash back amount</label>
              <input
                onChange={(e: any) =>
                  setOthersData({
                    ...othersData,
                    cash_back_amount: e.target.value,
                  })
                }
                className="rounded-md border px-4 py-2 outline-none"
                value={othersData?.cash_back_amount}
              />
            </div>
          </div>
          <p className="text-right text-lg font-medium">
            Total :{' '}
            {(
              Number(data?.fundsTotal) +
              Number(data?.paymentListTotal) -
              Number(othersData?.cash_back_amount || 0)
            ).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Label className="mb-2 block font-medium text-accent_text_gray">Tags</Label>
        <TagInput tags={tags} onChange={setTags} />
      </div>
      <div className="relative mt-5">
        <Label className="mb-2 block font-medium text-accent_text_gray">Terms and Conditions</Label>
        <TextEditor
          setTermsCondition={(e) => setOthersData({ ...othersData, description: e })}
          // initialContent={othersData?.description}
        />
      </div>

      <div className="mb-8 mt-10 flex flex-col items-end justify-between md:flex-row">
        {/* <FileUpload
          onLinkedFilesChange={(e) => {}}
          onFilesChange={(e) =>
            setOthersData({ ...othersData, attachments: e })
          }
        /> */}
        <div className="flex items-center gap-8">
          <div className="relative flex items-center justify-between rounded-lg border-none bg-accent_soft_black text-[#fff] outline-none">
            <Button
              onClick={handleSave}
              isLoading={isLoading}
              className="text-nowrap px-6 py-3 text-[1rem] transition-all duration-500 md:px-16"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDeposit;
