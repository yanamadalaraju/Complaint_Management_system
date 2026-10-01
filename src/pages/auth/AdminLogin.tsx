import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpeg";
import { Eye, EyeOff } from "lucide-react";
import { setToken } from "@/lib/auth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const STATIC_EMAIL = "admin@example.com";
  const STATIC_PASSWORD = "admin123";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === STATIC_EMAIL && password === STATIC_PASSWORD) {
      setToken("admin", "static-admin-token");
      alert("Admin login successful ✅");
      navigate("/admin/dashboard");
    } else {
      alert("Invalid credentials ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="w-32 h-32 object-contain mb-2" />
          <h2 className="text-2xl font-bold text-[#0c2d67]">Admin Login</h2>
          <p className="text-gray-500 text-sm">Sign in to manage tickets</p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Remember me
            </label>
            <a href="/forgot-password" className="text-[#0c2d67] hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full inline-flex justify-center items-center bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 text-white shadow-lg hover:scale-105 transition py-2 rounded-lg font-semibold"
          >
            Login
          </button>
        </form>

        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-gray-600">
          <p className="font-semibold mb-1 text-yellow-800">Demo Credentials:</p>
          <p>Email: <span className="font-mono">admin@example.com</span></p>
          <p>Password: <span className="font-mono">admin123</span></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;