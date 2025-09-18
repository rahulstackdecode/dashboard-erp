"use client";
import { useState, useEffect } from "react";
import { Clock, Plus, X } from "lucide-react";
import HrEmployeesStats from "../components/hr/HrEmployessStats";
import HrAttendanceOverview from "../components/hr/HrAttendanceOverview";
import AttendanceCharts from "../components/hr/AttendanceCharts";
import WeeklyAttendance from "../components/hr/WeeklyAttendance";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
    const [userName, setUserName] = useState("Loading...");
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

    // Fetch logged-in user's name dynamically
    useEffect(() => {
        const fetchUserName = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session?.user?.id) {
                const { data: userData, error } = await supabase
                    .from("users")
                    .select("name")
                    .eq("auth_id", session.user.id) // adjust column name to your db
                    .single();
                if (!error && userData?.name) {
                    setUserName(userData.name);
                } else {
                    setUserName("Guest");
                    console.error("Error fetching user:", error);
                }
            } else {
                setUserName("Guest");
            }
        };

        fetchUserName();
    }, []);

    /***date  */
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
                setProgress(Math.min(((diff + accumulatedSeconds) / 28800) * 100, 100));
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

    const svgSize = 150;
    const strokeWidth = 8;
    const radius = (svgSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const handleApplyLeave = (e: React.FormEvent) => {
        e.preventDefault();
        alert(
            `Leave Applied!\nType: ${leaveType}\nFrom: ${fromDate}\nTo: ${toDate}\nReason: ${reason}`
        );
        setLeaveType("Medical Leave");
        setFromDate("");
        setToDate("");
        setReason("");
        setIsModalOpen(false);
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
                                src="/images/user-img.png"
                                alt="User Img"
                                width={56}
                                height={56}
                                className="rounded-full"
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
                                    {formatTime(totalSeconds + accumulatedSeconds)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button className="mx-auto flex px-4 py-2 rounded-sm bg-[#2C2C2C] text-white text-sm font-medium">
                        Production : {getProductionTime()}
                    </button>

                    <p className="my-6 text-center text-[16px] text-black font-medium flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        {punchInTime &&
                            `Punch In at ${punchInTime.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}`}
                        {!punchInTime && accumulatedSeconds > 0 &&
                            `Punch Out at ${new Date().toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}`}
                        {!punchInTime && accumulatedSeconds === 0 && "Not Punched In"}
                    </p>

                    <div className="flex justify-center">
                        <button
                            onClick={handlePunchToggle}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                <AttendanceCharts />
                <WeeklyAttendance />
            </div>

            <HrAttendanceOverview />
        </div>
    );
}
