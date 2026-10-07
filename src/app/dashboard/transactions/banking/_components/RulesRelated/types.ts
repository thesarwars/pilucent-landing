export interface Condition {
  field: string
  operator: string
  value: string
}

export interface SplitDetail {
  percentage: string
  category: string
}

export interface AssignOptions {
  transactionType: string
  category: string
  productService: string
  payee: string
  customer: string
  tags: string
  replaceBankMemo: string
  keepExistingMemo: boolean
}

export interface CustomDropdownProps {
  options: any[]
  value?: any
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  borderColor?: string
}

export type AssignMode = "assign" | "exclude"

export interface FormState {
  isAutoConfirm: boolean
  conditions: Condition[]
  assignMode: AssignMode
  showSplit: boolean
  splitDetails: SplitDetail[]
  splitBy: string
  assignOptions: AssignOptions
  showAdditionalFields: boolean
  ruleName: string
}
