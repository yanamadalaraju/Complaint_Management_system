import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CreateTeamLead = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/teamleads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), // role forced on backend
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create team lead");
      }

      alert("Team lead created ✅");
      navigate("/admin/teamleads");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h2 className="text-2xl font-bold text-[#0c2d67]">Create Team Lead</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-5"
      >
        {(["name", "email", "phone", "password"] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">
              {field === "name" ? "Full Name" : field}
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
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
              placeholder={`Enter ${field}`}
            />
          </div>
        ))}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#0c2d67] text-white px-6 py-2 rounded-lg hover:bg-[#0a2450] disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create Team Lead"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeamLead;