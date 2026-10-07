import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  children: React.ReactNode;
  required?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  value,
  onChange,
  className,
  children,
  required,
}) => {
  return (
    <div className="relative w-full">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full cursor-pointer appearance-none bg-white pr-9 focus:outline-none ${className || ''}`}
        required={required}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-v-ink400" />
    </div>
  );
};

export default CustomSelect;
