import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { mockTickets } from "@/data/mockData";

const ResolveTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticket = mockTickets.find((t) => t._id === id);

  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"RESOLVED" | "IN_PROGRESS">("RESOLVED");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert("Please add resolution notes");
      return;
    }
    // TODO: PATCH /api/teamlead/tickets/:id/resolve
    // Backend triggers → notification to Customer + Admin
    alert(
      status === "RESOLVED"
        ? "Ticket resolved ✅ Customer & Admin notified (static)"
        : "Ticket marked in progress ✅ (static)"
    );
    navigate("/teamlead/tickets");
  };

  if (!ticket) return <p className="text-red-500">Ticket not found</p>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h2 className="text-2xl font-bold text-[#0c2d67]">Resolve Ticket</h2>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="font-mono text-xs text-gray-500">{ticket.ticketId}</p>
        <p className="font-semibold text-lg">{ticket.subject}</p>
        <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
        <div className="mt-3 flex gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            {ticket.category}
          </span>
          <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
            {ticket.priority}
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Action</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value="RESOLVED"
                checked={status === "RESOLVED"}
                onChange={() => setStatus("RESOLVED")}
              />
              Mark as Resolved
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="status"
                value="IN_PROGRESS"
                checked={status === "IN_PROGRESS"}
                onChange={() => setStatus("IN_PROGRESS")}
              />
              Mark as In Progress
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Resolution Notes <span className="text-red-500">*</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
            placeholder="Explain what you did to resolve this ticket…"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This will be shared with the customer and admin via notification.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            <CheckCircle size={16} />
            {status === "RESOLVED" ? "Resolve & Notify" : "Update Status"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResolveTicket;