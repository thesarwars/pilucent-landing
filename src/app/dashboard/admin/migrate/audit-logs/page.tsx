import { ManualBreadcrumbs } from '@/components/BreadCrumb/BreadCrumb';
import AuditLog from '../_components/AuditLog';

const Page = () => {
  return (
    <div>
      <ManualBreadcrumbs
        items={[
          { label: 'Data Migration', href: '/dashboard/admin/migrate' },
          { label: 'Audit Logs', href: '/dashboard/admin/migrate/audit-logs' },
        ]}
        className="mb-5 mt-0"
      />
      <AuditLog />
    </div>
  );
};

export default Page;
