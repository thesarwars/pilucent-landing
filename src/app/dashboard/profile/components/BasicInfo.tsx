import Button from "@/components/ui/RawButton";
import Label from "@/components/ui/RawLabel";
import GetToken from "@/hooks/getToken";
import { toast } from "@/lib/ToastService";
import { Patch } from "@/services/FetchMethods";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";

const BasicInfo = ({User}:{User:any}) => {
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState({ name: "", designation: "" });
  const { data: UserData, isPending, refetch } = User;
  const token = GetToken()
    useEffect(() => {
      if (UserData) {
        setData({ name: UserData.name, designation: UserData?.designation });
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
        toast.success("Basic info updated.");
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
    }

  return (
    <div className="mt-4 rounded-lg border border-accent_bg_lavender bg-white p-4 shadow">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#333752]">Basic Information</h3>{" "}
        {!isEdit && (
          <Button onClick={() => setIsEdit(true)} className="p-1">
            <FiEdit className="text-xl text-[#5A607F]" />
          </Button>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex flex-col md:flex-row max-md:items-start gap-1 md:gap-8 items-center justify-start ">
          <Label className="font-normal w-20  text-[#5A607F]">Full Name</Label>
          <input
            value={data.name}
            onChange={(e) =>
              setData({...data,
                name: e.target.value,
              })
            }
            placeholder=""
            className={`mt-2 h-10  self-start outline-none font-normal rounded-lg  md:px-6 py-3 ${isEdit ? "border border-[#A1A7C4]": ""}`}
            type="text"
            required
            readOnly={!isEdit}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-1 max-md:items-start md:gap-8 items-center justify-start ">
          <Label className="w-20 font-normal text-[#5A607F]">Company</Label>
          <input
            value={UserData?.company?.name}
         
            placeholder=""
            className={`mt-2 h-10  self-start outline-none font-normal rounded-lg  md:px-6 py-3}`}
            type="text"
            required
            readOnly
          />
                  {isEdit && <p>Company can not be changed.</p>}
        </div>
        {/* <div className="flex gap-8 items-center justify-start ">
          <Label className="w-20 font-normal text-[#5A607F]">Job</Label>
          <input
            value={data?.designation}
            onChange={(e) =>
              setData({...data,
                designation: e.target.value,
              })
            }
            className={`mt-2 h-10  self-start outline-none font-normal rounded-lg  px-6 py-3 ${isEdit ? "border border-[#A1A7C4]": ""}`}
            type="text"
            required
            readOnly={!isEdit}
          />
        </div> */}
    
      </div>
      {isEdit && (
        <div className="mt-4 flex items-center gap-4">
          <Button isLoading={isUpdating} onClick={handleSave} className="min-w-36 flex items-center justify-center gap-1 rounded-lg py-2.5 bg-accent_soft_black text-white">
          {isUpdating ? "Saving...": "Save"}
          </Button>
          <Button
            onClick={() => setIsEdit(false)}
            className="min-w-36 rounded-lg border border-accent_soft_black py-2.5 text-accent_soft_black"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default BasicInfo;
