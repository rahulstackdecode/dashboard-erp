"use client";

import { useState, useEffect } from "react";
import { Search, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Status = "Completed" | "Overdue" | "In Progress" | "In Review";

interface Project {
  id: number;
  projectName: string;
  clientName: string;
  projectManager: string;
  startDate: string;
  dueDate: string;
  status: { label: Status; color: string; bgColor: string };
  department?: string;
}

interface User {
  id: number;
  name: string;
  designation?: string | null;
  department?: string | null;
}

interface ProjectData {
  id: number;
  project_name?: string | null;
  client_name?: string | null;
  project_manager: number;
  start_date?: string | null;
  due_date?: string | null;
  status?: Status | null;
}

const STATUS_OPTIONS: Record<Status, { color: string; bgColor: string }> = {
  Completed: { color: "#16A34A", bgColor: "#D1FAE5" },
  Overdue: { color: "#E70D0D", bgColor: "#FFE5EE" },
  "In Progress": { color: "#D5B500", bgColor: "#FFF4C1" },
  "In Review": { color: "#3498DB", bgColor: "#E6F0FF" },
};

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, { name: string; position?: string; department?: string }>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);

  const fetchData = async () => {
    // Fetch users
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, name, designation, department");
    if (usersError) return console.error("Error fetching users:", usersError);

    const users: User[] = (usersData || []) as User[];

    const userMap: Record<number, { name: string; designation?: string; department?: string }> = {};
    const depts: Set<string> = new Set();

    users.forEach((u) => {
      userMap[u.id] = {
        name: u.name,
        designation: u.designation || undefined,
        department: u.department || undefined,
      };
      if (u.department) depts.add(u.department);
    });

    setUsersMap(userMap);
    setDepartmentsList(Array.from(depts).filter((dept) => dept !== "HR" && dept !== "Bidder"));


    // Fetch projects
    const { data: projectsDataRaw, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectsError) return console.error("Error fetching projects:", projectsError);

    const projectsData: ProjectData[] = (projectsDataRaw || []) as ProjectData[];

    const formattedProjects: Project[] = projectsData.map((proj) => {
      const statusKey: Status = (proj.status as Status) || "In Progress";
      const manager = userMap[Number(proj.project_manager)] || Object.values(userMap)[0];
      return {
        id: proj.id,
        projectName: proj.project_name || "N/A",
        clientName: proj.client_name || "N/A",
        projectManager: manager
          ? `${manager.name}${manager.designation ? ` (${manager.designation} Team)` : ""}`
          : "N/A",
        department: manager?.department || "",
        startDate: proj.start_date || "N/A",
        dueDate: proj.due_date || "N/A",
        status: {
          label: statusKey,
          color: STATUS_OPTIONS[statusKey]?.color || "#000",
          bgColor: STATUS_OPTIONS[statusKey]?.bgColor || "#EEE",
        },
      };
    });


    setProjects(formattedProjects);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.projectName.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.projectManager.toLowerCase().includes(q)) &&
      (filterDept ? p.department === filterDept : true)
    );
  });

  const totalPages = Math.ceil(filteredProjects.length / pageSize);
  const paginatedProjects = filteredProjects.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return alert("Failed to delete project: " + error.message);
    fetchData();
  };

  return (
    <div className="attendance-wrapper">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center border border-[#00000033] rounded-[5px] px-3 py-2 bg-white flex-grow max-w-sm">
          <Search className="text-gray-400 mr-2 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by Project Name, Client or Manager..."
            className="w-full outline-none text-base font-light text-[#2C2C2C] bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-[200px]">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="appearance-none w-full border border-[#00000033] text-[#2C2C2C] text-base font-light rounded-[5px] px-4 py-2 pr-10 bg-white outline-none"
            >
              <option value="">All Departments</option>
              {departmentsList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/ceo/addproject"
            className="cursor-pointer bg-[#06A6F0] text-white font-normal px-5 py-2 rounded-[5px] hover:bg-[#0595d9] transition"
          >
            + New Project
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)]" style={{ padding: "35px 25px" }}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
            <thead>
              <tr className="text-gray-600 border-b border-gray-300">
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Project Name</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Client Name</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Project Manager</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Start Date</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Due Date</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Status</th>
                <th className="px-4 py-4 pt-0 text-black font-medium text-[15px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.length ? (
                paginatedProjects.map((proj) => (
                  <tr key={proj.id} className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition">
                    <td className="px-4 py-4 text-[#2C2C2C]">{proj.projectName}</td>
                    <td className="px-4 py-4 text-[#2C2C2C]">{proj.clientName}</td>
                    <td className="px-4 py-4 text-[#567D8E]">{proj.projectManager}</td>
                    <td className="px-4 py-4 text-[#567D8E]">{proj.startDate}</td>
                    <td className="px-4 py-4 text-[#567D8E]">{proj.dueDate}</td>
                    <td className="px-4 py-4">
                      <span
                        style={{ color: proj.status.color, backgroundColor: proj.status.bgColor }}
                        className="inline-block px-3 py-1 rounded-sm text-xs font-normal whitespace-nowrap w-max min-w-fit"
                      >
                        {proj.status.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        className="cursor-pointer mr-3 text-gray-600 hover:text-gray-900"
                        onClick={() => alert(`Edit project: ${proj.projectName}`)}
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className="cursor-pointer text-red-600 hover:text-red-800"
                        onClick={() => handleDelete(proj.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500 font-light">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="cursor-pointer px-4 py-2 text-[15px] font-medium text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0] transition"
              >
                Prev
              </button>

              <span className="px-4 py-2 bg-[#06A6F0] text-white text-[15px] font-medium rounded-[5px]">{page}</span>

              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className="cursor-pointer px-4 py-2 text-[15px] font-medium text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0] transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
