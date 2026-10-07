'use client';
import { useEffect, useState } from 'react';
import Label from '@/components/ui/RawLabel';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import DatePicker from '@/components/ui/DatePicker';
import { getJournal } from '@/app/helpers/backend';
import JournalTable from '../../../_components/JournalTable';
import TagInput from '../../../_components/tag';
import FileUpload from '@/app/dashboard/sales/all_sales/_components/FileUpload';
import DotSpinner from '@/app/dashboard/hris/employee/employees/_components/dot-spinner';

const TextEditor = dynamic(() => import('@/app/dashboard/sales/all_sales/_components/TextEditor'), {
  ssr: false,
});

const JournalCreate = () => {
  const { id } = useParams();
  const [JournalItems, setJournalItems] = useState<any[]>([]);
  const [JournalData, setJournalData] = useState({
    date: '',
    entry_number: '',
    description: '',
    amount: '',
    total_debit: '',
    total_credit: '',
    status: '',
    journal_items: [],
    tag_title_list: [],
    files: [],
  });
  const [isPending, setIsPending] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [attachments, setAttachments] = useState<any[]>([]);

  useEffect(() => {
    const fn = async () => {
      try {
        setIsPending(true);
        const res = await getJournal(id);
        if (res) {
          setJournalData((prev) => ({
            ...prev,
            date: res.date || '',
            entry_number: res.entry_number || '',
            description: res.description || '',
            amount: res.amount || '',
            status: res.status || '',
          }));

          if (res.description) {
            setTermsCondition(res.description);
          }

          if (res.tag_title_list?.length) {
            setTags(res.tag_title_list);
          }

          if (res.files?.length) {
            setAttachments(res.files);
          }

          if (res.journal_item?.length) {
            const items = res.journal_item.map((item: any) => ({
              id: item.uid,
              debit: item.debit ? parseFloat(item.debit) : '',
              credit: item.credit ? parseFloat(item.credit) : '',
              account: item.account || {},
              name: item.supplier
                ? { ...item.supplier, type: 'Supplier' }
                : item.customer
                  ? { ...item.customer, type: 'Customer' }
                  : {},
              description: item.description || '',
            }));
            setJournalItems(items);

            const totalDebit = items.reduce(
              (sum: number, item: any) => sum + (Number(item.debit) || 0),
              0
            );
            const totalCredit = items.reduce(
              (sum: number, item: any) => sum + (Number(item.credit) || 0),
              0
            );
            setJournalData((prev) => ({
              ...prev,
              total_debit: totalDebit.toString(),
              total_credit: totalCredit.toString(),
            }));
          }
        }
      } catch (error) {
        ///err
      } finally {
        setIsPending(false);
      }
    };
    id && fn();
  }, [id]);

  if (isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <DotSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex font-lexend text-sm">
        <div className="w-full px-2">
          {/* Main Form Section */}
          <div className="mb-8 mt-3 rounded-2xl bg-[#ffff]/60 p-3 text-sm md:p-5">
            <div className="flex flex-col md:flex-row md:justify-between">
              <h1 className="text-2xl font-semibold text-[#131523] md:text-[32px]">
                Journal Entry
              </h1>
            </div>
            {/* Form Fields Grid */}
            <div className="mt-6 flex flex-col md:mt-9 md:flex-row md:gap-12">
              {/* Left Column */}
              <div className="flex-1 space-y-3">
                {/* Currency Selector */}
                {/* <div className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
                  <Label className="w-full flex-shrink-0 text-sm font-medium text-accent_text_gray md:w-3/10">
                    Currency
                  </Label>
                  <div className="custom-select relative w-full md:w-7/10">
                    <input
                      type="text"
                      value={searchCurrency}
                      readOnly
                      className="w-full flex-1 border-b-2 bg-transparent px-6 py-2 outline-none focus:border-accent_soft_blue"
                    />
                  </div>
                </div> */}

                {/* Journal Number */}
                <div className="item-center mt-4 flex justify-between gap-8 md:mt-7">
                  <div className="flex-1">
                    <div className="flex max-w-sm flex-col items-start justify-between gap-2 md:flex-row md:items-center">
                      <Label className="w-full flex-shrink-0 text-sm font-medium text-accent_text_gray md:w-3/10">
                        Journal No
                      </Label>
                      <input
                        value={JournalData.entry_number}
                        readOnly
                        placeholder="Journal No"
                        className="w-full border-b-2 bg-transparent px-3 py-2 outline-none md:flex-1 md:px-6"
                        type="text"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex-1 space-y-3 md:mt-0">
                    {/* ...existing right column fields... */}
                    <div className="flex max-w-sm items-center justify-between gap-2">
                      <Label className="w-3/10 flex-shrink-0 text-sm font-medium text-accent_text_gray">
                        Journal date
                      </Label>
                      <DatePicker
                        value={JournalData.date}
                        onChange={() => {}}
                        ClassName="border-b-2 py-1 rounded-none bg-transparent pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
            </div>
          </div>

          <JournalTable
            view={true}
            JournalData={JournalData}
            setJournalData={setJournalData}
            JournalItems={JournalItems}
            setJournalItems={setJournalItems}
          />

          {/* Tags Section */}
          <div className="mt-4 w-full">
            <div className="w-full">
              <TagInput tags={tags} onChange={setTags} view={true} />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="relative mt-4 md:mt-5">
            <Label className="mb-2 block font-medium text-accent_text_gray">
              Terms and Conditions
            </Label>
            <TextEditor
              setTermsCondition={setTermsCondition}
              initialContent={termsCondition}
              view={true}
            />
          </div>

          {/* Bottom Actions */}
          <div className="mb-7 mt-6 flex flex-col items-center justify-between gap-4 md:mt-10 md:flex-row md:items-end">
            <div className="w-full md:w-auto">
              <FileUpload
                isMultiple={false}
                onLinkedFilesChange={setAttachments}
                onFilesChange={() => {}}
                view={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalCreate;
