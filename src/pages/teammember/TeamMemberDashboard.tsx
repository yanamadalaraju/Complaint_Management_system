import { Ticket, Clock, CheckCircle, Users } from "lucide-react";
import { mockTickets, mockTeamLeads } from "@/data/mockData";

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: any;
  color: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-[#0c2d67]">{value}</p>
    </div>
  </div>
);

const TeamMemberDashboard = () => {
  const newTickets = mockTickets.filter((t) => t.status === "OPEN").length;
  const assigned = mockTickets.filter((t) => t.status === "ASSIGNED").length;
  const resolved = mockTickets.filter((t) => t.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0c2d67]">Admin Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="New Tickets" value={newTickets} icon={Ticket} color="bg-yellow-500" />
        <StatCard label="Assigned" value={assigned} icon={Clock} color="bg-blue-500" />
        <StatCard label="Resolved" value={resolved} icon={CheckCircle} color="bg-green-500" />
        <StatCard label="Team Leads" value={mockTeamLeads.length} icon={Users} color="bg-purple-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-[#0c2d67] mb-4">Recent Tickets</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="py-2">Ticket ID</th>
              <th className="py-2">Subject</th>
              <th className="py-2">Customer</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockTickets.slice(0, 5).map((t) => (
              <tr key={t._id} className="border-b last:border-0">
                <td className="py-2 font-mono text-xs">{t.ticketId}</td>
                <td className="py-2">{t.subject}</td>
                <td className="py-2">{t.customer.name}</td>
                <td className="py-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamMemberDashboard;