"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AssignTaskPage() {
  const [taskTitle, setTaskTitle] = useState("");
  const [assignee, setAssignee] = useState<string>("");
  const [priority, setPriority] = useState("Low");
  const [project, setProject] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [assignHours, setAssignHours] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<
    { id: string; name: string; designation: string | null; role?: string | null }[]
  >([]);
  const [teamLeader, setTeamLeader] = useState<{ id: number; name: string } | null>(null);

  const today = new Date().toISOString().split("T")[0];

  // Fetch logged-in user info
  useEffect(() => {
    const fetchTeamLeader = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw authError || new Error("No user logged in");

        const { data, error } = await supabase
          .from("users")
          .select("id, name, role")
          .eq("auth_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("No user record found");

        setTeamLeader({ id: data.id, name: data.name });
      } catch (err) {
        console.error("Error fetching user:", err);
        setMessage("Failed to fetch logged-in user.");
        setMessageType("error");
      }
    };
    fetchTeamLeader();
  }, []);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id, project_name")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setProjects(data?.map((p) => ({ id: p.id.toString(), name: p.project_name })) || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, name, designation, role")
          .neq("designation", "Bidder")
          .neq("designation", "HR")
          .order("name", { ascending: true });

        if (error) throw error;

        setEmployees(data?.map((emp) => ({ ...emp, id: emp.id.toString() })) || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    if (!teamLeader) {
      setMessage("Cannot identify logged-in user.");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("tasks").insert([
      {
        title: taskTitle,
        assigned_to: assignee ? Number(assignee) : null,
        project_id: project ? Number(project) : null,
        priority,
        start_date: startDate,
        due_date: dueDate,
        description,
        assign_hours: assignHours,
        status: "Pending",
        created_by: teamLeader.id,
      },
    ]);

    if (error) {
      console.error("Task submission error:", error);
      setMessage("Failed to create task.");
      setMessageType("error");
    } else {
      setMessage("Task created successfully!");
      setMessageType("success");

      // Reset form
      setTaskTitle("");
      setAssignee("");
      setProject("");
      setPriority("Low");
      setStartDate("");
      setDueDate("");
      setDescription("");
      setAssignHours("");
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <h1 className="mb-6 font-medium text-[26px] sm:text-[32px] leading-snug text-[color:var(--heading-color)]">
        Assign Task
      </h1>

      <div className="bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] mt-5 p-[25px_25px] sm:p-[35px_35px] ">
        {message && (
          <div
            className={`mb-6 p-3 text-center rounded text-sm font-medium ${
              messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title + Hours */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 text-gray-600">Task Title</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                placeholder="Enter task title"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-gray-600">Assign Task Hours</label>
              <input
                type="number"
                value={assignHours}
                onChange={(e) => setAssignHours(e.target.value)}
                min={1}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                placeholder="Enter hours"
              />
            </div>
          </div>

          {/* Project */}
          <div>
            <label className="block mb-1 text-gray-600">Project</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">Select Project</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee + Priority */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 text-gray-600">Assign To</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
                disabled={employees.length === 0}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => {
                  let designationLabel = "";
                  if (emp.role?.toLowerCase() === "team_leader") {
                    designationLabel = emp.designation
                      ? `${emp.designation} Team Leader`
                      : "Team Leader";
                  } else if (emp.designation) designationLabel = emp.designation;
                  return (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                      {designationLabel ? ` (${designationLabel})` : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-gray-600">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 text-gray-600">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                min={today}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-gray-600">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                min={today}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 text-gray-600">Task Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none"
              placeholder="Enter detailed description of the task"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer text-white bg-[#09A6F0] hover:bg-[#0784c6] rounded-[5px] px-6 py-2 font-medium w-full sm:w-auto disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </form>
      </div>
    </>
  );
}
