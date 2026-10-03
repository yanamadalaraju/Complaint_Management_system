import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Customer = {
  id: number;
  name: string;
  email: string;
};

type Admin = {
  id: number;
  name: string;
  email: string;
};

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    customer_id: "",
    admin_id: "",
  });

  // ---------- Load project + dropdown options ----------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setFetchingOptions(true);
        setError(null);

        const [projectRes, custRes, adminRes] = await Promise.all([
          fetch(`http://localhost:5000/api/projects/${id}`),
          fetch("http://localhost:5000/api/customers"),
          fetch("http://localhost:5000/api/admins?role=admin"),
        ]);

        const projectData = await projectRes.json();
        const custData = await custRes.json();
        const adminData = await adminRes.json();

        if (!projectRes.ok || !projectData.success) {
          throw new Error(projectData.message || "Failed to load project");
        }

        // Fill dropdown options
        if (custData.success) setCustomers(custData.data || []);
        if (adminData.success) setAdmins(adminData.data || []);

        // Fill the form with project data
        const p = projectData.data;
        setForm({
          name: p.name || "",
          description: p.description || "",
          start_date: p.start_date
            ? String(p.start_date).slice(0, 10)
            : "",
          end_date: p.end_date ? String(p.end_date).slice(0, 10) : "",
          customer_id: p.customer_id ? String(p.customer_id) : "",
          admin_id: p.admin_id ? String(p.admin_id) : "",
        });
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
        setFetchingOptions(false);
      }
    };

    if (id) loadData();
  }, [id]);

  // ---------- Handle change ----------
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  // ---------- Submit update ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        customer_id: form.customer_id ? Number(form.customer_id) : null,
        admin_id: form.admin_id ? Number(form.admin_id) : null,
      };

      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update project");
      }

      alert("Project updated ✅");
      navigate(`/superadmin/projects/${id}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
        Loading project…
      </div>
    );
  }

  // ---------- Error ----------
  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h2 className="text-2xl font-bold text-[#0c2d67]">Edit Project</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Project Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
            placeholder="Enter project name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
            placeholder="Short description of the project"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              name="end_date"
              type="date"
              value={form.end_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
            />
          </div>
        </div>

        {/* ---------- Customer dropdown ---------- */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Customer
          </label>
          <select
            name="customer_id"
            value={form.customer_id}
            onChange={handleChange}
            disabled={fetchingOptions}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67] disabled:bg-gray-100"
          >
            <option value="">— None —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>
        </div>

        {/* ---------- Admin dropdown ---------- */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Admin
          </label>
          <select
            name="admin_id"
            value={form.admin_id}
            onChange={handleChange}
            disabled={fetchingOptions}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67] disabled:bg-gray-100"
          >
            <option value="">— None —</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || fetchingOptions}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {saving ? "Updating…" : "Update Project"}
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

export default EditProject;