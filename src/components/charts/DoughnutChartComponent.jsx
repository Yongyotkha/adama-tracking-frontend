import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Function to generate transparent color
const makeTransparent = (color, alpha = "4D") => {
  return color.length === 7 ? color + alpha : color; // Convert "#009845" → "#0098454D"
};

const DoughnutChartComponent = ({ data }) => {
  // State to store hovered index
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Define original colors or fallback to green
  const originalColors = data.map((item) => item.color || "#009845");

  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: originalColors.map((color, index) =>
          hoveredIndex === null || hoveredIndex === index
            ? color // Original color for hovered segment
            : makeTransparent(color) // Transparent for non-hovered segments
        ),
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%", // Reduce the doughnut hole size
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true, // Change legend marker style
          pointStyle: "circle", // Use circle markers instead of rectangles
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const dataset = tooltipItem.dataset;
            const value = dataset.data[tooltipItem.dataIndex];

            // Calculate total sum dynamically
            const total = dataset.data.reduce((sum, num) => sum + num, 0);

            // Calculate percentage dynamically
            const percentage = ((value / total) * 100).toFixed(2);

            return ` Value: ${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    onHover: (event, elements) => {
      if (elements.length > 0) {
        setHoveredIndex(elements[0].index);
      } else {
        setHoveredIndex(null);
      }
    },
  };

  return (
    <div className="h-[400px] w-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DoughnutChartComponent;
