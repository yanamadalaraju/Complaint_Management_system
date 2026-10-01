import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, CheckCircle, Clock } from "lucide-react";
import { mockTickets } from "@/data/mockData";

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
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticket = mockTickets.find((t) => t._id === id);

  if (!ticket) return <p className="text-red-500">Ticket not found</p>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div>
        <h2 className="text-2xl font-bold text-[#0c2d67]">{ticket.subject}</h2>
        <p className="text-sm text-gray-500 font-mono">{ticket.ticketId}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="mt-1">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p>{ticket.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Priority</p>
              <p>{ticket.priority}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className={`inline-block text-xs px-2 py-1 rounded-full ${statusColor(ticket.status)}`}>
                {ticket.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p>{ticket.createdAt}</p>
            </div>
          </div>

          {ticket.resolutionNotes && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                <CheckCircle size={16} /> Resolution
              </p>
              <p className="text-sm text-green-700 mt-1">{ticket.resolutionNotes}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div>
            <h3 className="font-semibold text-[#0c2d67] flex items-center gap-2">
              <User size={16} /> Assigned To
            </h3>
            {ticket.assignedTo ? (
              <div className="text-sm mt-2 space-y-1">
                <p className="font-medium">{ticket.assignedTo.name}</p>
                <p className="text-gray-500 text-xs">{ticket.assignedTo.email}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                Not assigned yet — waiting for admin.
              </p>
            )}
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold text-[#0c2d67] flex items-center gap-2">
              <Clock size={16} /> Timeline
            </h3>
            <ul className="text-xs text-gray-600 mt-2 space-y-2">
              <li>✅ Created on {ticket.createdAt}</li>
              {ticket.assignedTo && <li>👤 Assigned to {ticket.assignedTo.name}</li>}
              {ticket.status === "RESOLVED" && <li>✅ Resolved</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;