import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

type Ticket = {
  id: number;
  ticket_id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
};

const priorityColor = (p: string) => {
  switch (p) {
    case "URGENT":
      return "bg-red-100 text-red-700";
    case "HIGH":
      return "bg-orange-100 text-orange-700";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const ResolveTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"RESOLVED" | "IN_PROGRESS">(
    "RESOLVED"
  );

  // ---------- Load ticket ----------
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

  // ---------- Submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notes.trim()) {
      alert("Please add resolution notes");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status, // "RESOLVED" | "IN_PROGRESS"
          resolution_notes: notes.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update ticket");
      }

      alert(
        status === "RESOLVED"
          ? "Ticket resolved ✅"
          : "Ticket marked in progress ✅"
      );
      navigate("/teamlead/tickets");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Loading / Error ----------
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

      <h2 className="text-2xl font-bold text-[#0c2d67]">Resolve Ticket</h2>

      {/* Ticket summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="font-mono text-xs text-gray-500">{ticket.ticket_id}</p>
        <p className="font-semibold text-lg">{ticket.subject}</p>
        <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
        <div className="mt-3 flex gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
            {ticket.category}
          </span>
          <span
            className={`px-2 py-1 rounded-full ${priorityColor(
              ticket.priority
            )}`}
          >
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
            This will be shared with the customer and admin.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
          >
            <CheckCircle size={16} />
            {saving
              ? "Saving…"
              : status === "RESOLVED"
              ? "Resolve & Notify"
              : "Update Status"}
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