import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { mockTickets, mockTeamLeads } from "@/data/mockData";

const AssignTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticket = mockTickets.find((t) => t._id === id);

  const [teamLeadId, setTeamLeadId] = useState("");
  const [priority, setPriority] = useState(ticket?.priority || "MEDIUM");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamLeadId) {
      alert("Please select a team lead");
      return;
    }
    // TODO: PATCH /api/admin/tickets/:id/assign
    alert("Ticket assigned ✅ (static)");
    navigate("/admin/tickets");
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

      <h2 className="text-2xl font-bold text-[#0c2d67]">Assign Ticket</h2>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="font-mono text-xs text-gray-500">{ticket.ticketId}</p>
        <p className="font-semibold text-lg">{ticket.subject}</p>
        <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Assign to Team Lead
          </label>
          <select
            value={teamLeadId}
            onChange={(e) => setTeamLeadId(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
          >
            <option value="">— Select Team Lead —</option>
            {mockTeamLeads.map((tl) => (
              <option key={tl._id} value={tl._id}>
                {tl.name} ({tl.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Notes for Team Lead (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Any specific instructions…"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-[#0c2d67] text-white px-6 py-2 rounded-lg hover:bg-[#0a2450]"
          >
            Assign Ticket
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

export default AssignTicket;