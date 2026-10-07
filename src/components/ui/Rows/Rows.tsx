import React from 'react';

interface RowsProps {
  value: number;
  onChange: (value: number) => void;
}

const Rows: React.FC<RowsProps> = ({ value, onChange }) => {
  console.log("🚀 ~ value:", value)
  return (
    <div className="mt-3 flex items-center gap-x-4">
      <h3 className="font-bold text-[#7E84A3]">Rows</h3>
      <select
        className="rounded-lg focus:outline-none"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        <option value="10">10</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  );
};

export default Rows;
