interface Item {
  id: string;
  first_name: string;
  last_name: string;
  type: 'Customer' | 'Supplier';
}

interface ListResponse {
  data?: {
    results?: Item[];
  };
}

interface Row {
  account?: string;
  description?: string;
  name?: string;
  amount: string;
  tax: string;
  taxRate?: string;
  totalAmount?: string;
  titleCtg?: string;
  noteCtg?: string;
  titleItem?: string;
  noteItem?: string;
  location?: string;
  debit?: string;
  credit?: string;
}

interface MergedDropdownInputProps {
  index: number;
  handleAccountInputChange: (index: number, field: keyof Row, value: string | undefined) => void;
  customerList: ListResponse;
  supplierList: ListResponse;
  searchTerm: { [key: number]: string };
  setSearchTerm: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>;
  handleOptionSelect: (index: number, value: string, type: string) => void; // Add this prop
}

import React, { useState } from 'react';

const MergedDropdownInput: React.FC<MergedDropdownInputProps> = ({
  index,
  handleAccountInputChange,
  customerList,
  supplierList,
  searchTerm,
  setSearchTerm,
  handleOptionSelect // Destructure the prop here
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const mergedData: Item[] = [
    ...(customerList?.data?.results?.map(item => ({...item, type: 'Customer' as const})) || []),
    ...(supplierList?.data?.results?.map(item => ({...item, type: 'Supplier' as const})) || [])
  ];

  const handleOptionSelectInternal = (index: number, value: string, type: string): void => {
    handleOptionSelect(index, value, type); // Use the passed function
    setDropdownOpen(false);
    setSearchTerm((prevState) => ({ ...prevState, [index]: value }));
  };

  const filteredData = mergedData.filter(item => 
    `${item.first_name} ${item.last_name}`.toLowerCase().includes((searchTerm[index]?.toLowerCase() || ""))
  );

  return (
    <div className="border-b bg-transparent relative">
      <input
        type="text"
        placeholder="Name"
        className="h-full w-24 border-b-gray-300 bg-transparent px-2 outline-none hover:border-b-2 hover:border-accent_soft_blue"
        value={searchTerm[index] || ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          handleAccountInputChange(index, "name", e.target.value);
          setDropdownOpen(true);
        }}
        onFocus={() => setDropdownOpen(true)}
      />
      
      {dropdownOpen && (
        <div className="absolute left-0 z-20 mt-1 w-64 rounded-md border bg-white px-4 py-2 shadow-lg">
          {/* <div className="flex justify-center">
            <button
              onClick={() => alert("Add new functionality goes here")}
              className="mb-4 py-2 font-medium text-accent_soft_blue"
            >
              + Add New
            </button>
          </div> */}

          <div className="h-72 space-y-2 overflow-y-auto">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOptionSelectInternal(index, `${item.first_name} ${item.last_name}`, item.type)}
                  className="cursor-pointer rounded-lg border-b p-2 hover:bg-accent_gray_200"
                >
                  <div className="flex items-center justify-between">
                    <p>{`${item.first_name} ${item.last_name}`}</p>
                    <span className="text-xs text-gray-500">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text py-8 text-center text-[0.9rem]">
                No results found!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MergedDropdownInput;