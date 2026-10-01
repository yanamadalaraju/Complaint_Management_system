import { Link } from "react-router-dom";
import { Ticket, Clock, CheckCircle, PlusCircle } from "lucide-react";
import { mockTickets } from "@/data/mockData";

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

const Dashboard = () => {
  // In real app, filter by logged-in customer
  const myTickets = mockTickets;

  const open = myTickets.filter((t) => t.status === "OPEN" || t.status === "ASSIGNED").length;
  const inProgress = myTickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolved = myTickets.filter((t) => t.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[#0c2d67]">My Dashboard</h2>
        <Link
          to="/customer/tickets/create"
          className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-4 py-2 rounded-lg hover:bg-[#0a2450]"
        >
          <PlusCircle size={16} /> Raise New Ticket
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Open / Assigned" value={open} icon={Ticket} color="bg-yellow-500" />
        <StatCard label="In Progress" value={inProgress} icon={Clock} color="bg-blue-500" />
        <StatCard label="Resolved" value={resolved} icon={CheckCircle} color="bg-green-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-[#0c2d67] mb-4">Recent Tickets</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="py-2">Ticket ID</th>
              <th className="py-2">Subject</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {myTickets.slice(0, 5).map((t) => (
              <tr key={t._id} className="border-b last:border-0">
                <td className="py-2 font-mono text-xs">{t.ticketId}</td>
                <td className="py-2">{t.subject}</td>
                <td className="py-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {t.status}
                  </span>
                </td>
                <td className="py-2 text-right">
                  <Link
                    to={`/customer/tickets/${t._id}`}
                    className="text-[#0c2d67] hover:underline text-xs font-semibold"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;