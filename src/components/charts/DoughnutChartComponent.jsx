import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const makeTransparent = (color, alpha = "4D") => {
  return color.length === 7 ? color + alpha : color;
};

const formatMoney2 = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const DoughnutChartComponent = ({ data, tooltipMode = "default" }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const hasData = Array.isArray(data) && data.some((item) => Number(item.value) > 0);
  if (!hasData) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        No data to display
      </div>
    );
  }

  const originalColors = data.map((item) => item.color || "#009845");

  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => Number(item.value) || 0),
        backgroundColor: originalColors.map((color, index) =>
          hoveredIndex === null || hoveredIndex === index ? color : makeTransparent(color)
        ),
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, pointStyle: "circle" },
      },
      tooltip: {
        callbacks: {
          // ✅ เปลี่ยน tooltip เฉพาะ Point Users
          label: (tooltipItem) => {
            const idx = tooltipItem.dataIndex;
            const row = data[idx] || {};
            const point = Number(row.value ?? 0) || 0;

            if (tooltipMode === "pointUsers") {
              // ต้องการ: Value : 775 (1,838,500.00฿)
              const totalValue = Number(row.total_value ?? 0) || 0;
              return ` Point : ${point.toLocaleString("en-US")} (${formatMoney2(totalValue)}฿)`;
            }

            // default เดิม: Value : 775 (25.00%)
            const dataset = tooltipItem.dataset;
            const value = Number(dataset.data[idx] ?? 0) || 0;
            const total = dataset.data.reduce((sum, num) => sum + Number(num || 0), 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : "0.00";
            return ` Value: ${value.toLocaleString("en-US")} (${percentage}%)`;
          },
        },
      },
    },
    onHover: (event, elements) => {
      if (elements.length > 0) setHoveredIndex(elements[0].index);
      else setHoveredIndex(null);
    },
  };

  return (
    <div className="h-[400px] w-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DoughnutChartComponent;
