import Image from "next/image";

const CustomerImportSteps = ({
  currentStep,
  title,
}: {
  currentStep: number;
  title?: string;
}) => {
  return (
    <div className="mt-5">
      <div className="space-y-3">
        {title && (
          <h1 className="text-2xl font-semibold text-[#131523]">{title}</h1>
        )}
      </div>

      <div className="mb-6 mt-9 flex items-center gap-1 px-20">
        <div className="flex flex-col items-center justify-center gap-3">
          {currentStep > 1 ? (
            <Image
              src="/images/icons/circle_tick.svg"
              width={34}
              height={34}
              alt="tick"
              className="h-9 w-9 object-cover"
            />
          ) : (
            <p
              className={`${
                currentStep === 1 ? "bg-accent_soft_blue text-white" : ""
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
          {currentStep > 2 ? (
            <Image
              src="/images/icons/circle_tick.svg"
              width={34}
              height={34}
              alt="tick"
              className="h-9 w-9 object-cover"
            />
          ) : (
            <p
              className={`${
                currentStep === 2
                  ? "bg-accent_soft_blue text-white"
                  : "bg-[#F5F6FA] text-[#A1A7C4]"
              } text flex h-[35px] w-[35px] items-center justify-center rounded-full text-sm font-medium`}
            >
              <span>02</span>
            </p>
          )}

          <p className="text-xs font-medium text-[#5A607F]">Verify</p>
        </div>

        {/* dotted line */}
        <div className="mx-1 flex-grow border-t-2 border-dotted border-gray-300"></div>

        <div className="flex flex-col items-center justify-center gap-3">
          {currentStep === 3 ? (
            <Image
              src="/images/icons/circle_tick.svg"
              width={34}
              height={34}
              alt="tick"
              className="h-9 w-9 object-cover"
            />
          ) : (
            <p
              className={`${
                currentStep === 3
                  ? "bg-accent_soft_blue text-white"
                  : "bg-[#F5F6FA] text-[#A1A7C4]"
              } text flex h-[35px] w-[35px] items-center justify-center rounded-full text-sm font-medium`}
            >
              <span>03</span>
            </p>
          )}

          <p className="text-xs font-medium text-[#5A607F]">Imported</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerImportSteps;
