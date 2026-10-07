import Modal from "@/app/(admin)/_components/Modal";
import {
  fetchSubscription,
  PatchSubscription,
  PostSubscription,
} from "@/app/helpers/backend";
import MainLoader from "@/components/MainLoader/MainLoader";
import Button from "@/components/ui/RawButton";
import Checkbox from "@/components/ui/Checkbox/Checkbox";
import Input from "@/components/ui/RawInput";
import Label from "@/components/ui/RawLabel";
import { currencyChoices } from "@/lib/helpers/COAData";
import { toast } from "@/lib/ToastService";
import { FormEvent, useEffect, useState } from "react";

const frequencies = [
  // { key: "WEEKLY", label: "Weekly" },
  { key: "MONTHLY", label: "Monthly" },
  { key: "QUARTERLY", label: "Quarterly" },
  { key: "HALF_YEARLY", label: "Half Yearly" },
  { key: "YEARLY", label: "Yearly" },
];

const statuses = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "REMOVED", label: "Removed" },
  { value: "PUBLISHED", label: "Published" },
];

const accountantFeatures = [
  {
    title: "Monthly Bookkeeping And Reconciliations",
    value: "is_monthly_bookkeeping_and_reconciliations",
  },
  { title: "Reports", value: "is_reports" },
  { title: "Annual Tax Filing", value: "is_annual_tax_filing" },
  { title: "1099 Preparation & Filing", value: "is_1099_preparation_filing" },
  {
    title: "30-Minute Consultation Per Quarter",
    value: "is_30_minute_consultation_per_quarter",
  },
  {
    title: "Monthly Or Bi-Weekly Payroll Processing",
    value: "is_monthly_or_biweekly_payroll_processing",
  },
  {
    title: "Quarterly Tax Planning Reviews",
    value: "is_quarterly_tax_planning_reviews",
  },
  {
    title: "Budgeting And Cash Flow Forecasting",
    value: "is_budgeting_and_cash_flow_forecasting",
  },
  { title: "Sales Tax Filing", value: "is_sales_tax_filing" },
  { title: "Unlimited Email Support", value: "is_unlimited_email_support" },
  { title: "Dedicated Accountant", value: "is_dedicated_accountant" },
  { title: "Virtual CFO Services", value: "is_Virtual_CFO_services" },
  {
    title: "Financial Modeling And Custom Dashboards",
    value: "is_financial_modeling_and_custom_dashboards",
  },
  {
    title: "Invest-Ready Financial Statements",
    value: "is_investo_ready_financial_statements",
  },
  {
    title: "Audit Support And Representation",
    value: "is_audit_support_and_representation",
  },
  {
    title: "Year-End Planning For Tax Minimization",
    value: "is_year_end_planning_for_tax_minimization",
  },
  {
    title: "Multi-Entity Or Multi-State Handling",
    value: "is_multi_entity_or_multi_state_handling",
  },
  { title: "Priority Support", value: "is_priority_support" },
];

const subscriptionFeatures = [
  { title: "Chart of Account", value: "is_chart_of_account" },
  { title: "Journal Entry", value: "is_journal_entry" },
  { title: "Sales", value: "is_sales" },
  { title: "Inventory", value: "is_inventory" },
  { title: "Expense", value: "is_expense" },
  { title: "Standard Report", value: "is_standard_report" },
  { title: "HRIS - Employee", value: "is_employees" },
  { title: "HRIS - Attendance", value: "is_attendance" },
  { title: "Multi Currency", value: "is_multicurrency" },
  { title: "Audit Log", value: "is_audit_log" },
  { title: "User Role Management", value: "is_user_role_management" },
  { title: "Terms", value: "is_terms" },
  { title: "Configuration", value: "is_configuration" },
  { title: "Support & Ticket", value: "is_support_ticket" },
  { title: "COA Tree", value: "is_chart_of_account_tree" },
  { title: "Bank Transaction", value: "is_bank_transaction" },
  { title: "Customer", value: "is_customer" },
  { title: "Warehouse Location", value: "is_warehouse" },
  { title: "Supplier Management", value: "is_supplier_management" },
  { title: "Taxes & agency's", value: "is_agency_tax" },
  { title: "HRIS-Payroll", value: "is_payroll" },
  { title: "HRIS-Punch Data Import", value: "is_punch_data_import" },
  { title: "Company Setting", value: "is_company_setting" },
  { title: "Attachment", value: "is_attachment" },
  { title: "Payment Management", value: "is_payment_management" },
  { title: "User Profile", value: "is_user_profile" },
  { title: "AI Finzify", value: "is_ai_finzify" },
];

interface AccountantFeatures {
  is_monthly_bookkeeping_and_reconciliations: boolean;
  is_reports: boolean;
  is_annual_tax_filing: boolean;
  is_1099_preparation_filing: boolean;
  is_30_minute_consultation_per_quarter: boolean;
  is_monthly_or_biweekly_payroll_processing: boolean;
  is_quarterly_tax_planning_reviews: boolean;
  is_budgeting_and_cash_flow_forecasting: boolean;
  is_sales_tax_filing: boolean;
  is_unlimited_email_support: boolean;
  is_dedicated_accountant: boolean;
  is_Virtual_CFO_services: boolean;
  is_financial_modeling_and_custom_dashboards: boolean;
  is_investo_ready_financial_statements: boolean;
  is_audit_support_and_representation: boolean;
  is_year_end_planning_for_tax_minimization: boolean;
  is_multi_entity_or_multi_state_handling: boolean;
  is_priority_support: boolean;
}

type SubscriptionDataType = {
  [key: string]: string | boolean;
  title: string;
  status: string;
  description: string;
  currency: string;
  user_limit: string;
  storage_limit: string;
  trial_period: string;
  is_chart_of_account: boolean;
  is_chart_of_account_tree: boolean;
  is_journal_entry: boolean;
  is_bank_transaction: boolean;
  is_sales: boolean;
  is_customer: boolean;
  is_inventory: boolean;
  is_warehouse: boolean;
  is_expense: boolean;
  is_supplier_management: boolean;
  is_standard_report: boolean;
  is_agency_tax: boolean;
  is_employees: boolean;
  is_payroll: boolean;
  is_attendance: boolean;
  is_punch_data_import: boolean;
  is_multicurrency: boolean;
  is_company_setting: boolean;
  is_audit_log: boolean;
  is_attachment: boolean;
  is_user_role_management: boolean;
  is_terms: boolean;
  is_payment_management: boolean;
  is_configuration: boolean;
  is_user_profile: boolean;
  is_support_ticket: boolean;
  is_ai_finzify: boolean;
  is_auto_renew: boolean;
  is_enable_email_notification: boolean;
  cancel_policy: string;
  note: string;
};

const Subscription = ({
  isOpen,
  setIsOpen,
  uid,
  refetch,
}: {
  refetch?: any;
  uid?: string | null;
  isOpen: boolean;
  setIsOpen: any;
}) => {
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [SubscriptionsType, setSubscriptionsType] = useState(
    "COMPANY_SUBSCRIPTION",
  );
  const [accountantData, setAccountantData] = useState<any>({
    is_monthly_bookkeeping_and_reconciliations: false,
    is_reports: false,
    is_annual_tax_filing: false,
    is_1099_preparation_filing: false,
    is_30_minute_consultation_per_quarter: false,
    is_monthly_or_biweekly_payroll_processing: false,
    is_quarterly_tax_planning_reviews: false,
    is_budgeting_and_cash_flow_forecasting: false,
    is_sales_tax_filing: false,
    is_unlimited_email_support: false,
    is_dedicated_accountant: false,
    is_Virtual_CFO_services: false,
    is_financial_modeling_and_custom_dashboards: false,
    is_investo_ready_financial_statements: false,
    is_audit_support_and_representation: false,
    is_year_end_planning_for_tax_minimization: false,
    is_multi_entity_or_multi_state_handling: false,
    is_priority_support: false,
  });
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionDataType>({
      title: "",
      status: "PUBLISHED",
      description: "",
      currency: "",
      user_limit: "",
      storage_limit: "",
      trial_period: "",
      is_chart_of_account: false,
      is_chart_of_account_tree: false,
      is_journal_entry: false,
      is_bank_transaction: false,
      is_sales: false,
      is_customer: false,
      is_inventory: false,
      is_warehouse: false,
      is_expense: false,
      is_supplier_management: false,
      is_standard_report: false,
      is_agency_tax: false,
      is_employees: false,
      is_payroll: false,
      is_attendance: false,
      is_punch_data_import: false,
      is_multicurrency: false,
      is_company_setting: false,
      is_audit_log: false,
      is_attachment: false,
      is_user_role_management: false,
      is_terms: false,
      is_payment_management: false,
      is_configuration: false,
      is_user_profile: false,
      is_support_ticket: false,
      is_ai_finzify: false,
      is_auto_renew: false,
      is_enable_email_notification: false,
      cancel_policy: "ANYTIME",
      note: "",
    });

  const [pricingData, setPricingData] = useState({
    billing_frequency: "",
    price: "",
    discount: "",
    discount_kind: "FLAT",
  });

  const [UIDS, setUIDS] = useState({
    subscription_uid: "",
    pricing_uid: "",
  });

  useEffect(() => {
    if (!uid) {
      setPricingData({
        billing_frequency: "",
        price: "",
        discount: "",
        discount_kind: "FLAT",
      });
      setUIDS({
        subscription_uid: "",
        pricing_uid: "",
      });
      setAccountantData({
        is_monthly_bookkeeping_and_reconciliations: false,
        is_reports: false,
        is_annual_tax_filing: false,
        is_1099_preparation_filing: false,
        is_30_minute_consultation_per_quarter: false,
        is_monthly_or_biweekly_payroll_processing: false,
        is_quarterly_tax_planning_reviews: false,
        is_budgeting_and_cash_flow_forecasting: false,
        is_sales_tax_filing: false,
        is_unlimited_email_support: false,
        is_dedicated_accountant: false,
        is_Virtual_CFO_services: false,
        is_financial_modeling_and_custom_dashboards: false,
        is_investo_ready_financial_statements: false,
        is_audit_support_and_representation: false,
        is_year_end_planning_for_tax_minimization: false,
        is_multi_entity_or_multi_state_handling: false,
        is_priority_support: false,
      });

      setSubscriptionData({
        title: "",
        status: "PUBLISHED",
        description: "",
        currency: "",
        user_limit: "",
        storage_limit: "",
        trial_period: "",
        is_chart_of_account: false,
        is_chart_of_account_tree: false,
        is_journal_entry: false,
        is_bank_transaction: false,
        is_sales: false,
        is_customer: false,
        is_inventory: false,
        is_warehouse: false,
        is_expense: false,
        is_supplier_management: false,
        is_standard_report: false,
        is_agency_tax: false,
        is_employees: false,
        is_payroll: false,
        is_attendance: false,
        is_punch_data_import: false,
        is_multicurrency: false,
        is_company_setting: false,
        is_audit_log: false,
        is_attachment: false,
        is_user_role_management: false,
        is_terms: false,
        is_payment_management: false,
        is_configuration: false,
        is_user_profile: false,
        is_support_ticket: false,
        is_ai_finzify: false,
        is_auto_renew: false,
        is_enable_email_notification: false,
        cancel_policy: "ANYTIME",
        note: "",
      });
    }
  }, [uid]);

  useEffect(() => {
    const GetSubscriptionDetails = async () => {
      try {
        setIsPending(true);
        const subscriptionDetails = await fetchSubscription(uid);
        setSubscriptionData({
          title: subscriptionDetails?.title,
          status: subscriptionDetails.status,
          description: subscriptionDetails.description,
          currency: subscriptionDetails.currency,
          user_limit: subscriptionDetails.user_limit,
          storage_limit: subscriptionDetails.storage_limit,
          trial_period: subscriptionDetails.trial_period,
          is_chart_of_account: subscriptionDetails.is_chart_of_account,
          is_chart_of_account_tree:
            subscriptionDetails.is_chart_of_account_tree,
          is_journal_entry: subscriptionDetails.is_journal_entry,
          is_bank_transaction: subscriptionDetails.is_bank_transaction,
          is_sales: subscriptionDetails.is_sales,
          is_customer: subscriptionDetails.is_customer,
          is_inventory: subscriptionDetails.is_inventory,
          is_warehouse: subscriptionDetails.is_warehouse,
          is_expense: subscriptionDetails.is_expense,
          is_supplier_management: subscriptionDetails.is_supplier_management,
          is_standard_report: subscriptionDetails.is_standard_report,
          is_agency_tax: subscriptionDetails.is_agency_tax,
          is_employees: subscriptionDetails.is_employees,
          is_payroll: subscriptionDetails.is_payroll,
          is_attendance: subscriptionDetails.is_attendance,
          is_punch_data_import: subscriptionDetails.is_punch_data_import,
          is_multicurrency: subscriptionDetails.is_multicurrency,
          is_company_setting: subscriptionDetails.is_company_setting,
          is_audit_log: subscriptionDetails.is_audit_log,
          is_attachment: subscriptionDetails.is_attachment,
          is_user_role_management: subscriptionDetails.is_user_role_management,
          is_terms: subscriptionDetails.is_terms,
          is_payment_management: subscriptionDetails.is_payment_management,
          is_configuration: subscriptionDetails.is_configuration,
          is_user_profile: subscriptionDetails.is_user_profile,
          is_support_ticket: subscriptionDetails.is_support_ticket,
          is_ai_finzify: subscriptionDetails.is_ai_finzify,
          is_auto_renew: subscriptionDetails.is_auto_renew,
          is_enable_email_notification:
            subscriptionDetails.is_enable_email_notification,
          cancel_policy: subscriptionDetails.cancel_policy,
          note: subscriptionDetails.note,
        });

        setAccountantData({
          is_monthly_bookkeeping_and_reconciliations:
            subscriptionDetails?.is_monthly_bookkeeping_and_reconciliations,
          is_reports: subscriptionDetails?.is_reports,
          is_annual_tax_filing: subscriptionDetails?.is_annual_tax_filing,
          is_1099_preparation_filing:
            subscriptionDetails?.is_1099_preparation_filing,
          is_30_minute_consultation_per_quarter:
            subscriptionDetails?.is_30_minute_consultation_per_quarter,
          is_monthly_or_biweekly_payroll_processing:
            subscriptionDetails?.is_monthly_or_biweekly_payroll_processing,
          is_quarterly_tax_planning_reviews:
            subscriptionDetails?.is_quarterly_tax_planning_reviews,
          is_budgeting_and_cash_flow_forecasting:
            subscriptionDetails?.is_budgeting_and_cash_flow_forecasting,
          is_sales_tax_filing: subscriptionDetails?.is_sales_tax_filing,
          is_unlimited_email_support:
            subscriptionDetails?.is_unlimited_email_support,
          is_dedicated_accountant: subscriptionDetails?.is_dedicated_accountant,
          is_Virtual_CFO_services: subscriptionDetails?.is_Virtual_CFO_services,
          is_financial_modeling_and_custom_dashboards:
            subscriptionDetails?.is_financial_modeling_and_custom_dashboards,
          is_investo_ready_financial_statements:
            subscriptionDetails?.is_investo_ready_financial_statements,
          is_audit_support_and_representation:
            subscriptionDetails?.is_audit_support_and_representation,
          is_year_end_planning_for_tax_minimization:
            subscriptionDetails?.is_year_end_planning_for_tax_minimization,
          is_multi_entity_or_multi_state_handling:
            subscriptionDetails?.is_multi_entity_or_multi_state_handling,
          is_priority_support: subscriptionDetails?.is_priority_support,
        });

        setPricingData({
          billing_frequency: subscriptionDetails.sub_price[0].billing_frequency,
          price: subscriptionDetails.sub_price[0].price,
          discount: subscriptionDetails.sub_price[0].discount,
          discount_kind: subscriptionDetails.sub_price[0].discount_kind,
        });
        setUIDS({
          subscription_uid: subscriptionDetails.uid,
          pricing_uid: subscriptionDetails.sub_price[0].id,
        });
      } catch (error) {
        toast.error("Couldn't get subscription data!");
        // console.log(error);
      } finally {
        setIsPending(false);
      }
    };
    if (uid) {
      GetSubscriptionDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    //if uid exists update subscription
    if (uid) {
      try {
        setIsLoading(true);
        let data = {
          ...subscriptionData,
          ...accountantData,
          kind: SubscriptionsType,
          uid: UIDS?.subscription_uid,
          sub_price: [{ ...pricingData, id: UIDS?.pricing_uid }],
        };

        const result = await PatchSubscription(data);
        if (result.success) {
          toast.success("Subscription plan updated.");
          refetch && refetch();
          setIsOpen(false);
          setPricingData({
            billing_frequency: "",
            price: "",
            discount: "",
            discount_kind: "FLAT",
          });
          setUIDS({
            subscription_uid: "",
            pricing_uid: "",
          });
          setSubscriptionData({
            title: "",
            status: "PUBLISHED",
            description: "",
            currency: "",
            user_limit: "",
            storage_limit: "",
            trial_period: "",
            is_chart_of_account: false,
            is_chart_of_account_tree: false,
            is_journal_entry: false,
            is_bank_transaction: false,
            is_sales: false,
            is_customer: false,
            is_inventory: false,
            is_warehouse: false,
            is_expense: false,
            is_supplier_management: false,
            is_standard_report: false,
            is_agency_tax: false,
            is_employees: false,
            is_payroll: false,
            is_attendance: false,
            is_punch_data_import: false,
            is_multicurrency: false,
            is_company_setting: false,
            is_audit_log: false,
            is_attachment: false,
            is_user_role_management: false,
            is_terms: false,
            is_payment_management: false,
            is_configuration: false,
            is_user_profile: false,
            is_support_ticket: false,
            is_ai_finzify: false,
            is_auto_renew: false,
            is_enable_email_notification: false,
            cancel_policy: "ANYTIME",
            note: "",
          });
          setAccountantData({
            is_monthly_bookkeeping_and_reconciliations: false,
            is_reports: false,
            is_annual_tax_filing: false,
            is_1099_preparation_filing: false,
            is_30_minute_consultation_per_quarter: false,
            is_monthly_or_biweekly_payroll_processing: false,
            is_quarterly_tax_planning_reviews: false,
            is_budgeting_and_cash_flow_forecasting: false,
            is_sales_tax_filing: false,
            is_unlimited_email_support: false,
            is_dedicated_accountant: false,
            is_Virtual_CFO_services: false,
            is_financial_modeling_and_custom_dashboards: false,
            is_investo_ready_financial_statements: false,
            is_audit_support_and_representation: false,
            is_year_end_planning_for_tax_minimization: false,
            is_multi_entity_or_multi_state_handling: false,
            is_priority_support: false,
          });
          setUIDS({
            subscription_uid: "",
            pricing_uid: "",
          });
        }
      } catch (error) {
        toast.error("Something went wrong.");
      } finally {
        setIsLoading(false);
      }

      //else create new subscription
    } else {
      try {
        setIsLoading(true);
        const data = {
          ...subscriptionData,
          ...accountantData,
          kind: SubscriptionsType,
          sub_price: [{ ...pricingData }],
        };
        const result = await PostSubscription(data);
        if (result.success) {
          toast.success("Subscription Plan Created");
          refetch && refetch();
          setIsOpen(false);
          setPricingData({
            billing_frequency: "",
            price: "",
            discount: "",
            discount_kind: "FLAT",
          });
          setUIDS({
            subscription_uid: "",
            pricing_uid: "",
          });
          setSubscriptionData({
            title: "",
            status: "PUBLISHED",
            description: "",
            currency: "",
            user_limit: "",
            storage_limit: "",
            trial_period: "",
            is_chart_of_account: false,
            is_chart_of_account_tree: false,
            is_journal_entry: false,
            is_bank_transaction: false,
            is_sales: false,
            is_customer: false,
            is_inventory: false,
            is_warehouse: false,
            is_expense: false,
            is_supplier_management: false,
            is_standard_report: false,
            is_agency_tax: false,
            is_employees: false,
            is_payroll: false,
            is_attendance: false,
            is_punch_data_import: false,
            is_multicurrency: false,
            is_company_setting: false,
            is_audit_log: false,
            is_attachment: false,
            is_user_role_management: false,
            is_terms: false,
            is_payment_management: false,
            is_configuration: false,
            is_user_profile: false,
            is_support_ticket: false,
            is_ai_finzify: false,
            is_auto_renew: false,
            is_enable_email_notification: false,
            cancel_policy: "ANYTIME",
            note: "",
          });
          setAccountantData({
            is_monthly_bookkeeping_and_reconciliations: false,
            is_reports: false,
            is_annual_tax_filing: false,
            is_1099_preparation_filing: false,
            is_30_minute_consultation_per_quarter: false,
            is_monthly_or_biweekly_payroll_processing: false,
            is_quarterly_tax_planning_reviews: false,
            is_budgeting_and_cash_flow_forecasting: false,
            is_sales_tax_filing: false,
            is_unlimited_email_support: false,
            is_dedicated_accountant: false,
            is_Virtual_CFO_services: false,
            is_financial_modeling_and_custom_dashboards: false,
            is_investo_ready_financial_statements: false,
            is_audit_support_and_representation: false,
            is_year_end_planning_for_tax_minimization: false,
            is_multi_entity_or_multi_state_handling: false,
            is_priority_support: false,
          });
        }
      } catch (error) {
        toast.error("Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Subscription Plan"
      >
        {isPending ? (
          <MainLoader />
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div
              style={{ boxShadow: "0px 4px 40px 0px #0000001A" }}
              className="rounded-xl bg-[#F5F6FA] p-4"
            >
              <div className="">
                <div className="col-span-2 mt-2">
                  <div className="uppercase text-[#7E84A3]">
                    plan information
                  </div>
                  <hr className="mt-2 bg-[#D7DBEC]" />
                </div>

                <div className="col-span-2 mt-2 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="block text-[#5A607F]">
                      Plan Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={subscriptionData.title}
                      onChange={(e) =>
                        setSubscriptionData({
                          ...subscriptionData,
                          title: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="block text-[#5A607F]">
                      Plan Description
                    </Label>
                    <Input
                      value={subscriptionData.description}
                      onChange={(e) =>
                        setSubscriptionData({
                          ...subscriptionData,
                          description: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                      required
                    />
                  </div>
                  <div className="">
                    <Label className="block text-[#5A607F]">
                      Currency <span className="text-red-500">*</span>
                    </Label>
                    <select
                      value={subscriptionData.currency}
                      onChange={(e) =>
                        setSubscriptionData({
                          ...subscriptionData,
                          currency: e.target.value,
                        })
                      }
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
                      required
                    >
                      <option value="" defaultChecked>
                        Select Currency
                      </option>
                      {currencyChoices.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="">
                    <Label className="block text-[#5A607F]">
                      Plan Type <span className="text-red-500">*</span>
                    </Label>
                    <select
                      value={SubscriptionsType}
                      onChange={(e) => setSubscriptionsType(e.target.value)}
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
                      required
                    >
                      <option value="COMPANY_SUBSCRIPTION">Company</option>
                      <option value="ACCOUNTANT_SUBSCRIPTION">
                        Accountant
                      </option>
                    </select>
                  </div>
                  <div>
                    <Label className="block text-[#5A607F]">User Limit</Label>
                    <Input
                      value={subscriptionData.user_limit}
                      onChange={(e) =>
                        setSubscriptionData({
                          ...subscriptionData,
                          user_limit: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="number"
                      required
                    />
                  </div>
                  <div>
                    <Label className="block text-[#5A607F]">
                      Storage Limit
                    </Label>
                    <Input
                      value={subscriptionData.storage_limit}
                      onChange={(e) =>
                        setSubscriptionData({
                          ...subscriptionData,
                          storage_limit: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="number"
                      required
                    />
                  </div>
                  <div>
                    <Label className="block text-[#5A607F]">
                      Trial Period (Days)
                    </Label>
                    <Input
                      value={subscriptionData.trial_period}
                      onChange={(e) =>
                        setSubscriptionData({
                          ...subscriptionData,
                          trial_period: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="number"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{ boxShadow: "0px 4px 40px 0px #0000001A" }}
              className="rounded-xl bg-[#F5F6FA] p-4"
            >
              <div className="">
                <div className="col-span-2 mt-2">
                  <div className="uppercase text-[#7E84A3]">Pricing</div>
                  <hr className="mt-2 bg-[#D7DBEC]" />
                </div>

                <div className="col-span-2 mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-[#5A607F]">
                      Billing Frequency <span className="text-red-500">*</span>
                    </Label>
                    <select
                      value={pricingData.billing_frequency}
                      onChange={(e) =>
                        setPricingData({
                          ...pricingData,
                          billing_frequency: e.target.value,
                        })
                      }
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
                      required
                    >
                      <option value="">Select Frequency</option>
                      {frequencies.map((frequency) => (
                        <option key={frequency?.key} value={frequency.key}>
                          {frequency.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="block text-[#5A607F]">
                      Pricing (Amount) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={pricingData.price}
                      onChange={(e) =>
                        setPricingData({
                          ...pricingData,
                          price: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="number"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="block text-[#5A607F]">
                      Discount Amount{" "}
                    </Label>
                    <Input
                      value={pricingData.discount}
                      onChange={(e) =>
                        setPricingData({
                          ...pricingData,
                          discount: e.target.value,
                        })
                      }
                      placeholder=""
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="number"
                    />
                  </div>
                </div>
                {pricingData?.discount && (
                  <div className="col-span-2 mt-4">
                    <Label className="block text-[#5A607F]">
                      Price After Discount{" "}
                      <span className="block text-xs text-blue-500">
                        (Price that will appear in the plan section of website)
                      </span>
                    </Label>
                    <p className="mt-2 flex h-11 max-w-40 items-center rounded-lg border border-[#A1A7C4] px-6">
                      {" "}
                      {Number(pricingData?.price) -
                        Number(pricingData?.discount)}
                    </p>
                  </div>
                )}
                {Number(pricingData?.price) - Number(pricingData?.discount) <
                  1 &&
                  pricingData?.discount && (
                    <span className="text-sm text-red-500">
                      Discount should not be larger or equal than price.
                    </span>
                  )}
              </div>
            </div>

            <div
              style={{ boxShadow: "0px 4px 40px 0px #0000001A" }}
              className="rounded-xl bg-[#F5F6FA] p-4"
            >
              <div className="">
                <div className="col-span-2 mt-2">
                  <div className="uppercase text-[#7E84A3]">Feature</div>
                  <hr className="mt-2 bg-[#D7DBEC]" />
                </div>

                {SubscriptionsType == "COMPANY_SUBSCRIPTION" ? (
                  <div className="col-span-2 mt-2 grid grid-cols-2 gap-4">
                    {subscriptionFeatures?.map((feature, idx) => (
                      <div key={idx}>
                        <Checkbox
                          value={subscriptionData[feature.value] == true}
                          onChange={(e) =>
                            setSubscriptionData({
                              ...subscriptionData,
                              [feature.value]: e.target.checked,
                            })
                          }
                          labelText={feature.title}
                          className="gap-2 text-[#5A607F]"
                          checkboxClass="rounded-sm size-[18px]"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="col-span-2 mt-2 grid grid-cols-2 gap-4">
                    {accountantFeatures?.map((feature: any, idx) => (
                      <div key={idx}>
                        <Checkbox
                          value={accountantData[feature?.value] == true}
                          onChange={(e) =>
                            setAccountantData({
                              ...accountantData,
                              [feature.value]: e.target.checked,
                            })
                          }
                          labelText={feature.title}
                          className="gap-2 text-[#5A607F]"
                          checkboxClass="rounded-sm size-[18px]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div
              style={{ boxShadow: "0px 4px 40px 0px #0000001A" }}
              className="rounded-xl bg-[#F5F6FA] p-4"
            >
              <div className="">
                <div className="col-span-2 mt-2">
                  <div className="uppercase text-[#7E84A3]">Other </div>
                  <hr className="mt-2 bg-[#D7DBEC]" />
                </div>

                <div className="col-span-2 mt-2 grid grid-cols-2 gap-4">
                  <div className="col-span-2 my-2 space-y-2">
                    <Checkbox
                      value={subscriptionData.is_auto_renew}
                      onChange={(e) =>
                        setSubscriptionData({
                          ...subscriptionData,
                          is_auto_renew: e.target.checked,
                        })
                      }
                      className="gap-2 text-[#5A607F]"
                      checkboxClass="rounded-sm size-[18px]"
                      labelText="Check if the plan should auto-renew at the end of each billing period."
                    />
                    <Checkbox
                      value={subscriptionData.is_enable_email_notification}
                      onChange={(e) =>
                        setSubscriptionData({
                          ...subscriptionData,
                          is_enable_email_notification: e.target.checked,
                        })
                      }
                      className="gap-2 text-[#5A607F]"
                      checkboxClass="rounded-sm size-[18px]"
                      labelText="Check to enable email notifications before renewal."
                    />
                  </div>
                  <div className="">
                    <Label className="block text-[#5A607F]">
                      Cancellation Policy
                    </Label>
                    <select
                      value={subscriptionData.cancel_policy}
                      onChange={(e) =>
                        setSubscriptionData({
                          ...subscriptionData,
                          cancel_policy: e.target.value,
                        })
                      }
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
                      required
                    >
                      <option value="ANYTIME" defaultChecked>
                        Anytime
                      </option>
                    </select>
                  </div>
                  <div>
                    <Label className="block text-[#5A607F]">
                      Publish Status
                    </Label>
                    <select
                      value={subscriptionData.status}
                      onChange={(e) =>
                        setSubscriptionData({
                          ...subscriptionData,
                          status: e.target.value,
                        })
                      }
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] bg-transparent px-4 outline-none"
                      required
                    >
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Label className="block text-[#5A607F]">Notes</Label>
                    <Input
                      value={subscriptionData.note}
                      onChange={(e) =>
                        setSubscriptionData({
                          ...subscriptionData,
                          note: e.target.value,
                        })
                      }
                      placeholder="Type any notes"
                      className="mt-2 h-11 w-full rounded-lg border border-[#A1A7C4] px-6 py-4"
                      type="text"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-14 flex max-w-[325px] items-center justify-center gap-10">
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-[142px] cursor-pointer rounded-lg border border-[#6A6EF6] py-3 text-center font-semibold text-[#6A6EF6]"
              >
                Cancel
              </Button>
              <Button
                className="w-[142px] bg-[#00035F] text-white"
                type="submit"
                isLoading={isLoading}
              >
                {uid ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default Subscription;
