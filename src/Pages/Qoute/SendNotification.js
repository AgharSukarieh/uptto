import React, { useState, useEffect } from "react";
import api from "../../Service/api";

const notificationTypes = [
  { id: 1, name: "For Register" },
  { id: 2, name: "Problem Request" },
  { id: 3, name: "Solve Problem" },
  { id: 4, name: "Problem Report" },
  { id: 5, name: "Streak Days" },
  { id: 6, name: "System" },
];

const SendNotification = () => {
  const [users, setUsers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [startMessage, setStartMessage] = useState("");
  const [endMessage, setEndMessage] = useState("");
  const [idUser, setIdUser] = useState("");

  const [idProblem, setIdProblem] = useState(0); 
  const [streakDays, setStreakDays] = useState(0); 

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchProblems();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error loading users", err);
    }
  };

  const fetchProblems = async () => {
    try {
      const res = await api.get("/api/problems/all");
      setProblems(res.data);
    } catch (err) {
      console.error("Error loading problems", err);
    }
  };

  const handleSend = async () => {
    if (!type || !title || !startMessage || !endMessage || !idUser) {
      setModalMessage("يرجى تعبئة جميع الحقول المطلوبة!");
      setShowModal(true);
      return;
    }

    if (type === "3" && !streakDays) {
      setModalMessage("يرجى إدخال Streak Days لنوع Solve Problem!");
      setShowModal(true);
      return;
    }

    if (type === "4" && !idProblem) {
      setModalMessage("يرجى اختيار Problem لنوع Problem Report!");
      setShowModal(true);
      return;
    }

    const payload = {
      idUser: parseInt(idUser),
      idProblem: type === "4" ? parseInt(idProblem) : 0,
      streakDays: type === "3" ? parseInt(streakDays) : 0,
      type: parseInt(type),
      title,
      startMessage,
      endMessage
    };

    try {
      await api.post("/api/notifications", payload);
      setModalMessage("تم إرسال الإشعار بنجاح!");
      // Reset fields
      setType("");
      setTitle("");
      setStartMessage("");
      setEndMessage("");
      setIdUser("");
      setIdProblem(0);
      setStreakDays(0);
    } catch (err) {
      console.error(err);
      setModalMessage("حدث خطأ أثناء الإرسال.");
    }
    setShowModal(true);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold text-center mb-4">إرسال إشعار</h2>

      <select
        className="border p-2 w-full rounded"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="">اختر نوع الإشعار</option>
        {notificationTypes.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <input
        className="border p-2 w-full rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="border p-2 w-full rounded"
        placeholder="Start Message"
        value={startMessage}
        onChange={(e) => setStartMessage(e.target.value)}
      />
      <input
        className="border p-2 w-full rounded"
        placeholder="End Message"
        value={endMessage}
        onChange={(e) => setEndMessage(e.target.value)}
      />

      <select
        className="border p-2 w-full rounded"
        value={idUser}
        onChange={(e) => setIdUser(e.target.value)}
      >
        <option value="">اختر المستخدم</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.userName} ({user.email})
          </option>
        ))}
      </select>

      {type === "3" && (
        <input
          className="border p-2 w-full rounded"
          placeholder="Streak Days"
          type="number"
          value={streakDays}
          onChange={(e) => setStreakDays(e.target.value)}
        />
      )}

      {type === "4" && (
        <select
          className="border p-2 w-full rounded"
          value={idProblem}
          onChange={(e) => setIdProblem(e.target.value)}
        >
          <option value="">اختر المشكلة</option>
          {problems.map(p => (
            <option key={p.id} value={p.id}>{p.title} ({p.userName})</option>
          ))}
        </select>
      )}

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition"
        onClick={handleSend}
      >
        إرسال
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center">
            <p className="text-lg font-medium mb-6">{modalMessage}</p>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              onClick={() => setShowModal(false)}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendNotification;
