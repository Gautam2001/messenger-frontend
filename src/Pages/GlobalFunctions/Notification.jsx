// Check if browser supports Notification API
export const notificationsSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

// Ask for notification permission if not already granted/denied
export const ensureNotificationPermission = async () => {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  try {
    const perm = await Notification.requestPermission();
    return perm; // "granted" | "denied" | "default"
  } catch {
    return "denied";
  }
};

// Show a new message notification
export const showMessageNotification = ({
  title,
  body,
  icon,
  tag,
  data,
  onClick,
  ttlMs = 6000,
}) => {
  if (!notificationsSupported() || Notification.permission !== "granted")
    return;

  const n = new Notification(title, {
    body,
    icon,
    badge: icon,
    tag,
    renotify: false,
    silent: true,
    data,
  });

  n.onclick = () => {
    window.focus();
    if (typeof onClick === "function") onClick(n);
    n.close();
  };

  if (ttlMs) setTimeout(() => n.close(), ttlMs);
};
