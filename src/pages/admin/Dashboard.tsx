// src/pages/admin/Dashboard.tsx
import { Link } from "react-router-dom";
import { Clock, CheckCircle, FolderKanban, UserPlus, Repeat } from "lucide-react";
import {
  useApi, getStoredUser, StatCard, Card, PageHeader, ErrorBanner, Donut, BarList, TrendChart, TicketTable,
  ProjectHistoryTable, Empty, Pill, statusColor, STATUS_HEX, countBy, isClosed, ticketTrend, avgResolution,
  buildProjectHistory, fmtDate, Ticket as TicketT, Project, Person,
} from "@/components/dashboard/DashboardKit";

const Dashboard = () => {
  // Tries common storage keys – adjust to the key your admin login uses.
  const me = getStoredUser(["admin_user", "admin", "user"]);
  const { data, loading, errors, reload } = useApi(["/api/tickets", "/api/projects", "/api/teamleads"]);

  const allTickets = data[0] as TicketT[];
  const allProjects = data[1] as Project[];
  const teamleads = data[2] as Person[];

  // Only this admin's projects & their tickets (all data when no login found – dev mode)
  const projects = me ? allProjects.filter((p) => p.admin_id === me.id) : allProjects;
  const pIds = new Set(projects.map((p) => p.id));
  const tickets = me ? allTickets.filter((t) => (t.project_id && pIds.has(t.project_id)) || t.assigned_by === me.id) : allTickets;
  const tlName = new Map(teamleads.map((t) => [t.id, t.name]));

  const v = (n: number | string) => (loading ? "…" : n);
  const needAssign = tickets.filter((t) => t.status === "OPEN" && !t.assigned_to);
  const inFlight = tickets.filter((t) => t.status === "ASSIGNED" || t.status === "IN_PROGRESS");
  const resolved = tickets.filter((t) => isClosed(t.status));
  const history = buildProjectHistory(tickets, projects, tlName);
  const repeat = history.filter((h) => h.raised > 1);

  // Ticket "loop" – customer raised again on a project that was already completed
  const reopenedProjects = projects.filter(
    (p) => p.status === "COMPLETED" && tickets.some((t) => t.project_id === p.id && !isClosed(t.status))
  );

  const tlLoad = teamleads
    .map((t) => ({
      label: t.name,
      value: tickets.filter((x) => x.assigned_to === t.id && !isClosed(x.status)).length,
    }))
    .filter((x) => x.value > 0 || projects.some((p) => p.teamlead_id === teamleads.find((t) => t.name === x.label)?.id));

  const status = countBy(tickets, (t) => t.status);
  const projectStatus = countBy(projects, (p) => p.status);

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" subtitle="Assign tickets to team leads and follow every project to closure" onRefresh={reload} />
      <ErrorBanner errors={errors} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Need Assignment" value={v(needAssign.length)} icon={Clock} color="bg-yellow-500" hint="New customer tickets" to="/admin/tickets" />
        <StatCard label="With Team Lead" value={v(inFlight.length)} icon={UserPlus} color="bg-blue-500" hint="Assigned / in progress" />
        <StatCard label="Resolved" value={v(resolved.length)} icon={CheckCircle} color="bg-green-500" hint={`Avg. fix time ${avgResolution(tickets)}`} />
        <StatCard label="My Projects" value={v(projects.length)} icon={FolderKanban} color="bg-purple-500" to="/admin/projects" />
      </div>

      {reopenedProjects.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <Repeat className="text-orange-500 mt-0.5" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-orange-800">Customer raised issues on completed projects</p>
            <p className="text-orange-700 mt-1">
              {reopenedProjects.map((p) => p.name).join(", ")} — assign these to the team lead who already worked on the project.
            </p>
          </div>
        </div>
      )}

      <Card
        title="Tickets Waiting for Assignment"
        action={<Link to="/admin/tickets" className="text-xs font-semibold text-[#0c2d67] hover:underline">View all</Link>}
      >
        <TicketTable
          tickets={needAssign.slice(0, 6)}
          showCustomer
          emptyText="Nothing waiting — all tickets are assigned."
          actions={(t) => {
            const prev = projects.find((p) => p.id === t.project_id)?.teamlead_id;
            return (
              <Link to="/admin/tickets" className="text-xs font-semibold text-[#0c2d67] hover:underline">
                Assign{prev && tlName.get(prev) ? ` → ${tlName.get(prev)}` : ""}
              </Link>
            );
          }}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Tickets by Status">
          <Donut centerValue={tickets.length} centerLabel="tickets"
            segments={Object.entries(status).map(([label, value]) => ({ label, value, color: STATUS_HEX[label] || "#94a3b8" }))} />
        </Card>
        <Card title="Last 7 Days"><TrendChart days={ticketTrend(tickets)} /></Card>
        <Card title="Open Tickets per Team Lead"><BarList items={tlLoad} /></Card>
      </div>

      <Card title="Project Ticket History">
        <ProjectHistoryTable rows={history} limit={8} />
        {repeat.length > 0 && <p className="text-xs text-orange-600 mt-3">{repeat.length} project(s) had more than one ticket raised.</p>}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="My Projects">
          {projects.length === 0 ? <Empty text="No projects assigned to you yet." /> : (
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b">
                <tr><th className="py-2">Project</th><th className="py-2">Team Lead</th><th className="py-2">Status</th><th className="py-2">Ends</th></tr>
              </thead>
              <tbody>
                {projects.slice(0, 6).map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{p.name}</td>
                    <td className="py-2 text-gray-600">{p.teamlead_name || (p.teamlead_id && tlName.get(p.teamlead_id)) || "Not assigned"}</td>
                    <td className="py-2"><Pill text={p.status} className={statusColor(p.status)} /></td>
                    <td className="py-2 text-xs text-gray-500">{fmtDate(p.end_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Projects by Status">
          <BarList items={Object.entries(projectStatus).map(([label, value]) => ({ label, value, color: STATUS_HEX[label] }))} />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;