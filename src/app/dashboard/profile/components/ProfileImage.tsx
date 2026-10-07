import { useAppSelector } from "@/app/redux/store";
import Button from "@/components/ui/RawButton";
import GetToken from "@/hooks/getToken";
import {
  PatchMultipart,
  PostMultipart,
  UploadMultipart,
} from "@/services/FetchMethods";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { MdOutlineFileUpload } from "react-icons/md";
import { toast } from "react-toastify";

const ProfileImage = ({ User }: any) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [file, setFile] = useState<any>();
  const token = GetToken();
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFile(files[0]);
    }
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setImageSrc(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const { data: UserData, isPending, refetch } = User;

  useEffect(() => {
    if (UserData) {
      setImageSrc(UserData?.image?.original || UserData?.logo?.original);
    }
  }, [UserData]);

  const {
    mutate: Upload,
    isPending: isUploading,
    isError,
    error,
  } = useMutation({
    mutationKey: ["update_profile_image"],
    mutationFn: async (data: any) => PatchMultipart(`me`, data, token),
    onSuccess: (res) => {
      toast.success("Profile Image Updated!");
      setFile("");
      refetch();
    },
    onError: (res) => {
      // toast.error("An Unknown Error Occurred!");
    },
  });

  const handleSave = () => {
    const data = new FormData();
    if (file?.size > 900 * 1024) {
      return toast.warn("Image Size can't be larger than 900KB");
    }
    data.append("image", file);
    Upload(data);
  };

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

  return (
    <>
      <h2 className="mt-4 text-2xl font-semibold text-accent_text_black">
        User Profile
      </h2>
      <div className="mt-6 flex items-center gap-4">
        <div className="relative mt-2 flex items-center gap-1 rounded-lg">
          {imageSrc ? (
            <Image
              src={imageSrc}
              width={1400}
              height={1400}
              alt="avatar"
              className="h-28 w-28 rounded-lg border-2 object-top bg-white border-accent_soft_blue object-cover"
              priority
              blurDataURL={
                UserData?.image?.original || UserData?.logo?.original || imageSrc
              }
              placeholder="blur"
            />
          ) : (
            <div className="bg-gray-200 h-28 w-28 rounded-lg border-2 flex items-center justify-center border-accent_soft_blue">
              <label htmlFor="picture-upload" className="text-black hover:bg-white px-1 rounded-md cursor-pointer transition-all duration-500">
                Upload
              </label>
            </div>
          )}
          <input
            id="picture-upload"
            type="file"
            accept="image/*"
            className="hidden overflow-hidden"
            onChange={handleImageChange}
          />
          <label htmlFor="picture-upload">
            <MdOutlineFileUpload className="absolute -right-4 bottom-0 cursor-pointer rounded-full bg-white p-1 text-3xl text-[#5A607F] shadow" />{" "}
          </label>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-accent_text_charcoal">
            {UserData?.name}
          </h2>
          <p className="text-sm font-normal text-accent_text_gray">
            {UserData?.email}
          </p>
          <p className="text-sm font-normal text-accent_text_gray">
            {UserData?.designation?.title} {UserData?.company?.name}
          </p>
        </div>
        {file?.name && (
          <div className="mt-2 flex flex-col gap-4">
            <Button
              isLoading={isUploading}
              onClick={handleSave}
              className="flex min-w-36 items-center justify-center rounded-lg bg-accent_dark_blue px-3 py-2 text-white"
            >
              {isUploading ? "Uploading..." : "Save"}
            </Button>
            <Button
              onClick={() => {
                setFile("");
                setImageSrc(
                  UserData?.image?.original || UserData?.logo?.original,
                );
              }}
              className="min-w-36 rounded-lg border border-accent_soft_blue px-3 py-2 text-accent_soft_blue"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileImage;
