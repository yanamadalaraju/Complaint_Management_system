// src/pages/customer/MyTickets.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  PlusCircle,
  History as HistoryIcon,
  RotateCcw, // ✅ added for reopen action
} from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

/* ---------------- Types ---------------- */
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
  assigned_to_email: string | null;
  assigned_by_name: string | null;
  assigned_by_email: string | null;
  resolution_notes: string | null;
  project_id: number | null;
  project_name: string | null;
};

const PAGE_SIZE = 10;

/* ---------------- Helpers ---------------- */
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

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* ---------------- Component ---------------- */
const MyTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reopeningId, setReopeningId] = useState<number | null>(null); // ✅ added
  const [page, setPage] = useState(1);

  /* ---------- Fetch tickets ---------- */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const stored = localStorage.getItem("customer_user");
      const customer = stored ? JSON.parse(stored) : null;

      if (!customer?.id) {
        setTickets([]);
        return;
      }

      const res = await fetch(
        `${BASE_URL}/api/tickets?customer_id=${customer.id}`
      );
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
    fetchData();
  }, []);

  /* ---------- Pagination ---------- */
  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedTickets = tickets.slice(startIndex, startIndex + PAGE_SIZE);

  // Keep page in range if the list shrinks
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  /* ---------- Open history for the ticket's project ---------- */
  const openHistory = (t: Ticket) => {
    // History page shows ONLY this ticket (?ticket=<id>).
    // project_id may be null, so 0 is used as a placeholder for the :projectId segment.
    navigate(`/customer/history/${t.project_id ?? 0}?ticket=${t.id}`);
  };

  /* ---------- Reopen a resolved/closed ticket ---------- */
  const reopenTicket = async (t: Ticket) => {
    if (reopeningId !== null) return; // prevent double-clicks across rows
    try {
      setReopeningId(t.id);

      const res = await fetch(`${BASE_URL}/api/tickets/${t.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REOPENED" }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to reopen ticket");
      }

      // Update local state so UI reflects immediately
      setTickets((prev) =>
        prev.map((item) =>
          item.id === t.id ? { ...item, status: "REOPENED" } : item
        )
      );
    } catch (err: any) {
      alert(err.message || "Failed to reopen ticket");
    } finally {
      setReopeningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[#0c2d67]">My Tickets</h2>
        <Link
          to="/customer/tickets/create"
          className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-4 py-2 rounded-lg hover:bg-[#0a2450]"
        >
          <PlusCircle size={16} /> Raise New Ticket
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading tickets…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            {error}
            <button
              onClick={fetchData}
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
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
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
                      You haven't raised any tickets yet.
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((t) => (
                    <tr
                      key={t.id}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                      onClick={() => openHistory(t)}
                    >
                      <td className="px-4 py-3 font-mono text-xs">
                        {t.ticket_id}
                      </td>
                      <td className="px-4 py-3">{t.subject}</td>

                      <td className="px-4 py-3">
                        {t.project_name ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
                            title={t.project_name}
                          >
                            {t.project_name}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No project
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">{t.category}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${statusColor(
                            t.status
                          )}`}
                        >
                          {t.status || "UNKNOWN"} {/* 👈 Fallback just in case */}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {shortDate(t.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          {/* ✅ Reopen — only for RESOLVED / CLOSED tickets */}
                          {(t.status === "RESOLVED" ||
                            t.status === "CLOSED") && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                reopenTicket(t);
                              }}
                              disabled={reopeningId === t.id}
                              className="p-2 rounded hover:bg-orange-50 text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reopen Ticket"
                            >
                              {reopeningId === t.id ? (
                                <span
                                  className="inline-block w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin"
                                  aria-label="Reopening"
                                />
                              ) : (
                                <RotateCcw size={16} />
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openHistory(t);
                            }}
                            className="p-2 rounded hover:bg-purple-50 text-purple-600 disabled:opacity-40 disabled:cursor-not-allowed"
                            title="View Ticket History"
                          >
                            <HistoryIcon size={16} />
                          </button>
                          <Link
                            to={`/customer/tickets/${t.id}`}
                            onClick={(e) => e.stopPropagation()}
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

export default MyTickets;