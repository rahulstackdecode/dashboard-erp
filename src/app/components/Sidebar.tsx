"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Logo from "@/app/components/Logo";
import LogoIcon from "@/app/components/Logo-Icon";
import {
  Home,
  Users,
  Folder,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  UsersRound,
  ChevronDown,
  ChevronRight,
  User,
  Building2,
  Calendar,
  UserCheck,
  DollarSign,
  BarChart,
  UserCog,
  Briefcase,
  Loader2,
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

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // Get current route

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

        setUserRole(userData.role);
      } catch (err) {
        console.error("Failed to fetch user role:", err);
      }
    };

    fetchUserRole();
  }, [router]);

  // Toggle submenu
  const toggleSubmenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

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

  // Define menu items per role
  const roleMenuItems: Record<string, MenuItem[]> = {
    ceo: [
      { label: "Dashboard", icon: <Home size={18} />, href: "/" },
      {
        label: "Projects",
        icon: <Folder size={18} />,
        children: [
          { label: "All Projects", href: "/ceo/project", icon: <FileText size={16} /> },
          { label: "Add Project", href: "/ceo/project/addproject", icon: <FileText size={16} /> },
        ],
      },
      { label: "Reports", icon: <FileText size={18} />, href: "/ceo/reports" },
      { label: "Account Settings", icon: <Settings size={18} />, href: "/ceo/account" },
      { label: "Helpdesk / Support", icon: <HelpCircle size={18} />, href: "/help" },
    ],
    employees: [
      { label: "Dashboard", icon: <Users size={18} />, href: "/employees" },
      { label: "Attendance", icon: <Calendar size={18} />, href: "/employees/attendance" },
      { label: "Profile", icon: <User size={18} />, href: "/employees/profile" },
    ],
    hr: [
      { label: "Dashboard", icon: <Home size={18} />, href: "/" },
      { label: "HR", icon: <Users size={18} />, href: "/hr" },
      { label: "Attendance", icon: <Calendar size={18} />, href: "/hr/attendance" },
      { label: "Leaves", icon: <Calendar size={18} />, href: "/hr/leaves" },
      { label: "Support", icon: <HelpCircle size={18} />, href: "/hr/support" },
      { label: "Account Settings", icon: <Settings size={18} />, href: "/hr/account" },
    ],
    team_leader: [
      { label: "Dashboard", icon: <Home size={18} />, href: "/" },
      { label: "Teamleader", icon: <Users size={18} />, href: "/teamleader" },
      { label: "Account Settings", icon: <Settings size={18} />, href: "/teamleader/account" },
      { label: "Helpdesk / Support", icon: <HelpCircle size={18} />, href: "/help" },
    ],
  };

  const menuItems = userRole ? roleMenuItems[userRole] || [] : [];

  if (!userRole) return null; // Wait for role to load

  // Function to check if item is active
  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href;
  };

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: isOpen ? 256 : 56 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="sticky top-0 hidden lg:visible bg-white h-screen lg:flex flex-col shadow-[0px_10px_60px_0px_#E2ECF980]"
    >
      {/* Logo */}
      <div className="px-2 py-6 flex items-center justify-center">
        {isOpen ? <Logo className="logo-dashboard" /> : <LogoIcon className="logo-icon" />}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-2 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label} className="mb-3">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={`w-full flex items-center justify-between rounded-[5px] font-medium text-[14px] px-[10px] py-[10px] transition-colors duration-200
                      ${item.children.some((sub) => isActive(sub.href))
                        ? "bg-[color:var(--primary-color)] text-[color:var(--white-text)]"
                        : "text-[color:var(--heading-color)] hover:bg-[color:var(--primary-color)] hover:text-[color:var(--white-text)]"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {isOpen && <span className="whitespace-nowrap">{item.label}</span>}
                    </div>
                    {isOpen &&
                      (openMenus.includes(item.label) ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                  </button>

                  {openMenus.includes(item.label) && isOpen && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-1 space-y-1 p-3 bg-[#F7F7F7] rounded-[5px]"
                    >
                      {item.children.map((sub) => (
                        <li key={sub.label} className="whitespace-nowrap">
                          <a
                            href={sub.href}
                            className={`flex items-center gap-3 whitespace-nowrap rounded-[5px] font-medium text-[14px] px-[10px] py-[10px] transition-colors duration-200
                              ${isActive(sub.href)
                                ? "bg-[color:var(--primary-color)] text-[color:var(--white-text)]"
                                : "text-[color:var(--heading-color)] hover:bg-[color:var(--primary-color)] hover:text-[color:var(--white-text)]"
                              }`}
                          >
                            {sub.icon && sub.icon}
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
                  className={`flex items-center gap-3 rounded-[5px] font-medium text-[14px] px-[10px] py-[10px] transition-colors duration-200
                    ${isActive(item.href)
                      ? "bg-[color:var(--primary-color)] text-[color:var(--white-text)]"
                      : "text-[color:var(--heading-color)] hover:bg-[color:var(--primary-color)] hover:text-[color:var(--white-text)]"
                    }`}
                >
                  {item.icon}
                  {isOpen && <span className="whitespace-nowrap">{item.label}</span>}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="py-4 px-2">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={`w-full flex items-center justify-center font-medium gap-3 px-2 cursor-pointer py-2.5 text-white bg-red-500 rounded-md hover:bg-red-600 text-center ${
            loggingOut ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loggingOut ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
          {isOpen && <span>{loggingOut ? "Logging out..." : "Logout"}</span>}
        </button>
      </div>
    </motion.aside>
  );
}
