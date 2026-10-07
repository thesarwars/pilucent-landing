import {
  del,
  get,
  patch,
  patchFormData,
  post,
  postFormData,
  patchFormDataES,
  postAxiosMultipart,
  patchAxiosMultipart,
  put,
  baseURL,
} from './api';

export const postCompany = (data) => postFormData('/we/companies', data);
export const patchWeCompany = (data) => patchFormData('/we', data);

export const getCompany = async () => {
  try {
    const response = await get('/we');
    return { success: true, ...response };
  } catch (error) {
    return { success: false };
  }
};
export const verifyAccessToken = async (token) => {
  try {
    const response = await post(
      `/accounts/auth/token/verify`,
      {
        token: token,
      },
      {},
      false
    );
    if (res?.code != 'token_not_valid') {
      return { success: true, ...response };
    } else {
      return { success: false, ...response };
    }
  } catch (error) {
    return { success: false };
  }
};

export const getUser = async () => {
  try {
    const response = await get('/me');
    return { success: true, ...response };
  } catch (error) {
    return { success: false };
  }
};

//me
export const getUserProfile = () => get('/me');

//demo
export const postDemo = (data) => post('/public/live-demo', data);

//dashboard
export const getProfitLossesDashboard = (params) =>
  get('/we/dashboards/profit-losses-overview', params);
export const getExpenseOverview = (params) => get('/we/dashboards/expense-overview', params);
export const getBankOverview = (params) => get('/we/dashboards/bank-overview', params);
export const getAccountOverview = (params) => get('/we/dashboards/finance-overview', params);
export const fetchInvoiceOverview = () => get('/we/sales/dashboard/overview');
//expense -bill
export const postPurchases = (data) => postAxiosMultipart('/we/purchases', data);
export const postSingleBillItem = (uid, data) => post(`/we/purchases/${uid}/items`, data);
export const patchBill = (uid, data, files) =>
  patchFormDataES(`/we/purchases/${uid}`, data, {}, files);
export const patchSingleBillItem = (uid, itemUid, data) =>
  patch(`/we/purchases/${uid}/items/${itemUid}`, data);
export const deleteSingleBillItem = (uid, itemUid) => del(`/we/purchases/${uid}/items/${itemUid}`);

//expense -purchase
export const fetchExpenseOverview = () => get('/we/purchases?keywords=overview');
export const postSinglePurchaseItem = (uid, data) => post(`/we/purchases/${uid}/items`, data);
export const patchPurchase = (uid, data, files) =>
  patchFormDataES(`/we/purchases/${uid}`, data, {}, files);
export const patchSinglePurchaseItem = (uid, itemUid, data) =>
  patch(`/we/purchases/${uid}/items/${itemUid}`, data);
export const deleteSinglePurchaseItem = (uid, itemUid) =>
  del(`/we/purchases/${uid}/items/${itemUid}`);

//expense -cheque
export const postSingleChequeItem = (uid, data) => post(`/we/purchases/${uid}/items`, data);
export const patchCheque = (uid, data, files) =>
  patchFormDataES(`/we/purchases/${uid}`, data, {}, files);
export const patchSingleChequeItem = (uid, itemUid, data) =>
  patch(`/we/purchases/${uid}/items/${itemUid}`, data);
export const deleteSingleChequeItem = (uid, itemUid) =>
  del(`/we/purchases/${uid}/items/${itemUid}`);

//recurring-templates (bill + expense + cheque)
export const fetchRecurringTemplates = (params) => get('/we/recurring-templates', params);
export const fetchRecurringTemplate = (uid) => get(`/we/recurring-templates/${uid}`);
export const postRecurringTemplate = (data) => post('/we/recurring-templates', data);
export const putRecurringTemplate = (uid, data) => put(`/we/recurring-templates/${uid}`, data);
export const patchRecurringTemplate = (uid, data) => patch(`/we/recurring-templates/${uid}`, data);
export const deleteRecurringTemplate = (uid) => del(`/we/recurring-templates/${uid}`);
export const duplicateRecurringTemplate = (uid) =>
  post(`/we/recurring-templates/${uid}/duplicate`, {});
export const useRecurringTemplate = (uid, data) =>
  post(`/we/recurring-templates/${uid}/use`, data);

//expense -supplier credit
export const postSingleSupplierCreditItem = (uid, data) =>
  post(`/we/credit-notes/${uid}/items`, data);
export const patchSupplierCredit = (uid, data) =>
  patchAxiosMultipart(`/we/credit-notes/${uid}`, data);
export const patchSingleSupplierCreditItem = (uid, itemUid, data) =>
  patch(`/we/credit-notes/${uid}/items/${itemUid}`, data);
export const deleteSingleSupplierCreditItem = (uid, itemUid) =>
  del(`/we/credit-notes/${uid}/items/${itemUid}`);

//expense -expense
export const fetchExpenses = (params) => get('/we/expenses', params);
export const fetchPurchasePayments = (params) => get('/we/purchases/payments', params);
export const patchExpense = (uid, data) => patch(`/we/expenses/${uid}`, data);

//expense -supplier
export const getSuppliers = () => get('/we/suppliers');
export const getSingleSupplier = (uid) => get(`/we/suppliers/${uid}`);
export const postSupplier = (data) => postAxiosMultipart('/we/suppliers', data);
export const patchSupplier = (uid, data) => patchAxiosMultipart(`/we/suppliers/${uid}`, data);
export const deleteSupplier = (uid) => del(`/we/suppliers/${uid}`);

//credit note
export const fetchCreditNotes = (params) => get('/we/credit-notes', params);
export const deleteCreditNoteItem = (uid, itemUid) =>
  del(`/we/credit-notes/${uid}/items/${itemUid}`);

//chart of account category
export const getRootAccountTypes = () => get('/public/categories?kind=CHART_OF_ACCOUNT');
export const getAccountTypes = (slug) => get(`/public/categories/${slug}`);
export const getAccountDetailTypes = (slug) => get(`/public/categories/${slug}`);

//pay-bills
export const fetchPayBills = (params) => get('/we/pay-bills', params);
export const patchPayBillItem = (uid, itemUid, data) =>
  patch(`/we/pay-bills/${uid}/items/${itemUid}`, data);

//bill-payment
export const patchBillPaymentItem = (uid, itemUID, data) =>
  patch(`/we/purchases/payments/${uid}/items/${itemUID}`, data);

//payment-received
// Exists but has no consumer anywhere in this app today — shape/params below are
// unverified. See INVOICE_RECEIVE_PAYMENT.md before building anything real on top of it.
export const fetchPaymentReceived = (params) => get('/we/sales/payment-received', params);


export const fetchInvoiceReceivePaymentReport = (params) =>
  get('/we/reports/invoices-and-received-payments/', params);
export const fetchSalesOverview = (params) => get('/we/sales?keywords=overview', params);

//forgot password
export const postForgotPassword = (data) => post('/accounts/forget-password/sent-link', data);
export const patchPassword = (uid, token, data) =>
  patch(`/accounts/forget-password/${uid}/${token}`, data);
export const postRefreshToken = (refToken) =>
  post(`accounts/auth/token/refresh`, { refresh: refToken });

//workspace switcher (multi-company) — see workspace-switcher-api.md
// memberships → render the company picker; select/switch/join return a SCOPED
// { access, refresh } pair that must replace the stored tokens.
export const fetchWorkspaceMemberships = () => get('/accounts/workspace/memberships');
export const selectWorkspaceCompany = (data) => post('/accounts/workspace/select-company', data);
export const switchWorkspaceCompany = (data) => post('/accounts/workspace/switch-company', data);
export const pinWorkspaceCompany = (data) => post('/accounts/workspace/pin-company', data);
export const joinWorkspaceByCode = (data) => post('/accounts/workspace/join-by-code', data);


export const buildPricingHandoffUrl = (companyUid) => {
  const base = `${process.env.NEXT_PUBLIC_REDIRECT_URL}/pricing`;
  if (typeof window === 'undefined') return base;
  const qs = new URLSearchParams();
  const uid = companyUid || localStorage.getItem('company_uid') || '';
  const tkn = localStorage.getItem('access_token') || '';
  const rt = localStorage.getItem('refresh_token') || '';
  if (uid) qs.set('company_uid', uid);
  if (tkn) qs.set('tkn', tkn);
  if (rt) qs.set('rt', rt);
  const q = qs.toString();
  return q ? `${base}?${q}` : base;
};

//rules
export const fetchRules = (params) => get('/we/transactions/rules', params);
export const postRules = (data) => post('/we/transactions/rules', data);

//bank deposit
export const fetchUndeposit = (params) => get('/we/journals/undeposited-funds', params);
export const postBankDeposit = (data) => postAxiosMultipart('/we/transactions/bank-deposits', data);

//bank transaction
export const uploadPdfOCR = (data, uploadProgress) =>
  postAxiosMultipart('/we/transactions/upload-and-process-pdf/', data, uploadProgress);

//depricated
export const postUpsertTransactions = (data) => post('/we/transactions/upsert-transactions/', data);
export const fetchTransactions = (params) => get('/we/transactions/csv/list', params);
export const getLinkToken = () => get('/we/transactions/create-link-token/');
export const getPublicToken = (data) => post('/we/transactions/exchange-public-token/', data);
export const fetchPlaidTransactions = (data) =>
  post('/we/transactions/get-plaid-transactions/', data);
export const postTransactions = (data) => post('/we/transactions/csv/upsert', data);
export const patchTransaction = (data) => patch(`/we/transactions/csv/update`, data);
export const deleteTransaction = (data) => del(`/we/transactions/csv/update`, data);
export const fetchBankOverview = () => get(`/we/transactions/csv/list/summary`);

//role management
export const fetchUserOnboardList = (params) => get(`/accounts/user-onboards/list`, params);
export const fetchUserOnboard = (uid) => get(`/accounts/user-onboards/${uid}`);
export const postUserOnboard = (data) => post('/accounts/user-onboards/create', data);
export const fetchUserOnboardVerify = (uid) => get('/accounts/user-onboards/verify/' + uid);
export const patchUserProfile = (data) =>
  patchFormData('/accounts/user-onboards/profile-update', data);
export const patchUserOnboard = (uid, data) =>
  patchAxiosMultipart(`/accounts/user-onboards/${uid}`, data);
export const patchUserOnboardImage = (uid, data) =>
  patchFormData(`/accounts/user-onboards/${uid}/profile-image`, data);
export const fetchPermissions = () => get(`/adminio/admin-permissions`);
export const postRole = (data) => post(`/adminio/users-roles`, data);
export const patchRole = (data) => patch(`/adminio/modify-role`, data);
export const deleteRole = (uid) => del(`/adminio/users-roles/${uid}`);
export const fetchRoles = (uid) => get(`/adminio/users-roles/${uid}`);

//admin - currency
export const fetchCurrencies = (params) => get('/we/currencies', params);
export const fetchCurrency = (uid) => get(`/we/currencies/${uid}`);
export const postCurrency = (data) => post('/we/currencies', data);
export const patchCurrency = (uid, data) => patch(`/we/currencies/${uid}`, data);

//get customers
export const fetchCustomers = (params) => get('/we/customers', params);
export const fetchCustomerTransactions = (uid) => get(`/we/customers/${uid}/transactions`);
export const postCustomer = (data) => postAxiosMultipart('/we/customers', data);
export const patchCustomer = (uid, data) => patchAxiosMultipart(`/we/customers/${uid}`, data);
export const fetchSingleCustomer = (uid) => get(`/we/customers/${uid}`);
export const fetchCustomerInvoices = (uid) =>
  get(`/we/sales?status=OPEN&is_invoice=true&customer__uid=${uid}`);

//product
export const fetchProductsOverview = () => get('/we/products?keywords=overview');

//support
export const fetchSupportTickets = (params) => get('/we/support-tickets', params);
export const postSupportTicket = (data) => post('/we/support-tickets', data);
export const fetchSupportTicket = (uid) => get(`/we/support-tickets/${uid}`);

//audit-log
export const fetchAuditLogs = (params) => get('/we/audit-logs', params);
export const fetchPublicSubscriptions = (params) => get('/public/subscription-plans', params);
export const fetchPublicSubscriptionsPrices = (slug, params) =>
  get(`public/subscription-plans/${slug}/prices`, params);
export const postPlanSubscription = (data) => post('/we/subscriptions', data);
//attachments
export const fetchAttachments = (params) => get('/we/attachments', params);
export const postAttachment = (data, uploadProgress) =>
  postAxiosMultipart(`/we/attachments`, data, uploadProgress);
export const patchAttachment = (uid, data, uploadProgress) =>
  patchAxiosMultipart(`/we/attachments/${uid}`, data, uploadProgress);
export const deleteAttachment = (uid) => del(`/we/attachments/${uid}`);

//chart of accounts
export const fetchChartOfAccounts = (params) => get(`/we/chart-of-accounts`, params);
// `/sessions` takes **no** trailing slash — APPEND_SLASH would redirect the GET.
// `Accept: application/json` is explicit because no default renderer is
// configured server-side, so a browser-ish Accept gets the DRF browsable page.
const JSON_ONLY = { headers: { Accept: "application/json" } };
export const fetchChartOfAccount = (uid, params) =>
  get(`/we/chart-of-accounts/${uid}/sessions`, params, JSON_ONLY);
export const getChartOfAccount = (uid) =>
  get(`/we/chart-of-accounts/${uid}`, {}, JSON_ONLY);
export const patchChartOfAccount = (uid, data) => patch(`/we/chart-of-accounts/${uid}`, data);
// Retire/restore an account without deleting it. `data` may carry `{ cascade: true }`
// to retire an account's active sub-accounts along with it after a COA-152 refusal.
// `isReturnError: true` so callers can read `error.response.data.code` (COA-150/151/152/153)
// and `error.response.data.balance` / `.references` / `.children` instead of a toast.
export const postDeactivateAccount = (uid, data = {}) =>
  post(`/we/chart-of-accounts/${uid}/deactivate`, data, {}, false, true);
export const reactivateAccount = (uid) =>
  del(`/we/chart-of-accounts/${uid}/deactivate`, {}, true);

//suppliers
export const fetchSuppliers = (params) => get('/we/suppliers', params);
export const fetchSupplierBills = (params) => get('we/purchases', params);

//bill
export const fetchBills = (params) => get('/we/purchases', params);
export const fetchPurchases = (params) => get('/we/purchases', params);

//terms
export const fetchTerm = (uid) => get(`/we/terms/${uid}`);
export const fetchTerms = (params) => get('/we/terms', params);
export const postTerm = (data) => post('/we/terms', data);
export const patchTerm = (uid, data) => patch(`/we/terms/${uid}`, data);
export const delTerm = (uid) => del(`/we/terms/${uid}`);

//journal
export const getJournals = (params) => get('/we/journals', params);
export const PostJournal = (data) => post('/we/journals', data);
export const getJournal = (uid) => get(`/we/journals/${uid}`);
export const patchPlanSubscription = (uid, data) => patch(`/we/subscriptions/${uid}`, data);
//supplier
export const fetchSupplierTransactions = (uid, params) =>
  get(`we/suppliers/${uid}/transactions`, params);

//product
export const fetchStockLevel = () => get('/we/stock/level');
export const postStockLevel = (data) => post('/we/stock/level', data);
export const patchStockLevel = (uid, data) => patch(`/we/stock/level/${uid}`, data);

//warehouse
export const postWarehouse = (data) => post('/we/warehouses', data);
export const patchWarehouse = (uid, data) => patch(`/we/warehouses/${uid}`, data);
export const deleteWarehouse = (uid) => del(`/we/warehouses/${uid}`);
export const fetchWarehouses = (params) => get('/we/warehouses', params);
export const fetchWarehouse = (uid) => get(`/we/warehouses/${uid}`);

//payment-management
export const fetchPaymentMethods = (params) => get('/we/payment-methods', params);
export const postPaymentMethods = (data) => post('/we/payment-methods', data);
export const patchPaymentMethod = (uid, data) => patch(`/we/payment-methods/${uid}`, data);
export const fetchPaymentMethod = (uid) => patch(`/we/payment-methods/${uid}`);
export const deletePaymentMethod = (uid) => del(`/we/payment-methods/${uid}`);

//OPEN INVOICE REPORT
export const fetchOpenInvoiceReport = (params) => get('/we/sales/reports/open-invoices', params);
//tax rate
export const fetchTaxRates = (params) => get('/we/agencies/taxes/combines', params);
export const postTaxRate = (data) => post('/we/agencies/taxes/combines', data);
export const patchTaxRate = (uid, data) => patch(`/we/agencies/tax/${uid}`, data);
export const fetchTaxRate = (uid) => get(`/we/agencies/tax/combines${uid}`);
export const deleteTaxRate = (uid) => del(`/we/agencies/tax/${uid}`);

//agency
export const fetchAgencies = (params) => get('/we/agencies', params);
export const postAgency = (data) => post('/we/agencies', data);
export const patchAgency = (uid, data) => patch(`/we/agencies/${uid}`, data);
export const fetchAgency = (uid) => get(`/we/agencies/${uid}`);
export const deleteAgency = (uid) => del(`/we/agencies/${uid}`);
export const fetchAgencyTaxSet = (params) => get('/we/agencies/tax/set', params);

export const fetchAgencyTaxTracker = (uid) => get(`/we/agencies/${uid}/tax-tracker`);

// ============================== economic nexus ==============================
// Taxes → Economic Nexus. Monitoring/advisory only (never posts to the ledger):
// measures each company's US-state sales against every state's sales-tax
// registration thresholds and returns a per-state verdict + alerts + reports.
// See nexus_frontend.md. Every /nexus/* route requires the `is_agency_tax`
// feature (403 otherwise); the reports require `is_standard_report` +
// `view_reports`. Percentages come back as FRACTIONS (0.95 = 95%); money fields
// are plain floats. Data is precomputed — freshness is `last_evaluated_at`; use
// recalculate (or the nightly job) to refresh.

// 3.1 Dashboard — every tracked state, precomputed. Response: { count, rows }.
export const fetchNexusDashboard = (params) => get('/we/nexus/dashboard', params);
// 3.2 One state (STATE_CODE case-insensitive). 404 before the first recompute.
export const fetchNexusState = (code) => get(`/we/nexus/state/${code}`);
// 3.3 Recalculate the active company now (synchronous). Refetch the dashboard after.
//     Returns { detail, evaluated_states, unattributed_sales }.
export const recalculateNexus = (data = {}) => post('/we/nexus/recalculate', data, {}, false);

// 4. Registration & agency handoff — all keyed by state code; bodies all-optional:
//    { collection_start_date, filing_frequency, sales_tax_permit_number, mark_registered }.
//    The backend recomputes after each, so refetch the dashboard/state afterward.
//    400 if the state has no statewide sales tax; 404 for an unknown state code.
// 4.1 Mark physical/manual nexus → flips REGISTERED and suppresses its alerts.
export const markNexusState = (code, data = {}) =>
  post(`/we/nexus/state/${code}/mark-nexus`, data, {}, false);
// 4.2 Remove the mark/registration (204) — reverts to the true numeric status.
export const unmarkNexusState = (code) => del(`/we/nexus/state/${code}/mark-nexus`, {}, true);
// 4.3 Record the Sales-Tax handoff; returns { resume_url, ... } — navigate the
//     user there to actually create the agency + rates. mark_registered:true flips
//     the state to REGISTERED immediately.
export const startNexusAgencySetup = (code, data = {}) =>
  post(`/we/nexus/state/${code}/start-agency-setup`, data, {}, false);

// 5. Alerts. Paginated (?page, ?limit≤100); filter with ?acknowledged=false|true.
export const fetchNexusAlerts = (params) => get('/we/nexus/alerts', params);
// 5.2 Acknowledge one alert (idempotent) — returns the updated alert.
export const acknowledgeNexusAlert = (uid) =>
  post(`/we/nexus/alerts/${uid}/acknowledge`, {}, {}, false);

// 6. Settings — warning_fraction (0–1) at which a state flips to APPROACHING (default 0.80).
export const fetchNexusSettings = () => get('/we/nexus/settings');
export const patchNexusSettings = (data) => patch('/we/nexus/settings', data);

// 7. Reports (/we/reports/nexus/*). Standard report query pattern:
//    ?keywords=overview (totals only) · ?is_pdf=true (→ { file_uid, url }).
export const fetchNexusExposureReport = (params) => get('/we/reports/nexus/exposure', params);
export const fetchNexusApproachingRiskReport = (params) =>
  get('/we/reports/nexus/approaching-risk', params);
export const fetchNexusThresholdHistoryReport = (params) =>
  get('/we/reports/nexus/threshold-history', params);

//sales
export const deleteSingleSaleItem = (uid, itemUid) => del(`/we/sales/${uid}/items/${itemUid}`);
export const fetchSales = (params) => get('/we/sales', params);
export const postSale = (data) => postAxiosMultipart('/we/sales', data);
export const patchSale = (uid, data) => patchAxiosMultipart(`/we/sales/${uid}`, data);
export const deleteSale = (uid) => del(`/we/sales/${uid}`);
export const fetchSale = (uid) => get(`/we/sales/${uid}`);
export const fetchSaleItems = (uid) => get(`/we/sales/${uid}/items`);
export const fetchSaleTags = (uid) => get(`/we/sales/${uid}/tags`);
export const fetchSaleFiles = (uid) => get(`/we/sales/${uid}/files`);
export const fetchSaleList = (params) => get('/we/sales/documents', { sale_type: 'all', ...params });

//=================================super admin dashboard====================================
//user role
export const fetchSuperUsers = (params) => get('/accounts/user-onboards/list', params);

//company
export const fetchCompanies = (params) => get('/adminio/companies/su', params);
export const fetchSingleCompany = (uid) => get(`/adminio/companies/su/retrieve/${uid}`);
export const patchCompany = (uid, data) => patch(`/adminio/companies/su/retrieve/${uid}`, data);
export const postSACompany = (data) => post(`/adminio/companies/su`, data);
export const deleteCompany = (uid, data) => del(`/adminio/companies/su/retrieve/${uid}`, data);

//subscriptions
export const fetchSubscriptions = (params) => get('/adminio/subscriptions', params);
export const fetchSubscription = (uid) => get(`/adminio/subscriptions/retrieve/${uid}`);
export const PostSubscription = (data) => post('/adminio/subscriptions', data);
export const PatchSubscription = (data) => post('/adminio/subscriptions', data);
export const DeleteSubscription = (uid) => del(`/adminio/subscriptions/retrieve/${uid}`);

//user
export const fetchUserIdentity = async (email) => {
  try {
    const response = await get(`/adminio/companies/su/user-retrieve/${email}`);
    return { success: true, ...response };
  } catch (error) {
    return { success: false };
  }
};

//schedule
export const fetchSchedules = (params) => get('/public/live-demo/list', params);
export const fetchSchedule = (uid) => get(`/public/live-demo/${uid}`);
export const patchSchedule = (uid, data) => patch(`/public/live-demo/${uid}`, data);

//support
export const postSupportInbox = (uid, data, uploadProgress) =>
  postAxiosMultipart(`/we/support-tickets/${uid}/threads`, data, uploadProgress);
export const fetchSupportInbox = (uid, params) => get(`/we/support-tickets/${uid}/threads`, params);
export const fetchSupportTicketSA = (uid) => get(`/we/support-tickets/${uid}`);
export const patchSupport = (uid, data) => patch(`/we/support-tickets/${uid}`, data);

//reports
export const fetchCategories = () => get('/we/categories');
export const fetchProductServices = (params) => get('/we/products', params);
export const fetchBalanceSheets = (params) => get('/we/reports/balance-sheet', params);
export const fetchBalanceSheetSummary = (params) =>
  get('/we/reports/balance-sheet/summary?keywords=overview', params);

export const fetchJournals = (params) => get('/we/reports/journal-report/entries', params);
export const fetchBalanceSheet = (params) => get('/we/reports/balance-sheet/details', params);

export const fetchTrailBalance = (params) => get('/we/reports/transactions/trial-balances', params);
export const fetchAccounts = (params) => get('/we/chart-of-accounts', params);

//product
export const fetchProducts = (params) => get('/we/products', params);
export const fetchProduct = (uid) => get(`/we/products/${uid}`);

export const fetchCashFlow = (params) => get('/we/reports/cash-flow', params);

export const fetchProfitLoss = (params) => get('/we/reports/profit-losses', params);


export const fetchProfitLossByCustomer = (params) =>
  get('/we/reports/profit-losses/by-customer', params);
export const fetchProfitLossByCustomerOverview = (params) =>
  get('/we/reports/profit-losses/by-customer', { ...params, keywords: 'overview' });

export const fetchProfitLossByStore = (params) =>
  get('/we/reports/profit-losses/by-store', params);
export const fetchProfitLossByStoreOverview = (params) =>
  get('/we/reports/profit-losses/by-store', { ...params, keywords: 'overview' });


export const fetchProfitLossComparisonReport = (params) =>
  get('/we/reports/profit-losses/comparison', params);
export const fetchProfitLossComparisonOverview = (params) =>
  get('/we/reports/profit-losses/comparison', { ...params, keywords: 'overview' });


export const fetchSalesByCustomerSummary = (params) =>
  get('/we/reports/sales-by-customer-summary', params);
export const fetchSalesByCustomerSummaryOverview = (params) =>
  get('/we/reports/sales-by-customer-summary', { ...params, keywords: 'overview' });


export const fetchSalesByCustomerDetail = (params) =>
  get('/we/reports/sales-by-customer-detail', params);
export const fetchSalesByCustomerDetailOverview = (params) =>
  get('/we/reports/sales-by-customer-detail', { ...params, keywords: 'overview' });


export const fetchSalesByProductServiceDetail = (params) =>
  get('/we/reports/sales-by-product-service-detail', params);
export const fetchSalesByProductServiceDetailOverview = (params) =>
  get('/we/reports/sales-by-product-service-detail', { ...params, keywords: 'overview' });

export const fetchSalesByProductServiceSummary = (params) =>
  get('/we/reports/sales-by-product-service-summary', params);
export const fetchSalesByProductServiceSummaryOverview = (params) =>
  get('/we/reports/sales-by-product-service-summary', { ...params, keywords: 'overview' });

export const fetchCustomSummaryReport = (config, params) =>
  get('/we/reports/custom-summary/', { ...config, ...params });

// A/P & A/R Aging reports — see ap_ar_frontend.md.
// Params: start_date, end_date (YYYY-MM-DD); keywords=overview (totals only); is_pdf=true (returns { file_uid, url }).
export const fetchAPAgingDetail = (params) => get('/we/reports/ap-aging-detail', params);
export const fetchAPAgingSummary = (params) => get('/we/reports/ap-aging-summary', params);
export const fetchARAgingDetail = (params) => get('/we/reports/ar-aging-detail', params);
export const fetchARAgingSummary = (params) => get('/we/reports/ar-aging-summary', params);

// Inventory & Sales-Tax reports — see inventory_tax_frontend.md.
// Every endpoint: keywords=overview (totals only) · is_pdf=true (→ { file_uid, url }).
// Sales-tax reports take start_date/end_date (YYYY-MM-DD, accrual). Inventory
// Valuation Summary is a current snapshot and ignores dates. Inventory Valuation
// Detail takes end_date (or date_before) as the as-of date (default today).
export const fetchInventoryValuationSummary = (params) =>
  get('/we/reports/inventory-valuation-summary', params);
export const fetchInventoryValuationDetail = (params) =>
  get('/we/reports/inventory-valuation-detail', params);
export const fetchTaxableSalesSummary = (params) => get('/we/reports/taxable-sales-summary', params);
export const fetchSalesTaxLiability = (params) => get('/we/reports/sales-tax-liability', params);

export const fetchQuantityAdjustment = (params) => get('/we/stock/adjustment', params);
export const postQuantityAdjustment = (data) => post('/we/stock/adjustment', data);

export const fetchDepartments = (params) => get('/we/departments', params);
export const fetchDepartment = (uid) => get(`/we/departments/${uid}`);
export const createDepartments = (data) => post('/we/departments', data);
export const patchDepartments = (uid, data) => patch(`/we/departments/${uid}`, data);
export const deleteDepartments = (uid) => del(`/we/departments/${uid}`);

export const fetchSections = (params) => get('/we/sections', params);
export const createSection = (data) => post('/we/sections', data);
export const patchSection = (uid, data) => patch(`/we/sections/${uid}`, data);
export const deleteSection = (uid) => del(`/we/sections/${uid}`);

//hr - payroll

//employee -shifts
export const postShifts = (data) => post('/we/shifts', data);
export const getShifts = (params) => get('/we/shifts', params);
export const getShift = (uid) => get(`/we/shifts/${uid}`);
export const delShift = (uid) => del(`/we/shifts/${uid}`);
export const patchShift = (uid, data) => patch(`/we/shifts/${uid}`, data);

// employee -departments
export const postDepartments = (data) => post('/we/departments', data);
export const getDepartments = (params) => get('/we/departments', params);
export const getDepartment = (uid) => get(`/we/departments/${uid}`);

//employee -designations
export const postDesignation = (data) => post('/we/designations', data);
export const fetchDesignations = (params) => get('/we/designations', params);
export const fetchDesignation = (uid) => get(`/we/designations/${uid}`);
export const patchDesignation = (uid, data) => patch(`/we/designations/${uid}`, data);
export const deleteDesignation = (uid) => del(`/we/designations/${uid}`);

//employee -deductionContribution
export const postDeductionContribution = (data) => post('/we/payroll/ded-con', data);
export const fetchDeductionContributions = (params) => get('/we/payroll/ded-con', params);
export const fetchDeductionContribution = (uid) => get(`/we/payroll/ded-con/${uid}/`);
export const patchDeductionContribution = (uid, data) => patch(`/we/payroll/ded-con/${uid}/`, data);
export const deleteDeductionContribution = (uid) => del(`/we/payroll/ded-con/${uid}/`);

//employee -holiday
export const postHoliday = (data) => post('/we/holidays', data);
export const fetchHoliday = (params) => get('/we/holidays', params);
export const fetchSingleHoliday = (uid) => get(`/we/holidays/${uid}`);
export const deleteHolidayDetail = (uid, dUID) => del(`/we/holidays/${uid}/details/${dUID}`);
export const postHolidayDetail = (uid, data) => post(`/we/holidays/${uid}/details`, data);
export const patchHolidayDetail = (uid, dUID, data) =>
  patch(`/we/holidays/${uid}/details/${dUID}`, data);
export const patchHoliday = (uid, data) => patch(`/we/holidays/${uid}`, data);
export const deleteHoliday = (uid) => del(`/we/holidays/${uid}`);

//employee -leaveType
export const postLeaveType = (data) => post('/we/leaves/type/', data);
export const fetchLeaveTypes = (params) => get('/we/leaves/type', params);
export const fetchLeaveType = (uid) => get(`/we/leaves/type/${uid}`);
export const patchLeaveType = (uid, data) => patch(`/we/leaves/type/${uid}`, data);
export const deleteLeaveType = (uid) => del(`/we/leaves/type/${uid}`);

//payroll -salaryAdditionDeduction
export const postSalaryAdditionDeduction = (data) => post('/we/salary-adjustments', data);
export const fetchSalaryAdditionDeductions = (params) => get('/we/salary-adjustments', params);
export const fetchSalaryAdditionDeduction = (uid) => get(`/we/salary-adjustments/${uid}`);
export const patchSalaryAdditionDeduction = (uid, data) =>
  patch(`/we/salary-adjustments/${uid}`, data);
export const deleteSalaryAdditionDeduction = (uid) => del(`/we/salary-adjustments/${uid}`);

//payroll - paySchedule
export const postPaySchedule = (data) => post('/we/payroll/pay-schedule', data);
export const fetchPaySchedules = (params) => get('/we/payroll/pay-schedule', params);
export const fetchPaySchedule = (uid) => get(`/we/payroll/pay-schedule/${uid}`);
export const deletePaySchedule = (uid) => del(`/we/payroll/pay-schedule/${uid}/`);
export const patchPaySchedule = (uid, data) => patch(`/we/payroll/pay-schedule/${uid}/`, data);
export const fetchSalaryProcessHistory = (params) => get('/we/payroll/salary-process', params);
// NOTE: despite the name this is a POST to the collection, not a PATCH — the API
// exposes no per-record update route. The create serializer therefore validates
// the body, so callers must include pay_date, pay_period and pay_method from the
// record being updated, not just the fields they want to change.
//
// Never pass `is_salary_done` here. `payMoovSalary` sets it as part of paying the
// run; setting it up front makes every later edit fail with "Cannot modify a
// finalized run".
export const patchSalaryProcessHistory = (uid, data) =>
  post('/we/payroll/salary-process', { uid, ...data });

export const payMoovSalary = (uid) =>
  post(`/we/payroll/salary-process/${uid}/pay`, {}, {}, false, true);
export const fetchPayScheduleEmployee = (uid, pay_period) =>
  get(`/we/payroll/pay-schedule/employees/${uid}?pay_period=${pay_period}`); //new added
export const savedSalary = (data) => post(`/we/payroll/salary-process`, data); //new added
export const getSavedSalary = (params) => get(`/we/payroll/salary-process`, params); //new added


const buildStatesQuery = (states) => {
  const list = Array.isArray(states)
    ? states
    : typeof states === 'string'
      ? states.split(',')
      : [];
  const cleaned = [
    ...new Set(list.map((s) => String(s || '').trim().toUpperCase()).filter(Boolean)),
  ];
  return cleaned.length ? `?states=${cleaned.join(',')}` : '';
};
// Published config for a specific year: federal + the named states.
// e.g. getTaxConfig(2026, ['NY']) → GET /we/payroll/tax-config/2026?states=NY
export const getTaxConfig = (year, states) =>
  get(`/we/payroll/tax-config/${year}${buildStatesQuery(states)}`);
// Published config for the current year (primary call).
export const getCurrentTaxConfig = (states) =>
  get(`/we/payroll/tax-config/current${buildStatesQuery(states)}`);
// List available (year, jurisdiction) rows + metadata (no heavy `data`).
export const listTaxConfigYears = (params) => get('/we/payroll/tax-config', params);
// Staff-only (internal admin/back-office tool) — NOT for the payroll app.
export const putTaxConfig = (year, jurisdiction, data) =>
  put(`/we/payroll/tax-config/${year}/${jurisdiction}`, data);
export const publishTaxConfig = (year, jurisdiction) =>
  post(`/we/payroll/tax-config/${year}/${jurisdiction}/publish`, {});

//payroll - employee salary
export const fetchEmployeeSalaries = (params) => get('/we/salaries', params);

//payroll- leave-requests
export const postLeaveRequest = (data) => post('/we/leaves/request/', data);
export const fetchLeaveRequests = (params) => get('/we/leaves/request', params);
export const fetchLeaveRequest = (uid) => get(`/we/leaves/request/${uid}`);
export const patchLeaveRequest = (uid, data) => patch(`/we/leaves/request/${uid}`, data);
export const deleteLeaveRequest = (uid) => del(`/we/leaves/request/${uid}`);

//employee - employees
export const postEmployee = (data) => postAxiosMultipart('/we/employees', data);
export const fetchEmployees = (params) => get('/we/employees', params);
export const fetchAPEmployees = () => get('/we/employees/list');
export const fetchEmployee = (uid) => get(`/we/employees/${uid}`);
export const patchEmployee = (uid, data) => patchAxiosMultipart(`/we/employees/${uid}`, data);
export const deleteEmployee = (uid) => del(`/we/employees/${uid}`);

//employee address
export const postEmployeeAddress = (data) => post('/we/addresses', data);
export const patchEmployeeAddress = (uid, data) => patch(`/we/addresses/${uid}`, data);

//employee -files
export const fetchEmployeeFiles = (uid, params) => get(`/we/employees/${uid}/documents`, params);
export const postEmployeeFiles = (uid, data, uploadProgress) =>
  postAxiosMultipart(`/we/employees/${uid}/documents`, data, uploadProgress);
export const deleteEmployeeFiles = (uid, dUID) => del(`/we/employees/${uid}/documents/${dUID}`);

//employee - bank
export const postEmployeeBank = (uid, data) =>
  post(`/we/employees/${uid}/banking-informations`, data);
export const patchEmployeeBank = (uid, data, bank_uid) =>
  patch(`/we/employees/${uid}/banking-informations/${bank_uid}`, data);

//employee -taxes
export const postEmployeeTaxes = (uid, data) => post(`/we/employees/${uid}/taxes`, data);
export const patchEmployeeTaxes = (uid, data, taxUID) =>
  patch(`/we/employees/${uid}/taxes/${taxUID}`, data);

//employee -earnings
export const postEmployeeEarningsItems = (uid, data) => post(`/we/employees/${uid}/earnings`, data);
export const fetchEmployeeEarningsItems = (uid) => get(`/we/employees/${uid}/earnings`);
export const patchEmployeeEarningsItems = (uid, dcUID, data) =>
  patch(`/we/employees/${uid}/earnings/${dcUID}`, data);
export const deleteEmployeeEarningsItems = (uid, dcUID) =>
  del(`/we/employees/${uid}/earnings/${dcUID}`);

//employee deduction contribution
export const postEmployeeDCItems = (uid, data) =>
  post(`/we/employees/${uid}/deduction-contributions`, data);
export const fetchEmployeeDCItems = (uid) => get(`/we/employees/${uid}/deduction-contributions`);
export const patchEmployeeDCItems = (uid, dcUID, data) =>
  patch(`/we/employees/${uid}/deduction-contributions/${dcUID}`, data);
export const deleteEmployeeDCItems = (uid, dcUID) =>
  del(`/we/employees/${uid}/deduction-contributions/${dcUID}`);

//employee garnishment
export const postEmployeeGarnishmentsItems = (uid, data) =>
  post(`/we/employees/${uid}/garnishments`, data);
export const patchEmployeeGarnishmentsItems = (uid, gUID, data) =>
  patch(`/we/employees/${uid}/garnishments/${gUID}`, data);
export const deleteEmployeeGarnishmentsItems = (uid, gUID) =>
  del(`/we/employees/${uid}/garnishments/${gUID}`);
export const fetchEmployeeGarnishmentsItems = (uid) => get(`/we/employees/${uid}/garnishments`);

//employee education
export const postEmployeeEducationItems = (uid, data) =>
  post(`/we/employees/${uid}/educations`, data);
export const patchEmployeeEducationItems = (uid, eUID, data) =>
  patch(`/we/employees/${uid}/educations/${eUID}`, data);
export const deleteEmployeeEducationItems = (uid, eUID) =>
  del(`/we/employees/${uid}/educations/${eUID}`);
export const fetchEmployeeEducationItems = (uid) => get(`/we/employees/${uid}/educations`);
export const fetchEmployeeReport = (params) => get(`/we/employees`, params);
//employee experience
export const postEmployeeWorkExperiencesItems = (uid, data) =>
  post(`/we/employees/${uid}/work-experiences`, data);
export const fetchEmployeeWorkExperiencesItems = (uid) =>
  get(`/we/employees/${uid}/work-experiences`);
export const patchEmployeeWorkExperiencesItems = (uid, wUID, data) =>
  patch(`/we/employees/${uid}/work-experiences/${wUID}`, data);
export const deleteEmployeeWorkExperiencesItems = (uid, wUID) =>
  del(`/we/employees/${uid}/work-experiences/${wUID}`);

//employee - leave-balance
export const fetchEmployeeBalanceList = (params) =>
  get('/we/leaves/balance/company-employee-leave-types/', params);
export const fetchLeaveBalances = (params) => get('/we/leaves/balance', params);
export const postLeaveBalance = (data) => post('/we/leaves/balance/', data);
export const fetchLeaveBalance = (uid) => get(`/we/leaves/balance/${uid}`);
export const patchLeaveBalance = (uid, data) => patch(`/we/leaves/balance/${uid}/`, data);
export const patchLeaveBalanceItem = (uid, data) =>
  patch(`/we/leaves/balance/allocations/${uid}/`, data);
export const deleteLeaveBalance = (uid) => del(`/we/leaves/balance/${uid}/`);

//employee - leave-encashment
export const fetchLeaveEncashments = (params) => get('/we/leaves/encashment', params);
export const postLeaveEncashment = (data) => post('/we/leaves/encashment/', data);
export const fetchLeaveEncashment = (uid) => get(`/we/leaves/encashment/${uid}`);
export const patchLeaveEncashment = (uid, data) => patch(`/we/leaves/encashment/${uid}`, data);
export const patchLeaveEncashmentItem = (uid, data) =>
  patch(`/we/leaves/encashment/items/${uid}/`, data);
export const deleteLeaveEncashment = (uid) => del(`/we/leaves/encashment/${uid}/`);

//employee - leave approval
export const patchLeaveApproval = (uid, data) => patch(`/we/leaves/request/${uid}/status/`, data);

//attendance - time tracker
export const fetchTimeSlots = (uid, params) =>
  get(`/me/daily-time-trackings/${uid}/sessions`, params);
export const postTimeSlots = (uid, data) => post(`/me/daily-time-trackings/${uid}/sessions`, data);
export const patchTimeSlots = (uid, tUID, data) =>
  patch(`/me/daily-time-trackings/${uid}/sessions/${tUID}`, data);
export const fetchTimeSlot = (uid, tUID) => get(`/me/daily-time-trackings/${uid}/sessions/${tUID}`);
export const fetchMeTimeTracking = (params) => get(`/me/daily-time-trackings`, params);
export const postPunchData = (data) => post(`/we/attendances/punch-data`, data);
export const postMeTimeTracking = () => post(`/me/daily-time-trackings`, {});
export const patchMeTimeTracking = (uid, data) => patch(`/me/daily-time-trackings/${uid}`, data);
// export const postW4Form = (data) => post(`/we/leaves/w4/pdf/`, data);

// attendance - process
export const fetchAttendanceProcess = (params) => get('/we/attendances/processes', params);
export const postAttendanceProcess = (data) => post('/we/attendances/processes', data);

//attendances
export const fetchAttendances = (params) => get('/we/attendances', params);
export const postAttendance = (data) => post('/we/attendances', data);
export const fetchAttendance = (uid) => get(`/we/attendances/${uid}`);
export const patchAttendance = (uid, data) => patch(`/we/attendances/${uid}`, data);

//payroll - general tax settings
export const fetchGeneralTaxSettings = (params) => get('/we/payroll/general-tax-setting', params);
export const postGeneralTaxSettings = (data) => post('/we/payroll/general-tax-setting', data);
export const patchGeneralTaxSettings = (uid, data) =>
  patch(`/we/payroll/general-tax-setting/${uid}`, data);

//payroll - federal tax settings
export const fetchFederalTaxSettings = (params) =>
  get('/we/payroll/federal-tax-info-setting', params);
export const postFederalTaxSettings = (data) => post('/we/payroll/federal-tax-info-setting', data);
export const patchFederalTaxSettings = (uid, data) =>
  patch(`/we/payroll/federal-tax-info-setting/${uid}`, data);
export const deleteFederalPaySchedule = (uid, dUID) =>
  del(`/we/payroll/federal-tax-info-setting/${uid}/items/${dUID}`);
export const postFederalPaySchedule = (uid, data) =>
  post(`/we/payroll/federal-tax-info-setting/${uid}/items`, data);

//payroll - state tax nyc
export const fetchStateTaxSettings = (params) => get('/we/payroll/state-tax-settings', params);
export const postStateTaxSettings = (data) => post('/we/payroll/state-tax-settings', data);
export const patchStateTaxSettings = (uid, data) =>
  patch(`/we/payroll/state-tax-settings/${uid}`, data);
export const deleteStateTaxItem = (dUID) =>
  del(`/we/payroll/state-tax-settings/item-delete/${dUID}`);
export const postStatePaySchedule = (uid, data) =>
  post(`/we/payroll/state-tax-settings/${uid}/items`, data);

//employee - job card
export const fetchJobCard = (uid, params) => get(`/we/employees/${uid}/job-card-overview`, params);

//payroll - accounting preference
export const fetchAccountingPreference = () => get('/we/payroll/accounting-preferences');
export const postAccountingPreference = (data) => post('/we/payroll/accounting-preferences', data);
export const patchAccountingPreference = (uid, data) =>
  post(`/we/payroll/accounting-preferences`, { uid, ...data });
export const fetchWorkLocations = () => get('/we/payroll/work-location/list');
export const fetchGarnishments = () => get('/we/employees/garnishments-list');
export const fetchDCList = () => get('/we/payroll/ded-con/list');

export const fetchPayrollGeneralSettings = () => get('/we/payroll/general-settings/');
export const postPayrollGeneralSettings = (data) => patch('/we/payroll/general-settings/', data);

// work locations
export const fetchWorkLocationList = (data) => get('/we/payroll/work-location/', data);
export const postWorkLocations = (data) => post('/we/payroll/work-location/', data);
export const deleteWorkLocations = (uid) => del(`/we/payroll/work-location/${uid}`);
export const patchWorkLocations = (uid, data) => patch(`/we/payroll/work-location/${uid}`, data);
export const fetchWorkLocation = (uid) => get(`/we/payroll/work-location/${uid}`);

export const postW4Form = async (payload) => {
  const response = await fetch('https://balanzifyapi.jumatechs.xyz/api/v1/we/pdf/w4/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add any other necessary headers, like Authorization
      // 'Authorization': `Bearer ${your_token}`
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // If the server returns an error, try to parse it as JSON
    const errorData = await response.json().catch(() => null); // Gracefully handle non-json errors
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }

  // Return the response body as a Blob
  return response.blob();
};
export const postI9Form = async (payload) => {
  const response = await fetch('https://balanzifyapi.jumatechs.xyz/api/v1/we/pdf/i9/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add any other necessary headers, like Authorization
      // 'Authorization': `Bearer ${your_token}`
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // If the server returns an error, try to parse it as JSON
    const errorData = await response.json().catch(() => null); // Gracefully handle non-json errors
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }

  // Return the response body as a Blob
  return response.blob();
};

export const post941Form = async (payload) => {
  const response = await fetch('https://balanzifyapi.jumatechs.xyz/api/v1/we/pdf/941/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add any other necessary headers, like Authorization
      // 'Authorization': `Bearer ${your_token}`
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // If the server returns an error, try to parse it as JSON
    const errorData = await response.json().catch(() => null); // Gracefully handle non-json errors
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }

  // Return the response body as a Blob
  return response.blob();
};

export const payrollTaxFillingPDFPreview = (quarter, year) =>
  get(`/we/pdf/941?quarter=${quarter}&year=${year}&preview=1`);

// moov - bank

export const GetMoovTOSToken = async (OAuthToken) => {
  try {
    const res = await fetch('https://api.moov.io/tos-token', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Moov-Version': 'v2026.04.00',
        Authorization: `Bearer ${OAuthToken}`,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail =
        [data.error, data.scope, data.refresh_token].filter(Boolean).join(' — ') || null;
      const msg = detail || (Object.keys(data).length ? JSON.stringify(data) : null);
      throw new Error(msg || `Moov OAuth failed (${res.status})`);
    }
    return data;
  } catch (error) {
    throw new Error(error);
  }
};
// Mint the Moov.js Drop token via OUR backend. Facilitator credentials must
// never live in the browser bundle, and the backend scopes this token to the
// caller's own account (never /transfers.*). Returns { access_token }.
export const fetchOAuthToken = async () => {
  const res = await get('/we/moov-money/access-token');
  return { access_token: res?.data?.access_token };
};


export const fetchSalaryProcessTabCount = () => get('/we/payroll/salary-process/tab-counts')
export const postMoovAccount = (data) =>
  post('/we/moov-money/account/create', data, {}, false, true);
export const postMoovRepresentative = (uid, data) =>
  post(`/we/moov-money/account/create/${uid}/representatives`, data, {}, false, true);
export const postMoovCapabilities = (uid, data) =>
  post(`/we/moov-money/account/create/${uid}/capabilities`, data);

export const fetchMoovCapabilities = () =>
  get(`/we/moov-money/account/details/707d4606-dae4-4c50-8797-a5f8b41732a6/capabilities`);

export const patchMoovRepresentative = (uid, rUID, data) =>
  patch(`/we/moov-money/account/update/${uid}/representatives/${rUID}`, data, {}, true);
export const patchMoovAccount = (uid, data) =>
  patch(`/we/moov-money/account/update/${uid}`, data, {}, true);

export const fetchMoovAccount = () => get(`/we/moov-money/account/me-detail`);
export const fetchMoovRepresentative = (uid) => get(`/we/moov-money/account/representative/${uid}`);
export const fetchMoovAccountDetails = (uid) => get(`/we/moov-money/account/details/${uid}`);
export const fetchMoovIndustries = () => get(`/we/moov-money/account/industries`);
export const deleteBankAccount = (uid) => del(`/we/moov/bank-accounts/${uid}`);
export const fetchLinkedBankAccount = () =>
  get(`/we/moov-money/account/me-detail/bank-list`, {
    bank_account_kind: 'SOURCE',
  });
export const fetchEmployeeLinkedBankAccount = (uid) =>
  get(`/we/moov-money/account/me-detail/bank-list`, { employee__uid: uid });
export const postBankAccount = (data) =>
  post(`/we/moov-money/bank-account/create`, data, {}, false, true);
export const postBankAccountVerify = (BankAccountID) =>
  post(`/we/moov-money/bank-account/initiate-verification/${BankAccountID}`, {}, {}, false, true);
export const putBankAccountVerify = (BankAccountID, data) =>
  put(`/we/moov-money/bank-account/complete-verification/${BankAccountID}`, data, {}, false, true);
export const delBankAccount = (BankAccountID) =>
  del(`/we/moov-money/bank-account/delete/${BankAccountID}`, {}, true);
export const sendMoney = (data) => post('/we/moov-money/transfer/create', data, {}, false, true);
export const fetchMoovTransactions = (params) => get('/we/moov-money/transfer/list', params);
export const fetchMoovTransferDetail = (transferUID) =>
  get(`/we/moov-money/transfer/detail/${transferUID}`);
export const fetchMoovTransferTimeline = (transferUID) =>
  get(`/we/moov-money/transfer/detail/${transferUID}/timeline`);

export const cancelMoovTransfer = (transferUID) =>
  post(`/we/moov-money/transfer/cancellation/${transferUID}`, {}, {}, false, true);
// Optional cancellation-status detail (cancellation progress object).
export const fetchMoovCancellationDetail = (transferUID, cancellationUID) =>
  get(`/we/moov-money/transfer/cancellation/${transferUID}/${cancellationUID}`);

export const fetchPayrollTaxCenter = () => get('/we/payroll/tax-center');
export const fetchPayrollPayReport = (params) => get('/we/payroll/reports/payroll/summary/', params);
export const fetchPayrollSummaryByEmployeeReport = (params) =>
  get('/we/payroll/reports/payroll/summary-by-employee/', params);
// Same endpoint, totals only: { employee_count: N }.
export const fetchPayrollSummaryByEmployeeOverview = (params) =>
  get('/we/payroll/reports/payroll/summary-by-employee/', { ...params, keywords: 'overview' });


export const fetchPayrollDetailsReport = (params) =>
  get('/we/payroll/reports/payroll/details/', params);
// Same endpoint, totals only: { payroll_count: N } — note the key differs from the
// sibling report's employee_count.
export const fetchPayrollDetailsOverview = (params) =>
  get('/we/payroll/reports/payroll/details/', { ...params, keywords: 'overview' });


export const fetchPayrollTaxLiabilityReport = (params) =>
  get('/we/payroll/reports/payroll/tax-liability/', params);
// Same endpoint, totals only: { group_count: N }.
export const fetchPayrollTaxLiabilityOverview = (params) =>
  get('/we/payroll/reports/payroll/tax-liability/', { ...params, keywords: 'overview' });


export const fetchPayrollTaxWageSummaryReport = (params) =>
  get('/we/payroll/reports/payroll/tax-and-wage-summary/', params);
// Same endpoint, totals only: { group_count: N }.
export const fetchPayrollTaxWageSummaryOverview = (params) =>
  get('/we/payroll/reports/payroll/tax-and-wage-summary/', { ...params, keywords: 'overview' });


export const fetchPayrollTotalCostReport = (params) =>
  get('/we/payroll/reports/payroll/total-cost/', params);
// Same endpoint, totals only: { total_payroll_cost: "43060.00" } — handy for a dashboard
// tile without pulling the whole ladder.
export const fetchPayrollTotalCostOverview = (params) =>
  get('/we/payroll/reports/payroll/total-cost/', { ...params, keywords: 'overview' });
export const fetchPayrollDeductionContributionReport = (params) =>
  get('/we/payroll/reports/payroll/deduction-and-contribution/', params);
export const fetchPayrollMultipleWorksiteReport = (params) =>
  get('/we/payroll/reports/payroll/multiple-worksite/', params);
export const fetchPayrollTaxCenterFilling = (params) =>
  get('/we/payroll/tax-center/filing-preview', params);
export const fetchPayScheduleListOnSalaryProcess = (params) =>
  get(`/we/payroll/pay-schedule/employee-count`, params); //new added

//tax payment
export const postTaxPayment = (data) => post('/we/payroll/tax-center/pay', data);
export const postTaxBanditsBusiness = (data) => post('/we/taxbandits/business/create', data);
export const postSalesTax = (data) => post('/we/sales/taxes', data);

//ocr
export const postOCR = (data) => postAxiosMultipart('/we/receipt-ocr', data);
export const DownloadEmployeeExcel = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(
    'https://balanzifyapi.jumatechs.xyz/api/v1/we/employees/list?is_excel=true',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }

  // Get the blob data (Excel binary)
  const blob = await response.blob();

  // Create a temporary URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create a temporary link element
  const a = document.createElement('a');
  a.href = url;
  a.download = 'employees.xlsx'; // Default filename
  document.body.appendChild(a);

  // Programmatically click the link to trigger download
  a.click();

  // Clean up
  a.remove();
  window.URL.revokeObjectURL(url);
};
// 941
export const fetch941BusinessDetails = () => get('/we/taxbandits/business/detail');
export const post941FormCreate = (data) => post('/we/taxbandits/form-941/create', data);
export const post941SignForm = (data) => post('/we/taxbandits/form-8453emp/request-payer', data);
export const post941Transmit = (data) => post('/we/taxbandits/form-941/transmit', data);
export const postReconcileForm = (data) => post('/we/transactions/reconcile', data);
export const postReconcileTransactions = (data) =>
  post('/we/transactions/reconcile/complete', data);
export const fetchAddAuthenticationApp = () => get('/accounts/totp/setup');
export const confirmAuthenticationAppOTP = (data) => post('/accounts/totp/setup/confirm', data);
export const postDisable2fa = (data) => post('/accounts/totp/disable', data);

export const fetchChatDetails = (uid) => get(`/chat/rooms/${uid}/`);
export const patchChatRoomMember = (uid, memberUid, data) =>
  patch(`/chat/rooms/${uid}/members/${memberUid}/`, data);
export const patchChatRoom = (uid, data) => patch(`/chat/rooms/${uid}/`, data);
export const deleteChatRoomMember = (uid, memberUid) =>
  del(`/chat/rooms/${uid}/members/${memberUid}/`);

export const patchMoovAccountAPI = async (uid, data, token) => {
  const res = await fetch(`https://api.moov.io/accounts/${uid}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Moov-Version': 'v2026.04.00',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      responseData?.error ||
      (Object.keys(responseData).length ? JSON.stringify(responseData) : null);
    throw new Error(msg || `Moov account PATCH failed (${res.status})`);
  }
  return { ...responseData, success: true };
};

export const deleteUser = (uid) => del(`/accounts/user-onboards/${uid}`);

// ===============================================data migration===========================================
// Base path: /we/data-migrations
// Workflow: create -> auto-map / map -> validate -> review-impact -> dry-run -> confirm -> results / reconciliation / rollback

// Job listing & detail
export const fetchMigrationJobs = (params) => get('/we/data-migrations', params);
export const fetchMigrationJob = (uid) => get(`/we/data-migrations/${uid}`);

// Available data types (handlers)
export const fetchMigrationDataTypes = () => get('/we/data-migrations/data-types');

// Template download. Pass { binary: true } when the backend returns an
// .xlsx (or any binary) file so axios doesn't decode the bytes as text.
export const downloadDemoFile = (id, { binary = false } = {}) =>
  get(`/we/data-migrations/templates/${id}/download`, {}, binary ? { responseType: 'blob' } : {});

// Step 1+2: Create job (multipart with file) or with json_data only
export const createMigrationJob = (data) => postAxiosMultipart('/we/data-migrations', data);

// Step 2 (re-upload): wipes existing rows, mappings, issues, impact lines.
export const uploadMigrationFile = (uid, data) =>
  postAxiosMultipart(`/we/data-migrations/${uid}/upload`, data);

// Preview parsed rows
export const fetchMigrationPreview = (uid) => get(`/we/data-migrations/${uid}/preview`);

// Step 3: Auto-map columns to handler target fields
export const autoMapMigrationFields = (uid) => post(`/we/data-migrations/${uid}/auto-map`, {});

// Step 3 (manual): replace all mappings with provided list
export const saveMigrationMapping = (uid, data) => post(`/we/data-migrations/${uid}/mapping`, data);

// Step 5: Validate rows (populates validation issues + counters)
export const validateMigration = (uid) => post(`/we/data-migrations/${uid}/validate`, {});

// Step 5 (issues list)
export const fetchMigrationValidationIssues = (uid) =>
  get(`/we/data-migrations/${uid}/validation-issues`);

// Step 5 (fix a row)
export const fixMigrationRow = (uid, rowUid, data) =>
  post(`/we/data-migrations/${uid}/rows/${rowUid}/fix`, data);

// Step 6: Accounting impact preview
export const reviewMigrationImpact = (uid) => post(`/we/data-migrations/${uid}/review-impact`, {});

// Step 6: Dry run safety check
export const dryRunMigration = (uid) => post(`/we/data-migrations/${uid}/dry-run`, {});

// Step 7: Confirm import (commit)
export const confirmMigration = (uid, data) => post(`/we/data-migrations/${uid}/confirm`, data);

// Step 8: Import results
export const fetchMigrationResults = (uid) => get(`/we/data-migrations/${uid}/results`);

// Step 8: Reconciliation summary
export const fetchMigrationReconciliation = (uid) =>
  get(`/we/data-migrations/${uid}/reconciliation`);

// Step 8: Rollback the import
export const rollbackMigration = (uid, data) => post(`/we/data-migrations/${uid}/rollback`, data);

// CSV error report (browser-download URL helper used in UI)
export const fetchMigrationErrorReport = (uid) => get(`/we/data-migrations/${uid}/error-report`);

// Audit logs for a job
export const fetchMigrationAuditLogs = (uid) => get(`/we/data-migrations/${uid}/audit-logs`);

export const fetchPaycheckReport = (params) => get('/we/payroll/reports/paycheck', params);

export const fetchPaycheckDetails = (employeeUID, payCheckUID, params) =>
  get(
    `/we/payroll/reports/paycheck/detail?employee_uid=${employeeUID}&salary_process_uid=${payCheckUID}`,
    params
  );

export const uploadCustomerFile = (data, uploadProgress) =>
  postAxiosMultipart('/we/customers/bulk-create', data, uploadProgress);

// ==================================++++++++++++++++++++=============================Dashboard Data===========================================
export const fetchKPIData = () => get('/we/dashboards/v2/kpi-summary');
export const fetchCashFlowChart = ({ params }) => get('/we/dashboards/v2/cash-flow', params);
export const fetchProfitLossChart = ({ params }) => get('/we/dashboards/v2/profit-loss', params);
export const fetchIncomeVsExpenseChart = ({ params }) =>
  get('/we/dashboards/v2/income-vs-expense', params);
export const fetchInsightsData = () => get('/we/dashboards/v2/ai-insights');
export const fetchAttendanceSummary = () => get('/we/dashboards/v2/attendance-summary');
export const fetchEmployeeOverview = () => get('/we/dashboards/v2/employee-overview');
export const fetchLeaveRequestsOverview = () => get('/we/dashboards/v2/leave-requests');
export const fetchWorkforceOverview = () => get('/we/dashboards/v2/todays-workforce');
export const fetchUpcomingEvents = () => get('/we/dashboards/v2/upcoming-events');
export const fetchInvoiceDashboardOverview = () => get('/we/dashboards/v2/invoice-overview');
export const fetchRecentTransactions = () => get('/we/dashboards/v2/recent-transactions');
export const fetchBankBalances = () => get('/we/dashboards/v2/bank-balances');
export const fetchSupportTicketOverview = () => get('/we/dashboards/v2/support-tickets');
export const fetchActivityFeed = () => get('/we/dashboards/v2/activity-feed');
export const fetchTopCustomers = () => get('/we/dashboards/v2/top-customers');
export const fetchTopProducts = () => get('/we/dashboards/v2/top-selling-products');
export const fetchExpenseHealthSnapshot = () => get('/we/dashboards/v2/mini-expense-cash');
export const fetchApprovalCenter = () => get('/we/dashboards/v2/approval-center');
export const fetchExpenseCashHealth = () => get('/we/dashboards/v2/mini-expense-cash');
export const fetchPayrollSnapshot = () => get('/we/dashboards/v2/payroll-snapshot');
export const fetchTaxCenterSnapshot = () => get('/we/dashboards/v2/tax-center-snapshot');
export const fetchARAging = () => get('/we/dashboards/v2/ar-aging');
export const fetchAPAging = () => get('/we/dashboards/v2/ap-aging');
export const fetchExpenseBreakdown = () => get('/we/dashboards/v2/expense-breakdown');
export const fetchCashRunway = () => get('/we/dashboards/v2/cash-runway');


const V2_BASE = baseURL.replace('/api/v1', '/api/v2');

// --- entitlements (drive menus, routes & feature gating) ---
export const fetchSubscriptionAccessManifest = () =>
  get(`${V2_BASE}/we/subscriptions/entitlements/access-manifest`);
export const checkSubscriptionEntitlement = (data) =>
  post(`${V2_BASE}/we/subscriptions/entitlements/check`, data);

// --- billing (overview, usage, invoices) ---
export const fetchSubscriptionBillingCurrent = (params) =>
  get(`${V2_BASE}/we/subscriptions/billing/current`, params);
export const postSubscriptionBillingPreview = (data) =>
  post(`${V2_BASE}/we/subscriptions/billing/preview`, data);
export const fetchSubscriptionUsage = (params) =>
  get(`${V2_BASE}/we/subscriptions/billing/usage`, params);
export const fetchSubscriptionInvoices = (params) =>
  get(`${V2_BASE}/we/subscriptions/billing/invoices`, params);
export const fetchSubscriptionInvoice = (uid) =>
  get(`${V2_BASE}/we/subscriptions/billing/invoices/${uid}`);

export const postSubscriptionCheckout = (data) =>
  post(`${V2_BASE}/we/subscriptions/checkout`, data);

// --- promotions & trials ---
/** Invalid coupons may return 400 with { valid: false, message } — surface message in UI, no global toast. */
export const validateSubscriptionCoupon = async (data) => {
  try {
    return await post(
      `${V2_BASE}/we/subscriptions/promotions/validate-coupon`,
      data,
      {},
      false,
      true,
    );
  } catch (error) {
    const body = error?.response?.data;
    if (body && typeof body === 'object') {
      return {
        ...body,
        valid: body.valid ?? false,
        success: false,
      };
    }
    throw error;
  }
};
export const fetchSubscriptionReferral = (params) =>
  get(`${V2_BASE}/we/subscriptions/promotions/referral`, params);
export const fetchSubscriptionTrialStatus = (params) =>
  get(`${V2_BASE}/we/subscriptions/trial/status`, params);
export const postSubscriptionTrialStart = (data) =>
  post(`${V2_BASE}/we/subscriptions/trial/start`, data);

// --- feature catalog (admin v2; modules + nested features) ---
export const fetchSubscriptionFeatures = (params) =>
  get(`${V2_BASE}/adminio/subscriptions/features`, params);



// --- promotions (admin v2 coupons & offers) ---
export const fetchSubscriptionCoupons = (params) =>
  get(`${V2_BASE}/adminio/subscriptions/coupons`, params);
export const postSubscriptionCoupon = (data) =>
  post(`${V2_BASE}/adminio/subscriptions/coupons`, data);
export const fetchSubscriptionCoupon = (uid) =>
  get(`${V2_BASE}/adminio/subscriptions/coupons/${uid}`);
export const patchSubscriptionCoupon = (uid, data) =>
  patch(`${V2_BASE}/adminio/subscriptions/coupons/${uid}`, data);
export const deleteSubscriptionCoupon = (uid) =>
  del(`${V2_BASE}/adminio/subscriptions/coupons/${uid}`);
export const fetchSubscriptionOffers = (params) =>
  get(`${V2_BASE}/adminio/subscriptions/offers`, params);
export const postSubscriptionOffer = (data) =>
  post(`${V2_BASE}/adminio/subscriptions/offers`, data);
export const fetchSubscriptionOffer = (uid) =>
  get(`${V2_BASE}/adminio/subscriptions/offers/${uid}`);
export const patchSubscriptionOffer = (uid, data) =>
  patch(`${V2_BASE}/adminio/subscriptions/offers/${uid}`, data);
export const deleteSubscriptionOffer = (uid) =>
  del(`${V2_BASE}/adminio/subscriptions/offers/${uid}`);

// --- lifecycle (self-service cancel / reactivate / dunning) ---
export const fetchSubscriptionLifecycleState = (params) =>
  get(`${V2_BASE}/we/subscriptions/lifecycle/state`, params);
export const postSubscriptionCancel = (data) =>
  post(`${V2_BASE}/we/subscriptions/lifecycle/cancel`, data);
export const postSubscriptionReactivate = (data) =>
  post(`${V2_BASE}/we/subscriptions/lifecycle/reactivate`, data);
export const fetchSubscriptionEvents = (params) =>
  get(`${V2_BASE}/we/subscriptions/lifecycle/events`, params);



// admin subscription dashboard
export const fetchAdminKPIs = () => get(`${V2_BASE}/adminio/subscriptions/analytics/overview`);
export const fetchAdminRevenueTrend = () => get(`${V2_BASE}/adminio/subscriptions/analytics/revenue-trend`);
export const fetchAdminPlanDistribution = () => get(`${V2_BASE}/adminio/subscriptions/analytics/plan-distribution`);
export const fetchAdminTrialFunnel = () => get(`${V2_BASE}/adminio/subscriptions/analytics/trial-funnel`);
export const fetchAdminRecentActivity = (params) =>
  get(`${V2_BASE}/adminio/subscriptions/audit-logs`, { limit: 5, ...params });

export const fetchAdminALLRecentActivity = (params) =>
  get(`${V2_BASE}/adminio/subscriptions/audit-logs`, { limit: 10, ...params });


export const fetchAdminSubscriptionInvoices = (params) =>
  get(`${V2_BASE}/adminio/subscriptions/invoices`, params);

export const fetchAdminSubscriptionTrials = (params) =>
  get(`${V2_BASE}/adminio/subscriptions/trials`, params);


export const fetchAdminSubscriptionReferrals = (params) =>
  get(`${V2_BASE}/we/subscriptions/promotions/referral`, params);

export const fetchAdminSubscriptionMetrics = (params) =>
  get(`${V2_BASE}/adminio/subscriptions/metrics`, params);
export const postAdminSubscriptionMetric = (data) =>
  post(`${V2_BASE}/adminio/subscriptions/metrics`, data);
export const patchAdminSubscriptionMetric = (uid, data) =>
  patch(`${V2_BASE}/adminio/subscriptions/metrics/${uid}`, data);
export const deleteAdminSubscriptionMetric = (uid) =>
  del(`${V2_BASE}/adminio/subscriptions/metrics/${uid}`);

// admin subscription add-ons (catalog CRUD)
export const fetchAdminSubscriptionAddons = (params) =>
  get(`${V2_BASE}/adminio/subscriptions/addons`, params);
export const postAdminSubscriptionAddon = (data) =>
  post(`${V2_BASE}/adminio/subscriptions/addons`, data);
export const patchAdminSubscriptionAddon = (uid, data) =>
  patch(`${V2_BASE}/adminio/subscriptions/addons/${uid}`, data);
export const deleteAdminSubscriptionAddon = (uid) =>
  del(`${V2_BASE}/adminio/subscriptions/addons/${uid}`);


export const fetchAdminTenantsSubscription = (params) =>
  get(`${V2_BASE}/adminio/subscriptions/tenants`, params);