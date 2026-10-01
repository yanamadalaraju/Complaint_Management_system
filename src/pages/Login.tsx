import React, { useState } from "react";
import logo from '@/assets/logo.jpeg';
import { Eye, EyeOff } from "lucide-react";

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔐 Static credentials (temporary)
  const STATIC_EMAIL = "superadmin@example.com";
  const STATIC_PASSWORD = "superadmin123";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === STATIC_EMAIL && password === STATIC_PASSWORD) {
      // ✅ store token (dummy)
      localStorage.setItem("superadmin_token", "static-superadmin-token");

      alert("Super Admin login successful ✅");

      // ✅ redirect
      window.location.href = "/superadmin/dashboard";
    } else {
      alert("Invalid credentials ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">

        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={logo}
            alt="Super Admin Logo"
            className="w-40 h-40 object-contain mb-2"
          />
          <h2 className="text-2xl font-bold text-[#0c2d67]">
            Super Admin Login
          </h2>
          <p className="text-gray-500 text-sm">
            Sign in to your super admin account
          </p>
        </div>

        {/* FORM */}
        <form className="space-y-5" onSubmit={handleLogin}>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* Eye Icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* REMEMBER + FORGOT */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="/superadmin/forgot-password" className="text-[#0c2d67] hover:underline">
              Forgot password?
            </a>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full inline-flex justify-center items-center bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 text-white border-0 shadow-lg hover:scale-105 transition py-2 rounded-lg font-semibold"
          >
            Login
          </button>

        </form>

        {/* 🔑 STATIC CREDENTIALS HINT */}
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-gray-600">
          <p className="font-semibold mb-1 text-yellow-800">Demo Credentials:</p>
          <p>Email: <span className="font-mono">superadmin@example.com</span></p>
          <p>Password: <span className="font-mono">superadmin123</span></p>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminLogin;