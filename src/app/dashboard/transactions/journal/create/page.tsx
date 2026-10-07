import { ManualBreadcrumbs } from "@/components/BreadCrumb/BreadCrumb";
import JournalCreate from "../../_components/JournalCreate";
const page = () => {
  return (
    <div className="mb-4 font-lexend">
      <ManualBreadcrumbs
        items={[
          { label: "Transactions", href: "#" },
          { label: "Journal Entry", href: "/dashboard/transactions/journal" },
          { label: "Create", href: "/dashboard/transactions/journal/create" },
        ]}
        className="mb-5 mt-0"
      />
      {/* <div className="my-4 flex items-center justify-center texts-sm rounded-xl border border-red-500 bg-red-50 px-4 py-4 text-red-500">
        <p className="text-center">
          can't do any action here cause <span className="font-semibold capitalize">journal entry</span> is in re-development!
        </p>
      </div> */}
      <JournalCreate />
    </div>
  );
};

export default page;
