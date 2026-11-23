// src/pages/History.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Ticket as TicketIcon,
  FolderKanban,
  UserCog,
  Users,
  CalendarDays,
  Loader2,
  AlertTriangle,
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
  project_id: number | null;
  project_name: string | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
  assigned_to_email: string | null;
  assigned_by: number | null;
  assigned_by_name: string | null;
  assigned_by_email: string | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
  resolution_notes: string | null;
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

type Task = {
  id: number;
  project_id: number;
  project_name: string;
  member_id: number;
  member_name: string;
  member_email: string;
  assigned_by: number;
  assigned_by_name: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  progress_notes: string | null;
  teamlead_reply: string | null;
  created_at: string;
  updated_at: string;
};

type AnyEvent = {
  id: string;
  kind: "ticket" | "project" | "task";
  title: string;
  subtitle?: string;
  status: string;
  date: string; // ISO string for sorting
  meta: Record<string, any>;
};

/* ---------------- Helpers ---------------- */
const fmtDate = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const safeParse = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const statusColor = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s.includes("resolved") || s.includes("completed") || s.includes("closed"))
    return "bg-green-100 text-green-700 border-green-200";
  if (s.includes("progress") || s.includes("assigned"))
    return "bg-blue-100 text-blue-700 border-blue-200";
  if (s.includes("pending") || s.includes("todo"))
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (s.includes("open"))
    return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
};

const statusIcon = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s.includes("resolved") || s.includes("completed") || s.includes("closed"))
    return <CheckCircle2 size={16} className="text-green-600" />;
  if (s.includes("progress") || s.includes("assigned") || s.includes("open"))
    return <Clock size={16} className="text-blue-600" />;
  return <XCircle size={16} className="text-red-500" />;
};

/* ---------------- Main Component ---------------- */
const History = () => {
  const { pathname } = useLocation();
  const role = pathname.split("/")[1] as
    | "admin"
    | "customer"
    | "teamlead"
    | "teammember";

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------- identify current user -------- */
  const currentUser = useMemo(() => {
    const map: Record<string, string> = {
      admin: "admin_user",
      customer: "customer_user",
      teamlead: "teamlead_user",
      teammember: "teammember_user",
    };
    return safeParse<{ id: number; name: string; email?: string }>(map[role]);
  }, [role]);

  /* -------- fetch everything -------- */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [tRes, pRes, taskRes] = await Promise.all([
          fetch(`${BASE_URL}/api/tickets`),
          fetch(`${BASE_URL}/api/projects`),
          fetch(`${BASE_URL}/api/tasks`),
        ]);

        const tData = await tRes.json();
        const pData = await pRes.json();
        const taskData = await taskRes.json();

        if (cancelled) return;

        setTickets(tData?.success ? tData.data : []);
        setProjects(pData?.success ? pData.data : []);
        setTasks(taskData?.success ? taskData.data : []);
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to load history");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* -------- build the timeline events per role -------- */
  const events: AnyEvent[] = useMemo(() => {
    const out: AnyEvent[] = [];
    const uid = currentUser?.id;

    if (role === "customer") {
      // Tickets I raised
      tickets
        .filter((t) => t.customer_id === uid)
        .forEach((t) =>
          out.push({
            id: `ticket-${t.id}`,
            kind: "ticket",
            title: `${t.ticket_id} — ${t.subject}`,
            subtitle: t.project_name
              ? `Project: ${t.project_name}`
              : "No project linked",
            status: t.status,
            date: t.updated_at || t.created_at,
            meta: { ticket: t },
          })
        );

      // Projects belonging to me
      projects
        .filter((p) => p.customer_id === uid)
        .forEach((p) =>
          out.push({
            id: `project-${p.id}`,
            kind: "project",
            title: `Project: ${p.name}`,
            subtitle: p.teamlead_name
              ? `Team Lead: ${p.teamlead_name}`
              : "Not assigned yet",
            status: p.status,
            date: p.updated_at || p.created_at,
            meta: { project: p },
          })
        );
    }

    if (role === "admin") {
      // All tickets — show who assigned to whom
      tickets.forEach((t) =>
        out.push({
          id: `ticket-${t.id}`,
          kind: "ticket",
          title: `${t.ticket_id} — ${t.subject}`,
          subtitle: t.assigned_to_name
            ? `Assigned to ${t.assigned_to_name}${
                t.assigned_by_name ? ` by ${t.assigned_by_name}` : ""
              }`
            : "Not assigned",
          status: t.status,
          date: t.updated_at || t.created_at,
          meta: { ticket: t },
        })
      );
      projects.forEach((p) =>
        out.push({
          id: `project-${p.id}`,
          kind: "project",
          title: `Project: ${p.name}`,
          subtitle: p.teamlead_name
            ? `Team Lead: ${p.teamlead_name}${
                p.team_members?.length
                  ? ` • Members: ${p.team_members
                      .map((m) => m.name)
                      .join(", ")}`
                  : ""
              }`
            : "No team lead assigned",
          status: p.status,
          date: p.updated_at || p.created_at,
          meta: { project: p },
        })
      );
    }

    if (role === "teamlead") {
      // Tickets assigned to me
      tickets
        .filter((t) => t.assigned_to === uid)
        .forEach((t) =>
          out.push({
            id: `ticket-${t.id}`,
            kind: "ticket",
            title: `${t.ticket_id} — ${t.subject}`,
            subtitle: `Assigned by ${t.assigned_by_name ?? "—"}`,
            status: t.status,
            date: t.updated_at || t.created_at,
            meta: { ticket: t },
          })
        );

      // Projects I lead + who is solving them
      projects
        .filter((p) => p.teamlead_id === uid)
        .forEach((p) =>
          out.push({
            id: `project-${p.id}`,
            kind: "project",
            title: `Project: ${p.name}`,
            subtitle: p.team_members?.length
              ? `Members: ${p.team_members.map((m) => m.name).join(", ")}`
              : "No members assigned",
            status: p.status,
            date: p.updated_at || p.created_at,
            meta: { project: p },
          })
        );

      // Tasks I assigned to members
      tasks
        .filter((t) => t.assigned_by === uid)
        .forEach((t) =>
          out.push({
            id: `task-${t.id}`,
            kind: "task",
            title: `Task: ${t.title}`,
            subtitle: `→ ${t.member_name} on ${t.project_name}`,
            status: t.status,
            date: t.updated_at || t.created_at,
            meta: { task: t },
          })
        );
    }

    if (role === "teammember") {
      // Tasks assigned to me
      tasks
        .filter((t) => t.member_id === uid)
        .forEach((t) =>
          out.push({
            id: `task-${t.id}`,
            kind: "task",
            title: `Task: ${t.title}`,
            subtitle: `Project: ${t.project_name} • Assigned by ${t.assigned_by_name}`,
            status: t.status,
            date: t.updated_at || t.created_at,
            meta: { task: t },
          })
        );
    }

    // newest first
    return out.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [role, currentUser, tickets, projects, tasks]);

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-10 flex items-center justify-center text-gray-500 gap-2">
        <Loader2 className="animate-spin" size={18} /> Loading history…
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-2 text-red-700">
        <AlertTriangle size={18} /> {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="text-[#0c2d67]" size={22} />
        <h1 className="text-xl font-semibold text-[#0c2d67]">
          History{" "}
          <span className="text-sm font-normal text-gray-500">
            ({role})
          </span>
        </h1>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-500 text-sm">
          No history records yet.
        </div>
      ) : (
        <ol className="relative border-l-2 border-gray-200 ml-3 space-y-6">
          {events.map((ev) => (
            <li key={ev.id} className="ml-6">
              {/* Timeline dot */}
              <span className="absolute -left-[11px] flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-[#0c2d67]">
                {statusIcon(ev.status)}
              </span>

              <div className="bg-white rounded-xl border px-4 py-3 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 text-[#0c2d67]">
                      {ev.kind === "ticket" ? (
                        <TicketIcon size={16} />
                      ) : ev.kind === "project" ? (
                        <FolderKanban size={16} />
                      ) : (
                        <UserCog size={16} />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {ev.title}
                      </p>
                      {ev.subtitle && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {ev.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(
                      ev.status
                    )}`}
                  >
                    {ev.status}
                  </span>
                </div>

                {/* Details section */}
                <div className="mt-3 pt-3 border-t text-xs text-gray-600 space-y-1">
                  {ev.kind === "ticket" && (
                    <TicketDetails t={ev.meta.ticket as Ticket} />
                  )}
                  {ev.kind === "project" && (
                    <ProjectDetails p={ev.meta.project as Project} />
                  )}
                  {ev.kind === "task" && (
                    <TaskDetails t={ev.meta.task as Task} />
                  )}
                  <div className="flex items-center gap-1 text-gray-400">
                    <CalendarDays size={12} />
                    <span>Last update: {fmtDate(ev.date)}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

/* ---------------- Small detail blocks ---------------- */

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex gap-2">
    <span className="text-gray-400 min-w-[110px]">{label}:</span>
    <span className="text-gray-700 break-all">{value || "—"}</span>
  </div>
);

const TicketDetails = ({ t }: { t: Ticket }) => (
  <>
    <Row label="Ticket" value={t.ticket_id} />
    <Row label="Project" value={t.project_name ?? "—"} />
    <Row label="Customer" value={t.customer_name ?? "—"} />
    <Row
      label="Assigned to"
      value={
        t.assigned_to_name ? (
          <>
            <Users size={12} className="inline mr-1" />
            {t.assigned_to_name}{" "}
            <span className="text-gray-400">({t.assigned_to_email})</span>
          </>
        ) : (
          "Not assigned"
        )
      }
    />
    <Row label="Assigned by" value={t.assigned_by_name ?? "—"} />
    <Row label="Priority" value={t.priority} />
    <Row label="Created" value={fmtDate(t.created_at)} />
    {t.resolution_notes && (
      <Row
        label="Resolution"
        value={<span className="text-green-700">{t.resolution_notes}</span>}
      />
    )}
    {t.attachment_url && (
      <Row
        label="Attachment"
        value={
          <a
            href={`${BASE_URL}${t.attachment_url}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            View file
          </a>
        }
      />
    )}
  </>
);

const ProjectDetails = ({ p }: { p: Project }) => (
  <>
    <Row label="Project" value={`${p.name} (#${p.id})`} />
    <Row label="Customer" value={p.customer_name ?? "—"} />
    <Row label="Admin" value={p.admin_name ?? "—"} />
    <Row
      label="Team Lead"
      value={
        p.teamlead_name ? (
          <>
            {p.teamlead_name}{" "}
            <span className="text-gray-400">({p.teamlead_email})</span>
          </>
        ) : (
          "Not assigned"
        )
      }
    />
    <Row
      label="Members"
      value={
        p.team_members?.length
          ? p.team_members.map((m) => m.name).join(", ")
          : "—"
      }
    />
    <Row
      label="Dates"
      value={`${fmtDate(p.start_date)} → ${fmtDate(p.end_date)}`}
    />
    <Row label="Created" value={fmtDate(p.created_at)} />
    {p.progress_notes && (
      <Row
        label="Progress"
        value={<span className="text-blue-700">{p.progress_notes}</span>}
      />
    )}
    {p.customer_response && (
      <Row
        label="Customer reply"
        value={
          <span className="text-purple-700">
            {p.customer_response}{" "}
            {p.customer_status && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100">
                {p.customer_status}
              </span>
            )}
          </span>
        }
      />
    )}
  </>
);

const TaskDetails = ({ t }: { t: Task }) => (
  <>
    <Row label="Project" value={t.project_name} />
    <Row
      label="Assignee"
      value={`${t.member_name} (${t.member_email})`}
    />
    <Row label="Assigned by" value={t.assigned_by_name} />
    <Row label="Priority" value={t.priority} />
    <Row label="Due" value={fmtDate(t.due_date)} />
    {t.progress_notes && <Row label="Progress" value={t.progress_notes} />}
    {t.teamlead_reply && (
      <Row
        label="Lead reply"
        value={<span className="text-blue-700">{t.teamlead_reply}</span>}
      />
    )}
  </>
);

export default History;