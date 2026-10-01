import { mockTickets, mockAdmins } from "@/data/mockData";

const Bar = ({ value, max, color }: { value: number; max: number; color: string }) => (
  <div className="w-full bg-gray-100 rounded-full h-3">
    <div
      className={`h-3 rounded-full ${color}`}
      style={{ width: `${max ? (value / max) * 100 : 0}%` }}
    />
  </div>
);

const Reports = () => {
  const statuses = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"];
  const counts = statuses.map(
    (s) => mockTickets.filter((t) => t.status === s).length
  );
  const max = Math.max(...counts, 1);

  const colors = [
    "bg-yellow-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-gray-500",
    "bg-red-500",
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0c2d67]">Reports & Analytics</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-[#0c2d67] mb-4">Tickets by Status</h3>
          <div className="space-y-3">
            {statuses.map((s, i) => (
              <div key={s}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s}</span>
                  <span className="font-semibold">{counts[i]}</span>
                </div>
                <Bar value={counts[i]} max={max} color={colors[i]} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-[#0c2d67] mb-4">Admins Overview</h3>
          <ul className="space-y-3 text-sm">
            {mockAdmins.map((a) => {
              const count = mockTickets.filter((t) => t.assignedBy?._id === a._id).length;
              return (
                <li key={a._id} className="flex justify-between items-center border-b last:border-0 py-2">
                  <div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-gray-500">{a.email}</p>
                  </div>
                  <span className="font-semibold text-[#0c2d67]">{count} tickets</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reports;