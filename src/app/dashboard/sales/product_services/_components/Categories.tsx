import { useAppSelector } from "@/app/redux/store";
import { handleOpenModalSM } from "@/components/ModalSM/ModalSM";
import Pagination from "@/components/ui/Pagination/Pagination";
import GetToken from "@/hooks/getToken";
import { DeleteData, GetData } from "@/services/FetchMethods";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Plus, Search, Settings, Pencil, Trash2, Loader2, FolderTree } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";
import { VioletButton } from "@/components/violet";

interface propsType {
  setModalHeader: Dispatch<SetStateAction<string>>;
  setServiceOptions: Dispatch<SetStateAction<boolean>>;
  setModalContent: Dispatch<SetStateAction<string>>;
  setProductType: Dispatch<SetStateAction<string>>;
  setCategoryUID: Dispatch<SetStateAction<string>>;
  isRefetch: boolean;
}

type ColumnFilter = {
  name: boolean;
  parent_category: boolean;
  description: boolean;
};

const Categories = ({
  setModalContent,
  setModalHeader,
  setServiceOptions,
  setProductType,
  setCategoryUID,
  isRefetch,
}: propsType) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(10);
  const [deleteUid, setDeleteUid] = useState("");
  const [isSettingVisible, setIsSettingVisible] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const token = GetToken();
  const [searchText, SetSearchText] = useState("");
  const { Permissions } = useAppSelector((state) => state.Permissions);
  const [columnFilter, setColumnFilter] = useState<ColumnFilter>({
    name: true,
    parent_category: true,
    description: true,
  });
  const {
    data: Categories,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["Category_list", currentPage],
    queryFn: async () => {
      const response = await GetData(
        `we/categories?page=${currentPage}&search=${searchText}`,
        token,
      );
      setTotalCount(response.count);
      return response;
    },
  });

  useEffect(() => {
    if (isMounted) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetch]);

  const { mutate: DeleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: async (uid: string) => {
      const res = await DeleteData(`we/categories/${uid}`, token);
      return res;
    },
    onSuccess: () => {
      Swal.fire({
        title: "Deleted!",
        text: "Your Data has been deleted.",
        icon: "success",
      });
      refetch();
    },
    onError: () => {
      toast.error("Something went wrong!");
    },
  });

  const handleColumnFilter = (columnName: keyof ColumnFilter) => {
    setColumnFilter((prev) => {
      const UpdatedColumnFilter = { ...prev, [columnName]: !prev[columnName] };
      const FilterString = JSON.stringify(UpdatedColumnFilter);
      localStorage.setItem("category_column_filter", FilterString);
      return UpdatedColumnFilter;
    });
  };

  useEffect(() => {
    if (isMounted) {
      refetch();
    } else {
      setIsMounted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleDelete = (uid: string) => {
    setDeleteUid(uid);
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6A6EF6",
      cancelButtonColor: "#00035F",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        DeleteCategory(uid);
      }
    });
  };

  const handleUpdateCategory = (uid: string) => {
    setModalHeader("Edit Category");
    setServiceOptions(false);
    setModalContent("update-category");
    handleOpenModalSM();
    setProductType("");
    setCategoryUID(uid);
  };

  const rows: any[] = Categories?.results || [];
  const gridCols = `${columnFilter.name ? "minmax(0,1.4fr)" : ""} ${
    columnFilter.parent_category ? "minmax(0,1fr)" : ""
  } 84px`;

  return (
    <div className="font-jakarta text-v-ink900">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {Permissions?.includes("add_category") && (
          <VioletButton
            type="button"
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setModalHeader("New Category");
              setServiceOptions(false);
              setModalContent("create-categories");
              handleOpenModalSM();
              setProductType("");
            }}
          >
            Create category
          </VioletButton>
        )}
        <span className="flex-1" />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-v-ink400" />
          <input
            onChange={(e) => {
              SetSearchText(e.target.value);
              setCurrentPage(1);
            }}
            value={searchText}
            placeholder="Search categories"
            type="text"
            className="w-[200px] rounded-[10px] border border-v-border bg-v-card-subtle py-2 pl-9 pr-3 text-[13px] text-v-ink900 outline-none transition-shadow placeholder:text-v-ink400 focus:border-v-primary focus:bg-white focus:shadow-[0_0_0_3px_#EEE9FF]"
          />
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSettingVisible(!isSettingVisible)}
            title="Columns"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-[10px] bg-v-wash2 text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary",
              isSettingVisible && "bg-v-tint100 text-v-primary",
            )}
          >
            <Settings className="h-[17px] w-[17px]" />
          </button>
          {isSettingVisible && (
            <div className="absolute right-0 top-11 z-50 w-[220px] animate-v-pop rounded-v-card border border-v-border bg-white p-3 shadow-v-modal">
              <div className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-[0.06em] text-v-ink400">
                Columns
              </div>
              {(["name", "parent_category"] as (keyof ColumnFilter)[]).map((columnKey) => (
                <button
                  key={columnKey}
                  type="button"
                  onClick={() => handleColumnFilter(columnKey)}
                  className="flex w-full items-center gap-2.5 rounded-[9px] px-2 py-1.5 text-left hover:bg-v-wash"
                >
                  <span
                    className={cn(
                      "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors",
                      columnFilter[columnKey] ? "border-v-primary bg-v-primary text-white" : "border-v-border bg-white",
                    )}
                  >
                    {columnFilter[columnKey] && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    )}
                  </span>
                  <span className="text-[12.5px] font-medium capitalize text-v-ink700">
                    {columnKey.split("_").join(" ")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* table */}
      <div className="mt-4 overflow-hidden rounded-v-card border border-v-border bg-white">
        {/* header strip */}
        <div
          className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.07)] bg-v-card-subtle px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-v-ink400"
          style={{ gridTemplateColumns: gridCols }}
        >
          {columnFilter.name && <span>Name</span>}
          {columnFilter.parent_category && <span>Parent category</span>}
          <span className="text-right">Action</span>
        </div>

        {/* body */}
        {isPending ? (
          [0, 1, 2, 3, 4].map((v) => (
            <div
              key={v}
              className="grid items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-4 py-3"
              style={{ gridTemplateColumns: gridCols }}
            >
              {columnFilter.name && <div className="h-4 w-3/4 rounded bg-v-wash2" />}
              {columnFilter.parent_category && <div className="h-4 w-1/2 rounded bg-v-wash2" />}
              <div className="ml-auto h-4 w-14 rounded bg-v-wash2" />
            </div>
          ))
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-v-tint100 text-v-primary">
              <FolderTree className="h-[19px] w-[19px]" />
            </span>
            <div className="text-sm font-semibold text-v-ink900">No categories found</div>
            <div className="text-[13px] text-v-ink400">Create a category to organize your items.</div>
          </div>
        ) : (
          rows.map((category: any, i: number) => (
            <div
              key={category.uid}
              className="grid animate-v-pop items-center gap-3 border-b border-[rgba(22,23,42,0.06)] px-4 py-2.5 transition-colors last:border-0 hover:bg-[#F7F5FC]"
              style={{ gridTemplateColumns: gridCols, animationDelay: `${i * 0.03}s` }}
            >
              {columnFilter.name && (
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-v-tint100 text-v-primary">
                    <FolderTree className="h-[15px] w-[15px]" />
                  </span>
                  <span className="truncate text-[13px] font-bold text-v-ink900">
                    {category.title || "—"}
                  </span>
                </div>
              )}
              {columnFilter.parent_category && (
                <span className="truncate text-[12.5px] text-v-ink500">
                  {category.parent?.title || "—"}
                </span>
              )}
              <div className="flex items-center justify-end gap-1">
                {Permissions?.includes("change_category") && (
                  <button
                    type="button"
                    aria-label="Edit category"
                    onClick={() => handleUpdateCategory(category.uid)}
                    className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-tint100 hover:text-v-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {Permissions?.includes("delete_category") && (
                  <button
                    type="button"
                    aria-label="Delete category"
                    onClick={() => handleDelete(category.uid)}
                    className="flex h-8 w-8 items-center justify-center rounded-[9px] text-v-ink500 transition-colors hover:bg-v-danger-bg hover:text-v-danger-fg"
                  >
                    {deleteUid == category.uid && isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalData={totalCount}
          maxVisiblePages={3}
        />
      </div>
    </div>
  );
};

export default Categories;
