"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import HrEmployeesStats from "../components/hr/HrEmployessStats";
import HrAttendanceOverview from "../components/hr/HrAttendanceOverview";
import AttendanceCharts from "../components/hr/AttendanceCharts";
import WeeklyAttendance from "../components/hr/WeeklyAttendance";
import Image from "next/image";
import AttendanceTracking from "../components/employees/AttendanceTracking";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Loading...");
  const [userImage, setUserImage] = useState("");
  const [userDesignation, setUserDesignation] = useState("Loading...");
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [buttonText, setButtonText] = useState<string>("Punch In");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("Medical Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  // Fetch logged-in user's name + id dynamically
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user?.id) {
          const userId = session.user.id;
          setUserId(userId);

          const { data: userData, error } = await supabase
            .from("users")
            .select("name, designation, profile_image") // include designation
            .eq("auth_id", userId)
            .single();

          if (error || !userData) {
            setUserName("Unknown User");
            setUserDesignation("-");
            setUserImage("/images/user-img.png");
          } else {
            setUserName(userData.name || "Unknown User");
            setUserDesignation(userData.designation || "-");
            setUserImage(userData.profile_image || "/images/user-img.png");
          }
        } else {
          setUserName("Guest");
          setUserId(null);
          setUserDesignation("-");
          setUserImage("/images/user-img.png");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setUserName("Guest");
        setUserId(null);
        setUserDesignation("-");
        setUserImage("/images/user-img.png");
      }
    };

    fetchUser();
  }, []);

  /*** Date Formatting  */
  function formatDateTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHour = (hours % 12 || 12).toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");

    const time = `${formattedHour}:${formattedMinutes} ${ampm}`;
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    return `${time}, ${day} ${month} ${year}`;
  }

  // Live timer
  useEffect(() => {
    let timer: number;
    if (punchInTime) {
      timer = window.setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - punchInTime.getTime()) / 1000);
        setTotalSeconds(diff);
        setProgress(
          Math.min(((diff + accumulatedSeconds) / 28800) * 100, 100)
        );
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [punchInTime, accumulatedSeconds]);

  const handlePunchToggle = () => {
    if (!punchInTime) {
      setPunchInTime(new Date());
      setButtonText("Punch Out");
    } else {
      const now = new Date();
      const diff = Math.floor((now.getTime() - punchInTime.getTime()) / 1000);
      setAccumulatedSeconds((prev) => prev + diff);
      setPunchInTime(null);
      setTotalSeconds(0);
      setButtonText("Punch In");
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getProductionTime = () => {
    const total = totalSeconds + accumulatedSeconds;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    return `${h}:${m < 10 ? "0" + m : m} hrs`;
  };

  return (
    <div>
      <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
        Hr Dashboard
      </h2>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full bg-white rounded-sm p-5 shadow-[0px_0px_1px_1px_rgba(198,198,198)]">
            <div className="flex items-center gap-4">
              <Image
                src={userImage || "/images/user-img.png"}
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
                  You have{" "}
                  <span className="text-[color:var(--primary-color)] underline cursor-pointer">
                    21
                  </span>{" "}
                  Pending Approvals
                </p>
              </div>
            </div>

            <button
              className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 text-[14px] sm:text-[15px] cursor-pointer font-medium text-white bg-[var(--primary-color)] rounded-sm transition hover:bg-[var(--btn-hover-bg)] w-full sm:w-auto justify-center"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              Apply Leave
            </button>
          </div>

          <HrEmployeesStats />
        </div>

        {/* RIGHT - Attendance */}
        <AttendanceTracking userId={userId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
        <AttendanceCharts />
        <WeeklyAttendance />
      </div>

      <HrAttendanceOverview />
    </div>
  );
}
