import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  FolderKanban,
  UserCheck,
} from "lucide-react";
import { clearToken } from "@/lib/auth";
import logo from "@/assets/logo-iiiqbets.png";

const menu = [
  { label: "Dashboard", path: "/superadmin/dashboard", icon: LayoutDashboard },
  { label: "Manage Admins", path: "/superadmin/admins", icon: Users },
  { label: "Manage Project", path: "/superadmin/projects", icon: FolderKanban },
  { label: "Manage Customer", path: "/superadmin/customers", icon: UserCheck },
  { label: "All Tickets", path: "/superadmin/tickets", icon: Ticket },
  { label: "Reports", path: "/superadmin/reports", icon: BarChart3 },
  { label: "Settings", path: "/superadmin/settings", icon: Settings },
];

const SuperAdminLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    clearToken("superadmin");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0c2d67] text-white flex flex-col">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          {/* ✅ Logo — full aspect ratio, no crop */}
          <img
            src={logo}
            alt="logo"
            className="h-10 w-auto object-contain bg-white rounded-lg px-2 py-1"
          />
          <div>
            <p className="font-bold text-sm">Super Admin</p>
            <p className="text-xs text-white/60">Control Panel</p>
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

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-[#0c2d67]">
            Super Admin Panel
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 flex items-center justify-center text-white font-bold">
              SA
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

export default SuperAdminLayout;