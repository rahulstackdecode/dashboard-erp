"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import EmployeesStats from "../components/employees/EmployeesStats";
import TaskOverviewWrapper from "../components/employees/TaskOverview";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import AttendanceTracking from "../components/employees/AttendanceTracking";
import LeaveForm from "../components/employees/LeaveForm";

export default function Dashboard() {
  const [userName, setUserName] = useState("Loading...");
  const [userPosition, setUserPosition] = useState("Loading...");
  const [userImage, setUserImage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
                  {userPosition || "Please update your position"}
                </p>
              </div>
            </div>

            {/* Apply Leave button */}
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 text-sm cursor-pointer font-medium text-white bg-[var(--primary-color)] rounded-sm transition hover:bg-[var(--btn-hover-bg)] w-full sm:w-auto justify-center"
            >
              <Plus size={16} /> Apply Leave
            </button>
          </div>

          <EmployeesStats />
        </div>

        {/* RIGHT - Attendance */}
        <AttendanceTracking userId={userId} />
      </div>

      <TaskOverviewWrapper />

      {/* Leave Form Modal */}
      {isLeaveModalOpen && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 px-4 sm:px-0"
          style={{ backgroundColor: "#00000066" }}
          onClick={() => setIsLeaveModalOpen(false)}
        >
          <div
            className="bg-white rounded-[5px] w-full max-w-[600px] relative sm:mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-2 px-4 sm:px-8 sm:py-2 border border-[#0000001A] flex justify-between items-center">
              <h2 className="text-[#2C2C2C] font-medium text-[20px] sm:text-[28px]">
                Apply For Leave
              </h2>
              <button
                className="cursor-pointer text-white bg-[#06A6F0] hover:bg-[#0784c6] rounded-full p-1 transition"
                onClick={() => setIsLeaveModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Inject your LeaveForm component */}
            <div className="p-4 sm:p-8">
              <LeaveForm userId={userId} onClose={() => setIsLeaveModalOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
