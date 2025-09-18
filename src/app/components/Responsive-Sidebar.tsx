"use client";
import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/app/components/Logo";
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

export default function ResponsiveSidebar() {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSubmenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <>
      {/* Toggle button (only on tablet & mobile) */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-5.5 left-4 z-40 p-0 cursor-pointer rounded text-[color:var(--heading-color)]"
      >
        <Menu size={26} />
      </button>

      {/* Sidebar overlay for mobile/tablet */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Dark overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />

            {/* Sidebar itself */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 flex flex-col"
            >
              {/* Header with logo + close btn */}
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
                              ${activeMenu === item.label
                                ? "bg-[var(--primary-color)] text-white"
                                : "text-[color:var(--heading-color)] hover:bg-[var(--primary-color)] hover:text-white"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              {item.icon}
                              <span>{item.label}</span>
                            </div>
                            {openMenus.includes(item.label) ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
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
                                    onClick={() => setActiveMenu(sub.label)}
                                    className={`flex items-center gap-2 rounded-md px-2 py-2 text-sm
                                      ${activeMenu === sub.label
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
                          onClick={() => setActiveMenu(item.label)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-[14px]
                            ${activeMenu === item.label
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

              {/* Logout btn */}
              <div className="p-4">
                <button className="w-full flex items-center justify-center gap-2 py-2 text-white bg-red-500 rounded-md hover:bg-red-600">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
