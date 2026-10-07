import {
  fetchAttendance,
  patchAttendance,
  postAttendance,
} from "@/app/helpers/backend";
import Button from "@/components/ui/RawButton";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import EmployeeSelectDropdown from "@/components/ui/ScrollSelectDropDowns/EmployeeSelectDropdown";
import { toast } from "@/lib/ToastService";
import React, { FormEvent, useEffect, useState } from "react";
import DotSpinner from "../../../employee/employees/_components/dot-spinner";
import moment from "moment";

const AttendanceUpdate = ({
  setIsOpen,
  uid,
  refetch,
}: {
  setIsOpen: any;
  uid?: any;
  refetch?: any;
}) => {
  const [data, setData] = useState({
    date: "",
    employee_uid: "" as any,
    check_in: "" as any,
    check_out: "",
    status: "",
  });
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsPending(true);
      if (uid) {
        const res = await patchAttendance(uid, {
          check_in: data.check_in,
          check_out: data.check_out,
          status: data.status,
        });
        if (res?.success) {
          toast.success("Attendance updated.");
          refetch && refetch();
          setIsOpen(false);
        }
      } else {
        const res = await postAttendance({
          ...data,
          employee_uid: data?.employee_uid?.uid,
        });
        if (res?.success) {
          handleReset();
          toast.success("Attendance added.");
          refetch && refetch();
          setIsOpen(false);
        }
      }
    } catch (error) {
      //err
    } finally {
      setIsPending(false);
    }
  };

  const handleReset = () => {
    setData({
      date: "",
      employee_uid: "" as any,
      check_in: "",
      check_out: "",
      status: "",
    });
  };

  useEffect(() => {
    if (uid) {
      const fn = async () => {
        try {
          setIsLoading(true);
          const res = await fetchAttendance(uid);
          if (res) {
            setData({
              ...data,
              check_in: moment(res?.check_in, "HH:mm:ss").format("HH:mm:ss"),
              check_out: res?.check_out,
              status: res?.status,
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

  console.log(data);

  useEffect(() => {
    if (!uid) {
      handleReset();
    }
  }, [uid]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <DotSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="font-inter space-y-4 text-sm">
      {!uid && (
        <div className="flex flex-col gap-2">
          <label className="text-accent_soft_black">Employee</label>
          <EmployeeSelectDropdown
            value={data.employee_uid}
            setValue={(value: any) => setData({ ...data, employee_uid: value })}
            ClassName="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
          />
        </div>
      )}
      <div className="flex gap-x-4">
        {!uid && (
          <div className="flex w-full flex-col gap-2">
            <label className="text-accent_soft_black">Date</label>
            <input
              required
              type="date"
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
              className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
            />
          </div>
        )}
        <div className="flex w-full flex-col gap-2">
          <label className="text-accent_soft_black">Status</label>
          <select
            required
            value={data.status}
            onChange={(e) => setData({ ...data, status: e.target.value })}
            className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
          >
            <option value={""}>Select</option>
            <option value={"PRESENT"}>Present</option>
            <option value={"EARLY_DEPARTURE"}>Early Departure</option>
            <option value={"LATE_ARRIVAL"}>Late Approval</option>
            <option value={"LEAVE"}>Leave</option>
            <option value={"ABSENT"}>Absent</option>
          </select>
        </div>
      </div>
      <div className="flex items-start gap-x-4">
        <div className="flex w-full flex-col gap-2">
          <label className="text-accent_soft_black">Check In</label>
          <input
            required
            type="time"
            value={data.check_in}
            onChange={(e) => setData({ ...data, check_in: e.target.value })}
            className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
          />
        </div>
        <div className="flex w-full flex-col gap-2">
          <label className="text-accent_soft_black">Check Out</label>
          <input
            required
            type="time"
            value={data.check_out}
            onChange={(e) => setData({ ...data, check_out: e.target.value })}
            className="rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-accent_soft_black"
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-10">
        <Button
          type="button"
          onClick={() => setIsOpen(false)}
          className="w-[142px] cursor-pointer rounded-lg border border-accent_soft_black py-2.5 text-center font-semibold text-accent_soft_black"
        >
          Cancel
        </Button>
        <Button
          isLoading={isPending}
          disabled={isPending}
          className="w-[142px] bg-accent_soft_black py-2.5 text-white"
        >
          Save
        </Button>
      </div>
    </form>
  );
};

export default AttendanceUpdate;
