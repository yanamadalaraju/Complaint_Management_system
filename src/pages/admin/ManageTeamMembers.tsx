import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";

type TeamMember = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  teamLeadName?: string | null;
  status: string;
  created_at: string;
};

const ManageTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch team members ----------
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:5000/api/teammembers");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load team members");
      }

      setTeamMembers(data.data || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // ---------- Delete ----------
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this team member?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/teammembers/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete team member");
      }

      // remove locally without refetching
      setTeamMembers((prev) => prev.filter((tm) => tm.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ---------- UI ----------
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0c2d67]">Manage Team Members</h2>
        <Link
          to="/admin/teammembers/create"
          className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-4 py-2 rounded-lg hover:bg-[#0a2450]"
        >
          <Plus size={16} /> Create Team Member
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading team members…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            {error}
            <button
              onClick={fetchTeamMembers}
              className="ml-3 underline text-[#0c2d67]"
            >
              Retry
            </button>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No team members found. Click “Create Team Member” to add one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((tm) => (
                <tr key={tm.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{tm.name}</td>
                  <td className="px-4 py-3">{tm.email}</td>
                  <td className="px-4 py-3">{tm.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 capitalize">
                      {tm.role || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        tm.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tm.status || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(tm.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/teammembers/${tm.id}`}
                        className="p-2 rounded hover:bg-blue-50 text-blue-600"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/admin/teammembers/edit/${tm.id}`}
                        className="p-2 rounded hover:bg-yellow-50 text-yellow-600"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(tm.id)}
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

export default ManageTeamMembers;