"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface RadialBarChartProps {
  series?: number[];
  labels?: string[];
  colors?: string[];
  height?: number;
  startAngle?: number;
  endAngle?: number;
  hollowSize?: string;
  /** Actual values to show in tooltip on hover (e.g. dollar amounts) instead of % */
  totals?: number[];
}

const RadialBarChart: React.FC<RadialBarChartProps> = ({
  series = [76, 67, 61, 90],
  labels = ["Purchases", "Other Miscellaneous Expense", "Cost of goods sold",],
  colors =  ["#7E54D9", "#5CCD49", "#EDA147"],
  height = 390,
  startAngle = 0,
  endAngle = 270,
  hollowSize = "100%",
  totals,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const options = useMemo(
    () => ({
      chart: {
        height: height,
        type: "radialBar" as const,
      },
      plotOptions: {
        radialBar: {
          offsetY: 0,
          startAngle: startAngle,
          endAngle: endAngle,
          hollow: {
            margin: 5,
            size: hollowSize,
            background: "transparent",
            image: undefined,
          },
          dataLabels: {
            name: {
              show: true,
            },
            value: {
              show: true,
            },
          },
        },
      },
      colors: colors,
      labels: labels,
      tooltip: {
        y: {
          formatter: function (val: number, opts: { seriesIndex: number }) {
            if (totals && totals[opts.seriesIndex] != null) {
              return `$${Number(totals[opts.seriesIndex]).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
            return `${val}%`;
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              show: false,
            },
          },
        },
      ],
    }),
    [height, startAngle, endAngle, hollowSize, colors, labels, totals]
  );

  if (!isClient) {
    return <div style={{ height: `${height}px` }} />;
  }

  return (
    <div>
      <div id="chart">
        <ReactApexChart
          options={options}
          series={series}
          type="radialBar"
          height={height}
        />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default RadialBarChart;








