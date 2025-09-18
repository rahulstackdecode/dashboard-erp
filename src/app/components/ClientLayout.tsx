"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Sidebar from "./Sidebar";
import ResponsiveSidebar from "./Responsive-Sidebar";
import Topbar from "./Topbar";
import FooterCopyright from "./FooterCopyright";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  // Exclude auth routes
  const authRoutes = ["/login", "/register", "/forgot-password", "/set-new-password"];
  const cleanPath = pathname?.replace(/\/$/, "") || "/";
  const isAuthRoute = authRoutes.includes(cleanPath);
  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="wrapper">
        <div className="dashboard-container flex">
          <Sidebar isOpen={isOpen} />
          <ResponsiveSidebar />

          <div className="h-screen flex-1 flex flex-col transition-all duration-300 overflow-hidden">
            <Topbar toggleSidebar={() => setIsOpen(!isOpen)} />
            <main className="flex-1 bg-white flex flex-col justify-between overflow-x-hidden">
              <div className="dashboard-wrapper px-4 py-7 lg:py-7 lg:px-8 max-w-full">
                {children}
              </div>
              <FooterCopyright />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
