import { ChartOfAccount as ChartOfAccountType } from './account'

interface ChartOfAccountProps {
  chartOfAccount: ChartOfAccountType
}

export default function ChartOfAccount({ chartOfAccount }: ChartOfAccountProps) {
  return (
   <div className="bg-gray-50 rounded-lg p-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Title</p>
          <p className="font-medium">{chartOfAccount.title}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Code</p>
          <p className="font-medium">{chartOfAccount.code}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Type</p>
          <p className="font-medium">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {chartOfAccount.kind}
            </span>
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-medium">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                chartOfAccount.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {chartOfAccount.status}
            </span>
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Opening Balance</p>
          <p className="font-medium">${Number.parseFloat(chartOfAccount.opening_balance).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Currency</p>
          <p className="font-medium">{chartOfAccount.currency}</p>
        </div>
        {chartOfAccount.account_type && (
          <div>
            <p className="text-sm text-gray-500">Account Type</p>
            <p className="font-medium">{chartOfAccount.account_type.title}</p>
          </div>
        )}
        {chartOfAccount.detail_type && (
          <div>
            <p className="text-sm text-gray-500">Detail Type</p>
            <p className="font-medium">{chartOfAccount.detail_type.title}</p>
          </div>
        )}
      </div>
    </div>
  )
}
