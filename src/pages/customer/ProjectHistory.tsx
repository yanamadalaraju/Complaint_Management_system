// src/pages/customer/ProjectHistory.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Loader2, FolderKanban, FolderOpen, AlertTriangle, Clock,
  CheckCircle2, XCircle, RefreshCcw, UserCheck, PlayCircle, Lock, Flag,
  Search, Download, List, Table, ArrowUpDown, Ticket as TicketIcon,
  Calendar, User, History as HistoryIcon, MessageSquare,
} from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

/* ---------------- Types ---------------- */
type Ticket = {
  id: number;
  ticket_id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  project_id: number | null;
  project_name: string | null;
  customer_name: string | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
  assigned_by_name: string | null;
  resolution_notes: string | null;
};

type Project = {
  id: number;
  name: string;
  status?: string | null;
  created_at: string;
  updated_at: string;
};

type HistoryRecord = {
  key: string;
  seq: number;
  scope: "TICKET" | "PROJECT";
  ticket_reference: string | null;
  customer_name: string | null;
  action: string;
  status: string;
  note: string | null;
  performed_by: string | null;
  created_at: string;
  derived: boolean;
};

/* ---------------- Helpers ---------------- */
const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

const formatDay = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "—";

const norm = (s?: string | null) =>
  (s || "").trim().toUpperCase().replace(/[\s-]+/g, "_");

const canonAction = (s?: string | null) => {
  const n = norm(s);
  switch (n) {
    case "OPEN":
    case "CREATED":
      return "OPENED";
    case "SOLVED":
    case "COMPLETED":
      return "RESOLVED";
    case "ASSIGN":
      return "ASSIGNED";
    case "REOPEN":
      return "REOPENED";
    case "CLOSE":
      return "CLOSED";
    case "UPDATED":
    case "NOTE":
    case "MESSAGE":
    case "COMMENT":
      return "UPDATE";
    default:
      return n || "UPDATE";
  }
};

const canonStatus = (s?: string | null) => {
  const n = norm(s);
  if (!n) return "UNKNOWN";
  if (n === "SOLVED") return "RESOLVED";
  return n;
};

const prettify = (s: string) =>
  s.toLowerCase().split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

type Meta = { label: string; icon: JSX.Element; dot: string };

const ACTION_META: Record<string, Meta> = {
  OPENED:      { label: "Ticket Opened",   icon: <Clock size={14} />,          dot: "bg-yellow-100 text-yellow-700 ring-yellow-200" },
  ASSIGNED:    { label: "Ticket Assigned", icon: <UserCheck size={14} />,      dot: "bg-blue-100 text-blue-700 ring-blue-200" },
  IN_PROGRESS: { label: "Work In Progress",icon: <PlayCircle size={14} />,     dot: "bg-purple-100 text-purple-700 ring-purple-200" },
  RESOLVED:    { label: "Ticket Resolved", icon: <CheckCircle2 size={14} />,   dot: "bg-green-100 text-green-700 ring-green-200" },
  CLOSED:      { label: "Ticket Closed",   icon: <Lock size={14} />,           dot: "bg-gray-200 text-gray-700 ring-gray-300" },
  REOPENED:    { label: "Ticket Reopened", icon: <RefreshCcw size={14} />,     dot: "bg-orange-100 text-orange-700 ring-orange-200" },
  REJECTED:    { label: "Ticket Rejected", icon: <XCircle size={14} />,        dot: "bg-red-100 text-red-700 ring-red-200" },
  UPDATE:      { label: "Team Update",     icon: <MessageSquare size={14} />,  dot: "bg-teal-100 text-teal-700 ring-teal-200" },
  PROJECT_STARTED:   { label: "Project Opened", icon: <FolderOpen size={14} />, dot: "bg-indigo-100 text-indigo-700 ring-indigo-200" },
  PROJECT_COMPLETED: { label: "Project Closed", icon: <Flag size={14} />,       dot: "bg-emerald-100 text-emerald-700 ring-emerald-200" },
};

const getMeta = (action: string): Meta =>
  ACTION_META[action] || {
    label: prettify(action),
    icon: <AlertTriangle size={14} />,
    dot: "bg-sky-100 text-sky-700 ring-sky-200",
  };

const STATUS_BADGE: Record<string, string> = {
  OPEN: "bg-yellow-100 text-yellow-700",
  OPENED: "bg-yellow-100 text-yellow-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-200 text-gray-700",
  REJECTED: "bg-red-100 text-red-700",
  REOPENED: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  UNKNOWN: "bg-gray-100 text-gray-500",
};

const badgeClass = (status: string) =>
  STATUS_BADGE[status] || "bg-gray-100 text-gray-600";

/* Team-lead rows */
const TEAM_LEAD_ACTIONS = ["RESOLVED", "CLOSED", "IN_PROGRESS", "REJECTED", "UPDATE"];
const DEFAULT_NOTES = [
  "ticket marked as resolved",
  "ticket closed",
  "work started on ticket",
  "ticket rejected",
  "status updated",
];
const LEAD_ACTION_DESC: Record<string, string> = {
  RESOLVED: "Marked as resolved",
  CLOSED: "Ticket closed",
  IN_PROGRESS: "Work started",
  REJECTED: "Ticket rejected",
  UPDATE: "Update posted",
};
const leadNote = (h: HistoryRecord): string | null =>
  TEAM_LEAD_ACTIONS.includes(h.action) &&
  h.note &&
  !DEFAULT_NOTES.includes(h.note.trim().toLowerCase())
    ? h.note
    : null;
const eventNote = (h: HistoryRecord): string | null =>
  TEAM_LEAD_ACTIONS.includes(h.action) ? LEAD_ACTION_DESC[h.action] || null : h.note;

/* Fallback derived events */
const deriveTicketEvents = (t: Ticket): HistoryRecord[] => {
  const base = t.id * 1000;
  const status = canonStatus(t.status);
  const out: HistoryRecord[] = [
    {
      key: `dv-open-${t.id}`, seq: base, scope: "TICKET",
      ticket_reference: t.ticket_id, customer_name: t.customer_name ?? null,
      action: "OPENED", status: "OPEN",
      note: `Ticket created: ${t.subject}`,
      performed_by: t.customer_name || "Customer",
      created_at: t.created_at, derived: true,
    },
  ];

  if (t.assigned_to_name || t.assigned_to) {
    out.push({
      key: `dv-assign-${t.id}`, seq: base + 1, scope: "TICKET",
      ticket_reference: t.ticket_id, customer_name: t.customer_name ?? null,
      action: "ASSIGNED", status: "ASSIGNED",
      note: `Assigned to ${t.assigned_to_name || `user #${t.assigned_to}`}`,
      performed_by: t.assigned_by_name || "Admin",
      created_at: t.updated_at, derived: true,
    });
  }

  if (["IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED", "REJECTED"].includes(status)) {
    out.push({
      key: `dv-status-${t.id}`, seq: base + 2, scope: "TICKET",
      ticket_reference: t.ticket_id, customer_name: t.customer_name ?? null,
      action: status, status,
      note: t.resolution_notes || "Status updated",
      performed_by:
        status === "REOPENED" ? t.customer_name || "Customer"
                              : t.assigned_to_name || "Support Team",
      created_at: t.updated_at, derived: true,
    });
  }
  return out;
};

const deriveProjectEvents = (p: Project): HistoryRecord[] => {
  const out: HistoryRecord[] = [
    {
      key: `pj-start-${p.id}`, seq: -2, scope: "PROJECT",
      ticket_reference: null, customer_name: null,
      action: "PROJECT_STARTED", status: "OPEN",
      note: "Project was created",
      performed_by: "Admin",
      created_at: p.created_at, derived: true,
    },
  ];
  if (canonStatus(p.status) === "COMPLETED") {
    out.push({
      key: `pj-done-${p.id}`, seq: -1, scope: "PROJECT",
      ticket_reference: null, customer_name: null,
      action: "PROJECT_COMPLETED", status: "COMPLETED",
      note: "Project marked as completed",
      performed_by: "Team",
      created_at: p.updated_at, derived: true,
    });
  }
  return out;
};

/* ---------------- Component ---------------- */
const ProjectHistory = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const numericProjectId = projectId ? Number(projectId) : null;

  const [searchParams] = useSearchParams();
  const ticketParam = searchParams.get("ticket");
  const numericTicketId = ticketParam ? Number(ticketParam) : null;
  const ticketMode = numericTicketId !== null && !Number.isNaN(numericTicketId);

  const [projectTickets, setProjectTickets] = useState<Ticket[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [view, setView] = useState<"timeline" | "table">("timeline");
  const [ticketFilter, setTicketFilter] = useState<string>("ALL");
  const [actionFilter, setActionFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [newestFirst, setNewestFirst] = useState(!ticketMode);

  /* ---------- Fetch Data ---------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const stored = localStorage.getItem("customer_user");
        const customer = stored ? JSON.parse(stored) : null;

        if (!customer?.id || (!ticketMode && !numericProjectId)) {
          setError("Invalid project or user session.");
          return;
        }

        const tRes = await fetch(`${BASE_URL}/api/tickets?customer_id=${customer.id}`);
        const tData = await tRes.json();
        if (cancelled) return;
        if (!tRes.ok || !tData.success) throw new Error("Failed to load tickets");

        const filteredTickets: Ticket[] = (tData.data || []).filter(
          (t: Ticket) =>
            ticketMode ? t.id === numericTicketId : t.project_id === numericProjectId
        );

        const projectPromise = (async (): Promise<Project | null> => {
          if (!numericProjectId) return null;
          try {
            const pRes = await fetch(`${BASE_URL}/api/projects?customer_id=${customer.id}`);
            const pData = await pRes.json();
            if (!pRes.ok || !pData.success) return null;
            return (pData.data || []).find((p: Project) => p.id === numericProjectId) || null;
          } catch { return null; }
        })();

        const historyPromises = filteredTickets.map(async (t): Promise<HistoryRecord[]> => {
          try {
            const hRes = await fetch(`${BASE_URL}/api/ticket-history/${t.id}`);
            const hData = await hRes.json();
            const rows: any[] =
              hRes.ok && hData.success && Array.isArray(hData.data) ? hData.data : [];

            if (rows.length === 0) return deriveTicketEvents(t);

            const mapped: HistoryRecord[] = rows.map((h) => ({
              key: `db-${h.id}`,
              seq: Number(h.id) || 0,
              scope: "TICKET",
              ticket_reference: t.ticket_id,
              customer_name: t.customer_name ?? null,
              action: canonAction(h.action),
              status: canonStatus(h.status),
              note: h.note ?? null,
              performed_by: h.performed_by ?? null,
              created_at: h.created_at,
              derived: false,
            }));

            if (!mapped.some((m) => m.action === "OPENED")) {
              mapped.push(deriveTicketEvents(t)[0]);
            }
            return mapped;
          } catch {
            return deriveTicketEvents(t);
          }
        });

        const [proj, ...historyResults] = await Promise.all([projectPromise, ...historyPromises]);
        if (cancelled) return;

        const projectEvents = proj && !ticketMode ? deriveProjectEvents(proj) : [];

        setProjectTickets(filteredTickets);
        setProject(proj);
        setHistory([...historyResults.flat(), ...projectEvents]);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load project history");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [numericProjectId, numericTicketId, reloadKey]);

  /* ---------- Derived data ---------- */
  const actionOptions = useMemo(
    () => Array.from(new Set(history.map((h) => h.action))),
    [history]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = history.filter((h) => {
      if (ticketFilter !== "ALL" && h.ticket_reference !== ticketFilter) return false;
      if (actionFilter !== "ALL" && h.action !== actionFilter) return false;
      if (q) {
        const hay = `${h.ticket_reference || ""} ${h.customer_name || ""} ${h.action} ${h.status} ${h.note || ""} ${h.performed_by || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      const cmp = diff !== 0 ? diff : a.seq - b.seq;
      return newestFirst ? -cmp : cmp;
    });
    return list;
  }, [history, ticketFilter, actionFilter, search, newestFirst]);

  const steps = useMemo(() => {
    const m = new Map<string, number>();
    const byTicket: Record<string, HistoryRecord[]> = {};
    history.forEach((h) => {
      const k = h.ticket_reference || "PROJECT";
      (byTicket[k] = byTicket[k] || []).push(h);
    });
    Object.values(byTicket).forEach((list) => {
      list
        .sort((a, b) => {
          const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          return diff !== 0 ? diff : a.seq - b.seq;
        })
        .forEach((h, i) => m.set(h.key, i + 1));
    });
    return m;
  }, [history]);

  const hasDerived = history.some((h) => h.derived && h.scope === "TICKET");
  const filtersActive = ticketFilter !== "ALL" || actionFilter !== "ALL" || search.trim() !== "";

  /* ---------- Export ---------- */
  const exportCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [
      ["Date & Time", "Ticket", "Client", "Action", "Status", "Performed By", "Notes", "Team Lead Resolution Notes"],
      ...visible.map((h) => [
        formatDate(h.created_at),
        h.ticket_reference || "PROJECT",
        h.customer_name || "",
        getMeta(h.action).label,
        h.status,
        h.performed_by || "System",
        eventNote(h) || "",
        leadNote(h) || "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => esc(String(c))).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ticketMode
      ? `ticket-${numericTicketId}-history.csv`
      : `project-${numericProjectId}-history.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setTicketFilter("ALL");
    setActionFilter("ALL");
    setSearch("");
  };

  /* ---------- UI Renders ---------- */
  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-10 flex items-center justify-center text-gray-500 gap-2">
        <Loader2 className="animate-spin" size={18} /> Loading project history…
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
          <button onClick={() => setReloadKey((k) => k + 1)} className="ml-3 underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const projectName = project?.name || projectTickets[0]?.project_name || "Project History";
  const selectedTicket = ticketMode ? projectTickets[0] : null;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
      >
        <ArrowLeft size={16} /> Back to My Tickets
      </button>

      {/* Compact header: only ticket number + project name */}
      <div className="bg-white rounded-xl border p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {ticketMode ? (
            <>
              <h1 className="text-lg font-bold text-[#0c2d67] flex items-center gap-2">
                <TicketIcon size={18} />
                <span className="font-mono">
                  {selectedTicket?.ticket_id || `Ticket #${numericTicketId}`}
                </span>
              </h1>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600 inline-flex items-center gap-1">
                <FolderKanban size={14} /> {selectedTicket?.project_name || projectName}
              </span>
              {selectedTicket?.customer_name && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600 inline-flex items-center gap-1">
                    <User size={14} /> {selectedTicket.customer_name}
                  </span>
                </>
              )}
            </>
          ) : (
            <h1 className="text-lg font-bold text-[#0c2d67] flex items-center gap-2">
              <FolderKanban size={18} /> {projectName}
            </h1>
          )}
        </div>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border hover:bg-gray-50 text-gray-700"
        >
          <RefreshCcw size={14} /> Refresh
        </button>
      </div>

      {/* Ticket chips (project view only) — show only ticket number */}
      {!ticketMode && projectTickets.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setTicketFilter("ALL")}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border ${
              ticketFilter === "ALL"
                ? "bg-[#0c2d67] text-white border-[#0c2d67]"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            All tickets
          </button>
          {projectTickets.map((t) => {
            const active = ticketFilter === t.ticket_id;
            return (
              <button
                key={t.id}
                onClick={() => setTicketFilter(active ? "ALL" : t.ticket_id)}
                title={t.subject}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${
                  active
                    ? "bg-[#0c2d67] text-white border-[#0c2d67]"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <TicketIcon size={12} />
                <span className="font-mono">{t.ticket_id}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-xl border p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes, people, ticket…"
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]/20"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="text-sm border rounded-lg px-3 py-2 bg-white"
        >
          <option value="ALL">All actions</option>
          {actionOptions.map((a) => (
            <option key={a} value={a}>{getMeta(a).label}</option>
          ))}
        </select>

        <button
          onClick={() => setNewestFirst((v) => !v)}
          className="inline-flex items-center gap-2 text-sm border rounded-lg px-3 py-2 hover:bg-gray-50 text-gray-700"
        >
          <ArrowUpDown size={14} /> {newestFirst ? "Newest first" : "Oldest first"}
        </button>

        <div className="inline-flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setView("timeline")}
            className={`px-3 py-2 text-sm inline-flex items-center gap-1 ${
              view === "timeline" ? "bg-[#0c2d67] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <List size={14} /> Timeline
          </button>
          <button
            onClick={() => setView("table")}
            className={`px-3 py-2 text-sm inline-flex items-center gap-1 ${
              view === "table" ? "bg-[#0c2d67] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Table size={14} /> Table
          </button>
        </div>

        <button
          onClick={exportCsv}
          disabled={visible.length === 0}
          className="inline-flex items-center gap-2 text-sm border rounded-lg px-3 py-2 hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} /> CSV
        </button>
      </div>

      {hasDerived && (
        <p className="text-xs text-gray-500 -mt-3">
          Entries tagged <span className="font-medium">inferred</span> were rebuilt from the ticket's
          current data because no history was stored for them.
        </p>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Clock size={14} /> {ticketMode ? "Ticket Activity" : "Project Activity"}
            <span className="text-xs font-normal text-gray-500">
              ({visible.length} {visible.length === 1 ? "event" : "events"})
            </span>
          </h4>
          {filtersActive && (
            <button onClick={clearFilters} className="text-xs text-[#0c2d67] underline">
              Clear filters
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <p className="p-8 text-xs text-gray-500 italic text-center">
            {history.length === 0
              ? "No tickets or history recorded for this project yet."
              : "No events match your filters."}
          </p>
        ) : view === "timeline" ? (
          <ol className="relative px-6 py-6">
            <span className="absolute left-[39px] top-6 bottom-6 w-px bg-gray-200" aria-hidden />
            {visible.map((h, i) => {
              const meta = getMeta(h.action);
              const showDay =
                i === 0 || formatDay(visible[i - 1].created_at) !== formatDay(h.created_at);
              return (
                <li key={h.key} className="relative">
                  {showDay && (
                    <div className="ml-12 mb-3 mt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      {formatDay(h.created_at)}
                    </div>
                  )}
                  <div className="flex gap-4 pb-6">
                    <span
                      className={`relative z-10 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ring-4 ${meta.dot}`}
                    >
                      {meta.icon}
                    </span>
                    <div className="flex-1 min-w-0 rounded-lg border bg-white p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-[10px] font-mono text-gray-400">#{steps.get(h.key)}</span>
                        <span className="text-sm font-semibold text-gray-800">{meta.label}</span>
                        {h.ticket_reference ? (
                          <button
                            onClick={() => setTicketFilter(h.ticket_reference!)}
                            className="font-mono text-[11px] text-blue-600 hover:underline"
                            title="Show only this ticket"
                          >
                            {h.ticket_reference}
                          </button>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                            Project
                          </span>
                        )}
                        {h.customer_name && (
                          <span className="text-[11px] text-gray-500 inline-flex items-center gap-1">
                            <User size={11} /> {h.customer_name}
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeClass(h.status)}`}>
                          {prettify(h.status)}
                        </span>
                        {h.derived && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500"
                            title="Rebuilt from current ticket/project data"
                          >
                            inferred
                          </span>
                        )}
                        <span className="ml-auto text-[11px] text-gray-400 whitespace-nowrap">
                          {formatDate(h.created_at)}
                        </span>
                      </div>
                      {eventNote(h) && (
                        <p className="text-sm text-gray-600 mt-1.5 break-words">{eventNote(h)}</p>
                      )}
                      {leadNote(h) && (
                        <div className="mt-2 rounded-md bg-teal-50 border border-teal-100 px-3 py-2">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                            Team Lead Resolution Notes
                          </div>
                          <p className="text-sm text-gray-700 mt-0.5 break-words">{leadNote(h)}</p>
                        </div>
                      )}
                      <p className="text-[11px] text-gray-400 mt-1.5 inline-flex items-center gap-1">
                        <User size={11} /> {h.performed_by || "System"}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Performed By</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Team Lead Resolution Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visible.map((h) => {
                  const meta = getMeta(h.action);
                  return (
                    <tr key={h.key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-400">{steps.get(h.key)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(h.created_at)}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-blue-600">
                        {h.ticket_reference || <span className="text-indigo-600 font-sans">Project</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {h.customer_name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-medium text-gray-800">
                          <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center ${meta.dot}`}>
                            {meta.icon}
                          </span>
                          {meta.label}
                          {h.derived && <span className="text-[10px] text-gray-400">(inferred)</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeClass(h.status)}`}>
                          {prettify(h.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{h.performed_by || "System"}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[260px] truncate" title={eventNote(h) || ""}>
                        {eventNote(h) || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[300px] break-words">
                        {leadNote(h) || "—"}
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

export default ProjectHistory;