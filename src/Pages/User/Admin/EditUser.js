import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../Service/api";
import Swal from "sweetalert2";
import { getAllCountries } from "../../../Service/CountryService";
import { getAllUniversities } from "../../../Service/UniversityService";
import { uploadUserImage, getUserById, updateUser } from "../../../Service/userService";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState([]);

  // جلب بيانات المستخدم
  const fetchUser = async () => {
    if (!id) {
      console.error("❌ User ID is missing");
      Swal.fire({
        icon: "error",
        title: "❌ خطأ",
        text: "معرف المستخدم غير موجود",
      });
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const userId = Number(id);
      console.log("📤 Fetching user with ID:", userId, "(type:", typeof userId, ")");
      
      if (isNaN(userId) || userId <= 0) {
        throw new Error("معرف المستخدم غير صحيح");
      }
      
      const data = await getUserById(userId);
      console.log("✅ User data received:", data);
      
      if (!data || !data.id) {
        throw new Error("لم يتم العثور على بيانات المستخدم");
      }
      
      // معالجة بيانات الدولة بشكل صحيح
      let countryId = 0;
      if (data.country) {
        if (typeof data.country === "object" && data.country.id) {
          countryId = data.country.id;
        } else if (typeof data.country === "number") {
          countryId = data.country;
        }
      } else if (data.countryId) {
        countryId = typeof data.countryId === "object" ? data.countryId?.id || 0 : data.countryId;
      }

      setUser({
        id: data.id,
        email: data.email || "",
        userName: data.userName || "",
        imageURL: data.imageUrl || data.imageURL || "",
        countryId: countryId,
        universityId: data.university?.id || data.universityId || 0,
      });
    } catch (err) {
      console.error("❌ خطأ في جلب بيانات المستخدم:", err);
      console.error("❌ Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        userId: id,
      });
      
      let errorMessage = "فشل تحميل بيانات المستخدم";
      
      if (err?.message) {
        errorMessage = String(err.message);
      } else if (err?.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = String(errorData.message);
        } else if (errorData?.error) {
          errorMessage = String(errorData.error);
        }
      }
      
      // التأكد من أن الرسالة ليست "[object Object]"
      if (errorMessage === "[object Object]" || errorMessage.includes("[object")) {
        errorMessage = "فشل تحميل بيانات المستخدم. يرجى المحاولة مرة أخرى.";
      }
      
      Swal.fire({
        icon: "error",
        title: "❌ خطأ",
        text: errorMessage,
        confirmButtonColor: "#007C89",
        footer: err?.response?.status ? `رمز الخطأ: ${err.response.status}` : "",
      });
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // جلب قائمة الدول والجامعات
  const fetchData = async () => {
    try {
      const [countriesData, universitiesData] = await Promise.all([
        getAllCountries(),
        getAllUniversities(),
      ]);
      setCountries(countriesData || []);
      setUniversities(universitiesData || []);
    } catch (err) {
      console.error("خطأ في جلب البيانات:", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchData();
  }, [id]);

  // رفع الصورة
  const handleImageChange = (e) => {
    if (e.target.files[0] && user) {
      setImageFile(e.target.files[0]);
      setUser({ ...user, imageURL: URL.createObjectURL(e.target.files[0]) });
    }
  };

  // حفظ التعديلات
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);

    try {
      // التحقق من البيانات قبل الإرسال (نفس منطق EditProfile)
      if (!user.email || !user.userName || !user.countryId) {
        Swal.fire({
          icon: "warning",
          title: "⚠️ تحذير",
          text: "الرجاء تعبئة جميع الحقول المطلوبة",
          confirmButtonColor: "#007C89"
        });
        setSaving(false);
        return;
      }

      if (!user.email.includes("@")) {
        Swal.fire({
          icon: "warning",
          title: "⚠️ تحذير",
          text: "الرجاء إدخال بريد إلكتروني صحيح يحتوي على @",
          confirmButtonColor: "#007C89"
        });
        setSaving(false);
        return;
      }

      let imageURL = user.imageURL || "";
      
      // رفع الصورة إذا كانت موجودة (نفس منطق EditProfile)
      if (imageFile) {
        imageURL = await uploadUserImage(imageFile, user.imageURL);
      }

      // بناء payload بنفس طريقة EditProfile
      const payload = {
        id: user.id,
        email: user.email.trim(),
        userName: user.userName.trim(),
        imageURL: imageURL || "",
        countryId: parseInt(user.countryId) || 0,
        universityId: parseInt(user.universityId) || 0,
        otp: "", // للأدمن لا نحتاج OTP
      };

      console.log("📤 Submitting user update:", {
        userId: user.id,
        payload: payload,
      });

      // استخدام updateUser بنفس طريقة EditProfile
      await updateUser(payload);

      Swal.fire({
        icon: "success",
        title: "✅ تم التعديل",
        text: "تم تحديث بيانات المستخدم بنجاح!",
      }).then(() => navigate("/react-app/admin/users"));
    } catch (err) {
      console.error("❌ خطأ أثناء التعديل:", err);
      console.error("❌ Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });
      
      // استخراج رسالة الخطأ بشكل صحيح
      let errorMessage = "حدث خطأ أثناء تعديل المستخدم";
      
      if (err?.message) {
        errorMessage = String(err.message);
      } else if (err?.response?.data) {
        const errorData = err.response.data;
        
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = String(errorData.message);
        } else if (errorData?.error) {
          errorMessage = String(errorData.error);
        } else if (errorData?.errors) {
          // معالجة أخطاء validation
          if (Array.isArray(errorData.errors)) {
            errorMessage = errorData.errors.join(", ");
          } else if (typeof errorData.errors === "object") {
            const errorMessages = Object.values(errorData.errors)
              .flat()
              .map(e => String(e))
              .filter(e => e && e !== "[object Object]");
            errorMessage = errorMessages.length > 0 
              ? errorMessages.join(", ") 
              : "حدث خطأ في التحقق من البيانات";
          } else {
            errorMessage = String(errorData.errors);
          }
        } else if (typeof errorData === "object") {
          // محاولة استخراج رسالة من الكائن
          const possibleMessages = [
            errorData.title,
            errorData.detail,
            errorData.Message,
            errorData.Error,
          ].filter(Boolean);
          
          if (possibleMessages.length > 0) {
            errorMessage = String(possibleMessages[0]);
          } else {
            // كحل أخير، استخدم JSON لكن مع معالجة
            try {
              const jsonStr = JSON.stringify(errorData, null, 2);
              if (jsonStr && jsonStr !== "{}" && !jsonStr.includes("[object")) {
                errorMessage = jsonStr;
              } else {
                errorMessage = "حدث خطأ غير معروف. يرجى المحاولة مرة أخرى.";
              }
            } catch {
              errorMessage = "حدث خطأ غير معروف. يرجى المحاولة مرة أخرى.";
            }
          }
        }
      }
      
      // التأكد من أن الرسالة ليست "[object Object]"
      if (errorMessage === "[object Object]" || errorMessage.includes("[object")) {
        errorMessage = "حدث خطأ أثناء تعديل المستخدم. يرجى التحقق من البيانات والمحاولة مرة أخرى.";
      }
      
      Swal.fire({
        icon: "error",
        title: "❌ خطأ",
        text: errorMessage,
        confirmButtonColor: "#007C89",
        footer: err?.response?.status ? `رمز الخطأ: ${err.response.status}` : "",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-purple-600 font-semibold">
        ⏳ جاري تحميل بيانات المستخدم...
      </div>
    );

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-red-600 font-semibold">
        ❌ فشل تحميل بيانات المستخدم
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        ✏️ تعديل بيانات المستخدم
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* الاسم */}
        <div>
          <label className="block font-semibold mb-1">الاسم</label>
          <input
            type="text"
            value={user.userName || ""}
            onChange={(e) => setUser({ ...user, userName: e.target.value })}
            className="w-full border p-2 rounded-md"
            required
          />
        </div>

        {/* البريد */}
        <div>
          <label className="block font-semibold mb-1">البريد الإلكتروني</label>
          <input
            type="email"
            value={user.email || ""}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="w-full border p-2 rounded-md"
            required
          />
        </div>

        {/* الصورة */}
        <div>
          <label className="block font-semibold mb-1">الصورة</label>
          {user.imageURL && (
            <div className="mb-2">
              <img
                src={user.imageURL}
                alt="User"
                className="w-32 h-32 object-cover rounded-md border mb-2"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border p-2 rounded-md"
          />
        </div>

        {/* الدولة والجامعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">الدولة</label>
            <select
              value={user.countryId || 0}
              onChange={(e) =>
                setUser({ ...user, countryId: Number(e.target.value) })
              }
              className="w-full border p-2 rounded-md"
            >
              <option value={0}>اختر الدولة</option>
              {countries.map((c) => {
                const countryName = c?.nameCountry || c?.name || String(c?.id || "");
                return (
                  <option key={c.id} value={c.id}>
                    {countryName}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">الجامعة (اختياري)</label>
            <select
              value={user.universityId || 0}
              onChange={(e) =>
                setUser({ ...user, universityId: Number(e.target.value) })
              }
              className="w-full border p-2 rounded-md"
            >
              <option value={0}>اختر الجامعة</option>
              {universities.map((u) => {
                const universityName = u?.name || String(u?.id || "");
                return (
                  <option key={u.id} value={u.id}>
                    {universityName}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/react-app/admin/users")}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            رجوع
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </form>
    </div>
  );
}
