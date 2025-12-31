import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../Hook/UserContext";
import {
  fetchNotificationsByUser,
  getUnreadNotificationsCount,
} from "../../Service/NotificationServices";

const NotificationsPage = () => {
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const [list, count] = await Promise.all([
          fetchNotificationsByUser(user.id),
          getUnreadNotificationsCount(user.id),
        ]);
        setNotifications(Array.isArray(list) ? list : []);
        setUnreadCount(Number(count) || 0);
      } catch (err) {
        setError("تعذر تحميل الإشعارات");
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  if (!user) {
    return (
      <div
        className="container"
        style={{ padding: "48px 24px", textAlign: "center" }}
      >
        <h2>الإشعارات</h2>
        <p>الرجاء تسجيل الدخول لعرض إشعاراتك.</p>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ padding: "48px 24px", maxWidth: 900, margin: "0 auto" }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>الإشعارات</h2>
          <p style={{ margin: "6px 0 0", color: "#4a5568" }}>
            لديك {unreadCount} إشعار غير مقروء.
          </p>
        </div>
      </header>

      {loading ? (
        <p>...جاري التحميل</p>
      ) : error ? (
        <p style={{ color: "#c53030" }}>{error}</p>
      ) : notifications.length === 0 ? (
        <p>لا توجد إشعارات حالياً.</p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {notifications.map((notif) => (
            <li
              key={notif.id || notif._id}
              style={{
                padding: "14px 16px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                background: notif.isRead ? "#ffffff" : "#f7fafc",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <div style={{ textAlign: "right", flex: 1 }}>
                  <p style={{ margin: "0 0 6px", fontWeight: 600 }}>
                    {notif.title || "إشعار"}
                  </p>
                  <p style={{ margin: 0, color: "#4a5568", lineHeight: 1.6 }}>
                    {notif.content || notif.message || ""}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: "#718096",
                    whiteSpace: "nowrap",
                  }}
                >
                  {notif.createdAt
                    ? new Date(notif.createdAt).toLocaleString()
                    : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
