import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";
import { mockTickets } from "@/data/mockData";

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

      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0c2d67]">{ticket.subject}</h2>
          <p className="text-sm text-gray-500 font-mono">{ticket.ticketId}</p>
        </div>

        {ticket.status === "OPEN" && (
          <Link
            to={`/admin/tickets/${ticket._id}/assign`}
            className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-4 py-2 rounded-lg hover:bg-[#0a2450]"
          >
            <UserPlus size={16} /> Assign to Team Lead
          </Link>
        )}
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
              <p className="inline-block text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                {ticket.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p>{ticket.createdAt}</p>
            </div>
          </div>

          {ticket.resolutionNotes && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-800">Resolution Notes</p>
              <p className="text-sm text-green-700 mt-1">{ticket.resolutionNotes}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-[#0c2d67]">Customer</h3>
          <div className="text-sm space-y-1">
            <p className="font-medium">{ticket.customer.name}</p>
            <p className="text-gray-500">{ticket.customer.email}</p>
          </div>

          <h3 className="font-semibold text-[#0c2d67] pt-4 border-t">Assigned Team Lead</h3>
          {ticket.assignedTo ? (
            <div className="text-sm space-y-1">
              <p className="font-medium">{ticket.assignedTo.name}</p>
              <p className="text-gray-500">{ticket.assignedTo.email}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Not assigned yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;