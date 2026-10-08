import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

type TeamLead = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
};

const TeamLeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tl, setTl] = useState<TeamLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch team lead ----------
  useEffect(() => {
    const fetchTeamLead = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${BASE_URL}/api/teamleads/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load team lead");
        }

        setTl(data.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTeamLead();
  }, [id]);

  // ---------- Loading / Error ----------
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
        Loading team lead…
      </div>
    );
  }

  if (error || !tl) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-red-500">{error || "Team lead not found"}</p>
      </div>
    );
  }

  // ---------- Format date ----------
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // ---------- Placeholder stats (will be wired when tickets API exists) ----------
  const assignedCount = 0;
  const resolvedCount = 0;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {tl.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0c2d67]">{tl.name}</h2>
            <p className="text-sm text-gray-500 capitalize">
              {tl.role}
              {tl.status === "inactive" && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                  inactive
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm">
            <Mail size={16} className="text-[#0c2d67]" /> {tl.email}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} className="text-[#0c2d67]" /> {tl.phone || "—"}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-[#0c2d67]" /> Joined{" "}
            {formatDate(tl.created_at)}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Total Assigned</p>
          <p className="text-3xl font-bold text-[#0c2d67]">{assignedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Resolved</p>
          <p className="text-3xl font-bold text-green-600">{resolvedCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-[#0c2d67] mb-4">Assigned Tickets</h3>
        <p className="text-sm text-gray-500">No tickets assigned yet.</p>
      </div>
    </div>
  );
};

export default TeamLeadDetails;