"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Plus, X } from "lucide-react";
import EmployeesStats from "../components/employees/EmployeesStats";
import TaskOverviewWrapper from "../components/employees/TaskOverview";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [buttonText, setButtonText] = useState("Punch In");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("Medical Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const [userName, setUserName] = useState("Loading...");
  const [userPosition, setUserPosition] = useState("Loading...");
  const [userImage, setUserImage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const svgSize = 150;
  const strokeWidth = 8;
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const formatDateTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHour = (hours % 12 || 12).toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${formattedHour}:${formattedMinutes} ${ampm}, ${day} ${month} ${year}`;
  };

  // fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setUserId(null);
      setUserId(user.id);

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("name, position, profile_image")
        .eq("auth_id", user.id)
        .single();

      if (fetchError || !data) {
        setUserName("Unknown User");
        setUserPosition("-");
        setUserImage("/images/user-img.png");
      } else {
        setUserName(data.name);
        setUserPosition(data.position);
        setUserImage(data.profile_image || "/images/user-img.png");
      }
    };
    fetchUser();
  }, []);

  // fetch today's attendance
  const fetchTodayAttendance = useCallback(async () => {
    if (!userId) return;
    const today = new Date().toISOString().split("T")[0];

    const { data: record, error: fetchError } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("fetchTodayAttendance error:", fetchError);
      return;
    }

    if (record) {
      setAccumulatedSeconds(record.total_seconds || 0);
      if (record.punch_in && !record.punch_out) {
        setPunchInTime(new Date(record.punch_in));
        setIsLiveSession(true);
        setButtonText("Punch Out");
      } else {
        setPunchInTime(null);
        setIsLiveSession(false);
        setButtonText("Punch In");
      }
    } else {
      setAccumulatedSeconds(0);
      setPunchInTime(null);
      setIsLiveSession(false);
      setButtonText("Punch In");
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchTodayAttendance();

    const channel = supabase
      .channel("attendance_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance",
          filter: `user_id=eq.${userId}`,
        },
        () => fetchTodayAttendance()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchTodayAttendance]);

  // timer live progress
  useEffect(() => {
    if (!punchInTime || !isLiveSession) return;

    const timer = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (new Date().getTime() - punchInTime.getTime()) / 1000
      );
      setProgress(Math.min(((accumulatedSeconds + elapsedSeconds) / (8 * 3600)) * 100, 100));
    }, 1000);

    return () => clearInterval(timer);
  }, [punchInTime, accumulatedSeconds, isLiveSession]);

  // Punch In/Out logic with single row per day
  const handlePunchToggle = async () => {
    if (!userId || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date();

      const { data: record, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

      if (!record) {
        setPunchInTime(now);
        setIsLiveSession(true);
        setButtonText("Punch Out");

        await supabase.from("attendance").insert([
          {
            user_id: userId,
            date: today,
            punch_in: now.toISOString(),
            punch_out: null,
            total_seconds: 0,
            status: "Present",
          },
        ]);
        setAccumulatedSeconds(0);
      } else if (!punchInTime) {
        setPunchInTime(now);
        setIsLiveSession(true);
        setButtonText("Punch Out");
      } else {
        const sessionSeconds = Math.floor((now.getTime() - punchInTime.getTime()) / 1000);
        const newTotal = (record.total_seconds || 0) + sessionSeconds;

        await supabase
          .from("attendance")
          .update({ total_seconds: newTotal, punch_out: now.toISOString() })
          .eq("id", record.id);

        setAccumulatedSeconds(newTotal);
        setPunchInTime(null);
        setIsLiveSession(false);
        setButtonText("Punch In");
      }
    } finally {
      setTimeout(() => setIsSubmitting(false), 300);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const getProductionTime = () => {
    const elapsedSeconds =
      punchInTime && isLiveSession
        ? Math.floor((new Date().getTime() - punchInTime.getTime()) / 1000)
        : 0;
    return formatTime(accumulatedSeconds + elapsedSeconds);
  };

  // Leave form handler
  const handleApplyLeave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setIsSubmitting(true);
      const { error: leaveError } = await supabase.from("leaves").insert([
        {
          user_id: userId,
          leave_type: leaveType,
          from_date: fromDate,
          to_date: toDate,
          reason,
          status: "Pending",
        },
      ]);

      if (leaveError) {
        console.error("Leave submission error:", leaveError);
        alert("Failed to submit leave. Please try again.");
      } else {
        alert("Leave applied successfully!");
        setIsModalOpen(false);
        setLeaveType("Medical Leave");
        setFromDate("");
        setToDate("");
        setReason("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
      <div>
            <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
                Employee Dashboard
            </h2>
            <div className="flex flex-col lg:flex-row gap-6">
                {/* LEFT */}
                <div className="flex-1 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full bg-white rounded-sm p-5 shadow">
                        <div className="flex items-center gap-4">
                            <Image
                                src={userImage || "https://via.placeholder.com/150x150.png?text=Profile"}
                                alt="User Img"
                                width={56}
                                height={56}
                                className="rounded-full object-cover w-[56px] h-[56px]"
                            />
                            <div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-snug">
                                    Welcome Back, {userName}
                                </h3>
                                <p className="text-sm sm:text-base font-light text-gray-600">
                                    {userPosition || "Please update your position"}
                                </p>
                            </div>
                        </div>

                        <button
                            className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 text-sm cursor-pointer font-medium text-white bg-[var(--primary-color)] rounded-sm transition hover:bg-[var(--btn-hover-bg)] w-full sm:w-auto justify-center"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus size={16} /> Apply Leave
                        </button>
                    </div>

                    <EmployeesStats />
                </div>

                {/* RIGHT */}
                <div className="w-full lg:w-1/3 bg-[#FF6C0308] border border-[#FF6C03] rounded-md p-6">
                    <h4 className="text-center text-[16px] text-[#567D8E] mb-0">Attendance</h4>
                    <p className="text-center text-[22px] font-medium text-[#2C2C2C]">
                        {formatDateTime(new Date())}
                    </p>

                    <div className="flex justify-center my-6">
                        <div className="relative">
                            <svg className="w-[150px] h-[150px]">
                                <circle
                                    cx={svgSize / 2}
                                    cy={svgSize / 2}
                                    r={radius}
                                    stroke="#F7F7F7"
                                    strokeWidth={strokeWidth}
                                    fill="#ffffff"
                                />
                                <circle
                                    cx={svgSize / 2}
                                    cy={svgSize / 2}
                                    r={radius}
                                    stroke="#03C95A"
                                    strokeWidth={strokeWidth}
                                    fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    transform={`rotate(-90 ${svgSize / 2} ${svgSize / 2})`}
                                />
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-[14px] text-[#AAAAAA]">Total Hours</p>
                                <p className="text-[14px] font-medium text-[#2C2C2C]">
                                    {formatTime(
                                        accumulatedSeconds +
                                        (punchInTime && isLiveSession
                                            ? Math.floor((new Date().getTime() - punchInTime.getTime()) / 1000)
                                            : 0)
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button className="mx-auto flex px-4 py-2 rounded-sm bg-[#2C2C2C] text-white text-sm font-medium">
                        Production : {getProductionTime()}
                    </button>

                    <p className="my-6 text-center text-[16px] text-black font-medium flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        {punchInTime
                            ? `Punch In at ${punchInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })}`
                            : accumulatedSeconds > 0
                                ? "Punched Out"
                                : "Not Punched In"}
                    </p>

                    <div className="flex justify-center">
                        <button
                            onClick={handlePunchToggle}
                            disabled={isSubmitting}
                            className={`px-6 py-3 cursor-pointer w-full rounded-sm font-medium text-white ${buttonText === "Punch In"
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-red-500 hover:bg-red-600"
                                }`}
                        >
                            {buttonText}
                        </button>
                    </div>
                </div>
            </div>

            <TaskOverviewWrapper />

            {/* Leave Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 flex justify-center items-center z-50 px-4 sm:px-0"
                    style={{ backgroundColor: "#00000066" }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-[5px] w-full max-w-[600px] relative sm:mx-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="py-2 px-4 sm:px-8 sm:py-2 border border-[#0000001A]">
                            <h2 className="text-[#2C2C2C] font-medium text-[20px] sm:text-[28px]">
                                Apply For Leave
                            </h2>
                            <button
                                className="cursor-pointer absolute top-2.5 sm:top-4 right-4 text-white bg-[#06A6F0] hover:bg-[#0784c6] rounded-full p-1 transition"
                                onClick={() => setIsModalOpen(false)}
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleApplyLeave}
                            className="space-y-4 py-4 px-4 sm:px-8 sm:py-8"
                        >
                            <div>
                                <label
                                    htmlFor="leaveType"
                                    className="block mb-2 text-[#567D8E] text-[16px] font-normal"
                                >
                                    Leave Type
                                </label>
                                <select
                                    id="leaveType"
                                    className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                    value={leaveType}
                                    onChange={(e) => setLeaveType(e.target.value)}
                                >
                                    <option>Medical Leave</option>
                                    <option>Casual Leave</option>
                                    <option>Paid Leave</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label
                                        htmlFor="fromDate"
                                        className="block mb-2 text-[#567D8E] text-[16px] font-normal"
                                    >
                                        From
                                    </label>
                                    <input
                                        id="fromDate"
                                        type="date"
                                        className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label
                                        htmlFor="toDate"
                                        className="block mb-2 text-[#567D8E] text-[16px] font-normal"
                                    >
                                        To
                                    </label>
                                    <input
                                        id="toDate"
                                        type="date"
                                        className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="reason"
                                    className="block mb-2 text-[#567D8E] text-[16px] font-normal"
                                >
                                    Reason
                                </label>
                                <textarea
                                    id="reason"
                                    className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                                    rows={4}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="bg-[#06A6F0] hover:bg-[#0784c6] cursor-pointer text-white font-medium py-2 px-6 rounded-[4px] transition"
                            >
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
  );
}
