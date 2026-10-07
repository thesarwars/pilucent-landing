'use client';

import { useEffect, useState } from 'react';
import { fetchAccounts, patchTransaction, PostJournal } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import CustomerSupplierSelectDropdown from '@/components/ui/ScrollSelectDropDowns/CustomerSupplierSelectDropdown';
import AccountSelectDropDown from '@/components/ui/ScrollSelectDropDowns/AccountSelectDropDown';
import Label from '@/components/ui/RawLabel';
import { RxCross2 } from 'react-icons/rx';
import Dropdown from './FormatMappingDropdown';
import TagInput from '@/app/dashboard/sales/all_sales/_components/TagInput';
import TransactionToolbar from './TransactionToolbar';
import ResizableTable from './BankingTable';

// Define our data type

const columns: any = [
  {
    dataField: 'date',
    title: 'Date',
    width: 150,
    sortable: true,
  },
  {
    dataField: 'description',
    title: 'Description',
    width: 200,
    sortable: true,
  },
  {
    dataField: 'category',
    title: 'Category or Match',
    formatter: (row: any) => (
      <div>
        {row?.match_count > 0 ? (
          row?.match_count < 2 ? (
            <div>
              <p className="inline-block rounded bg-accent_soft_blue px-2 py-[1px] text-xs text-white">
                {row?.match_count} match found
              </p>
              <p className="font-medium">
                <span className="">Amount</span> - $ {row?.matched_items?.[0]?.amount}
              </p>
              <p className="capitalize">
                <span className="">{row?.matched_items?.[0]?.date}</span> -{' '}
                {row?.matched_items?.[0]?.match_type?.split('_')?.join(' ')}
              </p>
            </div>
          ) : (
            <p className="inline-block rounded bg-accent_soft_blue px-4 py-0.5 text-[13px] text-white">
              {row?.match_count} match found
            </p>
          )
        ) : (
          <p>{row?.category}</p>
        )}
      </div>
    ),
    width: 250,
    sortable: false,
  },
  {
    dataField: 'received',
    title: 'Received',
    width: 250,
    sortable: true,
  },
  {
    dataField: 'spent',
    title: 'Spent',
    width: 150,
    sortable: true,
  },
  {
    dataField: 'spam',
    title: 'SPAM',
    formatter: (data: any) => (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          !data?.is_spam ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
        }`}
      >
        {data?.is_spam ? 'SPAM' : 'PASS'}
      </span>
    ),
    width: 120,
    sortable: true,
  },
];

const ReviewTransactionsTable = ({
  AccountRefetch,
  data,
  isPending,
  setQueryParams,
  params,
  refetch,
}: {
  AccountRefetch: any;
  data: any;
  isPending: any;
  setQueryParams: any;
  params: any;
  refetch: any;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.filter((col: any) => !col.hidden).map((col: any) => col.dataField)
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedRow, setExpandedRow] = useState<string>();

  const handleForReviewAction = async (item: any) => {
    try {
      setIsLoading(true);
      const Account = await fetchAccounts({
        title: item?.category || '',
      });
      if (Account?.results?.[0]?.uid) {
        const data = {
          date: item?.date,
          amount: item?.received || item?.spent,
          status: 'PUBLISHED',
          journal_items: [
            {
              debit: item?.received || 0, //received
              credit: item?.spent || 0, //spent
              kind: item?.received > 0 ? 'DEBIT' : 'CREDIT',
              account_uid: item?.chart_of_account?.uid, //csv account
            },
            {
              debit: item?.spent || 0, //spent
              credit: item?.received || 0, //received
              kind: item?.received > 0 ? 'CREDIT' : 'DEBIT',
              account_uid: Account?.uid, //item selected account
            },
          ],
        };
        // const formData = new FormData();
        // Object.keys(data).forEach((key) => {
        //   formData.append(key, data[key as keyof typeof data] || "");
        // });

        const res = await PostJournal(data);
        if (res?.success && res?.uid) {
          const result = await patchTransaction({
            transactions: [
              {
                uid: item?.uid,
                journal_uid: res?.uid,
                transaction_status: 'CATEGORIZED',
              },
            ],
          });
          if (result?.success) {
            refetch();
            AccountRefetch();
            toast.success('1 Transaction categorized.');
          }
        }
      } else {
        toast.error('Category not found. Please select by yourself');
        setExpandedRow(item?.uid);
      }
    } catch (error) {
      //error here
    } finally {
      setIsLoading(false);
    }
  };

  const ExpendedElement = ({ item, index }: { item: any; index: number }) => {
    const [action, setAction] = useState<any>('categorize');
    const [selectedMatchedItem, setSelectedMatchedItem] = useState<string>('');
    const [attachment, setAttachment] = useState<any>();
    const [tags, setTags] = useState<string[]>([]);
    const [transactionData, setTransactionData] = useState<any>({
      transaction_kind: 'DEPOSIT',
      payee: '',
      account: '',
      description: '',
    });

    useEffect(() => {
      const fn = async () => {
        try {
          const defaultAccount = await fetchAccounts({
            title: item?.category,
          });
          if (defaultAccount?.results?.[0]?.uid) {
            setTransactionData({
              ...transactionData,
              account: defaultAccount?.results[0],
            });
          }
        } catch (error) {
          //error here
        } finally {
          // setIsMounted(true);
        }
      };
      fn();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item]);

    useEffect(() => {
      item?.match_count > 0 && setAction('match');
      setSelectedMatchedItem(item?.matched_items?.[0]?.journal_entry_uid);
    }, [item]);

    const handleExclude = async (item: any) => {
      try {
        setIsLoading(true);
        const result = await patchTransaction({
          transactions: [
            {
              transaction_status: 'EXCLUDED',
              uid: item?.uid,
            },
          ],
        });
        if (result?.success) {
          refetch();
          AccountRefetch();
          toast.success(`${result?.message?.split(' ')[0] || ''} transactions excluded`);
        }
      } catch (error) {
        //error
      } finally {
        setIsLoading(false);
      }
    };

    const handleTransferred = async () => {
      if (!transactionData?.account?.uid) {
        toast.error('Please select an account');
        return;
      }

      const data = {
        date: item?.date,
        description: transactionData?.description || item?.description || '',
        amount: item?.received || item?.spent,
        status: 'PUBLISHED',
        journal_items: [
          {
            debit: item?.received || 0, //received
            credit: item?.spent || 0, //spent
            kind: item?.received > 0 ? 'DEBIT' : 'CREDIT',
            account: item?.chart_of_account?.uid, //csv account
          },
          {
            debit: item?.spent || 0, //spent
            credit: item?.received || 0, //received
            kind: item?.received > 0 ? 'CREDIT' : 'DEBIT',
            account: transactionData?.account?.uid, //item selected account
          },
        ],
      };

      try {
        setIsLoading(true);
        const res = await PostJournal(data);
        if (res?.success && res?.uid) {
          const result = await patchTransaction({
            transactions: [
              {
                transaction_status: 'CATEGORIZED',
                uid: item?.uid,
                journal_entry: res?.uid,
              },
            ],
          });
          if (result?.success) {
            refetch();
            AccountRefetch();
            toast.success(`${result?.message?.split(' ')[0] || ''} transactions categorized`);
          }
        }
      } catch (error) {
        //error
      } finally {
        setIsLoading(false);
      }
    };

    const handleCategorize = async () => {
      if (action == 'categorize') {
        if (!transactionData?.account?.uid) {
          toast.error('Please select an account');
          return;
        }
        const contact =
          transactionData?.payee?.type == 'Supplier'
            ? { supplier_uid: transactionData?.payee?.uid }
            : transactionData?.payee?.uid
              ? { customer_uid: transactionData?.payee?.uid }
              : {};

        const data = {
          date: item?.date,
          description: transactionData?.description || item?.description || '',
          amount: item?.received || item?.spent,
          status: 'PUBLISHED',
          journal_items: [
            {
              debit: item?.received || 0, //received
              credit: item?.spent || 0, //spent
              kind: item?.received > 0 ? 'DEBIT' : 'CREDIT',
              account: item?.chart_of_account?.uid, //csv account
            },
            {
              debit: item?.spent || 0, //spent
              credit: item?.received || 0, //received
              kind: item?.received > 0 ? 'CREDIT' : 'DEBIT',
              account: transactionData?.account?.uid, //item selected account
              ...contact,
            },
          ],
          tag_title_list: tags,
        };

        try {
          setIsLoading(true);
          const res = await PostJournal(data);
          if (res?.success && res?.uid) {
            const result = await patchTransaction({
              transactions: [
                {
                  transaction_status: 'CATEGORIZED',
                  uid: item?.uid,
                  journal_entry: res?.uid,
                },
              ],
            });
            if (result?.success) {
              refetch();
              AccountRefetch();
              toast.success(`${result?.message?.split(' ')[0] || ''} transactions categorized`);
            }
          }
        } catch (error) {
          //error
        } finally {
          setIsLoading(false);
        }
      }
    };

    const handleMatchCategorize = async (itemUID: string, journalUID: string) => {
      try {
        setIsLoading(true);
        const result = await patchTransaction({
          transactions: [
            {
              transaction_status: 'CATEGORIZED',
              uid: itemUID,
              is_matched: true,
              journal_entry: journalUID,
            },
          ],
        });
        if (result?.success) {
          refetch();
          AccountRefetch();
          toast.success(`${result?.message?.split(' ')[0] || ''} transactions categorized`);
        }
      } catch (error) {
        //error
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <tr className="bg-gray-50">
        <td colSpan={visibleColumns.length + 2} className="col-span-full px-8 py-4">
          <div className="my-2 mb-4 flex flex-wrap items-center gap-4">
            <label
              onClick={() => {
                setAction('categorize');
              }}
              htmlFor={'transactionValues' + index}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name={'transactionValues' + index}
                value="categorize"
                checked={action == 'categorize'}
                // onChange
                className="h-5 w-5 accent-accent_soft_blue"
              />
              Categorize
            </label>
            <label
              onClick={() => {
                setAction('match');
              }}
              htmlFor={'transactionValues' + index}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name={'transactionValues' + index}
                value="match"
                checked={action == 'match'}
                // onChange=
                className="h-5 w-5 accent-accent_soft_blue"
              />
              Match
            </label>
            <label
              onClick={() => {
                setAction('record');
              }}
              htmlFor={'transactionValues' + index}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name={'transactionValues' + index}
                value="record"
                checked={action == 'record'}
                // onChange=
                className="h-5 w-5 accent-accent_soft_blue"
              />
              Record as transfer
            </label>
          </div>
          {action == 'categorize' && (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div>
                  <p className="mb-2 text-gray-500">Transaction Type</p>
                  <div className="w-64">
                    <Dropdown
                      options={[
                        { title: 'Deposit', value: 'DEPOSIT' },
                        // { title: "Sale Receipt", value: "SALE_RECEIPT" },
                      ]}
                      value={transactionData?.transaction_kind}
                      // setValue={(e: any) => {
                      //   setTransactionData({
                      //     ...transactionData,
                      //     transaction_kind: e,
                      //   });
                      // }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 text-gray-500">
                <div>
                  <p className="mb-1">
                    Supplier/Customer {/* <span className="text-base text-red-500">*</span> */}
                  </p>
                  <CustomerSupplierSelectDropdown
                    value={transactionData?.payee}
                    setValue={(e: any) => setTransactionData({ ...transactionData, payee: e })}
                    ClassName="border border-gray-300  rounded-md px-4"
                    parentClassName="md:min-w-72"
                  />
                </div>
                <div className="">
                  <p className="mb-1">
                    Account <span className="text-base text-red-500">*</span>
                  </p>
                  <AccountSelectDropDown
                    value={transactionData?.account}
                    setValue={(e: any) => setTransactionData({ ...transactionData, account: e })}
                    ClassName="border min-w- border-gray-300 rounded-md px-4"
                    parentClassName="md:min-w-80"
                  />
                </div>
              </div>
              <div className="mt-5 max-w-2xl">
                <Label className="mb-2 block font-medium text-gray-500">Tags</Label>
                <TagInput tags={tags} onChange={setTags} />
              </div>
              <div className="mt-2 max-w-2xl">
                <Label className="mb-2 block font-medium text-gray-500">Memo</Label>
                <input
                  value={transactionData?.description}
                  onChange={(e: any) => {
                    setTransactionData({
                      ...transactionData,
                      description: e.target?.value,
                    });
                  }}
                  className="w-full rounded-md border border-gray-300 bg-transparent px-4 py-2 outline-none placeholder:text-accent_text_slate"
                />
              </div>
              <div className="mt-4">
                <TransactionToolbar
                  onAddAttachment={(file: any) => {
                    setAttachment(file);
                  }}
                  onAdd={handleCategorize}
                  onExclude={() => handleExclude(item)}
                  // onSplit={() => {}}
                  onCreateRule={() => {}}
                />
                {attachment?.name && (
                  <p className="flex items-center gap-2">
                    {attachment?.name || ''}{' '}
                    <RxCross2
                      onClick={() => setAttachment('')}
                      className="cursor-pointer rounded-full p-0.5 text-lg hover:bg-gray-200"
                    />{' '}
                  </p>
                )}
              </div>
            </>
          )}
          {action == 'match' && (
            <>
              <p className="mb-1">
                Matched Items
                <span className="text-base text-red-500">*</span>
              </p>
              <div className="mt-4 flex flex-col gap-5">
                {item?.matched_items?.map((mItem: any, index: number) => {
                  return (
                    <label
                      key={index}
                      onClick={() => {
                        setSelectedMatchedItem(mItem?.journal_entry_uid);
                      }}
                      htmlFor={mItem?.journal_entry_uid}
                      className="flex cursor-pointer items-start gap-2"
                    >
                      <input
                        type="radio"
                        name={mItem?.journal_entry_uid}
                        value={mItem?.journal_entry_uid}
                        checked={selectedMatchedItem == mItem?.journal_entry_uid}
                        className="mt-0.5 h-5 w-5 accent-accent_soft_blue"
                      />
                      <div className="text-sm font-light">
                        <p className="text-[13px]">
                          <span className="font-normal text-accent_soft_blue">
                            {mItem?.account_name}
                          </span>{' '}
                          -- {item?.description}
                        </p>
                        <p className="font-normal capitalize">
                          $ {mItem?.amount} - {mItem?.match_type?.split('_')?.join(' ')}
                        </p>
                      </div>
                    </label>
                  );
                })}
                <div className="flex items-center justify-between">
                  <div className="">
                    <h3>DESCRIPTION:</h3>
                    <p>{item?.description}</p>
                  </div>
                  <button
                    type="button"
                    className={`inline-block rounded-md bg-accent_soft_blue px-8 py-1.5 text-base text-white transition-colors hover:bg-opacity-95`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMatchCategorize(item?.uid, selectedMatchedItem);
                    }}
                  >
                    Match
                  </button>
                </div>
              </div>
            </>
          )}
          {action == 'record' && (
            <>
              <div className="">
                <p className="mb-1">
                  Transferred from <span className="text-base text-red-500">*</span>
                </p>
                <AccountSelectDropDown
                  value={transactionData?.account}
                  setValue={(e: any) => setTransactionData({ ...transactionData, account: e })}
                  ClassName="border min-w- border-gray-300 rounded-md px-4"
                  parentClassName="md:min-w-80 max-w-sm"
                />
              </div>

              <div className="mt-2 max-w-2xl">
                <Label className="mb-2 block font-medium text-gray-500">Memo</Label>
                <input
                  value={transactionData?.description}
                  onChange={(e: any) => {
                    setTransactionData({
                      ...transactionData,
                      description: e.target?.value,
                    });
                  }}
                  className="w-full rounded-md border border-gray-300 bg-transparent px-4 py-2 outline-none placeholder:text-accent_text_slate"
                />
              </div>
              <div className="mt-4">
                <TransactionToolbar
                  onAddAttachment={(file: any) => {
                    setAttachment(file);
                  }}
                  onAdd={() => handleTransferred()}
                  onExclude={() => handleExclude(item)}
                  // onSplit={() => {}}
                  onCreateRule={() => {}}
                />
                {attachment?.name && (
                  <p className="flex items-center gap-2">
                    {attachment?.name || ''}{' '}
                    <RxCross2
                      onClick={() => setAttachment('')}
                      className="cursor-pointer rounded-full p-0.5 text-lg hover:bg-gray-200"
                    />{' '}
                  </p>
                )}
              </div>
            </>
          )}
        </td>
      </tr>
    );
  };

  const handleBulkExclude = async () => {
    const SelectedData = data?.results?.filter((t: any) => selectedRows.has(t?.uid));
    const selectedDataPayload = SelectedData?.map((d: any) => {
      return { uid: d?.uid, transaction_status: 'EXCLUDED' };
    });
    try {
      setIsLoading(true);
      const result = await patchTransaction({
        transactions: selectedDataPayload,
      });
      if (result?.success) {
        setSelectedRows(new Set());
        refetch();
        AccountRefetch();
        toast.success(`${result?.message?.split(' ')[0] || ''} transactions excluded`);
      }
    } catch (error) {
      //error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorize = async (SuccessEntries: any) => {
    const SuccessJournals = [];
    const FailedJournals = [];
    for (const item of SuccessEntries) {
      try {
        const data = {
          date: item?.date,
          amount: item?.received || item?.spent,
          status: 'PUBLISHED',
          journal_items: JSON.stringify([
            {
              debit: item?.received || 0, //received
              credit: item?.spent || 0, //spent
              kind: Number(item?.received) > 0 ? 'DEBIT' : 'CREDIT',
              account_uid: item?.chart_of_account?.uid, //csv account
            },
            {
              debit: item?.spent || 0, //spent
              credit: item?.received || 0, //received
              kind: Number(item?.received) > 0 ? 'CREDIT' : 'DEBIT',
              account_uid: item?.c_uid, //item selected account
            },
          ]),
        };
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key as keyof typeof data] || '');
        });
        const res = await PostJournal(formData);
        if (res?.uid) {
          SuccessJournals.push({
            uid: item?.uid,
            transaction_status: 'CATEGORIZED',
            journal_entry: res?.uid,
          });
        } else {
          FailedJournals.push({
            uid: item?.uid,
            transaction_status: 'CATEGORIZED',
          });
        }
      } catch (error) {
        FailedJournals.push({
          uid: item?.uid,
          transaction_status: 'CATEGORIZED',
        });
        continue; // Skip to next iteration
      }
    }

    return { SuccessJournals, FailedJournals };
  };

  const handleBulkCategorize = async () => {
    const SelectedData = data?.results?.filter((t: any) => selectedRows.has(t?.uid));
    const SuccessEntries = [];
    const FailedEntries = [];
    try {
      setIsLoading(true);

      for (const data of SelectedData) {
        try {
          const Account = await fetchAccounts({
            title: data?.category || '',
          });
          if (Account?.results?.[0]?.uid) {
            SuccessEntries.push({ ...data, c_uid: Account?.results?.[0]?.uid });
          } else {
            FailedEntries.push(data); // Optional: Track failed entries
          }
        } catch (error) {
          continue; // Skip to next iteration
        }
      }

      const { SuccessJournals, FailedJournals } = await handleCategorize(SuccessEntries);

      if (SuccessJournals?.length > 0) {
        try {
          const res = await patchTransaction({
            transactions: SuccessJournals,
          });
          if (res?.success) {
            toast.success(`${res?.message?.split(' ')[0] || ''} transactions categorized`);
          }
        } catch (error) {
          //error here
        }
      } else {
        toast.error(
          `${Number(FailedEntries?.length) + Number(FailedJournals?.length)} transactions failed to categorize`
        );
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative font-lexend">
      {selectedRows?.size > 0 && (
        <div className="sticky top-0 z-[100] mt-2 w-full rounded-md bg-blue-500 px-2">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="text flex-1 text-nowrap font-normal text-white">
              {selectedRows?.size} transactions selected.
            </div>
            <div className="flex w-full flex-1 items-center justify-center gap-8 py-2.5">
              <button
                onClick={handleBulkCategorize}
                className="rounded-md border border-accent_soft_black bg-white px-5 py-1.5 font-normal text-accent_soft_black transition-colors hover:bg-accent_soft_black hover:text-white active:scale-95"
              >
                Categorize
              </button>
              <button
                onClick={handleBulkExclude}
                className="rounded-md border border-accent_soft_black bg-white px-5 py-1.5 font-normal text-accent_soft_black transition-colors hover:bg-accent_soft_black hover:text-white active:scale-95"
              >
                Exclude
              </button>
            </div>
            <div className="flex-1"></div>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="absolute left-0 top-0 z-[100] h-full w-full bg-white bg-opacity-60">
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div className="h-14 w-14 animate-spin rounded-full border-b-[4px] border-t-[4px] border-b-accent_soft_blue border-t-primary"></div>
          </div>
        </div>
      )}
      <ResizableTable
        setSelectedRows={setSelectedRows}
        selectedRows={selectedRows}
        setVisibleColumns={setVisibleColumns}
        visibleColumns={visibleColumns}
        setExpandedRow={setExpandedRow}
        expandedRow={expandedRow}
        refetch={refetch}
        params={params}
        setParams={setQueryParams}
        isPending={isPending}
        data={data}
        columns={columns}
        keyExtractor={(data: any) => data.uid}
        onRowClick={(data: any) => console.log(data)}
        emptyMessage="All set with this account. Go to the next account to review more transactions. You can also check out your updated"
        storageName="ReviewTableBank"
        ActionFormatter={(item: any) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleForReviewAction(item);
            }}
            className="rounded-md px-4 py-1.5 font-semibold text-accent_soft_blue hover:bg-opacity-90 active:scale-95"
          >
            Add
          </button>
        )}
        ExpendedElement={({ item, index }: { item: any; index: any }) => (
          <ExpendedElement index={index} item={item} />
        )}
      />
    </div>
  );
};

export default ReviewTransactionsTable;
