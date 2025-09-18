"use client";

import { Ban, CircleCheckBig, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthLayout from "@/app/components/AuthLayout";
import Logo from "@/app/components/Logo";
import { registerErrors } from "@/app/(auth)/constants/errors";
import { supabase } from "@/lib/supabaseClient";

type ErrorField = "password" | "confirmPassword" | "form";

interface FormError {
  field: ErrorField;
  message: string;
}

export default function SetNewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<Partial<Record<ErrorField, string>>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    setLoading(true);

    try {
      // Validation
      if (!password) throw { field: "password", message: registerErrors.password.empty } as FormError;
      if (password.length < 6) throw { field: "password", message: registerErrors.password.weak } as FormError;
      if (!confirmPassword) throw { field: "confirmPassword", message: registerErrors.confirmPassword.empty } as FormError;
      if (confirmPassword !== password) throw { field: "confirmPassword", message: registerErrors.confirmPassword.mismatch } as FormError;

      // Update password
      const { error: supabaseError } = await supabase.auth.updateUser({ password });

      if (supabaseError) throw { field: "form", message: supabaseError.message } as FormError;

      setSuccess("Password updated successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);

    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "field" in err && "message" in err) {
        const formError = err as FormError;
        setError({ [formError.field]: formError.message });
      } else if (err instanceof Error) {
        setError({ form: err.message });
      } else {
        setError({ form: "Something went wrong" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="sign-in-form px-4 py-10 sm:p-5 md:px-5 md:py-10 w-full">
        <Logo className="mb-8 sm:mb-10 justify-center w-full" />
        <div className="w-full max-w-[600px] bg-white rounded-xl p-6 sm:p-8 shadow-[0px_0px_20px_10px_#00000008] mx-auto">
          <h2 className="text-3xl sm:text-4xl text-center mb-2 sm:mb-4 font-semibold">
            Set New Password
          </h2>
          <p className="text-center mb-8 sm:mb-10 text-sm sm:text-base">
            Please enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error.password && e.target.value.length >= 6)
                    setError((prev) => ({ ...prev, password: "" }));
                }}
                style={{ color: "var(--heading-color)" }}
                className={`peer w-full px-4 pt-4 pb-4 border border-[#0000000D] rounded-sm outline-none placeholder-transparent focus:ring-2
                  ${error.password ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                placeholder="New Password"
              />
              <label
                className="absolute left-3 -top-2.5 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500 bg-white px-1"
                style={{ color: "var(--heading-color)" }}
              >
                New Password
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
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error.confirmPassword && e.target.value === password)
                    setError((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                style={{ color: "var(--heading-color)" }}
                className={`peer w-full px-4 pt-4 pb-4 border border-[#0000000D] rounded-sm outline-none placeholder-transparent focus:ring-2
                  ${error.confirmPassword ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                placeholder="Confirm Password"
              />
              <label
                className="absolute left-3 -top-2.5 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500 bg-white px-1"
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
              className="w-full py-3 px-2 mt-2 font-semibold text-white rounded-sm border border-[#0000000D] transition-colors duration-300 cursor-pointer flex items-center justify-center"
              style={{ backgroundColor: "var(--primary-color)" }}
              onMouseEnter={(e) =>
                !loading && (e.currentTarget.style.backgroundColor = "var(--btn-hover-bg)")
              }
              onMouseLeave={(e) =>
                !loading && (e.currentTarget.style.backgroundColor = "var(--primary-color)")
              }
            >
              {loading && <Loader2 size={18} className="animate-spin me-2" />}
              {loading ? "Processing..." : "Update Password"}
            </button>
          </form>

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
        </div>
      </div>
    </AuthLayout>
  );
}
