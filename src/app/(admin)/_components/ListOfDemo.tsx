"use client"; // Only needed if using Next.js App Router

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Schedule", value: 200, color: "#EF787A" }, // Blue
  { name: "Request", value: 200, color: "#1682DF" }, // Purple
  { name: "Archived", value: 200, color: "#C779E5" }, // Red
];

const ListOfDemo = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensures the chart is only rendered on the client
  }, []);

  return (
    <div className="flex flex-col  rounded-lg bg-white px-4 py-5 pb-9 border">
      <h2 className="text-lg font-semibold">List of Live Demo</h2>

      {isClient && (
        <div className="relative mx-auto">
      
          <PieChart width={200} height={200}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={60}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold">$75.5k</span>
            <span className="text-sm text-green-500 bg-green-100 rounded-md px-1">+10%</span>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between ">
            <div className="flex gap-2 items-center">
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

export default ListOfDemo;
