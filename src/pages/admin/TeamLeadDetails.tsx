import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import { mockTeamLeads, mockTickets } from "@/data/mockData";

const TeamLeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const tl = mockTeamLeads.find((t) => t._id === id);
  const assigned = mockTickets.filter((t) => t.assignedTo?._id === id);
  const resolved = assigned.filter((t) => t.status === "RESOLVED").length;

  if (!tl) return <p className="text-red-500">Team Lead not found</p>;

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
            {tl.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0c2d67]">{tl.name}</h2>
            <p className="text-sm text-gray-500 capitalize">{tl.role}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm">
            <Mail size={16} className="text-[#0c2d67]" /> {tl.email}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} className="text-[#0c2d67]" /> {tl.phone || "—"}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Assigned</p>
          <p className="text-3xl font-bold text-[#0c2d67]">{assigned.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-3xl font-bold text-green-600">{resolved}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-[#0c2d67] mb-4">Assigned Tickets</h3>
        {assigned.length === 0 ? (
          <p className="text-sm text-gray-500">No tickets assigned yet.</p>
        ) : (
          <ul className="space-y-2">
            {assigned.map((t) => (
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

export default TeamLeadDetails;