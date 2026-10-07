import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/app/redux/store';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/app/helpers/api';
import { IoIosArrowDown } from 'react-icons/io';

const RoleSelectDropdown = ({
  required = true,
  value,
  setValue,
  ClassName = '',
  disabled = false,
  parentClassName = '',
}: {
  required?: boolean;
  value: any;
  setValue: any;
  disabled?: boolean;
  ClassName?: string;
  parentClassName?: string;
}) => {
  const { Company } = useAppSelector((state) => state.CompanyData);
  const [isOpen, setIsOpen] = useState(false);
  const DropDownRef = useRef<any>(null);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [''],
    queryFn: async () => {
      const response = await get(`/adminio/users-roles/${Company?.uid}`);
      return response;
    },
    refetchOnWindowFocus: false,
    enabled: isOpen,
  });

  const handleSelectItem = (item: any) => {
    // setSelectedItem(valueFormatter(item));
    setValue(item);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (DropDownRef.current && !DropDownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div ref={DropDownRef} className={`relative w-full flex-1 ${parentClassName}`}>
        <input
          disabled={disabled}
          type="text"
          placeholder={'Select Role'}
          value={value?.name || ''}
          onFocus={() => setIsOpen(true)}
          required={required}
          className={`w-full flex-1 cursor-pointer bg-transparent px-6 py-2 outline-none focus:caret-transparent ${ClassName}`}
        />

        <IoIosArrowDown
          className={`${isOpen ? 'rotate-[180deg]' : 'rotate-0'} absolute right-3 top-[50%] translate-y-[-50%] transform text-[1.3rem] text-gray-500 transition-all duration-300`}
        />

        {isOpen && (
          <div className="absolute left-0 z-20 mt-1 w-full rounded-md border bg-white px-4 py-2 shadow-lg">
            <div className="h-72 space-y-2 overflow-y-auto">
              <ul
                className={`${isOpen ? 'z-20 translate-y-0 opacity-100' : 'z-[-1] translate-y-[-5px] opacity-0'} absolute right-0 top-2 flex max-h-80 w-full flex-col overflow-y-auto rounded bg-white py-1 duration-500`}
              >
                {data?.map((item: any, idx: number) => (
                  <li
                    key={idx}
                    className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm text-[#5A607F] hover:bg-gray-100"
                    onClick={() => {
                      handleSelectItem(item);
                      setIsOpen(false);
                    }}
                  >
                    {item?.name}
                  </li>
                ))}
                {!isPending && !data?.length && (
                  <li className="cursor-pointer px-3 py-2 text-center text-sm text-accent_soft_blue hover:bg-gray-100">
                    No Item Found!
                  </li>
                )}
                {isPending && (
                  <li className="cursor-pointer px-3 py-2 text-center text-sm text-accent_soft_blue hover:bg-gray-100">
                    Loading...
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RoleSelectDropdown;

export const MultipleRoleSelectDropdown = ({
  show = 3,
  required = true,
  value = [],
  setValue,
  ClassName = '',
  disabled = false,
  parentClassName = '',
  kind = '',
}: {
  show?: number;
  required?: boolean;
  value: any[];
  setValue: any;
  disabled?: boolean;
  ClassName?: string;
  parentClassName?: string;
  kind?: 'EMPLOYEE' | 'USER' | '';
}) => {
  const { Company } = useAppSelector((state) => state.CompanyData);
  const [isOpen, setIsOpen] = useState(false);
  const DropDownRef = useRef<any>(null);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: [''],
    queryFn: async () => {
      const response = await get(`/adminio/users-roles-slim/${Company?.uid}?kind=${kind}`);
      return response;
    },
    refetchOnWindowFocus: false,
    enabled: isOpen,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (DropDownRef.current && !DropDownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div ref={DropDownRef} className={`relative w-full flex-1 ${parentClassName}`}>
        <input
          disabled={disabled}
          type="text"
          placeholder={'Select Role'}
          value={
            value
              ?.slice(0, show)
              .map((item: any) => item?.name)
              .join(', ') + " " + (value?.length > show ? `+${value?.length - show} more` : '') || ''
          }
          onFocus={() => setIsOpen(true)}
          required={required}
          className={`w-full flex-1 cursor-pointer bg-transparent px-6 py-2 outline-none focus:caret-transparent ${ClassName}`}
        />

        <IoIosArrowDown
          className={`${isOpen ? 'rotate-[180deg]' : 'rotate-0'} absolute right-3 top-[50%] translate-y-[-50%] transform text-[1.3rem] text-gray-500 transition-all duration-300`}
        />

        {isOpen && (
          <div className="absolute left-0 z-20 mt-1 w-full rounded-md border bg-white px-4 py-2 shadow-lg">
            <div className="h-72 space-y-2 overflow-y-auto">
              <ul
                className={`${isOpen ? 'z-20 translate-y-0 opacity-100' : 'z-[-1] translate-y-[-5px] opacity-0'} absolute right-0 top-2 flex max-h-80 w-full flex-col overflow-y-auto rounded bg-white py-1 duration-500`}
              >
                {data?.results?.map((item: any, idx: number) => (
                  <li
                    key={idx}
                    style={{
                      backgroundColor: value.some((v: any) => v.uid === item.uid)
                        ? '#00000020'
                        : 'transparent',
                    }}
                    className="mb-1 flex cursor-pointer items-center justify-between px-3 py-2 text-sm text-[#5A607F] hover:bg-gray-100"
                    onClick={() => {
                      if (value.some((v: any) => v.uid === item.uid)) {
                        setValue(value.filter((v: any) => v.uid !== item.uid));
                        return;
                      }
                      setValue([...value, item]);
                      // setIsOpen(false);
                    }}
                  >
                    <span> {item?.name}</span>
                    {/* <span>
                      {value.some((v: any) => v.uid === item.uid) ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 15 15"
                        >
                          <path
                            fill="none"
                            stroke="#000000"
                            d="M4 7.5L7 10l4-5m-3.5 9.5a7 7 0 1 1 0-14a7 7 0 0 1 0 14Z"
                          />
                        </svg>
                      ) : (
                        ''
                      )}
                    </span> */}
                  </li>
                ))}
                {!isPending && !data?.results?.length && (
                  <li className="cursor-pointer px-3 py-2 text-center text-sm text-accent_soft_blue hover:bg-gray-100">
                    No Item Found!
                  </li>
                )}
                {isPending && (
                  <li className="cursor-pointer px-3 py-2 text-center text-sm text-accent_soft_blue hover:bg-gray-100">
                    Loading...
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
