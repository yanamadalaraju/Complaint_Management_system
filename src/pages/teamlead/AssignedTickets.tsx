import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  project_id: number | null;
  project_name: string | null;
};

const PAGE_SIZE = 10;

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
    case "REOPENED": // ✅ ADDED
      return "bg-orange-100 text-orange-700";
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
  const [page, setPage] = useState(1);

  const location = useLocation();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const stored = localStorage.getItem("teamlead_user");
      const teamlead = stored ? JSON.parse(stored) : null;

      if (!teamlead?.id) {
        throw new Error("You are not logged in as a team lead.");
      }

      const res = await fetch(
        `${BASE_URL}/api/tickets?assigned_to=${teamlead.id}&_ts=${Date.now()}`,
        { cache: "no-store" }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load tickets");
      }

      const list: Ticket[] = data.data || [];
      setTickets(list);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    const onFocus = () => fetchTickets();
    const onVis = () => {
      if (document.visibilityState === "visible") fetchTickets();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [location.key]);

  // ---------- Pagination ----------
  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedTickets = tickets.slice(startIndex, startIndex + PAGE_SIZE);

  // Keep page in range if the list shrinks (e.g. after a refresh)
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0c2d67]">Assigned Tickets</h2>

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
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No assigned tickets.
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((t) => (
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
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/teamlead/tickets/${t.id}`}
                            className="p-2 rounded hover:bg-blue-50 text-blue-600"
                            title="View"
                          >
                            <Eye size={16} />
                          </Link>
                          {t.status !== "RESOLVED" &&
                            t.status !== "CLOSED" && (
                              <Link
                                to={`/teamlead/tickets/${t.id}/resolve`}
                                className="p-2 rounded hover:bg-green-50 text-green-600"
                                title="Resolve"
                              >
                                <CheckCircle size={16} />
                              </Link>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------- Pagination controls ---------- */}
        {!loading && !error && tickets.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
            <span>
              Showing {startIndex + 1}–
              {Math.min(startIndex + PAGE_SIZE, tickets.length)} of{" "}
              {tickets.length}
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

export default AssignedTickets;