"use client";

import { useEffect, useState } from "react";
import { Edit, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Status = "Pending" | "In Review" | "Completed" | "Overdue" | "In Progress";

interface Task {
  id: number;
  project_name: string | null;
  project_description?: string | null;
  client_name?: string | null;
  title: string;
  assigned_user: string | null;
  assigned_from_user: string | null;
  due_date?: string | null;
  status: Status;
  priority?: string | null;
  assign_hours?: number | null;
  description?: string | null;
}

const STATUS_OPTIONS: Record<Status, { color: string; bgColor: string }> = {
  Completed: { color: "#16A34A", bgColor: "#D1FAE5" },
  Overdue: { color: "#E70D0D", bgColor: "#FFE5EE" },
  "In Progress": { color: "#D5B500", bgColor: "#FFF4C1" },
  "In Review": { color: "#3498DB", bgColor: "#E6F0FF" },
  Pending: { color: "#D5B500", bgColor: "#FFF4C1" },
};

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<Status>("Pending");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");

  const totalPages = Math.ceil(total / pageSize);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No logged-in user");

      const { data: employee } = await supabase
        .from("users")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (!employee) throw new Error("Employee not found");
      const employeeId = Number(employee.id);

      let countQuery = supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("assigned_to", employeeId);

      if (statusFilter !== "All") countQuery = countQuery.eq("status", statusFilter);
      const { count } = await countQuery;
      setTotal(count || 0);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("tasks")
        .select(`
          id,
          title,
          project_id,
          assigned_to,
          created_by,
          status,
          priority,
          assign_hours,
          due_date,
          description
        `)
        .eq("assigned_to", employeeId)
        .order("id", { ascending: false })
        .range(from, to);

      if (statusFilter !== "All") query = query.eq("status", statusFilter);
      const { data: tasksData } = await query;

      if (!tasksData || tasksData.length === 0) {
        setTasks([]);
        setLoading(false);
        return;
      }

      const projectIds = Array.from(new Set(tasksData.map(t => t.project_id).filter(Boolean)));
      const { data: projects } = await supabase
        .from("projects")
        .select("id, project_name, client_name, description")
        .in("id", projectIds ?? []);

      const assignedIds = Array.from(new Set(tasksData.map(t => Number(t.assigned_to)).filter(id => !isNaN(id))));
      let assignedUsers: { id: number; name: string; designation?: string }[] = [];
      if (assignedIds.length > 0) {
        const { data } = await supabase
          .from("users")
          .select("id, name, designation")
          .in("id", assignedIds);
        assignedUsers = data ?? [];
      }

      const createdByIds = Array.from(new Set(tasksData.map(t => Number(t.created_by)).filter(id => !isNaN(id))));
      let createdByUsers: { id: number; name: string; designation?: string }[] = [];
      if (createdByIds.length > 0) {
        const { data } = await supabase
          .from("users")
          .select("id, name, designation")
          .in("id", createdByIds);
        createdByUsers = data ?? [];
      }

      const formatted: Task[] = tasksData.map(task => {
        const project = projects?.find(p => p.id === task.project_id);
        const assignedUser = assignedUsers?.find(u => u.id === Number(task.assigned_to));
        const createdByUser = createdByUsers?.find(u => u.id === Number(task.created_by));

        return {
          id: task.id,
          title: task.title,
          assigned_user: assignedUser ? `${assignedUser.name} (${assignedUser.designation ?? "—"})` : "—",
          assigned_from_user: createdByUser ? `${createdByUser.name} (${createdByUser.designation ?? "—"})` : "—",
          project_name: project?.project_name ?? "N/A",
          project_description: project?.description ?? undefined,
          client_name: project?.client_name ?? undefined,
          due_date: task.due_date ?? "N/A",
          status: task.status as Status,
          priority: task.priority ?? "N/A",
          assign_hours: task.assign_hours ?? 0,
          description: task.description ?? "",
        };
      });

      setTasks(formatted);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);

    await supabase
      .from("tasks")
      .update({ status: statusUpdate })
      .eq("id", selectedTask.id);

    setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: statusUpdate } : t));
    setIsModalOpen(false);
    setSelectedTask(null);
    setIsSubmitting(false);
  };

  useEffect(() => { fetchTasks(); }, [page, pageSize, statusFilter]);

  const openModal = (task: Task) => {
    setSelectedTask(task);
    setStatusUpdate(task.status);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-4">
        <label className="text-[#567D8E] text-[16px] font-normal">Filter by Status:</label>
        <div className="relative w-full sm:w-[200px]">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as Status | "All"); setPage(1); }}
            className="appearance-none w-full border border-[#00000033] text-[#2C2C2C] text-base font-light rounded-[5px] px-4 py-2 pr-10 bg-white outline-none"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] mt-5 p-[25px_25px] sm:p-[35px_35px]">
        {loading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500">No tasks assigned.</p>
        ) : (
          <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
            <thead>
              <tr className="text-gray-600 border-b border-gray-300">
                <th className="px-4 py-4 text-black font-medium">Task Title</th>
                <th className="px-4 py-4 text-black font-medium">Project</th>
                <th className="px-4 py-4 text-black font-medium">Assigned From</th>
                <th className="px-4 py-4 text-black font-medium">Due Date</th>
                <th className="px-4 py-4 text-black font-medium">Status</th>
                <th className="px-4 py-4 text-black font-medium">Priority</th>
                <th className="px-4 py-4 text-black font-medium">Assign Hours</th>
                <th className="px-4 py-4 text-black font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition">
                  <td className="px-4 py-4 text-[#2C2C2C]">{task.title}</td>
                  <td className="px-4 py-4 text-[#567D8E]">{task.project_name}</td>
                  <td className="px-4 py-4 text-[#2C2C2C]">{task.assigned_from_user || "—"}</td>
                  <td className="px-4 py-4 text-[#567D8E]">{task.due_date || "N/A"}</td>
                  <td className="px-4 py-4">
                    <span
                      style={{
                        color: STATUS_OPTIONS[task.status]?.color ?? "rgb(231, 13, 13)",
                        backgroundColor: STATUS_OPTIONS[task.status]?.bgColor ?? "rgb(255, 229, 238)",
                      }}
                      className="inline-block px-3 py-1 rounded-sm text-xs font-normal whitespace-nowrap w-max min-w-fit"
                    >
                      {task.status || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#2C2C2C]">{task.priority || "N/A"}</td>
                  <td className="px-4 py-4 text-[#2C2C2C]">{task.assign_hours ?? "N/A"}</td>
                  <td className="px-4 py-4">
                    <button
                      className="cursor-pointer text-gray-600 hover:text-gray-900"
                      onClick={() => openModal(task)}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-8 text-sm text-gray-600 gap-4 sm:gap-0">
        <div className="flex items-center text-[#567D8E] text-[14px] font-normal justify-center sm:justify-start gap-2 flex-wrap">
          <span>Showing</span>
          <div className="relative inline-block">
            <select
              className="appearance-none border border-[#E8E8E9] text-[#2C2C2C] text-[15px] font-normal rounded-[5px] px-2 py-1 pr-6 min-w-[60px] bg-white"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
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
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            className="px-4 py-2 text-[16px] font-light text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0]"
          >
            Prev
          </button>
          <span className="px-4 py-2 bg-[#06A6F0] text-white text-[16px] font-light rounded-[5px]">{page}</span>
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            className="px-4 py-2 text-[16px] font-light text-[#2C2C2C] border border-[#E8E8E9] rounded-[5px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#06A6F0] hover:text-white hover:border-[#06A6F0]"
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && selectedTask && (
        <div
          className="fixed inset-0 flex justify-center items-center z-50 px-4 sm:px-0"
          style={{ backgroundColor: "#00000066" }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-[5px] w-full max-w-[650px] relative sm:mx-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="cursor-pointer absolute top-5 right-4 text-white bg-[#06A6F0] hover:bg-[#0784c6] rounded-full p-1 transition"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="py-3 px-5 sm:px-8 border border-[#0000001A] mb-6">
              <h2 className="text-[#2C2C2C] font-medium text-[20px] sm:text-[30px]">Task Details</h2>
            </div>

            <div className="space-y-4 pb-8 px-5 sm:px-8">
              <div>
                <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Task Description</label>
                <textarea
                  className="w-full border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] focus:outline-none"
                  value={selectedTask.description ?? ""}
                  readOnly
                  rows={4}
                />
              </div>

              <div>
                <label className="block mb-2 text-[#567D8E] text-[16px] font-normal">Update Status</label>
                <select
                  className="w-full appearance-none border border-[#567D8E33] rounded-[4px] px-3 py-2 text-[15px] font-light text-[#2C2C2C] pr-10 bg-white focus:outline-none"
                  value={statusUpdate}
                  onChange={e => setStatusUpdate(e.target.value as Status)}
                >
                  <option>Pending</option>
                  <option>In Review</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStatusUpdate}
                  disabled={isSubmitting}
                  className="cursor-pointer text-white bg-[#09A6F0] hover:bg-[#0784c6] rounded-[5px] px-6 py-2 font-medium w-full sm:w-auto"
                >
                  {isSubmitting ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
