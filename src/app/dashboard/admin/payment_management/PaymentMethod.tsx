"use client";
import React, { useState, useEffect, FormEvent } from "react";
import Checkbox from "@/components/ui/Checkbox/Checkbox";
import Label from "@/components/ui/RawLabel";
import {
  fetchPaymentMethod,
  patchPaymentMethod,
  postPaymentMethods,
} from "@/app/helpers/backend";
import { toast } from "@/lib/ToastService";

interface PopupMessageProps {
  setIsOpen: any;
  onSuccess?: any;
  refetch?: any;
  uid?: string; // Add initialData prop
}

const PaymentMethod: React.FC<PopupMessageProps> = ({
  setIsOpen,
  onSuccess,
  refetch,
  uid, // Add initialData prop
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    title: "",
    status: "ACTIVE",
  });

  // Add useEffect to update title when initialData changes
  useEffect(() => {
    if (uid) {
      const fn = async () => {
        try {
          const res = await fetchPaymentMethod(uid);
          if (res?.uid) {
            setData({ ...data, title: res?.title });
          }
        } catch (error) {
          toast.error("Couldn't get data!");
        }
      };
      fn();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const handleSubmit = async (e: FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    e.stopPropagation();
    try {
      if (uid) {
        const result = await patchPaymentMethod(uid, data);
        if (result.success) {
          toast.success("Payment method updated");
          setIsOpen(false);
          refetch && refetch();
        }
      } else {
        const result = await postPaymentMethods(data);
        if (result.success) {
          setData({ title: "", status: "ACTIVE" });
          toast.success("Pay method created.");
          setIsOpen(false);
          refetch && refetch();
          onSuccess && onSuccess(result);
        }
      }
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setData({
      title: "",
      status: "ACTIVE",
    });
  }, [uid]);

  return (
    <form onSubmit={handleSubmit}>
      <Label className="mb-2 mt-6 block text-accent_text_gray">Name</Label>
      <input
        className="w-full rounded-lg border border-accent_text_slate px-2 py-3 outline-none"
        placeholder="Active"
        type="text"
        name="title"
        value={data.title}
        onChange={(e) => setData({ ...data, title: e.target.value })}
        required
      />
      <div className="mt-6 flex items-center gap-[10px]">
        <div>
          <Checkbox labelText="This is a credit or debit card" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 pt-[48px]">
        <div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg border border-accent_soft_blue bg-white px-[43.5px] py-3 text-sm font-semibold leading-[21px] text-accent_soft_blue"
          >
            Cancel
          </button>
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-accent_bg_blue px-[43.5px] py-3 text-sm font-semibold leading-[21px] text-white"
          >
            {isLoading ? "Creating..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PaymentMethod;
