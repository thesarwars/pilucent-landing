import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "All Tickets", value: 1000, color: "#3B82F6" },
  { name: "Close Tickets", value: 200, color: "#A855F7" },
  { name: "Pending Tickets", value: 200, color: "#F59E0B" },
  { name: "Create Today Tickets", value: 200, color: "#6B7280" },
  { name: "Open Tickets", value: 200, color: "#10B981" },
];

const CustomPieChart = () => {
  return (
    <div className="flex flex-col md:flex-row w-full border items-center justify-between rounded-lg  bg-white p-4">
      <div className="flex-1">
        <h2 className="mb-4 text-lg font-semibold">Support & Ticket</h2>
        <ResponsiveContainer width="110%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className=" text-gray-400 text-sm"
              style={{ fontSize: "20px" }}
            >
              Total
              <tspan x="50%" dy="1.2em" className="font-bold text-lg text-black">
                $3,556.00
              </tspan>
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex-1 space-y-3">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></p>
              <span className="text-sm">{entry.name}</span>
            </div>
            <span className="text-sm font-semibold">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomPieChart;
