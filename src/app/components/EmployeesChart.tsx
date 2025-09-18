"use client";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";

// Register chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function EmployeesChart() {
  const data: ChartData<"doughnut"> = {
    labels: ["Business", "Design", "Development", "Testing"],
    datasets: [
      {
        label: "Employees",
        data: [30, 40, 25, 20],
        backgroundColor: ["#F87171", "#FACC15", "#3B82F6", "#22C55E"],
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false, // ✅ Disable automatic aspect ratio
    cutout: "75%", 
    radius: "80%",
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center bg-white rounded-2xl border border-[#ECECEC]">
      <div className="flex justify-center items-center mt-3 -mb-2">
        <h2 className="font-semibold text-center">TOTAL EMPLOYEES</h2>
      </div>
      <div className="w-full h-[300px] md:h-[350px] lg:h-[400px]"> {/* ✅ Fixed height */}
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
