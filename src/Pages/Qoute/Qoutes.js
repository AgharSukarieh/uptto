import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../Service/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import CountUp from "react-countup";

const notificationTypes = [
  { id: 1, name: "التسجيل", color: "#3B82F6" }, // blue-500
  { id: 2, name: "طبات المسائل", color: "#10B981" }, // green-500
  { id: 3, name: "حل المسائل", color: "#FACC15" }, // yellow-500
  { id: 4, name: "متابعة الأشخاص", color: "#EF4444" }, // red-500
  { id: 5, name: "الأيام المتتابعة", color: "#8B5CF6" }, // purple-500
  { id: 6, name: "النظام", color: "#6B7280" }, // gray-500
];

const NotificationPageAdmin = () => {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/notifications/statistics");
      setStats(res.data);
    } catch (err) {
      console.error("Error loading stats", err);
    }
  };

  if (!stats)
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-600">
        Loading statistics...
      </div>
    );

  // بيانات الرسم البياني
  const chartData = notificationTypes.map((type) => ({
    name: type.name,
    count: stats[`numberOfNotifcationType${type.id}`],
    color: type.color,
  }));

  // كروت الإحصائيات
  const statCards = [
    { title: "إجمالي الإشعارات", value: stats.numberOfNotification },
    { title: "اشعارات غير مقروءة", value: stats.numberOfUnReadNotification },
    { title: "اشعارات مقروءة", value: stats.numberOfReadNotification },
    { title: "أنواع الإشعارات", value: stats.numberOfTypeOfNotifcation },
  ];

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <motion.h1
        className="text-4xl font-extrabold text-center text-gray-800 mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        الاشعارات
      </motion.h1>

      {/* كروت الإحصائيات */}
      <div className="flex flex-wrap justify-center gap-6">
        {statCards.map((s, idx) => (
          <motion.div
            key={idx}
            className="bg-white shadow-lg rounded-2xl p-6 text-center w-48 hover:scale-105 transition-transform duration-300 border border-gray-200"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <h3 className="text-gray-500 font-medium mb-2">{s.title}</h3>
            <p className="text-3xl font-bold text-gray-800">
              <CountUp end={s.value} duration={1.5} separator="," />
            </p>
          </motion.div>
        ))}
      </div>

      {/* رسم بياني */}
      <div className="mt-10 bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold mb-6 text-center">أنواع الإشعارات</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* زر إرسال إشعار */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => navigate(`/react-app/admin/SendNotification`)}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl shadow hover:bg-blue-700 transition font-semibold"
        >
          إرسال إشعار
        </button>
      </div>

      {/* بوكسات أنواع الإشعارات */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10">
        {notificationTypes.map((type) => (
          <motion.div
            key={type.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
            onClick={() => navigate(`/react-app/admin/QuotesPage/${type.id}`)}
          >
            <div
              className="text-white text-center shadow-lg rounded-2xl p-6"
              style={{ backgroundColor: type.color }}
            >
              <h2 className="text-xl font-semibold mb-2">{type.name}</h2>
              <p className="text-lg font-bold">
                <CountUp
                  end={stats[`numberOfQouteType${type.id}`]}
                  duration={1.5}
                  separator=","
                />{" "}
                العدد
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPageAdmin;
