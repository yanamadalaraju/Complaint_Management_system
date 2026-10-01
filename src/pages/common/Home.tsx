import { Link } from "react-router-dom";
import { ShieldCheck, Users, Wrench, Headphones } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const Home = () => {
  const roles = [
    { label: "Super Admin", path: "/superadmin/login", icon: ShieldCheck, color: "from-purple-500 to-indigo-500" },
    { label: "Admin", path: "/admin/login", icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Team Lead", path: "/teamlead/login", icon: Wrench, color: "from-green-500 to-emerald-500" },
    { label: "Customer", path: "/customer/login", icon: Headphones, color: "from-pink-500 to-yellow-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f6f9] via-white to-[#eef1f7]">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center gap-3">
        <img src={logo} alt="Logo" className="w-12 h-12 rounded-full" />
        <h1 className="text-lg font-bold text-[#0c2d67]">Support Desk</h1>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0c2d67] leading-tight">
          Complaint & Ticket Management
        </h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          A unified platform for Super Admins, Admins, Team Leads, and Customers
          to raise, assign, resolve, and track support tickets seamlessly.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {roles.map(({ label, path, icon: Icon, color }) => (
            <Link
              key={label}
              to={path}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 flex flex-col items-center group"
            >
              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-r ${color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition`}
              >
                <Icon size={24} />
              </div>
              <p className="font-semibold text-[#0c2d67]">{label} Login</p>
              <p className="text-xs text-gray-500 mt-1">Click to sign in</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-gray-500 py-10">
        © {new Date().getFullYear()} Support Desk. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;