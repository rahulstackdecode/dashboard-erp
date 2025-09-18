"use client";

import { useEffect, useState } from "react";
import { Search, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { parse, format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

// ✅ Updated department list
const departmentsList = [
    "All Departments",
    "Web Design",
    "Developer",
    "SEO",
    "Design",
    "Marketing",
    "Development",
    "Sales",
    "UI/UX",
    "HR",
    "Management",
    "IT Support",
];

export default function AttendanceTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        parse("29/08/2025", "dd/MM/yyyy", new Date())
    );
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const data = [
        { id: 1234, name: "Ahmed Rashdan", role: "Web Designer", department: "Web Design", date: "29/08/2025", status: { label: "Work from office", color: "#0764E6", bgColor: "#E6EFFC" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 2345, name: "Sara Khan", role: "SEO Specialist", department: "SEO", date: "29/08/2025", status: { label: "Absent", color: "#E70D0D", bgColor: "#FFE5EE" }, checkIn: "00:00", checkOut: "00:00" },
        { id: 3456, name: "John Doe", role: "Senior Manager", department: "Design", date: "29/08/2025", status: { label: "Late arrival", color: "#D5B500", bgColor: "#FFF8E7" }, checkIn: "10:30", checkOut: "18:00" },
        { id: 4567, name: "Emily Clark", role: "Frontend Developer", department: "Developer", date: "29/08/2025", status: { label: "Work from home", color: "#6B7280", bgColor: "#F3F4F6" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 5678, name: "Mike Johnson", role: "Sales Lead", department: "Sales", date: "29/08/2025", status: { label: "Work from office", color: "#0764E6", bgColor: "#E6EFFC" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 6789, name: "Zara Patel", role: "Graphic Designer", department: "UI/UX", date: "29/08/2025", status: { label: "Work from office", color: "#0764E6", bgColor: "#E6EFFC" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 7890, name: "Nathan Lee", role: "Backend Developer", department: "Developer", date: "29/08/2025", status: { label: "Absent", color: "#E70D0D", bgColor: "#FFE5EE" }, checkIn: "00:00", checkOut: "00:00" },
        { id: 8901, name: "Priya Mehta", role: "Content Strategist", department: "Marketing", date: "29/08/2025", status: { label: "Work from home", color: "#6B7280", bgColor: "#F3F4F6" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 9012, name: "Jason Wu", role: "UX Researcher", department: "UI/UX", date: "30/08/2025", status: { label: "Late arrival", color: "#D5B500", bgColor: "#FFF8E7" }, checkIn: "10:15", checkOut: "18:00" },
        { id: 1122, name: "Fatima Noor", role: "Data Analyst", department: "Development", date: "29/08/2025", status: { label: "Work from office", color: "#0764E6", bgColor: "#E6EFFC" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 2233, name: "Leo Mendes", role: "HR Executive", department: "HR", date: "29/08/2025", status: { label: "Work from office", color: "#0764E6", bgColor: "#E6EFFC" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 3344, name: "Maya Kapoor", role: "Product Manager", department: "Design", date: "01/09/2025", status: { label: "Late arrival", color: "#D5B500", bgColor: "#FFF8E7" }, checkIn: "10:05", checkOut: "18:00" },
        { id: 4455, name: "Tom Hanks", role: "QA Tester", department: "Development", date: "02/09/2025", status: { label: "Work from home", color: "#6B7280", bgColor: "#F3F4F6" }, checkIn: "09:15", checkOut: "17:45" },
        { id: 5566, name: "Alia Devi", role: "UI Developer", department: "UI/UX", date: "31/08/2025", status: { label: "Absent", color: "#E70D0D", bgColor: "#FFE5EE" }, checkIn: "00:00", checkOut: "00:00" },
        { id: 6677, name: "Carlos Rivera", role: "Sales Executive", department: "Sales", date: "31/08/2025", status: { label: "Work from office", color: "#0764E6", bgColor: "#E6EFFC" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 7788, name: "Jane Foster", role: "Brand Strategist", department: "Marketing", date: "30/08/2025", status: { label: "Work from home", color: "#6B7280", bgColor: "#F3F4F6" }, checkIn: "09:30", checkOut: "18:00" },
        { id: 8899, name: "Bruce Wayne", role: "CTO", department: "Management", date: "01/09/2025", status: { label: "Work from office", color: "#0764E6", bgColor: "#E6EFFC" }, checkIn: "08:45", checkOut: "18:30" },
        { id: 9900, name: "Clark Kent", role: "Project Lead", department: "Web Design", date: "02/09/2025", status: { label: "Late arrival", color: "#D5B500", bgColor: "#FFF8E7" }, checkIn: "10:45", checkOut: "18:00" },
        { id: 1001, name: "Tina Brown", role: "Copywriter", department: "Marketing", date: "01/09/2025", status: { label: "Work from office", color: "#0764E6", bgColor: "#E6EFFC" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 1101, name: "Ravi Singh", role: "Support Engineer", department: "IT Support", date: "01/09/2025", status: { label: "Absent", color: "#E70D0D", bgColor: "#FFE5EE" }, checkIn: "00:00", checkOut: "00:00" },
        { id: 1201, name: "Olivia Benson", role: "UI Designer", department: "UI/UX", date: "02/09/2025", status: { label: "Work from office", color: "#0764E6", bgColor: "#E6EFFC" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 1301, name: "Ethan Hunt", role: "DevOps Engineer", department: "Developer", date: "02/09/2025", status: { label: "Work from home", color: "#6B7280", bgColor: "#F3F4F6" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 1401, name: "Sophia Lee", role: "SEO Analyst", department: "SEO", date: "01/09/2025", status: { label: "Late arrival", color: "#D5B500", bgColor: "#FFF8E7" }, checkIn: "10:00", checkOut: "18:00" },
        { id: 1501, name: "Liam Murphy", role: "Product Owner", department: "Management", date: "31/08/2025", status: { label: "Work from office", color: "#0764E6", bgColor: "#E6EFFC" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 1601, name: "Mia Davis", role: "Content Writer", department: "Marketing", date: "29/08/2025", status: { label: "Absent", color: "#E70D0D", bgColor: "#FFE5EE" }, checkIn: "00:00", checkOut: "00:00" },
        { id: 1701, name: "Noah Wilson", role: "Backend Developer", department: "Developer", date: "30/08/2025", status: { label: "Work from office", color: "#0764E6", bgColor: "#E6EFFC" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 1801, name: "Isabella Gomez", role: "HR Manager", department: "HR", date: "02/09/2025", status: { label: "On Leave", color: "#8B5CF6", bgColor: "#EDE9FE" }, checkIn: "00:00", checkOut: "00:00" },
        { id: 1901, name: "James Brown", role: "QA Engineer", department: "Development", date: "01/09/2025", status: { label: "Work from home", color: "#6B7280", bgColor: "#F3F4F6" }, checkIn: "09:00", checkOut: "17:30" },
        { id: 2001, name: "Charlotte Evans", role: "Social Media Manager", department: "Marketing", date: "31/08/2025", status: { label: "Work from office", color: "#0764E6", bgColor: "#E6EFFC" }, checkIn: "09:00", checkOut: "18:00" },
        { id: 2101, name: "Daniel Kim", role: "System Administrator", department: "IT Support", date: "30/08/2025", status: { label: "Late arrival", color: "#D5B500", bgColor: "#FFF8E7" }, checkIn: "10:20", checkOut: "18:00" },
    ];


    const filteredData = data.filter((row) => {
        const matchesSearch =
            row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.department.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDepartment =
            selectedDepartment === "All Departments" ||
            row.department.toLowerCase() === selectedDepartment.toLowerCase();

        const matchesDate =
            selectedDate && row.date === format(selectedDate, "dd/MM/yyyy");

        return matchesSearch && matchesDepartment && matchesDate;
    });

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    useEffect(() => {
        setPage(1);
    }, [searchQuery, selectedDepartment, selectedDate, pageSize]);

    return (
        <div className="attendance-wrapper">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                {/* Search */}
                <div className="flex items-center w-full sm:w-1/2 md:w-1/4 border border-[#00000033] rounded-[5px] px-3 py-2 bg-white">
                    <Search className="text-gray-400 mr-2 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name, role, department..."
                        className="w-full outline-none text-base font-light text-[#2C2C2C] bg-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
                    {/* Department Filter */}
                    <div className="relative w-full sm:w-[200px]">
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="appearance-none w-full border border-[#00000033] text-[#2C2C2C] text-base font-light rounded-[5px] px-4 py-2 pr-10 bg-white outline-none"
                        >
                            {departmentsList.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                        <svg
                            className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    <div className="relative w-full sm:w-[200px]">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date: Date | null) => date && setSelectedDate(date)}
                            dateFormat="dd MMM, yyyy"
                            className="w-full border border-[#00000033] text-[#2C2C2C] text-base font-light rounded-[5px] pl-10 pr-12 py-2 bg-white outline-none box-border"
                            calendarClassName="shadow-lg"
                            placeholderText="Select date"
                            isClearable={false}
                        />

                        {/* Calendar icon (left) */}
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />

                        {/* Dropdown arrow (right) */}
                        <svg
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                </div>
            </div>


            {/* Table */}
            <div
                className="bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]"
                style={{ padding: "35px 25px" }}
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
                        <thead>
                            <tr className="text-gray-600 border-b border-gray-300">
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">ID</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Employee</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Role</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Department</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Date</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Status</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Check-in</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Check-out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((row) => {
                                    const getTimeColor = (label: string): string => {
                                        switch (label) {
                                            case "Absent":
                                                return "#E70D0D";
                                            case "Late arrival":
                                                return "#D5B500";
                                            case "On Leave":
                                                return "#8B5CF6";
                                            default:
                                                return "#0764E6";
                                        }
                                    };

                                    return (
                                        <tr
                                            key={row.id + row.name}
                                            className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition"
                                        >
                                            <td className="px-4 py-4 text-[#2C2C2C] text-[14px] font-normal">{row.id}</td>
                                            <td className="px-4 py-4 text-[#2C2C2C] text-[14px] font-normal">{row.name}</td>
                                            <td className="px-4 py-4 text-[#567D8E] cursor-pointer text-[14px] font-normal">{row.role}</td>
                                            <td className="px-4 py-4 text-[#567D8E] cursor-pointer text-[14px] font-normal">{row.department}</td>
                                            <td className="px-4 py-4 text-[#567D8E] text-[14px] font-normal">{row.date}</td>
                                            <td className="px-4 py-4">
                                                <span
                                                    style={{ color: row.status.color, backgroundColor: row.status.bgColor }}
                                                    className="inline-block px-3 py-1 rounded-sm text-xs font-normal whitespace-nowrap w-max min-w-fit"
                                                >
                                                    {row.status.label}
                                                </span>

                                            </td>
                                            <td className="px-4 py-4 font-normal" style={{ color: getTimeColor(row.status.label) }}>
                                                {row.checkIn}
                                            </td>
                                            <td className="px-4 py-4 font-normal" style={{ color: getTimeColor(row.status.label) }}>
                                                {row.checkOut}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center px-4 py-6 text-[#567D8E] text-[14px] font-normal">
                                        No results found.
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 text-sm text-gray-600 gap-4 sm:gap-0">
                {/* Showing results + page size */}
                <div className="flex items-center text-[#567D8E] text-[14px] justify-center sm:justify-start gap-2 flex-wrap">
                    <span>Showing</span>
                    <div className="relative inline-block">
                        <select
                            className="appearance-none border border-[#E8E8E9] text-[#2C2C2C] text-[15px] font-normal rounded-[5px] px-2 py-1 pr-6 min-w-[60px] bg-white"
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>
                        <svg
                            className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <span>Results</span>
                </div>

                {/* Pagination buttons */}
                <div className="flex items-center gap-2 justify-center sm:justify-end flex-wrap">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        className="px-4 py-2 text-[16px] font-light text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0]"
                    >
                        Prev
                    </button>

                    <span className="px-4 py-2 bg-[#06A6F0] text-white text-[16px] font-light rounded-[5px]">
                        {page}
                    </span>

                    <button
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                        className="px-4 py-2 text-[16px] font-light text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0]"
                    >
                        Next
                    </button>
                </div>
            </div>

        </div>
    );
}
