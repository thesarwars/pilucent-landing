"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import Image from 'next/image'


interface InvoiceCardProps {
    totalAmount: number
    netIncomeText: string
    chartData: {
      name: string
      value: number
      color: string
    }[]
  }

interface CircleChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  colors: string[]
  config: {
    innerRadius: string
    outerRadius: string
  }
}


export interface StatCardProps {
    icon: string;
    label: string;
    value: number;
    bgColor?: string;
    iconBgColor?: string;
  }
  
  export interface StatsSectionProps {
    stats: StatCardProps[];
  }



  export function StatsSection({ stats }: StatsSectionProps) {
    return (
      <section className="my-5 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </section>
    )
  }

  
export function StatCard({ icon, label, value, bgColor = 'bg-slate-200', iconBgColor = 'bg-slate-600' }: StatCardProps) {
    return (
      <div className={`space-y-2 rounded-lg ${bgColor} p-6`}>
        <div className={`h-12 w-12 flex items-center justify-center rounded-lg ${iconBgColor}`}>
          <Image
            src={icon}
            alt={label}
            width={24}
            height={24}
            className="text-white"
          />
        </div>
        <p className="text-sm text-gray-600">{label}</p>
        <h2 className="text-3xl font-semibold">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(value)}
        </h2>
      </div>
    )
  }


export function InvoiceCard({ totalAmount, netIncomeText, chartData }: InvoiceCardProps) {
    const colors = chartData.map(item => item.color)
  
    return (
      <div className="p-6">
        <div className="flex flex-col xl:flex-row items-start justify-between gap-8">
          <div className="space-y-2 xl:min-w-[200px]">
            <div className="text-base text-gray-500 font-medium">Invoice</div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-500">USD</span>
              <span className="text-2xl font-semibold">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              {netIncomeText}
            </div>
          </div>
          <div className="w-full xl:max-w-[400px]">
            <div className="h-[180px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius="65%"
                    outerRadius="85%"
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-8 text-sm">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    style={{ backgroundColor: item.color }}
                    className="h-3 w-3 rounded-full"
                  />
                  <div className="flex gap-2 items-baseline">
                    <span className="text-gray-600 font-medium whitespace-pre">{item.name}</span>
                    <span className="text-gray-900 font-semibold">${item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  

export function CircleChart({ data, colors, config }: CircleChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          startAngle={180}
          endAngle={0}
          innerRadius={config.innerRadius}
          outerRadius={config.outerRadius}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}