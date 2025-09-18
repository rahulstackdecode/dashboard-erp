"use client";

import { Users, Package, TrendingUp, Clock, TrendingDown } from "lucide-react";
import { usePathname } from "next/navigation";

export default function EmployeesStats() {
  const pathname = usePathname();

  // Determine grid columns based on URL
  const gridColsClass =
    pathname === "/employees"
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
      : pathname === "/employees/attendance"
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"; // default fallback

  const stats = [
    {
      title: "Project Assigned",
      value: "10",
      icon: <Users className="text-[#8280FF]" size={24} />,
      iconBg: "bg-[#8280FF]/20",
      change: (
        <p className="text-[#606060]">
          <span className="text-[#00B69B]">
            <TrendingUp className="inline mr-1" size={14} /> 8.5%
          </span>{" "}
          Up from Last Year
        </p>
      ),
    },
    {
      title: "Working Days",
      value: "150",
      icon: <Package className="text-[#FEC53D]" size={24} />,
      iconBg: "bg-[#FEC53D]/21",
      change: (
        <p className="text-[#606060]">
          <span className="text-[#F93C65]">
            <TrendingDown className="inline mr-1" size={14} /> 1.3%
          </span>{" "}
          Less than yesterday
        </p>
      ),
    },
    {
      title: "Leaves Taken",
      value: "5",
      icon: <TrendingUp className="text-[#4AD991]" size={24} />,
      iconBg: "bg-[#4AD991]/21",
      change: (
        <p className="text-[#606060]">
          <span className="text-[#00B69B]">
            <TrendingUp className="inline mr-1" size={14} /> 4.3%
          </span>{" "}
          Increase than yesterday
        </p>
      ),
    },
    {
      title: "Absent",
      value: "7",
      icon: <Clock className="text-[#FF9066]" size={24} />,
      iconBg: "bg-[#FF9066]/21",
      change: (
        <p className="text-[#606060]">
          <span className="text-[#00B69B]">
            <TrendingUp className="inline mr-1" size={14} /> 1.8%
          </span>{" "}
          Up from Last Month
        </p>
      ),
    },
  ];

  return (
    <div className={`grid ${gridColsClass} gap-6 mt-10`}>
      {stats.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-[14px] p-5 flex flex-col gap-5"
          style={{ boxShadow: "6px 6px 54px 0px #0000000D" }}
        >
          <div className="flex items-center justify-between">
            <div className="stats-content">
              <h3
                className="text-[16px] font-medium"
                style={{ color: "rgba(32, 34, 36, 0.7)" }}
              >
                {item.title}
              </h3>
              <h2
                className="font-medium"
                style={{ fontSize: "28px", fontWeight: 500, color: "#2C2C2C" }}
              >
                {item.value}
              </h2>
            </div>
            <div
              className={`p-4 rounded-[20px] ${item.iconBg} flex items-center justify-center`}
            >
              {item.icon}
            </div>
          </div>

          {item.change}
        </div>
      ))}
    </div>
  );
}
