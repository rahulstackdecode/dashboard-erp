"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface AttendanceProps {
  userId: string | null;
}

export default function AttendanceTracking({ userId }: AttendanceProps) {
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [buttonText, setButtonText] = useState("Punch In");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentTime, setCurrentTime] = useState<Date | null>(null);

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

  // ✅ Helper: Local date string (yyyy-mm-dd in user's timezone)
  const getLocalDate = (date: Date) => {
    return date.toLocaleDateString("en-CA"); // gives "2025-09-18" in local timezone
  };

  // fetch today's attendance
  const fetchTodayAttendance = useCallback(async () => {
    if (!userId) return;
    const today = getLocalDate(new Date());

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
      setProgress(
        Math.min(((accumulatedSeconds + elapsedSeconds) / (8 * 3600)) * 100, 100)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [punchInTime, accumulatedSeconds, isLiveSession]);

  // update current clock
  useEffect(() => {
    setCurrentTime(new Date());
    const tick = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(tick);
  }, []);

  // Punch In/Out logic
  const handlePunchToggle = async () => {
    if (!userId || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const today = getLocalDate(new Date());
      const now = new Date();

      const { data: record } = await supabase
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
            date: today, // ✅ local date string
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
        const sessionSeconds = Math.floor(
          (now.getTime() - punchInTime.getTime()) / 1000
        );
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
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getProductionTime = () => {
    const elapsedSeconds =
      punchInTime && isLiveSession
        ? Math.floor((new Date().getTime() - punchInTime.getTime()) / 1000)
        : 0;
    return formatTime(accumulatedSeconds + elapsedSeconds);
  };

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-full lg:w-1/3 bg-[#FF6C0308] border border-[#FF6C03] rounded-md p-6">
      <h4 className="text-center text-[16px] text-[#567D8E] mb-0">Attendance</h4>

      <p className="text-center text-[22px] font-medium text-[#2C2C2C]">
        {currentTime ? formatDateTime(currentTime) : ""}
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
                    ? Math.floor(
                        (new Date().getTime() - punchInTime.getTime()) / 1000
                      )
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
          ? `Punch In at ${punchInTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}`
          : accumulatedSeconds > 0
          ? "Punched Out"
          : "Not Punched In"}
      </p>

      <div className="flex justify-center">
        <button
          onClick={handlePunchToggle}
          disabled={isSubmitting}
          className={`px-6 py-3 cursor-pointer w-full rounded-sm font-medium text-white ${
            buttonText === "Punch In"
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
