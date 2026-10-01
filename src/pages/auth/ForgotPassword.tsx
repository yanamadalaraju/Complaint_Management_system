import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpeg";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with API call
    setSent(true);
    setTimeout(() => navigate(-1), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="w-32 h-32 object-contain mb-2" />
          <h2 className="text-2xl font-bold text-[#0c2d67]">Forgot Password</h2>
          <p className="text-gray-500 text-sm text-center">
            Enter your email to receive a reset link
          </p>
        </div>

        {sent ? (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-semibold">
              ✅ Reset link sent to your email!
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Redirecting back...
            </p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
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

            <button
              type="submit"
              className="w-full inline-flex justify-center items-center bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 text-white shadow-lg hover:scale-105 transition py-2 rounded-lg font-semibold"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full text-sm text-gray-500 hover:text-[#0c2d67]"
            >
              ← Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;