import Button from "@/components/ui/RawButton";
import React, { useEffect, useState } from "react";
import { PiUploadBold } from "react-icons/pi";
import Link from "next/link";
import {
  deleteEmployeeFiles,
  fetchEmployeeFiles,
  postEmployeeFiles,
} from "@/app/helpers/backend";
import { RxCross1 } from "react-icons/rx";
import {
  DownloadIcon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  Trash2Icon,
  VideoIcon,
} from "lucide-react";
import { IoMdCloudUpload } from "react-icons/io";
import Swal from "sweetalert2";
import Table from "@/app/(admin)/_components/Table";
import { useFetch } from "@/app/helpers/hooks";
import moment from "moment";
import { toast } from "@/lib/ToastService";
import W4Form from "./W4Form";
import DocumentationTable from "./DcoumentationTable";

const getFileIcon = (kind: string, title: string) => {
  const fileType = kind;
  const fileName = title;

  if (
    fileType.includes("pdf") ||
    fileName.endsWith(".pdf") ||
    fileType.includes("word") ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx")
  ) {
    return <FileTextIcon className="size-4 opacity-60" />;
  } else if (
    fileType.includes("zip") ||
    fileType.includes("archive") ||
    fileName.endsWith(".zip") ||
    fileName.endsWith(".rar")
  ) {
    return <FileArchiveIcon className="size-4 opacity-60" />;
  } else if (
    fileType.includes("excel") ||
    fileName.endsWith(".xls") ||
    fileName.endsWith(".xlsx")
  ) {
    return <FileSpreadsheetIcon className="size-4 opacity-60" />;
  } else if (fileType.includes("video/")) {
    return <VideoIcon className="size-4 opacity-60" />;
  } else if (fileType.includes("audio/")) {
    return <HeadphonesIcon className="size-4 opacity-60" />;
  } else if (fileType.startsWith("image/")) {
    return <ImageIcon className="size-4 opacity-60" />;
  }
  return <FileIcon className="size-4 opacity-60" />;
};

const Documentation = ({
  uid,
  employee,
  view = false,
}: {
  uid: string;
  employee: any;
  view?: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [file, setFile] = useState<File | any>("");
  const [isUpload, setIsUpload] = useState(false);
  const { data, isPending, refetch, setQueryParams, params } = useFetch(
    ["employee_files", uid],
    fetchEmployeeFiles,
    {},
    { enabled: !!uid },
    uid,
  );


  const handlePostFile = async () => {
    if (!file?.size) {
      return toast.error("Select your file first");
    }
    try {
      setIsLoading(true);
      if (file?.size > 50 * 1024 * 1024)
        return toast.info("Max upload size is 50 MB");
      const formData = new FormData();
      formData.append("file", file);

      const result = await postEmployeeFiles(uid, formData, {
        timeout: 600000,
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(percentCompleted);
        },
      });
      if (result?.success) {
        refetch();
        setFile([]);
        setIsUpload(false);
      }
    } catch (error) {
      // console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      // handlePostFile(droppedFile);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // handlePostFile(selectedFile);
    }
  };

  const removeFile = (fileUID: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      timerProgressBar: true,
      timer: 20000,
      theme: "dark",
      background: "#181640a1",
      confirmButtonColor: "#6A6EF6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, delete`,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const response = await deleteEmployeeFiles(uid, fileUID);
          if (response.success) {
            refetch();
            return response;
          }
          throw new Error("Failed");
        } catch (error) {
          Swal.showValidationMessage(`${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          background: "#181640",
          title: "Success!",
          text: "Leave type has been deleted.",
          icon: "success",
          color: "white",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const columns = [
    {
      text: "NAME",
      dataField: "title",
      formatter: (cell: any, row: any) => {
        return (
          <div className="flex items-center gap-1">
            {getFileIcon(row?.kind, row?.title)}
            <p className="text-wrap">{cell}</p>
          </div>
        );
      },
    },
    {
      text: "TYPE",
      dataField: "kind",
      formatter: (cell: any) => {
        return <p className="">{cell}</p>;
      },
    },
    {
      text: "UPLOAD TIME",
      dataField: "created_at",
      formatter: (cell: any) => {
        return (
          <p className="">{moment(cell).format("DD MMMM, YYYY - h:mm:ss a")}</p>
        );
      },
    },
  ];

  return (
    <div className="rounded-lg bg-white p-6 text-sm text-accent_soft_black">
      {/* Header */}

      <div className="mb-2 flex items-center justify-between">
        <h2 className="mb-4 flex w-fit items-center text-xl font-bold">
          Documents
        </h2>
      </div>

      <div
        className={`${
          isUpload ? "scale-[1] opacity-100" : "scale-[0] opacity-0"
        } fixed left-0 top-0 z-50 flex h-screen w-full items-center justify-center bg-[#0000002a] transition-all duration-300`}
      >
        <div className="w-[90%] rounded-lg bg-[#ffffff] p-2 lg:w-[40%]">
          <div className="mb-2 flex w-full items-end justify-end">
            <RxCross1
              className="cursor-pointer rounded-full p-2 text-[2.5rem] transition-all duration-300 hover:bg-[#e7e7e7]"
              onClick={() => setIsUpload(false)}
            />
          </div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-full rounded-lg bg-white p-8">
                <h3 className="mb-4 text-lg font-semibold">Uploading...</h3>

                {/* Progress Bar */}
                <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                {/* Progress Percentage */}
                <div className="mt-2 text-center text-sm text-gray-600">
                  {uploadProgress}% Complete
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center rounded-md"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <h1 className="mb-2 text-base text-accent_soft_black">
                Upload your Documents
              </h1>
              <div className="flex w-full flex-col items-center justify-center rounded-md border border-dashed border-[#3B9DF8] bg-white py-6 dark:border-slate-700 dark:bg-slate-900 md:w-[90%]">
                <IoMdCloudUpload className="text-[3rem] text-primary" />
                <p className="text-text mt-2 dark:text-[#abc2d3]">
                  Drag and drop here
                </p>
                <p className="text-text dark:text-[#abc2d3]">or</p>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="file-upload"
                    className="px-6 py-1.5 text-[#3B9DF8]"
                  >
                    Browse files
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    // multiple
                    className="left-0 top-0 hidden h-full w-full cursor-pointer opacity-0"
                    onChange={handleFileChange}
                    // onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  />
                </div>
              </div>

              <div className="mt-2 flex flex-col items-center justify-center rounded-lg">
                <p className="text-xs font-light text-gray-700">
                  {file?.name
                    ? ` Selected file: ${file.name}`
                    : "No file selected"}
                </p>
                <Button
                  className="my-2 max-w-32 border py-2 text-sm font-light hover:bg-gray-100 disabled:bg-gray-500"
                  onClick={() => handlePostFile()}
                >
                  Upload
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-end">
        {/* <W4Form Employee={employee} /> */}
        <Button
          onClick={() => setIsUpload(true)}
          className="flex items-center justify-center gap-2 border border-accent_soft_black px-12 font-normal transition-all hover:bg-accent_soft_black hover:text-white"
        >
          <PiUploadBold className="text-xl" />
          Upload
        </Button>
      </div>

      <DocumentationTable
        Employee={employee}
        headerShown={false}
        isCheckbox={false}
        isScreen={false}
        data={data}
        columns={columns}
        loading={isPending}
        refetch={refetch}
        setParams={setQueryParams}
        params={params}
        ActionFormatter={(row: any) => (
          <>
            <Link target="_blank" href={row?.file}>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
              >
                <DownloadIcon className="size-4" />
              </Button>
            </Link>
            {!view && (
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                onClick={() => removeFile(row?.uid)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            )}
          </>
        )}
      />
    </div>
  );
};

export default Documentation;
