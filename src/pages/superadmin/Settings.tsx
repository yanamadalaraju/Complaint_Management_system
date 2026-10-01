import { useState } from "react";
import { Save } from "lucide-react";

const Settings = () => {
  const [form, setForm] = useState({
    siteName: "Support Desk",
    supportEmail: "support@example.com",
    autoAssign: false,
    emailNotifications: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings saved ✅ (static)");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0c2d67]">Settings</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Site Name</label>
          <input
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Support Email</label>
          <input
            type="email"
            value={form.supportEmail}
            onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="autoAssign"
            type="checkbox"
            checked={form.autoAssign}
            onChange={(e) => setForm({ ...form, autoAssign: e.target.checked })}
          />
          <label htmlFor="autoAssign" className="text-sm">
            Auto-assign tickets to team leads
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="emailNotifications"
            type="checkbox"
            checked={form.emailNotifications}
            onChange={(e) =>
              setForm({ ...form, emailNotifications: e.target.checked })
            }
          />
          <label htmlFor="emailNotifications" className="text-sm">
            Send email notifications
          </label>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-[#0c2d67] text-white px-6 py-2 rounded-lg hover:bg-[#0a2450] transition"
        >
          <Save size={16} /> Save Settings
        </button>
      </form>
    </div>
  );
};

export default Settings;