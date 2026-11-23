// src/pages/superadmin/Dashboard.tsx
import { Users, Ticket, CheckCircle, Clock, FolderKanban, UserCog, AlertTriangle, Timer } from "lucide-react";
import {
  useApi, StatCard, Card, PageHeader, ErrorBanner, Donut, BarList, TrendChart, TicketTable,
  ProjectHistoryTable, Empty, Pill, statusColor, STATUS_HEX, PRIORITY_HEX, countBy, isClosed,
  ticketTrend, avgResolution, buildProjectHistory, fmtDate, Ticket as TicketT, Project, Person,
} from "@/components/dashboard/DashboardKit";

const Dashboard = () => {
  const { data, loading, errors, reload } = useApi([
    "/api/tickets", "/api/projects", "/api/admins", "/api/teamleads", "/api/teammembers", "/api/customers", "/api/tasks",
  ]);
  const tickets = data[0] as TicketT[];
  const projects = data[1] as Project[];
  const people = data[2] as Person[];
  const teamleads = data[3] as Person[];
  const members = data[4] as Person[];
  const customers = data[5] as Person[];
  const admins = people.filter((p) => p.role === "admin");
  const v = (n: number | string) => (loading ? "…" : n);

  const unassigned = tickets.filter((t) => t.status === "OPEN" && !t.assigned_to);
  const open = tickets.filter((t) => !isClosed(t.status)).length;
  const resolved = tickets.filter((t) => isClosed(t.status)).length;
  const urgent = tickets.filter((t) => !isClosed(t.status) && (t.priority === "URGENT" || t.priority === "HIGH")).length;

  const ticketStatus = countBy(tickets, (t) => t.status);
  const priorityCount = countBy(tickets.filter((t) => !isClosed(t.status)), (t) => t.priority);
  const projectStatus = countBy(projects, (p) => p.status);
  const reopened = buildProjectHistory(tickets, projects).filter((h) => h.raised > 1);

  const adminLoad = admins
    .map((a) => ({
      label: a.name,
      value: projects.filter((p) => p.admin_id === a.id).length,
    }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const tlLoad = teamleads
    .map((t) => ({
      label: t.name,
      value: tickets.filter((x) => x.assigned_to === t.id && !isClosed(x.status)).length,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Overview" subtitle="Complete view of customers, projects and support tickets" onRefresh={reload} />
      <ErrorBanner errors={errors} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={v(tickets.length)} icon={Ticket} color="bg-purple-500" hint={`${open} still active`} to="/superadmin/tickets" />
        <StatCard label="Awaiting Assignment" value={v(unassigned.length)} icon={Clock} color="bg-yellow-500" hint="Open, no one assigned" />
        <StatCard label="Resolved / Closed" value={v(resolved)} icon={CheckCircle} color="bg-green-500" hint={`Avg. fix time ${avgResolution(tickets)}`} />
        <StatCard label="High / Urgent Active" value={v(urgent)} icon={AlertTriangle} color="bg-red-500" hint="Needs attention" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Projects" value={v(projects.length)} icon={FolderKanban} color="bg-blue-500" hint={`${projectStatus.COMPLETED || 0} completed`} to="/superadmin/projects" />
        <StatCard label="Customers" value={v(customers.length)} icon={Users} color="bg-indigo-500" />
        <StatCard label="Admins" value={v(admins.length)} icon={UserCog} color="bg-cyan-600" />
        <StatCard label="Team Leads / Members" value={v(`${teamleads.length} / ${members.length}`)} icon={Timer} color="bg-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Tickets by Status">
          <Donut
            centerValue={tickets.length}
            centerLabel="tickets"
            segments={Object.entries(ticketStatus).map(([label, value]) => ({ label, value, color: STATUS_HEX[label] || "#94a3b8" }))}
          />
        </Card>
        <Card title="Last 7 Days">
          <TrendChart days={ticketTrend(tickets)} />
        </Card>
        <Card title="Active Tickets by Priority">
          <BarList items={["URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => ({ label: p, value: priorityCount[p] || 0, color: PRIORITY_HEX[p] }))} />
        </Card>
      </div>

      <Card title="Needs Action — Tickets Waiting for Assignment">
        <TicketTable tickets={unassigned.slice(0, 6)} showCustomer emptyText="Great — every open ticket has been assigned." />
      </Card>

      <Card title="Project Ticket History (how many times customers raised issues)">
        <ProjectHistoryTable rows={buildProjectHistory(tickets, projects)} limit={8} />
        {reopened.length > 0 && (
          <p className="text-xs text-orange-600 mt-3">{reopened.length} project(s) have had repeated issues raised by customers.</p>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Projects by Status">
          <BarList items={Object.entries(projectStatus).map(([label, value]) => ({ label, value, color: STATUS_HEX[label] }))} />
        </Card>
        <Card title="Projects per Admin">
          <BarList items={adminLoad} />
        </Card>
        <Card title="Active Tickets per Team Lead">
          <BarList items={tlLoad} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Projects">
          {projects.length === 0 ? <Empty text="No projects yet." /> : (
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b">
                <tr><th className="py-2">Project</th><th className="py-2">Customer</th><th className="py-2">Status</th><th className="py-2">Ends</th></tr>
              </thead>
              <tbody>
                {projects.slice(0, 6).map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{p.name}</td>
                    <td className="py-2 text-gray-600">{p.customer_name || "—"}</td>
                    <td className="py-2"><Pill text={p.status} className={statusColor(p.status)} /></td>
                    <td className="py-2 text-xs text-gray-500">{fmtDate(p.end_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Recent Admins">
          {admins.length === 0 ? <Empty text="No admins yet." /> : (
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b">
                <tr><th className="py-2">Name</th><th className="py-2">Email</th><th className="py-2">Joined</th></tr>
              </thead>
              <tbody>
                {admins.slice(0, 6).map((a) => (
                  <tr key={a.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{a.name}</td>
                    <td className="py-2 text-gray-600">{a.email}</td>
                    <td className="py-2 text-xs text-gray-500">{fmtDate(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;