// src/pages/customer/Dashboard.tsx
import { Link } from "react-router-dom";
import { Ticket, Clock, CheckCircle, PlusCircle, FolderKanban, Repeat } from "lucide-react";
import {
  useApi, getStoredUser, StatCard, Card, PageHeader, ErrorBanner, Donut, Empty, Pill, TicketTable,
  ProjectHistoryTable, ProgressBar, statusColor, STATUS_HEX, countBy, isClosed, buildProjectHistory,
  fmtDate, Ticket as TicketT, Project,
} from "@/components/dashboard/DashboardKit";

const Dashboard = () => {
  const me = getStoredUser(["customer_user"]);
  const q = me?.id ? `?customer_id=${me.id}` : "";
  const { data, loading, errors, reload } = useApi([`/api/tickets${q}`, `/api/projects${q}`]);

  const tickets = data[0] as TicketT[];
  // Projects endpoint returns all projects – keep only this customer's
  const projects = (data[1] as Project[]).filter((p) => !me || p.customer_id === me.id);

  const v = (n: number | string) => (loading ? "…" : n);
  const open = tickets.filter((t) => t.status === "OPEN" || t.status === "ASSIGNED").length;
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolved = tickets.filter((t) => isClosed(t.status)).length;
  const status = countBy(tickets, (t) => t.status);
  const history = buildProjectHistory(tickets, projects);

  // Completed projects waiting for the customer's confirmation
  const toConfirm = projects.filter(
    (p) => p.status === "COMPLETED" && (!p.customer_status || p.customer_status === "PENDING")
  );
  const needsAttention = projects.filter(
    (p) => p.status === "COMPLETED" && tickets.some((t) => t.project_id === p.id && !isClosed(t.status))
  );

  const projectProgress = (p: Project) =>
    p.status === "COMPLETED" ? 100 : p.status === "IN_PROGRESS" ? 60 : p.status === "ASSIGNED" ? 20 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Dashboard"
        subtitle="Track your projects and support tickets"
        onRefresh={reload}
        right={
          <Link
            to="/customer/tickets/create"
            className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-4 py-2 rounded-lg hover:bg-[#0a2450]"
          >
            <PlusCircle size={16} /> Raise New Ticket
          </Link>
        }
      />
      <ErrorBanner errors={errors} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open / Assigned" value={v(open)} icon={Ticket} color="bg-yellow-500" />
        <StatCard label="In Progress" value={v(inProgress)} icon={Clock} color="bg-blue-500" />
        <StatCard label="Resolved" value={v(resolved)} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="My Projects" value={v(projects.length)} icon={FolderKanban} color="bg-purple-500" to="/customer/projects" />
      </div>

      {toConfirm.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <CheckCircle className="text-green-600 mt-0.5" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-green-800">Project completed — please review</p>
            <p className="text-green-700 mt-1">
              {toConfirm.map((p) => p.name).join(", ")}. If everything works, confirm it. If you still see an issue, raise a new ticket and the same team will pick it up.
            </p>
            <Link to="/customer/projects" className="inline-block mt-2 text-xs font-semibold text-green-800 hover:underline">
              Review projects →
            </Link>
          </div>
        </div>
      )}

      {needsAttention.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <Repeat className="text-orange-500 mt-0.5" size={20} />
          <p className="text-sm text-orange-800">
            You have open tickets on completed project(s): <b>{needsAttention.map((p) => p.name).join(", ")}</b>. The team is working on them.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="My Tickets" className="lg:col-span-1">
          <Donut
            centerValue={tickets.length}
            centerLabel="total"
            segments={Object.entries(status).map(([label, value]) => ({ label, value, color: STATUS_HEX[label] || "#94a3b8" }))}
          />
        </Card>

        <Card title="My Projects" className="lg:col-span-2">
          {projects.length === 0 ? <Empty text="No projects yet." /> : (
            <div className="space-y-4">
              {projects.slice(0, 5).map((p) => (
                <div key={p.id}>
                  <div className="flex justify-between items-center text-sm mb-1.5 gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Link to={`/customer/history/${p.id}`} className="font-medium text-[#0c2d67] hover:underline">{p.name}</Link>
                      <Pill text={p.status} className={statusColor(p.status)} />
                    </div>
                    <span className="text-xs text-gray-500">
                      Lead: {p.teamlead_name || "—"} · Ends {fmtDate(p.end_date)}
                    </span>
                  </div>
                  <ProgressBar value={projectProgress(p)} color={p.status === "COMPLETED" ? "#22c55e" : "#0c2d67"} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Issue History by Project">
        <ProjectHistoryTable rows={history} limit={6} />
      </Card>

      <Card
        title="Recent Tickets"
        action={<Link to="/customer/tickets" className="text-xs font-semibold text-[#0c2d67] hover:underline">View all</Link>}
      >
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-4">Loading tickets…</p>
        ) : (
          <TicketTable
            tickets={tickets.slice(0, 5)}
            showAssignee
            emptyText="No tickets yet. Click “Raise New Ticket” to create one."
            actions={(t) => (
              <Link to={`/customer/tickets/${t.id}`} className="text-[#0c2d67] hover:underline text-xs font-semibold">View</Link>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default Dashboard;