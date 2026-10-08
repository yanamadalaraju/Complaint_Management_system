// src/layouts/TeamMemberLayout.tsx
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bell,
  LogOut,
  FolderKanban,
  ListChecks,
} from "lucide-react";
import { clearToken } from "@/lib/auth";
import logo from "@/assets/logo.jpeg";
import { useUnreadCount } from "@/hooks/useUnreadCount";

const menu = [
  { label: "Dashboard", path: "/teammember/dashboard", icon: LayoutDashboard },
  { label: "My Projects", path: "/teammember/projects", icon: FolderKanban },
  { label: "My Tasks", path: "/teammember/tasks", icon: ListChecks },
  // { label: "Notifications", path: "/teammember/notifications", icon: Bell },
];

const TeamMemberLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const memberRaw =
    typeof window !== "undefined"
      ? localStorage.getItem("teammember_user")
      : null;
  const member = memberRaw ? JSON.parse(memberRaw) : null;
  const memberId: number | null = member?.id ?? null;

  const unread = useUnreadCount(memberId);

  /* ---------------- Logout ---------------- */
  const logout = () => {
    // 1. Remove token — guard with try/catch so a helper error doesn't
    //    block the rest of the cleanup
    try {
      clearToken("teammember");
    } catch (e) {
      console.warn("clearToken failed, continuing cleanup:", e);
    }

    // 2. Remove the stored user + every residual key
    localStorage.removeItem("teammember_user");
    localStorage.removeItem("teammember_token");
    localStorage.removeItem("token");
    sessionStorage.removeItem("teammember_user");

    // 3. Redirect (replace so Back button doesn't return to a logged-in page)
    navigate("/teammember/login", { replace: true });
  };

  const initials =
    member?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n: string) => n[0]?.toUpperCase() ?? "")
      .join("") || "TM";

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-[#0c2d67] text-white flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <img src={logo} alt="logo" className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-bold text-sm">Team Member</p>
            <p className="text-xs text-white/60">Workspace</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menu.map(({ label, path, icon: Icon }) => {
            const active = pathname.startsWith(path);
            const isNotifications = path === "/teammember/notifications";

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
                <span className="flex-1">{label}</span>

                {isNotifications && unread > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
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
            Team Member Panel
          </h1>

          <div className="flex items-center gap-3">
            <Link
              to="/teammember/notifications"
              className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600"
              title="Notifications"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>

            <div
              className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs"
              title={member?.name ?? "Team Member"}
            >
              {initials}
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

export default TeamMemberLayout;