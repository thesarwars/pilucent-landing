"use client";
import CustomerImportSteps from "@/components/CustomerImportSteps/CustomerImportSteps";
import GetToken from "@/hooks/getToken";
import { UploadMultipart } from "@/services/FetchMethods";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ImportSuccess from "@/components/ImportSuccess/ImportSuccess";
import { toast } from "react-toastify";
import SupplierImport from "./_components/SupplierImport";
import VerifySupplier from "./_components/VerifySupplier";

const Page = () => {
  const [steps, setSteps] = useState<number>(1);
  const [dataList, setDataList] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const token = GetToken();

  const {
    mutate: UploadExcel,
    isPending: isUploading,
    isError,
    error,
  } = useMutation({
    mutationFn: async (data: any) => {
      const res = await UploadMultipart(
        "we/suppliers/bulk-create",
        data,
        token,
      );
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
            toast.error(
              `${key.split("_").join(" ").toUpperCase()} :- ${message}`,
            );
          });
        });
      } catch (err) {
        toast.error("Something Went Wrong");
      }
    }
  }, [error, isError]);

  const Upload = () => {
    const formData = new FormData();
    if (selectedFile) formData.append("supplier_file", selectedFile);
    UploadExcel(formData);
  };

  return (
    <>
      <CustomerImportSteps currentStep={steps} />
      {steps === 1 ? (
        <SupplierImport
          setData={setDataList}
          setStep={setSteps}
          setFile={setSelectedFile}
        />
      ) : steps === 2 ? (
        <VerifySupplier
          Data={dataList}
          setSteps={setSteps}
          Upload={Upload}
          isPending={isUploading}
        />
      ) : (
        <ImportSuccess
          Redirect="/dashboard/expenses/suppliers"
          btnText="Go To Suppliers"
        />
      )}
    </>
  );
};

export default Page;
