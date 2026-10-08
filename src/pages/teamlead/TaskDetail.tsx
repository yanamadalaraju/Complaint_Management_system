// src/pages/teamlead/TaskDetail.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  FolderKanban,
  User,
  ListChecks,
  AlertTriangle,
  MessageSquare,
  Send,
  CheckCircle2,
} from "lucide-react";
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
  project_name?: string | null;
  member_name: string | null;
  member_email: string | null;
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

const formatDateTime = (d: string | null) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const statusStyles: Record<Task["status"], string> = {
  TODO: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  BLOCKED: "bg-red-100 text-red-700",
};

const priorityStyles: Record<Task["priority"], string> = {
  LOW: "bg-gray-50 text-gray-700 border-gray-200",
  MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-200",
  HIGH: "bg-red-50 text-red-700 border-red-200",
};

/** Read projectId & taskId from URL: /teamlead/projects/<projId>/tasks/<taskId> */
const parseIdsFromUrl = () => {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const projectsIdx = parts.indexOf("projects");
  const tasksIdx = parts.indexOf("tasks");
  const projId = projectsIdx >= 0 ? parts[projectsIdx + 1] : null;
  const tId = tasksIdx >= 0 ? parts[tasksIdx + 1] : null;
  return { projId, tId };
};

const TaskDetail = () => {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState("");

  // Message box state
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const { projId, tId } = parseIdsFromUrl();
      setDebugInfo(`URL parse → projectId=${projId}, taskId=${tId}`);
      console.log("[TaskDetail] parsed:", { projId, tId });

      if (!projId || !tId) {
        throw new Error("Could not read project / task id from the URL");
      }

      const url = `${API}/api/tasks/project/${projId}`;
      console.log("[TaskDetail] fetching:", url);

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load task");
      }

      const found =
        (data.data || []).find((t: Task) => Number(t.id) === Number(tId)) ||
        null;

      if (!found) {
        throw new Error(
          `Task #${tId} not found. Available: [${(data.data || [])
            .map((t: Task) => t.id)
            .join(", ")}]`
        );
      }

      setTask(found);
      setReply(found.teamlead_reply || "");
    } catch (err: any) {
      console.error("[TaskDetail] error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Send reply ---------- */
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    setSendError(null);
    setSendSuccess(false);

    if (!reply.trim()) {
      setSendError("Please type a message.");
      return;
    }

    const stored = localStorage.getItem("teamlead_user");
    const teamlead = stored ? JSON.parse(stored) : null;

    setSending(true);
    try {
      const res = await fetch(`${API}/api/tasks/${task.id}/reply`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reply: reply.trim(),
          teamlead_id: teamlead?.id ?? null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send reply");
      }

      setTask((prev) =>
        prev ? { ...prev, teamlead_reply: reply.trim() } : prev
      );
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 2500);
    } catch (err: any) {
      setSendError(err.message || "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Loading task…
        </div>
        <p className="text-xs text-gray-400">{debugInfo}</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-4">
        <Link
          to="/teamlead/projects"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          <p className="font-semibold mb-1">Could not load task</p>
          <p>{error || "Task not found"}</p>
          <p className="text-xs text-red-700 mt-2">{debugInfo}</p>
        </div>
      </div>
    );
  }

  const overdue =
    task.due_date &&
    task.status !== "COMPLETED" &&
    new Date(task.due_date).getTime() < Date.now() - 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/teamlead/projects/${task.project_id}`}
          className="p-2 rounded hover:bg-gray-100 text-gray-600"
          title="Back to project"
        >
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-2xl font-bold text-[#0c2d67]">Task Details</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        {/* Header */}
        <div>
          <p className="font-mono text-xs text-gray-500">Task #{task.id}</p>
          <h3 className="text-xl font-semibold text-gray-900 mt-1">
            {task.title}
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span
              className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${priorityStyles[task.priority]}`}
            >
              {task.priority} priority
            </span>
            <span
              className={`text-[11px] font-semibold px-2 py-1 rounded-full ${statusStyles[task.status]}`}
            >
              {task.status.replace("_", " ")}
            </span>
            {overdue && (
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700 inline-flex items-center gap-1">
                <AlertTriangle size={11} /> OVERDUE
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="border-t pt-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            Description
          </p>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {task.description || (
              <span className="text-gray-400">No description</span>
            )}
          </p>
        </div>

        {/* Progress Notes from team member */}
        <div className="border-t pt-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1 flex items-center gap-1">
            <MessageSquare size={12} /> Progress Notes (from team member)
          </p>
          {task.progress_notes ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 whitespace-pre-wrap">
              {task.progress_notes}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No progress notes submitted yet.
            </p>
          )}
        </div>

        {/* Previous reply from team lead */}
        {task.teamlead_reply && (
          <div className="border-t pt-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Your Previous Reply
            </p>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-900 whitespace-pre-wrap">
              {task.teamlead_reply}
            </div>
          </div>
        )}

        {/* Fields grid */}
        <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <DetailField
            icon={<FolderKanban size={14} className="text-gray-400" />}
            label="Project"
            value={task.project_name || `Project #${task.project_id}`}
          />
          <DetailField
            icon={<User size={14} className="text-gray-400" />}
            label="Assigned To"
            value={
              task.member_name ? (
                <>
                  <div className="text-gray-800">{task.member_name}</div>
                  {task.member_email && (
                    <div className="text-xs text-gray-500">
                      {task.member_email}
                    </div>
                  )}
                </>
              ) : (
                "—"
              )
            }
          />
          <DetailField
            icon={<User size={14} className="text-gray-400" />}
            label="Assigned By"
            value={task.assigned_by_name || "—"}
          />
          <DetailField
            icon={<Calendar size={14} className="text-gray-400" />}
            label="Due Date"
            value={
              <span className={overdue ? "text-red-600 font-semibold" : ""}>
                {formatDate(task.due_date)}
              </span>
            }
          />
          <DetailField
            icon={<Calendar size={14} className="text-gray-400" />}
            label="Created"
            value={formatDateTime(task.created_at)}
          />
          <DetailField
            icon={<Calendar size={14} className="text-gray-400" />}
            label="Last Updated"
            value={formatDateTime(task.updated_at)}
          />
        </div>

        {/* =====================================================
            Message box — reply to team member
           ===================================================== */}
        <div className="border-t pt-5">
          <p className="text-sm font-semibold text-[#0c2d67] flex items-center gap-2 mb-2">
            <MessageSquare size={16} /> Reply to Team Member
          </p>

          {task.member_name && (
            <p className="text-xs text-gray-500 mb-3">
              Sending to{" "}
              <span className="font-medium text-gray-700">
                {task.member_name}
              </span>
              {task.member_email ? ` · ${task.member_email}` : ""}
            </p>
          )}

          {sendError && (
            <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {sendError}
            </div>
          )}
          {sendSuccess && (
            <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 inline-flex items-center gap-2">
              <CheckCircle2 size={14} /> Reply sent — team member notified.
            </div>
          )}

          <form onSubmit={handleSendReply} className="space-y-3">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67] text-sm"
              placeholder="Write a message to the team member about this task…"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-5 py-2 rounded-lg hover:bg-[#0a2454] disabled:opacity-60 text-sm"
              >
                <Send size={15} />
                {sending ? "Sending…" : "Send Reply"}
              </button>
              <p className="text-xs text-gray-500">
                The team member will receive a notification.
              </p>
            </div>
          </form>
        </div>

        {/* Quick links */}
        <div className="border-t pt-4 flex flex-wrap gap-3">
          <Link
            to={`/teamlead/projects/${task.project_id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 text-sm"
          >
            <ListChecks size={16} /> Back to Project
          </Link>
        </div>
      </div>
    </div>
  );
};

const DetailField = ({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1 flex items-center gap-1">
      {icon} {label}
    </p>
    <p className="text-sm text-gray-800">
      {value || <span className="text-gray-400">—</span>}
    </p>
  </div>
);

export default TaskDetail;