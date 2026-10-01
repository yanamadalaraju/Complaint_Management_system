import { Link } from "react-router-dom";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import { mockTeamLeads } from "@/data/mockData";

const ManageTeamLeads = () => {
  const handleDelete = (id: string) => {
    if (confirm("Delete this team lead?")) {
      alert("Delete API to be wired. ID: " + id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0c2d67]">Manage Team Leads</h2>
        <Link
          to="/admin/teamleads/create"
          className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-4 py-2 rounded-lg hover:bg-[#0a2450]"
        >
          <Plus size={16} /> Create Team Lead
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockTeamLeads.map((tl) => (
              <tr key={tl._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{tl.name}</td>
                <td className="px-4 py-3">{tl.email}</td>
                <td className="px-4 py-3">{tl.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/admin/teamleads/${tl._id}`}
                      className="p-2 rounded hover:bg-blue-50 text-blue-600"
                      title="View"
                    >
                      <Eye size={16} />
                    </Link>
                    <Link
                      to={`/admin/teamleads/edit/${tl._id}`}
                      className="p-2 rounded hover:bg-yellow-50 text-yellow-600"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(tl._id)}
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
      </div>
    </div>
  );
};

export default ManageTeamLeads;