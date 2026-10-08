import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  User,
  Clock,
  CheckCircle,
  Paperclip,
} from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

type Ticket = {
  id: number;
  ticket_id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  customer_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  assigned_to: number | null;
  assigned_by: number | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_name: string | null;
  assigned_by_name: string | null;
};

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
      return "bg-blue-100 text-blue-700";
    case "LOW":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch ----------
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${BASE_URL}/api/tickets/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load ticket");
        }

        setTicket(data.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTicket();
  }, [id]);

  // ---------- Format ----------
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
        Loading ticket…
      </div>
    );
  }

  // ---------- Error ----------
  if (error || !ticket) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-red-500">{error || "Ticket not found"}</p>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-[#0c2d67]">
            {ticket.subject}
          </h2>
          <p className="text-sm text-gray-500 font-mono">{ticket.ticket_id}</p>
        </div>

        {ticket.status === "OPEN" && (
          <Link
            to={`/admin/tickets/${ticket.id}/assign`}
            className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-4 py-2 rounded-lg hover:bg-[#0a2450]"
          >
            <UserPlus size={16} /> Assign to Team Lead
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ============ Main info ============ */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="mt-1 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p>{ticket.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Priority</p>
              <p>
                <span
                  className={`inline-block text-xs px-2 py-1 rounded-full ${priorityColor(
                    ticket.priority
                  )}`}
                >
                  {ticket.priority}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p>
                <span
                  className={`inline-block text-xs px-2 py-1 rounded-full ${statusColor(
                    ticket.status
                  )}`}
                >
                  {ticket.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-sm">{formatDate(ticket.created_at)}</p>
            </div>
          </div>

          {/* Attachment */}
          {ticket.attachment_url && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 flex items-center gap-2 mb-2">
                <Paperclip size={14} /> Attachment
              </p>
              <a
                href={`${BASE_URL}${ticket.attachment_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 underline hover:text-blue-800"
              >
                View / Download
              </a>
            </div>
          )}

          {/* Resolved banner */}
          {ticket.status === "RESOLVED" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                <CheckCircle size={16} /> Resolved
              </p>
              <p className="text-sm text-green-700 mt-1">
                Resolved on {formatDate(ticket.updated_at)}
              </p>
            </div>
          )}
        </div>

        {/* ============ Sidebar ============ */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          {/* Customer */}
          <div>
            <h3 className="font-semibold text-[#0c2d67] flex items-center gap-2">
              <User size={16} /> Customer
            </h3>
            {ticket.customer_name ? (
              <div className="text-sm mt-2 space-y-1">
                <p className="font-medium">{ticket.customer_name}</p>
                {ticket.customer_email && (
                  <p className="text-gray-500 text-xs">
                    {ticket.customer_email}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">
                Unknown (guest ticket)
              </p>
            )}
          </div>

          {/* Assigned Team Lead */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-[#0c2d67] flex items-center gap-2">
              <User size={16} /> Assigned Team Lead
            </h3>
            {ticket.assigned_to_name ? (
              <div className="text-sm mt-2 space-y-1">
                <p className="font-medium">{ticket.assigned_to_name}</p>
                {ticket.assigned_by_name && (
                  <p className="text-gray-500 text-xs">
                    Assigned by {ticket.assigned_by_name}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Not assigned yet</p>
            )}
          </div>

          {/* Timeline */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-[#0c2d67] flex items-center gap-2">
              <Clock size={16} /> Timeline
            </h3>
            <ul className="text-xs text-gray-600 mt-2 space-y-2">
              <li>✅ Created on {formatDate(ticket.created_at)}</li>
              {ticket.assigned_to_name && (
                <li>👤 Assigned to {ticket.assigned_to_name}</li>
              )}
              {ticket.status === "IN_PROGRESS" && <li>⚙️ In progress</li>}
              {ticket.status === "RESOLVED" && (
                <li>✅ Resolved on {formatDate(ticket.updated_at)}</li>
              )}
              {ticket.status === "CLOSED" && (
                <li>🔒 Closed on {formatDate(ticket.updated_at)}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;