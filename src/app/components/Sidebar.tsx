"use client";

import { useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: <Home size={18} />, href: "#" },
  {
    label: "Peoples & Teams",
    icon: <Users size={18} />,
    children: [
      { label: "Employee", href: "#", icon: <User size={16} /> },
      { label: "Company", href: "#", icon: <Building2 size={16} /> },
      { label: "Leaves", href: "#", icon: <Calendar size={16} /> },
    ],
  },
  { label: "Projects", icon: <Folder size={18} />, href: "#" },
  {
    label: "Clients",
    icon: <UsersRound size={18} />,
    children: [
      { label: "Clients List", href: "#", icon: <UserCheck size={16} /> },
      { label: "Invoices & Payments", href: "#", icon: <DollarSign size={16} /> },
    ],
  },
  {
    label: "Reports",
    icon: <FileText size={18} />,
    children: [
      { label: "Team Report", href: "#", icon: <BarChart size={16} /> },
      { label: "Leave Report", href: "#", icon: <Calendar size={16} /> },
    ],
  },
  {
    label: "Account Settings",
    icon: <Settings size={18} />,
    children: [
      { label: "Profile", href: "#", icon: <User size={16} /> },
      { label: "Department Manage", href: "#", icon: <Briefcase size={16} /> },
      { label: "Role & Permission", href: "#", icon: <UserCog size={16} /> },
    ],
  },
  { label: "Helpdesk / Support", icon: <HelpCircle size={18} />, href: "#" },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string>("Dashboard");
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const toggleSubmenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      // Check if session exists first
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        console.warn("Logout: Auth session missing!");
        router.replace("/login");
        setLoggingOut(false);
        return;
      }

      // Sign out
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error.message);
        setLoggingOut(false);
        return;
      }

      router.replace("/login");
      setLoggingOut(false);
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
      router.replace("/login");
    }
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
                      ${activeMenu === item.label
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

                  {/* Submenu */}
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
                            onClick={() => setActiveMenu(sub.label)}
                            className={`flex items-center gap-3 whitespace-nowrap rounded-[5px] font-medium text-[14px] px-[10px] py-[10px] transition-colors duration-200
                              ${activeMenu === sub.label
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
                  onClick={() => setActiveMenu(item.label)}
                  className={`flex items-center gap-3 rounded-[5px] font-medium text-[14px] px-[10px] py-[10px] transition-colors duration-200
                    ${activeMenu === item.label
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
          {loggingOut ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <LogOut size={18} />
          )}
          {isOpen && <span>{loggingOut ? "Logging out..." : "Logout"}</span>}
        </button>
      </div>
    </motion.aside>
  );
}
