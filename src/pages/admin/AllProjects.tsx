import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, UserPlus, Search, RefreshCw, ShieldOff } from "lucide-react";

type Project = {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  customer_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  admin_id: number | null;
  admin_name: string | null;
  admin_email: string | null;
  teamlead_id: number | null;
  teamlead_name: string | null;
  created_at: string;
};

const AllProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  const [customerFilter, setCustomerFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // ---------- Read logged-in admin ----------
  const me = useMemo(() => {
    const stored = localStorage.getItem("admin_user");
    return stored ? JSON.parse(stored) : null;
  }, []);

  // ---------- Fetch ----------
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!me?.id) {
        setNotLoggedIn(true);
        setLoading(false);
        return;
      }
      setNotLoggedIn(false);

      const res = await fetch("http://localhost:5000/api/projects");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load projects");
      }

      setProjects(data.data || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Unique customers for filters ----------
  const customers = useMemo(() => {
    const map = new Map<number, string>();
    projects.forEach((p) => {
      if (p.customer_id && p.customer_name) {
        map.set(p.customer_id, p.customer_name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [projects]);

  // ---------- Filter + search (scoped to me) ----------
  const filtered = useMemo(() => {
    return projects
      .filter((p) => me?.id && p.admin_id === me.id)
      .filter((p) => {
        if (
          customerFilter !== "ALL" &&
          String(p.customer_id) !== customerFilter
        )
          return false;

        if (search.trim()) {
          const q = search.toLowerCase();
          const haystack = [
            p.name,
            p.description || "",
            p.customer_name || "",
            p.customer_email || "",
            p.admin_name || "",
            p.teamlead_name || "",
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }

        return true;
      });
  }, [projects, customerFilter, search, me]);

  // ---------- Format date ----------
  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  // ---------- Not logged in ----------
  if (notLoggedIn) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#0c2d67]">My Projects</h2>
        <div className="bg-white rounded-xl shadow-sm p-10 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <ShieldOff size={26} />
          </div>
          <h3 className="text-lg font-bold text-[#0c2d67]">Not signed in</h3>
          <p className="text-sm text-gray-600">
            Please log in as an admin to view your projects.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[#0c2d67]">My Projects</h2>
        <button
          onClick={fetchProjects}
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
            placeholder="Search by project name, customer…"
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
          />
        </div>

        <select
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="ALL">All Customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading projects…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            {error}
            <button
              onClick={fetchProjects}
              className="ml-3 underline text-[#0c2d67]"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            You don't have any projects assigned yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Team Lead</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">End</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.name}</p>
                    {p.description && (
                      <p className="text-xs text-gray-500 truncate max-w-[240px]">
                        {p.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.customer_name ? (
                      <div className="space-y-0.5">
                        <p className="font-medium">{p.customer_name}</p>
                        {p.customer_email && (
                          <p className="text-xs text-gray-500">
                            {p.customer_email}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.admin_name ? (
                      <div className="space-y-0.5">
                        <p className="font-medium">{p.admin_name}</p>
                        {p.admin_email && (
                          <p className="text-xs text-gray-500">
                            {p.admin_email}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.teamlead_name ? (
                      <span className="font-medium">{p.teamlead_name}</span>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{formatDate(p.start_date)}</td>
                  <td className="px-4 py-3">{formatDate(p.end_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/projects/${p.id}`}
                        className="p-2 rounded hover:bg-blue-50 text-blue-600"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      {!p.teamlead_id && (
                        <Link
                          to={`/admin/projects/${p.id}/assign`}
                          className="p-2 rounded hover:bg-green-50 text-green-600"
                          title="Assign Team Lead"
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
        )}
      </div>
    </div>
  );
};

export default AllProjects;