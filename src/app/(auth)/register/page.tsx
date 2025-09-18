"use client";

import { Ban, CircleCheckBig, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import AuthLayout from "@/app/components/AuthLayout";
import { registerErrors } from "@/app/(auth)/constants/errors";
import Logo from "@/app/components/Logo";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<{
    name?: string;
    email?: string;
    role?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // ✅ loader state

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError({});
  setSuccess("");

  // Validation
  if (!name.trim()) return setError({ name: registerErrors.name.empty });
  if (!email.trim()) return setError({ email: registerErrors.email.empty });
  if (!/\S+@\S+\.\S+/.test(email.trim()))
    return setError({ email: registerErrors.email.invalid });
  if (!role) return setError({ role: registerErrors.role.empty });
  if (!password) return setError({ password: registerErrors.password.empty });
  if (password.length < 6)
    return setError({ password: registerErrors.password.invalid });
  if (!confirmPassword)
    return setError({ confirmPassword: registerErrors.confirmPassword.empty });
  if (confirmPassword !== password)
    return setError({ confirmPassword: registerErrors.confirmPassword.mismatch });

  try {
    setLoading(true);

    // Ensure window exists (client-side)
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/login`
        : "/login";

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name: name.trim(), role },
      },
    });

    if (signUpError) {
      setError({ form: signUpError.message });
      return;
    }

    setSuccess(
      "Account created. Please check your email to verify and then log in."
    );

    // Clear form
    setName("");
    setEmail("");
    setRole("");
    setPassword("");
    setConfirmPassword("");
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Something went wrong";
    setError({ form: errorMessage });
  } finally {
    setLoading(false);
  }
};


  return (
    <AuthLayout>
      <div className="sign-up-form px-4 py-10 sm:p-5 md:px-5 md:py-10 w-full">
        <Logo className="mb-8 sm:mb-10 justify-center w-full" />
        <div className="w-full max-w-[600px] bg-white rounded-xl p-6 sm:p-8 shadow-[0px_0px_20px_10px_#00000008] mx-auto">
          <h2 className="text-3xl sm:text-4xl text-center mb-2 sm:mb-4 font-semibold">
            Sign Up
          </h2>
          <p className="text-center mb-8 sm:mb-10 text-sm sm:text-base">
            Please enter below details to create your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="relative">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`peer w-full px-3 pt-4 pb-4 border border-[#0000000D] rounded-sm outline-none placeholder-transparent focus:ring-2 autofill:!bg-transparent
                  ${error.name ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                placeholder="Full Name"
                style={{ color: "var(--heading-color)" }}
              />
              <label
                htmlFor="name"
                className="absolute left-3 -top-2.5 text-sm transition-all
                  peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                  peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500 bg-white px-1"
                style={{ color: "var(--heading-color)" }}
              >
                Full Name
              </label>
              {error.name && (
                <p className="text-sm text-red-600 mt-2 flex items-center">
                  <Ban size={14} className="me-1" /> {error.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`peer w-full px-3 pt-4 pb-4 border border-[#0000000D] rounded-sm outline-none placeholder-transparent focus:ring-2 autofill:!bg-transparent
                  ${error.email ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                placeholder="Email"
                style={{ color: "var(--heading-color)" }}
              />
              <label
                htmlFor="email"
                className="absolute left-3 -top-2.5 text-sm transition-all
                  peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                  peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500 bg-white px-1"
                style={{ color: "var(--heading-color)" }}
              >
                Email
              </label>
              {error.email && (
                <p className="text-sm text-red-600 mt-2 flex items-center">
                  <Ban size={14} className="me-1" /> {error.email}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="relative">
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`peer w-full px-3 pt-4 pb-4 border border-[#0000000D] rounded-sm outline-none focus:ring-2
                  ${error.role ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                style={{ color: "var(--heading-color)" }}
              >
                <option value="">Select a role</option>
                <option value="employees">Employee</option>
                <option value="hr">HR</option>
                <option value="ceo">CEO</option>
                <option value="team_leader">Team Leader</option>
              </select>
              <label
                htmlFor="role"
                className="absolute left-3 -top-2.5 text-sm transition-all bg-white px-1 peer-focus:text-blue-500"
                style={{ color: "var(--heading-color)" }}
              >
                Role
              </label>
              {error.role && (
                <p className="text-sm text-red-600 mt-2 flex items-center">
                  <Ban size={14} className="me-1" /> {error.role}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`peer w-full px-3 pt-4 pb-4 border border-[#0000000D] rounded-sm outline-none placeholder-transparent focus:ring-2 autofill:!bg-transparent
                  ${error.password ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                placeholder="Password"
                style={{ color: "var(--heading-color)" }}
              />
              <label
                htmlFor="password"
                className="absolute left-3 -top-2.5 text-sm transition-all
                  peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                  peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500 bg-white px-1"
                style={{ color: "var(--heading-color)" }}
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

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`peer w-full px-3 pt-4 pb-4 border border-[#0000000D] rounded-sm outline-none placeholder-transparent focus:ring-2 autofill:!bg-transparent
                  ${error.confirmPassword ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                placeholder="Confirm Password"
                style={{ color: "var(--heading-color)" }}
              />
              <label
                htmlFor="confirmPassword"
                className="absolute left-3 -top-2.5 text-sm transition-all
                  peer-placeholder-shown:top-4 peer-placeholder-shown:text-base
                  peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500 bg-white px-1"
                style={{ color: "var(--heading-color)" }}
              >
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-5 cursor-pointer"
                style={{ color: "var(--heading-color)" }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {error.confirmPassword && (
                <p className="text-sm text-red-600 mt-2 flex items-center">
                  <Ban size={16} className="me-1" /> {error.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-2 mt-2 font-semibold text-white rounded-sm border border-[#0000000D] transition-colors duration-300 ease-in-out cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--primary-color)" }}
              onMouseEnter={(e) => {
                if (!loading)
                  e.currentTarget.style.backgroundColor = "var(--btn-hover-bg)";
              }}
              onMouseLeave={(e) => {
                if (!loading)
                  e.currentTarget.style.backgroundColor = "var(--primary-color)";
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} /> Submitting...
                </>
              ) : (
                "Sign Up"
              )}
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

          <p
            className="mt-5 text-sm text-center"
            style={{ color: "var(--heading-color)" }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              className="hover:underline"
              style={{ color: "var(--primary-color)" }}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
