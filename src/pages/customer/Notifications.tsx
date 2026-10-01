import { Bell, Check } from "lucide-react";
import { mockNotifications } from "@/data/mockData";

const Notifications = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0c2d67]">Notifications</h2>

      <div className="bg-white rounded-xl shadow-sm divide-y">
        {mockNotifications.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No notifications.</p>
        ) : (
          mockNotifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 flex items-start gap-3 ${
                !n.read ? "bg-blue-50/40" : ""
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  n.read ? "bg-gray-100 text-gray-500" : "bg-[#0c2d67] text-white"
                }`}
              >
                <Bell size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{n.createdAt}</p>
              </div>
              {!n.read && (
                <button className="text-xs text-[#0c2d67] inline-flex items-center gap-1 hover:underline">
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

export default Notifications;