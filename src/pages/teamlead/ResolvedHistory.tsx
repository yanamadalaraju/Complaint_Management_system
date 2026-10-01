import { Link } from "react-router-dom";
import { Eye, CheckCircle } from "lucide-react";
import { mockTickets } from "@/data/mockData";

const ResolvedHistory = () => {
  const resolved = mockTickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0c2d67]">Resolved History</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3">Ticket ID</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Resolved On</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resolved.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No resolved tickets yet.
                </td>
              </tr>
            ) : (
              resolved.map((t) => (
                <tr key={t._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{t.ticketId}</td>
                  <td className="px-4 py-3">{t.subject}</td>
                  <td className="px-4 py-3">{t.customer.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {t.updatedAt || t.createdAt}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Link
                        to={`/teamlead/tickets/${t._id}`}
                        className="p-2 rounded hover:bg-blue-50 text-blue-600"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle className="text-green-600 mt-0.5" size={18} />
        <p className="text-sm text-green-800">
          When you resolve a ticket, the customer and admin are automatically
          notified via email and in-app notification.
        </p>
      </div>
    </div>
  );
};

export default ResolvedHistory;