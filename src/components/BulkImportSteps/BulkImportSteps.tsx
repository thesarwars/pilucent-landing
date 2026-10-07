import Image from "next/image";
interface Data{
  step:number,
  title:string,
  des:string | null,
}
const BulkImportSteps = ({step,title,des}:Data) => {
  return (
    <div className="mt-5">
      <div className="space-y-3">

        <h1 className="text-2xl font-semibold text-[#131523] ">
          {title}</h1>
        <p className="text-lg text-[#5A607F] font-medium ">
        {des}
        </p>
      </div>

      <div className="mb-6 mt-9 flex items-center gap-1 px-20">
        <div className="flex flex-col items-center justify-center gap-3">
          {step > 1 ? (
            <Image
              src="/images/icons/circle_tick.png"
              width={34}
              height={34}
              alt="tick"
            />
          ) : (
            <p
              className={`${
                step === 1 ? "bg-[#6A6EF6] text-[#00035F]" : ""
              } flex h-[35px] w-[35px] items-center justify-center rounded-full text-sm font-medium`}
            >
              <span>01</span>
            </p>
          )}
          <p className="text-xs font-medium text-[#5A607F]">Upload</p>
        </div>

        {/* dotted line */}
        <div className="mx-1 flex-grow border-t-2 border-dotted border-gray-300"></div>

        <div className="flex flex-col items-center justify-center gap-3">
          {step > 2 ? (
            <Image
              src="/images/icons/circle_tick.png"
              width={34}
              height={34}
              alt="tick"
            />
          ) : (
            <p
              className={`${
                step === 2
                  ? "bg-[#6A6EF6] text-[#00035F]"
                  : "bg-[#F5F6FA] text-[#A1A7C4]"
              } text flex h-[35px] w-[35px] items-center justify-center rounded-full text-sm font-medium`}
            >
              <span>02</span>
            </p>
          )}

          <p className="text-xs font-medium text-[#5A607F]">Map Date</p>
        </div>

        {/* dotted line */}
        <div className="mx-1 flex-grow border-t-2 border-dotted border-gray-300"></div>

        <div className="flex flex-col items-center justify-center gap-3">
          {step > 3 ? (
            <Image
              src="/images/icons/circle_tick.png"
              width={34}
              height={34}
              alt="tick"
            />
          ) : (
            <p
              className={`${
                step === 3
                  ? "bg-[#6A6EF6] text-[#00035F]"
                  : "bg-[#F5F6FA] text-[#A1A7C4]"
              } text flex h-[35px] w-[35px] items-center justify-center rounded-full text-sm font-medium`}
            >
              <span>03</span>
            </p>
          )}

          <p className="text-xs font-medium text-[#5A607F]">Verify</p>
        </div>

        {/* dotted line */}
        <div className="mx-1 flex-grow border-t-2 border-dotted border-gray-300"></div>

        <div className="flex flex-col items-center justify-center gap-3">
          {step > 4 ? (
            <Image
              src="/images/icons/circle_tick.png"
              width={34}
              height={34}
              alt="tick"
            />
          ) : (
            <p
              className={`${
                step === 4
                  ? "bg-[#6A6EF6] text-[#00035F]"
                  : "bg-[#F5F6FA] text-[#A1A7C4]"
              } text flex h-[35px] w-[35px] items-center justify-center rounded-full text-sm font-medium`}
            >
              <span>04</span>
            </p>
          )}

          <p className="text-xs font-medium text-[#5A607F]">Import</p>
        </div>
      </div>
    </div>
  );
};

export default BulkImportSteps;
