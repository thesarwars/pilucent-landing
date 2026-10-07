import { ManualBreadcrumbs } from '@/components/BreadCrumb/BreadCrumb';
import MappingTemplates from '../_components/MappingTemplates';

const Page = () => {
  return (
    <div>
      <ManualBreadcrumbs
        items={[
          { label: 'Data Migration', href: '/dashboard/admin/migrate' },
          { label: 'Mapping Templates', href: '/dashboard/admin/migrate/templates' },
        ]}
        className="mb-5 mt-0"
      />
      <MappingTemplates />
    </div>
  );
};

export default Page;
