"use client";
import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { SlidersHorizontal } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type FilterType = "Weekly" | "BiWeekly" | "Monthly";

export default function WeeklyAttendance() {
  const [filter, setFilter] = useState<FilterType>("Weekly");
  const [showFilters, setShowFilters] = useState(false);

  // Demo data
  const labelsByFilter: Record<FilterType, string[]> = {
    Weekly: ["Sales", "Designer", "Marketing", "Developer", "UI/UX"],
    BiWeekly: [
      "Sales W1",
      "Designer W1",
      "Marketing W1",
      "Dev W1",
      "UI/UX W1",
      "Sales W2",
      "Designer W2",
      "Marketing W2",
      "Dev W2",
      "UI/UX W2",
    ],
    Monthly: [
      "Sales W1",
      "Designer W1",
      "Marketing W1",
      "Dev W1",
      "UI/UX W1",
      "Sales W2",
      "Designer W2",
      "Marketing W2",
      "Dev W2",
      "UI/UX W2",
      "Sales W3",
      "Designer W3",
      "Marketing W3",
      "Dev W3",
      "UI/UX W3",
      "Sales W4",
      "Designer W4",
      "Marketing W4",
      "Dev W4",
      "UI/UX W4",
    ],
  };

  const datasetsByFilter: Record<FilterType, number[]> = {
    Weekly: [40, 58, 86, 60, 42],
    BiWeekly: [35, 55, 80, 62, 40, 38, 60, 85, 64, 42],
    Monthly: [
      38, 55, 86, 60, 42, 35, 60, 84, 65, 40, 39, 57, 82, 62, 44, 40, 58, 86,
      60, 42,
    ],
  };

  const highlightIndexByFilter: Record<FilterType, number> = {
    Weekly: 2, // Marketing
    BiWeekly: 7, // Marketing W2
    Monthly: 2, // Marketing W1
  };

  const labels = labelsByFilter[filter];
  const values = datasetsByFilter[filter];
  const highlightIndex = highlightIndexByFilter[filter];

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: values.map((_, i) =>
          i === highlightIndex ? "#009EFF" : "rgba(0,158,255,0.1)"
        ),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.raw}%`,
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        min: 0,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
        grid: {
          drawTicks: false,
        },
      },
      x: {
        grid: {
          display: false, // ✅ remove vertical lines
        },
      },
    },
  };

  // Plugin for label above highlighted bar
  const labelPlugin = {
    id: "labelPlugin",
    afterDatasetsDraw: (chart: any) => {
      const { ctx } = chart;
      chart.getDatasetMeta(0).data.forEach((bar: any, i: number) => {
        if (i === highlightIndex) {
          ctx.save();
          ctx.fillStyle = "#000";
          ctx.font = "bold 14px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`${values[i]}%`, bar.x, bar.y - 10);
          ctx.restore();
        }
      });
    },
  };

  return (
    <div
      className="p-4 rounded-2xl bg-white relative "
      style={{ boxShadow: "6px 6px 54px 0px #0000000D" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
      <h2 className="text-[18px] font-semibold text-[#2C2C2C]">
{filter} Attendance</h2>
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <SlidersHorizontal size={18} />
          </button>

          {/* Dropdown */}
          {showFilters && (
            <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded-lg border">
              {Object.keys(labelsByFilter).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f as FilterType);
                    setShowFilters(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                    filter === f ? "font-semibold text-blue-500" : "text-gray-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <Bar options={options} data={data} plugins={[labelPlugin]} height={90} />
    </div>
  );
}
