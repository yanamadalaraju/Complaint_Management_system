import { Link } from "react-router-dom";
import { Eye, CheckCircle } from "lucide-react";
import { mockTickets } from "@/data/mockData";

const statusColor = (status: string) => {
  switch (status) {
    case "ASSIGNED":
      return "bg-blue-100 text-blue-700";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-700";
    case "RESOLVED":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const priorityColor = (p: string) => {
  switch (p) {
    case "URGENT":
      return "bg-red-100 text-red-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const AssignedTickets = () => {
  // Only tickets that are assigned (not resolved/closed)
  const tickets = mockTickets.filter(
    (t) => t.assignedTo && t.status !== "RESOLVED" && t.status !== "CLOSED"
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0c2d67]">Assigned Tickets</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3">Ticket ID</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No assigned tickets.
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr key={t._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{t.ticketId}</td>
                  <td className="px-4 py-3">{t.subject}</td>
                  <td className="px-4 py-3">{t.customer.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${priorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/teamlead/tickets/${t._id}`}
                        className="p-2 rounded hover:bg-blue-50 text-blue-600"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/teamlead/tickets/${t._id}/resolve`}
                        className="p-2 rounded hover:bg-green-50 text-green-600"
                        title="Resolve"
                      >
                        <CheckCircle size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignedTickets;