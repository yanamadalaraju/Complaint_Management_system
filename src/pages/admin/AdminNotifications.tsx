import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import {BASE_URL} from '@/apiurl/apiurl';

type Notification = {
  id: number;
  user_id: number;
  ticket_id: number | null;
  title: string;
  message: string;
  type: string;
  is_read: 0 | 1;
  created_at: string;
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- Read ONLY the admin_user key ----------
  const getUser = () => {
    const raw = localStorage.getItem("admin_user");
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed?.id) return null;
      return { ...parsed, role: "admin" as const };
    } catch {
      return null;
    }
  };

  const user = getUser();
  console.log("🔔 Admin Notifications — resolved admin =", user);

  // ---------- Fetch (scoped to this admin only) ----------
  const fetchNotifications = async () => {
    if (!user?.id) {
      setError("Not logged in as admin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${BASE_URL}/api/notifications?user_id=${user.id}`;
      console.log("🔔 GET", url);

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load notifications");
      }

      console.log(
        `🔔 Loaded ${data.data?.length || 0} notifications for admin ${user.id}`
      );
      setNotifications(data.data || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Mark one as read ----------
  const markRead = async (id: number) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/notifications/${id}/read`,
        { method: "PUT" }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to mark as read");
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ---------- Mark all as read ----------
  const markAllRead = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(
        `${BASE_URL}/api/notifications/mark-all-read?user_id=${user.id}`,
        { method: "PUT" }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to mark all as read");
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ---------- Format date ----------
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ---------- Icon color by type ----------
  const typeAccent = (type: string) => {
    switch (type) {
      case "TICKET_CREATED":
      case "PROJECT_CREATED":
        return "bg-blue-500";
      case "TICKET_ASSIGNED":
      case "PROJECT_ASSIGNED":
        return "bg-purple-500";
      case "TICKET_RESOLVED":
      case "PROJECT_COMPLETED":
        return "bg-green-500";
      case "PROJECT_IN_PROGRESS":
        return "bg-amber-500";
      default:
        return "bg-[#0c2d67]";
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[#0c2d67]">Notifications</h2>
        {hasUnread && (
          <button
            onClick={markAllRead}
            className="text-xs text-[#0c2d67] inline-flex items-center gap-1 hover:underline"
          >
            <Check size={14} /> Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm divide-y">
        {loading ? (
          <p className="p-6 text-gray-500 text-sm">Loading notifications…</p>
        ) : error ? (
          <p className="p-6 text-red-500 text-sm">{error}</p>
        ) : notifications.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No notifications.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-3 ${
                !n.is_read ? "bg-blue-50/40" : ""
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white ${
                  n.is_read ? "bg-gray-300" : typeAccent(n.type)
                }`}
              >
                <Bell size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(n.created_at)}
                </p>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="text-xs text-[#0c2d67] inline-flex items-center gap-1 hover:underline"
                >
                  <Check size={14} /> Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;