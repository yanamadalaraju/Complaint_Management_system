import { useState } from "react";
import { X } from "lucide-react";
import { BASE_URL } from "@/apiurl/apiurl";

type TeamMember = {
  id: number;
  name: string;
  email: string;
};

type Props = {
  projectId: number;
  teamMembers: TeamMember[];
  onClose: () => void;
  onCreated?: () => void;
};

const AssignTaskModal = ({ projectId, teamMembers, onClose, onCreated }: Props) => {
  const [memberId, setMemberId] = useState<number | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!memberId || !title.trim()) {
      alert("Please select a member and enter a task title");
      return;
    }

    const stored = localStorage.getItem("teamlead_user");
    const teamlead = stored ? JSON.parse(stored) : null;
    if (!teamlead?.id) {
      alert("Not logged in");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          member_id: memberId,
          assigned_by: teamlead.id,
          title: title.trim(),
          description: description.trim() || null,
          priority,
          due_date: dueDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");

      alert("Task assigned ✅");
      onCreated?.();
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-[#0c2d67]">Assign Task</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Assign to</label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
            >
              <option value="">— Select team member —</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
              placeholder="e.g. Build login page"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
              placeholder="Task details…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c2d67]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#0c2d67] text-white hover:bg-[#0a2454] disabled:opacity-60"
          >
            {saving ? "Assigning…" : "Assign Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTaskModal;