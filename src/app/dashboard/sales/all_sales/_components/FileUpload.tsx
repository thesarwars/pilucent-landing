import Button from '@/components/ui/RawButton';
import GetToken from '@/hooks/getToken';
import { DeleteData, GetData } from '@/services/FetchMethods';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RxCross1 } from 'react-icons/rx';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

interface FileUploadProps {
  view?: boolean;
  onFilesChange: (files: File[]) => void;
  preview?: any;
  fileList?: any;
  setFileList?: any;
  apiEndpoint?: any;
  onLinkedFilesChange: (files: any) => void;
  isMultiple?: boolean;
  files?: any;
}

const FileUpload: React.FC<FileUploadProps> = ({
  view = false,
  onFilesChange,
  preview,
  fileList = [],
  setFileList,
  apiEndpoint,
  onLinkedFilesChange,
  isMultiple = true,
  files,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [linkedFiles, setLinkedFiles] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [AttachmentList, setAttachmentList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const token = GetToken();
  const [page, setPage] = useState(1);
  const { data, isPending } = useQuery({
    queryKey: ['attachment_list', page],
    queryFn: async () => {
      const response = await GetData(`we/attachments?page=${page}`, token);
      if (response.next == null) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      if (!response?.detail) {
        setAttachmentList((prev: any) => [...prev, ...response.results]);
      }
      setIsLoading(false);

      return response;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (files?.length) {
      setUploadedFiles(files);
    }
  }, [files]);

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files);
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    onFilesChange([...uploadedFiles, ...newFiles]);
  };

  const handleRemoveFile = (fileName: string) => {
    const filteredFiles = uploadedFiles.filter((file) => file.name !== fileName);
    setUploadedFiles(filteredFiles);
    onFilesChange(filteredFiles);
  };
  const handleRemoveLinkedFile = (uid: string) => {
    const filteredFiles = linkedFiles.filter((file) => file.uid !== uid);
    setLinkedFiles(filteredFiles);
    onLinkedFilesChange(filteredFiles);
  };

  const handleRemoveFileList = (uid: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6A6EF6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          const result = await DeleteData(`${apiEndpoint}/${uid}`, token);
          if (result.success) {
            const filteredFiles = fileList?.filter((file: any) => file?.uid !== uid);
            if (setFileList) setFileList(filteredFiles);
            return result;
          }
          throw new Error('Failed to delete');
        } catch (error) {
          Swal.showValidationMessage(`Request failed: ${error}`);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Attachment has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  useEffect(() => {
    if (isMounted) {
      const modal_container = document.querySelector('.modal_container3244');
      if (modal_container?.classList.contains('invisible')) {
        modal_container?.classList.remove('invisible');
      } else {
        setTimeout(() => {
          modal_container?.classList.add('invisible');
        }, 400);
      }
    } else {
      setIsMounted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  const handleAddClick = (attachments: any) => {
    if (linkedFiles.some((file) => file.uid === attachments.uid))
      return toast.error('File already added');
    setLinkedFiles([...linkedFiles, attachments]);
    onLinkedFilesChange([...linkedFiles, attachments]);
    setShowModal(false);
  };

  return (
    <div
      style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
      className="rounded-xl border-2 bg-white/60 p-3 max-md:mb-4"
    >
      <h1 className="mb-2 font-semibold text-[#414042]">
        {!preview && "Upload your"} Documents
      </h1>
      {!preview ? (
        <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 md:flex-row">
          <div
            className="relative flex cursor-pointer flex-col items-center rounded-md border border-dashed p-4"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <p className="text-gray-500">Click to browse or drag and drop your files or </p>
            <div className="flex items-center gap-2">
              {!view && (
                <label
                  htmlFor="file-upload"
                  className="mt-2 cursor-pointer rounded-md border border-gray-500 px-4 py-2 text-gray-500"
                >
                  Browse files
                </label>
              )}
              <input
                id="file-upload"
                type="file"
                multiple={isMultiple}
                accept="image/*, .xlsx, .xls, .doc, .docx, .pdf"
                className="left-0 top-0 hidden h-full w-full cursor-pointer opacity-0"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <p className="mt-2 text-gray-500">
                {Number(uploadedFiles?.length) ||
                  0 + Number(linkedFiles?.length) ||
                  0 + Number(fileList?.length) ||
                  0}
                {'  '}Files
              </p>
            </div>
          </div>

          {/* File List */}
          <div>
            <div className="mt-4 min-w-[160px] space-y-2">
              {uploadedFiles?.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-2"
                >
                  <span className="text-sm">{file.name.slice(0, 14)}...</span>
                  {!view && (
                    <button onClick={() => handleRemoveFile(file.name)}>
                      <RxCross1 className="text-lg text-red-500 hover:text-red-700" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {linkedFiles.length ? (
              <div className="mt-1 min-w-[160px] space-y-1">
                {linkedFiles.map((file: any, index: any) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 p-2"
                  >
                    <p className="text-sm">{file?.title.slice(0, 14)}...</p>
                    {!view && (
                      <button
                        onClick={() => handleRemoveLinkedFile(file.uid)}
                        className="text-red-500"
                      >
                        <RxCross1 className="text-lg text-red-500 hover:text-red-700" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              ''
            )}

            <div className="space-y-1">
              {fileList?.length && fileList
                ? fileList?.map((file: any, index: any) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-1 rounded-md border border-gray-300 bg-gray-50 p-2"
                    >
                      {' '}
                      <p>{file?.title?.slice(0, 24)}..</p>{' '}
                      {!view && (
                        <button
                          onClick={() => apiEndpoint && handleRemoveFileList(file?.uid)}
                          className="text-red-500"
                        >
                          <RxCross1 className="rounded-full p-1 text-[26px] text-red-500 hover:bg-gray-100 hover:text-red-700" />
                        </button>
                      )}
                    </div>
                  ))
                : ''}
            </div>
          </div>
        </div>
      ) : (
        ''
      )}

      {!view && (
        <div
          onClick={() => setShowModal(true)}
          className="mt-2 cursor-pointer text-blue-600 hover:underline"
        >
          Show existing
        </div>
      )}

      <div
        className={`modal_container3244 invisible absolute bottom-0 left-0 right-0 top-0 z-[999] flex h-screen w-screen justify-end overflow-hidden bg-black bg-opacity-40 font-lexend transition duration-500`}
      >
        <div
          className={`${showModal ? 'translate-x-0' : 'translate-x-[550px]'} fixed right-0 top-0 z-50 h-screen w-full overflow-y-auto bg-white p-6 font-lexend transition duration-500 md:w-[550px]`}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#131523]">Attachments</h2>

            <div className="flex items-center gap-5">
              <button
                className="p-1 text-lg"
                onClick={() => {
                  setShowModal(false);
                }}
              >
                <RxCross1 className="text-2xl text-black" />
              </button>
            </div>
          </div>
          <div className="font-lexend">
            {isLoading ? (
              <div className="flex h-[50vh] items-center justify-center">
                <p className="inline-block h-20 w-20 animate-spin rounded-full border-[3px] border-gray-100 border-t-[#6A6EF6]" />{' '}
              </div>
            ) : (
              <div className="overflow-y-auto">
                {AttachmentList.length != 0 &&
                  AttachmentList?.map((attachment: any) => (
                    <div
                      className="mb-2 rounded-xl border border-[#D7DBEC] bg-[#F5F6FA] p-2"
                      key={attachment.uid}
                    >
                      <div className="flex items-center justify-between">
                        <h1 className="mb-1 font-semibold text-[#131523]">{attachment?.title}</h1>
                      </div>
                      <p className="mb-1 text-sm text-[#7E84A3]">
                        {moment(attachment.created_at).format('DD MMM YYYY')}
                      </p>
                      <p className="font-semibold text-[#131523]">{attachment.kind}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <Button
                          className="p-1 font-semibold text-[#6A6EF6]"
                          onClick={() => handleAddClick(attachment)}
                        >
                          Add
                        </Button>
                        <a
                          href={attachment?.file}
                          download
                          target="_blank"
                          className="p-1 font-semibold text-[#00035F]"
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                {hasMore ? (
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setPage(page + 1)}
                      className="p-1 text-center text-lg font-medium text-accent_soft_blue"
                    >
                      {isPending ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                ) : (
                  AttachmentList.length > 0 && (
                    <Button className="p-1 text-center text-lg text-accent_dark_blue">
                      No More Data
                    </Button>
                  )
                )}
              </div>
            )}
            {!isLoading && !AttachmentList.length && (
              <div className="flex h-[50vh] items-center justify-center">
                <h1 className="text-center text-2xl text-accent_dark_blue">No Attachment Found</h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
