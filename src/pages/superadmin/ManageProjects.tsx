import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

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
  created_at: string;
};

const ManageProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch projects ----------
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${BASE_URL}/api/projects`);
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
  }, []);

  // ---------- Delete ----------
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project?")) return;

    try {
      const res = await fetch(`${BASE_URL}/api/projects/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete project");
      }

      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ---------- Format date ----------
  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0c2d67]">Manage Projects</h2>
        <Link
          to="/superadmin/projects/create"
          className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-4 py-2 rounded-lg hover:bg-[#0a2450] transition"
        >
          <Plus size={16} /> Create Project
        </Link>
      </div>

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
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No projects found. Click “Create Project” to add one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    {p.description || (
                      <span className="text-gray-400">—</span>
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
                  <td className="px-4 py-3">{formatDate(p.start_date)}</td>
                  <td className="px-4 py-3">{formatDate(p.end_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/superadmin/projects/${p.id}`}
                        className="p-2 rounded hover:bg-blue-50 text-blue-600"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/superadmin/projects/edit/${p.id}`}
                        className="p-2 rounded hover:bg-yellow-50 text-yellow-600"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded hover:bg-red-50 text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
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

export default ManageProjects;