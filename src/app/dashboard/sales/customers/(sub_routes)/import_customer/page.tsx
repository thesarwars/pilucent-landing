'use client';
import CustomerImport from '@/app/dashboard/sales/customers/_components/CustomerImport';
import CustomerImportSteps from '@/components/CustomerImportSteps/CustomerImportSteps';
import { UploadMultipart } from '@/services/FetchMethods';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import VerifyCustomer from '../../_components/VerifyCustomer';
import ImportSuccess from '@/components/ImportSuccess/ImportSuccess';
import { toast } from '@/lib/ToastService';
import { uploadCustomerFile } from '@/app/helpers/backend';

const Page = () => {
  const [steps, setSteps] = useState<number>(1);
  const [dataList, setDataList] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    mutate: UploadExcel,
    isPending: isUploading,
    isError,
    error,
  } = useMutation({
    mutationFn: async (data: any) => {
      const res = await UploadMultipart('we/customers/bulk-create', data, '');
      return res;
    },
    onSuccess: (res) => {
      console.log(res);
      setSteps(3);
    },
    onError: (res) => {
      console.log(res.message);
    },
  });

  useEffect(() => {
    if (isError) {
      try {
        const errors = JSON.parse(error.message);
        Object.keys(errors)?.forEach((key) => {
          const errorMessages = errors[key];
          errorMessages?.forEach((message: string) => {
            toast.error(`${key.split('_').join(' ').toUpperCase()} :- ${message}`);
          });
        });
      } catch (err) {
        toast.error('Something Went Wrong');
      }
    }
  }, [error, isError]);

  const Upload = async (file: any) => {
    try {
      setIsLoading(true);
      if (file?.size > 500 * 1024 * 1024) return toast.info('Max upload size is 500 MB');
      const formData = new FormData();
      if (selectedFile) formData.append('customer_file', selectedFile);

      const result = await uploadCustomerFile(formData, {
        timeout: 600000,
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        },
      });
      if (result?.success) {
        setSteps(3);
      }
    } catch (error) {
      // console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-30">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-accent_soft_black">Processing...</h3>
          </div>
        </div>
      )}
      <CustomerImportSteps currentStep={steps} />
      {steps === 1 ? (
        <CustomerImport setData={setDataList} setStep={setSteps} setFile={setSelectedFile} />
      ) : steps === 2 ? (
        <VerifyCustomer
          Data={dataList}
          setSteps={setSteps}
          Upload={Upload}
          isPending={isUploading}
        />
      ) : (
        <ImportSuccess Redirect="/dashboard/sales/customers" btnText="Go to Customer" />
      )}
    </>
  );
};

export default Page;
