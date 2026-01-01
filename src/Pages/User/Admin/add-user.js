import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../Service/api";
import Swal from "sweetalert2";
import { getAllCountries } from "../../../Service/CountryService";
import { getAllUniversities } from "../../../Service/UniversityService";
import { sendOtpForRegister } from "../../../Service/authService";

const AddUser = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // OTP states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingSignupData, setPendingSignupData] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userName: "",
    countryId: "",
    universityId: "",
    image: null,
  });

  // التحقق من صحة البريد الإلكتروني
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // جلب الدول والجامعات
  const fetchData = async () => {
    try {
      const [countriesData, universitiesData] = await Promise.all([
        getAllCountries(),
        getAllUniversities(),
      ]);
      
      setCountries(countriesData);
      setUniversities(universitiesData || []);
    } catch (err) {
      console.error("فشل جلب البيانات:", err);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء تحميل البيانات",
        confirmButtonColor: "#007C89"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Timer لإعادة إرسال OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // تحديث القيم
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files?.[0] ?? null }));
  };

  // إرسال البيانات
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return;
    }

    const trimmedUsername = formData.userName.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();

    // التحقق من الحقول المطلوبة (نفس منطق التسجيل)
    if (!trimmedUsername) {
      Swal.fire({
        icon: "warning",
        title: "حقل مطلوب",
        text: "يرجى إدخال اسم المستخدم",
        confirmButtonColor: "#007C89"
      });
      return;
    }

    if (!trimmedEmail) {
      Swal.fire({
        icon: "warning",
        title: "حقل مطلوب",
        text: "يرجى إدخال البريد الإلكتروني",
        confirmButtonColor: "#007C89"
      });
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Swal.fire({
        icon: "warning",
        title: "بريد إلكتروني غير صحيح",
        text: "يرجى إدخال بريد إلكتروني صحيح",
        confirmButtonColor: "#007C89"
      });
      return;
    }

    if (!trimmedPassword) {
      Swal.fire({
        icon: "warning",
        title: "حقل مطلوب",
        text: "يرجى إدخال كلمة السر",
        confirmButtonColor: "#007C89"
      });
      return;
    }

    if (trimmedPassword.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "كلمة سر قصيرة",
        text: "كلمة السر يجب أن تكون 8 أحرف على الأقل",
        confirmButtonColor: "#007C89"
      });
      return;
    }

    if (!formData.countryId) {
      Swal.fire({
        icon: "warning",
        title: "حقل مطلوب",
        text: "يرجى اختيار الدولة",
        confirmButtonColor: "#007C89"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // حفظ بيانات التسجيل المؤقتة
      setPendingSignupData({
        trimmedUsername,
        trimmedEmail,
        trimmedPassword,
        countryId: formData.countryId,
        universityId: formData.universityId,
        image: formData.image
      });

      // إرسال طلب لإرسال OTP
      console.log("📤 Sending OTP request for:", trimmedEmail);
      await sendOtpForRegister(trimmedEmail);

      // عرض modal OTP
      setShowOtpModal(true);
      setResendCooldown(60);
      Swal.fire({
        icon: "success",
        title: "تم إرسال رمز التحقق",
        text: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
        confirmButtonColor: "#007C89",
        timer: 3000
      });
    } catch (err) {
      console.error("❌ خطأ عند إضافة المستخدم:", err);
      console.error("❌ تفاصيل الخطأ:", {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        data: err?.response?.data,
        message: err?.message,
      });
      
      let errorMessage = "حدث خطأ أثناء إضافة المستخدم.";
      
      if (err?.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          const errors = Object.values(err.response.data.errors).flat();
          errorMessage = errors.join(", ");
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      Swal.fire({
        icon: "error",
        title: "خطأ في إضافة المستخدم",
        text: errorMessage,
        confirmButtonColor: "#007C89"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // التحقق من OTP وإنشاء الحساب
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Swal.fire({
        icon: "warning",
        title: "حقل مطلوب",
        text: "الرجاء إدخال رمز التحقق",
        confirmButtonColor: "#007C89"
      });
      return;
    }

    if (!pendingSignupData) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "خطأ في البيانات المؤقتة",
        confirmButtonColor: "#007C89"
      });
      return;
    }

    setOtpLoading(true);
    try {
      const otpValue = otp.trim();
      
      console.log("📤 Creating account with OTP:", {
        email: pendingSignupData.trimmedEmail,
        username: pendingSignupData.trimmedUsername,
        countryId: pendingSignupData.countryId,
        universityId: pendingSignupData.universityId,
        hasImage: !!pendingSignupData.image,
        otp: otpValue
      });

      // إرسال بيانات التسجيل مع OTP
      const queryParams = new URLSearchParams({
        Email: pendingSignupData.trimmedEmail,
        Password: pendingSignupData.trimmedPassword,
        UserName: pendingSignupData.trimmedUsername,
        CountryId: pendingSignupData.countryId.toString(),
        otp: otpValue,
      });
      
      // إضافة UniversityId إذا كان موجوداً
      if (pendingSignupData.universityId) {
        queryParams.append("UniversityId", pendingSignupData.universityId.toString());
      }

      // استخدام FormData
      const formDataToSend = new FormData();
      if (pendingSignupData.image) {
        formDataToSend.append("image", pendingSignupData.image);
      }

      const response = await api.post(
        `/api/auth/register?${queryParams.toString()}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ User created successfully:", response.data);

      // إغلاق modal OTP ومسح البيانات
      setShowOtpModal(false);
      setOtp("");
      setPendingSignupData(null);
      
      Swal.fire({
        icon: "success",
        title: "تم إنشاء المستخدم بنجاح!",
        text: "تم إضافة المستخدم بنجاح 🎉",
        confirmButtonColor: "#007C89",
        timer: 3000
      }).then(() => {
        navigate("/react-app/admin/users");
      });
    } catch (error) {
      console.error("❌ Error creating account:", error);
      let errorMessage = "حدث خطأ أثناء إنشاء الحساب.";
      
      if (error?.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          const errors = Object.values(error.response.data.errors).flat();
          errorMessage = errors.join(", ");
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Swal.fire({
        icon: "error",
        title: "خطأ في إنشاء الحساب",
        text: errorMessage,
        confirmButtonColor: "#007C89"
      });
    } finally {
      setOtpLoading(false);
    }
  };

  // إعادة إرسال OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !pendingSignupData) return;

    setOtpLoading(true);
    try {
      await sendOtpForRegister(pendingSignupData.trimmedEmail);
      Swal.fire({
        icon: "success",
        title: "تم إرسال رمز التحقق",
        text: "تم إرسال رمز التحقق مرة أخرى",
        confirmButtonColor: "#007C89",
        timer: 2000
      });
      setResendCooldown(60);
    } catch (error) {
      console.error("Error resending OTP:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: error.message || "خطأ في إعادة الإرسال",
        confirmButtonColor: "#007C89"
      });
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-purple-600 font-semibold">
        جاري تحميل البيانات...
      </div>
    );

  return (
    <div className="p-8 min-h-screen bg-gray-100 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
        dir="rtl"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-700">
          ➕ إضافة مستخدم جديد
        </h1>

        {/* اسم المستخدم */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">
            اسم المستخدم
          </label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            placeholder="مثال: أحمد محمد"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        {/* البريد الإلكتروني */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        {/* كلمة المرور */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">
            كلمة المرور
          </label>
          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {passwordVisible ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">يجب أن تكون 8 أحرف على الأقل</p>
        </div>

        {/* الصورة الشخصية */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">
            الصورة الشخصية (اختياري)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* الدولة والجامعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              الدولة <span className="text-red-500">*</span>
            </label>
            <select
              name="countryId"
              value={formData.countryId}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">اختر الدولة</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameCountry || c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              الجامعة (اختياري)
            </label>
            <select
              name="universityId"
              value={formData.universityId}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">اختر الجامعة</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "جاري إرسال رمز التحقق..." : "إرسال رمز التحقق"}
        </button>
      </form>

      {/* OTP Modal */}
      {showOtpModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {}}
        >
          <div 
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-purple-700">التحقق من البريد الإلكتروني</h2>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp("");
                  setPendingSignupData(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                تم إرسال رمز التحقق إلى بريدك الإلكتروني:
              </p>
              <p className="font-semibold text-purple-700">
                {pendingSignupData?.trimmedEmail}
              </p>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">
                رمز التحقق (OTP)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                maxLength="6"
                disabled={otpLoading}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || !otp.trim()}
                className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpLoading ? "جاري التحقق..." : "تحقق وإنشاء الحساب"}
              </button>
              
              <button
                onClick={handleResendOtp}
                disabled={otpLoading || resendCooldown > 0}
                className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0
                  ? `إعادة الإرسال بعد ${resendCooldown} ثانية`
                  : "إعادة إرسال رمز التحقق"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;
