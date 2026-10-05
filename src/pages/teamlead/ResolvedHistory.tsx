import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, CheckCircle } from "lucide-react";

type Project = {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  customer_id: number | null;
  admin_id: number | null;
  teamlead_id: number | null;
  status: string;                       // ASSIGNED | IN_PROGRESS | COMPLETED | ON_HOLD | CLOSED
  progress_notes: string | null;
  customer_response: string | null;
  customer_status: string | null;       // RESOLVED | PENDING
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_email: string | null;
  admin_name: string | null;
  admin_email: string | null;
  teamlead_name: string | null;
  teamlead_email: string | null;
};

const formatDateTime = (d: string | null) => {
  if (!d) return "—";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const statusPill = (status: string) => {
  switch (String(status).toUpperCase()) {
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "CLOSED":
      return "bg-gray-200 text-gray-700";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-700";
    case "ON_HOLD":
      return "bg-yellow-100 text-yellow-700";
    case "ASSIGNED":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const customerPill = (status: string | null) => {
  switch (status) {
    case "RESOLVED":
      return "bg-green-100 text-green-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const ResolvedHistory = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResolved = async () => {
      try {
        setLoading(true);
        setError(null);

        const stored = localStorage.getItem("teamlead_user");
        const teamlead = stored ? JSON.parse(stored) : null;

        if (!teamlead?.id) {
          throw new Error("You are not logged in as a team lead.");
        }

        const res = await fetch("http://localhost:5000/api/projects");
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load projects");
        }

        // 👇 Only this teamlead's projects where the CUSTOMER has RESOLVED
        const resolved = (data.data || []).filter(
          (p: Project) =>
            Number(p.teamlead_id) === Number(teamlead.id) &&
            String(p.customer_status).toUpperCase() === "RESOLVED"
        );

        setProjects(resolved);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchResolved();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0c2d67]">Resolved History</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Project #</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Project Status</th>
                <th className="px-4 py-3">Customer Status</th>
                <th className="px-4 py-3">Resolved On</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No resolved projects yet.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">#{p.id}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">
                      {p.customer_name || (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${statusPill(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.customer_status ? (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${customerPill(
                            p.customer_status
                          )}`}
                        >
                          {p.customer_status}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDateTime(p.updated_at || p.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Link
                          to={`/teamlead/projects/${p.id}`}
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
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle className="text-green-600 mt-0.5" size={18} />
        <p className="text-sm text-green-800">
          Only projects where the <strong>customer marked RESOLVED</strong> appear here.
        </p>
      </div>
    </div>
  );
};

export default ResolvedHistory;