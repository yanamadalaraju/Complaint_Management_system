import { Users, Ticket, CheckCircle, Clock } from "lucide-react";
import { mockAdmins, mockTickets } from "@/data/mockData";

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
  const totalTickets = mockTickets.length;
  const openTickets = mockTickets.filter((t) => t.status === "OPEN").length;
  const resolvedTickets = mockTickets.filter((t) => t.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0c2d67]">Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Admins" value={mockAdmins.length} icon={Users} color="bg-blue-500" />
        <StatCard label="Total Tickets" value={totalTickets} icon={Ticket} color="bg-purple-500" />
        <StatCard label="Open Tickets" value={openTickets} icon={Clock} color="bg-yellow-500" />
        <StatCard label="Resolved" value={resolvedTickets} icon={CheckCircle} color="bg-green-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-[#0c2d67] mb-4">Recent Admins</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Phone</th>
                <th className="py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {mockAdmins.map((a) => (
                <tr key={a._id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{a.name}</td>
                  <td className="py-2">{a.email}</td>
                  <td className="py-2">{a.phone}</td>
                  <td className="py-2">{a.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;