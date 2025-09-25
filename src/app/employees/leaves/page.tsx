"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface UserData {
  name: string;
  department: string;
}

interface LeaveRow {
  id: number;
  user_id: string;
  name: string;
  department: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: string;
  created_at: string | null;
}

// Supabase response type: users is an array
interface LeaveWithUser {
  id: number;
  user_id: string;
  leave_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: string;
  created_at: string | null;
  users: UserData[]; // Note the array here
}

export default function EmployeeLeaveList() {
  const [leaves, setLeaves] = useState<LeaveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchLeaves = async () => {
    if (!currentUserId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("leaves")
      .select(`
        id,
        user_id,
        leave_type,
        from_date,
        to_date,
        reason,
        status,
        created_at,
        users!inner(name, department)
      `)
      .eq("user_id", currentUserId);

    if (error) {
      console.error("Error fetching leaves:", error);
      setLoading(false);
      return;
    }

    // Map Supabase data to LeaveRow, picking first user from array
    const formattedData: LeaveRow[] = ((data as LeaveWithUser[]) || []).map((row) => {
      const user = row.users[0]; // pick the first element
      return {
        id: row.id,
        user_id: row.user_id,
        name: user?.name ?? "-",
        department: user?.department ?? "-",
        leave_type: row.leave_type,
        from_date: row.from_date,
        to_date: row.to_date,
        reason: row.reason,
        status: row.status,
        created_at: row.created_at,
      };
    });

    const sortedData = formattedData.sort((a, b) => {
      const statusOrder: Record<string, number> = { Pending: 0, Approved: 1, Rejected: 2 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime();
    });

    setLeaves(sortedData);
    setLoading(false);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching current user:", error);
        return;
      }
      setCurrentUserId(data.user?.id ?? null);
    };
    getUser();
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [currentUserId]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Pending":
        return { bg: "#FFF8E7", color: "#D5B500" };
      case "Approved":
        return { bg: "#03C95A1A", color: "#03C95A" };
      case "Rejected":
        return { bg: "#FFE5EE", color: "#E70D0D" };
      default:
        return { bg: "#F0F0F0", color: "#2C2C2C" };
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
        My Leaves
      </h2>

      <div className="bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]" style={{ padding: "35px 25px" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
            <thead>
              <tr className="text-gray-600 border-b border-gray-300">
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Applied Time</th>
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
                  <td colSpan={6} className="text-center py-6">Loading...</td>
                </tr>
              ) : leaves.length > 0 ? (
                leaves.map((row) => {
                  const styles = getStatusStyles(row.status);
                  return (
                    <tr key={row.id} className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition">
                      <td className="px-4 py-4 text-[#2C2C2C] text-[14px] font-normal">{formatDateTime(row.created_at)}</td>
                      <td className="px-4 py-4 text-[#567D8E] text-[14px] font-normal">{row.leave_type}</td>
                      <td className="px-4 py-4 text-[#567D8E] text-[14px] font-normal">{row.from_date}</td>
                      <td className="px-4 py-4 text-[#567D8E] text-[14px] font-normal">{row.to_date}</td>
                      <td className="px-4 py-4 text-[#2C2C2C] text-[14px] font-normal">{row.reason}</td>
                      <td className="px-4 py-4 relative min-w-fit select-none">
                        <div
                          className="inline-flex items-center justify-between w-max px-3 py-1 rounded-[4px] text-xs font-normal"
                          style={{ color: styles.color, backgroundColor: styles.bg, minWidth: "min-content" }}
                        >
                          <span>{row.status}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center px-4 py-6 text-[#567D8E] text-[14px] font-normal">No leaves found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
