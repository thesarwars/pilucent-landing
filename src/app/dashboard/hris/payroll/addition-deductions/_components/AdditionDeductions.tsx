import Modal from "@/app/(admin)/_components/Modal";
import {
  fetchSalaryAdditionDeduction,
  patchSalaryAdditionDeduction,
  postSalaryAdditionDeduction,
} from "@/app/helpers/backend";
import LogoLoader from "@/components/MainLoader/logo-loader";
import Button from "@/components/ui/RawButton";
import EmployeeSelectDropdown from "@/components/ui/ScrollSelectDropDowns/EmployeeSelectDropdown";
import { toast } from "@/lib/ToastService";
import React, { useEffect, useState } from "react";

const AdditionDeductions = ({
  setIsOpen,
  isOpen,
  uid,
  refetch,
}: {
  setIsOpen: any;
  isOpen: boolean;
  uid?: string;
  refetch?: any;
}) => {
  const [data, setData] = useState<any>({
    title: "",
    status: "ACTIVE",
    kind: "",
    join_date: "",
    input_date: "",
    amount: "",
    employee_uid: "",
    remark: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!uid) {
      handleReset();
    }
  }, [uid]);

  useEffect(() => {
    if (uid) {
      const fn = async () => {
        try {
          setIsLoading(true);
          const res = await fetchSalaryAdditionDeduction(uid);
          if (res) {
            setData({
              ...res,
              employee_uid: res?.employee,
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
  }, [uid]);

  const handleReset = () => {
    setData({
      title: "",
      status: "ACTIVE",
      kind: "",
      join_date: "",
      input_date: "",
      amount: "",
      employee_uid: "",
      remark: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsPending(true);
      if (uid) {
        const res = await patchSalaryAdditionDeduction(uid, {
          ...data,
          employee_uid: data?.employee_uid?.uid,
          employee: ''
        });
        if (res?.success) {
          toast.success("Addition/Deduction updated.");
          refetch && refetch();
          handleReset();
          setIsOpen(false);
        }
      } else {
        const res = await postSalaryAdditionDeduction({
          ...data,
          employee_uid: data?.employee_uid?.uid,
        });
        if (res?.success) {
          toast.success("Addiction/Deduction added.");
          refetch && refetch();
          handleReset();
          setIsOpen(false);
        }
      }
    } catch (error: any) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Modal
        title={uid ? "Edit Addition/Deduction" : "Add Addition/Deduction"}
        isOpen={isOpen}
        widthClass="w-full md:w-[500px]"
        onClose={()=>setIsOpen(false)}
      >
        {isLoading ? (
          <div className="flex h-[80vh] items-center justify-center">
            <LogoLoader size={100} color={"#16151c"} />
          </div>
        ) : (
          <form className="space-y-4 text-sm" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">Title</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) =>
                  setData({
                    ...data,
                    title: e.target.value,
                  })
                }
                required
                className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">Type</label>
              <select
                value={data.kind}
                onChange={(e) =>
                  setData({
                    ...data,
                    kind: e.target.value,
                  })
                }
                required
                className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              >
                <option value="">Select Type</option>
                <option value="ADDITION">Addition</option>
                <option value="DEDUCTION">Deduction</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">Amount</label>
              <input
                type="number"
                value={data.amount}
                onChange={(e) =>
                  setData({
                    ...data,
                    amount: e.target.value,
                  })
                }
                required
                className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">Input Date</label>
              <input
                type="date"
                value={data.input_date}
                onChange={(e) =>
                  setData({
                    ...data,
                    input_date: e.target.value,
                  })
                }
                required
                className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">Join Date</label>
              <input
                type="date"
                value={data.join_date}
                onChange={(e) =>
                  setData({
                    ...data,
                    join_date: e.target.value,
                  })
                }
                required
                className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">Select Employee</label>
              <EmployeeSelectDropdown
                value={data.employee_uid}
                setValue={(value: any) =>
                  setData({ ...data, employee_uid: value })
                }
                ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-accent_soft_black">Remarks</label>
              <input
                type="text"
                value={data.remark}
                onChange={(e) =>
                  setData({
                    ...data,
                    remark: e.target.value,
                  })
                }
                required
                className="mb-7 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
              />
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                className="flex w-[142px] cursor-pointer items-center justify-center rounded-lg border border-black py-2.5 text-center font-semibold text-black"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="w-[142px] bg-black py-2.5 text-white"
                type="submit"
                isLoading={isPending}
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default AdditionDeductions;
