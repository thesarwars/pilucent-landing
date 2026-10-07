import { cn } from "@/lib/utils";
import { FaSpinner } from "react-icons/fa";

type TLoaderProps = {
  className?: string;
};

const Loader = ({ className }: TLoaderProps) => {
  return (
    <div className="fixed left-0 top-0 z-[999] flex h-screen w-screen items-center justify-center overflow-hidden bg-black/40">
      <FaSpinner
        className={cn("h-10 w-10 animate-spin text-white", className)}
      />
    </div>
  );
};

export default Loader;
