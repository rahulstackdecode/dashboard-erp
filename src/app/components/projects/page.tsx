"use client";
import { useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import ResponsiveSidebar from "@/app/components/Responsive-Sidebar";
import Topbar from "@/app/components/Topbar";
import AttendanceStats from "@/app/components/AttendanceStats";
import AttendanceTable from "@/app/components/hr/AttendanceTable";
import FooterCopyright from "@/app/components/FooterCopyright";

export default function HomePage() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="min-h-screen bg-white">
            <div className="wrapper ">
                <div className="dashboard-container flex">

                    <Sidebar isOpen={isOpen} />
                    <ResponsiveSidebar />
                    {/* Main Content */}
                    <div className="h-screen flex-1 flex flex-col transition-all duration-300 overflow-hidden">
                        <Topbar toggleSidebar={() => setIsOpen(!isOpen)} />

                        <main className="flex-1 flex flex-col justify-between bg-white overflow-x-hidden">
                            <div className="dashboard-wrapper px-4 py-7 lg:py-7 lg:px-8 max-w-full">
                                <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
                                    Employee Attendance
                                </h2>
                                {/* Dashboard Stats */}
                                <AttendanceStats />

                                <div className="mt-10">
                                    <AttendanceTable />
                                </div>

                            </div>
                            {/* Footer */}
                            <FooterCopyright />
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
