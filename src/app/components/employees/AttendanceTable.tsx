"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSaturday,
  isSunday,
} from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "@/lib/supabaseClient";

interface AttendanceRow {
  id: string;
  date: string;
  status: string;
  punch_in?: string | null;
  punch_out?: string | null;
  total_seconds?: number | null;
  short_leave: boolean;
  name: string;
}

export default function AttendanceTable() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [user, setUser] = useState<{ auth_id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionUser } = await supabase.auth.getUser();
      if (sessionUser?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("auth_id, name")
          .eq("auth_id", sessionUser.user.id)
          .single();
        setUser(userData);
      }
    };
    fetchUser();
  }, []);

  const fetchAttendance = async () => {
    if (!selectedMonth || !user) return;
    setLoading(true);

    try {
      const today = new Date();
      const startDate = startOfMonth(selectedMonth);
      let endDate = endOfMonth(selectedMonth);

      if (
        selectedMonth.getFullYear() === today.getFullYear() &&
        selectedMonth.getMonth() === today.getMonth()
      ) {
        endDate = today;
      }

      // Attendance
      const { data: attendance } = await supabase
        .from("attendance")
        .select(`id, date, status, punch_in, punch_out, total_seconds`)
        .eq("user_id", user.auth_id)
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"));

      // Leaves including short leaves
      const { data: leaves } = await supabase
        .from("leaves")
        .select("from_date, to_date, status, leave_type")
        .eq("user_id", user.auth_id)
        .eq("status", "Approved")
        .or(
          `and(from_date.lte.${format(endDate, "yyyy-MM-dd")},to_date.gte.${format(
            startDate,
            "yyyy-MM-dd"
          )})`
        );

      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      const finalData: AttendanceRow[] = [];

      for (const dateObj of allDates) {
        const dateStr = format(dateObj, "yyyy-MM-dd");
        const userAttendance = (attendance || []).find((a) => a.date === dateStr);

        const isLeave = (leaves || []).some((l) => {
          const leaveStart = l.from_date ? new Date(l.from_date) : null;
          const leaveEnd = l.to_date ? new Date(l.to_date) : null;
          return leaveStart && leaveEnd && dateObj >= leaveStart && dateObj <= leaveEnd && l.leave_type !== "Short Leave";
        });

        // Short leave check
        const isShortLeave = (leaves || []).some((l) => {
          const leaveDate = new Date(l.from_date);
          return l.leave_type === "Short Leave" && l.status === "Approved" && format(leaveDate, "yyyy-MM-dd") === dateStr;
        });

        let status = "Absent";
        const punch_in = userAttendance?.punch_in || null;
        const punch_out = userAttendance?.punch_out || null;
        let total_seconds = userAttendance?.total_seconds || 0;

        if (isShortLeave) {
          total_seconds = Math.max(0, total_seconds - 7200); // Deduct 2 hours
        }

        if (isLeave) {
          status = "On Leave";
        } else if (userAttendance && punch_in) {
          status = "Present";
        } else if (isSaturday(dateObj) || isSunday(dateObj)) {
          status = "Weekend Holiday";
        }

        finalData.push({
          id: `${user.auth_id}-${dateStr}`,
          date: dateStr,
          status,
          punch_in,
          punch_out,
          total_seconds,
          short_leave: isShortLeave,
          name: user.name,
        });
      }

      finalData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAttendanceData(finalData);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, user]);

  const totalPages = Math.ceil(attendanceData.length / pageSize);
  const paginatedData = attendanceData.slice((page - 1) * pageSize, page * pageSize);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: string) => {
    if (status === "Absent") return { color: "#E70D0D", bgColor: "#FFE5EE" };
    if (status === "On Leave") return { color: "#FFA500", bgColor: "#FFF4E5" };
    if (status === "Weekend Holiday") return { color: "#4CAF50", bgColor: "#E6F9EE" };
    if (status === "Present") return { color: "#0764E6", bgColor: "#E6EFFC" };
    return { color: "#000000", bgColor: "#FFFFFF" };
  };

  return (
    <div className="attendance-wrapper">
      {/* Month Picker */}
      <div className="flex flex-wrap items-center justify-end gap-4 mb-8">
        <div className="relative w-full sm:w-[220px]">
          <DatePicker
            selected={selectedMonth}
            onChange={(date) => setSelectedMonth(date!)}
            dateFormat="MMM yyyy"
            showMonthYearPicker
            minDate={new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1)}
            maxDate={new Date()}
            className="w-full border border-gray-300 text-gray-700 text-sm sm:text-base font-medium rounded-lg pl-10 pr-12 py-2.5 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
            calendarClassName="shadow-xl rounded-lg border border-gray-200"
            placeholderText="Select month"
            isClearable={false}
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]" style={{ padding: "35px 25px" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
            <thead>
              <tr className="text-gray-600 border-b border-gray-300">
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Name</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Date</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Status</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Short Leave</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Punch In</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Punch Out</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Total Working Hours</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center px-4 py-6 text-blue-600 text-[14px] font-normal">Loading...</td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row) => {
                  const statusColor = getStatusColor(row.status);
                  const punchInTime = row.punch_in ? format(new Date(row.punch_in), "HH:mm") : "-";
                  const punchOutTime = row.punch_out ? format(new Date(row.punch_out), "HH:mm") : "-";
                  const totalHours = row.total_seconds ? formatTime(row.total_seconds) : "-";

                  return (
                    <tr key={row.id} className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition">
                      <td className="px-4 py-4 text-gray-800 text-[14px] font-normal">{row.name}</td>
                      <td className="px-4 py-4 text-gray-600 text-[14px] font-normal">{row.date}</td>
                      <td className="px-4 py-4">
                        <span style={{ color: statusColor.color, backgroundColor: statusColor.bgColor }} className="inline-block px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap">{row.status}</span>
                      </td>
                      <td className="px-4 py-4 text-gray-600 text-[14px] font-normal">{row.short_leave ? "2 Hours" : "-"}</td>
                      <td className="px-4 py-4 font-normal">{punchInTime}</td>
                      <td className="px-4 py-4 font-normal">{punchOutTime}</td>
                      <td className="px-4 py-4 font-normal">{totalHours}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center px-4 py-6 text-gray-500 text-[14px] font-normal">No results found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between mt-8 text-sm text-gray-600 gap-4 sm:gap-0">
        <div className="flex items-center text-gray-500 text-[14px] gap-2">
          <span>Showing</span>
          <div className="relative inline-block">
            <select className="appearance-none border border-gray-300 text-gray-700 text-[15px] font-medium rounded-md px-2 py-1 pr-6 min-w-[60px] bg-white shadow-sm focus:ring-2 focus:ring-blue-400" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>
          <span>Results</span>
        </div>

        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="cursor-pointer px-4 py-2 text-[15px] font-medium text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0] transition">Prev</button>
          <span className="px-4 py-2 bg-[#06A6F0] text-white text-[15px] font-medium rounded-[5px]">{page}</span>
          <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} className="cursor-pointer px-4 py-2 text-[15px] font-medium text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0] transition">Next</button>
        </div>
      </div>
    </div>
  );
}
