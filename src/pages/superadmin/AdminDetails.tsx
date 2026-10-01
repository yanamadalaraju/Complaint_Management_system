import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import { mockAdmins, mockTickets } from "@/data/mockData";

const AdminDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const admin = mockAdmins.find((a) => a._id === id);
  const assignedTickets = mockTickets.filter((t) => t.assignedBy?._id === id);

  if (!admin) {
    return <p className="text-red-500">Admin not found</p>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {admin.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0c2d67]">{admin.name}</h2>
            <p className="text-sm text-gray-500 capitalize">{admin.role}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm">
            <Mail size={16} className="text-[#0c2d67]" /> {admin.email}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} className="text-[#0c2d67]" /> {admin.phone || "—"}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-[#0c2d67]" /> Joined {admin.createdAt}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-[#0c2d67] mb-4">
          Tickets Assigned by this Admin ({assignedTickets.length})
        </h3>
        {assignedTickets.length === 0 ? (
          <p className="text-gray-500 text-sm">No tickets assigned yet.</p>
        ) : (
          <ul className="space-y-2">
            {assignedTickets.map((t) => (
              <li
                key={t._id}
                className="flex justify-between items-center border-b last:border-0 py-2 text-sm"
              >
                <span>
                  <span className="font-mono text-xs text-gray-500 mr-2">
                    {t.ticketId}
                  </span>
                  {t.subject}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {t.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDetails;