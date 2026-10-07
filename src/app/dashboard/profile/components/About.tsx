import Button from "@/components/ui/RawButton";
import GetToken from "@/hooks/getToken";
import { toast } from "@/lib/ToastService";
import { Patch } from "@/services/FetchMethods";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";

const About = ({ User }: { User: any }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState({ description: "" });
  const { data: UserData, isPending, refetch } = User;
  const token = GetToken();
  useEffect(() => {
    if (UserData) {
      setData({ description: UserData.description });
    }
  }, [UserData, isEdit]);

  const {
    mutate: Update,
    isPending: isUpdating,
    isError,
    error,
  } = useMutation({
    mutationKey: ["update_profile_image"],
    mutationFn: async (data: any) => Patch(`me`, data, token),
    onSuccess: (res) => {
      toast.success("About info updated.");
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
        <h3 className="text-lg font-semibold text-[#333752]">About</h3>{" "}
        {!isEdit && (
          <Button onClick={() => setIsEdit(true)} className="p-1">
            <FiEdit className="text-xl text-[#5A607F]" />
          </Button>
        )}
      </div>

      {isEdit ? (
        <>
          {" "}
          <div>
            <textarea
              value={data.description}
              onChange={(e) => setData({ description: e.target.value })}
              className={`h-32 rounded-md p-2 outline-none ${isEdit && "border"} w-full resize-none`}
              readOnly={!isEdit}
            />
          </div>
          <div className="mt-2 flex items-center gap-4">
            <Button
              isLoading={isUpdating}
              onClick={handleSave}
              className="flex min-w-36 items-center justify-center py-2.5 rounded-lg bg-accent_soft_black text-white"
            >
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={() => setIsEdit(false)}
              className="min-w-36 rounded-lg border py-2.5 border-accent_soft_black text-accent_soft_black"
            >
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <div>
          <p>{data?.description}</p>
        </div>
      )}
    </div>
  );
};

export default About;
