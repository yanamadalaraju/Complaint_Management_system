// src/pages/teammember/MyTasks.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ListChecks,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Calendar,
  FolderKanban,
  RefreshCw,
  Eye,
  CheckCircle,
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
  created_at: string;
  updated_at: string;
  project_name: string | null;
  member_name: string | null;
  member_email: string | null;
  assigned_by_name: string | null;
};

const API = `${BASE_URL}`;

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

const isOverdue = (d: string | null, status: Task["status"]) => {
  if (!d || status === "COMPLETED") return false;
  return new Date(d).getTime() < Date.now() - 24 * 60 * 60 * 1000;
};

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

/* ---------- component ---------- */
const MyTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "ALL" | "TODO" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED"
  >("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const memberRaw =
    typeof window !== "undefined"
      ? localStorage.getItem("teammember_user")
      : null;
  const member = memberRaw ? JSON.parse(memberRaw) : null;
  const memberId: number | null = member?.id ?? null;

  /* ---------- fetch ---------- */
  const fetchTasks = async (showSpinner = true) => {
    if (!memberId) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }
    try {
      if (showSpinner) setLoading(true);
      setError(null);

      const res = await fetch(`${API}/api/tasks/member/${memberId}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load tasks");
      }
      setTasks(data.data || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- update status (inline dropdown) ---------- */
  const updateStatus = async (taskId: number, newStatus: Task["status"]) => {
    const current = tasks.find((t) => t.id === taskId);
    if (current && current.status === newStatus) return;

    setUpdatingId(taskId);
    try {
      const res = await fetch(`${API}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update task");
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------- derived ---------- */
  const counts = useMemo(() => {
    return {
      ALL: tasks.length,
      TODO: tasks.filter((t) => t.status === "TODO").length,
      IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      COMPLETED: tasks.filter((t) => t.status === "COMPLETED").length,
      BLOCKED: tasks.filter((t) => t.status === "BLOCKED").length,
    };
  }, [tasks]);

  const filtered = useMemo(
    () => (filter === "ALL" ? tasks : tasks.filter((t) => t.status === filter)),
    [tasks, filter]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks(false);
  };

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0c2d67] flex items-center gap-2">
            <ListChecks size={22} /> My Tasks
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tasks assigned to you across all your projects.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="In Progress"
          value={counts.IN_PROGRESS}
          icon={<Loader2 size={16} />}
          tone="purple"
        />
        <StatCard
          label="To Do"
          value={counts.TODO}
          icon={<Clock size={16} />}
          tone="gray"
        />
        <StatCard
          label="Blocked"
          value={counts.BLOCKED}
          icon={<AlertTriangle size={16} />}
          tone="red"
        />
        <StatCard
          label="Completed"
          value={counts.COMPLETED}
          icon={<CheckCircle2 size={16} />}
          tone="green"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          ["ALL", "TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"] as const
        ).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filter === f
                ? "bg-[#0c2d67] text-white border-[#0c2d67]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.replace("_", " ")}{" "}
            <span className="opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading tasks…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <ListChecks size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              {filter === "ALL"
                ? "You have no tasks yet."
                : `No tasks with status "${filter.replace("_", " ")}".`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">ID</th>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3 whitespace-nowrap">Project</th>
                  <th className="px-4 py-3 whitespace-nowrap">Priority</th>
                  <th className="px-4 py-3 whitespace-nowrap">Due Date</th>
                  <th className="px-4 py-3 whitespace-nowrap">Assigned By</th>
                  <th className="px-4 py-3 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap">Update Status</th>
                  <th className="px-4 py-3 whitespace-nowrap text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const overdue = isOverdue(t.due_date, t.status);
                  const isUpdating = updatingId === t.id;
                  const isCompleted = t.status === "COMPLETED";

                  return (
                    <tr
                      key={t.id}
                      className="border-t hover:bg-gray-50 align-top"
                    >
                      {/* ID */}
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        #{t.id}
                      </td>

                      {/* Task */}
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-medium text-gray-900">
                          {t.title}
                        </div>
                        {t.description && (
                          <div className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap">
                            {t.description}
                          </div>
                        )}
                      </td>

                      {/* Project */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-gray-700">
                          <FolderKanban size={12} className="text-gray-400" />
                          {t.project_name || `Project #${t.project_id}`}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityStyles[t.priority]}`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      {/* Due date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {t.due_date ? (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              overdue
                                ? "text-red-600 font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            <Calendar size={12} className="text-gray-400" />
                            {formatDate(t.due_date)}
                            {overdue && (
                              <span className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                OVERDUE
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Assigned by */}
                      <td className="px-4 py-3 text-gray-700">
                        {t.assigned_by_name || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Status pill */}
                      <td className="px-4 py-3">
                        <span
                          className={`text-[11px] font-semibold px-2 py-1 rounded-full ${statusStyles[t.status]}`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Status dropdown */}
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2">
                          {isUpdating && (
                            <Loader2
                              size={14}
                              className="animate-spin text-gray-400"
                            />
                          )}
                          <select
                            value={t.status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              updateStatus(
                                t.id,
                                e.target.value as Task["status"]
                              )
                            }
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#0c2d67] cursor-pointer disabled:opacity-60 ${statusStyles[t.status]}`}
                          >
                            <option value="TODO">TODO</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="BLOCKED">BLOCKED</option>
                            <option value="COMPLETED">COMPLETED</option>
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {/* View → /teammember/tasks/:id */}
                          <Link
                            to={`/teammember/tasks/${t.id}`}
                            title="View task"
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                          >
                            <Eye size={16} />
                          </Link>

                          {/* Resolve → /teammember/tasks/:id/resolve */}
                          <Link
                            to={`/teammember/tasks/${t.id}/resolve`}
                            title={
                              isCompleted
                                ? "Already completed"
                                : "Resolve task"
                            }
                            className={`p-2 rounded-lg transition ${
                              isCompleted
                                ? "text-gray-400 hover:bg-gray-100"
                                : "text-green-600 hover:bg-green-50"
                            }`}
                          >
                            <CheckCircle size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- stat card ---------- */
const StatCard = ({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "gray" | "purple" | "red" | "green";
}) => {
  const toneMap = {
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    red: "bg-red-50 text-red-700 border-red-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };
  return (
    <div className={`rounded-xl border p-4 ${toneMap[tone]}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium uppercase tracking-wide opacity-80">
          {label}
        </p>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default MyTasks;