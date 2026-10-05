import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";

type Project = {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  customer_id: number | null;
  admin_id: number | null;
  teamlead_id: number | null;
  status: string;
  progress_notes: string | null;
  customer_response: string | null;   // 👈 new
  customer_status: string | null;     // 👈 new
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_email: string | null;
  admin_name: string | null;
  admin_email: string | null;
  teamlead_name: string | null;
  teamlead_email: string | null;
};

// ---------- Status pill ----------
const statusColor = (status: string) => {
  switch (status) {
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

// ---------- Customer status pill (new) ----------
const customerStatusColor = (status: string | null) => {
  switch (status) {
    case "RESOLVED":
      return "bg-green-100 text-green-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatDate = (d: string | null) => {
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const formatDateTime = (d: string | null) => {
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const Field = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
      {label}
    </p>
    <div className="text-sm text-gray-900">
      {value || <span className="text-gray-400">—</span>}
    </div>
  </div>
);

const CustomerProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Customer response state
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);

  // ---------- Fetch project by id ----------
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        const stored = localStorage.getItem("customer_user");
        const customer = stored ? JSON.parse(stored) : null;

        if (!customer?.id) {
          throw new Error("You are not logged in as a customer.");
        }

        let found: Project | null = null;

        try {
          const res = await fetch(`http://localhost:5000/api/projects/${id}`);
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            found = Array.isArray(data.data) ? data.data[0] : data.data;
          }
        } catch {
          // fall through to list fallback
        }

        if (!found) {
          const res = await fetch("http://localhost:5000/api/projects");
          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to load project");
          }

          found =
            (data.data || []).find(
              (p: Project) => Number(p.id) === Number(id)
            ) || null;
        }

        if (!found) {
          throw new Error("Project not found.");
        }

        if (Number(found.customer_id) !== Number(customer.id)) {
          throw new Error("This project does not belong to you.");
        }

        setProject(found);
        // Preload existing response if any
        setResponse(found.customer_response || "");
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // ---------- Submit customer response ----------
  const handleResolve = async () => {
    if (!response.trim()) {
      alert("Please add your response before submitting");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_response: response.trim(),
          customer_status: "RESOLVED", // 👈 new
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit response");
      }

      alert("Response submitted ✅");
      navigate("/customer/projects");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/customer/projects"
          className="p-2 rounded hover:bg-gray-100 text-gray-600"
          title="Back"
        >
          <ArrowLeft size={18} />
        </Link>
        <h2 className="text-2xl font-bold text-[#0c2d67]">Project Details</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading project…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : project ? (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                <p className="text-xs font-mono text-gray-500">
                  Project #{project.id}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${statusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {project.name}
              </h3>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                {project.description || "No description provided."}
              </p>
            </div>

            {/* Progress notes from teamlead — read-only */}
            {project.progress_notes && (
              <div className="border-t pt-6">
                <label className="block text-sm font-medium mb-1">
                  Progress Notes (from Team Lead)
                </label>
                <div className="w-full min-h-[80px] px-4 py-2 border rounded-lg bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap">
                  {project.progress_notes}
                </div>
              </div>
            )}

            {/* Fields grid */}
            <div className="border-t pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field
                label="Start Date"
                value={formatDate(project.start_date)}
              />
              <Field label="End Date" value={formatDate(project.end_date)} />

              <Field
                label="Customer"
                value={
                  project.customer_name && (
                    <>
                      <div>{project.customer_name}</div>
                      {project.customer_email && (
                        <div className="text-xs text-gray-500">
                          {project.customer_email}
                        </div>
                      )}
                    </>
                  )
                }
              />

              <Field
                label="Admin"
                value={
                  project.admin_name && (
                    <>
                      <div>{project.admin_name}</div>
                      {project.admin_email && (
                        <div className="text-xs text-gray-500">
                          {project.admin_email}
                        </div>
                      )}
                    </>
                  )
                }
              />

              <Field
                label="Team Lead"
                value={
                  project.teamlead_name && (
                    <>
                      <div>{project.teamlead_name}</div>
                      {project.teamlead_email && (
                        <div className="text-xs text-gray-500">
                          {project.teamlead_email}
                        </div>
                      )}
                    </>
                  )
                }
              />

              <Field
                label="Created At"
                value={formatDateTime(project.created_at)}
              />
              <Field
                label="Last Updated"
                value={formatDateTime(project.updated_at)}
              />

              {/* 👇 new */}
              <Field
                label="Customer Status"
                value={
                  project.customer_status && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${customerStatusColor(
                        project.customer_status
                      )}`}
                    >
                      {project.customer_status}
                    </span>
                  )
                }
              />
            </div>

            {/* =====================================================
                Customer Response
               ===================================================== */}
            <div className="border-t pt-6 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Response{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
                  placeholder="Write your response or confirmation for this project…"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be shared with the team lead and admin.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleResolve}
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                >
                  <CheckCircle size={16} />
                  {saving ? "Submitting…" : "Resolve & Notify"}
                </button>
                <Link
                  to="/customer/projects"
                  className="px-6 py-2 rounded-lg border hover:bg-gray-50"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CustomerProjectDetails;