"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { ChevronDown } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
});

const filterOptions = ["Last week", "Last month", "Last 4 months", "Last year"];

export default function ProjectsChart() {
  const [filter, setFilter] = useState("Last 4 months");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const data = {
    labels: ["August", "September", "October", "November"],
    datasets: [
      {
        label: "UI/UX",
        data: [4, 3, 1, 4],
        backgroundColor: "#3B82F6",
        barThickness: 8,
      },
      {
        label: "Web Developer",
        data: [1, 1, 2, 1],
        backgroundColor: "#FACC15",
        barThickness: 8,
      },
      {
        label: "Web Designer",
        data: [1, 1, 1, 1],
        backgroundColor: "#F87171",
        barThickness: 8,
      },
    ],
  };

  const options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false, // ✅ Disable auto-resizing of height
    plugins: {
      legend: { position: "bottom" as const },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          drawBorder: false,
          display: true,
        },
      },
      y: {
        stacked: true,
        grid: {
          drawBorder: false,
          display: false,
        },
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-[#ECECEC]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">NO. OF NEW PROJECTS</h2>

        {/* Custom Select */}
        <div ref={dropdownRef} className="relative w-35 text-sm">
          <div
            onClick={() => setOpen(!open)}
            className="flex items-center justify-between cursor-pointer"
            style={{
              border: "1px solid #ECECEC",
              borderRadius: "6px",
              padding: "7px 12px",
              fontSize: "14px",
              letterSpacing: "-0.5px",
              color: "#7F7F7F",
              background: "#fff",
              outline: "none",
            }}
          >
            <span>{filter}</span>
            <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </div>

          {open && (
            <div
              className="absolute mt-1 w-full bg-white shadow-md z-10"
              style={{
                border: "1px solid #ECECEC",
                borderRadius: "6px",
                fontSize: "14px",
                letterSpacing: "-0.5px",
                boxShadow:"0px_2px_4px_0px_#0000000A",
              }}
            >
              {filterOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => {
                    setFilter(option);
                    setOpen(false);
                  }}
                  className="cursor-pointer hover:bg-gray-100"
                  style={{
                    padding: "5px 12px",
                    color: filter === option ? "#000" : "#7F7F7F",
                    fontWeight: filter === option ? 500 : 400,
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Fixed height container */}
      <div className="w-full h-[300px] md:h-[350px] lg:h-[378px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
