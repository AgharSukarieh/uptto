import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../Service/api";
import { uploadUserImage } from "../../../Service/userService";

// محول من ISO -> قيمة input datetime-local
const isoToLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const tzOffset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
};

// محول من input datetime-local -> ISO (UTC)
const localInputToIso = (val) => {
  if (!val) return new Date().toISOString();
  const d = new Date(val);
  return d.toISOString();
};

export default function UpdateEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const redirectTimeoutRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [localPreview, setLocalPreview] = useState(null);

  const [form, setForm] = useState({
    id: "",
    title: "",
    description: "",
    imageURL: "",
    createdAt: "",
    location: "",
    keyWord: "",
    linkRegistration: "",
    views: 0,
    numberClickedButton: 0,
  });

  useEffect(() => {
    if (!id) return;
    fetchEvent(id);
    // cleanup on unmount: clear redirect timeout if any
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
    // eslint-disable-next-line
  }, [id]);

  const fetchEvent = async (eventId) => {
    setLoading(true);
    setError("");
    try {
      // محاولة endpoints مختلفة
      let res;
      try {
        res = await api.get(`/api/events/${encodeURIComponent(eventId)}`, {
          headers: { accept: "text/plain" },
        });
      } catch (err) {
        if (err.response?.status !== 404) throw err;
        res = await api.get(`/events/${encodeURIComponent(eventId)}`, {
        headers: { accept: "text/plain" },
      });
      }
      const data = res.data;
      setForm({
        id: data.id ?? "",
        title: data.title ?? "",
        description: data.description ?? "",
        imageURL: data.imageURL ?? "",
        createdAt: isoToLocalInput(data.createdAt),
        location: data.location ?? "",
        keyWord: data.keyWord ?? "",
        linkRegistration: data.linkRegistration ?? "",
        views: data.views ?? 0,
        numberClickedButton: data.numberClickedButton ?? 0,
      });
      setLocalPreview(data.imageURL ?? null);
    } catch (err) {
      console.error(err);
      setError("فشل جلب بيانات الحدث: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess("");
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const num = value === "" ? "" : Number(value);
    setForm((prev) => ({ ...prev, [name]: num }));
  };

  // عند اختيار ملف -> ارفع وحدث imageURL داخليًا
  const handleFileSelect = async (e) => {
    setImageUploadError("");
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const tmpUrl = URL.createObjectURL(file);
    setLocalPreview(tmpUrl);

    setImageUploading(true);
    try {
      const result = await uploadUserImage(file, form.imageURL);
      const newUrl = typeof result === "string" ? result : result?.url ?? result?.imageUrl ?? result;
      if (!newUrl) throw new Error("لم يتم استلام رابط الصورة من السيرفر.");
      setForm((prev) => ({ ...prev, imageURL: newUrl }));
      setSuccess("تم رفع الصورة وتحديث الرابط.");
    } catch (err) {
      console.error("Upload error:", err);
      setImageUploadError("فشل رفع الصورة: " + (err.response?.data || err.message || err));
    } finally {
      setImageUploading(false);
      setTimeout(() => {
        try { URL.revokeObjectURL(tmpUrl); } catch (_) {}
      }, 3000);
    }
  };

  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (imageUploading) {
      setError("الرجاء الانتظار حتى انتهاء رفع الصورة قبل الحفظ.");
      return;
    }

    if (!form.title.trim() || !form.description.trim() || !form.imageURL.trim()) {
      setError("الرجاء تعبئة الحقول المطلوبة: العنوان، الوصف، رفع/وجود صورة.");
      return;
    }

    const payload = {
      id: Number(form.id),
      title: form.title,
      description: form.description,
      imageURL: form.imageURL,
      createdAt: localInputToIso(form.createdAt),
      location: form.location,
      keyWord: form.keyWord,
      linkRegistration: form.linkRegistration,
      // نرسل views و numberClickedButton كما هي لكن المستخدم لا يستطيع تعديلهما
      views: Number(form.views || 0),
      numberClickedButton: Number(form.numberClickedButton || 0),
    };

    setSaving(true);
    try {
      console.log("📤 [UpdateEvent] Updating event with ID:", form.id);
      console.log("📤 [UpdateEvent] Payload:", payload);
      
      // محاولة endpoints مختلفة
      let response;
      try {
        // محاولة /api/events/{id} أولاً
        response = await api.put(`/api/events/${encodeURIComponent(form.id)}`, payload, {
          headers: { 
            "Content-Type": "application/json",
            accept: "*/*",
          },
        });
        console.log("✅ [UpdateEvent] Event updated successfully via /api/events/:", response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          // إذا كان 404، جرب /events/{id}
          console.log("⚠️ [UpdateEvent] /api/events/ returned 404, trying /events/");
          response = await api.put(`/events/${encodeURIComponent(form.id)}`, payload, {
            headers: { 
              "Content-Type": "application/json",
              accept: "*/*",
            },
          });
          console.log("✅ [UpdateEvent] Event updated successfully via /events/:", response.data);
        } else {
          throw err;
        }
      }
      
      setSuccess("تم حفظ التعديلات بنجاح. جاري التحويل لصفحة العرض...");
      // بعد نجاح الحفظ ننتظر لحظات ثم ننقله لصفحة العرض
      redirectTimeoutRef.current = setTimeout(() => {
        navigate(`/react-app/admin/event/${form.id}`);
      }, 1000);
    } catch (err) {
      console.error("❌ [UpdateEvent] Error updating event:", err);
      console.error("❌ [UpdateEvent] Error response:", err?.response);
      console.error("❌ [UpdateEvent] Error status:", err?.response?.status);
      console.error("❌ [UpdateEvent] Error URL:", err?.config?.url);
      
      let errorMessage = "فشل حفظ التعديلات.";
      
      if (err?.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          const errors = Object.values(err.response.data.errors).flat();
          errorMessage = errors.join(", ");
        } else if (err.response.data.title) {
          errorMessage = err.response.data.title;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (id) fetchEvent(id);
    setError("");
    setSuccess("");
    setImageUploadError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10" dir="rtl">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-800">تعديل حدث</h2>
                <p className="mt-1 text-sm text-slate-500">عدل بيانات الحدث ثم اضغط حفظ</p>
              </div>

              <div className="text-sm text-right">
                {loading ? (
                  <div className="inline-flex items-center gap-2 text-sky-600">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    جارٍ جلب البيانات...
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {error ? <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{error}</div> : null}
              {success ? <div className="text-sm text-green-700 bg-green-50 p-2 rounded">{success}</div> : null}
              {imageUploadError ? <div className="text-sm text-red-700 bg-red-50 p-2 rounded">{imageUploadError}</div> : null}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <input type="hidden" name="id" value={form.id} />
              {/* imageURL مخفي للمستخدم لكن يُرسل في payload */}
              <input type="hidden" name="imageURL" value={form.imageURL} />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">العنوان *</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="أضف عنوان الحدث"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الوصف *</label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  required
                  placeholder="أضف وصفًا موجزًا للحدث"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">الصورة *</label>
                  <p className="text-xs text-slate-400 mt-1">ارفع صورة من جهازك أو اترك الصورة الحالية.</p>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={triggerFileDialog}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 focus:outline-none"
                    >
                      رفع صورة جديدة
                    </button>

                    {imageUploading ? (
                      <div className="inline-flex items-center gap-2 text-sky-600 text-sm">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                        </svg>
                        جارٍ رفع الصورة...
                      </div>
                    ) : null}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-slate-700 mb-2">معاينة</label>
                  <div className="w-48 h-36 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {localPreview ? (
                      <img src={localPreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-xs text-slate-400">لا توجد صورة</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ والوقت (createdAt)</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    name="createdAt"
                    value={form.createdAt}
                    onChange={handleChange}
                    type="datetime-local"
                  />
                  <p className="text-xs text-slate-400 mt-1">سيُرسل التاريخ بصيغة ISO (UTC)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الموقع</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="المكان"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">الكلمات المفتاحية</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    name="keyWord"
                    value={form.keyWord}
                    onChange={handleChange}
                    placeholder="مثال: مؤتمرات, تكنولوجيا"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">رابط التسجيل</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    name="linkRegistration"
                    value={form.linkRegistration}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* المشاهدات معروضة للقراءة فقط */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">المشاهدات</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-gray-50 text-slate-700"
                    name="views"
                    type="number"
                    value={form.views}
                    readOnly
                    disabled
                    aria-readonly="true"
                  />
                    </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">عدد نقرات الزر</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-gray-50 text-slate-700"
                    name="numberClickedButton"
                    type="number"
                    value={form.numberClickedButton}
                    readOnly
                    disabled
                    aria-readonly="true"
                  />
                    </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className={`px-4 py-2 rounded-lg text-white ${saving ? "bg-slate-400" : "bg-sky-600 hover:bg-sky-700"}`}
                  type="submit"
                  disabled={saving || imageUploading}
                >
                  {saving ? "جاري الحفظ..." : "حفظ التعديل"}
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-gray-100 text-slate-800 hover:bg-gray-200"
                  onClick={handleReset}
                  disabled={loading || saving || imageUploading}
                >
                  إعادة ضبط
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={() => navigate(-1)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-400">
          ملاحظة: تأكد من إعداد CORS في السيرفر إذا واجهت أخطاء من المتصفح عند استخدام API خارجي.
        </div>
      </div>
    </div>
  );
}