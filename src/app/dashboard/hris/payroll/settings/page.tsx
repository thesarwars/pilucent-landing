'use client';
import React, { useState, useEffect } from 'react';
import { Pencil, Clock, MapPin, Calculator } from 'lucide-react';
import Link from 'next/link';
import GeneralTaxSettings from './_components/GeneralTaxSettings';
import FederalTaxSettings from './_components/FederalTaxSettings';
import NewYorkTaxSettings from './_components/NewYorkTaxSettings';
import MinnesotaTaxSettings from './_components/MinnesotaTaxSettings';
import WorkLocationModal from './_components/WorkLocationsModal';
import { usePathname, useRouter } from 'next/navigation';
import BankAccounts from './_components/BankAccounts';
import TaxesAndForms from './_components/TaxesAndForms';
import { useFetch } from '@/app/helpers/hooks';
import { fetchWorkLocationList } from '@/app/helpers/backend';
import { Breadcrumb, Drawer, IconChip, type VioletTone } from '@/components/violet';
import CaliforniaTaxSettings from './_components/CaliforniaTaxSettings';
import WashingtonTaxSettings from './_components/WashingtonTaxSettings';
import AlabamaTaxSettings from './_components/AlabamaTaxSettings';
import AlaskaTaxSettings from './_components/AlaskaTaxSettings';

/** A single violet settings row (icon + title + description + edit affordance). */
const SettingRow = ({
  icon,
  tone = 'violet',
  title,
  desc,
  onEdit,
  href,
  id,
}: {
  icon: React.ReactNode;
  tone?: VioletTone;
  title: string;
  desc?: string;
  onEdit?: () => void;
  href?: string;
  id?: string;
}) => {
  const editBtn = (
    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary">
      <Pencil className="h-4 w-4" />
    </span>
  );
  return (
    <div
      id={id}
      className="flex items-center gap-3 rounded-v-card bg-white p-5 shadow-v-card transition-shadow hover:shadow-v-tile-hover"
    >
      <IconChip tone={tone} size="lg">
        {icon}
      </IconChip>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-bold text-v-ink900">{title}</div>
        {desc && <div className="text-[12px] text-v-ink400">{desc}</div>}
      </div>
      {href ? (
        <Link href={href} aria-label={`Edit ${title}`}>
          {editBtn}
        </Link>
      ) : (
        <button type="button" onClick={onEdit} aria-label={`Edit ${title}`}>
          {editBtn}
        </button>
      )}
    </div>
  );
};

const PayrollSettingsComponent = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [workLocations, setWorkLocations] = useState<any[]>([]);
  const { data, isPending } = useFetch(['work-location-list'], () =>
    fetchWorkLocationList({ limit: 100 })
  );
  useEffect(() => {
    if (!isPending && data?.results?.length) {
      setWorkLocations(data.results);
    }
  }, [data, isPending]);

  
  useEffect(() => {
    // On load or navigation, check hash and scroll
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [pathname]);

  // useEffect(() => {
  //   // Apply smooth scroll only while this page is mounted
  //   const html = document.documentElement;
  //   html.style.scrollBehavior = 'smooth';

  //   return () => {
  //     html.style.scrollBehavior = 'auto'; // reset when leaving page
  //   };
  // }, []);

  const isStateAvailable = (state: string) => {
    return workLocations?.find((s: any) => s.location_state == state);
  };

  return (
    <div className="flex flex-col gap-4 pb-10 font-jakarta text-v-ink900">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'HRIS', href: '#' },
          { label: 'Payroll', href: '#' },
          { label: 'Settings' },
        ]}
      />
      <h1 className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em] text-v-ink900">
        Payroll Settings
      </h1>
      <div className="flex flex-col gap-3">
        {/* general settings */}
        <SettingRow
          icon={<Clock />}
          tone="violet"
          title="General Settings"
          desc="Working days and hours"
          onEdit={() => router.push('/dashboard/hris/payroll/general_settings')}
        />
        {/* General Tax */}
        <GeneralTaxSettings />
        {/* Federal Tax */}
        <FederalTaxSettings />
        {isStateAvailable('NY') && <NewYorkTaxSettings />}
        {isStateAvailable('MN') && <MinnesotaTaxSettings />}
        {isStateAvailable('CA') && <CaliforniaTaxSettings />}
        {isStateAvailable('WA') && <WashingtonTaxSettings />}
        {isStateAvailable('AL') && <AlabamaTaxSettings />}
        {isStateAvailable('AK') && <AlaskaTaxSettings />}
        <TaxesAndForms />
        <div id="bankSection">
          <BankAccounts />
        </div>

        {/* Auto Payroll */}
        {/* <div className="rounded-md border border-gray-200 bg-white/60 shadow-sm">
          <div className="grid grid-cols-3 p-4">
            <div className="flex-1">
              <h2 className="text-base font-medium text-gray-800">
                Auto Payroll
              </h2>
              <div className="mt-1 text-sm text-gray-600">
                Automatically pay your employees (Currently ineligible)
              </div>
              <div className="mt-1">
                <span className="cursor-pointer text-xs text-blue-600 hover:underline">
                  Why am I ineligible?
                </span>
              </div>
            </div>
            <div className="flex-1 text-sm text-gray-500">
              No employees enrolled
            </div>
            <div className="flex items-end justify-end">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Pencil size={16} />
              </button>
            </div>
          </div>
        </div> */}
        {/* Work Locations */}
        <SettingRow
          icon={<MapPin />}
          tone="teal"
          title="Work Locations"
          desc="Manage all work locations"
          onEdit={() => setIsOpen(true)}
        />

        {/* Email notifications */}
        {/* <div className="bg-white/60 rounded-md shadow-sm border border-gray-200 cursor-pointer" onClick={() => openModal("email_notifications")}> 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="flex-1">
              <h2 className="text-base font-medium text-gray-800">Email notifications</h2>
            </div>
            <div className="flex-1 text-sm text-gray-500">
              <div>Send to</div>
              <ul className="list-disc pl-5 mt-1">
                <li>Client&apos;s pay day emails</li>
                <li>Payday reminders</li>
                <li>Tax setup reminders</li>
              </ul>
            </div>
            <div className="flex items-end justify-end">
              <span className="text-sm text-gray-500 mr-4">Don&apos;t send</span>
              <button className="p-1 text-gray-400 hover:text-gray-600" onClick={e => { e.stopPropagation(); openModal("email_notifications"); }}>
                <Pencil size={16} />
              </button>
            </div>
          </div>
        </div> */}

        {/* Employee profile management */}
        {/* <div className="bg-white/60 rounded-md shadow-sm border border-gray-200 cursor-pointer" onClick={() => openModal("employee_profile")}> 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="flex-1">
              <h2 className="text-base font-medium text-gray-800">Employee profile management</h2>
            </div>
            <div className="flex-1 text-sm text-gray-500">
              <div>Let employees edit their info in website/app. We&apos;ll send you an email when any changes are made.</div>
              
              <div className="mt-2 grid grid-cols-1 gap-2">
                <div className="flex justify-between">
                  <div>Personal (legal name, birth date, gender, address, emergency contact, profile photo)</div>
                  <div>On</div>
                </div>
                
                <div className="flex justify-between">
                  <div>Tax withholdings</div>
                  <div>On</div>
                </div>
                
                <div className="flex justify-between">
                  <div>Allow employee to edit direct deposit information</div>
                  <div>On</div>
                </div>
              </div>
              
              <div className="mt-2">
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Learn more</span>
              </div>
            </div>
            <div className="flex items-end justify-end">
              <button className="p-1 text-gray-400 hover:text-gray-600" onClick={e => { e.stopPropagation(); openModal("employee_profile"); }}>
                <Pencil size={16} />
              </button>
            </div>
          </div>
        </div> */}

        {/* Shared Data */}
        {/* <div className="bg-white/60 rounded-md shadow-sm border border-gray-200 cursor-pointer" onClick={() => openModal("shared_data")}> 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="flex-1">
              <h2 className="text-base font-medium text-gray-800">Shared Data</h2>
            </div>
            <div className="flex-1 text-sm text-gray-500">
              <div>Allow employees to import W-2 data into turbo tax</div>
              
              <div className="mt-2 grid grid-cols-1 gap-2">
                <div className="flex justify-between">
                  <div>Include Automated income and employment verification service powered by the work number from Equifax</div>
                </div>
                
                <div className="flex justify-between">
                  <div>Include automated income and employment verification service powered by the work number from Equifax</div>
                  <div>On</div>
                </div>
              </div>
              
              <div className="mt-2">
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Learn more</span>
              </div>
            </div>
            <div className="flex items-end justify-end">
              <span className="text-sm text-gray-500 mr-4">On</span>
              <button className="p-1 text-gray-400 hover:text-gray-600" onClick={e => { e.stopPropagation(); openModal("shared_data"); }}>
                <Pencil size={16} />
              </button>
            </div>
          </div>
        </div> */}

        {/* Bank Accounts */}
        {/* <div className="bg-white/60 rounded-md shadow-sm border border-gray-200 cursor-pointer" onClick={() => openModal("bank_accounts")}> 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="flex-1">
              <h2 className="text-base font-medium text-gray-800">Bank Accounts</h2>
            </div>
            <div className="flex-1 text-sm text-gray-500">
              <div>Account Number</div>
              <div>Routing Number</div>
            </div>
            <div className="flex items-end justify-end">
              <span className="text-sm text-gray-500 mr-4">No employees enrolled</span>
              <button className="p-1 text-gray-400 hover:text-gray-600" onClick={e => { e.stopPropagation(); openModal("bank_accounts"); }}> 
                <Pencil size={16} />
              </button>
            </div>
          </div>
        </div> */}

        {/* Printing */}
        {/* <div className="bg-white/60 rounded-md shadow-sm border border-gray-200 cursor-pointer" onClick={() => openModal("printing")}> 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="flex-1">
              <h2 className="text-base font-medium text-gray-800">Printing</h2>
            </div>
            <div className="flex-1 text-sm text-gray-500">
              Paychecks and pay stubs
            </div>
            <div className="flex items-end justify-end">
              <span className="text-sm text-gray-500 mr-4">Pay stubs only</span>
              <button className="p-1 text-gray-400 hover:text-gray-600" onClick={e => { e.stopPropagation(); openModal("printing"); }}> 
                <Pencil size={16} />
              </button>
            </div>
          </div>
        </div> */}

        {/* Direct Deposit */}
        {/* <div className="bg-white/60 rounded-md shadow-sm border border-gray-200 cursor-pointer" onClick={() => openModal("direct_deposit")}> 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="flex-1">
              <h2 className="text-base font-medium text-gray-800">Direct Deposit</h2>
            </div>
            <div className="flex-1 text-sm text-gray-500">
              Founding time
            </div>
            <div className="flex items-end justify-end">
              <span className="text-sm text-gray-500 mr-4">day</span>
              <button className="p-1 text-gray-400 hover:text-gray-600" onClick={e => { e.stopPropagation(); openModal("direct_deposit"); }}> 
                <Pencil size={16} />
              </button>
            </div>
          </div>
        </div> */}

        {/* Contact Information */}
        {/* <div className="bg-white/60 rounded-md shadow-sm border border-gray-200 cursor-pointer" onClick={() => openModal("contact_info")}> 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <div className="flex-1">
              <h2 className="text-base font-medium text-gray-800">Contact Information</h2>
            </div>
            <div className="flex-1 text-sm text-gray-500">
              Manage primary payroll contact information
            </div>
            <div className="flex items-end justify-end">
              <button className="p-1 text-gray-400 hover:text-gray-600" onClick={e => { e.stopPropagation(); openModal("contact_info"); }}> 
                <Pencil size={16} />
              </button>
            </div>
          </div>
        </div> */}

        {/* Accounting */}
        <SettingRow
          icon={<Calculator />}
          tone="success"
          title="Accounting"
          desc="Choose how payroll transactions are mapped"
          href="/dashboard/hris/payroll/accounting_preference"
        />
      </div>

      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        width={560}
        icon={<MapPin />}
        title="Work Locations"
        sub="Add and manage where your team works"
      >
        <WorkLocationModal setIsOpen={setIsOpen} />
      </Drawer>
    </div>
  );
};

export default PayrollSettingsComponent;
