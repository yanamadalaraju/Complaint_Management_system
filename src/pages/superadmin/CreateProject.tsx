// src/pages/superadmin/CreateProject.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";
import SearchSelect from "@/components/ui/SearchSelect";

type Customer = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type Admin = {
  id: number;
  name: string;
  email: string;
  role: string;
};

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(true);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    customer_id: "" as string | number | "",
    admin_id: "" as string | number | "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  // ---------- Load customers + admins ----------
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setFetchingOptions(true);

        const [custRes, adminRes] = await Promise.all([
          fetch(`${BASE_URL}/api/customers`),
          fetch(`${BASE_URL}/api/admins?role=admin`),
        ]);

        const custData = await custRes.json();
        const adminData = await adminRes.json();

        if (custData.success) setCustomers(custData.data || []);
        if (adminData.success) setAdmins(adminData.data || []);
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
      } finally {
        setFetchingOptions(false);
      }
    };

    loadOptions();
  }, []);

  // ---------- Submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        customer_id: form.customer_id ? Number(form.customer_id) : null,
        admin_id: form.admin_id ? Number(form.admin_id) : null,
      };

      const res = await fetch(`${BASE_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create project");
      }

      alert("Project created ✅");
      navigate("/superadmin/projects");
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

      <h2 className="text-2xl font-bold text-[#0c2d67]">Create Project</h2>

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

        {/* ---------- Searchable Customer ---------- */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Customer <span className="text-red-500">*</span>
          </label>
          <SearchSelect
            options={customers.map((c) => ({
              value: c.id,
              label: c.name,
              sublabel: c.email,
            }))}
            value={form.customer_id}
            onChange={(v) => setForm({ ...form, customer_id: v })}
            placeholder="— Select Customer —"
            loading={fetchingOptions}
            emptyText="No customers available"
          />
          {/* hidden input keeps `required` validation on the form */}
          <input
            type="text"
            required
            value={form.customer_id}
            onChange={() => {}}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {/* ---------- Searchable Admin ---------- */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Admin <span className="text-red-500">*</span>
          </label>
          <SearchSelect
            options={admins.map((a) => ({
              value: a.id,
              label: a.name,
              sublabel: a.email,
            }))}
            value={form.admin_id}
            onChange={(v) => setForm({ ...form, admin_id: v })}
            placeholder="— Select Admin —"
            loading={fetchingOptions}
            emptyText="No admins available"
          />
          <input
            type="text"
            required
            value={form.admin_id}
            onChange={() => {}}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || fetchingOptions}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create Project"}
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

export default CreateProject;