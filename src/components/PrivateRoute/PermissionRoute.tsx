import { useAppSelector } from '@/app/redux/store';
import { permissions } from '@/lib/helpers/Permissions';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MainLoader from '../MainLoader/MainLoader';

const PermissionRoute = ({ children }: { children: any }) => {
  const router = useRouter();
  const path = usePathname();
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [canView, setCanView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fn = async () => {
      if (path == '/dashboard') {
        setCanView(true);
        setIsLoading(false);
        return;
      }

      if (path?.startsWith("/dashboard/hris/employee/employees/summary")) {
        setCanView(true);
        setIsLoading(false);
        return;
      }
      const data = permissions.find((p) => path?.startsWith(p.path));
      if (data?.isPass) {
        setCanView(true);
        setIsLoading(false);
        return;
      }
      const allowed = Permissions?.includes(data?.codeName || '');
      setCanView(allowed);
      setIsLoading(false);
    };
    fn();
  }, [path, Permissions]);

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

export default PermissionRoute;
