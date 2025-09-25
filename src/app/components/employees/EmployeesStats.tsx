"use client";

import { useEffect, useState } from "react";
import { Package, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface StatItem {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
}

export default function EmployeesStats() {
  const pathname = usePathname();
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  const gridColsClass =
    pathname === "/employees"
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
      : pathname === "/employees/attendance"
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2";

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      const userId = userData.user?.id;
      if (!userId) return;

      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const { data: attendance } = await supabase
        .from("attendance")
        .select("date,punch_in,status")
        .eq("user_id", userId)
        .gte("date", firstDayOfMonth.toISOString())
        .lte("date", today.toISOString());

      const { data: leaves } = await supabase
        .from("leaves")
        .select("from_date,to_date,leave_type,status")
        .eq("user_id", userId)
        .eq("status", "Approved");

      let workingDaysCount = 0;
      let absentCount = 0;
      let leavesCount = 0;
      let shortLeaveHours = 0;

      const leaveDates = new Set<string>();
      const shortLeaveDates = new Set<string>();

      (leaves || []).forEach((l) => {
        const start = new Date(l.from_date);
        const end = new Date(l.to_date);
        for (let d = new Date(start); d <= end && d <= today; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0];
          if (l.leave_type?.toLowerCase().trim() === "short leave") {
            shortLeaveDates.add(dateStr);
            shortLeaveHours += 2;
          } else {
            leaveDates.add(dateStr);
            leavesCount += 1;
          }
        }
      });

      // Loop through each day of month
      for (let d = new Date(firstDayOfMonth); d <= today; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        const dayOfWeek = d.getDay(); // 0=Sun,6=Sat

        const att = attendance?.find(
          (a) => new Date(a.date).toISOString().split("T")[0] === dateStr
        );

        if (leaveDates.has(dateStr)) continue; // Skip full-day leave
        if (shortLeaveDates.has(dateStr)) {
          workingDaysCount += 1; // Short leave counts as working day
          continue;
        }

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          // Weekend logic
          if (att && att.punch_in) {
            workingDaysCount += 1; // Worked on weekend
          }
          // else: weekend holiday, do not count absent
        } else {
          // Weekday logic
          if (att && att.punch_in) {
            workingDaysCount += 1; // Present
          } else {
            absentCount += 1; // Absent only on weekdays
          }
        }
      }

      setStats([
        {
          title: "Working Days",
          value: workingDaysCount,
          icon: <Package className="text-[#FEC53D]" size={24} />,
          iconBg: "bg-[#FEC53D]/21",
        },
        {
          title: "Leaves Taken",
          value: leavesCount,
          icon: <TrendingUp className="text-[#4AD991]" size={24} />,
          iconBg: "bg-[#4AD991]/21",
        },
        {
          title: "Absent",
          value: absentCount,
          icon: <Clock className="text-[#FF9066]" size={24} />,
          iconBg: "bg-[#FF9066]/21",
        },
        {
          title: "Short Leaves",
          value: shortLeaveHours,
          icon: <TrendingDown className="text-[#F93C65]" size={24} />,
          iconBg: "bg-[#F93C65]/20",
        },
      ]);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading stats...</p>;

  return (
    <div className={`grid ${gridColsClass} gap-6 mt-10`}>
      {stats.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-[14px] p-5 flex flex-col gap-5"
          style={{ boxShadow: "6px 6px 54px 0px #0000000D", minHeight: "140px" }}
        >
          <div className="flex items-center justify-between">
            <div className="stats-content">
              <h3 className="text-[16px] font-medium" style={{ color: "rgba(32, 34, 36, 0.7)" }}>
                {item.title}
              </h3>
              <h2 className="font-medium" style={{ fontSize: "28px", fontWeight: 500, color: "#2C2C2C" }}>
                {item.value}
              </h2>
            </div>
            <div className={`p-4 rounded-[20px] ${item.iconBg} flex items-center justify-center`}>
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
