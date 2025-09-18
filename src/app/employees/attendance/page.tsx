"use client";
import { useState } from "react";
import EmployeesStats from "@/app/components/employees/EmployeesStats";
import AttendanceTable from "@/app/components/employees/AttendanceTable";

export default function HomePage() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
                Employee Attendance
            </h2>
            {/* Dashboard Stats */}
            <EmployeesStats />

            <div className="mt-10">
                <AttendanceTable />
            </div>
        </>
    );
}
