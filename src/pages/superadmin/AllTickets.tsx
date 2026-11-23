import { BASE_URL } from "@/apiurl/apiurl";
import { useEffect, useMemo, useState } from "react";

type Ticket = {
  id: number;
  ticket_id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  customer_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
  // 🔽 new fields from the tickets API
  project_id: number | null;
  project_name: string | null;
  created_at: string;
  updated_at: string;
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
    case "REOPENED":
      return "bg-orange-100 text-orange-700";
    case "CLOSED":
      return "bg-gray-200 text-gray-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
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
      return "bg-yellow-100 text-yellow-700";
    case "LOW":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const AllTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Cache of project_id -> project name (fetched on demand from /api/projects/:id)
  const [projectNames, setProjectNames] = useState<Record<number, string>>({});

  // ---------- Fetch tickets ----------
  useEffect(() => {
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

    fetchTickets();
  }, []);

  // ---------- Pagination (computed before the effect that uses totalPages) ----------
  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedTickets = tickets.slice(startIndex, startIndex + PAGE_SIZE);

  // ---------- Fetch project names by id for the visible page (deduped + cached) ----------
  useEffect(() => {
    // Collect project_ids on the current page that:
    //  - are set
    //  - have no project_name in the ticket payload
    //  - haven't been fetched yet
    const idsToFetch = Array.from(
      new Set(
        paginatedTickets
          .filter(
            (t) =>
              t.project_id != null &&
              !t.project_name &&
              projectNames[t.project_id] === undefined
          )
          .map((t) => t.project_id as number)
      )
    );

    if (idsToFetch.length === 0) return;

    let cancelled = false;

    const fetchProjects = async () => {
      const results = await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const res = await fetch(`${BASE_URL}/api/projects/${id}`);
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error("failed");
            // API returns { success, data: {...project} }
            const project = data.data ?? data.project ?? data;
            return [id, project?.name ?? `#${id}`] as const;
          } catch {
            return [id, `#${id}`] as const;
          }
        })
      );

      if (!cancelled) {
        setProjectNames((prev) => {
          const next = { ...prev };
          for (const [id, name] of results) next[id] = name;
          return next;
        });
      }
    };

    fetchProjects();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginatedTickets, projectNames]);

  // Resolve the display name for a ticket's project
  const getProjectName = (t: Ticket): string | null => {
    if (t.project_name) return t.project_name;
    if (t.project_id != null) return projectNames[t.project_id] ?? null;
    return null;
  };

  // Keep page in range if the list shrinks
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0c2d67]">All Tickets</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading tickets…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No tickets found.
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
                </tr>
              </thead>
              <tbody>
                {paginatedTickets.map((t) => {
                  const projectName = getProjectName(t);
                  return (
                    <tr key={t.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">
                        {t.ticket_id}
                      </td>
                      <td className="px-4 py-3">{t.subject}</td>
                      <td className="px-4 py-3">
                        {projectName ? (
                          <span className="inline-block rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                            {projectName}
                          </span>
                        ) : t.project_id != null ? (
                          <span className="text-gray-400 text-xs">
                            Loading…
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
                        {t.status ? (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${statusColor(
                              t.status
                            )}`}
                          >
                            {t.status}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {t.assigned_to_name || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

export default AllTickets;