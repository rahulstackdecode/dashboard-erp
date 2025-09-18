"use client";
import { Ban, CircleCheckBig, Loader2 } from "lucide-react";
import { useState } from "react";
import AuthLayout from "@/app/components/AuthLayout";
import Logo from "@/app/components/Logo";
import { supabase } from "@/lib/supabaseClient"; // adjust path

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<{ email?: string; form?: string }>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    setLoading(true);

    if (!email) {
      setError({ email: "Email is required" });
      setLoading(false);
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError({ email: "Invalid email format" });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/set-new-password`, // redirect after reset
      });

      if (error) {
        setError({ form: error.message });
        setLoading(false);
        return;
      }

      setSuccess("Password reset email sent! Please check your inbox.");
    } catch (err: unknown) {
      if (err instanceof Error) {
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
      <div className="px-4 py-10 sm:p-5 md:px-5 md:py-10 w-full">
        <Logo className="mb-8 sm:mb-10 justify-center w-full" />
        <div className="w-full max-w-[600px] bg-white rounded-xl p-6 sm:p-8 shadow-[0px_0px_20px_10px_#00000008] mx-auto">
          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl text-center mb-2 sm:mb-4 font-semibold">
            Forgot your password?
          </h2>
          <p className="text-center mb-8 sm:mb-10 text-sm sm:text-base">
            Enter your email below to recover your password
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-2 mt-2 font-semibold text-white rounded-sm border border-[#0000000D] transition-colors duration-300 ease-in-out cursor-pointer flex items-center justify-center"
              style={{ backgroundColor: "var(--primary-color)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--btn-hover-bg)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--primary-color)")}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin me-2" />
              ) : null}
              {loading ? "Processing..." : "Submit"}
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

          {/* Back to Login */}
          <p className="mt-5 text-sm text-center" style={{ color: "var(--heading-color)" }}>
            Return to{" "}
            <a href="/login" className="hover:underline" style={{ color: "var(--primary-color)" }}>
              Login
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
