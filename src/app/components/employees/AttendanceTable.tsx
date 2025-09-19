"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { startOfYear, endOfYear, startOfMonth, endOfMonth, format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "@/lib/supabaseClient";

interface User {
  name: string;
}

interface AttendanceRow {
  id: string;
  date: string;
  status: string;
  punch_in?: string | null;
  punch_out?: string | null;
  total_seconds?: number | null;
  users?: User[] | User | null;
}

export default function AttendanceTable() {
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const minDate = startOfYear(new Date());
  const maxDate = endOfYear(new Date());

  // --- Fetch Attendance ---
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("attendance")
        .select(`
          id,
          date,
          status,
          punch_in,
          punch_out,
          total_seconds,
          users (name)
        `)
        .order("date", { ascending: false });

      if (selectedMonth) {
        const start = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
        const end = format(endOfMonth(selectedMonth), "yyyy-MM-dd");
        query = query.gte("date", start).lte("date", end);
      }

      const { data, error } = await query;
      if (error) throw error;


      // Group by date to keep earliest punch-in per day
      const groupedData: AttendanceRow[] = [];
      const map = new Map<string, AttendanceRow>();
      (data || []).forEach((row: AttendanceRow) => {
        const dateKey = row.date;
        if (!map.has(dateKey)) {
          map.set(dateKey, row);
        } else {
          const existing = map.get(dateKey)!;
          if (row.punch_in && existing.punch_in) {
            if (new Date(row.punch_in) < new Date(existing.punch_in)) {
              map.set(dateKey, row);
            }
          }
        }
      });

      map.forEach((value) => groupedData.push(value));

      setAttendanceData(
        groupedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth]);

  // --- Pagination ---
  const totalPages = Math.ceil(attendanceData.length / pageSize);
  const paginatedData = attendanceData.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [selectedMonth, pageSize]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Absent":
        return { color: "#E70D0D", bgColor: "#FFE5EE" };
      case "Late arrival":
        return { color: "#D5B500", bgColor: "#FFF8E7" };
      case "On Leave":
        return { color: "#777777", bgColor: "#F7F7F7" };
      default:
        return { color: "#0764E6", bgColor: "#E6EFFC" };
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  // --- Handle Punch In ---
  const handlePunchIn = async (userId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const now = new Date().toISOString();

    const { data: existing, error } = await supabase
      .from("attendance")
      .select("id, punch_in")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking attendance:", error);
      return;
    }

    if (!existing) {
      await supabase.from("attendance").insert({
        user_id: userId,
        date: today,
        punch_in: now,
        status: "Present",
      });
    } else {
      const firstPunchIn = existing.punch_in;
      const totalSeconds =
        (new Date(now).getTime() - new Date(firstPunchIn!).getTime()) / 1000;

      await supabase
        .from("attendance")
        .update({
          punch_out: now,
          total_seconds: totalSeconds,
        })
        .eq("id", existing.id);
    }

    fetchAttendance();
  };

  return (
    <div className="attendance-wrapper">
      {/* Month Picker */}
      <div className="flex flex-wrap items-center justify-end gap-4 mb-8">
        <div className="relative w-full sm:w-[220px]">
          <DatePicker
            selected={selectedMonth}
            onChange={(date: Date | null) => setSelectedMonth(date)}
            dateFormat="MMM yyyy"
            showMonthYearPicker
            minDate={startOfYear(new Date())}
            maxDate={endOfYear(new Date())}
            filterDate={(date) => {
              const today = new Date();

              // Get start of range (current month - 2 months)
              const minAllowed = new Date(today.getFullYear(), today.getMonth() - 2, 1);
              // Get end of range (end of current month)
              const maxAllowed = new Date(today.getFullYear(), today.getMonth() + 1, 0);

              return date >= minAllowed && date <= maxAllowed;
            }}
            className="w-full border border-gray-300 text-gray-700 text-sm sm:text-base font-medium rounded-lg pl-10 pr-12 py-2.5 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
            calendarClassName="shadow-xl rounded-lg border border-gray-200"
            placeholderText="Select month"
            isClearable={false}
          />

          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]"
        style={{ padding: "35px 25px" }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
            <thead>
              <tr className="text-gray-600 border-b border-gray-300">
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Name</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Date</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Status</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Punch In</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Punch Out</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Total Working Hours</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-6 text-blue-600 text-[14px] font-normal">
                    Loading...
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row) => {
                  const statusColor = getStatusColor(row.status);

                  const punchInTime = row.punch_in
                    ? (() => {
                      const d = new Date(row.punch_in);
                      return isNaN(d.getTime()) ? "-" : format(d, "HH:mm");
                    })()
                    : "-";

                  const punchOutTime = row.punch_out
                    ? (() => {
                      const d = new Date(row.punch_out);
                      return isNaN(d.getTime()) ? "-" : format(d, "HH:mm");
                    })()
                    : "-";

                  const totalHours = row.total_seconds ? formatTime(row.total_seconds) : "-";

                  // Robust user name access
                  const userName = Array.isArray(row.users)
                    ? row.users[0]?.name || "Unknown"
                    : row.users?.name || "Unknown";

                  return (
                    <tr key={row.id} className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition">
                      <td className="px-4 py-4 text-gray-800 text-[14px] font-normal">{userName}</td>
                      <td className="px-4 py-4 text-gray-600 text-[14px] font-normal">{row.date}</td>
                      <td className="px-4 py-4">
                        <span
                          style={{ color: statusColor.color, backgroundColor: statusColor.bgColor }}
                          className="inline-block px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap"
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-normal">{punchInTime}</td>
                      <td className="px-4 py-4 font-normal">{punchOutTime}</td>
                      <td className="px-4 py-4 font-normal">{totalHours}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-6 text-gray-500 text-[14px] font-normal">
                    No results found.
                  </td>
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
            <select
              className="appearance-none border border-gray-300 text-gray-700 text-[15px] font-medium rounded-md px-2 py-1 pr-6 min-w-[60px] bg-white shadow-sm focus:ring-2 focus:ring-blue-400"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <span>Results</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="cursor-pointer px-4 py-2 text-[15px] font-medium text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0] transition"
          >
            Prev
          </button>

          <span className="px-4 py-2 bg-[#06A6F0] text-white text-[15px] font-medium rounded-[5px]">
            {page}
          </span>

          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            className="cursor-pointer px-4 py-2 text-[15px] font-medium text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0] transition"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}
