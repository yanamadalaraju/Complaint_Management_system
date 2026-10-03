import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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

const AssignProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [teamLeadId, setTeamLeadId] = useState("");
  const [notes, setNotes] = useState("");

  // ---------- Load project + team leads ----------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [projectRes, teamLeadRes] = await Promise.all([
          fetch(`http://localhost:5000/api/projects/${id}`),
          fetch("http://localhost:5000/api/teamleads"),
        ]);

        const projectData = await projectRes.json();
        const teamLeadData = await teamLeadRes.json();

        if (!projectRes.ok || !projectData.success) {
          throw new Error(projectData.message || "Failed to load project");
        }
        if (!teamLeadRes.ok || !teamLeadData.success) {
          throw new Error(
            teamLeadData.message || "Failed to load team leads"
          );
        }

        setProject(projectData.data);
        setTeamLeads(teamLeadData.data || []);

        // Preselect the currently assigned teamlead
        if (projectData.data.teamlead_id) {
          setTeamLeadId(String(projectData.data.teamlead_id));
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
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamlead_id: Number(teamLeadId),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to assign team lead");
      }

      alert("Team lead assigned ✅");
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
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
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
        <p className="text-red-500">{error || "Project not found"}</p>
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
        Assign Team Lead to Project
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
            {saving ? "Assigning…" : "Assign Team Lead"}
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

export default AssignProject;