'use client';
import { useState, useEffect, type JSX } from 'react';
import { Calendar, DollarSign, Loader2, Mail, Settings } from 'lucide-react';
import { ManualBreadcrumbs } from '@/components/BreadCrumb/BreadCrumb';
import { useFetch } from '@/app/helpers/hooks';
import { fetchPayrollGeneralSettings, postPayrollGeneralSettings } from '@/app/helpers/backend';
import { toast } from '@/lib/ToastService';

const calculationOptions = [
  { value: 'CALENDAR_DAYS', label: 'Calendar Days' },
  { value: 'WORKING_DAYS', label: 'Working Days' },
];
const emailTemplateOptions = [
  { value: 'DEFAULT_TEMPLATE', label: 'Default Template' },
  { value: 'CUSTOM_TEMPLATE', label: 'Custom Template' },
];

export default function PayrollGeneralSettings(): JSX.Element {
  const { data, setQueryParams, isPending, refetch } = useFetch(
    ['generalSettings'],
    fetchPayrollGeneralSettings
  );
  const [isLoading, setIsLoading] = useState(false);

  // Minimal state for clean UI
  const [fields, setFields] = useState({
    payroll_working_days: '',
    is_total_working_days: false,
    max_working_hours: '',
    daily_salary_half_hours: '',
    is_round_total: false,
    is_show_leave_balance: false,
    is_encrypt_salary_slip: false,
    is_salary_slip: false,
    email_template: '',
    is_process_payroll_by_employee: false,
  });

  // Set fields from API response
  useEffect(() => {
    if (data) {
      setFields((prev) => ({
        ...prev,
        ...data,
      }));
    }
  }, [data]);

  const handleChange = (key: string, value: any) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const res = await postPayrollGeneralSettings(fields);
      if (res?.success) {
        toast.success('General settings updated successfully');
      }
    } catch (error) {
      //err
    } finally {
      setIsLoading(false);
    }
  };

  const SettingsSection = ({ icon, title, children }: any) => (
    <div className="mb-8 rounded-xl p-4 shadow">
      {title && (
        <div className="mb-4 flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );

  const FormSelect = ({ label, options, description, value, onChange }: any) => (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <select
        className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select option</option>
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
    </div>
  );

  const CheckboxWithDescription = ({ label, description, checked, onChange }: any) => (
    <div className="mb-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={checked}
          className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          onChange={(e) => onChange(e.target.checked)}
        />
        <label className="block text-sm text-gray-700">{label}</label>
      </div>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <ManualBreadcrumbs
        items={[
          { label: 'HRIS', href: '#' },
          { label: 'General Settings', href: '/dashboard/hris/payroll/general-settings' },
        ]}
        className="mb-5 mt-0"
      />
      <div className="mb-4 rounded-xl border bg-white/60 px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">General Settings</h1>
          <button
            disabled={isLoading}
            className="flex items-center gap-1 rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800"
            onClick={handleSave}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Save'}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div>
            <SettingsSection
              icon={<Calendar className="text-xl text-blue-500" />}
              title="Working Days and Hours"
            >
              <FormSelect
                label="Calculate Payroll Working Days Based On"
                options={calculationOptions}
                value={fields.payroll_working_days}
                onChange={(value: any) => handleChange('payroll_working_days', value)}
              />
              <CheckboxWithDescription
                label="Include holidays in Total no. of working Days"
                description="If enabled, total no. of working days will include holidays, and this will reduce the value of Salary Per Day"
                checked={fields.is_total_working_days}
                onChange={(checked: boolean) => handleChange('is_total_working_days', checked)}
              />
            </SettingsSection>
            <SettingsSection
              icon={<DollarSign className="text-xl text-blue-500" />}
              title="Salary Slip"
            >
              <CheckboxWithDescription
                label="Disable Round Total"
                description="If Checked, hides and disables rounded Total field in Salary Slips"
                checked={fields.is_round_total}
                onChange={(checked: boolean) => handleChange('is_round_total', checked)}
              />
            </SettingsSection>
            <SettingsSection icon={<Mail className="text-xl text-blue-500" />} title="Email">
              <CheckboxWithDescription
                label="Email Salary Slip to Employee"
                description="Emails Salary slip to employee based on preferred email selected in employee"
                checked={fields.is_salary_slip}
                onChange={(checked: boolean) => handleChange('is_salary_slip', checked)}
              />
              <FormSelect
                label="Email Template"
                options={emailTemplateOptions}
                value={fields.email_template}
                onChange={(value: any) => handleChange('email_template', value)}
              />
            </SettingsSection>
            <SettingsSection
              icon={<Settings className="text-xl text-blue-500" />}
              title="Other Settings"
            >
              <CheckboxWithDescription
                label="Process Payroll Accounting Entry based on Employee"
                description="If checked, Payroll Payment will be booked against each employee"
                checked={fields.is_process_payroll_by_employee}
                onChange={(checked: boolean) =>
                  handleChange('is_process_payroll_by_employee', checked)
                }
              />
            </SettingsSection>
          </div>
          {/* Right Column */}
          <div>
            <SettingsSection title="">
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Max working hours against Timesheet
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="0.000"
                  value={fields.max_working_hours}
                  onChange={(e) => handleChange('max_working_hours', e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Fraction of Daily Salary for Half Day
                </label>
                <input
                  type="number"
                  className="w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="0.000"
                  value={fields.daily_salary_half_hours}
                  onChange={(e) => handleChange('daily_salary_half_hours', e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  The Fraction of daily wages to be paid for half-day attendance
                </p>
              </div>
            </SettingsSection>
            <SettingsSection title="">
              <CheckboxWithDescription
                label="Show leave balances in Salary Slip"
                checked={fields.is_show_leave_balance}
                onChange={(checked: boolean) => handleChange('is_show_leave_balance', checked)}
              />
            </SettingsSection>
            <SettingsSection title="">
              <CheckboxWithDescription
                label="Encrypt Salary Slips in Emails"
                description="The Salary slip emailed to the employee will be password protected, the password will be generated based on the password policy."
                checked={fields.is_encrypt_salary_slip}
                onChange={(checked: boolean) => handleChange('is_encrypt_salary_slip', checked)}
              />
            </SettingsSection>
          </div>
        </div>
      </div>
    </div>
  );
}
