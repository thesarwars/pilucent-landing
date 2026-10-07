import Button from "@/components/ui/RawButton";
import Label from "@/components/ui/RawLabel";
import GetToken from "@/hooks/getToken";
import { toast } from "@/lib/ToastService";
import { Patch } from "@/services/FetchMethods";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";

const SignInInfo = ({ User }: { User: any }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState({ phone: "" });
  const { data: UserData, isPending, refetch } = User;

  useEffect(() => {
    if (UserData) {
      setData({
        phone: UserData?.phone,
      });
    }
  }, [UserData, isEdit]);

  const {
    mutate: Update,
    isPending: isUpdating,
    isError,
    error,
  } = useMutation({
    mutationKey: ["update_profile_image"],
    mutationFn: async (data: any) => Patch(`me`, data, ""),
    onSuccess: (res) => {
      toast.success("Sign In Info Updated");
      setIsEdit(false);
      refetch();
    },
    onError: (res) => {
      // toast.error("An Unknown Error Occurred!");
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

  const handleSave = () => {
    Update(data);
  };

  return (
    <div className="mt-4 rounded-lg border border-accent_bg_lavender bg-white p-4 shadow">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm md:text-lg font-semibold text-[#333752]">Sign In Info</h3>{" "}
        {!isEdit && (
          <Button onClick={() => setIsEdit(true)} className="p-1">
            <FiEdit className="text-xl text-[#5A607F]" />
          </Button>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex flex-col md:flex-row max-md:items-start items-center justify-start md:gap-8">
          <Label className="w-20 font-normal text-[#5A607F]">Phone</Label>
          <input
            value={data.phone}
            onChange={(e) =>
              setData((prev) => ({ ...prev, phone: e.target.value }))
            }
            placeholder=""
            className={`mt-2 h-10 self-start rounded-lg md:px-6 py-3 font-normal outline-none ${isEdit ? "border border-[#A1A7C4]" : ""}`}
            type="text"
            required
            readOnly={!isEdit}
          />
        </div>
        <div className="flex flex-col md:flex-row max-md:items-start items-center justify-start md:gap-8">
          <Label className="w-20 font-normal text-[#5A607F]">Email</Label>
          <div className="flex items-center gap-4">
            <input
              value={UserData?.email}
              placeholder=""
              className={`mt-2 h-10 self-start rounded-lg md:px-6 py-3 font-normal outline-none`}
              type="text"
              required
              readOnly
            />
            {UserData?.is_email_verified ? (
              <p className="mt-2 -translate-x-10 text-sm text-accent_soft_blue">
                Verified
              </p>
            ) : (
              <p className="mt-2 -translate-x-10 text-sm text-red-600">
                not verified
              </p>
            )}
          </div>
          {isEdit && <p className="mt-2">can't be changed.</p>}
        </div>
      </div>
      {isEdit && (
        <div className="mt-4 flex items-center gap-4">
          <Button
            isLoading={isUpdating}
            onClick={handleSave}
            className="flex min-w-36 items-center justify-center rounded-lg bg-accent_soft_black py-2.5 text-white"
          >
            {isUpdating ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={() => setIsEdit(false)}
            className="min-w-36 rounded-lg border border-accent_soft_black text-accent_soft_black py-2.5"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default SignInInfo;
