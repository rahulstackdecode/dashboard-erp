"use client";
import { useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    ChartOptions, // <- import ChartOptions type
} from "chart.js";
import { Line } from "react-chartjs-2";
import { SlidersHorizontal } from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler
);

type FilterType = "Weekly" | "BiWeekly" | "Monthly";

export default function AttendanceChart() {
    const [filter, setFilter] = useState<FilterType>("Weekly");
    const [showFilters, setShowFilters] = useState(false);

    const datasetsByFilter: Record<FilterType, number[]> = {
        Weekly: [60, 72, 61, 70, 91, 52, 70],
        BiWeekly: [55, 65, 75, 60, 80, 70, 90, 50, 68, 60, 72, 55, 60, 70],
        Monthly: [
            60, 72, 61, 70, 91, 52, 70, 50, 68, 45, 60, 72, 69, 55, 60, 70,
        ],
    };

    const labelsByFilter: Record<FilterType, string[]> = {
        Weekly: ["01 Aug", "02 Aug", "03 Aug", "04 Aug", "07 Aug", "08 Aug", "09 Aug"],
        BiWeekly: [
            "01 Aug",
            "02 Aug",
            "03 Aug",
            "04 Aug",
            "05 Aug",
            "06 Aug",
            "07 Aug",
            "08 Aug",
            "09 Aug",
            "10 Aug",
            "11 Aug",
            "12 Aug",
            "13 Aug",
            "14 Aug",
        ],
        Monthly: Array.from({ length: 16 }, (_, i) => `${i + 1} Aug`),
    };

    const data = {
        labels: labelsByFilter[filter],
        datasets: [
            {
                fill: true,
                data: datasetsByFilter[filter],
                borderColor: "#009EFF",
                backgroundColor: "rgba(0, 158, 255, 0.1)",
                pointBorderColor: "#009EFF",
                pointBackgroundColor: "#fff",
                pointRadius: 5,
                tension: 0.4,
            },
        ],
    };

    // <-- Type the options properly and set the y scale type explicitly
    const options: ChartOptions<"line"> = {
        responsive: true,
        plugins: {
            legend: { display: false },
        },
        scales: {
            // specify the scale type to satisfy TypeScript
            y: {
                type: "linear",
                min: 0,
                max: 100,
                ticks: {
                    // tick callback signature accepts number | string
                    callback: (value: number | string) => `${value}%`,
                },
            },
        },
    };

    return (
        <div
            className="p-4 rounded-2xl bg-white relative"
            style={{ boxShadow: "6px 6px 54px 0px #0000000D" }}
        >
            <div className="flex justify-between items-center mb-5">

                <h2 className="text-[18px] font-semibold text-[#2C2C2C]">
                    Attendance Comparison Chart
                </h2>
                <div className="relative">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        <SlidersHorizontal size={18} />
                    </button>

                    {showFilters && (
                        <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded-lg border">
                            {Object.keys(datasetsByFilter).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => {
                                        setFilter(f as FilterType);
                                        setShowFilters(false);
                                    }}
                                    className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${filter === f ? "font-semibold text-blue-500" : "text-gray-700"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Line options={options} data={data} height={90} />
        </div>
    );
}
