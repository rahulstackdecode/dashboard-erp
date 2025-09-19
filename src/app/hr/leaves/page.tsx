"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ChevronDown } from "lucide-react";

interface LeaveRow {
  id: number;
  user_id: string; // added user_id
  name: string;
  department: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: string;
  created_at: string | null;
}

export default function LeaveListPage() {
  const [leaves, setLeaves] = useState<LeaveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState<number | null>(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<number | null>(null);
  const [canApplyLeave, setCanApplyLeave] = useState(true);

  const currentUserId = "current-user-id"; // replace with actual logged-in user UUID

  const fetchLeaves = async () => {
    setLoading(true);

    const { data, count, error } = await supabase
      .from("leaves_with_users")
      .select("*", { count: "exact" });

    if (error) {
      console.error("Error fetching leaves:", error);
    } else {
      const sortedData = (data as LeaveRow[]).sort((a, b) => {
        const statusOrder: Record<string, number> = { Pending: 0, Approved: 1, Rejected: 2 };
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        return new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime();
      });

      setLeaves(sortedData);
      setTotalPages(count ? Math.ceil(count / pageSize) : 1);

      // check if current user has pending leave
      const hasPending = (data as LeaveRow[]).some(
        (leave) => leave.status === "Pending" && leave.user_id === currentUserId
      );
      setCanApplyLeave(!hasPending);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, [page, pageSize]);

  const updateStatus = async (id: number, newStatus: string) => {
    if (updating) return;
    setUpdating(id);

    const { error } = await supabase
      .from("leaves")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } else {
      setLeaves((prev) =>
        prev.map((row) =>
          row.id === id ? { ...row, status: newStatus } : row
        )
      );
      fetchLeaves(); // refetch to update canApplyLeave state
    }
    setUpdating(null);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Pending":
        return { bg: "#FFF8E7", color: "#D5B500", border: "none" };
      case "Approved":
        return { bg: "#03C95A1A", color: "#03C95A", border: "none" };
      case "Rejected":
        return { bg: "#FFE5EE", color: "#E70D0D", border: "none" };
      default:
        return { bg: "#F0F0F0", color: "#2C2C2C", border: "none" };
    }
  };

  const formatDateTime = (value: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div>
      <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
        Employee Leaves
      </h2>

      {!canApplyLeave && (
        <div className="mb-4 text-red-500 font-medium">
          You have a pending leave. You cannot apply for a new leave until it is approved or rejected.
        </div>
      )}

      <div className="bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]" style={{ padding: "35px 25px" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
            <thead>
              <tr className="text-gray-600 border-b border-gray-300">
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Applied Time</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Employee</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Department</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Leave Type</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">From</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">To</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Reason</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-6">Loading...</td>
                </tr>
              ) : leaves.length > 0 ? (
                leaves.map((row) => {
                  const styles = getStatusStyles(row.status);
                  return (
                    <tr key={row.id} className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition">
                      <td className="px-4 py-4 text-[#2C2C2C] text-[14px] font-normal">{formatDateTime(row.created_at)}</td>
                      <td className="px-4 py-4 text-[#2C2C2C] text-[14px] font-normal">{row.name}</td>
                      <td className="px-4 py-4 text-[#567D8E] text-[14px] font-normal">{row.department}</td>
                      <td className="px-4 py-4 text-[#567D8E] text-[14px] font-normal">{row.leave_type}</td>
                      <td className="px-4 py-4 text-[#567D8E] text-[14px] font-normal">{row.from_date}</td>
                      <td className="px-4 py-4 text-[#567D8E] text-[14px] font-normal">{row.to_date}</td>
                      <td className="px-4 py-4 text-[#2C2C2C] text-[14px] font-normal">{row.reason}</td>
                      <td className="px-4 py-4 relative min-w-fit cursor-pointer select-none">
                        <div
                          onClick={() => setOpenStatusDropdown(openStatusDropdown === row.id ? null : row.id)}
                          className="inline-flex items-center justify-between w-max px-3 py-1 rounded-[4px] text-xs font-normal"
                          style={{ color: styles.color, backgroundColor: styles.bg, border: styles.border, minWidth: "min-content" }}
                        >
                          <span>{row.status}</span>
                          <ChevronDown size={14} className="ml-1" />
                        </div>

                        {openStatusDropdown === row.id && (
                          <ul className="absolute left-0 top-0 mt-1 bg-white border border-gray-300 rounded-md shadow-md z-50" style={{ minWidth: "min-content" }}>
                            {["Pending", "Approved", "Rejected"].map((statusOption) => (
                              <li
                                key={statusOption}
                                onClick={() => {
                                  updateStatus(row.id, statusOption);
                                  setOpenStatusDropdown(null);
                                }}
                                className="px-3 py-1 cursor-pointer hover:bg-[#06A6F0] hover:text-white"
                              >
                                {statusOption}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center px-4 py-6 text-[#567D8E] text-[14px] font-normal">No results found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
