// src/pages/teammember/Dashboard.tsx
import { Link } from "react-router-dom";
import { CheckCircle, ListTodo, Loader, Ban } from "lucide-react";
import {
  useApi, getStoredUser, StatCard, Card, PageHeader, ErrorBanner, Donut, Empty, Pill, ProgressBar,
  statusColor, priorityColor, STATUS_HEX, countBy, isOverdue, parseIds, fmtDate, Project, Task,
} from "@/components/dashboard/DashboardKit";

const Dashboard = () => {
  const me = getStoredUser(["teammember_user", "teammember", "member_user", "user"]);
  const { data, loading, errors, reload } = useApi(["/api/tasks", "/api/projects"]);

  const allTasks = data[0] as Task[];
  const allProjects = data[1] as Project[];

  const tasks = me ? allTasks.filter((t) => t.member_id === me.id) : allTasks;
  const projects = me
    ? allProjects.filter((p) => parseIds(p.member_ids).includes(me.id) || p.team_members?.some((m) => m.id === me.id))
    : allProjects;

  const v = (n: number | string) => (loading ? "…" : n);
  const by = countBy(tasks, (t) => t.status);
  const overdue = tasks.filter((t) => isOverdue(t.due_date, t.status));
  const dueSoon = tasks.filter((t) => {
    if (t.status === "COMPLETED" || !t.due_date) return false;
    const d = new Date(t.due_date).getTime() - Date.now();
    return d >= 0 && d <= 3 * 86400000;
  });
  const done = by.COMPLETED || 0;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const focus = tasks
    .filter((t) => t.status !== "COMPLETED")
    .sort((a, b) => {
      const ao = isOverdue(a.due_date, a.status) ? 0 : 1;
      const bo = isOverdue(b.due_date, b.status) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return new Date(a.due_date || "2100-01-01").getTime() - new Date(b.due_date || "2100-01-01").getTime();
    })
    .slice(0, 6);

  const withFeedback = tasks.filter((t) => t.teamlead_reply).slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader title="My Dashboard" subtitle="Your tasks across all projects" onRefresh={reload} />
      <ErrorBanner errors={errors} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="To Do" value={v(by.TODO || 0)} icon={ListTodo} color="bg-slate-500" to="/teammember/tasks" />
        <StatCard label="In Progress" value={v(by.IN_PROGRESS || 0)} icon={Loader} color="bg-purple-500" to="/teammember/tasks" />
        <StatCard label="Blocked" value={v(by.BLOCKED || 0)} icon={Ban} color="bg-red-500" />
        <StatCard label="Completed" value={v(done)} icon={CheckCircle} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Overall Progress">
          <div className="text-center py-2">
            <p className="text-4xl font-bold text-[#0c2d67]">{loading ? "…" : `${pct}%`}</p>
            <p className="text-sm text-gray-500 mb-4">{done} of {tasks.length} tasks completed</p>
            <ProgressBar value={pct} color="#22c55e" />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-6 text-center">
            <div className={`rounded-lg p-3 ${overdue.length ? "bg-red-50" : "bg-gray-50"}`}>
              <p className={`text-xl font-bold ${overdue.length ? "text-red-600" : "text-gray-400"}`}>{overdue.length}</p>
              <p className="text-xs text-gray-500">Overdue</p>
            </div>
            <div className={`rounded-lg p-3 ${dueSoon.length ? "bg-yellow-50" : "bg-gray-50"}`}>
              <p className={`text-xl font-bold ${dueSoon.length ? "text-yellow-600" : "text-gray-400"}`}>{dueSoon.length}</p>
              <p className="text-xs text-gray-500">Due in 3 days</p>
            </div>
          </div>
        </Card>

        <Card title="Tasks by Status">
          <Donut centerValue={tasks.length} centerLabel="tasks"
            segments={["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"].map((label) => ({ label, value: by[label] || 0, color: STATUS_HEX[label] }))} />
        </Card>

        <Card title="Latest Feedback from Team Lead">
          {withFeedback.length === 0 ? <Empty text="No feedback yet." /> : (
            <ul className="space-y-3">
              {withFeedback.map((t) => (
                <li key={t.id} className="text-sm border-l-2 border-[#0c2d67] pl-3">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-gray-600">“{t.teamlead_reply}”</p>
                  <p className="text-xs text-gray-400">— {t.assigned_by_name}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        title="Focus Now — Most Urgent Tasks"
        action={<Link to="/teammember/tasks" className="text-xs font-semibold text-[#0c2d67] hover:underline">All tasks</Link>}
      >
        {focus.length === 0 ? <Empty text="You're all caught up 🎉" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b">
                <tr>
                  <th className="py-2 pr-3">Task</th><th className="py-2 pr-3">Project</th><th className="py-2 pr-3">Priority</th>
                  <th className="py-2 pr-3">Due</th><th className="py-2 pr-3">Assigned By</th><th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {focus.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2 pr-3">
                      <p className="font-medium">{t.title}</p>
                      {t.description && <p className="text-xs text-gray-500">{t.description}</p>}
                    </td>
                    <td className="py-2 pr-3 text-gray-600">{t.project_name}</td>
                    <td className="py-2 pr-3"><Pill text={t.priority} className={priorityColor(t.priority)} /></td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <span className={isOverdue(t.due_date, t.status) ? "text-red-600 font-medium" : "text-gray-600"}>{fmtDate(t.due_date)}</span>
                      {isOverdue(t.due_date, t.status) && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">OVERDUE</span>}
                    </td>
                    <td className="py-2 pr-3">{t.assigned_by_name}</td>
                    <td className="py-2"><Pill text={t.status} className={statusColor(t.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="My Projects">
        {projects.length === 0 ? <Empty text="You're not part of any project yet." /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.slice(0, 6).map((p) => {
              const pt = tasks.filter((t) => t.project_id === p.id);
              const pd = pt.filter((t) => t.status === "COMPLETED").length;
              const pr = pt.length ? Math.round((pd / pt.length) * 100) : p.status === "COMPLETED" ? 100 : 0;
              return (
                <div key={p.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-medium">{p.name}</p>
                    <Pill text={p.status} className={statusColor(p.status)} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Lead: {p.teamlead_name || "—"} · Ends {fmtDate(p.end_date)}</p>
                  <div className="flex justify-between text-xs text-gray-500 mt-3 mb-1">
                    <span>{pd}/{pt.length} tasks done</span><span>{pr}%</span>
                  </div>
                  <ProgressBar value={pr} color="#22c55e" />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;