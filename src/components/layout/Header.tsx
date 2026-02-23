"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

export function Header() {
  const { email, role } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#E8E8ED] bg-white/80 px-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-2">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F]">
          HKU Shanghai Forum
        </h2>
        <span className="hidden text-[12px] text-[#6E6E73] sm:inline">AILT1001-2S</span>
      </div>

      <div className="flex items-center gap-3">
        {role && (
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
              role === "ta"
                ? "bg-[#007AFF]/10 text-[#007AFF]"
                : "bg-[#30D158]/10 text-[#30D158]"
            }`}
          >
            {role}
          </span>
        )}
        <span className="hidden text-[13px] text-[#6E6E73] sm:inline">
          {email}
        </span>
        <button
          onClick={handleLogout}
          className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-[#FF3B30] transition-colors hover:bg-[#FF3B30]/5"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
