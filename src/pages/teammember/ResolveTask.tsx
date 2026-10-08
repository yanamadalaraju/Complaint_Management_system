// src/pages/teammember/ResolveTask.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2, MessageSquare } from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

type Task = {
  id: number;
  project_id: number;
  member_id: number;
  assigned_by: number;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  due_date: string | null;
  progress_notes: string | null;
  teamlead_reply: string | null;
  created_at: string;
  updated_at: string;
  project_name: string | null;
  assigned_by_name: string | null;
};

const API = `${BASE_URL}`;

const formatDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const ResolveTask = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "COMPLETED" | "IN_PROGRESS" | "BLOCKED"
  >("COMPLETED");
  const [notes, setNotes] = useState("");

  /* ---------- Load task ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const stored = localStorage.getItem("teammember_user");
        const member = stored ? JSON.parse(stored) : null;
        if (!member?.id) throw new Error("You are not logged in.");

        const res = await fetch(`${API}/api/tasks/member/${member.id}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load task");
        }
        const found =
          (data.data || []).find((t: Task) => Number(t.id) === Number(id)) ||
          null;
        if (!found) throw new Error("Task not found.");
        setTask(found);

        if (found.status === "BLOCKED") setStatus("BLOCKED");
        else if (found.status === "IN_PROGRESS") setStatus("IN_PROGRESS");
        else setStatus("COMPLETED");

        setNotes(found.progress_notes || "");
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  /* ---------- Submit ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          progress_notes: notes.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update task");
      }
      alert(
        status === "COMPLETED"
          ? "Task marked COMPLETED ✅ Team lead notified."
          : status === "BLOCKED"
          ? "Task marked BLOCKED ✅ Team lead notified."
          : "Task marked IN PROGRESS ✅ Team lead notified."
      );
      navigate("/teammember/tasks");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Loading / Error ---------- */
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 flex items-center justify-center gap-2">
        <Loader2 size={16} className="animate-spin" /> Loading task…
      </div>
    );
  }
  if (error || !task) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-red-500">{error || "Task not found"}</p>
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

      <h2 className="text-2xl font-bold text-[#0c2d67]">Resolve Task</h2>

      {/* Task summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <p className="font-mono text-xs text-gray-500">Task #{task.id}</p>
        <p className="font-semibold text-lg">{task.title}</p>
        {task.description && (
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-xs pt-1">
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            Project: {task.project_name || `#${task.project_id}`}
          </span>
          {task.assigned_by_name && (
            <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              Assigned by: {task.assigned_by_name}
            </span>
          )}
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            Priority: {task.priority}
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            Due: {formatDate(task.due_date)}
          </span>
        </div>
      </div>

      {/* Team Lead's reply — only shows if it exists */}
      {task.teamlead_reply && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-xs uppercase tracking-wide text-[#0c2d67] font-semibold mb-2 flex items-center gap-2">
            <MessageSquare size={14} />
            Message from Team Lead
            {task.assigned_by_name && (
              <span className="font-normal text-gray-500 normal-case">
                ({task.assigned_by_name})
              </span>
            )}
          </p>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-900 whitespace-pre-wrap">
            {task.teamlead_reply}
          </div>
        </div>
      )}

      {/* Existing notes */}
      {task.progress_notes && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
            Previous Progress Notes
          </p>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 whitespace-pre-wrap">
            {task.progress_notes}
          </div>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-2">New Status</label>
          <div className="flex flex-wrap gap-4">
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
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value="BLOCKED"
                checked={status === "BLOCKED"}
                onChange={() => setStatus("BLOCKED")}
              />
              Mark as Blocked
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Progress Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
            placeholder="Explain what you did, blockers, or next steps…"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your team lead will see these notes along with the notification.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            <CheckCircle size={16} />
            {saving ? "Saving…" : "Update Status"}
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

export default ResolveTask;