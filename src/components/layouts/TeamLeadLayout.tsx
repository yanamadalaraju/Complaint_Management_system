// src/components/layouts/TeamLeadLayout.tsx
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  CheckCircle,
  LogOut,
  FolderKanban,
} from "lucide-react";
import { clearToken } from "@/lib/auth";
import logo from "@/assets/logo.jpeg";

const menu = [
  { label: "Dashboard", path: "/teamlead/dashboard", icon: LayoutDashboard },
  { label: "Assigned Tickets", path: "/teamlead/tickets", icon: Ticket },
  { label: "Assigned Projects", path: "/teamlead/projects", icon: FolderKanban },
  { label: "Resolved History", path: "/teamlead/resolved", icon: CheckCircle },
];

const TeamLeadLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // ---- Read logged-in team lead (for avatar initials) ----
  const teamleadRaw =
    typeof window !== "undefined"
      ? localStorage.getItem("teamlead_user")
      : null;
  const teamlead = teamleadRaw ? JSON.parse(teamleadRaw) : null;

  /* ---------------- Logout ---------------- */
  const logout = () => {
    // 1. Remove token (helper-managed)
    try {
      clearToken("teamlead");
    } catch {
      /* ignore */
    }

    // 2. Remove the stored user + residual keys
    localStorage.removeItem("teamlead_user");
    localStorage.removeItem("teamlead_token");
    localStorage.removeItem("token");
    sessionStorage.removeItem("teamlead_user");

    // 3. Redirect (replace so Back button doesn't return to a logged-in page)
    navigate("/teamlead/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-[#0c2d67] text-white flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <img src={logo} alt="logo" className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-bold text-sm">Team Lead</p>
            <p className="text-xs text-white/60">Resolver</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menu.map(({ label, path, icon: Icon }) => {
            const active = pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  active
                    ? "bg-white text-[#0c2d67] font-semibold"
                    : "hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-red-500/90 hover:bg-red-600 transition"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-[#0c2d67]">
            Team Lead Panel
          </h1>
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 flex items-center justify-center text-white font-bold">
            {teamlead?.name
              ? teamlead.name
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((n: string) => n[0]?.toUpperCase() ?? "")
                  .join("")
              : "TL"}
          </div>
        </header>

        <section className="p-6 flex-1 overflow-auto">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default TeamLeadLayout;