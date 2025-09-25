"use client";
import AttendanceTable from "@/app/components/hr/AttendanceTable";

export default function HomePage() {

    return (
        <>
            <h2 className="mb-6 font-medium text-[26px] sm:text-[32px] text-[color:var(--heading-color)] leading-snug">
                Employee Attendance
            </h2>
            {/* Dashboard Stats */}
            
            <div className="mt-10">
                <AttendanceTable />
            </div>
        </>
    );
}
