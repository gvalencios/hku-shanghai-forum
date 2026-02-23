"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const VALID_DOMAINS = ["hku.hk", "connect.hku.hk"];

function validateEmail(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain || !VALID_DOMAINS.includes(domain)) {
    return "Please use your HKU email (@hku.hk or @connect.hku.hk)";
  }
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, studentId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Invalid credentials. Please try again.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="mb-1 text-[13px] font-medium text-[#6E6E73]">AILT1001-2S</p>
          <h1 className="mb-1 text-[28px] font-semibold tracking-tight text-[#1D1D1F]">
            HKU Shanghai Forum
          </h1>
          <p className="text-[15px] text-[#6E6E73]">
            Sign in with your HKU email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[13px] font-medium text-[#6E6E73]"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.name@connect.hku.hk"
              required
              autoComplete="email"
              className="h-12 w-full rounded-xl border border-[#D2D2D7] bg-white px-4 text-[15px] text-[#1D1D1F] outline-none transition-all placeholder:text-[#86868B] focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10"
            />
          </div>

          <div>
            <label
              htmlFor="studentId"
              className="mb-1.5 block text-[13px] font-medium text-[#6E6E73]"
            >
              Student / Staff ID
            </label>
            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 3035XXXXXX"
              required
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-[#D2D2D7] bg-white px-4 text-[15px] text-[#1D1D1F] outline-none transition-all placeholder:text-[#86868B] focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10"
            />
          </div>

          {error && (
            <p className="text-[13px] text-[#FF3B30]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !studentId}
            className="h-12 w-full rounded-xl bg-[#007AFF] text-[15px] font-semibold text-white transition-all hover:bg-[#0066D6] active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-[#007AFF]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[#86868B]">
          Only @hku.hk and @connect.hku.hk emails are accepted
        </p>
      </div>
    </div>
  );
}
