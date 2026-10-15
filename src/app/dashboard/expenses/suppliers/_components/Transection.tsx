import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { GoGear } from "react-icons/go";
import ModalSM, { handleOpenModalSM } from "@/components/ModalSM/ModalSM";
import { CiFilter } from "react-icons/ci";
import { LuPrinter } from "react-icons/lu";
import { SlArrowDown } from "react-icons/sl";
import PaginationComponent from "@/components/Pagination/Pagination";
import Pagination from "@/components/Pagination/Pagination";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { FetchData } from "@/services/company";
import GetToken from "@/hooks/getToken";
import * as XLSX from "xlsx";
import { BsPrinter } from "react-icons/bs";
import { RiFileExcel2Line } from "react-icons/ri";

interface Expense {
  id: number;
  date: string;
  type: string;
  Transaction: string;
  total: string;
  status: string;
  is_bill: boolean;
}

interface FilterState {
  date: boolean;
  type: boolean;
  Transaction: boolean;
  Amount: boolean;
  status: boolean;
}

const initialFilters: FilterState = {
  date: true,
  type: true,
  Transaction: true,
  Amount: true,
  status: true,
};

const TransactionTable = ({ supplierId }: { supplierId: string }) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<string>("Date Last 12 Month");
  const [data, setData] = useState<Expense[]>([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [category, setCategory] = useState("");
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentItem, setCurrentItem] = useState<Expense | null>(null);
  const [dropdownOpenSupplier, setDropdownOpenSupplier] = useState(false);
  const [searchTermSupplier, setSearchTermSupplier] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modal, setModal] = useState<string | null>("");
  const [selectedType, setSelectedType] = useState<string>("All Transaction");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const router = useRouter();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const gearButtonRef = useRef<HTMLParagraphElement>(null);
  const [activeItemId, setActiveItemId] = useState<string | null | number>(
    null,
  );
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isClient, setIsClient] = useState(false);
  const token = GetToken();

  // Fetch transactions
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["supplier_transactions", supplierId, currentPage],
    queryFn: async () => {
      const response = await FetchData(
        `we/suppliers/${supplierId}/transactions?page=${currentPage}`,
        token,
      );
      setTotalPages(Math.ceil(response.count / itemsPerPage));
      return response.results;
    },
    
  });

  useEffect(() => {
    if (transactions) {
      setData(transactions);
    }
  }, [transactions]);

  // Toggle popup visibility
  const togglePopup = () => {
    setIsPopupVisible((prev) => !prev);
    setActiveItemId(null);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside both popup and gear button
      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        gearButtonRef.current &&
        !gearButtonRef.current.contains(target)
      ) {
        setIsPopupVisible(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const itemsPerPage = localStorage.getItem("itemsPerPage");
    const currentPage = localStorage.getItem("currentPage");
    const totalPages = localStorage.getItem("totalPages");
    if (itemsPerPage) {
      setItemsPerPage(Number(itemsPerPage));
    }
    if (currentPage) {
      setCurrentPage(Number(currentPage));
    }
    if (totalPages) {
      setTotalPages(Number(totalPages));
    }
  }, []);

  // Set client-side flag to true after mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load saved filters from localStorage on the client side only
  useEffect(() => {
    if (isClient) {
      const savedFilters = localStorage.getItem("supplierDeteles");
      if (savedFilters) {
        setFilters(JSON.parse(savedFilters));
      }
    }
  }, [isClient]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("supplierDeteles", JSON.stringify(filters));
      localStorage.setItem("itemsPerPage", itemsPerPage.toString());
      localStorage.setItem("currentPage", currentPage.toString());
      localStorage.setItem("totalPages", totalPages.toString());
    }
  }, [filters, itemsPerPage, currentPage, totalPages, isClient]);

  const options = [
    {
      label: "Unapplied Cash Bill Payment Expense",
      currency: "USD",
      type: "(Expenses)",
    },
    { label: "Uncategorized Expense", currency: "USD", type: "(Expenses)" },
    {
      label: "Uncategorized Expense",
      currency: "USD",
      type: "(Sub-account of uncate)",
    },
    { label: "Water Bill Dhk", currency: "USD", type: "(Expenses)" },
  ];
  const filteredOptionsSupplier = options.filter((option) =>
    option.label.toLowerCase().includes(searchTermSupplier.toLowerCase()),
  );
  const handleViewClick = (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    value: string,
    item: Expense,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({ x: rect.left, y: rect.bottom });
    setPopupVisible(!popupVisible);
    setCategory(value);
    setCurrentItem(item);
    setActiveItemId(activeItemId === item.id ? null : item.id);
  };

  const handleGearChange = (filterKey: keyof FilterState) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: !prevFilters[filterKey],
    }));
  };
  const deleteRow = () => {
    if (currentItem) {
      setData((prevData) =>
        prevData.filter((row) => row.id !== currentItem.id),
      );
      closePopup();
    }
  };

  const closePopup = () => {
    setPopupVisible(false);
  };

  const modalFunction = (value: string): void => {
    setModal(value);
    handleOpenModalSM();
  };
  const printTable = () => {
    if (tableRef.current) {
      const selectedData = selectedItems
        .map((id) => {
          const row = tableRef.current?.querySelector(`tr[data-id="${id}"]`);
          return row ? row.outerHTML : "";
        })
        .join("");

      const printWindow = window.open("", "", "height=600,width=800");
      if (printWindow) {
        printWindow.document.write("<html><head><title>Print</title>");
        printWindow.document.write("</head><body>");
        printWindow.document.write("<h1>Selected Items</h1>");
        printWindow.document.write("<table>");
        printWindow.document.write(selectedData);
        printWindow.document.write("</table>");
        printWindow.document.write("</body></html>");
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }
  };
  // add Paigination

  const totalItems = data.length;
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const Route = (): void => {
    const path = category.toLowerCase().split(" ");
    const newpath = path[0];
    router.push(`/dashboard/bill/${newpath}`);
  };
  const TableData = currentData.filter((expense) => {
    const currentDate = new Date();
    const expenseDate = new Date(expense.date);
    let dateMatch = true;

    switch (selectedDateFilter) {
      case "This Week":
        const startOfWeek = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay()),
        );
        dateMatch = expenseDate >= startOfWeek;
        break;
      case "Previous Week":
        const startOfPrevWeek = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay() - 7),
        );
        const endOfPrevWeek = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay() - 1),
        );
        dateMatch =
          expenseDate >= startOfPrevWeek && expenseDate <= endOfPrevWeek;
        break;
      case "This Month":
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
        );
        dateMatch = expenseDate >= startOfMonth;
        break;
      case "Previous Month":
        const startOfPrevMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1,
        );
        const endOfPrevMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0,
        );
        dateMatch =
          expenseDate >= startOfPrevMonth && expenseDate <= endOfPrevMonth;
        break;
      case "This Year":
        const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
        dateMatch = expenseDate >= startOfYear;
        break;
      case "Previous Year":
        const startOfPrevYear = new Date(currentDate.getFullYear() - 1, 0, 1);
        const endOfPrevYear = new Date(currentDate.getFullYear(), 0, 0);
        dateMatch =
          expenseDate >= startOfPrevYear && expenseDate <= endOfPrevYear;
        break;
      case "All Transaction":
        dateMatch = true;
        break;
      default:
        dateMatch = true;
        break;
    }

    return dateMatch;
  });
  const isAllSelected =
    TableData?.length > 0 && selectedItems.length === TableData.length;

  const handleCheckboxChange = (id: number) => {
    setSelectedItems(
      (prev) =>
        prev.includes(id)
          ? prev.filter((itemId) => itemId !== id) // Remove item if selected
          : [...prev, id], // Add item if not selected
    );
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]); // Unselect all
    } else {
      const allIds = TableData.map((row: any) => row.id);
      setSelectedItems(allIds); // Select all
    }
  };
  const toggleDropdown = () => {
    if (selectedItems.length > 0) {
      setDropdownOpen(!isDropdownOpen); // Toggle the dropdown if items are selected
    }
  };

  const printSelectedRows = () => {
    if (selectedItems.length === 0) {
      alert("No Row Selected for Print");
      return;
    }
  
    const printWindow = window.open("", "", "height=620px,width:870px");
    if (printWindow) {
      printWindow.document.write("<html><head><title>Transactions - Pilucent</title>");
      printWindow.document.write('</head><body style="font-family: sans-serif;">');
      printWindow.document.write('<h1 style="text-align:center; margin-bottom:16px;">Transaction List</h1>');
      printWindow.document.write('<table border="1" style="border-collapse: collapse; width: 100%; text-align: center;">');
      printWindow.document.write("<thead><tr>");
      if (filters.date) printWindow.document.write("<th>Date</th>");
      if (filters.type) printWindow.document.write("<th>Type</th>");
      if (filters.Transaction) printWindow.document.write("<th>Transaction</th>");
      if (filters.Amount) printWindow.document.write("<th>Amount</th>");
      if (filters.status) printWindow.document.write("<th>Status</th>");
      printWindow.document.write("</tr></thead>");
      printWindow.document.write("<tbody>");
  
      selectedItems.forEach((id) => {
        const row = data.find((item) => item.id === id);
        if (row) {
          printWindow.document.write("<tr>");
          if (filters.date) printWindow.document.write(`<td>${row.date}</td>`);
          if (filters.type) printWindow.document.write(`<td>${row.type}</td>`);
          if (filters.Transaction) printWindow.document.write(`<td>${row.is_bill ? "Bill" : "N/A"}</td>`);
          if (filters.Amount) printWindow.document.write(`<td>${row.total}</td>`);
          if (filters.status) printWindow.document.write(`<td>${row.status}</td>`);
          printWindow.document.write("</tr>");
        }
      });
  
      printWindow.document.write("</tbody></table>");
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
    }
  };
  
  const generateExcel = () => {
    const selectedData = selectedItems.map((id) => data.find((item) => item.id === id)).filter(Boolean);
    if (!selectedData || selectedData.length === 0) {
      return alert("Select Row To Download Excel File");
    }
  
    const worksheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaction List");
    XLSX.writeFile(workbook, "transaction_list.xlsx");
  };
  

  return (
    <>
      <div className="mt-10 flex justify-between">
        <div className="flex items-center gap-x-4">
          <h1 className="text-2xl font-medium">Transaction List</h1>
        </div>
        <div className="flex items-center gap-x-2">
          <label className="input input-bordered flex h-[48px] w-[252px] items-center gap-2 rounded-[30px] border border-gray-300 focus-within:border-[#2684FF] focus-within:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 shrink-0 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
            <input type="text" className="flex-grow" placeholder="Search" />
          </label>
          <p>
            <CiFilter
              className="cursor-pointer text-[24px] text-[#7E84A3]"
              onClick={() => modalFunction("Filter")}
            />
          </p>

          <div className="relative inline-block text-left">
            {/* Printer Icon with Down Arrow */}
            <div
              className="border-1 flex h-[48px] w-[56px] cursor-pointer items-center justify-center gap-x-1 border px-1 text-[24px]"
              onClick={toggleDropdown}
              style={{
                pointerEvents: selectedItems.length === 0 ? "none" : "auto", // Disable click when no items selected
              }}
            >
              <LuPrinter
                className={`${selectedItems.length === 0 ? "text-gray-400" : "text-gray-500"}`}
              />
              {selectedItems.length > 0 && (
                <SlArrowDown
                  className={`${isDropdownOpen ? "rotate-180" : ""} h-4 w-4 text-gray-500 transition-transform`}
                />
              )}
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 z-10 mt-2 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <ul className="py-1 text-sm text-gray-700">
                  <li
                    className="flex cursor-pointer items-center justify-center px-4 py-2 hover:bg-gray-100"
                    onClick={printSelectedRows}
                  >
                    <BsPrinter className="text-2xl text-[#7E84A3]" />
                  </li>
                  <li
                    className="flex cursor-pointer items-center justify-center px-4 py-2 hover:bg-gray-100"
                    onClick={generateExcel}
                  >
                    <RiFileExcel2Line className="text-2xl text-[#7E84A3]" />
                  </li>
                </ul>
              </div>
            )}
            
          </div>
          <div className="relative inline-block text-left">
            {/* Trigger Button */}
            <p
              ref={gearButtonRef}
              className="cursor-pointer"
              onClick={togglePopup}
            >
              <GoGear className="text-[24px] text-[#7E84A3]" />
            </p>

            {/* Popup Content */}
            {isPopupVisible && (
              <div
                ref={popupRef}
                className="absolute -left-36 z-10 mt-5 w-[150px] rounded-xl bg-white p-4 shadow-md"
              >
                {/* Filter checkboxes */}
                <div>
                  {Object.keys(filters).map((filterKey) => (
                    <div key={filterKey} className="flex items-center py-1">
                      <input
                        type="checkbox"
                        className="form-checkbox mr-2 h-5 w-5 text-indigo-600"
                        checked={filters[filterKey as keyof FilterState]} // Correctly access the filter key
                        onChange={
                          () => handleGearChange(filterKey as keyof FilterState) // Correctly type the key
                        }
                      />
                      <label className="capitalize text-gray-700">
                        {filterKey}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Items per page selection */}
                <div className="mt-10 flex items-center gap-x-4">
                  <div>
                    <select
                      id="items-per-page"
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="rounded border border-gray-300 px-2 py-1"
                    >
                      <option value={5}>05</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                  <div>
                    {/* <span>
                Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} from{" "}
                {totalItems}
              </span> */}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {TableData.length === 0 ? (
        <div className="mt-10 text-center text-gray-500">No Transaction Found!</div>
      ) : (
        <table ref={tableRef} className="table mt-5 w-full">
          <thead className="bg-[#F0F1F3] uppercase text-[#5A607F]">
            <tr>
              <th>
                <label>
                  <input
                    type="checkbox"
                    className="checkbox-check h-[20px] w-[20px] rounded-[4px] border-[#DFE4EA] bg-[#F0F1F3]"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </label>
              </th>
              {filters.date && <th className="text-center">Date</th>}
              {filters.type && <th className="text-center">type</th>}
              {filters.Transaction && (
                <th className="text-center">Transaction</th>
              )}
              {filters.Amount && <th className="text-center">Amount</th>}
              {filters.status && <th className="text-center">Status</th>}
              <th className="flex justify-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white text-[#7E84A3]">
            {TableData?.map((row) => (
              <tr key={row.id}>
                <th>
                  <label>
                    <input
                      type="checkbox"
                      className="checkbox-check h-[20px] w-[20px] rounded-[4px] border-[#DFE4EA] bg-[#F0F1F3]"
                      checked={selectedItems.includes(row.id)}
                      onChange={() => handleCheckboxChange(row.id)}
                    />
                  </label>
                </th>
                {filters.date && <th className="text-center whitespace-pre">{row.date}</th>}
                {filters.type && <td className="text-center">{row.type}</td>}
                {filters.Transaction && (
                  <td className="text-center">{row.is_bill ? "Bill" : "N/A"}</td>
                )}
                {filters.Amount && <td className="text-center">{row.total}</td>}
                {filters.status && (
                  <td className="">
                    {" "}
                    <div
                      className={`px-2 py-1 text-center font-semibold capitalize ${row.status === "paid" ? "bg-[#ECFFF1] text-[#40947E]" : "bg-[#ECFFF1] text-yellow-400"} `}
                    >
                      {row.status}
                    </div>
                  </td>
                )}
                <th className="relative">
                  {row.status === "paid" ? (
                    <span
                      className="flex cursor-pointer items-center justify-center gap-x-2 text-blue-500"
                      onClick={(e) => handleViewClick(e, "bill", row)}
                    >
                      Edit{" "}
                      <SlArrowDown
                        className={`${activeItemId === row.id ? "rotate-180" : ""}`}
                      />
                    </span>
                  ) : (
                    <p
                      className="flex cursor-pointer items-center justify-center gap-x-2 text-blue-500"
                      onClick={(e) => handleViewClick(e, "bill", row)}
                    >
                      Received Payment{" "}
                      <SlArrowDown
                        className={`${activeItemId === row.id ? "rotate-180" : ""}`}
                      />
                    </p>
                  )}
                  {activeItemId === row.id && (
                    <div
                      className="absolute right-[30px] top-10 z-10 w-[200px] overflow-hidden rounded-xl border bg-white px-4 py-3"
                      onClick={(e) => e.stopPropagation()} // Prevent clicks inside this div from propagating
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Stops triggering outside click logic
                        }}
                        type="button"
                        className="block w-full border-b-2 pb-2 text-left font-normal leading-6 text-accent_text_gray"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        type="button"
                        className="block w-full border-b-2 pb-2 text-left font-normal leading-6 text-accent_text_gray"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination
        totalItems={totalItems}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={(currentPage) => setCurrentPage(currentPage)}
      />
      <ModalSM title="" edit={false} w="w-[300px]">
        {modal === "Column" && (
          <div>
            {/* Filter checkboxes */}
            {Object.keys(filters).map((filterKey) => (
              <div key={filterKey} className="flex items-center py-1">
                <input
                  type="checkbox"
                  className="form-checkbox mr-2 h-5 w-5 text-indigo-600"
                  checked={filters[filterKey as keyof FilterState]}
                  onChange={() =>
                    handleGearChange(filterKey as keyof FilterState)
                  }
                />
                <label className="capitalize text-gray-700">{filterKey}</label>
              </div>
            ))}
            <div className="mt-10 flex items-center gap-x-4">
              <div>
                <select
                  id="items-per-page"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="rounded border border-gray-300 px-2 py-1"
                >
                  <option value={5}>05</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
              <div>
                <span>
                  Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} from{" "}
                  {totalItems}
                </span>
              </div>
            </div>
          </div>
        )}
        {modal === "Filter" && (
          <div className="px-[22px] py-[27px]">
            <p className="leading-5">Status</p>
            <select
              className="select select-bordered mt-1 h-[42px] w-full"
              // value={selectedType}
              // onChange={handleTypeChange}
            >
              <option>All Status</option>
              <option>Open</option>
              <option>OverDue</option>
              <option>Paid</option>
            </select>
            <p className="mt-2 leading-5">Delivery method</p>
            <select className="select select-bordered mt-1 h-[42px] w-full">
              <option>Any</option>
              <option>Print Later</option>
            </select>
            <p className="mt-2 leading-5">Date</p>
            <select className="select select-bordered mt-1 h-[42px] w-full">
              <option>All Transaction</option>
              <option>This Week</option>
              <option>Previous</option>
              <option>This Month</option>
              <option>This Year</option>
              <option>Previous Year</option>
            </select>
            <div className="mt-2 flex w-full gap-x-2">
              <div className="w-full">
                <p className="leading-5">Form</p>
                <input
                  type="date"
                  className="h-[42px] w-full rounded-md border-[3px] p-2"
                />
              </div>
              <div className="w-full">
                <p className="leading-5">To</p>
                <input
                  type="date"
                  className="h-[42px] w-full rounded-md border-[3px] p-2"
                />
              </div>
            </div>
            <p className="mt-2 leading-5">Payee</p>
            <select className="select select-bordered mt-1 h-[42px] w-full">
              <option selected disabled>
                Select
              </option>
              <option className="text-blue-400">+ Add New</option>
              <option className="flex w-full justify-between">
                Shaharia <span className="">(Supplier)</span>
              </option>
              <option className="flex w-full justify-between">
                Kamrul <span>Customer</span>
              </option>
            </select>
            <p className="mt-2 leading-5">Category</p>

            {/* Add Items Hare */}
            <div className="relative w-full">
              <div
                className="select select-bordered flex h-[42px] w-full cursor-pointer items-center"
                onClick={() => setDropdownOpenSupplier(!dropdownOpenSupplier)}
              >
                {selectedSupplier || "Select a Category"}
              </div>
              {dropdownOpenSupplier && (
                <div className="absolute z-10 mt-1 w-[460px] rounded border bg-white shadow-lg">
                  <div className="p-2">
                    <input
                      type="text"
                      className="w-full rounded border border-gray-300 px-3 py-2"
                      placeholder="Search supplier"
                      value={searchTermSupplier}
                      onChange={(e) => setSearchTermSupplier(e.target.value)}
                    />
                  </div>
                  <div
                    className="cursor-pointer px-2 py-2 text-blue-500 hover:bg-gray-100"
                    // onClick={() => modalFunction('Add to Supplier')}
                  >
                    + Add New
                  </div>
                  <ul className="max-h-60 overflow-auto">
                    {filteredOptionsSupplier.length > 0 ? (
                      filteredOptionsSupplier
                        .filter((option) =>
                          option.label
                            .toLowerCase()
                            .includes(searchTermSupplier.toLowerCase()),
                        )
                        .map((option, index) => (
                          <li
                            key={index}
                            className="flex cursor-pointer items-center justify-between px-2 py-2 hover:bg-gray-100"
                            onClick={() => {
                              setSelectedSupplier(
                                `${option.label} - ${option.currency}`,
                              );
                              setDropdownOpenSupplier(false);
                              setSearchTermSupplier("");
                            }}
                          >
                            <span>{option.label}</span>
                            <span>{`${option.currency} ${option.type}`}</span>
                          </li>
                        ))
                    ) : (
                      <li className="px-2 py-2 text-gray-500">
                        No options found
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            <div>
              <div className="mt-5 flex justify-center space-x-4 py-14">
                <button
                  // onClick={handleGoBack}
                  className="h-[45px] w-[142px] rounded-lg border border-blue-500 text-sm font-medium text-blue-500"
                >
                  Cancel
                </button>
                <button className="h-[45px] w-[142px] rounded-lg bg-[#00035F] text-sm font-medium text-white">
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalSM>
    </>
  );
};
export default TransactionTable;
