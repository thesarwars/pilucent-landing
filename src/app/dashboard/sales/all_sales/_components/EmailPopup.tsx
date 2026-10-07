import Button from "@/components/ui/RawButton";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import { useState } from "react";

const EmailPopup = ({
  view = false,
  emails,
  setEmails,
}: {
  emails: any;
  setEmails: any;
  view?: boolean;
}) => {
  const [isBcOpen, setIsBcOpen] = useState<boolean>(false);
  return (
    <div className="relative flex cursor-pointer justify-end gap-4 text-sm">
      <p
        onClick={() => setIsBcOpen(!isBcOpen)}
        className="cursor-pointer font-medium text-accent_soft_blue"
      >
        Cc/Bcc
      </p>
      {isBcOpen && (
        <div className="absolute top-5 z-10 mx-auto max-w-lg rounded-md border-2 bg-white p-4 shadow-md max-md:left-1 max-md:right-0 md:w-[480px]">
          <div className="mb-4 w-full">
            <Label className="block font-semibold text-accent_soft_black">
              Cc
            </Label>
            <Input
              value={emails.ccEmail}
              onChange={(e) =>
                !view && setEmails({ ...emails, ccEmail: e.target.value })
              }
              placeholder="Email (Separate emails with a comma)"
              className={`mt-2 h-11 w-full rounded-lg border border-accent_soft_black px-6 py-3 placeholder:text-accent_soft_black`}
              type="email"
            />
          </div>
          <div className="w-full">
            <Label className="block font-semibold text-accent_soft_black">
              Bcc
            </Label>
            <Input
              value={emails.bcEmail}
              onChange={(e) =>
                !view && setEmails({ ...emails, bcEmail: e.target.value })
              }
              placeholder="Email (Separate emails with a comma)"
              className={`mt-2 h-11 w-full rounded-lg border border-accent_soft_black px-6 py-3 placeholder:text-accent_soft_black`}
              type="email"
            />
          </div>
          <div className="mt-7 flex justify-center gap-6">
            <Button
              onClick={() => setIsBcOpen(false)}
              className="w-36 border border-accent_soft_black hover:bg-accent_soft_black hover:text-white transition-colors bg-transparent px-6 py-1.5 text-accent_soft_black"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setIsBcOpen(false)}
              className="w-36 bg-accent_soft_blue px-6 py-2 text-white"
            >
              Save
            </Button>
          </div>
        </div>
      )}
      <div className="flex items-center gap-1">
        <input
          id="sent-email"
          className="h-[18px] w-[18px] rounded-xl outline-none"
          type="checkbox"
        />
        <label htmlFor="sent-email" className="cursor-pointer">
          Sent Later
        </label>
      </div>
    </div>
  );
};

export default EmailPopup;
