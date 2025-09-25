"use client";

import { useEffect, useState } from "react";
import { Users, Package, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";

export default function HrEmployeesStats() {
    const router = useRouter();
    const pathname = usePathname();
    const [statsData, setStatsData] = useState({
        totalEmployees: 0,
        todayPresent: 0,
        todayAbsent: 0,
        pendingLeaves: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { count: totalEmployees } = await supabase
                    .from("users")
                    .select("*", { count: "exact", head: true });

                const today = new Date();
                const dateStr = today.toISOString().split("T")[0];

                const { data: attendanceData } = await supabase
                    .from("attendance")
                    .select("id, punch_in, punch_out")
                    .eq("date", dateStr);

                const todayPresent = attendanceData?.filter((a) => a.punch_in).length || 0;
                const todayAbsent = (totalEmployees || 0) - todayPresent;

                const { count: pendingLeaves } = await supabase
                    .from("leaves")
                    .select("*", { count: "exact", head: true })
                    .eq("status", "Pending");

                setStatsData({
                    totalEmployees: totalEmployees || 0,
                    todayPresent,
                    todayAbsent,
                    pendingLeaves: pendingLeaves || 0,
                });
            } catch (err) {
                console.error("Error fetching HR stats:", err);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        {
            title: "Total Employees",
            value: statsData.totalEmployees,
            icon: <Users className="text-[#8280FF]" size={24} />,
            iconBg: "bg-[#8280FF]/20",
        },
        {
            title: "Today Present",
            value: statsData.todayPresent,
            icon: <Package className="text-[#FEC53D]" size={24} />,
            iconBg: "bg-[#FEC53D]/21",
        },
        {
            title: "Today Absent",
            value: statsData.todayAbsent,
            icon: <TrendingUp className="text-[#4AD991]" size={24} />,
            iconBg: "bg-[#4AD991]/21",
        },
        {
            title: "Pending Leaves",
            value: statsData.pendingLeaves,
            icon: <Clock className="text-[#FF9066]" size={24} />,
            iconBg: "bg-[#FF9066]/21",
            onClick: pathname.includes("/teamleader")
                ? undefined
                : () => router.push("/hr/leaves"),
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-10">
            {stats.map((item, index) => (
                <div
                    key={index}
                    className={`bg-white rounded-[14px] p-5 flex flex-col gap-5 cursor-pointer ${item.onClick ? "hover:shadow-lg transition" : ""
                        }`}
                    style={{ boxShadow: "6px 6px 54px 0px #0000000D", minHeight:'140px' }}
                    onClick={item.onClick}
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
                    {item.onClick && (
                        <div className="flex items-center justify-end text-[#FF4C4C] font-medium text-sm">
                            View <ArrowRight className="ml-2" size={16} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
