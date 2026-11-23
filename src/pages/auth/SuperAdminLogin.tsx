// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import logo from "@/assets/logo-iiiqbets.png";
// import { Eye, EyeOff } from "lucide-react";
// import { setToken } from "@/lib/auth";

// const SuperAdminLogin = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const STATIC_EMAIL = "superadmin@example.com";
//   const STATIC_PASSWORD = "superadmin123";

//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (email === STATIC_EMAIL && password === STATIC_PASSWORD) {
//       setToken("superadmin", "static-superadmin-token");
//       alert("Super Admin login successful ✅");
//       navigate("/superadmin/dashboard");
//     } else {
//       alert("Invalid credentials ❌");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
//       <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
//         <div className="flex flex-col items-center mb-6">
//           <img src={logo} alt="Logo" className="w-32 h-32 object-contain mb-2" />
//           <h2 className="text-2xl font-bold text-[#0c2d67]">Super Admin Login</h2>
//           <p className="text-gray-500 text-sm">Sign in to your super admin account</p>
//         </div>

//         <form className="space-y-5" onSubmit={handleLogin}>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email Address
//             </label>
//             <input
//               type="email"
//               placeholder="Enter your email"
//               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter your password"
//                 className="w-full px-4 py-2 border rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
//               >
//                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>
//           </div>

//           <div className="flex justify-between items-center text-sm">
//             <label className="flex items-center gap-2">
//               <input type="checkbox" /> Remember me
//             </label>
//             <a href="/forgot-password" className="text-[#0c2d67] hover:underline">
//               Forgot password?
//             </a>
//           </div>

//           <button
//             type="submit"
//             className="w-full inline-flex justify-center items-center bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 text-white shadow-lg hover:scale-105 transition py-2 rounded-lg font-semibold"
//           >
//             Login
//           </button>
//         </form>

//         <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-gray-600">
//           <p className="font-semibold mb-1 text-yellow-800">Demo Credentials:</p>
//           <p>Email: <span className="font-mono">superadmin@example.com</span></p>
//           <p>Password: <span className="font-mono">superadmin123</span></p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SuperAdminLogin;



// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "@/assets/logo-iiiqbets.png";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { setToken } from "@/lib/auth";
import { BASE_URL } from "@/apiurl/apiurl";

type Role = "superadmin" | "admin" | "teamlead" | "teammember" | "customer";

const DASHBOARDS: Record<Role, string> = {
  superadmin: "/superadmin/dashboard",
  admin: "/admin/dashboard",
  teamlead: "/teamlead/dashboard",
  teammember: "/teammember/dashboard",
  customer: "/customer/dashboard",
};

// Order matters: the first endpoint that accepts the credentials wins.
const LOGIN_ENDPOINTS: { path: string; fallbackRole: Role }[] = [
  { path: "/api/admins/login", fallbackRole: "admin" }, // admins table also holds teamleads
  { path: "/api/teamleads/login", fallbackRole: "teamlead" },
  { path: "/api/teammembers/login", fallbackRole: "teammember" },
  { path: "/api/customers/login", fallbackRole: "customer" },
];

// NOTE: hard-coded credentials are visible to anyone who opens dev tools.
// Move superadmin to a real backend endpoint when you can.
const SUPERADMIN = { email: "superadmin@example.com", password: "superadmin123" };

const normalizeRole = (r: unknown, fallback: Role): Role => {
  const v = String(r || "").toLowerCase().replace(/[\s_-]/g, "");
  return (v in DASHBOARDS ? v : fallback) as Role;
};

/* ---------- Left-side illustration (pure CSS, no extra assets) ---------- */
const TicketIllustration = () => (
  <div className="relative w-full max-w-[460px] h-[400px] mx-auto select-none" aria-hidden="true">
    {/* soft background blob */}
    <div className="absolute inset-x-6 inset-y-4 rounded-[2.5rem] bg-gradient-to-br from-[#e8eefb] to-[#f6f0ff]" />

    {/* main ticket card */}
    <div className="absolute left-10 top-10 w-[300px] bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-[#0c2d67]">Ticket #1042</span>
        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
          In progress
        </span>
      </div>
      <p className="text-sm font-semibold text-gray-800">Unable to access my account</p>
      <p className="text-xs text-gray-500 mt-1">Raised by a customer · 2 hours ago</p>

      <div className="mt-5 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#0c2d67] to-blue-500" />
      </div>
      <div className="flex justify-between text-[11px] text-gray-400 mt-2">
        <span>Raised</span>
        <span>Assigned</span>
        <span>Resolved</span>
      </div>
    </div>

    {/* resolved card */}
    <div className="absolute right-4 top-44 w-[230px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
        <CheckCircle2 className="text-green-600" size={22} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">Ticket resolved</p>
        <p className="text-xs text-gray-500">Closed within SLA</p>
      </div>
    </div>

    {/* reply card */}
    <div className="absolute left-4 bottom-8 w-[250px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <MessageSquare className="text-[#0c2d67]" size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800">New reply from team</p>
        <div className="mt-2 space-y-1.5">
          <div className="h-2 w-40 rounded bg-gray-100" />
          <div className="h-2 w-28 rounded bg-gray-100" />
        </div>
      </div>
    </div>

    {/* time badge */}
    <div className="absolute right-10 top-4 flex items-center gap-1.5 bg-[#0c2d67] text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg">
      <Clock size={13} />
      24h support
    </div>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finishLogin = (role: Role, token: string, user: any) => {
    setToken(role, token);
    localStorage.setItem("auth_role", role);
    localStorage.setItem("auth_user", JSON.stringify(user));
    localStorage.setItem(`${role}_user`, JSON.stringify(user)); // keeps existing pages working
    navigate(DASHBOARDS[role], { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanEmail = email.trim();

    try {
      // 1) Super admin (static)
      if (
        cleanEmail.toLowerCase() === SUPERADMIN.email &&
        password === SUPERADMIN.password
      ) {
        finishLogin("superadmin", "static-superadmin-token", {
          name: "Super Admin",
          email: SUPERADMIN.email,
          role: "superadmin",
        });
        return;
      }

      // 2) API roles: try each endpoint until one succeeds
      let inactiveMsg = "";
      for (const { path, fallbackRole } of LOGIN_ENDPOINTS) {
        try {
          const res = await fetch(`${BASE_URL}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail, password }),
          });
          const data = await res.json();

          if (res.ok && data.success) {
            if (data.user?.status && data.user.status !== "active") {
              inactiveMsg = "Your account is inactive. Contact admin.";
              break;
            }
            const role = normalizeRole(data.user?.role, fallbackRole);
            finishLogin(role, data.token, data.user);
            return;
          }

          if (/inactive/i.test(data?.message || "")) {
            inactiveMsg = data.message;
            break;
          }
        } catch {
          // network error on this endpoint -> try the next one
        }
      }

      setError(inactiveMsg || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 " +
    "focus:outline-none focus:border-[#0c2d67] focus:ring-2 focus:ring-[#0c2d67]/25 transition";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* ---------- LEFT: brand + headline + illustration ---------- */}
        <section className="hidden lg:flex flex-1 flex-col justify-between px-12 xl:px-20 py-10 border-r border-gray-200">
          <img src={logo} alt="Complaint Management System" className="w-20 h-20 object-contain" />

          <div className="flex-1 flex items-center">
            <TicketIllustration />
          </div>

          <div>
            <h2 className="text-5xl xl:text-6xl font-extrabold leading-[1.1] text-gray-900">
              Raise it.
              <br />
              Track it.
              <br />
              <span className="text-[#0c2d67]">Resolve it.</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-md">
              One place for customers and teams to manage complaints from start to finish.
            </p>
          </div>
        </section>

        {/* ---------- RIGHT: login form ---------- */}
        <section className="flex-1 flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-[460px]">
            {/* logo on mobile only (left panel is hidden there) */}
            <div className="lg:hidden flex justify-center mb-6">
              <img src={logo} alt="Complaint Management System" className="w-20 h-20 object-contain" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Log in to Complaint Management System
            </h1>
            <p className="text-gray-500 text-sm mt-1 mb-6">
              Enter your email and password to continue.
            </p>

            <form className="space-y-4" onSubmit={handleLogin} noValidate={false}>
              <input
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  aria-label="Password"
                  className={`${inputClass} pr-12`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 inline-flex justify-center items-center gap-2 rounded-full bg-[#0c2d67] hover:bg-[#0a2552] text-white text-base font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[#0c2d67]/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Signing in…
                  </>
                ) : (
                  "Log in"
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-gray-800 hover:underline"
                >
                  Forgotten password?
                </Link>
              </div>
            </form>

            <div className="my-8 border-t border-gray-200" />

            <Link
              to="/customer/signup"
              className="w-full h-12 inline-flex justify-center items-center rounded-full border border-[#0c2d67] text-[#0c2d67] font-semibold hover:bg-[#0c2d67]/5 transition focus:outline-none focus:ring-4 focus:ring-[#0c2d67]/20"
            >
              Create new account
            </Link>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-gray-200 py-4 px-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Complaint Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;