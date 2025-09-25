"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Logo from "@/app/components/Logo";
import {
  Home,
  Users,
  Folder,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  UserCheck,
  DollarSign,
  BarChart,
  UserCog,
  Briefcase,
  Building2,
  Menu,
  X,
} from "lucide-react";

type SubMenuItem = {
  label: string;
  href: string;
  icon?: ReactNode;
};

type MenuItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  children?: SubMenuItem[];
};

export default function ResponsiveSidebar() {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }

        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("auth_id", session.user.id)
          .single();

        if (error) {
          console.error("Failed to fetch user role:", error.message);
          return;
        }

        if (userData) {
          setUserRole(userData.role);
        } else {
          console.error("No user data found");
        }

      } catch (err) {
        console.error("Failed to fetch user role:", err);
      }
    };

    fetchUserRole();
  }, [router]);

  // Logout
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Logout error:", error.message);
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  // Toggle submenu
  const toggleSubmenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  // Role-based menu items
  const roleMenuItems: Record<string, MenuItem[]> = {
    ceo: [
      { label: "Dashboard", icon: <Home size={18} />, href: "/" },
      {
        label: "Employee Records",
        icon: <Folder size={18} />,
        children: [
          { label: "Employees List", href: "/ceo/employees", icon: <Calendar size={18} /> },
          { label: "Attendance", href: "/ceo/attendance", icon: <Calendar size={18} /> },
        ],
      },
      {
        label: "Projects",
        icon: <Folder size={18} />,
        children: [
          { label: "All Projects", href: "/ceo/projects", icon: <FileText size={16} /> },
          { label: "Add Project", href: "/ceo/addproject", icon: <FileText size={16} /> },
        ],
      },
      { label: "Reports", href: "/ceo/reports", icon: <FileText size={18} /> },
      {
        label: "Account Settings",
        icon: <Settings size={18} />,
        children: [
          { label: "Profile", href: "#", icon: <User size={16} /> },
        ],
      },
      { label: "Helpdesk / Support", href: "#", icon: <HelpCircle size={18} /> },
    ],
    employees: [
      { label: "Dashboard", icon: <Users size={18} />, href: "/employees" },
      {
        label: "My Records",
        icon: <Folder size={18} />,
        children: [
          { label: "Attendance", href: "/employees/attendance", icon: <Calendar size={18} /> },
          { label: "Leaves", href: "/employees/leaves", icon: <FileText size={16} /> },
        ],
      },
      { label: "Assigned Tasks", href: "/employees/tasks", icon: <Folder size={18} /> },
      { label: "Profile", href: "/employees/profile", icon: <User size={18} /> },
    ],
    hr: [
      { label: "Dashboard", icon: <Users size={18} />, href: "/hr" },
      {
        label: "Employee Records",
        icon: <Folder size={18} />,
        children: [
          { label: "Employees List", href: "/hr/employees", icon: <Calendar size={18} /> },
          { label: "Attendance", href: "/hr/attendance", icon: <Calendar size={18} /> },
          { label: "Leaves", href: "/hr/leaves", icon: <Calendar size={18} /> },
        ],
      },
      { label: "Add Employee", href: "/hr/add-employee", icon: <Calendar size={18} /> },
      { label: "Support", href: "/hr/support", icon: <HelpCircle size={18} /> },
    ],
    team_leader: [
      { label: "Dashboard", icon: <Users size={18} />, href: "/teamleader" },
      {
        label: "Employee Records",
        icon: <Folder size={18} />,
        children: [
          { label: "Employees List", href: "/teamleader/employees", icon: <Calendar size={18} /> },
          { label: "Attendance", href: "/teamleader/attendance", icon: <Calendar size={18} /> },
        ],
      },
      {
        label: "Manage Tasks",
        icon: <Folder size={18} />,
        children: [
          { label: "All Tasks", href: "/teamleader/tasks", icon: <Calendar size={18} /> },
          { label: "Assign Task", href: "/teamleader/assign-task", icon: <Folder size={18} /> },
        ],
      },
    ],
  };

  const menuItems = userRole ? roleMenuItems[userRole] || [] : [];

  if (!userRole) return null;

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href;
  };

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-5.5 left-4 z-40 p-0 cursor-pointer rounded text-[color:var(--heading-color)]"
      >
        <Menu size={26} />
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between py-6 px-4 border-b border-[#0000001A]">
                <Logo className="h-6 max-w-32" />
                <button onClick={() => setSidebarOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              {/* Menu list */}
              <nav className="flex-1 py-6 px-4 overflow-y-auto">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.label}>
                      {item.children ? (
                        <>
                          <button
                            onClick={() => toggleSubmenu(item.label)}
                            className={`w-full flex items-center justify-between rounded-[5px] font-medium text-[14px] px-3 py-2 transition-colors
                              ${item.children.some(sub => isActive(sub.href))
                                ? "bg-[var(--primary-color)] text-white"
                                : "text-[color:var(--heading-color)] hover:bg-[var(--primary-color)] hover:text-white"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {item.icon}
                              <span>{item.label}</span>
                            </div>
                            {openMenus.includes(item.label) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>

                          {openMenus.includes(item.label) && (
                            <motion.ul
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-1 space-y-1 p-3 bg-[#F7F7F7] rounded-[5px]"
                            >
                              {item.children.map((sub) => (
                                <li key={sub.label}>
                                  <a
                                    href={sub.href}
                                    onClick={() => { setActiveMenu(sub.label); setSidebarOpen(false); }}
                                    className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm
                                      ${isActive(sub.href)
                                        ? "bg-[var(--primary-color)] text-white"
                                        : "text-[color:var(--heading-color)] hover:bg-[var(--primary-color)] hover:text-white"
                                      }`}
                                  >
                                    {sub.icon}
                                    {sub.label}
                                  </a>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </>
                      ) : (
                        <a
                          href={item.href}
                          onClick={() => { setActiveMenu(item.label); setSidebarOpen(false); }}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-[14px]
                            ${isActive(item.href)
                              ? "bg-[var(--primary-color)] text-white"
                              : "text-gray-700 hover:bg-[var(--primary-color)] hover:text-white"
                            }`}
                        >
                          {item.icon}
                          {item.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Logout */}
              <div className="p-4">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`w-full flex items-center justify-center gap-2 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 ${loggingOut ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  <LogOut size={18} />
                  <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
