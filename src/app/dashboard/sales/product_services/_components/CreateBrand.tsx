import { CloseModal } from "@/components/ModalSM/ModalSM";
import Button from "@/components/ui/RawButton";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import GetToken from "@/hooks/getToken";
import { Post } from "@/services/FetchMethods";
import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
type brandType = {
  title: string;
  kind: "PRODUCT";
  status: "ACTIVE";
  description: string;
};

const CreateBrand = ({
  setModalContent,
  setModalTitle,
  setIsRefetch,
  isRefetch,
  setValue,
  setIsOpen,
  onSuccess,
}: {
  setModalContent?: any;
  setModalTitle?: any;
  setIsRefetch?: any;
  isRefetch?: any;
  setValue?: any;
  setIsOpen?: any;
  onSuccess?: any;
}) => {
  const token = GetToken();

  const [brandData, setBrandData] = useState<brandType>({
    title: "",
    kind: "PRODUCT",
    status: "ACTIVE",
    description: "",
  });

  const {
    mutate: CreateBrand,
    isPending: isBrandCreating,
    // error,
    // isError,
  } = useMutation({
    mutationFn: async (data: any) => {
      const res = await Post(`we/brands`, { body: data, token });
      return res;
    },
    onSuccess: (res) => {
      toast.success("Brand Added Successfully");
      setValue && setValue(res);
      setIsOpen && setIsOpen(false);
      onSuccess && onSuccess();
      setBrandData({
        title: "",
        kind: "PRODUCT",
        status: "ACTIVE",
        description: "",
      });
      setIsRefetch && setIsRefetch(!isRefetch);
      //   CloseModal();
      setModalContent && setModalContent("brands");
      setModalTitle && setModalTitle("Brand List");
    },
    onError: (res) => {
      // console.log(res);
      toast.error("Something went wrong!");
    },
  });

  const handleAddBrand = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    CreateBrand(brandData);
  };

  return (
    <div className="mt-4">
      <form
        onSubmit={handleAddBrand}
        className="flex flex-col gap-4 rounded-md bg-[#F5F6FA] p-6"
      >
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

        {/* <div className="flex-1">
            <Label className="block font-medium text-[#5A607F]">
              Parent Category
            </Label>
            <Select
              className={`mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 text-black`}
              selectName="Select"
              // options={[
              //   "A Positive",
              //   "A Negative",
              //   "B Positive",
              //   "B Negative",
              //   "O Positive",
              //   "O Negative",
              //   "AB Positive",
              //   "AB Negative",
              // ]}
            />
          </div> */}

        <div className="mt-12 flex justify-center gap-8">
          <Button
            type="button"
            onClick={() => {
              setModalContent && setModalContent("brands");
              setModalTitle && setModalTitle("Brands List");
              setIsOpen && setIsOpen(false);
            }}
            className="w-36 rounded-md border border-accent_soft_blue bg-transparent px-6 py-3 text-center text-sm font-medium text-accent_soft_blue hover:cursor-pointer"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex w-40 min-w-40 max-w-40 items-center justify-center bg-[#00035F] text-sm font-medium text-white"
            isLoading={isBrandCreating}
          >
            {isBrandCreating ? "Saving..." : "Save&Close"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBrand;
