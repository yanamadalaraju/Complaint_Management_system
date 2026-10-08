import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpeg";
import { Eye, EyeOff } from "lucide-react";
import { setToken } from "@/lib/auth";
import { BASE_URL } from "@/apiurl/apiurl";

const TeamMemberLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ---- Fetch team members list from API ----
      const listRes = await fetch(`${BASE_URL}/api/teammembers`);
      const listData = await listRes.json();

      if (!listRes.ok || !listData.success) {
        throw new Error(listData.message || "Failed to load team members");
      }

      // Check whether a member with this email exists AND is active
      const matched = (listData.data || []).find(
        (m: any) => m.email?.toLowerCase() === email.trim().toLowerCase()
      );

      if (!matched) {
        throw new Error("Invalid email or password ❌");
      }

      if (matched.status !== "active") {
        throw new Error("Your account is inactive. Contact admin.");
      }

      // ---- Now verify the password via the login endpoint ----
      const res = await fetch(`${BASE_URL}/api/teammembers/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid email or password ❌");
      }

      // Save role + token using your existing helper
      setToken("teammember", data.token);
      localStorage.setItem("teammember_user", JSON.stringify(data.user));

      alert(`Welcome, ${data.user.name} ✅`);
      navigate("/teammember/dashboard");
    } catch (err: any) {
      alert(err.message || "Invalid credentials ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="w-32 h-32 object-contain mb-2" />
          <h2 className="text-2xl font-bold text-[#0c2d67]">Team Member Login</h2>
          <p className="text-gray-500 text-sm">Sign in to view your tickets</p>
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
            disabled={loading}
            className="w-full inline-flex justify-center items-center bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 text-white shadow-lg hover:scale-105 transition py-2 rounded-lg font-semibold disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamMemberLogin;