import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const Label = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <label className={cn("text-[#EAECF0]", className)}>{children}</label>;
};

export default Label;
