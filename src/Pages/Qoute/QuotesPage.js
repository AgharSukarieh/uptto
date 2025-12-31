import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../Service/api";

import { motion, AnimatePresence } from "framer-motion";

const QuotesPage = () => {
  const { id: typeId } = useParams();

  // دالة للحصول على اسم النوع بالعربي
  const getTypeName = (type) => {
    const typeNames = {
      1: "إشعارات التسجيل",
      2: "إشعارات طلبات المسائل",
      3: "إشعارات حل المسائل",
      4: "إشعارات متابعة الأشخاص",
      5: "إشعارات الأيام المتتابعة",
      6: "إشعارات النظام",
      7: "إشعارات متابعة المنشورات",
    };
    return typeNames[type] || `النوع ${type}`;
  };
  const navigate = useNavigate();

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "view" | "edit" | "delete" | "add"
  const [selectedQuote, setSelectedQuote] = useState(null);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/motivational-quotes?type=${typeId}`);
      setQuotes(res.data || []);
    } catch (err) {
      console.error("Error fetching quotes:", err);
      setQuotes([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, [typeId]);

  const openModal = (quote, type) => {
    setSelectedQuote(quote || null);
    setModalType(type);
    setModalOpen(true);
  };

  const handleAddQuote = async (newQuote) => {
    try {
      await api.post("/api/motivational-quotes", newQuote);
      fetchQuotes();
      closeModal();
    } catch (err) {
      console.error("Error adding quote:", err);
      alert("حدث خطأ أثناء إضافة الاقتباس");
    }
  };

  const handleEditQuote = async (updatedQuote) => {
    try {
      await api.put(
        `/api/motivational-quotes/${updatedQuote.id}`,
        updatedQuote
      );
      fetchQuotes();
      closeModal();
    } catch (err) {
      console.error("Error updating quote:", err);
      alert("حدث خطأ أثناء التعديل");
    }
  };

  const handleDeleteQuote = async (id) => {
    try {
      await api.delete(`/api/motivational-quotes/${id}`);
      setQuotes(quotes.filter((q) => q.id !== id));
      closeModal();
    } catch (err) {
      console.error("Error deleting quote:", err);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType("");
    setSelectedQuote(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          رجوع
        </button>
        <button
          onClick={() => openModal(null, "add")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          إضافة اقتباس جديد
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        {getTypeName(parseInt(typeId))}
      </h1>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : quotes.length === 0 ? (
        <p>لا توجد اقتباسات.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="p-5 border rounded-xl shadow bg-white flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold mb-2">{q.title}</h3>
                <p className="text-gray-700 mb-1">
                  <strong>بداية الرسالة:</strong> {q.startMessage}
                </p>
                <p className="text-gray-700">
                  <strong>نهاية الرسالة:</strong> {q.endMessage}
                </p>
              </div>
              <div className="flex gap-2 mt-4 flex-wrap">
                <button
                  onClick={() => openModal(q, "view")}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition min-w-[60px] text-center"
                >
                  عرض
                </button>
                <button
                  onClick={() => openModal(q, "edit")}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition min-w-[60px] text-center"
                >
                  تعديل
                </button>
                <button
                  onClick={() => openModal(q, "delete")}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition min-w-[60px] text-center"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-full max-w-md"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              {modalType === "view" && selectedQuote && (
                <ViewModal quote={selectedQuote} onClose={closeModal} />
              )}

              {modalType === "edit" && selectedQuote && (
                <EditModal
                  quote={selectedQuote}
                  onSave={handleEditQuote}
                  onClose={closeModal}
                />
              )}

              {modalType === "add" && (
                <EditModal
                  quote={{
                    title: "",
                    startMessage: "",
                    endMessage: "",
                    type: parseInt(typeId),
                  }}
                  onSave={handleAddQuote}
                  onClose={closeModal}
                />
              )}

              {modalType === "delete" && selectedQuote && (
                <DeleteModal
                  quote={selectedQuote}
                  onDelete={handleDeleteQuote}
                  onClose={closeModal}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// View Modal
const ViewModal = ({ quote, onClose }) => (
  <div>
    <h2 className="text-xl font-bold mb-4">{quote.title}</h2>
    <p className="mb-2">
      <strong>بداية الرسالة:</strong> {quote.startMessage}
    </p>
    <p className="mb-4">
      <strong>نهاية الرسالة:</strong> {quote.endMessage}
    </p>
    <button
      onClick={onClose}
      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
    >
      إغلاق
    </button>
  </div>
);

// Edit/Add Modal
const EditModal = ({ quote, onSave, onClose }) => {
  const [title, setTitle] = useState("");
  const [startMessage, setStartMessage] = useState("");
  const [endMessage, setEndMessage] = useState("");

  useEffect(() => {
    if (quote) {
      setTitle(quote.title);
      setStartMessage(quote.startMessage);
      setEndMessage(quote.endMessage);
    }
  }, [quote]);

  const handleSave = () => {
    if (!title || !startMessage || !endMessage) {
      alert("جميع الحقول مطلوبة");
      return;
    }
    onSave({
      id: quote.id,
      title,
      startMessage,
      endMessage,
      type: quote.type,
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {quote.id ? "تعديل الاقتباس" : "إضافة اقتباس جديد"}
      </h2>
      <div className="mb-2">
        <label className="block font-semibold mb-1">العنوان:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div className="mb-2">
        <label className="block font-semibold mb-1">بداية الرسالة:</label>
        <input
          type="text"
          value={startMessage}
          onChange={(e) => setStartMessage(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">نهاية الرسالة:</label>
        <input
          type="text"
          value={endMessage}
          onChange={(e) => setEndMessage(e.target.value)}
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          حفظ
        </button>
        <button
          onClick={onClose}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
};

// Delete Modal
const DeleteModal = ({ quote, onDelete, onClose }) => (
  <div>
    <h2 className="text-xl font-bold mb-4">تأكيد الحذف</h2>
    <p className="mb-4">هل أنت متأكد من حذف هذا الاقتباس؟</p>
    <div className="flex gap-2">
      <button
        onClick={() => onDelete(quote.id)}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
      >
        حذف
      </button>
      <button
        onClick={onClose}
        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
      >
        إلغاء
      </button>
    </div>
  </div>
);

export default QuotesPage;
