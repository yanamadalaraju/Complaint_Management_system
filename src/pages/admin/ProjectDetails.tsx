import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  FileText,
  ShieldOff,
  User,
  Shield,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

type Project = {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  customer_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  admin_id: number | null;
  admin_name: string | null;
  admin_email: string | null;
  teamlead_id: number | null;              // 👈 new
  teamlead_name: string | null;            // 👈 new
  teamlead_email: string | null;           // 👈 new
  status: string;                          // 👈 new
  progress_notes: string | null;           // 👈 new
  customer_response: string | null;        // 👈 new
  customer_status: string;                 // 👈 new
  created_at: string;
  updated_at: string;
};

// ---------- Project status pill ----------
const projectStatusColor = (s: string) => {
  switch (s) {
    case "ASSIGNED":
      return "bg-blue-100 text-blue-700";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-700";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "ON_HOLD":
      return "bg-yellow-100 text-yellow-700";
    case "CLOSED":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

// ---------- Customer status pill ----------
const customerStatusColor = (s: string) => {
  switch (s) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "ACCEPTED":
    case "RESOLVED":
      return "bg-green-100 text-green-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    case "REVISION_REQUESTED":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const AdminProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(true);

  // ---------- Fetch ----------
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${BASE_URL}/api/projects/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load project");
        }

        // ---- Ownership check ----
        const stored = localStorage.getItem("admin_user");
        const loggedInAdmin = stored ? JSON.parse(stored) : null;

        if (
          !loggedInAdmin?.id ||
          data.data.admin_id !== loggedInAdmin.id
        ) {
          setAuthorized(false);
          setProject(data.data);
          return;
        }

        setAuthorized(true);
        setProject(data.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id]);

  // ---------- Format date ----------
  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
        Loading project…
      </div>
    );
  }

  // ---------- Error ----------
  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // ---------- Unauthorized ----------
  if (!authorized) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-xl shadow-sm p-10 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <ShieldOff size={26} />
          </div>
          <h2 className="text-xl font-bold text-[#0c2d67]">Access Denied</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            This project is not assigned to you. You can only view projects
            where you are the assigned admin.
          </p>
          <button
            onClick={() => navigate("/admin/projects")}
            className="mt-3 inline-flex items-center gap-2 bg-[#0c2d67] text-white px-5 py-2 rounded-lg hover:bg-[#0a2450] transition"
          >
            Go to My Projects
          </button>
        </div>
      </div>
    );
  }

  // ---------- Not found ----------
  if (!project) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-red-500">Project not found</p>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0c2d67]">{project.name}</h2>
          <p className="text-sm text-gray-500 font-mono">
            ID: {project.id}
          </p>
        </div>

        {/* Status pills */}
        <div className="flex gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${projectStatusColor(
              project.status
            )}`}
          >
            {project.status}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${customerStatusColor(
              project.customer_status
            )}`}
          >
            Customer: {project.customer_status}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description + dates */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                <FileText size={14} /> Description
              </p>
              <p className="whitespace-pre-wrap">
                {project.description || (
                  <span className="text-gray-400">No description</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar size={14} /> Start Date
                </p>
                <p className="mt-1">{formatDate(project.start_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar size={14} /> End Date
                </p>
                <p className="mt-1">{formatDate(project.end_date)}</p>
              </div>
            </div>
          </div>

          {/* Progress notes (from teamlead) */}
          {project.progress_notes && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm font-semibold text-[#0c2d67] flex items-center gap-2 mb-2">
                <CheckCircle size={16} /> Progress Notes (from Team Lead)
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 whitespace-pre-wrap">
                {project.progress_notes}
              </div>
            </div>
          )}

          {/* Customer response */}
          {project.customer_response && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-sm font-semibold text-[#0c2d67] flex items-center gap-2 mb-2">
                <MessageSquare size={16} /> Customer Response
              </p>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900 whitespace-pre-wrap">
                {project.customer_response}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          {/* Customer */}
          <div>
            <h3 className="font-semibold text-[#0c2d67] flex items-center gap-2">
              <User size={16} /> Customer
            </h3>
            {project.customer_name ? (
              <div className="text-sm mt-2 space-y-1">
                <p className="font-medium">{project.customer_name}</p>
                {project.customer_email && (
                  <p className="text-gray-500 text-xs">
                    {project.customer_email}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Not assigned</p>
            )}
          </div>

          {/* Admin */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-[#0c2d67] flex items-center gap-2">
              <Shield size={16} /> Admin
            </h3>
            {project.admin_name ? (
              <div className="text-sm mt-2 space-y-1">
                <p className="font-medium">
                  {project.admin_name}
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    you
                  </span>
                </p>
                {project.admin_email && (
                  <p className="text-gray-500 text-xs">
                    {project.admin_email}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Not assigned</p>
            )}
          </div>

          {/* Team Lead */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold text-[#0c2d67] flex items-center gap-2">
              <User size={16} /> Team Lead
            </h3>
            {project.teamlead_name ? (
              <div className="text-sm mt-2 space-y-1">
                <p className="font-medium">{project.teamlead_name}</p>
                {project.teamlead_email && (
                  <p className="text-gray-500 text-xs">
                    {project.teamlead_email}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">Not assigned</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectDetails;