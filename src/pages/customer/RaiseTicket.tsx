import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";

const categories = ["Billing", "Technical", "Account", "Refund", "Other"];

const RaiseTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    category: "Technical",
    priority: "MEDIUM",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.subject.trim() || !form.description.trim()) {
      alert("Please fill subject and description");
      return;
    }

    setLoading(true);
    try {
      const stored = localStorage.getItem("customer_user");
      const customer = stored ? JSON.parse(stored) : null;

      const fd = new FormData();
      fd.append("subject", form.subject);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("priority", form.priority);
      if (customer?.id) fd.append("customer_id", String(customer.id));
      if (customer?.name) fd.append("customer_name", customer.name);
      if (customer?.email) fd.append("customer_email", customer.email);
      if (file) fd.append("attachment", file);

      const res = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
        body: fd, // ⚠️ Do NOT set Content-Type
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to raise ticket");
      }

      alert(`Ticket raised ✅ Your ID: ${data.data.ticket_id}`);
      navigate("/customer/tickets");
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

      <h2 className="text-2xl font-bold text-[#0c2d67]">Raise a Ticket</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
            placeholder="Brief summary of your issue"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
            placeholder="Describe your issue in detail…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Attachment (optional)
          </label>
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm border rounded-lg p-2"
          />
          <p className="text-xs text-gray-400 mt-1">
            Max 5 MB — images, PDF, DOC, TXT.
          </p>
          {file && (
            <p className="text-xs text-green-600 mt-1">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-6 py-2 rounded-lg hover:bg-[#0a2450] disabled:opacity-60"
          >
            <Send size={16} /> {loading ? "Submitting…" : "Submit Ticket"}
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

export default RaiseTicket;