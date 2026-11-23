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
  project_id?: number | null;
  project_name?: string | null;
  project_teamlead_id?: number | null;
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Load ticket
        const ticketRes = await fetch(`${BASE_URL}/api/tickets/${id}`);
        const ticketData = await ticketRes.json();
        if (!ticketRes.ok || !ticketData.success) {
          throw new Error(ticketData.message || "Failed to load ticket");
        }

        const t: Ticket = ticketData.data;
        setTicket(t);
        setPriority(t.priority || "MEDIUM");
        if (t.assigned_to) setTeamLeadId(String(t.assigned_to));

        // 2. If ticket has a project, load ONLY its teamlead
        if (t.project_id) {
          const tlRes = await fetch(
            `${BASE_URL}/api/projects/${t.project_id}/teamleads`
          );
          const tlData = await tlRes.json();
          if (tlRes.ok && tlData.success) {
            setTeamLeads(tlData.data || []);
          } else {
            setTeamLeads([]);
          }
        } else {
          setTeamLeads([]);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamLeadId) {
      alert("Please select a team lead");
      return;
    }

    setSaving(true);
    try {
      const stored = localStorage.getItem("admin_user");
      const admin = stored ? JSON.parse(stored) : null;

      const res = await fetch(`${BASE_URL}/api/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigned_to: Number(teamLeadId),
          assigned_by: admin?.id ?? null,
          status: "ASSIGNED",
          priority,
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
        Loading ticket…
      </div>
    );
  }

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

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-1">
        <p className="font-mono text-xs text-gray-500">{ticket.ticket_id}</p>
        <p className="font-semibold text-lg">{ticket.subject}</p>
        <p className="text-sm text-gray-600">{ticket.description}</p>
        {ticket.project_name && (
          <p className="text-xs text-blue-700 mt-2">
            Project: <span className="font-medium">{ticket.project_name}</span>{" "}
            <span className="text-gray-400">#{ticket.project_id}</span>
          </p>
        )}
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
            disabled={teamLeads.length === 0}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67] disabled:bg-gray-100"
          >
            <option value="">— Select Team Lead —</option>
            {teamLeads.length === 0 ? (
              <option value="" disabled>
                {ticket.project_id
                  ? "No team lead assigned to this project"
                  : "Ticket has no project — cannot filter team leads"}
              </option>
            ) : (
              teamLeads.map((tl) => (
                <option key={tl.id} value={tl.id}>
                  {tl.name} ({tl.email})
                </option>
              ))
            )}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Only the team lead assigned to this ticket's project is shown.
          </p>
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
            disabled={saving || teamLeads.length === 0}
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