// src/pages/customer/ProjectHistory.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  CalendarDays,
  Ticket as TicketIcon,
  FolderKanban,
  UserCog,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

/* ---------------- Types ---------------- */
type Ticket = {
  id: number;
  ticket_id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  customer_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  assigned_to: number | null;
  assigned_by: number | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_name: string | null;
  assigned_to_email: string | null;
  assigned_by_name: string | null;
  assigned_by_email: string | null;
  resolution_notes: string | null;
  project_id: number | null;
  project_name: string | null;
};

type ProjectMember = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
};

type Project = {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  customer_id: number | null;
  customer_name: string | null;
  admin_id: number | null;
  admin_name: string | null;
  admin_email?: string | null;
  teamlead_id: number | null;
  teamlead_name: string | null;
  teamlead_email: string | null;
  status: string;
  progress_notes: string | null;
  customer_response: string | null;
  customer_status: string | null;
  member_ids: string | null;
  team_members: ProjectMember[];
  created_at: string;
  updated_at: string;
};

/* ---------------- Helpers ---------------- */
const statusColor = (status: string) => {
  switch (status) {
    case "OPEN":
      return "bg-yellow-100 text-yellow-700";
    case "ASSIGNED":
      return "bg-blue-100 text-blue-700";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-700";
    case "RESOLVED":
      return "bg-green-100 text-green-700";
    case "CLOSED":
      return "bg-gray-200 text-gray-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/**
 * Resolve who is actually assigned to a ticket.
 * Falls back to project-level teamlead / admin when ticket-level fields are null.
 */
const resolveAssignees = (t: Ticket, p: Project | null) => {
  const teamLeadName =
    t.assigned_to_name || p?.teamlead_name || null;
  const teamLeadEmail =
    t.assigned_to_email || p?.teamlead_email || null;

  const adminName =
    t.assigned_by_name || p?.admin_name || null;
  const adminEmail =
    t.assigned_by_email || p?.admin_email || null;

  return { teamLeadName, teamLeadEmail, adminName, adminEmail };
};

/* ---------------- Component ---------------- */
const ProjectHistory = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const numericProjectId = projectId ? Number(projectId) : null;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Fetch ---------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const stored = localStorage.getItem("customer_user");
        const customer = stored ? JSON.parse(stored) : null;

        if (!customer?.id || !numericProjectId) {
          setTickets([]);
          setProject(null);
          return;
        }

        const [tRes, pRes] = await Promise.all([
          fetch(`${BASE_URL}/api/tickets?customer_id=${customer.id}`),
          fetch(`${BASE_URL}/api/projects`),
        ]);

        const tData = await tRes.json();
        const pData = await pRes.json();

        if (cancelled) return;

        if (!tRes.ok || !tData.success) {
          throw new Error(tData.message || "Failed to load tickets");
        }

        const allTickets: Ticket[] = tData.data || [];
        const allProjects: Project[] = pData?.success ? pData.data : [];

        setTickets(allTickets);
        setProject(
          allProjects.find((p) => p.id === numericProjectId) ?? null
        );
      } catch (err: any) {
        if (!cancelled)
          setError(err.message || "Failed to load project history");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [numericProjectId]);

  /* ---------- Grouped data (with project fallback) ---------- */
  const grouped = useMemo(() => {
    if (!numericProjectId) return null;

    const projectTickets = tickets.filter(
      (t) => t.project_id === numericProjectId
    );

    // Unique team leads: prefer ticket-level, else project-level
    const teamLeadsMap = new Map<
      string,
      { name: string | null; email: string | null }
    >();
    // Unique admins: prefer ticket-level, else project-level
    const adminsMap = new Map<
      string,
      { name: string | null; email: string | null }
    >();

    projectTickets.forEach((t) => {
      const r = resolveAssignees(t, project);
      if (r.teamLeadName) {
        teamLeadsMap.set(r.teamLeadName, {
          name: r.teamLeadName,
          email: r.teamLeadEmail,
        });
      }
      if (r.adminName) {
        adminsMap.set(r.adminName, {
          name: r.adminName,
          email: r.adminEmail,
        });
      }
    });

    // If project has a team lead / admin but no ticket used it yet, still show
    if (project?.teamlead_name && teamLeadsMap.size === 0) {
      teamLeadsMap.set(project.teamlead_name, {
        name: project.teamlead_name,
        email: project.teamlead_email,
      });
    }
    if (project?.admin_name && adminsMap.size === 0) {
      adminsMap.set(project.admin_name, {
        name: project.admin_name,
        email: project.admin_email ?? null,
      });
    }

    const openTickets = projectTickets.filter((t) => t.status === "OPEN");
    const closedTickets = projectTickets.filter(
      (t) => t.status === "RESOLVED" || t.status === "CLOSED"
    );

    return {
      projectTickets,
      openTickets,
      closedTickets,
      teamLeads: Array.from(teamLeadsMap.values()),
      admins: Array.from(adminsMap.values()),
    };
  }, [numericProjectId, tickets, project]);

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-10 flex items-center justify-center text-gray-500 gap-2">
        <Loader2 className="animate-spin" size={18} /> Loading project
        history…
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-2 text-red-700">
          <AlertTriangle size={18} /> {error}
        </div>
      </div>
    );
  }

  if (!grouped) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-gray-500">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
      >
        <ArrowLeft size={16} /> Back to My Tickets
      </button>

      {/* Title */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0c2d67] flex items-center gap-2">
            <FolderKanban size={22} /> Project History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {project?.name ?? "Unknown project"}{" "}
            <span className="text-gray-400">
              (Project #{numericProjectId})
            </span>
          </p>
        </div>
        {project && (
          <span
            className={`text-xs px-3 py-1 rounded-full ${statusColor(
              project.status
            )}`}
          >
            {project.status}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Tickets"
          value={grouped.projectTickets.length}
          color="bg-blue-50 text-blue-700"
          icon={<TicketIcon size={14} />}
        />
        <StatCard
          label="Open"
          value={grouped.openTickets.length}
          color="bg-yellow-50 text-yellow-700"
          icon={<Clock size={14} />}
        />
        <StatCard
          label="Resolved / Closed"
          value={grouped.closedTickets.length}
          color="bg-green-50 text-green-700"
          icon={<CheckCircle2 size={14} />}
        />
        <StatCard
          label="Team Members"
          value={project?.team_members?.length ?? 0}
          color="bg-purple-50 text-purple-700"
          icon={<Users size={14} />}
        />
      </div>

      {/* Project info */}
      {project && (
        <div className="bg-white rounded-xl border p-4 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <FolderKanban size={14} className="text-[#0c2d67]" />
            <span className="font-semibold text-gray-800">
              {project.name}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor(
                project.status
              )}`}
            >
              {project.status}
            </span>
          </div>
          {project.description && (
            <p className="text-gray-500">{project.description}</p>
          )}
          <div className="flex flex-wrap gap-3 pt-1 text-gray-500">
            <span>
              <CalendarDays size={11} className="inline mr-1" />
              Start: {formatDate(project.start_date)}
            </span>
            <span>
              <CalendarDays size={11} className="inline mr-1" />
              End: {formatDate(project.end_date)}
            </span>
          </div>
          {project.progress_notes && (
            <p className="text-blue-700 pt-1">
              Progress notes: {project.progress_notes}
            </p>
          )}
          {project.customer_response && (
            <p className="text-purple-700 pt-1">
              Your reply: {project.customer_response}{" "}
              {project.customer_status && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100">
                  {project.customer_status}
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* People involved */}
      <div className="grid sm:grid-cols-3 gap-3">
        <PeopleCard
          icon={<UserCog size={14} />}
          title="Admins (assigned by)"
          people={grouped.admins}
          empty="No admin has assigned yet"
          tone="gray"
        />
        <PeopleCard
          icon={<UserCog size={14} />}
          title="Team Leads (assigned to)"
          people={grouped.teamLeads}
          empty="No team lead assigned yet"
          tone="blue"
        />
        <PeopleCard
          icon={<Users size={14} />}
          title="Team Members"
          people={
            project?.team_members?.map((m) => ({
              name: m.name,
              email: m.email,
            })) ?? []
          }
          empty="No team members assigned yet"
          tone="purple"
        />
      </div>

      {/* Tickets in this project */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <TicketIcon size={14} /> All tickets raised under this project
          </h4>
        </div>

        {grouped.projectTickets.length === 0 ? (
          <p className="p-6 text-xs text-gray-500 italic text-center">
            No tickets for this project yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-3 py-2">Ticket</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Opened</th>
                  <th className="px-3 py-2">Closed</th>
                  <th className="px-3 py-2">Admin</th>
                  <th className="px-3 py-2">Team Lead</th>
                </tr>
              </thead>
              <tbody>
                {grouped.projectTickets.map((t) => {
                  const isClosed =
                    t.status === "RESOLVED" || t.status === "CLOSED";
                  const r = resolveAssignees(t, project);
                  return (
                    <tr key={t.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <Link
                          to={`/customer/tickets/${t.id}`}
                          className="font-mono text-[11px] text-blue-600 hover:underline"
                        >
                          {t.ticket_id}
                        </Link>
                        <p className="text-gray-800">{t.subject}</p>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        {formatDate(t.created_at)}
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        {isClosed ? formatDate(t.updated_at) : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {r.adminName ? (
                          <span
                            title={r.adminEmail ?? ""}
                            className="text-gray-700"
                          >
                            {r.adminName}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {r.teamLeadName ? (
                          <span
                            title={r.teamLeadEmail ?? ""}
                            className="text-blue-700"
                          >
                            {r.teamLeadName}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">—</span>
                        )}
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

/* ---------------- Small components ---------------- */
const StatCard = ({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon?: React.ReactNode;
}) => (
  <div className={`rounded-lg px-3 py-2 ${color}`}>
    <p className="text-[10px] uppercase tracking-wide opacity-80 flex items-center gap-1">
      {icon}
      {label}
    </p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

const PeopleCard = ({
  icon,
  title,
  people,
  empty,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  people: { name: string | null; email?: string | null }[];
  empty: string;
  tone: "gray" | "blue" | "purple";
}) => {
  const toneColor: Record<typeof tone, string> = {
    gray: "bg-gray-50 border-gray-200",
    blue: "bg-blue-50 border-blue-100",
    purple: "bg-purple-50 border-purple-100",
  };
  return (
    <div className={`rounded-lg border p-3 ${toneColor[tone]}`}>
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-1">
        {icon}
        {title}
      </div>
      {people.length === 0 ? (
        <p className="text-[11px] text-gray-500 italic">{empty}</p>
      ) : (
        <ul className="space-y-1">
          {people.map((p, i) => (
            <li
              key={`${p.name}-${i}`}
              className="text-xs text-gray-700"
              title={p.email ?? ""}
            >
              {p.name ?? "—"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectHistory;