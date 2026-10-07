import Modal from "@/app/(admin)/_components/Modal";
import {
  fetchTimeSlot,
  fetchTimeSlots,
  patchTimeSlots,
} from "@/app/helpers/backend";
import Button from "@/components/ui/RawButton";
import React, { FormEvent, useEffect, useState } from "react";
import DotSpinner from "../../employee/employees/_components/dot-spinner";

const EditTimeSlot = ({
  refetch,
  uid,
  tUID,
  isOpen,
  setIsOpen,
}: {
  uid: string;
  tUID: string;
  isOpen: any;
  setIsOpen: any;
  refetch: any;
}) => {
  const [data, setData] = useState({
    remark: "",
  });
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsPending(true);
      const res = await patchTimeSlots(uid, tUID, data);
      if (res?.success) {
        refetch();
        setIsOpen(false);
        // console.log(res.data);
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    console.log("top");
    if (uid && tUID) {
      console.log("hello");
      const fn = async () => {
        try {
          setIsLoading(true);
          const res = await fetchTimeSlot(uid, tUID);
          console.log(res);
          if (res) {
            setData({
              remark: res?.remark || "",
            });
          }
        } catch (error) {
          //err
        } finally {
          setIsLoading(false);
        }
      };
      fn();
    }
  }, [uid, tUID]);

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Time Slot"
        widthClass="w-full md:w-[500px]"
        edit={false}
      >
        {isLoading ? (
          <DotSpinner />
        ) : (
          <form className="font-inter space-y-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">Remark</label>
              <input
                value={data?.remark}
                onChange={(e) =>
                  setData({
                    ...data,
                    remark: e.target.value,
                  })
                }
                required
                className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>

            <div className="flex w-full justify-center gap-4 bg-white px-7 py-4">
              <Button
                type="button"
                className="rounded border border-accent_soft_black px-12 py-2 text-accent_soft_black transition-all hover:bg-accent_soft_black hover:text-white"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                isLoading={isPending}
                disabled={isPending}
                className="rounded bg-accent_soft_black px-12 py-2 text-white"
              >
                Save
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default EditTimeSlot;
