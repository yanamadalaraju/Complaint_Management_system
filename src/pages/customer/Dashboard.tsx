import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ticket, Clock, CheckCircle, PlusCircle } from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

type TicketRow = {
  id: number;
  ticket_id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  customer_id: number | null;
  assigned_to: number | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
};

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
    <div
      className={`w-12 h-12 rounded-lg flex items-center justify-center text-white ${color}`}
    >
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-[#0c2d67]">{value}</p>
    </div>
  </div>
);

const statusColor = (status: string) => {
  switch (status) {
    case "OPEN":
      return "bg-yellow-100 text-yellow-700";
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

const Dashboard = () => {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch tickets ----------
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);

        // Scope to logged-in customer if available; otherwise show all (dev)
        const stored = localStorage.getItem("customer_user");
        const customer = stored ? JSON.parse(stored) : null;

        const url = customer?.id
          ? `${BASE_URL}/api/tickets?customer_id=${customer.id}`
          : `${BASE_URL}/api/tickets`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load tickets");
        }

        setTickets(data.data || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // ---------- Stats ----------
  const open = tickets.filter(
    (t) => t.status === "OPEN" || t.status === "ASSIGNED"
  ).length;
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolved = tickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  ).length;

  // ---------- Recent ----------
  const recent = tickets.slice(0, 5);

  // ---------- Format date ----------
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

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

      {/* ---------- Stats ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Open / Assigned"
          value={loading ? "…" : open}
          icon={Ticket}
          color="bg-yellow-500"
        />
        <StatCard
          label="In Progress"
          value={loading ? "…" : inProgress}
          icon={Clock}
          color="bg-blue-500"
        />
        <StatCard
          label="Resolved"
          value={loading ? "…" : resolved}
          icon={CheckCircle}
          color="bg-green-500"
        />
      </div>

      {/* ---------- Recent Tickets ---------- */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-[#0c2d67] mb-4">Recent Tickets</h3>

        {loading ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Loading tickets…
          </p>
        ) : error ? (
          <p className="text-sm text-red-600 text-center py-4">{error}</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No tickets yet. Click “Raise New Ticket” to create one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="py-2">Ticket ID</th>
                <th className="py-2">Subject</th>
                <th className="py-2">Status</th>
                <th className="py-2">Created</th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-2 font-mono text-xs">{t.ticket_id}</td>
                  <td className="py-2">{t.subject}</td>
                  <td className="py-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${statusColor(
                        t.status
                      )}`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500 text-xs">
                    {formatDate(t.created_at)}
                  </td>
                  <td className="py-2 text-right">
                    <Link
                      to={`/customer/tickets/${t.id}`}
                      className="text-[#0c2d67] hover:underline text-xs font-semibold"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;