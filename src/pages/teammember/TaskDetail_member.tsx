// src/pages/teammember/TaskDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle, Calendar, FolderKanban, User } from "lucide-react";
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

const TaskDetailMember = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

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

  const overdue =
    task.due_date &&
    task.status !== "COMPLETED" &&
    new Date(task.due_date).getTime() < Date.now() - 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h2 className="text-2xl font-bold text-[#0c2d67]">Task Details</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
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
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">
                OVERDUE
              </span>
            )}
          </div>
        </div>

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

        <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            icon={<FolderKanban size={14} className="text-gray-400" />}
            label="Project"
            value={task.project_name || `Project #${task.project_id}`}
          />
          <Field
            icon={<User size={14} className="text-gray-400" />}
            label="Assigned By"
            value={task.assigned_by_name || "—"}
          />
          <Field
            icon={<Calendar size={14} className="text-gray-400" />}
            label="Due Date"
            value={
              <span className={overdue ? "text-red-600 font-semibold" : ""}>
                {formatDate(task.due_date)}
              </span>
            }
          />
        </div>

        {task.status !== "COMPLETED" && (
          <div className="border-t pt-4">
            <button
              onClick={() => navigate(`/teammember/tasks/${task.id}/resolve`)}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
            >
              <CheckCircle size={16} /> Resolve Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({
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

export default TaskDetailMember;