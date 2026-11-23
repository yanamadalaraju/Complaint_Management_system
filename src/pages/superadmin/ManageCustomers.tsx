import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
};

const PAGE_SIZE = 10;

const ManageCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // ---------- Fetch customers ----------
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${BASE_URL}/api/customers`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load customers");
      }

      setCustomers(data.data || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ---------- Pagination ----------
  const totalPages = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedCustomers = customers.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  // Keep page in range (e.g. after deleting the last item on a page)
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // ---------- Delete ----------
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this customer?")) return;

    try {
      const res = await fetch(`${BASE_URL}/api/customers/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete customer");
      }

      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ---------- Format date ----------
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0c2d67]">Manage Customers</h2>
        <Link
          to="/superadmin/customers/create"
          className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-4 py-2 rounded-lg hover:bg-[#0a2450] transition"
        >
          <Plus size={16} /> Create Customer
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading customers…
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            {error}
            <button
              onClick={fetchCustomers}
              className="ml-3 underline text-[#0c2d67]"
            >
              Retry
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No customers found. Click “Create Customer” to add one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone || "—"}</td>
                  <td className="px-4 py-3">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/superadmin/customers/${c.id}`}
                        className="p-2 rounded hover:bg-blue-50 text-blue-600"
                        title="View"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/superadmin/customers/edit/${c.id}`}
                        className="p-2 rounded hover:bg-yellow-50 text-yellow-600"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 rounded hover:bg-red-50 text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ---------- Pagination controls ---------- */}
        {!loading && !error && customers.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
            <span>
              Showing {startIndex + 1}–
              {Math.min(startIndex + PAGE_SIZE, customers.length)} of{" "}
              {customers.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCustomers;