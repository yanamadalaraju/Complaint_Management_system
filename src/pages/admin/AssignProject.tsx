import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import {BASE_URL} from '@/apiurl/apiurl';

type Project = {
  id: number;
  name: string;
  description: string | null;
  customer_name: string | null;
  teamlead_id: number | null;
  teamlead_name: string | null;
};

type TeamLead = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

type TeamMember = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
};

const AssignProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]); // 👈 new
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [teamLeadId, setTeamLeadId] = useState("");
  const [memberIds, setMemberIds] = useState<number[]>([]); // 👈 new (multi-select)
  const [notes, setNotes] = useState("");

  // ---------- Load project + team leads + team members ----------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [projectRes, teamLeadRes, teamMemberRes] = await Promise.all([
          fetch(`${BASE_URL}/api/projects/${id}`),
          fetch(`${BASE_URL}/api/teamleads`),
          fetch(`${BASE_URL}/api/teammembers`), // 👈 new
        ]);

        const projectData = await projectRes.json();
        const teamLeadData = await teamLeadRes.json();
        const teamMemberData = await teamMemberRes.json();

        if (!projectRes.ok || !projectData.success) {
          throw new Error(projectData.message || "Failed to load project");
        }
        if (!teamLeadRes.ok || !teamLeadData.success) {
          throw new Error(
            teamLeadData.message || "Failed to load team leads"
          );
        }
        if (!teamMemberRes.ok || !teamMemberData.success) {
          throw new Error(
            teamMemberData.message || "Failed to load team members"
          );
        }

        setProject(projectData.data);
        setTeamLeads(teamLeadData.data || []);

        // only show active team members in the picker
        setTeamMembers(
          (teamMemberData.data || []).filter(
            (m: TeamMember) => m.status === "active"
          )
        );

        // Preselect the currently assigned teamlead
        if (projectData.data.teamlead_id) {
          setTeamLeadId(String(projectData.data.teamlead_id));
        }

        // Preselect currently assigned members if your API returns them
        if (Array.isArray(projectData.data.member_ids)) {
          setMemberIds(projectData.data.member_ids);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadData();
  }, [id]);

  // ---------- Toggle member in multi-select ----------
  const toggleMember = (memberId: number) => {
    setMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  // ---------- Submit assignment ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamLeadId) {
      alert("Please select a team lead");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamlead_id: Number(teamLeadId),
          member_ids: memberIds, // 👈 new
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to assign team lead");
      }

      alert("Team lead & members assigned ✅");
      navigate("/admin/projects");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 flex flex-col items-center gap-3">
        <Loader2 size={24} className="animate-spin" />
        Loading project…
      </div>
    );
  }

  // ---------- Error ----------
  if (error || !project) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertTriangle size={16} />
          {error || "Project not found"}
        </div>
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

      <h2 className="text-2xl font-bold text-[#0c2d67]">
        Assign Team Lead & Members to Project
      </h2>

      {/* Project summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="font-semibold text-lg">{project.name}</p>
        {project.customer_name && (
          <p className="text-sm text-gray-500 mt-1">
            Customer: {project.customer_name}
          </p>
        )}
        {project.description && (
          <p className="text-sm text-gray-600 mt-2">{project.description}</p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-5"
      >
        {/* ---- Team Lead ---- */}
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

        {/* ---- NEW: Select Team Members (multi-select checkboxes) ---- */}
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-2">
            <Users size={16} className="text-gray-500" />
            Select Team Members
            {memberIds.length > 0 && (
              <span className="text-xs text-[#0c2d67] font-semibold">
                ({memberIds.length} selected)
              </span>
            )}
          </label>

          <div className="border rounded-lg max-h-64 overflow-y-auto divide-y">
            {teamMembers.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">
                No active team members available — create one first.
              </p>
            ) : (
              teamMembers.map((m) => {
                const checked = memberIds.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition ${
                      checked ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMember(m.id)}
                      className="w-4 h-4 accent-[#0c2d67]"
                    />
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        checked
                          ? "bg-gradient-to-br from-[#0c2d67] to-blue-500"
                          : "bg-gray-400"
                      }`}
                    >
                      {m.name
                        ?.trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((n) => n[0]?.toUpperCase())
                        .join("") || "?"}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium text-gray-800 truncate">
                        {m.name}
                      </span>
                      <span className="block text-xs text-gray-500 truncate">
                        {m.email}
                      </span>
                    </span>
                    {checked && (
                      <CheckCircle2 size={16} className="text-[#0c2d67]" />
                    )}
                  </label>
                );
              })
            )}
          </div>

          {teamMembers.length > 0 && (
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-gray-500">
                {teamMembers.length} active member
                {teamMembers.length > 1 ? "s" : ""}
              </span>
              {memberIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMemberIds([])}
                  className="text-[#0c2d67] hover:underline"
                >
                  Clear selection
                </button>
              )}
            </div>
          )}
        </div>

        {/* ---- Notes ---- */}
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

        {/* ---- Buttons ---- */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-6 py-2 rounded-lg hover:bg-[#0a2450] disabled:opacity-60"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Assigning…" : "Assign Team Lead & Members"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="px-6 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignProject;