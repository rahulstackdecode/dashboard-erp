"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface LeaveFormProps {
  userId: string | null;
  onClose: () => void;
}

export default function LeaveForm({ userId, onClose }: LeaveFormProps) {
  const [leaveType, setLeaveType] = useState("Medical Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasPendingLeave, setHasPendingLeave] = useState(false);

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0);
  const maxDate = nextMonth.toISOString().split("T")[0];

  // Check if user has pending leave
  const checkPendingLeave = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("leaves")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "Pending");

    if (error) {
      console.error("Error checking pending leave:", error);
    } else {
      setHasPendingLeave(data && data.length > 0);
    }
  };

  useEffect(() => {
    checkPendingLeave();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || hasPendingLeave) return;

    try {
      setIsSubmitting(true);
      setSuccessMessage("");

      const { error } = await supabase.from("leaves").insert([
        {
          user_id: userId,
          leave_type: leaveType,
          from_date: fromDate,
          to_date: toDate,
          reason,
          status: "Pending",
        },
      ]);

      if (error) {
        console.error("Leave submission error:", error);
        setIsSuccess(false);
        setSuccessMessage("Failed to submit leave. Please try again.");
      } else {
        setIsSuccess(true);
        setSuccessMessage("Leave applied successfully!");
        setLeaveType("Medical Leave");
        setFromDate("");
        setToDate("");
        setReason("");
        setTimeout(() => {
          onClose();
          checkPendingLeave();
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {hasPendingLeave && (
        <div className="p-3 text-center rounded text-sm font-medium bg-red-100 text-red-700">
          Pending leave exists. You cannot apply for a new one.        </div>
      )}

      {successMessage && (
        <div
          className={`p-3 text-center rounded text-sm font-medium ${isSuccess ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
        >
          {successMessage}
        </div>
      )}

      <div>
        <label htmlFor="leaveType" className="block mb-2 text-[#567D8E] text-[16px] font-normal">
          Leave Type
        </label>
        <select
          id="leaveType"
          className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value)}
          disabled={hasPendingLeave}
        >
          <option>Medical Leave</option>
           <option>Short Leave</option>
          <option>Casual Leave</option>
          <option>Paid Leave</option>
          <option>Other</option>
        </select>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="fromDate" className="block mb-2 text-[#567D8E] text-[16px] font-normal">
            From
          </label>
          <input
            id="fromDate"
            type="date"
            min={minDate}
            max={maxDate}
            className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            required
            disabled={hasPendingLeave}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="toDate" className="block mb-2 text-[#567D8E] text-[16px] font-normal">
            To
          </label>
          <input
            id="toDate"
            type="date"
            min={minDate}
            max={maxDate}
            className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            required
            disabled={hasPendingLeave}
          />
        </div>
      </div>

      <div>
        <label htmlFor="reason" className="block mb-2 text-[#567D8E] text-[16px] font-normal">
          Reason
        </label>
        <textarea
          id="reason"
          className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          disabled={hasPendingLeave}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || hasPendingLeave}
        className={`bg-[#06A6F0] hover:bg-[#0784c6] cursor-pointer text-white font-medium py-2 px-6 rounded-[4px] transition disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
