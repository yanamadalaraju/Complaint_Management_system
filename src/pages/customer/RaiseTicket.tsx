import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Search, ChevronDown, X } from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

const categories = ["Billing", "Technical", "Account", "Refund", "Other"];

type Project = {
  id: number;
  name: string;
  description?: string;
  status?: string;
  teamlead_id?: number | null;
  teamlead_name?: string | null;
};

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

  // ---- project dropdown ----
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectSearch, setProjectSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem("customer_user");
        const customer = stored ? JSON.parse(stored) : null;
        if (!customer?.id) return;

        setProjectsLoading(true);
        const res = await fetch(
          `${BASE_URL}/api/projects/customer/${customer.id}`
        );
        const data = await res.json();
        if (res.ok && data.success) setProjects(data.data || []);
        else console.error("Projects load failed:", data.message);
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setProjectsLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) || String(p.id).includes(q)
    );
  }, [projects, projectSearch]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.subject.trim() || !form.description.trim()) {
      alert("Please fill subject and description");
      return;
    }
    if (!selectedProject) {
      alert("Please select a project");
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
      fd.append("project_id", String(selectedProject.id));
      if (customer?.id) fd.append("customer_id", String(customer.id));
      if (customer?.name) fd.append("customer_name", customer.name);
      if (customer?.email) fd.append("customer_email", customer.email);
      if (file) fd.append("attachment", file);

      const res = await fetch(`${BASE_URL}/api/tickets`, {
        method: "POST",
        body: fd,
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
        {/* Project search dropdown */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-sm font-medium mb-1">
            Project <span className="text-red-500">*</span>
          </label>

          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="w-full px-4 py-2 border rounded-lg flex items-center justify-between bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
          >
            <span
              className={selectedProject ? "text-gray-900" : "text-gray-400"}
            >
              {selectedProject
                ? `${selectedProject.name} (#${selectedProject.id})`
                : projectsLoading
                ? "Loading projects…"
                : "Select your project"}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg">
              <div className="p-2 border-b flex items-center gap-2">
                <Search size={14} className="text-gray-400" />
                <input
                  autoFocus
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder="Search projects…"
                  className="flex-1 text-sm outline-none"
                />
                {projectSearch && (
                  <button
                    type="button"
                    onClick={() => setProjectSearch("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto">
                {projectsLoading ? (
                  <p className="p-3 text-sm text-gray-500">Loading…</p>
                ) : filteredProjects.length === 0 ? (
                  <p className="p-3 text-sm text-gray-500">
                    No projects found
                  </p>
                ) : (
                  filteredProjects.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        setSelectedProject(p);
                        setDropdownOpen(false);
                        setProjectSearch("");
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                        selectedProject?.id === p.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="font-medium">
                        {p.name}{" "}
                        <span className="text-gray-400">#{p.id}</span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {p.description || "—"}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Subject */}
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

        {/* Category / Priority */}
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

        {/* Description */}
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

        {/* Attachment */}
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

        {/* Actions */}
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