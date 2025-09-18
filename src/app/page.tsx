"use client";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ResponsiveSidebar from "./components/Responsive-Sidebar";
import Topbar from "./components/Topbar";
import DashboardStats from "./components/DashboardStats";
import { Plus } from "lucide-react";
import SalesChart from "./components/SalesChart";
import ProjectsChart from "./components/ProjectsChart";
import EmployeesChart from "./components/EmployeesChart";
import Image from "next/image";
import FooterCopyright from "./components/FooterCopyright";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState("Loading...");
  const [userImage, setUserImage] = useState<string | null>(null); // <- dynamic profile image

  // Fetch logged-in user data dynamically
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.id) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("name, profile_image") // <- fetch profile_image column
          .eq("auth_id", session.user.id)
          .single();

        if (!error && userData) {
          setUserName(userData.name || "Guest");
          setUserImage(userData.profile_image || null); // <- set dynamic image
        } else {
          setUserName("Guest");
          console.error("Error fetching user:", error);
        }
      } else {
        setUserName("Guest");
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
        Admin Dashboard
      </h2>

      {/* Welcome Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full bg-white rounded-sm p-5 shadow-[0px_0px_1px_1px_rgba(198,198,198)]">
        {/* Left Section */}
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
              Welcome1 Back, {userName}
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

        {/* Right Section */}
        <button className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 text-[14px] sm:text-[15px] cursor-pointer font-medium text-white bg-[var(--primary-color)] rounded-sm transition hover:bg-[var(--btn-hover-bg)] w-full sm:w-auto justify-center">
          <Plus size={16} />
          Add Project
        </button>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Sales Chart */}
      <div className="w-full mt-6">
        <SalesChart key={isOpen ? "open" : "closed"} />
      </div>

      <div className="project-charts flex flex-col lg:flex-row gap-5 mt-6">
        {/* Projects Chart */}
        <div className="project-col w-full lg:flex-1 min-w-0">
          <div className="w-full">
            <ProjectsChart key={isOpen ? "open" : "closed"} />
          </div>
        </div>

        {/* Employees Chart */}
        <div className="employees-col w-full lg:w-[35%] min-w-0">
          <div className="w-full">
            <EmployeesChart key={isOpen ? "open" : "closed"} />
          </div>
        </div>
      </div>
    </>
  );
}
