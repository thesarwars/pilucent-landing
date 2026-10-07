"use client";

import Button from "@/components/ui/RawButton";
import moment from "moment";
import Clouds from "../_components/Clouds";
import LiveDemoChart from "../_components/ListOfDemo";
import CustomPieChart from "../_components/SupportTicketChart";
import Table from "../_components/Table";
import { useFetch } from "@/app/helpers/hooks";
import {  fetchSubscriptions } from "@/app/helpers/backend";
import CompanyOverview from "./(company)/companies/_components/CompanyOverview";
import { useState } from "react";
import Subscription from "./subscriptions/_components/Subscription";

const Columns = [
  {
    text: "Title",
    dataField: "title",
  },
  {
    text: "Status",
    dataField: "status",
  },
  {
    text: "Description",
    dataField: "description",
  },
  {
    text: "Currency",
    dataField: "currency",
  },
  {
    text: "User Limit",
    dataField: "user_limit",
  },
  {
    text: "Storage Limit",
    dataField: "storage_limit",
  },
  {
    text: "Trial Period (Days)",
    dataField: "trial_period",
  },
  {
    text: "Auto Renew",
    dataField: "is_auto_renew",
    formatter: (cell: boolean) => (cell ? "Yes" : "No"),
  },
  {
    text: "Enable Email Notification",
    dataField: "is_enable_email_notification",
    formatter: (cell: boolean) => (cell ? "Yes" : "No"),
  },
  {
    text: "Cancel Policy",
    dataField: "cancel_policy",
  },
];

const Page = () => {
  const { data, setQueryParams, isPending, refetch } = useFetch(
    ["subscriptionData"],
    fetchSubscriptions,
  );
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="font-inter">
      <div className="flex flex-col-reverse md:flex-row md:items-center justify-between rounded-xl bg-[#6A6EF6] p-5">
        <div className="flex-1 flex-col md:flex-row">
          <p className="text-white">
            {moment(new Date()).format("dddd, MMMM D")}
          </p>
          <h1 className="mt-4 text-2xl font-semibold text-white">
            Good Day, Admin
          </h1>
          <Button className="mt-6 rounded-lg border border-white py-2 text-gray-50">
            Customize
          </Button>
        </div>
        <Clouds />
      </div>
      <h1 className="mb-2 mt-4 text-2xl font-medium text-[#131523]">
        Company Overview
      </h1>

      <CompanyOverview />

      <div className="mt-4 grid grid-cols-6 gap-4">
        <div className="col-span-6 md:col-span-2">
          <LiveDemoChart />
        </div>
        <div className="col-span-6 md:col-span-4">
          <CustomPieChart />
        </div>
      </div>
      <Table
        // onFilter={() => setIsFilterOpen(true)}
        data={data}
        setParams={setQueryParams}
        loading={isPending}
        columns={Columns}
        title="List of Subscription"
      >
        <Button
          className="bg-accent_dark_blue text-white"
          onClick={() => setIsOpen(true)}
        >
          Create Plan
        </Button>
      </Table>
      <Subscription refetch={refetch} isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default Page;
