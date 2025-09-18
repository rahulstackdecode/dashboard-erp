import React, { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { ChevronDown } from "lucide-react";

// --- Define types ---
type TaskStatus = {
  label: string;
  color: string;
  bgColor: string;
};

type Task = {
  id: string | number;
  taskName: string;
  projectName: string;
  deadline: string;
  status: TaskStatus;
};

// --- Status options (you can adjust colors here if needed) ---
const STATUS_OPTIONS: TaskStatus[] = [
  { label: "In Progress", color: "#D5B500", bgColor: "#FFF8E7" },
  { label: "Overdue", color: "#E70D0D", bgColor: "#FFE5EE" },
  { label: "Completed", color: "#03C95A", bgColor: "#03C95A1A" },
  { label: "In Review", color: "#0764E6", bgColor: "#E6EFFC" },
];

const initialTasks: Task[] = [
  { id: 1, taskName: "Design Landing Page", projectName: "Website Redesign", deadline: "2025-09-20", status: { label: "In Progress", color: "#D5B500", bgColor: "#FFF8E7" } },
  { id: 2, taskName: "Develop API", projectName: "Backend Refactor", deadline: "2025-09-22", status: { label: "Overdue", color: "#E70D0D", bgColor: "#FFE5EE" } },
  { id: 3, taskName: "QA Testing", projectName: "Mobile App", deadline: "2025-09-25", status: { label: "Completed", color: "#03C95A", bgColor: "#03C95A1A" } },
  { id: 4, taskName: "Create Wireframes", projectName: "New Marketing Site", deadline: "2025-10-01", status: { label: "In Review", color: "#0764E6", bgColor: "#E6EFFC" } },
  { id: 5, taskName: "Database Migration", projectName: "Backend Refactor", deadline: "2025-10-05", status: { label: "Overdue", color: "#E70D0D", bgColor: "#FFE5EE" } },
  { id: 6, taskName: "SEO Optimization", projectName: "Website Redesign", deadline: "2025-10-10", status: { label: "Completed", color: "#03C95A", bgColor: "#03C95A1A" } },
  { id: 7, taskName: "User Testing", projectName: "Mobile App", deadline: "2025-10-12", status: { label: "In Progress", color: "#D5B500", bgColor: "#FFF8E7" } },
  { id: 8, taskName: "Set Up Analytics", projectName: "Marketing Campaign", deadline: "2025-10-15", status: { label: "Overdue", color: "#E70D0D", bgColor: "#FFE5EE" } },
  { id: 9, taskName: "Bug Fixes", projectName: "Mobile App", deadline: "2025-10-18", status: { label: "In Progress", color: "#D5B500", bgColor: "#FFF8E7" } },
  { id: 10, taskName: "Content Writing", projectName: "Marketing Campaign", deadline: "2025-10-20", status: { label: "Completed", color: "#03C95A", bgColor: "#03C95A1A" } },
];

// --- TaskOverview Table Component ---
type TaskOverviewProps = {
  paginatedTasks: Task[];
  handleDelete: (id: string | number) => void;
  handleStatusChange: (id: string | number, statusLabel: string) => void;
};

const TaskOverview: React.FC<TaskOverviewProps> = ({
  paginatedTasks,
  handleDelete,
  handleStatusChange,
}) => {
  const [openStatusDropdown, setOpenStatusDropdown] = useState<number | string | null>(null);

  return (
    <div className="mt-12 bg-white rounded-[15px] shadow-[6px_6px_54px_0px_rgba(0,0,0,0.05)] p-[25px_25px] relative">
<h2 className="mb-4 font-medium text-[24px] sm:text-[28px] text-[#2C2C2C]">
        Today’s Task Overview
      </h2>

      <div className="overflow-x-auto border-t border-[#D5D9DD] relative">
        <table className="min-w-full text-sm text-left border-collapse md:table-fixed">
          <thead>
            <tr className="text-gray-600 border-b border-gray-300">
              {["Task Name", "Project Name", "Deadline", "Status", "Action"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-4 py-4 text-black font-medium text-[15px]"
                    scope="col"
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedTasks.length > 0 ? (
              paginatedTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-4 text-[#567D8E]">{task.taskName}</td>
                  <td className="px-4 py-4 text-[#567D8E]">{task.projectName}</td>
                  <td className="px-4 py-4 text-[#567D8E]">{task.deadline}</td>
                  <td className="px-4 py-4 relative">
                    {/* Status Dropdown */}
                    <div
                      onClick={() =>
                        setOpenStatusDropdown(
                          openStatusDropdown === task.id ? null : task.id
                        )
                      }
                      className="inline-flex items-center justify-between w-max px-3 py-1 rounded-sm text-xs font-normal whitespace-nowrap cursor-pointer select-none"
                      style={{
                        color: task.status.color,
                        backgroundColor: task.status.bgColor,
                        minWidth: "min-content",
                      }}
                    >
                      <span>{task.status.label}</span>
                      <ChevronDown size={14} className="ml-1" />
                    </div>

                    {openStatusDropdown === task.id && (
                      <ul
                        className="absolute top-0 z-50 left-0  bg-white border border-gray-300 rounded-md shadow-md min-w-fit"
                        style={{ minWidth: "min-content" }}
                      >
                        {STATUS_OPTIONS.map((statusOption) => (
                          <li
                            key={statusOption.label}
                            onClick={() => {
                              handleStatusChange(task.id, statusOption.label);
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
                  <td className="px-4 py-4 flex gap-2">
                    <button
                      className="text-gray-600 cursor-pointer hover:text-gray-900"
                      title="Edit Task"
                      onClick={() => alert(`Edit task: ${task.taskName}`)}
                      aria-label={`Edit ${task.taskName}`}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      className="text-red-600 cursor-pointer hover:text-red-800"
                      title="Delete Task"
                      onClick={() => handleDelete(task.id)}
                      aria-label={`Delete ${task.taskName}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-500 font-light"
                >
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Wrapper Component with State ---
const TaskOverviewWrapper: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleDelete = (id: string | number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (confirmDelete) {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    }
  };

  // Update the status of a task by id
  const handleStatusChange = (id: string | number, statusLabel: string) => {
    // Find the status object by label
    const newStatus = STATUS_OPTIONS.find(
      (status) => status.label === statusLabel
    );
    if (!newStatus) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  return (
    <>
      <TaskOverview
        paginatedTasks={tasks}
        handleDelete={handleDelete}
        handleStatusChange={handleStatusChange}
      />
    </>
  );
};

export default TaskOverviewWrapper;
