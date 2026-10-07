import { DownloadIcon } from '@radix-ui/react-icons';
import { FormEvent, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import Button from '@/components/ui/RawButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import PDFModal from '@/app/dashboard/reports/_components/PDFModal';
import { DownloadEmployeeExcel, postPunchData } from '@/app/helpers/backend';
import moment from 'moment';
import { toast } from '@/lib/ToastService';
interface FileUploadProps {
  setFiles: (files: File[]) => void;
}

const UploadFile: React.FC<FileUploadProps> = ({ setFiles }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files?.[0]);
      e.dataTransfer.clearData();
    }
  };

  const [jsonData, setJsonData] = useState([]);

  const handleFileUpload = (file: any) => {
    if (!file) return;
    setFile(file);
    const reader = new FileReader();

    // Handle CSV
    if (file.name.endsWith('.csv')) {
      reader.onload = (event: any) => {
        const text = event.target.result;
        const rows = text.split('\n').map((row: any) => row.split(','));
        const headers = rows[0];
        const json = rows.slice(1).map((row: any) => {
          const obj: any = {};
          headers.forEach((header: any, i: any) => (obj[header.trim()] = row[i]?.trim()));
          return obj;
        });
        setJsonData(json);
      };
      reader.readAsText(file);
    }

    // Handle Excel (.xlsx or .xls)
    else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const data = e.target?.result as string;
        const workbook = XLSX.read(data, {
          type: 'binary',
        });
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const sheet = workbook.Sheets[sheetName];
        const parsedData: any[] = XLSX.utils.sheet_to_json(sheet, {
          raw: false,
        });
        setJsonData(parsedData as any);
      };
      reader.readAsBinaryString(file);
    } else {
      alert('Please upload a .csv or .xlsx file');
    }
  };

  const [Titles, setTitles] = useState<any[]>([]);
  useEffect(() => {
    if (jsonData.length) {
      const Titles = Object.keys(jsonData[0]);
      setTitles(Titles);
      setIsOpen(true);
    }
  }, [jsonData]);

  // Handle document upload
  const handleUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
      // setDocuments([...documents, newDocument]);
    }
  };

  const handleDelete = (id: number) => {
    const data = jsonData.filter((data, idx) => id !== idx);
    setJsonData(data);
  };

  const handleSubmit = async () => {
    const data = jsonData?.map((d: any) => {
      const checkOut = moment(d?.check_out, 'HH:mm:ss');
      const checkIn = moment(d?.check_in, 'HH:mm:ss');

      // Difference in seconds
      const diffInSeconds = checkOut.diff(checkIn, 'seconds');
      const diffInHours = diffInSeconds / 3600;
      return {
        worked_hour: diffInHours,
        employee_id: d?.employee_id, // Another Employee ID
        date: d?.date,
        check_in: d?.check_in,
        check_out: d?.check_out,
        remark: d?.remark,
      };
    });

    // console.log(data);
    // return;
    try {
      setIsPending(true);
      const res = await postPunchData({ data: data });
      if (res?.success) {
        toast.success('Attendance data imported successfully!');
        setJsonData([]);
        setFile(null);
        setIsOpen(false);
      }
    } catch (error) {
      //error
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div
      style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.05)' }}
      className="rounded-xl border bg-white/60 p-4 shadow"
    >
      {' '}
      <div className="max-w-xl rounded-xl border border-dashed p-4">
        <h1 className="mb-2 font-semibold text-[#414042]">Upload your attendance file</h1>
        <div className="gap-4">
          <p className="text-gray-500">Click to browse or drag and drop your files or </p>
          <div
            className="relative flex cursor-pointer items-center rounded-md"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <label
                htmlFor="file-upload"
                className="mt-2 flex max-w-36 flex-1 cursor-pointer items-center justify-center rounded-md border border-gray-400 px-4 py-2 text-gray-500"
              >
                {isLoading ? 'Uploading...' : 'Browse files'}
              </label>
              <input
                id="file-upload"
                // value={file && file }
                type="file"
                className="left-0 top-0 hidden h-full w-full cursor-pointer opacity-0"
                onChange={(e) => e.target.files && handleUpload(e)}
              />
              <p className="mt-2 flex-1 text-gray-500">
                {file?.name}
                {/* {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-start gap-1 p-2"
                  >
                    <span className="text-sm">{file.name.slice(0, 40)}...</span>
                    <button onClick={() => handleRemoveFile(file.name)}>
                      <RxCross1 className="text-lg text-red-500 hover:text-red-700" />
                    </button>
                  </div>
                ))} */}
              </p>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={async () => {
          try {
            const res = await DownloadEmployeeExcel();
          } catch (error) {}
        }}
        className="mt-2 flex w-80 cursor-pointer items-center gap-1 font-normal text-accent_soft_blue hover:underline"
      >
        Download a sample file <DownloadIcon className="text-xl font-bold" />
      </button>
      <PDFModal
        isOpen={isOpen}
        onClose={() => {
          if (isPending) return;
          setIsOpen(false);
        }}
        title={'VERIFY INFO'}
      >
        <div
          // style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
          className="rounded-xl bg-white/60 p-4 text-sm"
        >
          {/* <CustomerImportSteps currentStep={3} /> */}
          <div className="overflow-x-auto">
            <div className="w-full overflow-x-auto">
              <Table className="font-lexend">
                <TableHeader className="">
                  <TableRow>
                    {Titles.map((title) => (
                      <TableHead
                        className="text-nowrap px-2 text-sm font-normal capitalize"
                        key={title}
                      >
                        {title.split('_').join(' ')}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {jsonData.length !== 0 &&
                    Titles.length !== 0 &&
                    jsonData?.map((data, idx) => {
                      return (
                        <TableRow key={idx}>
                          {Titles?.map((title, idx) => (
                            <TableCell
                              key={idx}
                              className="max-w-40 overflow-hidden px-2 text-xs font-light"
                            >
                              {data[title]}
                            </TableCell>
                          ))}
                          {/* <TableCell>
                            <Button className="font-normal text-sm hover:bg-gray-200 py-1 px-2.5">Edit</Button>
                          </TableCell> */}
                          <TableCell>
                            <Button
                              className="px-2.5 py-1 text-sm font-normal hover:bg-gray-200"
                              onClick={() => handleDelete(idx)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-24 flex justify-center gap-12">
            <Button
              onClick={() => {
                if (isPending) return;
                setIsOpen(false);
                setFile(null);
              }}
              type="button"
              className="w-40 border border-accent_soft_black bg-white/60 text-sm font-semibold text-accent_soft_black transition-all hover:bg-accent_soft_black hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit()}
              isLoading={isPending}
              className="flex w-40 min-w-40 max-w-40 items-center justify-center gap-1 bg-accent_soft_black text-sm font-semibold text-white"
            >
              {false ? 'Importing...' : 'Import'}
            </Button>
          </div>
        </div>
      </PDFModal>
    </div>
  );
};

export default UploadFile;
