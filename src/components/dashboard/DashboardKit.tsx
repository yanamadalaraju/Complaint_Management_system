// src/components/dashboard/DashboardKit.tsx
// Shared building blocks for all role dashboards (no extra npm packages needed).

import { useCallback, useEffect, useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

/* ------------------------------------------------------------------ */
/* Types (match your API responses)                                    */
/* ------------------------------------------------------------------ */
export type Ticket = {
  id: number;
  ticket_id: string;
  subject: string;
  description?: string | null;
  category: string;
  priority: string;
  status: string;
  customer_id: number | null;
  customer_name?: string | null;
  project_id: number | null;
  project_name?: string | null;
  assigned_to: number | null;
  assigned_by?: number | null;
  assigned_to_name?: string | null;
  assigned_by_name?: string | null;
  attachment_url?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type Person = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  created_at?: string;
};

export type Project = {
  id: number;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  customer_id: number | null;
  admin_id: number | null;
  teamlead_id: number | null;
  status: string;
  progress_notes?: string | null;
  customer_response?: string | null;
  customer_status?: string | null;
  member_ids?: string | null;
  customer_name?: string | null;
  admin_name?: string | null;
  teamlead_name?: string | null;
  team_members?: Person[];
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: number;
  project_id: number;
  member_id: number;
  assigned_by: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  progress_notes?: string | null;
  teamlead_reply?: string | null;
  created_at: string;
  updated_at: string;
  project_name?: string;
  member_name?: string;
  assigned_by_name?: string;
};

/* ------------------------------------------------------------------ */
/* Data helpers                                                        */
/* ------------------------------------------------------------------ */
export const getStoredUser = (keys: string[]) => {
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const u = JSON.parse(raw);
      if (u && u.id) return u as { id: number; name?: string; email?: string; role?: string };
    } catch {
      /* ignore */
    }
  }
  return null;
};

/** Fetches several list endpoints in parallel. One failing endpoint does not break the others. */
export function useApi(paths: string[]) {
  const key = paths.join("|");
  const [data, setData] = useState<any[][]>(paths.map(() => []));
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const list = key.split("|");
      const res = await Promise.allSettled(
        list.map(async (p) => {
          const r = await fetch(`${BASE_URL}${p}`);
          const j = await r.json();
          if (!r.ok || j.success === false) throw new Error(j.message || `Failed to load ${p}`);
          return (j.data ?? []) as any[];
        })
      );
      if (!alive) return;
      setData(res.map((x) => (x.status === "fulfilled" ? x.value : [])));
      setErrors(
        res.flatMap((x) => (x.status === "rejected" ? [String(x.reason?.message || x.reason)] : []))
      );
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [key, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, errors, reload };
}

export const isClosed = (s: string) => s === "RESOLVED" || s === "CLOSED";
export const parseIds = (v?: string | null): number[] => {
  if (!v) return [];
  try {
    const a = JSON.parse(v);
    return Array.isArray(a) ? a.map(Number) : [];
  } catch {
    return [];
  }
};

export const countBy = <T,>(arr: T[], fn: (x: T) => string) =>
  arr.reduce<Record<string, number>>((acc, x) => {
    const k = fn(x) || "—";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

export const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

export const fmtDateTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

export const isOverdue = (due?: string | null, status?: string) =>
  !!due && status !== "COMPLETED" && new Date(due).getTime() < Date.now();

export const avgResolution = (tickets: Ticket[]) => {
  const done = tickets.filter((t) => isClosed(t.status));
  if (!done.length) return "—";
  const ms =
    done.reduce((s, t) => s + (new Date(t.updated_at).getTime() - new Date(t.created_at).getTime()), 0) /
    done.length;
  const h = ms / 3600000;
  if (h < 1) return `${Math.max(1, Math.round(ms / 60000))} min`;
  if (h < 48) return `${h.toFixed(1)} hrs`;
  return `${(h / 24).toFixed(1)} days`;
};

export const ticketTrend = (tickets: Ticket[], n = 7) => {
  const days = Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (n - 1 - i));
    return d;
  });
  return days.map((d) => {
    const k = d.toDateString();
    return {
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      sub: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      created: tickets.filter((t) => new Date(t.created_at).toDateString() === k).length,
      resolved: tickets.filter((t) => isClosed(t.status) && new Date(t.updated_at).toDateString() === k)
        .length,
    };
  });
};

export type HistoryRow = {
  project_id: number | null;
  name: string;
  raised: number;
  open: number;
  closed: number;
  projectStatus?: string;
  handledBy: string;
  lastAt: string;
  dots: string[]; // ticket statuses in the order they were raised
};

/** One row per project: how many times a ticket was raised, how many open / closed, who handled it. */
export const buildProjectHistory = (
  tickets: Ticket[],
  projects: Project[],
  nameById?: Map<number, string>
): HistoryRow[] => {
  const pm = new Map(projects.map((p) => [p.id, p]));
  const groups = new Map<number | string, Ticket[]>();
  tickets.forEach((t) => {
    const k = t.project_id ?? "none";
    groups.set(k, [...(groups.get(k) || []), t]);
  });
  return [...groups.entries()]
    .map(([k, list]) => {
      const sorted = [...list].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const p = typeof k === "number" ? pm.get(k) : undefined;
      const lastWithTl = [...sorted].reverse().find((t) => t.assigned_to_name);
      const handledBy =
        p?.teamlead_name ||
        (p?.teamlead_id ? nameById?.get(p.teamlead_id) : undefined) ||
        lastWithTl?.assigned_to_name ||
        "—";
      return {
        project_id: typeof k === "number" ? k : null,
        name: p?.name || sorted[0]?.project_name || "No project",
        raised: sorted.length,
        open: sorted.filter((t) => !isClosed(t.status)).length,
        closed: sorted.filter((t) => isClosed(t.status)).length,
        projectStatus: p?.status,
        handledBy,
        lastAt: sorted[sorted.length - 1]?.updated_at,
        dots: sorted.map((t) => t.status),
      } as HistoryRow;
    })
    .sort((a, b) => b.raised - a.raised || new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
};

/* ------------------------------------------------------------------ */
/* Colours                                                             */
/* ------------------------------------------------------------------ */
export const STATUS_HEX: Record<string, string> = {
  OPEN: "#eab308",
  ASSIGNED: "#3b82f6",
  IN_PROGRESS: "#8b5cf6",
  RESOLVED: "#22c55e",
  CLOSED: "#6b7280",
  TODO: "#94a3b8",
  BLOCKED: "#ef4444",
  COMPLETED: "#22c55e",
  PENDING: "#f59e0b",
};
export const PRIORITY_HEX: Record<string, string> = {
  LOW: "#22c55e",
  MEDIUM: "#3b82f6",
  HIGH: "#f97316",
  URGENT: "#ef4444",
};

export const statusColor = (status: string) => {
  switch (status) {
    case "OPEN":
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "ASSIGNED":
      return "bg-blue-100 text-blue-700";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-700";
    case "RESOLVED":
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "CLOSED":
      return "bg-gray-200 text-gray-700";
    case "BLOCKED":
      return "bg-red-100 text-red-700";
    case "TODO":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export const priorityColor = (p: string) => {
  switch (p) {
    case "URGENT":
      return "bg-red-100 text-red-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "MEDIUM":
      return "bg-blue-100 text-blue-700";
    case "LOW":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

/* ------------------------------------------------------------------ */
/* UI components                                                       */
/* ------------------------------------------------------------------ */
export const Pill = ({ text, className }: { text: string; className: string }) => (
  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${className}`}>
    {text.replace("_", " ")}
  </span>
);

export const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  hint,
  to,
}: {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  hint?: string;
  to?: string;
}) => {
  const body = (
    <div
      className={`bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 h-full ${
        to ? "hover:shadow-md transition-shadow" : ""
      }`}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white shrink-0 ${color}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-[#0c2d67]">{value}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5 truncate">{hint}</p>}
      </div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
};

export const Card = ({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between mb-4 gap-3">
        {title && <h3 className="font-semibold text-[#0c2d67]">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

export const Empty = ({ text }: { text: string }) => (
  <p className="text-sm text-gray-400 text-center py-6">{text}</p>
);

export const PageHeader = ({
  title,
  subtitle,
  onRefresh,
  right,
}: {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  right?: ReactNode;
}) => (
  <div className="flex justify-between items-center flex-wrap gap-3">
    <div>
      <h2 className="text-2xl font-bold text-[#0c2d67]">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-2">
      {right}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      )}
    </div>
  </div>
);

export const ErrorBanner = ({ errors }: { errors: string[] }) =>
  errors.length ? (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
      Some data could not be loaded: {errors.join(" • ")}
    </div>
  ) : null;

export const ProgressBar = ({ value, color = "#0c2d67" }: { value: number; color?: string }) => (
  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
    <div
      className="h-full rounded-full transition-all"
      style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
    />
  </div>
);

export type Segment = { label: string; value: number; color: string };

export const Donut = ({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: Segment[];
  centerValue: number | string;
  centerLabel: string;
}) => {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 40;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-6 flex-wrap justify-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
          {total > 0 &&
            segments
              .filter((s) => s.value > 0)
              .map((s) => {
                const len = (s.value / total) * c;
                const el = (
                  <circle
                    key={s.label}
                    cx="50"
                    cy="50"
                    r={r}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="12"
                    strokeDasharray={`${len} ${c - len}`}
                    strokeDashoffset={-offset}
                  />
                );
                offset += len;
                return el;
              })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#0c2d67]">{centerValue}</span>
          <span className="text-[11px] text-gray-500">{centerLabel}</span>
        </div>
      </div>
      <ul className="space-y-1.5 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-gray-600">{s.label.replace("_", " ")}</span>
            <span className="font-semibold text-[#0c2d67] ml-auto pl-3">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const BarList = ({ items }: { items: { label: string; value: number; color?: string }[] }) => {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return <Empty text="No data yet" />;
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 truncate pr-2">{i.label.replace("_", " ")}</span>
            <span className="font-semibold text-[#0c2d67]">{i.value}</span>
          </div>
          <ProgressBar value={(i.value / max) * 100} color={i.color || "#0c2d67"} />
        </li>
      ))}
    </ul>
  );
};

export const TrendChart = ({
  days,
}: {
  days: { label: string; sub: string; created: number; resolved: number }[];
}) => {
  const max = Math.max(1, ...days.flatMap((d) => [d.created, d.resolved]));
  return (
    <div>
      <div className="flex items-end gap-3 h-36">
        {days.map((d) => (
          <div key={d.sub} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
            <div className="flex items-end gap-1 w-full justify-center flex-1">
              <div
                title={`Raised: ${d.created}`}
                className="w-3 sm:w-4 rounded-t bg-[#0c2d67]"
                style={{ height: `${(d.created / max) * 100}%`, minHeight: d.created ? 4 : 0 }}
              />
              <div
                title={`Resolved: ${d.resolved}`}
                className="w-3 sm:w-4 rounded-t bg-green-500"
                style={{ height: `${(d.resolved / max) * 100}%`, minHeight: d.resolved ? 4 : 0 }}
              />
            </div>
            <span className="text-[11px] text-gray-500">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-xs text-gray-500 mt-3 justify-center">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#0c2d67]" /> Raised
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-green-500" /> Resolved
        </span>
      </div>
    </div>
  );
};

export const TicketTable = ({
  tickets,
  showCustomer = false,
  showAssignee = false,
  actions,
  emptyText = "No tickets to show.",
}: {
  tickets: Ticket[];
  showCustomer?: boolean;
  showAssignee?: boolean;
  actions?: (t: Ticket) => ReactNode;
  emptyText?: string;
}) => {
  if (!tickets.length) return <Empty text={emptyText} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-gray-500 border-b">
          <tr>
            <th className="py-2 pr-3">Ticket ID</th>
            <th className="py-2 pr-3">Subject</th>
            <th className="py-2 pr-3">Project</th>
            {showCustomer && <th className="py-2 pr-3">Customer</th>}
            {showAssignee && <th className="py-2 pr-3">Assigned To</th>}
            <th className="py-2 pr-3">Priority</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3">Raised</th>
            {actions && <th className="py-2 text-right">Action</th>}
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id} className="border-b last:border-0">
              <td className="py-2 pr-3 font-mono text-xs">{t.ticket_id}</td>
              <td className="py-2 pr-3 max-w-[220px] truncate" title={t.subject}>
                {t.subject}
              </td>
              <td className="py-2 pr-3 text-gray-600">{t.project_name || "—"}</td>
              {showCustomer && <td className="py-2 pr-3">{t.customer_name || "—"}</td>}
              {showAssignee && <td className="py-2 pr-3">{t.assigned_to_name || "—"}</td>}
              <td className="py-2 pr-3">
                <Pill text={t.priority} className={priorityColor(t.priority)} />
              </td>
              <td className="py-2 pr-3">
                <Pill text={t.status} className={statusColor(t.status)} />
              </td>
              <td className="py-2 pr-3 text-gray-500 text-xs">{timeAgo(t.created_at)}</td>
              {actions && <td className="py-2 text-right">{actions(t)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** Ticket history per project: how many times raised, open vs closed, who handled it. */
export const ProjectHistoryTable = ({
  rows,
  limit = 8,
}: {
  rows: HistoryRow[];
  limit?: number;
}) => {
  if (!rows.length) return <Empty text="No ticket history yet." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-gray-500 border-b">
          <tr>
            <th className="py-2 pr-3">Project</th>
            <th className="py-2 pr-3">Times Raised</th>
            <th className="py-2 pr-3">Cycle</th>
            <th className="py-2 pr-3">Open</th>
            <th className="py-2 pr-3">Closed</th>
            <th className="py-2 pr-3">Handled By</th>
            <th className="py-2 pr-3">Project</th>
            <th className="py-2">Last Activity</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, limit).map((r) => (
            <tr key={`${r.project_id}-${r.name}`} className="border-b last:border-0">
              <td className="py-2 pr-3 font-medium">{r.name}</td>
              <td className="py-2 pr-3">
                <span
                  className={`font-semibold ${r.raised > 1 ? "text-orange-600" : "text-[#0c2d67]"}`}
                >
                  {r.raised}×
                </span>
              </td>
              <td className="py-2 pr-3">
                <div className="flex items-center gap-1 flex-wrap max-w-[140px]">
                  {r.dots.map((s, i) => (
                    <span
                      key={i}
                      title={`Ticket ${i + 1}: ${s}`}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: isClosed(s) ? "#22c55e" : "#eab308" }}
                    />
                  ))}
                </div>
              </td>
              <td className="py-2 pr-3 text-yellow-700 font-semibold">{r.open}</td>
              <td className="py-2 pr-3 text-green-700 font-semibold">{r.closed}</td>
              <td className="py-2 pr-3">{r.handledBy}</td>
              <td className="py-2 pr-3">
                {r.projectStatus ? (
                  <Pill text={r.projectStatus} className={statusColor(r.projectStatus)} />
                ) : (
                  "—"
                )}
              </td>
              <td className="py-2 text-gray-500 text-xs">{r.lastAt ? timeAgo(r.lastAt) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-3">
        Cycle dots: <span className="text-yellow-500">●</span> open ticket,{" "}
        <span className="text-green-500">●</span> closed ticket — one dot per time the customer raised an issue.
      </p>
    </div>
  );
};