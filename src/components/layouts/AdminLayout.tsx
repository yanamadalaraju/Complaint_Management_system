import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Bell,
  LogOut,
  FolderKanban,
} from "lucide-react";
import { clearToken } from "@/lib/auth";
import logo from "@/assets/logo.jpeg";
import { useUnreadCount } from "@/hooks/useUnreadCount";

const menu = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "All Tickets", path: "/admin/tickets", icon: Ticket },
  { label: "All Projects", path: "/admin/projects", icon: FolderKanban },
  { label: "Team Leads", path: "/admin/teamleads", icon: Users },
  { label: "Notifications", path: "/admin/notifications", icon: Bell },
];

const AdminLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // ---- Read logged-in admin ----
  const adminRaw =
    typeof window !== "undefined"
      ? localStorage.getItem("admin_user")
      : null;
  const admin = adminRaw ? JSON.parse(adminRaw) : null;
  const adminId: number | null = admin?.id ?? null;

  // ---- Live unread badge count ----
  const unread = useUnreadCount(adminId, "admin_user", 15000);

  const logout = () => {
    clearToken("admin");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-[#0c2d67] text-white flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <img src={logo} alt="logo" className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-bold text-sm">Admin</p>
            <p className="text-xs text-white/60">Ticket Manager</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {menu.map(({ label, path, icon: Icon }) => {
            const active = pathname.startsWith(path);
            const isNotifications = path === "/admin/notifications";

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

                {/* 👇 Unread badge — only for the Notifications item */}
                {isNotifications && unread > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      active
                        ? "bg-red-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
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
          <h1 className="text-lg font-semibold text-[#0c2d67]">Admin Panel</h1>

          <div className="flex items-center gap-3">
            {/* 🔔 Header bell with count (optional but nice) */}
            <Link
              to="/admin/notifications"
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

            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 flex items-center justify-center text-white font-bold">
              AD
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

export default AdminLayout;