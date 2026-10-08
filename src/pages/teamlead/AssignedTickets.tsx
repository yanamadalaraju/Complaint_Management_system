import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, CheckCircle } from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

type Ticket = {
  id: number;
  ticket_id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  customer_id: number | null;
  customer_name: string | null;
  assigned_to: number | null;
  assigned_by: number | null;
  assigned_to_name: string | null;
  assigned_by_name: string | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
};

const statusColor = (status: string) => {
  switch (status) {
    case "ASSIGNED":
      return "bg-blue-100 text-blue-700";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-700";
    case "RESOLVED":
      return "bg-green-100 text-green-700";
    case "CLOSED":
      return "bg-gray-200 text-gray-700";
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
    case "LOW":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const AssignedTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch tickets assigned to logged-in teamlead ----------
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);

        // Read logged-in teamlead
        const stored = localStorage.getItem("teamlead_user");
        const teamlead = stored ? JSON.parse(stored) : null;

        if (!teamlead?.id) {
          throw new Error("You are not logged in as a team lead.");
        }

        const res = await fetch(
          `${BASE_URL}/api/tickets?assigned_to=${teamlead.id}`
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load tickets");
        }

        // Filter out resolved & closed on the client side
        const active = (data.data || []).filter(
          (t: Ticket) => t.status !== "RESOLVED" && t.status !== "CLOSED"
        );

        setTickets(active);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0c2d67]">Assigned Tickets</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading tickets…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
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
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No assigned tickets.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      {t.ticket_id}
                    </td>
                    <td className="px-4 py-3">{t.subject}</td>
                    <td className="px-4 py-3">
                      {t.customer_name || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${priorityColor(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${statusColor(
                          t.status
                        )}`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/teamlead/tickets/${t.id}`}
                          className="p-2 rounded hover:bg-blue-50 text-blue-600"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/teamlead/tickets/${t.id}/resolve`}
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
        )}
      </div>
    </div>
  );
};

export default AssignedTickets;