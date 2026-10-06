// src/pages/teammember/ProjectDetails.tsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FolderKanban,
  Loader2,
  AlertTriangle,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  PauseCircle,
  XCircle,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  FileText,
  MessageSquare,
} from "lucide-react";

type TeamMember = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
  status?: string;
  created_at?: string;
};

type ProjectDetail = {
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

const formatDate = (v: string | null | undefined) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (v: string | null | undefined) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

const TeamMemberProjectDetails = () => {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Read logged-in team member ----
  const memberRaw =
    typeof window !== "undefined"
      ? localStorage.getItem("teammember_user")
      : null;
  const member = memberRaw ? JSON.parse(memberRaw) : null;
  const memberId: number | null = member?.id ?? null;

  // ---------- Fetch project ----------
  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`http://localhost:5000/api/projects/${id}`);
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

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ============================================================
     RENDER
     ============================================================ */
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center gap-3 text-gray-500">
        <Loader2 size={24} className="animate-spin" />
        <p className="text-sm">Loading project…</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link
          to="/teammember/projects"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back to My Projects
        </Link>
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center gap-3 text-red-600">
          <AlertTriangle size={24} />
          <p className="text-sm">{error || "Project not found"}</p>
          <button
            onClick={fetchProject}
            className="mt-2 px-4 py-2 rounded-lg border border-red-200 text-sm hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Only allow members who are assigned to this project
  const isAssigned =
    memberId !== null &&
    Array.isArray(project.member_ids) &&
    project.member_ids.includes(memberId);

  if (!isAssigned) {
    return (
      <div className="space-y-4">
        <Link
          to="/teammember/projects"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back to My Projects
        </Link>
        <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center gap-3 text-gray-400">
          <ShieldCheck size={34} />
          <p className="text-sm font-medium text-gray-600">
            You are not assigned to this project
          </p>
          <p className="text-xs">
            Ask your team lead to add you if you need access.
          </p>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[project.status] ?? CheckCircle2;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        to="/teammember/projects"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0c2d67]"
      >
        <ArrowLeft size={16} /> Back to My Projects
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-[#0c2d67] flex items-center gap-2">
            <FolderKanban size={22} /> {project.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Project #{project.id}
            {project.customer_name ? ` · Customer: ${project.customer_name}` : ""}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            STATUS_STYLES[project.status] ?? STATUS_STYLES.CLOSED
          }`}
        >
          <StatusIcon size={14} />
          {project.status.replace("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---------------- Left column ---------------- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <FileText size={16} className="text-[#0c2d67]" /> Description
            </h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {project.description || "No description provided."}
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-[#0c2d67]" /> Timeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Start Date", value: formatDate(project.start_date) },
                { label: "End Date", value: formatDate(project.end_date) },
                { label: "Created", value: formatDateTime(project.created_at) },
                { label: "Last Updated", value: formatDateTime(project.updated_at) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3"
                >
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress notes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <Clock size={16} className="text-[#0c2d67]" /> Progress Notes
            </h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {project.progress_notes || "No progress notes yet."}
            </p>
          </div>

          {/* Customer feedback */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <MessageSquare size={16} className="text-[#0c2d67]" /> Customer
              Feedback
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">Status:</span>
              <span className="text-xs font-semibold text-gray-700">
                {project.customer_status
                  ? project.customer_status.replace("_", " ")
                  : "—"}
              </span>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {project.customer_response || "No response from the customer yet."}
            </p>
          </div>
        </div>

        {/* ---------------- Right column ---------------- */}
        <div className="space-y-6">
          {/* People */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Building2 size={16} className="text-[#0c2d67]" /> Project
              Contacts
            </h3>

            {/* Team lead */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Team Lead</p>
              {project.teamlead_name ? (
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0c2d67] to-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {initials(project.teamlead_name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {project.teamlead_name}
                    </p>
                    <p className="text-xs text-gray-500 inline-flex items-center gap-1 break-all">
                      <Mail size={11} /> {project.teamlead_email}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-gray-400">Unassigned</span>
              )}
            </div>

            {/* Customer */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Customer</p>
              {project.customer_name ? (
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                    <User size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {project.customer_name}
                    </p>
                    <p className="text-xs text-gray-500 inline-flex items-center gap-1 break-all">
                      <Mail size={11} /> {project.customer_email}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>

            {/* Admin */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Admin</p>
              {project.admin_name ? (
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {project.admin_name}
                    </p>
                    <p className="text-xs text-gray-500 inline-flex items-center gap-1 break-all">
                      <Mail size={11} /> {project.admin_email}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>
          </div>

          {/* Team members */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
              <Users size={16} className="text-[#0c2d67]" /> Team Members
              <span className="ml-auto text-xs font-medium text-gray-500">
                {project.team_members?.length ?? 0}
              </span>
            </h3>

            {project.team_members?.length > 0 ? (
              <ul className="space-y-3">
                {project.team_members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 px-3 py-2.5"
                  >
                    <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0c2d67] to-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {initials(m.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {m.name}
                        {m.id === memberId && (
                          <span className="ml-2 text-[10px] font-semibold text-[#0c2d67] bg-blue-50 px-1.5 py-0.5 rounded">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 inline-flex items-center gap-1 break-all">
                        <Mail size={11} /> {m.email}
                      </p>
                      {m.phone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone size={11} /> {m.phone}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">No team members assigned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberProjectDetails;