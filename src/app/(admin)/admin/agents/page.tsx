"use client"
import Button from "@/components/ui/RawButton";
import Table from "../../_components/Table";
import { useState } from "react";
import Modal from "../../_components/Modal";

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <Table
        title="List of Agent"
        data={{ results: [], count: 0, next: null, previous: null }}
      >
        <Button
          className="bg-accent_dark_blue text-white"
          onClick={() => setIsOpen(true)}
        >
          Create Agent
        </Button>
      </Table>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Agent"
        widthClass="w-full md:w-[550px]"
      >
        <form onSubmit={(e) => e.preventDefault()} className="text-left space-y-8">
            <div className="mt-3">
              <p className="pb-1 text-[14px] font-medium">Email</p>
              <input
                type="email"
                name="email"
                className="input input-bordered h-[42px] w-full"
                placeholder="email"
              />
            </div>

            <div className="mt-3 flex gap-x-3">
              <input
                type="url"
                name="url"
                className="input input-bordered h-[42px] w-full"
                placeholder="https://www.pinterest.com/"
              />
              <Button className="border-accent_soft_blue border w-[154px] py-1">Copy link</Button>
            </div>

          <div className="mt-4 flex items-center justify-center gap-x-4">
            <Button
              type="button"
              className="flex h-[45px] w-[142px] items-center justify-center rounded-md border border-accent_soft_blue"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex h-[45px] w-[142px] items-center justify-center rounded-md bg-accent_dark_blue text-white"
            >
              Add
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Page;
