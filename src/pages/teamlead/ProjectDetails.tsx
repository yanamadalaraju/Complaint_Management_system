// src/pages/teamlead/ProjectDetails.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  MessageSquare,
  Clock,
  Send,
  Users,
  Mail,
  Phone,
  Plus,
  X,
  ListChecks,
  Trash2,
} from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";
import SearchSelect from "@/components/ui/SearchSelect";

type TeamMember = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
};

type Project = {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  customer_id: number | null;
  admin_id: number | null;
  teamlead_id: number | null;
  member_ids: number[];
  status: string;
  progress_notes: string | null;
  customer_response: string | null;
  customer_status: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_email: string | null;
  admin_name: string | null;
  admin_email: string | null;
  teamlead_name: string | null;
  teamlead_email: string | null;
  team_members: TeamMember[];
};

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
  created_at: string;
  updated_at: string;
  member_name: string | null;
  member_email: string | null;
  assigned_by_name: string | null;
};

/* ---------- helpers ---------- */
const formatDate = (d: string | null) => {
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const formatDateTime = (d: string | null) => {
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const projectStatusColor = (status: string) => {
  switch (status) {
    case "ASSIGNED": return "bg-blue-100 text-blue-700";
    case "IN_PROGRESS": return "bg-purple-100 text-purple-700";
    case "COMPLETED": return "bg-green-100 text-green-700";
    case "ON_HOLD": return "bg-yellow-100 text-yellow-700";
    case "CLOSED": return "bg-gray-200 text-gray-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

const customerStatusColor = (status: string | null) => {
  switch (status) {
    case "PENDING": return "bg-yellow-100 text-yellow-700";
    case "RESOLVED": return "bg-green-100 text-green-700";
    case "REJECTED": return "bg-red-100 text-red-700";
    case "REVISION_REQUESTED": return "bg-orange-100 text-orange-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

const taskStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED": return "bg-green-100 text-green-700";
    case "IN_PROGRESS": return "bg-purple-100 text-purple-700";
    case "BLOCKED": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const priorityColor = (p: string) => {
  switch (p) {
    case "HIGH": return "bg-red-50 text-red-700 border-red-200";
    case "MEDIUM": return "bg-yellow-50 text-yellow-700 border-yellow-200";
    default: return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "").join("") || "?";

const Field = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
      {label}
    </p>
    <div className="text-sm text-gray-900">
      {value || <span className="text-gray-400">—</span>}
    </div>
  </div>
);

/* ---------- Assign Task Modal ---------- */
type AssignTaskModalProps = {
  projectId: number;
  teamMembers: TeamMember[];
  onClose: () => void;
  onCreated: () => void;
};

const AssignTaskModal = ({
  projectId,
  teamMembers,
  onClose,
  onCreated,
}: AssignTaskModalProps) => {
  const [memberId, setMemberId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErr(null);
    if (!memberId) {
      setErr("Please select a team member.");
      return;
    }
    if (!title.trim()) {
      setErr("Please enter a task title.");
      return;
    }

    const stored = localStorage.getItem("teamlead_user");
    const teamlead = stored ? JSON.parse(stored) : null;
    if (!teamlead?.id) {
      setErr("You are not logged in.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          member_id: memberId,
          assigned_by: teamlead.id,
          title: title.trim(),
          description: description.trim() || null,
          priority,
          due_date: dueDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create task");
      }
      onCreated();
      onClose();
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-semibold text-[#0c2d67] flex items-center gap-2">
            <ListChecks size={18} /> Assign Task
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {err && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {err}
            </div>
          )}

          {/* Searchable Team Member picker */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Assign to <span className="text-red-500">*</span>
            </label>
            <SearchSelect
              options={teamMembers.map((m) => ({
                value: m.id,
                label: m.name,
                sublabel: m.email,
              }))}
              value={memberId}
              onChange={(v) => setMemberId(v === "" ? "" : Number(v))}
              placeholder="— Select team member —"
              emptyText="No team members available"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
              placeholder="e.g. Build login page"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
              placeholder="Task details…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#0c2d67] text-white hover:bg-[#0a2454] disabled:opacity-60"
          >
            {saving ? "Assigning…" : "Assign Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Main ---------- */
const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const stored = localStorage.getItem("teamlead_user");
        const teamlead = stored ? JSON.parse(stored) : null;
        if (!teamlead?.id) throw new Error("You are not logged in as a team lead.");

        let found: Project | null = null;
        try {
          const res = await fetch(`${BASE_URL}/api/projects/${id}`);
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            found = Array.isArray(data.data) ? data.data[0] : data.data;
          }
        } catch {}

        if (!found) {
          const res = await fetch(`${BASE_URL}/api/projects`);
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to load project");
          }
          found = (data.data || []).find((p: Project) => Number(p.id) === Number(id)) || null;
        }

        if (!found) throw new Error("Project not found.");
        if (Number(found.teamlead_id) !== Number(teamlead.id)) {
          throw new Error("This project is not assigned to you.");
        }

        setProject(found);
        setNotes(found.progress_notes || "");
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const fetchTasks = async () => {
    if (!id) return;
    try {
      setTasksLoading(true);
      const res = await fetch(`${BASE_URL}/api/tasks/project/${id}`);
      const data = await res.json();
      if (res.ok && data.success) setTasks(data.data || []);
    } catch (e) {
      console.error("Failed to load tasks", e);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (project) fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  const handleResolveAndNotify = async () => {
    if (!notes.trim()) { alert("Please add progress notes before notifying"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED", progress_notes: notes.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update project");
      alert("Project re-resolved ✅ Customer and admin will be notified.");
      const fresh = await fetch(`${BASE_URL}/api/projects/${id}`);
      const freshData = await fresh.json();
      if (fresh.ok && freshData.success && freshData.data) {
        const p = Array.isArray(freshData.data) ? freshData.data[0] : freshData.data;
        setProject(p);
        setNotes(p.progress_notes || "");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: Task["status"]) => {
    setUpdatingTaskId(taskId);
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update task");
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${taskId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete task");
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const needsAttention =
    project?.customer_status === "PENDING" || project?.status === "COMPLETED";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/teamlead/projects" className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Back">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-2xl font-bold text-[#0c2d67]">Project Details</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading project…</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : project ? (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
                <p className="text-xs font-mono text-gray-500">Project #{project.id}</p>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${projectStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${customerStatusColor(project.customer_status)}`}>
                    Customer: {project.customer_status || "—"}
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                {project.description || "No description provided."}
              </p>
            </div>

            {/* Team Members */}
            <div className="border-t pt-6">
              <p className="text-sm font-semibold text-[#0c2d67] flex items-center gap-2 mb-3">
                <Users size={16} /> Assigned Team Members
                <span className="ml-1 text-xs font-normal text-gray-500">
                  ({project.team_members?.length ?? 0})
                </span>
              </p>
              {project.team_members?.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No team members are assigned to this project yet.
                </p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.team_members.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                      <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0c2d67] to-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {initialsOf(m.name)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{m.name}</p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                          <Mail size={11} /> {m.email}
                        </p>
                        {m.phone && (
                          <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                            <Phone size={11} /> {m.phone}
                          </p>
                        )}
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${m.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {m.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Assigned Tasks */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <p className="text-sm font-semibold text-[#0c2d67] flex items-center gap-2">
                  <ListChecks size={16} /> Assigned Tasks
                  <span className="ml-1 text-xs font-normal text-gray-500">
                    ({tasks.length})
                  </span>
                </p>
                {(project.team_members?.length ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(true)}
                    className="inline-flex items-center gap-1 text-xs bg-[#0c2d67] text-white px-3 py-1.5 rounded-lg hover:bg-[#0a2454]"
                  >
                    <Plus size={14} /> Assign Task
                  </button>
                )}
              </div>

              {tasksLoading ? (
                <p className="text-sm text-gray-500">Loading tasks…</p>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {(project.team_members?.length ?? 0) === 0
                    ? "Assign team members first to start creating tasks."
                    : "No tasks assigned yet. Click Assign Task to get started."}
                </p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((t) => (
                    <Link
                      key={t.id}
                      to={`/teamlead/projects/${id}/tasks/${t.id}`}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-100/70 cursor-pointer transition no-underline"
                      title="Click to view details & progress notes"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-800">{t.title}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityColor(t.priority)}`}>
                            {t.priority}
                          </span>
                          {t.progress_notes && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              📝 Notes
                            </span>
                          )}
                        </div>
                        {t.description && (
                          <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{t.description}</p>
                        )}
                        <p className="text-[11px] text-gray-500 mt-1">
                          👤 {t.member_name || "Unknown"}
                          {t.member_email ? ` · ${t.member_email}` : ""}
                          {t.due_date ? ` · Due: ${formatDate(t.due_date)}` : ""}
                        </p>
                      </div>

                      <div
                        className="flex items-center gap-2 shrink-0"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      >
                        <select
                          value={t.status}
                          disabled={updatingTaskId === t.id}
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleUpdateTaskStatus(t.id, e.target.value as Task["status"]);
                          }}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[#0c2d67] cursor-pointer ${taskStatusColor(t.status)}`}
                        >
                          <option value="TODO">TODO</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="BLOCKED">BLOCKED</option>
                        </select>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteTask(t.id);
                          }}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500"
                          title="Delete task"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </Link>
                  ))}
                </ul>
              )}
            </div>

            {/* Progress notes */}
            {project.progress_notes && (
              <div className="border-t pt-6">
                <p className="text-sm font-semibold text-[#0c2d67] flex items-center gap-2 mb-2">
                  <CheckCircle size={16} /> Progress Notes (Team Lead)
                </p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 whitespace-pre-wrap">
                  {project.progress_notes}
                </div>
              </div>
            )}

            {/* Customer response */}
            {project.customer_response && (
              <div className="border-t pt-6">
                <p className="text-sm font-semibold text-[#0c2d67] flex items-center gap-2 mb-2">
                  <MessageSquare size={16} /> Customer Response
                </p>
                <div
                  className={`p-4 rounded-lg text-sm whitespace-pre-wrap border ${
                    project.customer_status === "RESOLVED"
                      ? "bg-green-50 border-green-200 text-green-900"
                      : project.customer_status === "PENDING"
                      ? "bg-yellow-50 border-yellow-200 text-yellow-900"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  }`}
                >
                  {project.customer_response}
                </div>
              </div>
            )}

            {/* Fields grid */}
            <div className="border-t pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Start Date" value={formatDate(project.start_date)} />
              <Field label="End Date" value={formatDate(project.end_date)} />
              <Field label="Customer" value={project.customer_name && (
                <>
                  <div>{project.customer_name}</div>
                  {project.customer_email && <div className="text-xs text-gray-500">{project.customer_email}</div>}
                </>
              )} />
              <Field label="Admin" value={project.admin_name && (
                <>
                  <div>{project.admin_name}</div>
                  {project.admin_email && <div className="text-xs text-gray-500">{project.admin_email}</div>}
                </>
              )} />
              <Field label="Team Lead" value={project.teamlead_name && (
                <>
                  <div>{project.teamlead_name}</div>
                  {project.teamlead_email && <div className="text-xs text-gray-500">{project.teamlead_email}</div>}
                </>
              )} />
              <Field label="Created At" value={formatDateTime(project.created_at)} />
              <Field label="Last Updated" value={formatDateTime(project.updated_at)} />
            </div>

            {/* Re-resolve */}
            {needsAttention && (
              <div className="border-t pt-6 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Update Progress Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
                    placeholder="Explain what you fixed to close the customer's remaining work…"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The customer and admin will receive a notification when you
                    click <strong>Re-resolve & Notify</strong>.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleResolveAndNotify}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                  >
                    <Send size={16} /> {saving ? "Sending…" : "Re-resolve & Notify"}
                  </button>
                  <Link to="/teamlead/projects" className="px-6 py-2 rounded-lg border hover:bg-gray-50">
                    Cancel
                  </Link>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="border-t pt-6">
              <p className="text-sm font-semibold text-[#0c2d67] flex items-center gap-2 mb-3">
                <Clock size={16} /> Timeline
              </p>
              <ul className="text-xs text-gray-600 space-y-2">
                <li>✅ Created on {formatDateTime(project.created_at)}</li>
                {project.progress_notes && <li>💬 You added progress notes</li>}
                {project.customer_response && (
                  <li>📩 Customer responded — status: {project.customer_status}</li>
                )}
                <li>🕒 Last updated {formatDateTime(project.updated_at)}</li>
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      {showTaskModal && project && (
        <AssignTaskModal
          projectId={project.id}
          teamMembers={project.team_members || []}
          onClose={() => setShowTaskModal(false)}
          onCreated={fetchTasks}
        />
      )}
    </div>
  );
};

export default ProjectDetails;