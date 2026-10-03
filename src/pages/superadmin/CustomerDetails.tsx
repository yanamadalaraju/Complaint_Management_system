import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Pencil,
  User,
} from "lucide-react";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
};

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Fetch ----------
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`http://localhost:5000/api/customers/${id}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load customer");
        }

        setCustomer(data.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCustomer();
  }, [id]);

  // ---------- Format date ----------
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
        Loading customer…
      </div>
    );
  }

  // ---------- Error ----------
  if (error || !customer) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0c2d67]"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-red-500">{error || "Customer not found"}</p>
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

      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#0c2d67]">Customer Details</h2>
          <p className="text-sm text-gray-500 font-mono">ID: {customer.id}</p>
        </div>
        <Link
          to={`/superadmin/customers/edit/${customer.id}`}
          className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-4 py-2 rounded-lg hover:bg-[#0a2450] transition"
        >
          <Pencil size={16} /> Edit Customer
        </Link>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#0c2d67]">
              {customer.name}
            </h3>
            <p className="text-sm text-gray-500 capitalize">
              {customer.role}
              {customer.status === "inactive" && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                  inactive
                </span>
              )}
              {customer.status === "active" && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  active
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm">
            <Mail size={16} className="text-[#0c2d67]" />
            <span>{customer.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone size={16} className="text-[#0c2d67]" />
            <span>{customer.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-[#0c2d67]" />
            <span>Joined {formatDate(customer.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Info blocks */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <User size={14} /> Role
          </div>
          <p className="text-lg font-semibold text-[#0c2d67] capitalize">
            {customer.role}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Calendar size={14} /> Account Status
          </div>
          <p className="text-lg font-semibold capitalize">
            <span
              className={
                customer.status === "active"
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {customer.status}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;