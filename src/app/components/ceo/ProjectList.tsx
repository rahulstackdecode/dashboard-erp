"use client";

import { useState } from "react";
import { Search, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

type Status = "Completed" | "Overdue" | "In Progress" | "In Review";

interface Project {
    id: number;
    projectName: string;
    clientName: string;
    assignedTeam: string;
    priority: "High" | "Medium" | "Low";
    startDate: string;
    endDate: string;
    status: { label: Status; color: string; bgColor: string };
}

const STATUS_OPTIONS = {
    Completed: { color: "#16A34A", bgColor: "#D1FAE5" },
    Overdue: { color: "#E70D0D", bgColor: "#FFE5EE" },
    "In Progress": { color: "#D5B500", bgColor: "#FFF4C1" },
    "In Review": { color: "#3498DB", bgColor: "#E6F0FF" },
};

const initialProjects: Project[] = [
    {
        id: 1,
        projectName: "Website Redesign",
        clientName: "Ahmed Rashdan",
        assignedTeam: "Web Designer",
        priority: "High",
        startDate: "29/08/2025",
        endDate: "29/08/2025",
        status: { label: "Completed", ...STATUS_OPTIONS.Completed },
    },
    {
        id: 2,
        projectName: "Mobile App",
        clientName: "Ahmed Rashdan",
        assignedTeam: "Senior Executive",
        priority: "Medium",
        startDate: "29/08/2025",
        endDate: "29/08/2025",
        status: { label: "Overdue", ...STATUS_OPTIONS.Overdue },
    },
    {
        id: 3,
        projectName: "CRM System",
        clientName: "Ahmed Rashdan",
        assignedTeam: "Senior Manager",
        priority: "Low",
        startDate: "29/08/2025",
        endDate: "29/08/2025",
        status: { label: "In Progress", ...STATUS_OPTIONS["In Progress"] },
    },
    {
        id: 4,
        projectName: "AI Integration",
        clientName: "Ahmed Rashdan",
        assignedTeam: "Director",
        priority: "Medium",
        startDate: "29/08/2025",
        endDate: "29/08/2025",
        status: { label: "In Review", ...STATUS_OPTIONS["In Review"] },
    },
    {
        id: 5,
        projectName: "SEO Optimization",
        clientName: "Ahmed Rashdan",
        assignedTeam: "Director",
        priority: "High",
        startDate: "29/08/2025",
        endDate: "29/08/2025",
        status: { label: "Overdue", ...STATUS_OPTIONS.Overdue },
    },
    {
        id: 6,
        projectName: "Email Template",
        clientName: "Ahmed Rashdan",
        assignedTeam: "Graphic Designer",
        priority: "High",
        startDate: "29/08/2025",
        endDate: "29/08/2025",
        status: { label: "In Progress", ...STATUS_OPTIONS["In Progress"] },
    },
];

// ✅ Dynamically generate department list from project data
const departmentsList = [
    "All Departments",
    ...Array.from(new Set(initialProjects.map((p) => p.assignedTeam))),
];

export default function ProjectList() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
    const [projects, setProjects] = useState<Project[]>(initialProjects);

    // ✅ Pagination states
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredProjects = projects.filter((p) => {
        const low = searchQuery.toLowerCase();
        const matchesSearch =
            p.projectName.toLowerCase().includes(low) ||
            p.clientName.toLowerCase().includes(low) ||
            p.assignedTeam.toLowerCase().includes(low);

        const matchesDept =
            selectedDepartment === "All Departments" || p.assignedTeam === selectedDepartment;

        return matchesSearch && matchesDept;
    });

    // ✅ Slice data for pagination
    const totalPages = Math.ceil(filteredProjects.length / pageSize);
    const paginatedProjects = filteredProjects.slice((page - 1) * pageSize, page * pageSize);

    const handleDelete = (id: number) => {
        if (confirm("Are you sure you want to delete this project?")) {
            setProjects((prev) => prev.filter((p) => p.id !== id));
        }
    };

    return (
        <div className="attendance-wrapper">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                {/* Search input */}
                <div className="flex items-center border border-[#00000033] rounded-[5px] px-3 py-2 bg-white flex-grow max-w-sm">
                    <Search className="text-gray-400 mr-2 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by Project Name, Client or Team..."
                        className="w-full outline-none text-base font-light text-[#2C2C2C] bg-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
                    {/* Department filter dropdown */}
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
                        
                    </div>

                    {/* New Project Button */}
                    <Link
                        href="/ceo/addproject"
                        className="cursor-pointer bg-[#06A6F0] text-white font-normal px-5 py-2 rounded-[5px] hover:bg-[#0595d9] transition"
                    >
                        + New Project
                    </Link>
                </div>
            </div>

            <div
                className="bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]"
                style={{ padding: "35px 25px" }}
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
                        <thead>
                            <tr className="text-gray-600 border-b border-gray-300">
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Project Name</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Client Name</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Assigned Team</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Priority</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Start Date</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">End Date</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Status</th>
                                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProjects.length ? (
                                paginatedProjects.map((proj) => (
                                    <tr
                                        key={proj.id}
                                        className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition"
                                    >
                                        <td className="px-4 py-4 text-[#2C2C2C]">{proj.projectName}</td>
                                        <td className="px-4 py-4 text-[#2C2C2C]">{proj.clientName}</td>
                                        <td className="px-4 py-4 text-[#567D8E]">{proj.assignedTeam}</td>
                                        <td
                                            className={`px-4 py-4 ${proj.priority === "High"
                                                ? "text-red-600"
                                                : proj.priority === "Medium"
                                                    ? "text-yellow-500"
                                                    : "text-blue-600"
                                                }`}
                                        >
                                            {proj.priority}
                                        </td>
                                        <td className="px-4 py-4 text-[#567D8E]">{proj.startDate}</td>
                                        <td className="px-4 py-4 text-[#567D8E]">{proj.endDate}</td>
                                        <td className="px-4 py-4">
                                            <span
                                                style={{
                                                    color: proj.status.color,
                                                    backgroundColor: proj.status.bgColor,
                                                }}
                                                className="inline-block px-3 py-1 rounded-sm text-xs font-normal whitespace-nowrap w-max min-w-fit"
                                            >
                                                {proj.status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                className="cursor-pointer mr-3 text-gray-600 hover:text-gray-900"
                                                title="Edit Project"
                                                onClick={() => alert(`Edit project: ${proj.projectName}`)}
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="cursor-pointer text-red-600 hover:text-red-800"
                                                title="Delete Project"
                                                onClick={() => handleDelete(proj.id)}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-gray-500 font-light">
                                        No projects found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ✅ Fixed Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 text-sm text-gray-600 gap-4 sm:gap-0">
                <div className="flex items-center text-[#567D8E] text-[14px] font-normal justify-center sm:justify-start gap-2 flex-wrap">
                    <span>Showing</span>
                    <div className="relative inline-block">
                        <select
                            className="appearance-none border border-[#E8E8E9] text-[#2C2C2C] text-[15px] font-normal rounded-[5px] px-2 py-1 pr-6 min-w-[60px] bg-white"
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPage(1);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>
                        
                    </div>
                    <span>Results</span>
                </div>

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
