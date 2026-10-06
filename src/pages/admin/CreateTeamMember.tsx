import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

const CreateTeamMember = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5000/api/teammembers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), // backend forces role = 'teammember'
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create team member");
      }

      setSuccess(true);

      // small delay so the user sees the success state
      setTimeout(() => {
        navigate("/admin/teammembers");
      }, 900);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67] transition"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h2 className="text-2xl font-bold text-[#0c2d67]">Create Team Member</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-5"
      >
        {/* ---- Success banner ---- */}
        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={16} />
            Team member created successfully. Redirecting…
          </div>
        )}

        {/* ---- Error banner ---- */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* ---- Input fields ---- */}
        {(["name", "email", "phone", "password"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">
              {field === "name" ? "Full Name" : field}
              {field !== "phone" && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
              name={field}
              type={
                field === "password"
                  ? "password"
                  : field === "email"
                  ? "email"
                  : "text"
              }
              value={form[field]}
              onChange={handleChange}
              required={field !== "phone"}
              minLength={field === "password" ? 6 : undefined}
              disabled={loading || success}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67] disabled:bg-gray-50 disabled:text-gray-500"
              placeholder={`Enter ${field}`}
            />
          </div>
        ))}

        {/* ---- Buttons ---- */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || success}
            className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-6 py-2 rounded-lg hover:bg-[#0a2450] disabled:opacity-60 transition"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Creating…" : success ? "Created ✅" : "Create Team Member"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="px-6 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-60 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeamMember;