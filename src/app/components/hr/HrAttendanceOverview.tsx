import React, { useState } from "react";
import { Trash2, ChevronDown } from "lucide-react";

// --- Define types ---
type AttendanceStatus = {
    label: string;
    color: string;
    bgColor: string;
};

type AttendanceRecord = {
    id: string | number;
    employeeName: string;
    role: string;
    department: string;
    date: string;
    status: AttendanceStatus;
    checkIn: string;
    checkOut: string;
};

// --- Status options ---
const STATUS_OPTIONS: AttendanceStatus[] = [
    { label: "Work from office", color: "#2A72D6", bgColor: "#D6E7FF" },
    { label: "Absent", color: "#E70D0D", bgColor: "#FFE5EE" },
    { label: "Late arrival", color: "#D5B500", bgColor: "#FFF8E7" },
    { label: "Work from home", color: "#8F8F8F", bgColor: "#F2F2F2" },
];

// --- Initial attendance records ---
const initialAttendance: AttendanceRecord[] = [
    {
        id: 1234,
        employeeName: "Ahmed Rashdan",
        role: "Web Designer",
        department: "Design",
        date: "29/08/2025",
        status: { label: "Work from office", color: "#2A72D6", bgColor: "#D6E7FF" },
        checkIn: "09:00",
        checkOut: "18:00",
    },
    {
        id: 1235,
        employeeName: "Ahmed Rashdan",
        role: "Senior Executive",
        department: "Marketing",
        date: "29/08/2025",
        status: { label: "Absent", color: "#E70D0D", bgColor: "#FFE5EE" },
        checkIn: "00:00",
        checkOut: "00:00",
    },
    {
        id: 1236,
        employeeName: "Ahmed Rashdan",
        role: "Senior Manager",
        department: "Design",
        date: "29/08/2025",
        status: { label: "Late arrival", color: "#D5B500", bgColor: "#FFF8E7" },
        checkIn: "10:30",
        checkOut: "18:00",
    },
    {
        id: 1237,
        employeeName: "Ahmed Rashdan",
        role: "Director",
        department: "Development",
        date: "29/08/2025",
        status: { label: "Work from home", color: "#8F8F8F", bgColor: "#F2F2F2" },
        checkIn: "09:00",
        checkOut: "18:00",
    },
    {
        id: 1238,
        employeeName: "Ahmed Rashdan",
        role: "Director",
        department: "Sales",
        date: "29/08/2025",
        status: { label: "Work from office", color: "#2A72D6", bgColor: "#D6E7FF" },
        checkIn: "09:00",
        checkOut: "18:00",
    },
    {
        id: 1239,
        employeeName: "Ahmed Rashdan",
        role: "Graphic Designer",
        department: "Ui/Ux",
        date: "29/08/2025",
        status: { label: "Work from office", color: "#2A72D6", bgColor: "#D6E7FF" },
        checkIn: "09:00",
        checkOut: "18:00",
    },
];

// --- AttendanceOverview Component ---
type AttendanceOverviewProps = {
    paginatedRecords: AttendanceRecord[];
    handleDelete: (id: string | number) => void;
    handleStatusChange: (id: string | number, statusLabel: string) => void;
};

const AttendanceOverview: React.FC<AttendanceOverviewProps> = ({
    paginatedRecords,
    handleDelete,
    handleStatusChange,
}) => {
    const [openStatusDropdown, setOpenStatusDropdown] = useState<number | string | null>(null);

    return (
        <div className="bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] p-[25px_25px] relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3 sm:gap-0">
                <h2 className="font-medium text-[18px] sm:text-[20px] text-[#2C2C2C]">Attendance Overview</h2>
                <button className="text-[14px] cursor-pointer text-white bg-[var(--primary-color)] px-6 py-3 rounded transition hover:bg-[var(--btn-hover-bg)]">
                    View All Attendance
                </button>
            </div>

            <div className="overflow-x-auto border-t border-[#D5D9DD] relative">
                <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
                    <thead>
                        <tr className="text-gray-600 border-b border-gray-300">
                            {[
                                "ID",
                                "Employee",
                                "Role",
                                "Department",
                                "Date",
                                "Status",
                                "Check-in",
                                "Check-out",
                            ].map((heading) => (
                                <th
                                    key={heading}
                                    className="px-4 py-4 text-black font-medium text-[15px]"
                                    scope="col"
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRecords.length > 0 ? (
                            paginatedRecords.map((record) => (
                                <tr
                                    key={record.id}
                                    className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition"
                                >
                                    <td className="px-4 py-4 text-[#2C2C2C]">{record.id}</td>
                                    <td className="px-4 py-4 text-[#2C2C2C]">{record.employeeName}</td>
                                    <td className="px-4 py-4 text-[#567D8E] cursor-pointer">{record.role}</td>
                                    <td className="px-4 py-4 text-[#567D8E]">{record.department}</td>
                                    <td className="px-4 py-4 text-[#567D8E]">{record.date}</td>
                                    <td className="px-4 py-4 relative">
                                        {/* Status Dropdown */}
                                        <div
                                            onClick={() =>
                                                setOpenStatusDropdown(openStatusDropdown === record.id ? null : record.id)
                                            }
                                            className="inline-flex items-center justify-between w-max px-3 py-1 rounded-sm text-xs font-normal whitespace-nowrap cursor-pointer select-none"
                                            style={{
                                                color: record.status.color,
                                                backgroundColor: record.status.bgColor,
                                                minWidth: "min-content",
                                            }}
                                        >
                                            <span>{record.status.label}</span>
                                            <ChevronDown size={14} className="ml-1" />
                                        </div>

                                        {openStatusDropdown === record.id && (
                                            <ul
                                                className="absolute top-0 z-50 left-0  bg-white border border-gray-300 rounded-md shadow-md min-w-fit"
                                                style={{ minWidth: "min-content" }}
                                            >
                                                {STATUS_OPTIONS.map((statusOption) => (
                                                    <li
                                                        key={statusOption.label}
                                                        onClick={() => {
                                                            handleStatusChange(record.id, statusOption.label);
                                                            setOpenStatusDropdown(null);
                                                        }}
                                                        className="px-3 py-1 cursor-pointer hover:bg-[#06A6F0] hover:text-white rounded-sm"
                                                    >
                                                        {statusOption.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </td>
                                    <td
                                        className={`px-4 py-4 cursor-default ${record.status.label === "Absent" ? "text-red-600" : "text-blue-600"
                                            }`}
                                    >
                                        {record.checkIn}
                                    </td>
                                    <td
                                        className={`px-4 py-4 cursor-default ${record.status.label === "Absent" ? "text-red-600" : "text-blue-600"
                                            }`}
                                    >
                                        {record.checkOut}
                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="text-center py-10 text-gray-500 font-light">
                                    No attendance records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Wrapper Component ---
const HrAttendanceOverview: React.FC = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>(initialAttendance);

    const handleDelete = (id: string | number) => {
        if (window.confirm("Are you sure you want to delete this attendance record?")) {
            setRecords((prev) => prev.filter((record) => record.id !== id));
        }
    };

    const handleStatusChange = (id: string | number, statusLabel: string) => {
        const newStatus = STATUS_OPTIONS.find((status) => status.label === statusLabel);
        if (!newStatus) return;

        setRecords((prev) =>
            prev.map((record) => (record.id === id ? { ...record, status: newStatus } : record))
        );
    };

    return (
        <AttendanceOverview
            paginatedRecords={records}
            handleDelete={handleDelete}
            handleStatusChange={handleStatusChange}
        />
    );
};

export default HrAttendanceOverview;
