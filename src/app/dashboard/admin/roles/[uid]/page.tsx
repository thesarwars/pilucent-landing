'use client';

import { fetchPermissions, fetchRoles, patchRole } from '@/app/helpers/backend';
import { useAppSelector } from '@/app/redux/store';
import { ManualBreadcrumbs } from '@/components/BreadCrumb/BreadCrumb';
import MainLoader from '@/components/MainLoader/MainLoader';
import Button from '@/components/ui/RawButton';
import Label from '@/components/ui/RawLabel';
import { toast } from '@/lib/ToastService';
import { GetRoleLabelByModelName } from '@/utils/SalesTax';
import { useRouter } from 'next/navigation';
import React, { use, useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaCheck, FaGraduationCap } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';

type PermissionAction = 'Edit' | 'Create' | 'View' | 'Delete';

type PermissionItem = {
  id: number;
  codename: string;
};

type PermissionFeature = {
  name: string;
  model: string;
  permissions: PermissionItem[];
  isGrouped?: boolean;
  groupedModels?: string[];
};

type PermissionModule = {
  name: string;
  appLabel: string;
  features: PermissionFeature[];
};

type PermissionModelGroup = {
  label: string;
  key: string;
  models: string[];
};

const actions: PermissionAction[] = ['Edit', 'Create', 'View', 'Delete'];

const ACTION_PREFIX_MAP: Record<PermissionAction, string> = {
  Create: 'add_',
  Edit: 'change_',
  Delete: 'delete_',
  View: 'view_',
};

const PERMISSION_MODEL_GROUPS: Record<string, PermissionModelGroup[]> = {
  salesio: [
    {
      label: 'Sales Receipt & Payment Receive',
      key: 'sales_receipt_payment_receive',
      models: [
        'sale',
        'saleitem',
        'salereceipt',
        'salereceiptconnector',
        'salepaymentreceive',
        'salepaymentreceiveitem',
      ],
    },
    {
      label: 'Sales Settings & Sales Tax',
      key: 'sales_settings_sales_tax',
      models: ['salesetting', 'salestax'],
    },
  ],

  chatio: [
    {
      label: 'Chat Room, Messages & Members',
      key: 'chat_room_members',
      models: ['chatroom', 'chatroommember', 'messages', 'chatroommessage', 'chatroommessageread'],
    },
  ],

  messageio: [
    {
      label: 'Support',
      key: 'support',
      models: ['thread', 'inbox'],
    },
  ],

  purchaseio: [
    {
      label: 'Expense & Bills Payments',
      key: 'expense_bills',
      models: ['purchase', 'purchaseitem', 'purchasepayment', 'paybill', 'expense'],
    },
  ],

  productio: [
    {
      label: 'Product',
      key: 'product',
      models: ['productbundle', 'product'],
    },
  ],

  creditnoteio: [
    {
      label: 'Credit Note',
      key: 'credit_note',
      models: ['creditnote', 'creditnoteitem'],
    },
  ],

  journalio: [
    {
      label: 'Journal Entry',
      key: 'journal_entry',
      models: ['journalentry', 'journalentryconnector'],
    },
  ],

  categoryio: [
    {
      label: 'Category',
      key: 'category',
      models: ['category', 'categoryconnector'],
    },
  ],

  brandio: [
    {
      label: 'Brand',
      key: 'brand',
      models: ['brand', 'brandconnector'],
    },
  ],

  currencyio: [
    {
      label: 'Currency',
      key: 'currency',
      models: ['currency', 'currencyconnector'],
    },
  ],

  fileroomio: [
    {
      label: 'Attachments',
      key: 'file_room',
      models: ['fileitem', 'fileitemconnector'],
    },
  ],

  addressio: [
    {
      label: 'Address',
      key: 'address',
      models: ['address', 'addressconnector'],
    },
  ],

  agencyio: [
    {
      label: 'Agency',
      key: 'agency',
      models: ['agency', 'agencytax'],
    },
  ],

  attendanceio: [
    {
      label: 'Holiday & Details',
      key: 'holiday',
      models: ['holidaydetails', 'holiday'],
    },
  ],

  employeeio: [
    {
      label: 'Employee',
      key: 'employee',
      models: [
        'employeebankinginformation',
        'employee',
        'employeeeducation',
        'employeegarnishment',
        'employeeearning',
        'employeesalary',
        'employeetax',
        'employeeworkexperience',
        'employeedeductioncontribution',
      ],
    },
  ],
  notificationio: [
    {
      label: 'Notification',
      key: 'notification',
      models: ['notification', 'notificationsetting'],
    },
  ],
  moovmoneyio: [
    {
      label: 'Moov Money Settings',
      key: 'moov_money_settings',
      models: ['moovaccountsettings', 'moovtransfers', 'moovbankaccountsettings'],
    },
  ],
  paymentio: [
    {
      label: 'Payment',
      key: 'payment_information',
      models: ['paymentinformation', 'paymentmethod'],
    },
  ],
  payrollio: [
    {
      label: 'Payroll Settings',
      key: 'payroll_settings',
      models: [
        'payrollaccountingpreferencessetting',
        'payrollcontactinfosetting',
        'payrollfederaltaxinfosetting',
        'payrollfederaltaxinfosettingitems',
        'payrollgeneralsettings',
        'payrollgeneraltaxsetting',
        'payrollstatetaxinfosetting',
        'payrollstatetaxpaymentschedule',
        'payrollunemploymentinsurancetaxinfo',
        'payrollaccountexpenseaccountcomponent',
        'payrollfederalloaninterestpaymentschedule',
        'payrollmctmtzone',
        'payrollworklocation',
        'payrollreemploymentorworkforceservicefund',
        'wageexpenseaccountcomponent',
        'taxcenterpaymethod',
      ],
    },
    {
      label: 'Payroll Salary Process',
      key: 'payroll_salary_process',
      models: ['payrollsalarycomponent', 'payrollsalaryprocess'],
    },
  ],
  taxbanditsio: [
    {
      label: 'TaxBandits Settings',
      key: 'taxbandits_settings',
      models: ['taxbanditsbusinessaccount', 'taxbanditsreturn940', 'taxbanditsreturn941'],
    },
  ],
  transactionio: [
    {
      label: 'Transaction',
      key: 'transaction',
      models: [
        'bankdeposit',
        'transactionconnector',
        'transactionrules',
        'transactionmethod',
        'transactioninformation',
      ],
    },
  ],
  leaveio: [
    {
      label: 'Leave Balance',
      key: 'leave_balance',
      models: ['employeeleaveallocation', 'leavebalance'],
    },
  ],
  datamigrationio: [
    {
      label: 'Data Migration',
      key: 'data_migration',
      models: [
        'datamigrationimpactline',
        'datamigrationfieldmapping',
        'datamigrationvalidationissue',
        'datamigrationrow',
        'datamigrationjob',
      ],
    },
  ],
};

const Page = (props: any) => {
  const params = use(props.params);
  const { uid } = params as { uid: string };

  const [permissionGroups, setPermissionGroups] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isPending, setIsPending] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSystem, setIsSystem] = useState<boolean>(false);
  const [roleName, setRoleName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { Company } = useAppSelector((state) => state.CompanyData);
  const router = useRouter();

  useEffect(() => {
    if (!Company?.uid) return;

    const fetchData = async () => {
      try {
        setIsPending(true);

        const permissionList = await fetchPermissions();
        const roleList = await fetchRoles(Company.uid);

        setPermissionGroups(permissionList || []);

        const selectedRole = roleList?.find((role: any) => role?.uid === uid);

        if (selectedRole) {
          setIsSystem(Boolean(selectedRole?.is_system));
          setRoleName(selectedRole?.name || '');
          handleSelectedRole(selectedRole);
        } else {
          toast.error('Role not found');
        }
      } catch (error) {
        toast.error('Failed to load role permissions');
      } finally {
        setIsPending(false);
      }
    };

    fetchData();
  }, [Company?.uid, uid]);

  const handleSelectedRole = (role: any) => {
    const allIds = Object.values(role?.permissions?.app_label || {}).flatMap((app: any) =>
      Object.values(app?.model || {}).flatMap((modelArray: any) =>
        Array.isArray(modelArray) ? modelArray.map((entry: any) => entry.id) : []
      )
    );

    setSelectedPermissions(Array.from(new Set(allIds)));
  };

  const handlePermissionToggle = (permissionIds: number[]) => {
    const validPermissionIds = permissionIds.filter(Boolean);

    if (!validPermissionIds.length) return;

    setSelectedPermissions((prev) => {
      const allSelected = validPermissionIds.every((id) => prev.includes(id));

      if (allSelected) {
        return prev.filter((id) => !validPermissionIds.includes(id));
      }

      return Array.from(new Set([...prev, ...validPermissionIds]));
    });
  };

  const getPermissionIds = (feature: PermissionFeature, action: PermissionAction): number[] => {
    const prefix = ACTION_PREFIX_MAP[action];

    return feature.permissions
      .filter((permission) => permission.codename?.startsWith(prefix))
      .map((permission) => permission.id);
  };

  const transformPermissionsToModules = (): PermissionModule[] => {
    if (!permissionGroups || permissionGroups.length === 0) return [];

    const modules: PermissionModule[] = [];
    const group = permissionGroups[0];
    const appLabels = group?.permissions?.app_label || {};

    Object.entries(appLabels).forEach(([appLabel, appData]: [string, any]) => {
      const features: PermissionFeature[] = [];
      const models = appData?.model || {};
      const configuredGroups = PERMISSION_MODEL_GROUPS[appLabel] || [];
      const usedModels = new Set<string>();

      configuredGroups.forEach((modelGroup) => {
        const groupedPermissions: PermissionItem[] = [];

        modelGroup.models.forEach((modelName) => {
          const modelPermissions = models[modelName];

          if (Array.isArray(modelPermissions) && modelPermissions.length > 0) {
            usedModels.add(modelName);
            groupedPermissions.push(...modelPermissions);
          }
        });

        if (groupedPermissions.length > 0) {
          features.push({
            name: modelGroup.label,
            model: `__group__${modelGroup.key}`,
            permissions: groupedPermissions,
            isGrouped: true,
            groupedModels: modelGroup.models,
          });
        }
      });

      Object.entries(models).forEach(([modelName, permissions]: [string, any]) => {
        if (usedModels.has(modelName)) return;

        features.push({
          name: GetRoleLabelByModelName(modelName),
          model: modelName,
          permissions: Array.isArray(permissions) ? permissions : [],
          isGrouped: false,
        });
      });

      modules.push({
        name: GetRoleLabelByModelName(appLabel),
        appLabel,
        features,
      });
    });

    return modules;
  };

  const modules = useMemo(() => {
    return transformPermissionsToModules();
  }, [permissionGroups]);

  const filteredModules = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return modules;

    return modules
      .map((module) => {
        const moduleMatch =
          module.name.toLowerCase().includes(keyword) ||
          module.appLabel.toLowerCase().includes(keyword);

        if (moduleMatch) {
          return module;
        }

        const filteredFeatures = module.features.filter((feature) => {
          const searchableTexts = [
            feature.name,
            feature.model,
            ...(feature.groupedModels || []),
            ...feature.permissions.map((permission) => permission.codename),
          ];

          return searchableTexts.some((text) => String(text).toLowerCase().includes(keyword));
        });

        return {
          ...module,
          features: filteredFeatures,
        };
      })
      .filter((module) => module.features.length > 0);
  }, [modules, searchTerm]);

  const totalVisibleRows = filteredModules.reduce(
    (total, module) => total + module.features.length,
    0
  );

  const handleUpdateRole = async () => {
    const data: any = {
      uid,
      company_uid: Company?.uid,
      permissions: selectedPermissions,
    };

    if (!isSystem) {
      data.name = roleName;
    }

    if (!data.permissions.length) {
      return toast.info('Select at least one permission');
    }

    if (!data.name && !isSystem) {
      return toast.info('Role name is required');
    }

    if (!data.company_uid) {
      return toast.error('Company not found!');
    }

    try {
      setIsLoading(true);

      const res = await patchRole(data);

      if (res?.success) {
        toast.success('Role Updated.');
        router.push('/dashboard/admin/roles');
      }
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return <MainLoader color="#9ca3af" />;
  }

  return (
    <>
      <ManualBreadcrumbs
        items={[
          { label: 'Role Management', href: '/dashboard/admin/roles' },
          { label: 'Update Role', href: `/dashboard/admin/roles/${uid}` },
        ]}
        className="mb-5 mt-0"
      />

      <Button
        onClick={() => router.back()}
        className="flex items-center gap-1 p-1 text-accent_soft_blue hover:underline"
      >
        <IoIosArrowBack />
        Back
      </Button>

      <section className="relative mt-4 rounded-lg bg-white/60 p-6 shadow-sm">
        {isLoading && (
          <div className="absolute left-0 top-0 z-[100] h-full w-full rounded-xl bg-white bg-opacity-70">
            <div className="flex h-full w-full flex-col items-center justify-center">
              <div className="h-24 w-24 animate-spin rounded-full border-b-[7px] border-t-[7px] border-b-accent_soft_blue border-t-primary"></div>
            </div>
          </div>
        )}

        <div className="mb-6 flex justify-between">
          <h2 className="text-2xl font-semibold">Update Role</h2>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="block font-medium text-gray-600">
              Role Name <span className="text-lg text-red-500">*</span>
            </Label>

            <input
              disabled={isSystem}
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              type="text"
              className="w-full rounded-md border px-4 py-2 outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
              placeholder="Enter Role Name"
            />
          </div>

          <div className="mt-1 space-y-2">
            <Label className="block font-medium text-gray-600">Search Permissions</Label>

            <div className="relative">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                className="w-full rounded-md border px-4 py-2 pr-20 outline-none"
                placeholder="Search module, row, model, or codename..."
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-900"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {totalVisibleRows} permission rows</span>
          <span>Selected {selectedPermissions.length} permission IDs</span>
        </div>

        <div className="max-h-[70vh] overflow-y-auto rounded-lg border">
          <div className="sticky top-0 z-[100] grid grid-cols-[1fr_auto] rounded-md bg-white">
            <div className="p-4 font-medium text-accent_soft_black">Module</div>

            <div className="grid grid-cols-4 gap-8 p-4 font-medium text-accent_soft_black">
              {actions.map((action) => (
                <div key={action} className="w-16 text-center">
                  {action}
                </div>
              ))}
            </div>
          </div>

          {filteredModules.length > 0 ? (
            filteredModules.map((module, moduleIndex) => (
              <React.Fragment key={`${module.appLabel}-${moduleIndex}`}>
                <div className="grid grid-cols-[1fr_auto] border-t">
                  <div className="flex items-center gap-2 p-4 font-medium text-accent_soft_black">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center">
                        {module.appLabel === 'attendanceio' || module.appLabel === 'addressio' ? (
                          <FaCalendarAlt size={16} />
                        ) : (
                          <FaGraduationCap size={16} />
                        )}
                      </div>

                      {module.name}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-8 p-4">
                    {actions.map((action) => (
                      <div key={action} className="w-16"></div>
                    ))}
                  </div>
                </div>

                {module.features.map((feature, featureIndex) => (
                  <div
                    key={`${module.appLabel}-${feature.model}-${featureIndex}`}
                    className="grid grid-cols-[1fr_auto] border-t"
                  >
                    <div className="p-4 pl-12 text-gray-600">{feature.name}</div>

                    <div className="grid grid-cols-4 gap-8 p-4">
                      {actions.map((action) => {
                        const permissionIds = getPermissionIds(feature, action);

                        const isAvailable = permissionIds.length > 0;

                        const isChecked =
                          permissionIds.length > 0 &&
                          permissionIds.every((id) => selectedPermissions.includes(id));

                        const isPartial =
                          permissionIds.some((id) => selectedPermissions.includes(id)) &&
                          !isChecked;

                        return (
                          <div key={action} className="flex w-16 justify-center">
                            {isAvailable ? (
                              <div
                                role="checkbox"
                                aria-checked={isPartial ? 'mixed' : isChecked}
                                tabIndex={0}
                                className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded ${
                                  isChecked
                                    ? 'bg-indigo-600'
                                    : isPartial
                                      ? 'border border-indigo-600 bg-indigo-100'
                                      : 'border border-gray-400 bg-white'
                                }`}
                                onClick={() => handlePermissionToggle(permissionIds)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handlePermissionToggle(permissionIds);
                                  }
                                }}
                              >
                                {isChecked && <FaCheck className="h-3 w-3 text-white" />}

                                {isPartial && !isChecked && (
                                  <div className="h-2 w-2 rounded-sm bg-indigo-600" />
                                )}
                              </div>
                            ) : (
                              <div className="h-5 w-5"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))
          ) : (
            <div className="border-t p-6 text-center text-sm text-gray-500">
              No permission found for “{searchTerm}”
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-md border border-gray-300 px-8 py-2 text-accent_soft_black transition-colors hover:bg-gray-50"
          >
            Back
          </button>

          <button
            onClick={handleUpdateRole}
            className="rounded-md bg-black px-8 py-2 text-white transition-colors hover:bg-black/80"
          >
            Save
          </button>
        </div>
      </section>
    </>
  );
};

export default Page;
