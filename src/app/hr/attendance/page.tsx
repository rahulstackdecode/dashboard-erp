"use client";
import { useState } from "react";
import AttendanceStats from "@/app/components/AttendanceStats";
import AttendanceTable from "@/app/components/hr/AttendanceTable";

export default function HomePage() {

    return (
        <>
            <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
                Employee Attendance
            </h2>
            {/* Dashboard Stats */}
            <AttendanceStats />

            <div className="mt-10">
                <AttendanceTable />
            </div>
        </>
    );
}
