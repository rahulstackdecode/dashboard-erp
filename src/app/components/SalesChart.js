"use client";
import { useState, useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { ChevronDown } from "lucide-react";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler, Legend);

export default function SalesChart() {
  const [filter, setFilter] = useState("January");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filterOptions = ["January", "February", "March", "April", "May"];


  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const data = {
    labels: Array(20).fill("5k"),
    datasets: [
      {
        label: "Sales",
        data: [
          20, 25, 40, 45, 30, 50, 60, 35, 50, 45, 60, 20, 25, 70, 55, 50, 45, 40, 50, 55,
        ],
        borderColor: "#1DA1F2",
        backgroundColor: "rgba(29,161,242,0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#1DA1F2",
        pointBorderColor: "#fff",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1DA1F2",
        titleColor: "#fff",
        bodyColor: "#fff",
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#999" },
      },
      y: {
        min: 20,
        max: 100,
        ticks: { stepSize: 20, callback: (val) => val + "%" },
        grid: { color: "#eee" },
      },
    },
  };

  return (
    <div
      className="p-6.5 bg-white rounded-[14px]"
      style={{ boxShadow: "6px 6px 54px 0px rgba(0, 0, 0, 0.05)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] sm:text-2xl font-semibold text-gray-800">Sales Details</h2>

        {/* Custom Dropdown */}
        <div ref={dropdownRef} className="relative w-30 text-sm">
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
                boxShadow: "0px 2px 4px 0px #0000000A",
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

      <div className="h-72">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
