import { useAppSelector } from "@/app/redux/store";
import Button from "@/components/ui/RawButton";
import Label from "@/components/ui/RawLabel";
import GetToken from "@/hooks/getToken";
import { DeleteCookies } from "@/lib/cookies/Cookies";
import { toast } from "@/lib/ToastService";
import { Patch } from "@/services/FetchMethods";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";

const Password = ({ User }: { User: any }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState({ old_password: "", new_password: "" });
  const [isMatched, setIsMatched] = useState<any>(true);
  useEffect(() => {
    setData({ old_password: "", new_password: "" });
    setIsMatched(true);
  }, [isEdit]);

  const onChangeRetypedPass = (e: any) => {
    if (e.target.value === data.new_password) {
      setIsMatched(true);
    } else {
      setIsMatched(false);
    }
  };

  const {
    mutate: Update,
    isPending: isUpdating,
    isError,
    error,
  } = useMutation({
    mutationFn: async (data: any) => Patch(`me/change-password`, data, ''),
    onSuccess: async (res) => {
      toast.success("Password changed.");
      setIsEdit(false);
      await DeleteCookies();
      //  router.push("/auth/signin")
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
        toast.error("Something went wrong!");
      }
    }
  }, [error, isError]);

  const handleChangePassword = (e: any) => {
    e.preventDefault();
    if (isMatched == true) {
      Update(data);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-accent_bg_lavender bg-white p-4 shadow">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#333752]">Password</h3>{" "}
        {!isEdit && (
          <Button onClick={() => setIsEdit(true)} className="p-1">
            <FiEdit className="text-xl text-[#5A607F]" />
          </Button>
        )}
      </div>
      <div className="space-y-1">
        {isEdit ? (
          <form onSubmit={handleChangePassword}>
            <div className="flex flex-col md:flex-row max-md:items-start items-center justify-start md:gap-8">
              <Label className="w-48 font-normal text-[#5A607F]">
                Current Password
              </Label>
              <input
                value={data.old_password}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, old_password: e.target.value }))
                }
                placeholder=""
                className={`mt-2 h-10 self-start rounded-lg md:px-6 py-3 font-normal outline-none ${isEdit ? "border border-[#A1A7C4]" : ""}`}
                type="text"
                required
              />
            </div>
            <div className="flex flex-col md:flex-row max-md:items-start items-center justify-start md:gap-8">
              <Label className="w-48 font-normal text-[#5A607F]">
                New Password
              </Label>
              <input
                value={data.new_password}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, new_password: e.target.value }))
                }
                placeholder=""
                className={`mt-2 h-10 self-start rounded-lg md:px-6 py-3 font-normal outline-none ${isEdit ? "border border-[#A1A7C4]" : ""}`}
                type="text"
                required
              />
            </div>

            <div className="flex flex-col md:flex-row max-md:items-start items-center justify-start md:gap-8">
              <Label className="md:w-48 m font-normal text-[#5A607F]">
                Re-type New Password
              </Label>
              <input
                onChange={onChangeRetypedPass}
                placeholder=""
                className={`mt-2 h-10 self-start rounded-lg border border-[#A1A7C4] md:px-6 py-3 font-normal outline-none ${!isMatched && "border border-red-500"}}`}
                type="text"
                required
              />
              {!isMatched && (
                <p className="mt-2 text-sm text-red-600">
                  Password does not match
                </p>
              )}
            </div>
            <div className="mt-4 flex items-center gap-4">
              <Button
                isLoading={isUpdating}
                className="flex min-w-36 items-center justify-center gap-1 py-2.5 rounded-lg bg-accent_soft_black text-white"
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                onClick={() => setIsEdit(false)}
                className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row max-md:items-start items-center justify-start md:gap-8">
            <Label className="w-48 font-normal text-[#5A607F]">
              Current Password
            </Label>
            <input
              value={"***********"}
              className={`h-10 self-start rounded-lg md:px-6 py-3 font-normal outline-none ${isEdit ? "border border-[#A1A7C4]" : ""}`}
              type="text"
              required
              readOnly
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Password;
