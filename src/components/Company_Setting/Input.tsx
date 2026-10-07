import React from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField = ({ label, name, value, onChange }: InputFieldProps) => (
  <div>
    <label className="block text-sm text-gray-600">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded border-gray-300 border p-2 focus:outline-none"
    />
  </div>
);

export default InputField;