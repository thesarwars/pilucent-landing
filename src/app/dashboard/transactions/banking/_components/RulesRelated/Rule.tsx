import Modal from "@/app/(admin)/_components/Modal";
import Table from "@/app/(admin)/_components/Table";
import Button from "@/components/ui/RawButton";
import { useState } from "react";
import TransactionRuleForm from "./transaction-rule-form";
import Image from "next/image";
import { useFetch } from "@/app/helpers/hooks";
import { fetchRules } from "@/app/helpers/backend";

const Rule = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [updateData, setUpdateData] = useState<any>("");
  const { data, isPending, refetch, setQueryParams, params } = useFetch(
    ["rulesList"],
    fetchRules,
  );
  const columns = [
    {
      text: "Rule Name",
      dataField: "title",
    },
    {
      text: "Rule Type",
      dataField: "transaction_type",
    },
    {
      text: "Rule Value",
      dataField: "rule_value",
    },
  ];

  return (
    <div>
      <Table
        params={params}
        setParams={setQueryParams}
        loading={isPending}
        refetch={refetch}
        searchPlaceholder="Search rules..."
        title="Transaction Rules"
        data={data}
        onEdit={(row) => {
          setUpdateData(row);
          setIsOpen(true);
        }}
        // onDelete={()=>{}}
        columns={columns}
      >
        <Button
          onClick={() => {
            setUpdateData("");
            setIsOpen(true);
          }}
          className="flex items-center gap-2 text-nowrap rounded-xl bg-black px-4 text-white hover:bg-gray-900"
        >
          <Image
            src="/icons/plus-sign.svg"
            width={100}
            height={100}
            alt="plus"
            className="h-5 w-5 object-contain"
          />
          <span className="text-sm font-medium">Add New</span>
        </Button>
      </Table>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Rule"
        widthClass="w-full md:w-[550px]"
      >
        <TransactionRuleForm
          data={updateData}
          refetch={refetch}
          setIsOpen={setIsOpen}
        />
      </Modal>
    </div>
  );
};

export default Rule;
