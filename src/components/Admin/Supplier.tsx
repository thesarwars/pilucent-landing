import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import SelectInput from "../ui/SelectInput"

interface SupplierStats {
  title: string
  items: {
    label: string
    amount: number
  }[]
}

interface SupplierDashboardProps {
  donutData: {
    name: string
    value: number
    color: string
  }[]
  stats: {
    unbilled: SupplierStats
    unpaid: SupplierStats
  }
}

export function SupplierDashboard({ donutData, stats }: SupplierDashboardProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Supplier Management</h1>
          <p className="text-sm text-muted-foreground">Location List</p>
        </div>
        <div className="flex items-center gap-2">
        <select className="flex items-center justify-end gap-4 rounded-full border p-3 outline-none">
                <option value="all">All</option>
                <option value="this-month">This Month</option>
                <option value="this-year">This Year</option>
              </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <div className="relative h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="90%"
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-4xl font-bold">54</span>
                <span className="text-2xl font-bold">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h2 className="text-sm font-medium text-gray-500">Unbilled Last 365 Days</h2>
            {stats.unbilled.items.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-lg font-semibold">
                    ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <h2 className="text-sm font-medium text-gray-500">Unpaid Last 365 Days</h2>
            {stats.unpaid.items.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-900 mt-2" />
                <div>
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-lg font-semibold">
                    ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}