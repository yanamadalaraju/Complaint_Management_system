import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

type Ticket = {
  id: number;
  ticket_id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  assigned_to: number | null;
  assigned_to_name: string | null;
};

type TeamLead = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

const AssignTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [teamLeadId, setTeamLeadId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [notes, setNotes] = useState("");

  // ---------- Load ticket + team leads ----------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [ticketRes, teamLeadRes] = await Promise.all([
          fetch(`${BASE_URL}/api/tickets/${id}`),
          fetch(`${BASE_URL}/api/admins?role=teamlead`),
        ]);

        const ticketData = await ticketRes.json();
        const teamLeadData = await teamLeadRes.json();

        if (!ticketRes.ok || !ticketData.success) {
          throw new Error(ticketData.message || "Failed to load ticket");
        }
        if (!teamLeadRes.ok || !teamLeadData.success) {
          throw new Error(
            teamLeadData.message || "Failed to load team leads"
          );
        }

        setTicket(ticketData.data);
        setPriority(ticketData.data.priority || "MEDIUM");
        setTeamLeads(teamLeadData.data || []);

        // Preselect currently assigned teamlead (if any)
        if (ticketData.data.assigned_to) {
          setTeamLeadId(String(ticketData.data.assigned_to));
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  // ---------- Submit assignment ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamLeadId) {
      alert("Please select a team lead");
      return;
    }

    setSaving(true);
    try {
      // Who is the current admin? Read from localStorage
      const stored = localStorage.getItem("admin_user");
      const admin = stored ? JSON.parse(stored) : null;

      const res = await fetch(`${BASE_URL}/api/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: Number(teamLeadId),
          assigned_by: admin?.id ?? null,
          status: "ASSIGNED",
          priority, // optional: allow admin to override priority
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to assign ticket");
      }

      alert("Ticket assigned ✅");
      navigate("/admin/tickets");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
        Loading ticket…
      </div>
    );
  }

  // ---------- Error / not found ----------
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

      <h2 className="text-2xl font-bold text-[#0c2d67]">Assign Ticket</h2>

      {/* Ticket summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="font-mono text-xs text-gray-500">{ticket.ticket_id}</p>
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
            {teamLeads.length === 0 ? (
              <option value="" disabled>
                No team leads available — create one first
              </option>
            ) : (
              teamLeads.map((tl) => (
                <option key={tl.id} value={tl.id}>
                  {tl.name} ({tl.email})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
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
            disabled={saving}
            className="bg-[#0c2d67] text-white px-6 py-2 rounded-lg hover:bg-[#0a2450] disabled:opacity-60"
          >
            {saving ? "Assigning…" : "Assign Ticket"}
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