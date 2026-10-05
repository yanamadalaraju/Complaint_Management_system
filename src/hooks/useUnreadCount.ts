import { useEffect, useState } from "react";

const API = "http://localhost:5000";

/**
 * Fetches the unread notification count for a user.
 * Polls every `intervalMs` (default 15s) so the badge stays fresh.
 */
export const useUnreadCount = (
  userId: number | null | undefined,
  storageKey: "admin_user" | "teamlead_user" | "customer_user" = "customer_user",
  intervalMs = 15000
) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const fetchCount = async () => {
      try {
        const res = await fetch(
          `${API}/api/notifications/unread-count?user_id=${userId}`
        );
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setCount(Number(data.count) || 0);
        }
      } catch {
        // silent
      }
    };

    fetchCount();
    const id = setInterval(fetchCount, intervalMs);

    const onFocus = () => fetchCount();
    window.addEventListener("focus", onFocus);

    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) fetchCount();
    };
    window.addEventListener("storage", onStorage);

    const onRefresh = () => fetchCount();
    window.addEventListener("notifications:refresh", onRefresh);

    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("notifications:refresh", onRefresh);
    };
  }, [userId, storageKey, intervalMs]);

  return count;
};