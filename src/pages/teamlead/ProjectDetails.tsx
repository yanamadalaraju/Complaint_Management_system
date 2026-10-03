import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Project = {
  id: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  customer_id: number | null;
  admin_id: number | null;
  teamlead_id: number | null;
  created_at: string;
  updated_at: string;
  customer_name: string | null;
  customer_email: string | null;
  admin_name: string | null;
  admin_email: string | null;
  teamlead_name: string | null;
  teamlead_email: string | null;
};

const formatDate = (d: string | null) => {
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date.getTime()) ? d : date.toLocaleDateString();
};

const formatDateTime = (d: string | null) => {
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date.getTime()) ? d : date.toLocaleString();
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

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch project by id ----------
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        // Read logged-in teamlead
        const stored = localStorage.getItem("teamlead_user");
        const teamlead = stored ? JSON.parse(stored) : null;

        if (!teamlead?.id) {
          throw new Error("You are not logged in as a team lead.");
        }

        let found: Project | null = null;

        // 1) Try single-project endpoint
        try {
          const res = await fetch(`http://localhost:5000/api/projects/${id}`);
          const data = await res.json();
          if (res.ok && data.success && data.data) {
            found = Array.isArray(data.data) ? data.data[0] : data.data;
          }
        } catch {
          // fall through to list fallback
        }

        // 2) Fallback: fetch list and find by id
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

        // Only the assigned team lead can view this project
        if (Number(found.teamlead_id) !== Number(teamlead.id)) {
          throw new Error("This project is not assigned to you.");
        }

        setProject(found);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/teamlead/projects"
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
            <div>
              <p className="text-xs font-mono text-gray-500 mb-1">
                Project #{project.id}
              </p>
              <h3 className="text-xl font-semibold text-gray-900">
                {project.name}
              </h3>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                {project.description || "No description provided."}
              </p>
            </div>

            <div className="border-t pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Field label="Start Date" value={formatDate(project.start_date)} />
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
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProjectDetails;