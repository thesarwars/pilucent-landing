import { useCallback, useEffect, useRef, useState } from 'react';
interface ColumnFilter {
  punch_date: boolean;
  emp_code: boolean;
  emp_name: boolean;
  dt_join: boolean;
  designation: boolean;
  department: boolean;
  section: boolean;
  device_no: boolean;
  punch_time: boolean;
  punch_in: boolean;
  punch_out: boolean;
}

const DataHistoryTable = () => {
  const [columnFilter, setColumnFilter] = useState<ColumnFilter>({
    punch_date: true,
    emp_code: true,
    emp_name: true,
    dt_join: true,
    designation: true,
    department: true,
    section: true,
    device_no: true,
    punch_time: true,
    punch_in: true,
    punch_out: true,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [isSettingVisible, setIsSettingVisible] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [isPending, setIsPending] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleColumnFilter = (columnName: keyof ColumnFilter) => {
    setColumnFilter((prev) => {
      const UpdatedColumnFilter = { ...prev, [columnName]: !prev[columnName] };
      const FilterString = JSON.stringify(UpdatedColumnFilter);
      localStorage.setItem('punch_data_history_table_filter', FilterString);
      return UpdatedColumnFilter;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fn = () => {
      const getFilter = localStorage.getItem('punch_data_history_table_filter');
      if (getFilter) {
        setColumnFilter(JSON.parse(getFilter));
      }
    };
    fn();
  }, []);

  const handleDateChange = useCallback(
    (dates: { startDate: string | null; endDate: string | null }) => {
      setDateRange(dates);
    },
    []
  ); // Empty dependency array since setDateRange is stable

  const columns: any = [
    { text: 'Punch Date', dataField: 'designationName' },
    { text: 'EMP code', dataField: 'designation' },
    { text: 'DT join', dataField: 'designation' },
    { text: 'Designation name', dataField: 'designation' },
    { text: 'Designation name', dataField: 'designation' },
    { text: 'Department name', dataField: 'status' },
  ];

  // Data mapping
  const currentData = isSearching;
  const currentLoading = isSearching;
  const currentError = isSearching;

  const dataPath = isSearching ? 'searchDesignations.designations' : 'designations.designations';
  const countPath = isSearching ? 'searchDesignations.totalCount' : 'designations.totalCount';
  const currentPagePath = isSearching
    ? 'searchDesignations.currentPage'
    : 'designations.currentPage';
  const totalPagesPath = isSearching ? 'searchDesignations.totalPages' : 'designations.totalPages';

  return (
    <div className="mt-8 rounded-2xl bg-white/60">


      {/* <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold leading-9 text-accent_text_black">
            Punch Data History
          </h2>
          <div className="relative">
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="ml-3 flex items-center gap-[29px]">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex h-12 w-64 max-w-64 items-center gap-1 overflow-hidden rounded-3xl border border-[#D7DBEC] px-6 py-3"
            >
              <button type="submit">
                <FiSearch className="text-2xl text-[#A1A7C4]" />
              </button>
              <input
     
                placeholder="Search"
                type="text"
                className="h-full flex-1 bg-transparent outline-none placeholder:text-[#7E84A3]"
              />
        
            </form>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <PdfExcelDropDown
                  OnExcelClick={() => {}}
                  OnPdfClick={() => {}}
                />

                <div className="relative text-left" ref={dropdownRef}>
                  <Button
                    onClick={() => setIsSettingVisible(!isSettingVisible)}
                    type="button"
                    className="p-0"
                  >
                    <IoSettingsOutline className="text-2xl text-[#7E84A3]" />
                  </Button>

                  {isSettingVisible && (
                    <div className="absolute -left-44 z-50 mt-2">
                      <div className="z-50 flex w-52 gap-4 rounded-xl bg-white/60 px-4 py-2 font-lexend text-[#5A607F] shadow">
                        <div>
                          <h3 className="font-bold text-[#7E84A3]">Columns</h3>
                          <div className="">
                            {Object.keys(columnFilter).map((columnKey, idx) => (
                              <div
                                className="my-1 flex items-center py-1"
                                key={idx}
                              >
                                <Checkbox
                                  value={
                                    columnFilter[
                                      columnKey as keyof typeof columnFilter
                                    ]
                                  }
                                  onChange={() =>
                                    handleColumnFilter(
                                      columnKey as keyof typeof columnFilter,
                                    )
                                  }
                                  labelText={columnKey.split("_").join(" ")}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 w-full overflow-x-auto">
        <Table className="font-lexend">
          <TableHeader className="uppercase">
            <TableRow className="hover:bg-accent_bg_gray">
              <TableHead className="py-5 pl-3">
                <Checkbox
                //   value={isAllSelected}
                //   onChange={handleSelectAllChange}
                />
              </TableHead>
              {columnFilter.punch_date && <TableHead>Punch Date</TableHead>}
              {columnFilter.emp_code && <TableHead>EMP code</TableHead>}
              {columnFilter.emp_name && <TableHead>emp name</TableHead>}
              {columnFilter.dt_join && <TableHead>DT join</TableHead>}{" "}
              {columnFilter.designation && (
                <TableHead>Designation name</TableHead>
              )}
              {columnFilter.department && (
                <TableHead>Department name</TableHead>
              )}
              {columnFilter.section && <TableHead>Section name</TableHead>}
              {columnFilter.device_no && <TableHead>Device No.</TableHead>}
              {columnFilter.punch_time && <TableHead>punch time</TableHead>}
              {columnFilter.punch_in && <TableHead>punch in</TableHead>}
              {columnFilter.punch_out && <TableHead>punch Out</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isPending
              ? ""
              : //   ? Array.from({ length: 5 }).map((_, idx) => (
                //       <TableRow key={idx}>
                //         <TableCell className="w-16 p-3">
                //           <div className="m-2 ml-0 h-full w-full animate-pulse rounded-lg bg-gray-300"></div>
                //         </TableCell>
                //         {columnFilter.date && (
                //           <TableCell className="p-3">
                //             <div className="m-2 h-full w-full animate-pulse rounded-lg bg-gray-300"></div>
                //           </TableCell>
                //         )}
                //         {columnFilter.customer && (
                //           <TableCell className="p-3">
                //             <div className="m-2 h-full w-full animate-pulse rounded-lg bg-gray-300"></div>
                //           </TableCell>
                //         )}
                //         {columnFilter.type && (
                //           <TableCell className="p-3">
                //             <div className="m-2 h-full w-full animate-pulse rounded-lg bg-gray-300"></div>
                //           </TableCell>
                //         )}
                //         {columnFilter.no && (
                //           <TableCell className="p-3">
                //             <div className="m-2 h-full w-full animate-pulse rounded-lg bg-gray-300"></div>
                //           </TableCell>
                //         )}
                //         {columnFilter.memo && (
                //           <TableCell className="p-3">
                //             <div className="m-2 h-full w-full animate-pulse rounded-lg bg-gray-300"></div>
                //           </TableCell>
                //         )}
                //         {columnFilter.amount && (
                //           <TableCell className="p-3">
                //             <div className="m-2 h-full w-full animate-pulse rounded-lg bg-gray-300"></div>
                //           </TableCell>
                //         )}
                //         {columnFilter.status && (
                //           <TableCell className="p-3">
                //             <div className="m-2 h-full w-full animate-pulse rounded-lg bg-gray-300"></div>
                //           </TableCell>
                //         )}

                //         <TableCell className="p-3">
                //           <div className="m-2 h-full w-full animate-pulse rounded-lg bg-gray-300"></div>
                //         </TableCell>
                //       </TableRow>
                //     ))
                Array.from({ length: 5 }).map((sales: any, idx: number) => (
                  <TableRow key={idx}></TableRow>
                ))}
          </TableBody>
        </Table>
      </div> */}
    </div>
  );
};

export default DataHistoryTable;
