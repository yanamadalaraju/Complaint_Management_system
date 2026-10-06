import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Shield,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type TeamMember = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
};

const ViewTeamMember = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch single team member ----------
  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `http://localhost:5000/api/teammembers/${id}`
        );
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load team member");
        }

        setMember(data.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMember();
  }, [id]);

  // ---------- UI ----------
  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67] transition"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h2 className="text-2xl font-bold text-[#0c2d67]">Team Member Details</h2>

      {/* ---- Loading ---- */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center gap-3 text-gray-500">
          <Loader2 size={28} className="animate-spin" />
          <p className="text-sm">Loading team member…</p>
        </div>
      )}

      {/* ---- Error ---- */}
      {!loading && error && (
        <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center gap-3 text-red-600">
          <AlertTriangle size={28} />
          <p className="text-sm">{error}</p>
          <button
            onClick={() => navigate("/admin/teammembers")}
            className="mt-2 px-4 py-2 rounded-lg border border-red-200 text-sm hover:bg-red-50"
          >
            Back to list
          </button>
        </div>
      )}

      {/* ---- Member detail card ---- */}
      {!loading && !error && member && (
        <div className="bg-white rounded-xl shadow-sm max-w-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
              {member.name
                ?.trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((n) => n[0]?.toUpperCase())
                .join("") || "?"}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-800">{member.name}</p>
              <p className="text-sm text-gray-500 capitalize">
                {member.role}
              </p>
            </div>

            {/* Status pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                member.status === "active"
                  ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                  : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
              }`}
            >
              {member.status === "active" ? (
                <CheckCircle2 size={12} />
              ) : (
                <XCircle size={12} />
              )}
              {member.status}
            </span>
          </div>

          {/* Details grid */}
          <div className="p-6 space-y-4">
            <DetailRow
              icon={<User size={16} />}
              label="Member ID"
              value={`#${member.id}`}
            />
            <DetailRow
              icon={<Mail size={16} />}
              label="Email"
              value={member.email}
            />
            <DetailRow
              icon={<Phone size={16} />}
              label="Phone"
              value={member.phone || "—"}
            />
            <DetailRow
              icon={<Shield size={16} />}
              label="Role"
              value={
                <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 capitalize">
                  {member.role}
                </span>
              }
            />
            <DetailRow
              icon={<Calendar size={16} />}
              label="Created At"
              value={new Date(member.created_at).toLocaleString()}
            />
          </div>

          {/* Actions */}
          <div className="p-6 border-t bg-gray-50 flex gap-3">
            <button
              onClick={() =>
                navigate(`/admin/teammembers/edit/${member.id}`)
              }
              className="bg-[#0c2d67] text-white px-5 py-2 rounded-lg hover:bg-[#0a2450] transition text-sm font-semibold"
            >
              Edit Member
            </button>
            <button
              onClick={() => navigate("/admin/teammembers")}
              className="px-5 py-2 rounded-lg border hover:bg-white transition text-sm"
            >
              Back to List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Small presentational helper ---------- */
const DetailRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <span className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 font-medium truncate">{value}</p>
    </div>
  </div>
);

export default ViewTeamMember;