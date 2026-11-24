// src/components/layouts/TeamLeadLayout.tsx
import { useEffect, useState } from "react"; // 🔔 NEW
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  // CheckCircle,
  LogOut,
  FolderKanban,
  Bell, // 🔔 NEW
} from "lucide-react";
import { clearToken } from "@/lib/auth";
import { BASE_URL } from "@/apiurl/apiurl"; // 🔔 NEW
import logo from "@/assets/logo-iiiqbets.png";

const menu = [
  { label: "Dashboard", path: "/teamlead/dashboard", icon: LayoutDashboard },
  { label: "Assigned Tickets", path: "/teamlead/tickets", icon: Ticket },
  { label: "Assigned Projects", path: "/teamlead/projects", icon: FolderKanban },
  { label: "Notifications", path: "/teamlead/notifications", icon: Bell }, // 🔔 NEW
  // { label: "Resolved History", path: "/teamlead/resolved", icon: CheckCircle },
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

  // 🔔 NEW: unread count for the badge
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!teamlead?.id) return;

    const loadUnread = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/notifications/unread-count?user_id=${teamlead.id}`
        );
        const data = await res.json();
        if (res.ok && data.success) setUnread(Number(data.count) || 0);
      } catch {
        /* ignore — badge is non-critical */
      }
    };

    loadUnread();
    const timer = setInterval(loadUnread, 30000); // refresh every 30s
    window.addEventListener("notifications-updated", loadUnread);

    return () => {
      clearInterval(timer);
      window.removeEventListener("notifications-updated", loadUnread);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamlead?.id, pathname]);

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

    // 3. Redirect to root login (replace so Back button doesn't return to a logged-in page)
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-[#0c2d67] text-white flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          {/* ✅ Logo — full aspect ratio, no crop */}
          <img
            src={logo}
            alt="logo"
            className="h-10 w-auto object-contain bg-white rounded-lg px-2 py-1"
          />
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
                {/* 🔔 NEW: unread badge on the Notifications item */}
                {path === "/teamlead/notifications" && unread > 0 && (
                  <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
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
          <div className="flex items-center gap-4">
            {/* 🔔 NEW: header bell with unread badge */}
            <Link
              to="/teamlead/notifications"
              className="relative text-gray-600 hover:text-[#0c2d67]"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>

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