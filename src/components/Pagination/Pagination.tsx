import React from "react";
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  handlePageChange,
  totalItems,
}) => {
  const pageNumbers: (number | string)[] = [];
  const pageLimit = 10;

  // Calculate the range of items on the current page
  const itemsPerPage = 10; // Define the number of items per page
  const startItem = (currentPage - 1) * itemsPerPage + 1; // The first item on the page
  const endItem = Math.min(currentPage * itemsPerPage, totalItems); // The last item on the page (cannot exceed totalItems)

  // Generate the pagination numbers
  if (totalPages <= pageLimit) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    const startPage = Math.max(1, currentPage - Math.floor(pageLimit / 2));
    const endPage = Math.min(totalPages, startPage + pageLimit - 1);
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push("...");
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }
  }

  return (
    <div className="mx-auto mt-6 w-full items-center justify-between px-4 md:flex">
      <div className="flex w-full items-center">
        <label htmlFor="itemsPerPage" className="mr-2">
          Showing {startItem}–{endItem} from {totalItems}
        </label>
      </div>
      <div className="mx-auto mt-4 flex w-full items-center justify-center md:mt-0 md:justify-end">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          className="mr-2 rounded-lg bg-[#E6E9F4] px-3 py-1 text-[#7E84A3]"
          disabled={currentPage === 1}
        >
          <BiSolidLeftArrow />
        </button>
        {pageNumbers.map((pageNumber, index) => (
          <button
            key={index}
            onClick={() =>
              typeof pageNumber === "number" && handlePageChange(pageNumber)
            }
            className={`mx-1 rounded-lg px-3 py-1 ${
              pageNumber === currentPage
                ? "bg-[#9598FE] text-white"
                : "bg-[#E6E9F4] px-4 py-[10px] text-sm font-semibold text-[#7E84A3]"
            } `}
            disabled={typeof pageNumber === "string"}
          >
            {pageNumber}
          </button>
        ))}
        <button
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          className="ml-2 rounded-lg bg-[#E6E9F4] px-3 py-1 text-[#7E84A3]"
          disabled={currentPage === totalPages}
        >
          <BiSolidRightArrow />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
