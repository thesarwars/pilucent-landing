"use client";
import Image from "next/image";
import Button from "../ui/RawButton";
import { useRouter } from "next/navigation";

const ImportSuccess = ({
  btnText,
  Redirect,
}: {
  btnText: string;
  Redirect: string;
}) => {
  const router = useRouter();

  return (
    <div
      style={{ boxShadow: "0px 4px 36px 0px rgba(0, 0, 0, 0.05)" }}
      className="mt-9 rounded-xl border-2 bg-white py-12 font-lexend"
    >
      <div className="flex justify-center">
        <Image
          src="/images/import_success.png"
          width={260}
          height={204}
          alt="import_success"
        />
      </div>
      <h1 className="mt-11 text-center text-[32px] font-semibold text-accent_soft_blue">
        Successfully Imported
      </h1>

      <div className="mt-9 flex justify-center">
        <Button
          type="button"
          onClick={() => router.push(`${Redirect}`)}
          className="bg-accent_soft_black text-white"
        >
          {btnText}
        </Button>
      </div>
    </div>
  );
};

export default ImportSuccess;
