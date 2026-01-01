import React, { useEffect, useState } from "react";
import { Eye, Edit, Trash, Plus, ArrowLeft } from "lucide-react";
import { getAlgorithmsByTag, deleteAlgorithm as deleteAlgorithmService } from "../../../Service/algorithmService";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function AlgorithmsAdmin() {
  const { id: tagId } = useParams();
  const navigate = useNavigate();

  const [algorithms, setAlgorithms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAlgorithms = async () => {
    if (!tagId) {
      setError("لم يتم تحديد Tag ID في الرابط.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("🔍 [AlgorithmsAdmin] Fetching algorithms for tagId:", tagId);
      
      // استخدام API الجديد مباشرة: GET /api/explained-tags/by-tag/{tagId}
      const data = await getAlgorithmsByTag(Number(tagId));
      console.log("✅ [AlgorithmsAdmin] Algorithms fetched:", data);
      console.log("✅ [AlgorithmsAdmin] Data type:", typeof data, "Is Array:", Array.isArray(data));
      console.log("✅ [AlgorithmsAdmin] Data length:", Array.isArray(data) ? data.length : "N/A");
      
      // البيانات يجب أن تكون مصفوفة من getAlgorithmsByTag
      if (Array.isArray(data)) {
        console.log(`✅ [AlgorithmsAdmin] Setting ${data.length} algorithms`);
        setAlgorithms(data);
      } else {
        console.warn("⚠️ [AlgorithmsAdmin] Unexpected data format:", data);
        setAlgorithms([]);
      }
    } catch (err) {
      console.error("❌ [AlgorithmsAdmin] Error fetching algorithms:", err);
      setError("حدث خطأ أثناء جلب البيانات: " + (err.message || "خطأ غير معروف"));
      setAlgorithms([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteAlgorithm = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذه العملية!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      console.log("🗑️ [AlgorithmsAdmin] Deleting algorithm with id:", id);
      await deleteAlgorithmService(Number(id));
      console.log("✅ [AlgorithmsAdmin] Algorithm deleted successfully");
      
      // إزالة الخوارزمية من القائمة
      setAlgorithms(algorithms.filter((algo) => algo.id !== id));
      
      Swal.fire({
        title: "تم الحذف!",
        text: "تم حذف الخوارزمية بنجاح",
        icon: "success",
        confirmButtonColor: "#7c3aed",
      });
    } catch (err) {
      console.error("❌ [AlgorithmsAdmin] Error deleting algorithm:", err);
      let errorMessage = "حدث خطأ أثناء الحذف.";
      
      if (err?.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          const errors = Object.values(err.response.data.errors).flat();
          errorMessage = errors.join(", ");
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      Swal.fire({
        title: "فشل الحذف",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  useEffect(() => {
    fetchAlgorithms();
  }, [tagId]);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">⏳ جارٍ تحميل البيانات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center py-8">
          <p className="text-red-500 text-lg mb-4">❌ {error}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={fetchAlgorithms}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              🔄 إعادة المحاولة
            </button>
            <button
              onClick={() => navigate("/react-app/admin/Algorithm")}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <ArrowLeft size={16} /> العودة للقائمة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/react-app/admin/Algorithm")}
            className="text-gray-600 hover:text-gray-800"
            title="العودة للقائمة"
          >
            <ArrowLeft size={20} />
          </button>
        <h1 className="text-3xl font-bold text-gray-800">إدارة الخوارزميات</h1>
          {tagId && (
            <span className="text-sm text-gray-500">(Tag ID: {tagId})</span>
          )}
        </div>
        <button
          onClick={() => navigate(`/react-app/admin/AddAlgorithm/${tagId}`)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
        >
          <Plus size={16} /> إضافة خوارزمية
        </button>
      </div>

      {algorithms.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">لا توجد خوارزميات مرتبطة بهذا التاج.</p>
          <button
            onClick={() => navigate(`/react-app/admin/AddAlgorithm/${tagId}`)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mx-auto"
          >
            <Plus size={16} /> إضافة خوارزمية جديدة
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {algorithms.map((algo) => (
          <div
            key={algo.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition flex flex-col justify-between h-full"
          >
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-700">{algo.title || "بدون عنوان"}</h2>
              <p className="text-gray-400 text-sm mt-1">ID: {algo.id}</p>
            </div>

            <div className="flex justify-between mt-auto gap-2">
              <button
                onClick={() => navigate(`/react-app/admin/AlgorithmDetails/${algo.id}`)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                <Eye size={16} /> عرض
              </button>
              <button
                onClick={() => navigate(`/react-app/admin/EditAlgorithm/${algo.id}`)}
                className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
              >
                <Edit size={16} /> تعديل
              </button>
              <button
                onClick={() => deleteAlgorithm(algo.id)}
                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                <Trash size={16} /> حذف
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
