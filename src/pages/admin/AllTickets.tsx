import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, UserPlus, Search, RefreshCw } from "lucide-react";
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
  customer_email: string | null;
  assigned_to: number | null;
  assigned_by: number | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_name: string | null;
  assigned_by_name: string | null;
  project_id: number | null;
  project_name: string | null;
};

const PAGE_SIZE = 10;

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
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "REOPENED": // ✅ ADDED
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const priorityColor = (priority: string) => {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "MEDIUM":
      return "bg-blue-100 text-blue-700";
    case "LOW":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const AllTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // ---------- Fetch ----------
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${BASE_URL}/api/tickets`);
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

  useEffect(() => {
    fetchTickets();
  }, []);

  // ---------- Client-side filter + search ----------
  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter)
        return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = [
          t.ticket_id,
          t.subject,
          t.customer_name || "",
          t.customer_email || "",
          t.category,
          t.project_name || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [tickets, statusFilter, priorityFilter, search]);

  // ---------- Pagination ----------
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  // Go back to page 1 whenever filters/search change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, priorityFilter, search]);

  // Keep page in range if the list shrinks
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[#0c2d67]">All Tickets</h2>
        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 text-sm text-[#0c2d67] hover:underline"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket id, subject, customer, project…"
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="REOPENED">Reopened</option> {/* ✅ ADDED */}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="ALL">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading tickets…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            {error}
            <button
              onClick={fetchTickets}
              className="ml-3 underline text-[#0c2d67]"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No tickets match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      {t.ticket_id}
                    </td>
                    <td className="px-4 py-3">{t.subject}</td>

                    <td className="px-4 py-3">
                      {t.project_name ? (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap"
                          title={t.project_name}
                        >
                          {t.project_name}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

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
                        {t.status || "UNKNOWN"} {/* 👈 Fallback just in case */}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {t.assigned_to_name || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/tickets/${t.id}`}
                          className="p-2 rounded hover:bg-blue-50 text-blue-600"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        {t.status === "OPEN" && (
                          <Link
                            to={`/admin/tickets/${t.id}/assign`}
                            className="p-2 rounded hover:bg-green-50 text-green-600"
                            title="Assign"
                          >
                            <UserPlus size={16} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------- Pagination controls ---------- */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
            <span>
              Showing {startIndex + 1}–
              {Math.min(startIndex + PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTickets;