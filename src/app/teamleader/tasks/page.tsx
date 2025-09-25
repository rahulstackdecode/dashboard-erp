"use client";

import { useEffect, useState } from "react";
import { Calendar, Edit, Search, X } from "lucide-react";
import DatePicker from "react-datepicker";
import { startOfYear, endOfYear, startOfMonth, endOfMonth } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { supabase } from "@/lib/supabaseClient";

interface User {
  id: string;
  name: string;
  role?: string;
}

interface Project {
  id: string;
  project_name: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  start_date: string;
  due_date: string;
  assign_hours: string | number;
  status: string;
  assigned_to: string | null; // user ID
  project_id: string | null;
  created_by: string | null; // user ID
}

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  start_date: string;
  due_date: string;
  assign_hours: string | number;
  status: string;
  assigned_to: User | null;
  project: Project | null;
  created_by: User | null;
}

export default function TaskTable() {
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(new Date());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const minDate = startOfYear(new Date());
  const maxDate = endOfYear(new Date());

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id ?? null;
      setCurrentUserId(userId);

      if (userId) {
        const { data: userData } = await supabase
          .from("users")
          .select("role, id")
          .eq("auth_id", userId)
          .single();

        setCurrentUserRole((userData as User)?.role ?? null);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });

        if (tasksError) throw tasksError;

        const { data: usersData } = await supabase
          .from("users")
          .select("id, name");

        const { data: projectsData } = await supabase
          .from("projects")
          .select("id, project_name");

        const mappedTasks: TaskRow[] = (tasksData as Task[] || []).map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          start_date: task.start_date,
          due_date: task.due_date,
          assign_hours: task.assign_hours,
          status: task.status,
          assigned_to: (usersData as User[]).find((u) => u.id === task.assigned_to) ?? null,
          project: (projectsData as Project[]).find((p) => p.id === task.project_id) ?? null,
          created_by: (usersData as User[]).find((u) => u.id === task.created_by) ?? null,
        }));

        let filteredTasks = mappedTasks;

        if (selectedMonth) {
          const start = startOfMonth(selectedMonth).toISOString();
          const end = endOfMonth(selectedMonth).toISOString();
          filteredTasks = filteredTasks.filter(
            (t) => t.start_date >= start && t.start_date <= end
          );
        }

        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          filteredTasks = filteredTasks.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.project?.project_name.toLowerCase().includes(q) ||
              t.assigned_to?.name.toLowerCase().includes(q)
          );
        }

        setTasks(filteredTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [selectedMonth, searchQuery]);

  const totalPages = Math.ceil(tasks.length / pageSize);
  const paginatedTasks = tasks.slice((page - 1) * pageSize, page * pageSize);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return { bg: "#FFF8E7", color: "#D5B500" };
      case "Approved":
        return { bg: "#03C95A1A", color: "#03C95A" };
      case "Rejected":
        return { bg: "#FFE5EE", color: "#E70D0D" };
      default:
        return { bg: "#E6EFFC", color: "#0764E6" };
    }
  };

  const openTaskModal = (task: TaskRow) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const canEditTask =
    !!selectedTask &&
    (currentUserRole === "team_leader" ||
      selectedTask.created_by?.id === currentUserId);

  const handleSaveChanges = async () => {
    if (!selectedTask) return;
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          description: selectedTask.description,
          priority: selectedTask.priority,
          assign_hours: selectedTask.assign_hours,
          status: selectedTask.status,
        })
        .eq("id", selectedTask.id);

      if (error) throw error;

      // ✅ Update local state so UI refreshes instantly
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === selectedTask.id ? { ...task, ...selectedTask } : task
        )
      );

      setIsModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Failed to save changes:", err);
    }
  };


  return (
    <div>

      <h1 className="mb-6 font-medium text-[26px] sm:text-[32px] leading-snug text-[color:var(--heading-color)]">
        All Tasks
      </h1>
      {/* Search & Month */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center w-full sm:w-1/2 md:w-1/4 border border-[#00000033] rounded-[5px] px-3 py-2 bg-white mb-4">
          <Search className="text-gray-400 mr-2 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, project, assigned..."
            className="w-full outline-none text-base font-light text-[#2C2C2C] bg-transparent"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative w-full sm:w-[220px]">
          <DatePicker
            selected={selectedMonth}
            onChange={(date: Date | null) => setSelectedMonth(date)}
            dateFormat="MMM yyyy"
            showMonthYearPicker
            minDate={minDate}
            maxDate={maxDate}
            className="w-full outline-none border border-gray-300 text-gray-700 text-sm rounded-lg pl-10 pr-12 py-2.5 bg-white"
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="task-table-wrapper">
        <div className="bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] p-[35px_25px]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
              <thead>
                <tr className="text-gray-600 border-b border-gray-300">
                  <th className="px-4 py-4 text-black font-medium text-[15px]">Title</th>
                  <th className="px-4 py-4 text-black font-medium text-[15px]">Project Name</th>
                  <th className="px-4 py-4 text-black font-medium text-[15px]">Assigned To</th>
                  <th className="px-4 py-4 text-black font-medium text-[15px]">Start Date</th>
                  <th className="px-4 py-4 text-black font-medium text-[15px]">Due Date</th>
                  <th className="px-4 py-4 text-black font-medium text-[15px]">Status</th>
                  <th className="px-4 py-4 text-black font-medium text-[15px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center px-4 py-6 text-blue-600 text-[14px]">Loading...</td></tr>
                ) : paginatedTasks.length > 0 ? (
                  paginatedTasks.map(task => {
                    const statusStyle = getStatusStyle(task.status);
                    return (
                      <tr key={task.id} className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition">
                        <td className="px-4 py-4">{task.title}</td>
                        <td className="px-4 py-4">{task.project?.project_name || "-"}</td>
                        <td className="px-4 py-4">{task.assigned_to?.name || "-"}</td>
                        <td className="px-4 py-4">{task.start_date}</td>
                        <td className="px-4 py-4">{task.due_date}</td>
                        <td className="px-4 py-4">
                          <span className="inline-block px-3 py-1 rounded-sm text-xs font-normal whitespace-nowrap w-max min-w-fit" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {(currentUserRole === "team_leader" || task.created_by?.id === currentUserId) && (
                            <button
                              onClick={() => openTaskModal(task)}
                              className="cursor-pointer text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={7} className="text-center px-4 py-6 text-gray-500 text-[14px]">No tasks found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 text-sm text-gray-600 gap-4 sm:gap-0">
          <div className="flex items-center text-gray-500 text-[14px] gap-2">
            <span>Showing</span>
            <select
              className="border border-gray-300 text-gray-700 text-[15px] font-medium rounded-md px-2 py-1"
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
            <span>Results</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 text-[15px] border rounded-[5px] disabled:opacity-50"
            >Prev</button>
            <span className="px-4 py-2 bg-[#06A6F0] text-white text-[15px] rounded-[5px]">{page}</span>
            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              className="px-4 py-2 text-[15px] border rounded-[5px] disabled:opacity-50"
            >Next</button>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && selectedTask && (
          <div
            className="fixed inset-0 flex justify-center items-center z-50 px-4 sm:px-0 bg-black/40"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-white rounded-[5px] w-full max-w-[700px] relative sm:mx-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-5 right-4 text-white bg-[#06A6F0] hover:bg-[#0784c6] rounded-full p-1 transition"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>

              <div className="py-3 px-5 sm:px-8 border-b border-[#0000001A] mb-6">
                <h2 className="text-[#2C2C2C] font-medium text-[20px] sm:text-[30px]">Task Details</h2>
              </div>

              <div className="pb-8 px-5 sm:px-8 space-y-4">

                {/* Project & Assigned To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Project Name</label>
                    <input className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none" value={selectedTask.project?.project_name ?? "-"} readOnly />
                  </div>
                  <div>
                    <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Assigned To</label>
                    <input className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none" value={selectedTask.assigned_to?.name ?? "-"} readOnly />
                  </div>
                </div>

                {/* Priority & Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Priority</label>
                    <input className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                      value={selectedTask.priority} readOnly={!canEditTask}
                      onChange={canEditTask ? (e) => setSelectedTask({ ...selectedTask, priority: e.target.value }) : undefined} />
                  </div>
                  <div>
                    <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Hours</label>
                    <input className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                      value={selectedTask.assign_hours} readOnly={!canEditTask}
                      onChange={canEditTask ? (e) => setSelectedTask({ ...selectedTask, assign_hours: e.target.value }) : undefined} />
                  </div>
                </div>

                {/* Created By & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Created By</label>
                    <input className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none" value={selectedTask.created_by?.name ?? "-"} readOnly />
                  </div>
                  <div>
                    <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Status</label>
                    <select className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                      value={selectedTask.status} disabled={!canEditTask}
                      onChange={canEditTask ? (e) => setSelectedTask({ ...selectedTask, status: e.target.value }) : undefined}>
                      <option value="Pending">Pending</option>
                      <option value="inreview">In Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Task Description</label>
                  <textarea className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                    value={selectedTask.description ?? ""} readOnly={!canEditTask}
                    onChange={canEditTask ? (e) => setSelectedTask({ ...selectedTask, description: e.target.value }) : undefined} rows={4} />
                </div>

                {canEditTask && (
                  <div className="mt-4 text-right">
                    <button onClick={handleSaveChanges} className="cursor-pointer px-5 py-2 bg-[#06A6F0] text-white border border-[#06A6F0] rounded hover:bg-[#05A1DB] hover:border-[#05A1DB] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">Save Changes</button>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
