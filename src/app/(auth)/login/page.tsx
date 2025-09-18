"use client";

import { Ban, CircleCheckBig, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/app/components/AuthLayout";
import { loginErrors } from "@/app/(auth)/constants/errors";
import Logo from "@/app/components/Logo";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<{ email?: string; password?: string; form?: string }>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleToRedirect, setRoleToRedirect] = useState<string | null>(null);

  const roleFolder: Record<string, string> = {
    ceo: "/",
    team_leader: "/teamleader",
    hr: "/hr",
    employees: "/employees",
  };

  // ✅ Watch for auth state changes and redirect when session is ready
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && roleToRedirect) {
        router.replace(roleToRedirect);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [roleToRedirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    setLoading(true);

    if (!email) {
      setLoading(false);
      return setError({ email: loginErrors.email.empty });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLoading(false);
      return setError({ email: loginErrors.email.invalid });
    }
    if (!password) {
      setLoading(false);
      return setError({ password: loginErrors.password.empty });
    }
    if (password.length < 6) {
      setLoading(false);
      return setError({ password: loginErrors.password.invalid });
    }

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setLoading(false);
        return setError({ form: signInError.message });
      }

      if (!signInData.user) {
        setLoading(false);
        return setError({ form: "No user found" });
      }

      const authUser = signInData.user;
      const authId = authUser.id;

      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id, role")
        .eq("auth_id", authId)
        .maybeSingle();

      if (fetchError) {
        setLoading(false);
        return setError({ form: "Unable to fetch user data" });
      }

      let role = existingUser?.role;

      if (!existingUser) {
        const { error: insertError } = await supabase.from("users").insert({
          auth_id: authId,
          email: authUser.email,
          name: authUser.user_metadata?.name || null,
          role: authUser.user_metadata?.role || "employees",
        });

        if (insertError) {
          setLoading(false);
          return setError({ form: "Unable to create user profile" });
        }
        role = authUser.user_metadata?.role || "employees";
      }

      setSuccess("Login successful!");
      setRoleToRedirect(roleFolder[role || "employees"]); // ✅ Set role-based redirect
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError({ form: err.message || "Something went wrong" });
    }
  };

  return (
    <AuthLayout>
      <div className="sign-in-form px-4 py-10 sm:p-5 md:px-5 md:py-10 w-full">
        <Logo className="mb-8 sm:mb-10 justify-center w-full" />
        <div className="w-full max-w-[600px] bg-white rounded-xl p-6 sm:p-8 shadow-[0px_0px_20px_10px_#00000008] mx-auto">
          <h2 className="text-3xl sm:text-4xl text-center mb-2 sm:mb-4 font-semibold">Sign In</h2>
          <p className="text-center mb-8 sm:mb-10 text-sm sm:text-base">
            Please enter below details to access the dashboard
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error.email && /\S+@\S+\.\S+/.test(e.target.value)) {
                    setError((prev) => ({ ...prev, email: "" }));
                  }
                }}
                style={{ color: "var(--heading-color)" }}
                className={`peer w-full px-4 pt-4 pb-4 border border-[#0000000D] rounded-sm outline-none placeholder-transparent focus:ring-2 autofill:!bg-transparent
                  ${error.email ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                placeholder="Email"
              />
              <label
                htmlFor="email"
                style={{ color: "var(--heading-color)" }}
                className="absolute left-3 -top-2.5 text-sm transition-all
                  peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                  peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500 bg-white px-1"
              >
                Email
              </label>
              {error.email && (
                <p className="text-sm text-red-600 mt-2 flex items-center">
                  <Ban size={14} className="me-1" /> {error.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error.password && e.target.value.length >= 6) {
                    setError((prev) => ({ ...prev, password: "" }));
                  }
                }}
                style={{ color: "var(--heading-color)" }}
                className={`peer w-full px-4 pt-4 pb-4 border border-[#0000000D] rounded-sm outline-none placeholder-transparent focus:ring-2 autofill:!bg-transparent
                  ${error.password ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                placeholder="Password"
              />
              <label
                htmlFor="password"
                style={{ color: "var(--heading-color)" }}
                className="absolute left-3 -top-2.5 text-sm transition-all
                  peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                  peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500 bg-white px-1"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-5 cursor-pointer"
                style={{ color: "var(--heading-color)" }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {error.password && (
                <p className="text-sm text-red-600 mt-2 flex items-center">
                  <Ban size={16} className="me-1" /> {error.password}
                </p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 border border-[#0000000D] rounded-sm text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm" style={{ color: "var(--heading-color)" }}>
                  Remember me
                </span>
              </label>
              <a
                href="/forgot-password"
                className="text-sm hover:underline"
                style={{ color: "var(--primary-color)" }}
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-2 mt-2 font-semibold text-white rounded-sm border border-[#0000000D] transition-colors duration-300 ease-in-out cursor-pointer flex items-center justify-center"
              style={{ backgroundColor: "var(--primary-color)" }}
              onMouseEnter={(e) =>
                !loading && (e.currentTarget.style.backgroundColor = "var(--btn-hover-bg)")
              }
              onMouseLeave={(e) =>
                !loading && (e.currentTarget.style.backgroundColor = "var(--primary-color)")
              }
            >
              {loading && <Loader2 className="animate-spin mr-2" size={18} />}
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Messages */}
          {success && (
            <p className="mt-4 text-green-600 text-center font-normal flex items-center justify-center">
              <CircleCheckBig size={16} className="me-1" /> {success}
            </p>
          )}
          {error.form && (
            <p className="mt-4 text-red-600 text-center font-normal flex items-center justify-center">
              <Ban size={16} className="me-1" /> {error.form}
            </p>
          )}

          {/* Sign Up */}
          <p className="mt-5 text-sm text-center" style={{ color: "var(--heading-color)" }}>
            Don’t have an account?{" "}
            <a href="/register" className="hover:underline" style={{ color: "var(--primary-color)" }}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
