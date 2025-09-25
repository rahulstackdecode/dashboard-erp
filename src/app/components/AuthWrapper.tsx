"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ClientLayout from "./ClientLayout";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState<{ authenticated: boolean; role?: string } | null>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  const publicRoutes = ["/login", "/register", "/forgot-password", "/set-new-password"];
  const cleanPath = pathname?.replace(/\/$/, "") || "/";

  const roleFolders: Record<string, string> = {
    ceo: "/",
    team_leader: "/teamleader",
    hr: "/hr",
    employees: "/employees", // list page
  };

  // Fetch session + role
  const fetchAuth = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session?.user?.id) {
      setAuth({ authenticated: false });
      return;
    }

    const { data: profile, error } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", session.user.id)
      .single();

    if (error || !profile?.role) {
      setAuth({ authenticated: false });
      return;
    }

    setAuth({ authenticated: true, role: profile.role });
  };

  // Initial auth check + listener
  useEffect(() => {
    fetchAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, _session) => {
      fetchAuth();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Handle redirects
  useEffect(() => {
    if (!auth) return;

    // Already authenticated & on public route → redirect to dashboard
    if (auth.authenticated && publicRoutes.includes(cleanPath)) {
      const roleFolder = roleFolders[auth.role!] || "/";
      if (cleanPath !== roleFolder) setRedirectTo(roleFolder);
      return;
    }

    // Not logged in → redirect to login
    if (!auth.authenticated && !publicRoutes.includes(cleanPath)) {
      setRedirectTo("/login");
      return;
    }

    // Role-based main page redirect
    if (auth.authenticated && auth.role) {
      const roleFolder = roleFolders[auth.role] || "/";

      // CEO special case
      if (auth.role === "ceo" && cleanPath !== "/" && !cleanPath.startsWith("/ceo")) {
        if (cleanPath !== "/") setRedirectTo("/");
        return;
      }

      // Other roles, allow list + dynamic employee edit pages
      if (roleFolder !== "/") {
        const allowedPrefixes = [roleFolder, "/employee"]; // allow dynamic edit pages
        if (!allowedPrefixes.some(prefix => cleanPath.startsWith(prefix))) {
          setRedirectTo(roleFolder);
          return;
        }
      }
    }
  }, [auth, cleanPath]);

  // Perform redirect
  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
      setRedirectTo(null);
    }
  }, [redirectTo, router]);

  if (auth === null)
    return (
      <ClientLayout>
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white z-50">
          <div className="loader mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
          <style jsx>{`
            .loader {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              width: 50px;
              height: 50px;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </ClientLayout>
    );

  if (redirectTo)
    return (
      <ClientLayout>
        <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </ClientLayout>
    );

  return <ClientLayout>{children}</ClientLayout>;
}
