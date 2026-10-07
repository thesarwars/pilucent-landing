export interface AccountType {
  slug: string
  title: string
  description: string
  status: string
  kind: string
}

export interface DetailType {
  slug: string
  title: string
  description: string
  status: string
  kind: string
}

export interface ChartOfAccount {
  uid: string
  title: string
  date: string
  code: string
  status: string
  kind: string
  account_type: AccountType | null
  detail_type: DetailType | null
  opening_balance: string
  currency: string
  description: string | null
  parent: any | null
  is_fixed: boolean
  created_at: string
  updated_at: string
}

export interface Counterparty {
  name: string
  type: string
  website: string | null
  logo_url: string | null
  confidence_level: string
  entity_id: string | null
  phone_number: string | null
}

export interface Location {
  address: string | null
  city: string | null
  region: string | null
  postal_code: string | null
  country: string | null
  lat: number | null
  lon: number | null
  store_number: string | null
}

export interface PaymentMeta {
  reference_number: string | null
  ppd_id: string | null
  payee: string | null
  by_order_of: string | null
  payer: string | null
  payment_method: string | null
  payment_processor: string | null
  reason: string | null
}

export interface PersonalFinanceCategory {
  confidence_level: string
  detailed: string
  primary: string
}

export interface Transaction {
  account_id: string
  account_owner: string | null
  amount: number
  authorized_date: string
  authorized_datetime: string | null
  category: string[] | null
  category_id: string | null
  check_number: string | null
  counterparties: Counterparty[]
  date: string
  datetime: string | null
  iso_currency_code: string
  location: Location
  logo_url: string | null
  merchant_entity_id: string | null
  merchant_name: string | null
  name: string
  payment_channel: string
  payment_meta: PaymentMeta
  pending: boolean
  pending_transaction_id: string | null
  personal_finance_category: PersonalFinanceCategory | null
  personal_finance_category_icon_url: string | null
  transaction_code: string | null
  transaction_id: string
  transaction_type: string
  unofficial_currency_code: string | null
  website: string | null
}

export interface Balances {
  available: number | null
  current: number | null
  limit: number | null
  iso_currency_code: string
  unofficial_currency_code: string | null
}

export interface Account {
  account_id: string
  balances: Balances
  mask: string
  name: string
  official_name: string | null
  type: string
  subtype: string | null
  holder_category?: string
  transactions: Transaction[]
  chart_of_account: ChartOfAccount
   transaction_value: string
}
