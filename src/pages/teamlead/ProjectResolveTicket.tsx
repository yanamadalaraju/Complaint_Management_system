import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

type Project = {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  customer_id: number | null;
  admin_id: number | null;
  teamlead_id: number | null;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_email: string | null;
  admin_name: string | null;
  admin_email: string | null;
  teamlead_name: string | null;
  teamlead_email: string | null;
};

const formatDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const ProjectResolveTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"COMPLETED" | "IN_PROGRESS">(
    "COMPLETED"
  );

  // ---------- Load project ----------
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${BASE_URL}/api/projects/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load project");
        }

        setProject(data.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id]);

  // ---------- Submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notes.trim()) {
      alert("Please add progress notes");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status, // "COMPLETED" | "IN_PROGRESS"
          progress_notes: notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update project");
      }

      alert(
        status === "COMPLETED"
          ? "Project completed ✅"
          : "Project marked in progress ✅"
      );
      navigate("/teamlead/projects");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Loading / Error ----------
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
        Loading project…
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-red-500">{error || "Project not found"}</p>
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

      <h2 className="text-2xl font-bold text-[#0c2d67]">Update Project</h2>

      {/* Project summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="font-mono text-xs text-gray-500">Project #{project.id}</p>
        <p className="font-semibold text-lg">{project.name}</p>
        <p className="text-sm text-gray-600 mt-1">
          {project.description || "No description"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {project.customer_name && (
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              Customer: {project.customer_name}
            </span>
          )}
          {project.admin_name && (
            <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              Admin: {project.admin_name}
            </span>
          )}
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            Start: {formatDate(project.start_date)}
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            End: {formatDate(project.end_date)}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Action</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value="COMPLETED"
                checked={status === "COMPLETED"}
                onChange={() => setStatus("COMPLETED")}
              />
              Mark as Completed
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value="IN_PROGRESS"
                checked={status === "IN_PROGRESS"}
                onChange={() => setStatus("IN_PROGRESS")}
              />
              Mark as In Progress
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Progress Notes <span className="text-red-500">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
            placeholder="Explain what you did to complete this project…"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be shared with the customer and admin.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            <CheckCircle size={16} />
            {saving
              ? "Saving…"
              : status === "COMPLETED"
              ? "Complete & Notify"
              : "Update Status"}
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

export default ProjectResolveTicket;