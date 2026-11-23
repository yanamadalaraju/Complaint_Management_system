// src/pages/teamlead/Dashboard.tsx
import { Link } from "react-router-dom";
import { Ticket, Clock, CheckCircle, AlertTriangle, FolderKanban, ListChecks } from "lucide-react";
import {
  useApi, getStoredUser, StatCard, Card, PageHeader, ErrorBanner, Donut, BarList, TrendChart, TicketTable,
  ProjectHistoryTable, Empty, Pill, ProgressBar, statusColor, STATUS_HEX, PRIORITY_HEX, countBy, isClosed,
  isOverdue, ticketTrend, avgResolution, buildProjectHistory, parseIds, fmtDate,
  Ticket as TicketT, Project, Task,
} from "@/components/dashboard/DashboardKit";

const Dashboard = () => {
  const me = getStoredUser(["teamlead_user", "teamlead", "user"]);
  const { data, loading, errors, reload } = useApi(["/api/tickets", "/api/projects", "/api/tasks"]);

  const allTickets = data[0] as TicketT[];
  const allProjects = data[1] as Project[];
  const allTasks = data[2] as Task[];

  const projects = me ? allProjects.filter((p) => p.teamlead_id === me.id) : allProjects;
  const pIds = new Set(projects.map((p) => p.id));
  const tickets = me
    ? allTickets.filter((t) => t.assigned_to === me.id || (t.project_id && pIds.has(t.project_id)))
    : allTickets;
  const tasks = me ? allTasks.filter((t) => t.assigned_by === me.id || pIds.has(t.project_id)) : allTasks;

  const v = (n: number | string) => (loading ? "…" : n);
  const toResolve = tickets.filter((t) => !isClosed(t.status));
  const resolved = tickets.filter((t) => isClosed(t.status));
  const urgent = toResolve.filter((t) => t.priority === "URGENT" || t.priority === "HIGH");
  const overdueTasks = tasks.filter((t) => isOverdue(t.due_date, t.status));
  const history = buildProjectHistory(tickets, projects);

  const taskStatus = countBy(tasks, (t) => t.status);
  const ticketStatus = countBy(tickets, (t) => t.status);

  // team member workload (open tasks)
  const memberMap = new Map<string, number>();
  tasks.filter((t) => t.status !== "COMPLETED").forEach((t) => {
    const n = t.member_name || `#${t.member_id}`;
    memberMap.set(n, (memberMap.get(n) || 0) + 1);
  });
  const memberLoad = [...memberMap.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  const projectProgress = (p: Project) => {
    const pt = tasks.filter((t) => t.project_id === p.id);
    if (p.status === "COMPLETED") return 100;
    if (!pt.length) return 0;
    return Math.round((pt.filter((t) => t.status === "COMPLETED").length / pt.length) * 100);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Team Lead Dashboard" subtitle="Resolve customer tickets and keep your team's tasks moving" onRefresh={reload} />
      <ErrorBanner errors={errors} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="To Resolve" value={v(toResolve.length)} icon={Ticket} color="bg-blue-500" hint="Open & assigned tickets" to="/teamlead/tickets" />
        <StatCard label="Urgent / High" value={v(urgent.length)} icon={AlertTriangle} color="bg-red-500" hint="Do these first" />
        <StatCard label="Resolved" value={v(resolved.length)} icon={CheckCircle} color="bg-green-500" hint={`Avg. fix time ${avgResolution(tickets)}`} />
        <StatCard label="My Projects" value={v(projects.length)} icon={FolderKanban} color="bg-purple-500" to="/teamlead/projects" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Team Tasks (open)" value={v(tasks.filter((t) => t.status !== "COMPLETED").length)} icon={ListChecks} color="bg-indigo-500" />
        <StatCard label="Tasks Overdue" value={v(overdueTasks.length)} icon={Clock} color={overdueTasks.length ? "bg-red-500" : "bg-gray-400"} />
        <StatCard label="Tasks Completed" value={v(taskStatus.COMPLETED || 0)} icon={CheckCircle} color="bg-green-500" />
      </div>

      <Card
        title="Tickets To Work On"
        action={<Link to="/teamlead/tickets" className="text-xs font-semibold text-[#0c2d67] hover:underline">View all</Link>}
      >
        <TicketTable
          tickets={[...toResolve].sort((a, b) => ["URGENT", "HIGH", "MEDIUM", "LOW"].indexOf(a.priority) - ["URGENT", "HIGH", "MEDIUM", "LOW"].indexOf(b.priority)).slice(0, 6)}
          showCustomer
          emptyText="No pending tickets — nice work!"
          actions={() => <Link to="/teamlead/tickets" className="text-xs font-semibold text-[#0c2d67] hover:underline">Open</Link>}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Tickets by Status">
          <Donut centerValue={tickets.length} centerLabel="tickets"
            segments={Object.entries(ticketStatus).map(([label, value]) => ({ label, value, color: STATUS_HEX[label] || "#94a3b8" }))} />
        </Card>
        <Card title="Tasks by Status">
          <Donut centerValue={tasks.length} centerLabel="tasks"
            segments={["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"].map((label) => ({ label, value: taskStatus[label] || 0, color: STATUS_HEX[label] }))} />
        </Card>
        <Card title="Open Tasks per Member"><BarList items={memberLoad} /></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Last 7 Days"><TrendChart days={ticketTrend(tickets)} /></Card>
        <Card title="Open Tickets by Priority">
          <BarList items={["URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => ({ label: p, value: toResolve.filter((t) => t.priority === p).length, color: PRIORITY_HEX[p] }))} />
        </Card>
      </div>

      <Card title="My Project Progress">
        {projects.length === 0 ? <Empty text="No projects assigned yet." /> : (
          <div className="space-y-4">
            {projects.slice(0, 6).map((p) => {
              const pr = projectProgress(p);
              const members = p.team_members?.length ?? parseIds(p.member_ids).length;
              return (
                <div key={p.id}>
                  <div className="flex justify-between items-center text-sm mb-1.5 gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                      <Pill text={p.status} className={statusColor(p.status)} />
                    </div>
                    <span className="text-xs text-gray-500">{members} members · due {fmtDate(p.end_date)} · {pr}%</span>
                  </div>
                  <ProgressBar value={pr} color={pr === 100 ? "#22c55e" : "#0c2d67"} />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="Project Ticket History"><ProjectHistoryTable rows={history} limit={6} /></Card>

      <Card title="Overdue Tasks">
        {overdueTasks.length === 0 ? <Empty text="No overdue tasks." /> : (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr><th className="py-2">Task</th><th className="py-2">Project</th><th className="py-2">Member</th><th className="py-2">Due</th></tr>
            </thead>
            <tbody>
              {overdueTasks.slice(0, 6).map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{t.title}</td>
                  <td className="py-2 text-gray-600">{t.project_name}</td>
                  <td className="py-2">{t.member_name}</td>
                  <td className="py-2 text-red-600 text-xs">{fmtDate(t.due_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;