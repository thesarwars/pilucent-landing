import AddAccountForm from "@/app/dashboard/transactions/coa_tree/_components/AddAccountForm";
import { handleOpenModalSM } from "@/components/ModalSM/ModalSM";
import GetToken from "@/hooks/getToken";
import { GetData } from "@/services/FetchMethods";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";

const AccountSelect = ({
  cacheKeys=[],
  value,
  onChange,
  filter = "",
  required=true
}: {
  value?: any;
  onChange?: any;
  filter?: any;
  required?:boolean
  cacheKeys?:any[]
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [methods, setMethods] = useState<any[]>([]);
  const token = GetToken();
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const DropDownRef = useRef<any>(null);
  const { data, isPending, refetch } = useQuery({
    queryKey: ["deposit_to_invoice", filter, page, ...cacheKeys],
    queryFn: async () => {
      const response = await GetData(
        `we/chart-of-accounts?page=${page}&status=ACTIVE&${filter}`,
        token,
      );
      // console.log(response);
      if (response.next == null) {
        setHasMore(false);
      }
      if (!response?.detail) {
        setMethods((prev) => [...prev, ...response.results]);
      }
      setIsLoading(false);
      return response;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isMounted) {
      setMethods([]);
      setHasMore(true);
      setPage(1);
      refetch();
    } else {
      setIsMounted(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  // console.log(data);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        DropDownRef.current &&
        !DropDownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div ref={DropDownRef} className="custom-select relative flex-1">
        <input
          type="text"
          placeholder="Select An Account"
          value={value?.title}
          // onChange={(e) => setSearchTerms(e.target.value)}
          onFocus={() => setIsOpen(true)}
          //   onBlur={handleBlur}
          className={`w-full flex-1 border bg-transparent px-6 py-2 rounded-md outline-none border-[#A1A7C4] focus:border-[#A1A7C4]`}
          readOnly
          required={required}
        />

        <IoIosArrowDown
          className={`${isOpen ? "rotate-[180deg]" : "rotate-0"} absolute right-3 top-[50%] translate-y-[-50%] transform text-[1.3rem] text-gray-500 transition-all duration-300`}
        />

        {isOpen && (
          <div className="absolute left-0 z-20 mt-1 w-full rounded-md border bg-white px-4 py-2 shadow-lg">
            {/* <div className="flex justify-center">
              <button
                onClick={() => {
                  setIsModalOpen(true);
                }}
                className="mb-4 py-2 font-medium text-accent_soft_blue"
              >
                + Add New
              </button>
            </div> */}

            <div className="h-72 space-y-2 overflow-y-auto">
              <ul
                onScroll={(e) => {
                  const { scrollTop, scrollHeight, clientHeight } =
                    e.currentTarget;
                  if (scrollHeight - scrollTop === clientHeight) {
                    // console.log(scrollHeight, scrollTop, clientHeight);
                    // console.log("object", hasMore);
                    if (hasMore && !isPending && !isLoading) {
                      setIsLoading(true);
                      setPage(page + 1);
                    }
                  }
                }}
                className={`${isOpen ? "z-20 translate-y-0 opacity-100" : "z-[-1] translate-y-[-5px] opacity-0"} absolute right-0 top-[46px] flex max-h-80 w-full flex-col overflow-y-auto rounded bg-white py-1 duration-500`}
              >
                {methods?.map((method: any, idx: number) => (
                  <li
                    key={idx}
                    className="mx-2 flex cursor-pointer items-center justify-between px-2 py-2 text-[#5A607F] hover:bg-gray-100"
                    onClick={() => {
                      onChange(method);
                      setIsOpen(false);
                    }}
                  >
                    <p className="text-sm">
                      {method.title} -
                    </p>
                    <p className="text-xs text-gray-500">
                      {method?.account_type?.title}
                    </p>
                  </li>
                ))}
                {isPending && (
                  <li className="cursor-pointer px-3 py-2 text-center text-accent_soft_blue hover:bg-gray-100">
                    Loading...
                  </li>
                )}
                {!hasMore && (
                  <li className="cursor-pointer px-3 py-2 text-center text-xs text-accent_soft_blue hover:bg-gray-100">
                    End Of Data
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
      {/* <div
        className={`${
          isModalOpen ? "visible" : "invisible"
        } fixed left-0 top-0 z-[200] flex h-screen w-full items-center justify-center bg-[#0000002a] transition-all duration-300`}
      >
        <div
          className={`${
            isModalOpen ? "scale-[1] opacity-100" : "scale-[0] opacity-0"
          } w-[90%] rounded-lg bg-[#fff] p-4 transition-all duration-300 sm:w-[80%] md:w-[30%]`}
        >
          <div className="relative flex w-full items-end justify-end">
            <RxCross1
              className="cursor-pointer rounded-full p-2 text-[2.5rem] transition-all duration-300 hover:bg-[#e7e7e7]"
              onClick={() => setIsModalOpen(false)}
            />
          </div>
          <AddAccountForm
            onClose={setIsModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
            }}
          />
        </div>
      </div> */}
    </>
  );
};

export default AccountSelect;
