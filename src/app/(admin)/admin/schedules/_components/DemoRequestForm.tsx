import Modal from "@/app/(admin)/_components/Modal";
import TimePicker from "@/app/(admin)/_components/TimePicker";
import { fetchSchedule, patchSchedule } from "@/app/helpers/backend";
import MainLoader from "@/components/MainLoader/MainLoader";
import Button from "@/components/ui/RawButton";
import DatePicker from "@/components/ui/DatePicker";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import React, { FormEvent, useEffect, useState } from "react";
import EmailEditor from "./EmailBox";
import moment from "moment";
import { toast } from "react-toastify";

const DemoRequestForm = ({
  setIsOpen,
  isOpen,
  uid,
  setSelectedRowId,
  refetch,
}: {
  setIsOpen: any;
  isOpen: any;
  uid?: any;
  setSelectedRowId?: any;
  refetch?: any;
}) => {
  const [time, setTime] = useState<any>("22:00");
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<any>(new Date().toDateString());
  const [content, setContent] = useState(``);
  const [isLoading, setIsLoading] = useState(false);
  const [Data, setData] = useState({
    email: "",
    full_name: "",
    phone_number: "",
    work_email: "",
    company_name: "",
    agent_count: 0,
    preferred_version: "",
    preferred_date: new Date().toDateString(),
    preferred_time: "",
    comment: "",
    status: "SCHEDULED",
    meeting_type: "VIRTUAL",
    meeting_link: "",
    mail_subject: "",
    mail_body: ``,
    is_mail_sent: true,
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await fetchSchedule(uid);
        setData({ ...Data, ...res });
      } catch (error) {
        // console.log(error);
      } finally {
        setLoading(false);
      }
    };
    if (uid) fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = {
      email: Data?.email || Data?.work_email,
      preferred_date: moment(date).format("YYYY-MM-DD"),
      preferred_time: time,
      status: "SCHEDULED",
      meeting_type: "VIRTUAL",
      meeting_link: Data.meeting_link,
      mail_subject: Data.mail_subject,
      mail_body: ` <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f6f8fa">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" bgcolor="#fff" style="margin:40px 0 20px 0;border-radius:14px;box-shadow:0 2px 12px #e3e8ef;">
          <tr>
            <td align="center" style="padding:36px 36px 20px 36px;">
              <img src="https://img.icons8.com/color/96/000000/meeting-room.png" width="64" alt="Meeting Icon" style="margin-bottom:20px;">
              <h2 style="margin:0;font-size:2em;color:#222;">You're Invited!</h2>
              <p style="color:#555;font-size:1.07em;margin:16px 0 0 0;">Join us for an exclusive demo session where we showcase the latest features and answer all your questions.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:10px 36px;">
              <table width="100%">
                <tr>
                  <td style="padding:12px 0;">
                    <strong>Date:</strong> <span style="color:#2366d1;">${moment(date).format("dddd, D MMMM YYYY")}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <strong>Time:</strong> <span style="color:#2366d1;">${time}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <strong>Location:</strong> <span style="color:#2366d1;">Google Meet (link below)</span>
                  </td>
                </tr>
              </table>
              <a href=${Data?.meeting_link} style="display:inline-block;margin:20px 0 0 0;padding:12px 32px;background:#2366d1;color:#fff;border-radius:8px;font-size:1.08em;text-decoration:none;box-shadow:0 2px 4px #bcdff6;">Join Meeting</a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px 36px 36px;text-align:left;font-size:0.97em;color:#555;">
              <strong>Agenda:</strong>
              <ul style="margin:10px 0 0 16px;padding:0;">
                <li>Quick project introduction</li>
                <li>Live demo & walkthrough</li>
                <li>Q&A session</li>
                <li>Next steps</li>
              </ul>
              <p style="margin:16px 0 0 0;">Looking forward to your participation!</p>
              <p style="margin:4px 0 0 0;">Best regards,<br><strong>The Demo Team</strong></p>
            </td>
          </tr>
        </table>
        <p style="color:#888;font-size:0.93em;margin-top:10px;">If you have any questions, simply reply to this email.</p>
      </td>
    </tr>
  </table>`,
      is_mail_sent: true,
    };
    const toaster = toast.loading("Sending demo request mail");
    if (!data?.mail_body || !data?.preferred_time) {
      toast.update(toaster, {
        isLoading: false,
        type: "info",
        render: "Please provide required fields",
        autoClose: 2000,
      });
      return;
    }
    try {
      setIsLoading(true);
      const res = await patchSchedule(uid, data);
      if (res.success) {
        setIsOpen(false);
        refetch && refetch();
        toast.update(toaster, {
          isLoading: false,
          type: "success",
          render: "Demo request email has been sent",
          autoClose: 2000,
        });
      }
    } catch (error) {
      toast.update(toaster, {
        isLoading: false,
        type: "error",
        render: "Something Went Wrong",
        autoClose: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Send Demo request "
        widthClass="w-[550px]"
      >
        {loading ? (
          <MainLoader className="h-[70vh]" />
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="col-span-2 mt-2 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="block text-[#5A607F]">Full Name</Label>
                <input
                  value={Data?.full_name}
                  placeholder="Phone"
                  className="mt-2 h-11 w-full cursor-not-allowed rounded-lg border border-[#A1A7C4] px-6 py-4 disabled:bg-gray-100"
                  type="text"
                  disabled
                />
              </div>
              <div>
                <Label className="block text-[#5A607F]">Phone</Label>
                <input
                  value={Data?.phone_number}
                  placeholder="Phone"
                  className="mt-2 h-11 w-full cursor-not-allowed rounded-lg border border-[#A1A7C4] px-6 py-4 disabled:bg-gray-100"
                  type="text"
                  disabled
                />
              </div>
              <div>
                <Label className="block text-[#5A607F]">Email</Label>
                <input
                  value={Data?.email || Data?.work_email}
                  placeholder="Phone"
                  className="mt-2 h-11 w-full cursor-not-allowed rounded-lg border border-[#A1A7C4] px-6 py-4 disabled:bg-gray-100"
                  type="text"
                  disabled
                />
              </div>
              <div className="">
                <Label className="block text-[#5A607F]">Date</Label>
                <DatePicker
                  calenderClassName="left-1"
                  onChange={(date) => setDate(date)}
                  value={date}
                  ClassName="border py-2 border-accent_text_slate"
                />
              </div>
              <div>
                <Label className="mb-2 block text-[#5A607F]">
                  Time Duration
                </Label>
                <TimePicker required={true} onChange={setTime} value={time} />
              </div>
              <div className="col-span-2">
                <Label className="block text-[#5A607F]">Meeting Type</Label>
                <select
                  value={Data.meeting_type}
                  className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
                  required
                >
                  <option value="VIRTUAL" defaultChecked>
                    Virtual
                  </option>
                </select>
              </div>
              <div className="col-span-2">
                <Label className="block text-[#5A607F]">Subject</Label>
                <Input
                  value={Data.mail_subject}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      mail_subject: e.target.value,
                    }))
                  }
                  placeholder="Email Subject"
                  className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                  type="text"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label className="mb-2 block text-[#5A607F]">Messages</Label>
                <EmailEditor content={content} setContent={setContent} />
              </div>
              <div className="col-span-2 mt-2 flex items-center gap-1">
                <Input
                  value={Data.meeting_link}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      meeting_link: e.target.value,
                    }))
                  }
                  placeholder="Enter meeting link"
                  className="h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4 placeholder:text-gray-400"
                  type="text"
                  required
                />
              </div>
            </div>
            <div className="mx-auto mt-14 flex max-w-[325px] items-center justify-center gap-10">
              <Button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSelectedRowId(null);
                }}
                className="w-[142px] cursor-pointer rounded-lg border border-[#6A6EF6] py-3 text-center font-semibold text-[#6A6EF6]"
              >
                Cancel
              </Button>
              <Button
                className="min-w-[150px] bg-[#00035F] text-white"
                type="submit"
                isLoading={isLoading}
              >
                Send Mail
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default DemoRequestForm;
