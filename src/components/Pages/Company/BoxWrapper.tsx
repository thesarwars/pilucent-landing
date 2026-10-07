import { cn } from "@/lib/utils";

type BoxWrapperProps = {
  className?: string;
  children: React.ReactNode;
};

const BoxWrapper = ({ className, children }: BoxWrapperProps) => {
  return (
    <div
      className={cn(
        "my-4 rounded-3xl border border-white bg-[#FFFFFF66] px-7 py-6",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default BoxWrapper;
