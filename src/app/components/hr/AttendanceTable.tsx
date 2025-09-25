"use client";

import { useEffect, useState } from "react";
import { Search, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient";
import "react-datepicker/dist/react-datepicker.css";

const departmentsList = [
    "All Departments",
    "Web Designer",
    "Seo",
    "Web Developer",
    "Sales",
];

interface AttendanceRow {
    name: string;
    department: string;
    date: string;
    status: { label: string; color: string; bgColor: string };
    checkIn: string;
    checkOut: string;
    shortLeave: string;
    totalHours: string;
}

interface User {
    id: number;
    auth_id: string;
    name: string;
    department: string | null;
    role: string | null;
}

export default function AttendanceTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [data, setData] = useState<AttendanceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from("users")
                    .select("id, auth_id, name, department, role")
                    .eq("auth_id", user.id)
                    .single<User>();
                if (!error && data) setCurrentUser(data);
            }
        };
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const fetchAttendance = async () => {
            try {
                setLoading(true);
                const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

                let usersQuery = supabase.from("users").select("id, auth_id, name, department, role").order("name", { ascending: true });
                const role = currentUser.role?.toLowerCase();
                if (role !== "hr" && role !== "team_leader" && role !== "ceo") {
                    usersQuery = usersQuery.eq("auth_id", currentUser.auth_id);
                }

                const { data: usersData, error: usersError } = await usersQuery;
                if (usersError) throw usersError;
                const users: User[] = usersData ?? [];

                const { data: attendanceData, error: attendanceError } = await supabase
                    .from("attendance")
                    .select("id, user_id, punch_in, punch_out, total_hours, total_seconds, date")
                    .eq("date", dateStr);
                if (attendanceError) throw attendanceError;

                const { data: leavesData, error: leavesError } = await supabase
                    .from("leaves")
                    .select("id, user_id, leave_type, from_date, to_date, status")
                    .eq("status", "Approved")
                    .lte("from_date", dateStr)
                    .gte("to_date", dateStr);
                if (leavesError) throw leavesError;

                const statusMapping: Record<string, AttendanceRow["status"]> = {
                    Present: { label: "Present", color: "#0764E6", bgColor: "#E6EFFC" },
                    Absent: { label: "Absent", color: "#E70D0D", bgColor: "#FFE5EE" },
                    Leave: { label: "On Leave", color: "#8B5CF6", bgColor: "#EDE9FE" },
                    Weekend: { label: "Weekend Holiday", color: "#34A853", bgColor: "#E6F4EA" }
                };

                const mapped: AttendanceRow[] = users.map(user => {
                    const record = attendanceData?.find(a => a.user_id === user.auth_id);
                    const leave = leavesData?.find(l => l.user_id === user.auth_id);
                    const dayOfWeek = selectedDate?.getDay(); // 0=Sun,6=Sat

                    let status;
                    if (leave) {
                        status = statusMapping.Leave;
                    } else if (record?.punch_in) {
                        status = statusMapping.Present;
                    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
                        // Weekend and not punched in
                        status = statusMapping.Weekend;
                    } else {
                        status = statusMapping.Absent;
                    }

                    const checkIn = record?.punch_in ? format(new Date(record.punch_in), "HH:mm") : "-";
                    const checkOut = record?.punch_out ? format(new Date(record.punch_out), "HH:mm") : "-";

                    let totalSeconds = record?.total_seconds || 0;
                    let shortLeave = "-";
                    if (leave?.leave_type === "Short Leave") {
                        shortLeave = "2 Hours";
                        totalSeconds = Math.max(totalSeconds - 7200, 0);
                    }

                    let totalHours = "-";
                    if (totalSeconds > 0) {
                        const hours = Math.floor(totalSeconds / 3600);
                        const mins = Math.floor((totalSeconds % 3600) / 60);
                        totalHours = `${hours}h ${mins}m`;
                    } else if (record?.total_hours && record.total_hours > 0) {
                        totalHours = `${record.total_hours} h`;
                    }

                    return {
                        name: user.name,
                        department: user.department || "-",
                        date: format(selectedDate!, "dd/MM/yyyy"),
                        status,
                        checkIn,
                        checkOut,
                        shortLeave,
                        totalHours,
                    };
                });

                setData(mapped);
            } catch (err) {
                console.error("Error fetching attendance:", err);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [selectedDate, currentUser]);

    const filteredData = data.filter(row => {
        const matchesSearch = row.name.toLowerCase().includes(searchQuery.toLowerCase()) || row.department.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = selectedDepartment === "All Departments" || row.department.toLowerCase() === selectedDepartment.toLowerCase();
        return matchesSearch && matchesDepartment;
    });

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);
    useEffect(() => setPage(1), [searchQuery, selectedDepartment, selectedDate, pageSize]);

    const getTimeColor = (label: string) => {
        switch (label) {
            case "Absent": return "#E70D0D";
            case "Late arrival": return "#D5B500";
            case "On Leave": return "#8B5CF6";
            case "Weekend Holiday": return "#34A853";
            default: return "#0764E6";
        }
    };

    return (
        <div className="attendance-wrapper">
            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex items-center w-full sm:w-1/2 md:w-1/4 border border-[#00000033] rounded-[5px] px-3 py-2 bg-white">
                    <Search className="text-gray-400 mr-2 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by name, department..."
                        className="w-full outline-none text-base font-light text-[#2C2C2C] bg-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-[200px]">
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="appearance-none w-full border border-[#00000033] text-[#2C2C2C] text-base font-light rounded-[5px] px-4 py-2 pr-10 bg-white outline-none"
                        >
                            {departmentsList.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                        </select>
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
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]" style={{ padding: "35px 25px" }}>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
                        <thead>
                            <tr className="text-gray-600 border-b border-gray-300">
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Employee Name</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Department</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Date</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Status</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Check-in</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Check-out</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Short Leave</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Total Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center px-4 py-6 text-[#567D8E] text-[14px] font-normal">Loading...</td></tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((row, index) => (
                                    <tr key={index} className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition">
                                        <td className="px-4 py-4 text-[#2C2C2C] text-[14px] font-normal">{row.name}</td>
                                        <td className="px-4 py-4 text-[#567D8E] cursor-pointer text-[14px] font-normal">{row.department}</td>
                                        <td className="px-4 py-4 text-[#567D8E] text-[14px] font-normal">{row.date}</td>
                                        <td className="px-4 py-4">
                                            <span style={{ color: row.status.color, backgroundColor: row.status.bgColor }}
                                                  className="inline-block px-3 py-1 rounded-sm text-xs font-normal whitespace-nowrap w-max min-w-fit">
                                                {row.status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 font-normal" style={{ color: getTimeColor(row.status.label) }}>{row.checkIn}</td>
                                        <td className="px-4 py-4 font-normal" style={{ color: getTimeColor(row.status.label) }}>{row.checkOut}</td>
                                        <td className="px-4 py-4 font-normal">{row.shortLeave}</td>
                                        <td className="px-4 py-4 font-normal">{row.totalHours}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={8} className="text-center px-4 py-6 text-[#567D8E] text-[14px] font-normal">No results found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 text-sm text-gray-600 gap-4 sm:gap-0">
                <div className="flex items-center text-gray-500 text-[14px] gap-2">
                    <span>Showing</span>
                    <div className="relative inline-block">
                        <select
                            className="appearance-none border border-gray-300 text-gray-700 text-[15px] font-medium rounded-md px-2 py-1 pr-6 min-w-[60px] bg-white shadow-sm focus:ring-2 focus:ring-blue-400"
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>
                    </div>
                    <span>Results</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        className="cursor-pointer px-4 py-2 text-[15px] font-medium text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0] transition"
                    >
                        Prev
                    </button>
                    <span className="px-4 py-2 bg-[#06A6F0] text-white text-[15px] font-medium rounded-[5px]">{page}</span>
                    <button
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        className="cursor-pointer px-4 py-2 text-[15px] font-medium text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0] transition"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
