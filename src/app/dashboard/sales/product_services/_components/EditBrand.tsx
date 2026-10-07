import { CloseModal } from "@/components/ModalSM/ModalSM";
import Button from "@/components/ui/RawButton";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import GetToken from "@/hooks/getToken";
import { GetData, Patch, Post } from "@/services/FetchMethods";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
type brandType = {
  title: string;
  description: string;
};

const EditBrand = ({
  setModalContent,
  setModalTitle,
  setIsRefetch,
  isRefetch,
  BrandUID,
}: {
  setModalContent: any;
  setModalTitle: any;
  setIsRefetch: any;
  isRefetch: any;
  BrandUID: string;
}) => {
  const token = GetToken();
  const [brandData, setBrandData] = useState<brandType>({
    title: "",
    description: "",
  });

  const { data: singleBrand, isPending } = useQuery({
    queryKey: ["single_brand", BrandUID],
    queryFn: async () => {
      const response = await GetData(`we/brands/${BrandUID}`, token);
      setBrandData({
        title: response?.title,
        description: response?.description,
      });
      return response;
    },
    enabled: !!BrandUID
    
  });

  const {
    mutate: UpdateBrand,
    isPending: isUpdating,
    // error,
    // isError,
    // data,
  } = useMutation({
    mutationFn: async (data: any) => {
      const res = await Patch(`we/brands/${BrandUID}`, data, token);
      return res;
    },
    onSuccess: (res) => {
      toast.success("Brand Updated Successfully");

      setIsRefetch(!isRefetch);
      //   CloseModal();
      setModalContent("brands");
      setModalTitle("Brand List");
    },
    onError: (res) => {
      // console.log(res);
      toast.error("Something went wrong!");
    },
  });

  const handleUpdateBrand = (e: FormEvent) => {
    e.preventDefault();
    UpdateBrand(brandData);
  };

  return (
    <div className="mt-4">
      <form
        onSubmit={handleUpdateBrand}
        className="flex flex-col gap-4 rounded-md bg-[#F5F6FA] p-6"
      >
        {isPending ? (
          <>
            <div className="mb-4">
              <div className="mb-2 h-4 w-32 animate-pulse rounded-lg bg-gray-300"></div>
              <div className="h-11 w-full animate-pulse rounded-lg bg-gray-300"></div>
            </div>
            <div className="mb-4">
              <div className="mb-2 h-4 w-32 animate-pulse rounded-lg bg-gray-300"></div>
              <div className="h-11 w-full animate-pulse rounded-lg bg-gray-300"></div>
            </div>
            <div className="mb-4 mt-4 flex justify-center gap-4">
              <div className="mb-2 h-11 w-40 animate-pulse rounded-lg bg-gray-300"></div>
              <div className="h-11 w-40 animate-pulse rounded-lg bg-gray-300"></div>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label className="block font-medium text-[#5A607F]">Name *</Label>
              <Input
                value={brandData.title}
                onChange={(e) =>
                  setBrandData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
                required
              />
            </div>

            <div className="">
              <Label className="block font-medium text-[#5A607F]">
                Description
              </Label>
              <Input
                value={brandData.description}
                onChange={(e) =>
                  setBrandData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder=""
                className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                type="text"
              />
            </div>

            <div className="mt-12 flex justify-center gap-8">
              <Button
                type="button"
                onClick={() => {
                  setModalContent("brands");
                  setModalTitle("Brands List");
                }}
                className="w-36 rounded-md border border-accent_soft_blue bg-transparent px-6 py-3 text-center text-sm font-medium text-accent_soft_blue hover:cursor-pointer"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex w-40 min-w-40 max-w-40 items-center justify-center bg-[#00035F] text-sm font-medium text-white"
                isLoading={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default EditBrand;
