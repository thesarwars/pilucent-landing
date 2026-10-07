import { CloseModal } from "@/components/ModalSM/ModalSM";
import Button from "@/components/ui/RawButton";
import ScrollSelect from "@/components/ui/InfiniteSelect/CustomInfiniteScrollSelect";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import CategoryScrollSelectDropDown from "@/components/ui/ScrollSelectDropDowns/CategoryScrollSelectDropdown";
import GetToken from "@/hooks/getToken";
import { GetData, Post } from "@/services/FetchMethods";
import { useMutation, useQueries } from "@tanstack/react-query";
import React, { FormEvent, useState } from "react";
import { toast } from "react-toastify";
type categoryType = {
  title: string;
  parent_uid: string;
  kind: "PRODUCT";
  status: "ACTIVE";
  description: string;
};

const CreateCategory = ({
  setModalContent,
  setModalTitle,
  setIsRefetch,
  isRefetch,
  setValue,
  setIsOpen,
  onSuccess,
}: {
  setValue?: any;
  onSuccess?: any;
  setIsOpen?: any;
  setModalContent?: any;
  setModalTitle?: any;
  setIsRefetch?: any;
  isRefetch?: any;
}) => {
  const token = GetToken();
  const [categoryData, setCategoryData] = useState<categoryType>({
    title: "",
    parent_uid: "",
    kind: "PRODUCT",
    status: "ACTIVE",
    description: "",
  });
  const [parentCategoryUID, setParentCategoryUID] = useState<any>(null);

  const {
    mutate: CreateCategory,
    isPending: isCatCreating,
    // error,
    // isError,
    // data,
  } = useMutation({
    mutationFn: async (data: any) => {
      const res = await Post(`we/categories`, { body: data, token });
      return res;
    },
    onSuccess: (res) => {
      toast.success("Category Added Successfully");
      setValue && setValue(res);
      setIsOpen && setIsOpen(false);
      onSuccess && onSuccess();
      setCategoryData({
        title: "",
        parent_uid: "",
        kind: "PRODUCT",
        status: "ACTIVE",
        description: "",
      });
      setParentCategoryUID(null);
      setIsRefetch && setIsRefetch(!isRefetch);
      //   CloseModal();
      setModalContent && setModalContent("categories");
      setModalTitle && setModalTitle("Category List");
    },
    onError: (res) => {
      // console.log(res);
      toast.error("Something went wrong!");
    },
  });

  const handleCreateCategory = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation()
    const data = {
      title: categoryData.title,
      kind: categoryData.kind,
      description: categoryData.description,
      status: categoryData.status,
      ...(parentCategoryUID?.uid && { parent_uid: parentCategoryUID.uid }),
    };

    CreateCategory(data);
  };

  //   console.log(categoryData);

  return (
    <div className="mt-4">
      <form
        onSubmit={handleCreateCategory}
        className="flex flex-col gap-4 rounded-md bg-[#F5F6FA] p-6"
      >
        <div>
          <Label className="block font-medium text-[#5A607F]">Name *</Label>
          <Input
            value={categoryData.title}
            onChange={(e) =>
              setCategoryData((prev) => ({
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
            value={categoryData.description}
            onChange={(e) =>
              setCategoryData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder=""
            className="mt-2 h-12 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
            type="text"
          />
        </div>

        <div className="flex-1">
          <Label className="block font-medium text-[#5A607F]">
            Parent Category
          </Label>
          <CategoryScrollSelectDropDown
            isAddNew={false}
            value={parentCategoryUID}
            setValue={setParentCategoryUID}
            ClassName="mt-2 rounded-lg border border-[#A1A7C4]"
            required={false}
          />
        </div>

        <div className="mt-12 flex justify-center gap-8">
          <Button
            type="button"
            onClick={() => {
              setModalContent && setModalContent("categories");
             setModalTitle &&  setModalTitle("Category List");
             setIsOpen && setIsOpen(false);
            }}
            className="w-36 rounded-md border border-accent_soft_blue bg-transparent px-6 py-3 text-center text-sm font-medium text-accent_soft_blue hover:cursor-pointer"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex w-40 min-w-40 max-w-40 items-center justify-center bg-[#00035F] text-sm font-medium text-white"
            isLoading={isCatCreating}
          >
            {isCatCreating ? "Saving..." : "Save&Close"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCategory;
