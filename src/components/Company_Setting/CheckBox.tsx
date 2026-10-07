import React from 'react';

interface CheckboxFieldProps {
    label: string;
    name: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
  
  const CheckboxField = ({ label, name, checked, onChange }: CheckboxFieldProps) => (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300"
      />
      <label htmlFor={name} className="text-sm text-gray-600">{label}</label>
    </div>
  );

export default CheckboxField;