import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

type TeamMember = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
};

const EditTeamMember = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ---- loading / fetch state ----
  const [fetching, setFetching] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ---- form state ----
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    password: "", // blank = don't change
  });

  // ---- submit state ----
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ---------- Fetch member ----------
  useEffect(() => {
    const fetchMember = async () => {
      try {
        setFetching(true);
        setLoadError(null);

        const res = await fetch(
          `http://localhost:5000/api/teammembers/${id}`
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load team member");
        }

        const m: TeamMember = data.data;
        setForm({
          name: m.name ?? "",
          email: m.email ?? "",
          phone: m.phone ?? "",
          status: m.status ?? "active",
          password: "",
        });
      } catch (err: any) {
        setLoadError(err.message || "Something went wrong");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchMember();
  }, [id]);

  // ---------- Handle change ----------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  // ---------- Submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // build payload — only send password if user typed one
    const payload: Record<string, any> = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      status: form.status,
    };
    if (form.password.trim()) payload.password = form.password;

    try {
      const res = await fetch(
        `http://localhost:5000/api/teammembers/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update team member");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/teammembers");
      }, 900);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67] transition"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h2 className="text-2xl font-bold text-[#0c2d67]">Edit Team Member</h2>

      {/* ---- Loading ---- */}
      {fetching && (
        <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center gap-3 text-gray-500 max-w-2xl">
          <Loader2 size={26} className="animate-spin" />
          <p className="text-sm">Loading team member…</p>
        </div>
      )}

      {/* ---- Load error ---- */}
      {!fetching && loadError && (
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center gap-3 text-red-600 max-w-2xl">
          <AlertTriangle size={26} />
          <p className="text-sm">{loadError}</p>
          <button
            onClick={() => navigate("/admin/teammembers")}
            className="mt-2 px-4 py-2 rounded-lg border border-red-200 text-sm hover:bg-red-50"
          >
            Back to list
          </button>
        </div>
      )}

      {/* ---- Form ---- */}
      {!fetching && !loadError && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-5"
        >
          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 size={16} />
              Team member updated. Redirecting…
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              disabled={saving || success}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67] disabled:bg-gray-50"
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={saving || success}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67] disabled:bg-gray-50"
              placeholder="Enter email"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              disabled={saving || success}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67] disabled:bg-gray-50"
              placeholder="Enter phone"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={saving || success}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67] bg-white disabled:bg-gray-50"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Password (optional) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password{" "}
              <span className="text-gray-400 text-xs font-normal">
                (leave blank to keep current)
              </span>
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              minLength={form.password ? 6 : undefined}
              disabled={saving || success}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67] disabled:bg-gray-50"
              placeholder="••••••••"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || success}
              className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-6 py-2 rounded-lg hover:bg-[#0a2450] disabled:opacity-60 transition"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving…" : success ? "Saved ✅" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="px-6 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-60 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditTeamMember;