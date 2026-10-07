'use client';
import { useEffect, useState } from 'react';
import Label from '@/components/ui/RawLabel';
import Button from '@/components/ui/RawButton';
import { Temporal } from '@js-temporal/polyfill';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import JournalTable from './JournalTable';
import TagInput from './tag';
import { useAppSelector } from '@/app/redux/store';
import DatePicker from '@/components/ui/DatePicker';
import FileUpload from '../../sales/all_sales/_components/FileUpload';
import { postAttachment, PostJournal } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';
import TextAnimation from '../../sales/all_sales/_components/CustomTypewritter';
import { generateBillNumber } from '@/utils/GenerateNumber';

const TextEditor = dynamic(() => import('@/app/dashboard/sales/all_sales/_components/TextEditor'), {
  ssr: false,
});

const JournalCreate = () => {
  const [JournalItems, setJournalItems] = useState<any[]>([
    {
      id: Math.random().toString(36).substr(2, 9),
      debit: '',
      credit: '',
      account: {},
      name: {},
      description: '',
    },
  ]);
  const [preview, setPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(true);
  const todayDate = Temporal.Now.plainDateISO().toString();
  const [JournalData, setJournalData] = useState({
    date: todayDate,
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
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [termsCondition, setTermsCondition] = useState<any>();
  const [attachments, setAttachments] = useState<any[]>([]);
  const [filesList, setFilesList] = useState<File[]>([]);

  useEffect(() => {
    const div = document.getElementById('textInput');
    if (div) {
      div.innerHTML = termsCondition;
    }
  }, [termsCondition]);

  useEffect(() => {
    const number = generateBillNumber('Journal', 'Entry');
    setJournalData({ ...JournalData, entry_number: number });
  }, []);

  useEffect(() => {
    if (!Permissions?.includes('add_chartofaccount')) {
      router.push('/dashboard/transactions/journal');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Permissions]);

  const ConvertJournalItems = () => {
    const convertedItems = JournalItems?.map((item) => {
      const data: any = {
        debit: Number(item?.debit) || 0,
        credit: Number(item?.credit) || 0,
        kind: item?.debit > 0 ? 'DEBIT' : 'CREDIT',
        account: item?.account?.uid || '',
        description: item?.description,
      };

      if (item?.name?.type == 'Supplier') {
        data.supplier = item?.name?.uid;
      }
      if (item?.name?.type == 'Customer') {
        data.customer = item?.name?.uid;
      }
      return data;
    });

    return convertedItems;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const convertedItems = ConvertJournalItems();
    if (!convertedItems?.length) {
      return toast.error('Add some items to create journal entry');
    }
    if (JournalData?.total_credit != JournalData?.total_debit) {
      return toast.error('Debit and credit totals must be equal!');
    }
    const data = {
      date: JournalData?.date,
      entry_number: JournalData?.entry_number,
      description: termsCondition,
      amount: JournalData?.total_credit,
      status: 'PUBLISHED',
      journal_items: convertedItems,
      tag_title_list: tags,
    };
    try {
      setIsLoading(true);
      let files: any = [];
      if (filesList?.length) {
        try {
          const formData = new FormData();
          formData.append('file', filesList[0]);
          const res = await postAttachment(formData);
          if (res?.success) {
            files = [res?.uid];
          } else {
            return;
          }
        } catch (error) {
          return;
        }
      }
      const Attach = attachments?.map((a) => a?.uid);
      const res = await PostJournal({ ...data, files: [...files, ...Attach] });
      if (res?.success) {
        toast.success('Journal created.');
        router.push('/dashboard/transactions/journal');
      }
    } catch (error) {
      //error
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesChange = (newFiles: File[]) => {
    setFilesList(newFiles);
  };

  return (
    <div>
      {isLoading && (
        <div className="absolute left-0 top-0 z-[10] h-full w-full rounded-xl bg-opacity-70">
          <div className="flex h-full w-full flex-col items-center justify-center">
            <p className="inline-block h-20 w-20 animate-spin rounded-full border-[3px] border-gray-100 border-t-accent_soft_blue" />{' '}
            <div className="mt-2">
              <TextAnimation
                messages={['Creating Journal', 'Sending Journal', 'Uploading Attachments']}
                start={isLoading}
              />
            </div>
          </div>
        </div>
      )}
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
                        onChange={(e) =>
                          setJournalData({
                            ...JournalData,
                            entry_number: e.target.value,
                          })
                        }
                        placeholder="Journal No"
                        className="w-full border-b-2 bg-transparent px-3 py-2 outline-none focus:border-accent_soft_blue md:flex-1 md:px-6"
                        type="text"
                        required
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
                        // isPrevious={true}
                        value={JournalData.date}
                        onChange={(e) => setJournalData({ ...JournalData, date: e })}
                        ClassName="border-b-2 py-1 rounded-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
            </div>
          </div>

          <JournalTable
            JournalData={JournalData}
            setJournalData={setJournalData}
            JournalItems={JournalItems}
            setJournalItems={setJournalItems}
          />

          {/* Tags Section */}
          <div className="mt-4 w-full">
            <div className="w-full">
              <TagInput tags={tags} onChange={setTags} preview={preview} />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="relative mt-4 md:mt-5">
            <Label className="mb-2 block font-medium text-accent_text_gray">
              Terms and Conditions
            </Label>
            <TextEditor setTermsCondition={setTermsCondition} initialContent={termsCondition} />
          </div>

          {/* Bottom Actions */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 md:mt-10 md:flex-row md:items-end">
            <div className="w-full md:w-auto">
              <FileUpload
                isMultiple={false}
                onLinkedFilesChange={setAttachments}
                onFilesChange={handleFilesChange}
                preview={preview}
              />
            </div>
            <div
              className={`flex w-full flex-col items-center gap-4 sm:flex-row md:w-auto md:gap-8 ${!preview ? 'block' : 'hidden'}`}
            >
              <Button
                onClick={handleSubmit}
                className="w-full border border-accent_soft_black bg-accent_soft_black px-4 font-semibold text-white"
                style={{ boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)' }}
              >
                Save and Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalCreate;
