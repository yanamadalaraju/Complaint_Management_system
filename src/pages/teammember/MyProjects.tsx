// src/pages/teammember/MyProjects.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Eye,
  Loader2,
  AlertTriangle,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  PauseCircle,
  XCircle,
} from "lucide-react";

type Project = {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  customer_name: string | null;
  admin_name: string | null;
  teamlead_id: number | null;
  teamlead_name: string | null;
  teamlead_email: string | null;
  status: string;
  member_ids: number[];
  team_members: { id: number; name: string; email: string }[];
  created_at: string;
  updated_at: string;
};

/* ---------------- Status style helpers ---------------- */
const STATUS_STYLES: Record<string, string> = {
  ASSIGNED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  COMPLETED: "bg-green-50 text-green-700 ring-1 ring-green-200",
  ON_HOLD: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  CLOSED: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  ASSIGNED: Clock,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle2,
  ON_HOLD: PauseCircle,
  CLOSED: XCircle,
};

const formatDate = (v: string | null) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const MyProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");

  // ---- Read logged-in team member ----
  const memberRaw =
    typeof window !== "undefined"
      ? localStorage.getItem("teammember_user")
      : null;
  const member = memberRaw ? JSON.parse(memberRaw) : null;
  const memberId: number | null = member?.id ?? null;

  // ---------- Fetch projects ----------
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:5000/api/projects");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load projects");
      }

      // Keep only the projects this member is assigned to
      const mine = (data.data || []).filter(
        (p: Project) =>
          Array.isArray(p.member_ids) &&
          memberId !== null &&
          p.member_ids.includes(memberId)
      );

      setProjects(mine);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  // ---------- Filter ----------
  const filtered = useMemo(() => {
    if (statusFilter === "all") return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  // ---------- Stats ----------
  const stats = useMemo(
    () => ({
      total: projects.length,
      active: projects.filter((p) => p.status === "IN_PROGRESS").length,
      completed: projects.filter((p) => p.status === "COMPLETED").length,
      pending: projects.filter((p) => p.status === "ASSIGNED").length,
    }),
    [projects]
  );

  /* ============================================================
     RENDER
     ============================================================ */
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center gap-3 text-gray-500">
        <Loader2 size={24} className="animate-spin" />
        <p className="text-sm">Loading your projects…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center gap-3 text-red-600">
        <AlertTriangle size={24} />
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchProjects}
          className="mt-2 px-4 py-2 rounded-lg border border-red-200 text-sm hover:bg-red-50"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0c2d67] flex items-center gap-2">
            <FolderKanban size={22} /> My Projects
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Projects you are assigned to as a team member.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0c2d67]/20"
        >
          <option value="all">All Statuses</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: FolderKanban, color: "text-[#0c2d67] bg-blue-50" },
          { label: "In Progress", value: stats.active, icon: Clock, color: "text-amber-600 bg-amber-50" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
          { label: "Pending", value: stats.pending, icon: PauseCircle, color: "text-blue-600 bg-blue-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
          >
            <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </span>
            <div>
              <p className="text-2xl font-bold text-gray-800 leading-none">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-14 flex flex-col items-center gap-3 text-gray-400">
            <FolderKanban size={34} />
            <p className="text-sm font-medium text-gray-600">
              No projects assigned to you yet
            </p>
            <p className="text-xs">
              {projects.length === 0
                ? "When a team lead assigns you to a project, it will appear here."
                : "Try changing the status filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Team Lead</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Start</th>
                  <th className="px-4 py-3 font-semibold">End</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const StatusIcon = STATUS_ICONS[p.status] ?? CheckCircle2;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 transition">
                      {/* Project name + customer */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        {p.customer_name && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Customer: {p.customer_name}
                          </p>
                        )}
                        {/* Team member avatars (all assigned) */}
                        {p.team_members?.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5">
                            {p.team_members.slice(0, 3).map((m) => (
                              <span
                                key={m.id}
                                title={m.name}
                                className="w-5 h-5 rounded-full bg-gradient-to-br from-[#0c2d67] to-blue-500 text-white text-[9px] font-bold flex items-center justify-center"
                              >
                                {m.name
                                  .split(/\s+/)
                                  .slice(0, 2)
                                  .map((n) => n[0]?.toUpperCase())
                                  .join("")}
                              </span>
                            ))}
                            {p.team_members.length > 3 && (
                              <span className="text-[10px] text-gray-500 ml-1">
                                +{p.team_members.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Team Lead */}
                      <td className="px-4 py-3">
                        {p.teamlead_name ? (
                          <div>
                            <p className="text-gray-800 font-medium">
                              {p.teamlead_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {p.teamlead_email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Unassigned</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            STATUS_STYLES[p.status] ?? STATUS_STYLES.CLOSED
                          }`}
                        >
                          <StatusIcon size={12} />
                          {p.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Start */}
                      <td className="px-4 py-3 text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          {formatDate(p.start_date)}
                        </span>
                      </td>

                      {/* End */}
                      <td className="px-4 py-3 text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          {formatDate(p.end_date)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/teammember/projects/${p.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0c2d67] text-white hover:bg-[#0a2450] transition"
                            title="View project"
                          >
                            <Eye size={14} /> View
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

        {/* Footer summary */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t text-xs text-gray-500 flex items-center justify-between">
            <span>
              Showing <span className="font-medium text-gray-700">{filtered.length}</span>{" "}
              of <span className="font-medium text-gray-700">{projects.length}</span>{" "}
              project{projects.length > 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users size={12} />
              Logged in as {member?.name ?? "Team Member"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjects;