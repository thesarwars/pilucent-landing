/* eslint-disable react-hooks/set-state-in-effect */
import { useAppSelector } from "@/app/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainLoader from "../MainLoader/MainLoader";

const CustomSecureRoutes = ({
  codeName,
  children,
}: {
  codeName: any;
  children: any;
}) => {
  const router = useRouter();
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [canView, setCanView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const allowed = Permissions?.includes(codeName || "");
    setCanView(allowed);
    setIsLoading(false);
  }, [codeName, Permissions]);

  if (isLoading) return <MainLoader />;

  if (!canView) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <h1 className="text-center">You do not have permission to view this</h1>
      </div>
    );
  }

  return <>{children}</>;
};

export default CustomSecureRoutes;
