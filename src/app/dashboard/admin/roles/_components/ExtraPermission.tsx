'use client';

import { fetchPermissions, postRole } from '@/app/helpers/backend';
import MainLoader from '@/components/MainLoader/MainLoader';
import { GetRoleLabelByModelName } from '@/utils/SalesTax';
import { Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FaCheck, FaCalendarAlt, FaGraduationCap } from 'react-icons/fa';
import { IoIosInformation } from 'react-icons/io';

const ExtraPermissions = ({
  selectedRolePermissions,
  selectedPermissions,
  setSelectedPermissions,
}: {
  selectedRolePermissions: any[];
  selectedPermissions: any[];
  setSelectedPermissions: any;
}) => {
  const [permissionGroups, setPermissionGroups] = useState<any[]>([]);
  const [isPending, setIsPending] = useState<boolean>(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsPending(true);
        const data = await fetchPermissions();
        setPermissionGroups(data);
      } catch (error) {
        //error here
      } finally {
        setIsPending(false);
      }
    };
    fetchData();
  }, []);

  const handlePermissionToggle = (permId: number) => {
    setSelectedPermissions((prev: any) => {
      if (prev.includes(permId)) {
        return prev.filter((id: any) => id !== permId);
      } else {
        return [...prev, permId];
      }
    });
  };

  // console.log(selectedPermissions);

  // Transform permission data into modules and features
  const transformPermissionsToModules = () => {
    if (!permissionGroups || permissionGroups.length === 0) return [];

    const modules: any[] = [];
    const group = permissionGroups[0]; // Using the first group (admin)

    // Convert app_labels to modules
    Object.entries(group.permissions.app_label).forEach(([appLabel, appData]: [string, any]) => {
      const features: any[] = [];

      // Convert models to features
      Object.entries(appData.model).forEach(([modelName, permissions]: [string, any]) => {
        features.push({
          name: GetRoleLabelByModelName(modelName),
          model: modelName,
          permissions: permissions,
        });
      });

      modules.push({
        name: GetRoleLabelByModelName(appLabel),
        appLabel: appLabel,
        features: features,
      });
    });

    return modules;
  };

  // Get permission type (add, change, delete, view)
  const getPermissionType = (codename: string) => {
    if (codename.startsWith('add_')) return 'Create';
    if (codename.startsWith('change_')) return 'Edit';
    if (codename.startsWith('delete_')) return 'Delete';
    if (codename.startsWith('view_')) return 'View';
    return 'Other';
  };

  // Check if a permission exists for a feature and action
  const hasPermission = (feature: any, action: string) => {
    return feature.permissions.some((perm: any) => {
      const permType = getPermissionType(perm.codename);
      return permType === action;
    });
  };

  // Get permission ID for a feature and action
  const getPermissionId = (feature: any, action: string) => {
    const permission = feature.permissions.find((perm: any) => {
      const permType = getPermissionType(perm.codename);
      return permType === action;
    });
    return permission ? permission.id : null;
  };

  const modules = transformPermissionsToModules();
  const actions = ['Edit', 'Create', 'View', 'Delete'];

  if (isPending) {
    return <MainLoader />;
  }

  return (
    <section className="mt-4 rounded-lg bg-white p-6 font-lexend shadow-sm">
      <div className="mb-6 flex justify-between">
        <h2 className="text-2xl font-semibold">
          Select Extra Permissions{' '}
          <p className="flex items-center gap-2 rounded-md border bg-gray-100 px-4 py-2 text-sm mt-4 font-normal">
            <Info className="h-4 w-4" />
            Disabled Permissions are already assigned through your user role
          </p>
        </h2>
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-[1fr_auto] bg-slate-50">
          <div className="p-4 font-medium text-gray-700">Module</div>
          <div className="grid grid-cols-6 gap-8 p-4 font-medium text-gray-700">
            {actions.map((action) => (
              <div key={action} className="w-16 text-center">
                {action}
              </div>
            ))}
          </div>
        </div>

        {modules.map((module, moduleIndex) => (
          <div key={moduleIndex}>
            {/* Module header */}
            <div className="grid grid-cols-[1fr_auto] border-t">
              <div className="flex items-center gap-2 p-4 font-medium text-gray-800">
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
              <div className="grid grid-cols-6 gap-8 p-4">
                {/* Empty cells for the module row */}
                {actions.map((_, i) => (
                  <div key={i} className="w-16"></div>
                ))}
              </div>
            </div>

            {/* Features */}
            {module.features.map((feature: any, featureIndex: number) => (
              <div key={featureIndex} className="grid grid-cols-[1fr_auto] border-t">
                <div className="p-4 pl-12 text-gray-600">{feature.name}</div>
                <div className="grid grid-cols-6 gap-8 p-4">
                  {actions.map((action, actionIndex) => {
                    // For standard CRUD operations, check if permission exists
                    let isAvailable = false;
                    let permId = null;

                    if (
                      action === 'Edit' ||
                      action === 'Create' ||
                      action === 'View' ||
                      action === 'Delete'
                    ) {
                      isAvailable = hasPermission(feature, action);
                      permId = getPermissionId(feature, action);
                    }

                    // For Report and Active, we'll just show them as available for demo purposes
                    if (action === 'Report' || action === 'Active') {
                      isAvailable = true;
                      // Create a fake ID for these permissions
                      permId = 1000 + moduleIndex * 100 + featureIndex * 10 + actionIndex;
                    }

                    const isChecked = selectedPermissions.includes(permId || 0);

                    const isRoleChecked = selectedRolePermissions.includes(permId || 0);
                    return (
                      <div key={actionIndex} className="flex w-16 justify-center">
                        {isAvailable ? (
                          <div
                            className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded ${
                              isChecked
                                ? 'bg-indigo-600'
                                : isRoleChecked
                                  ? 'bg-gray-200 hover:cursor-not-allowed'
                                  : 'border border-gray-400 bg-white'
                            } `}
                            onClick={() => {
                              if (isRoleChecked) {
                                return;
                              }
                              if (permId) {
                                handlePermissionToggle(permId);
                              }
                            }}
                          >
                            {isChecked && <FaCheck className="h-3 w-3 text-white" />}
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
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExtraPermissions;
