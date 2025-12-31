import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUniversityById,
  updateUniversity,
} from "../../../Service/UniversityService";
import { getAllUsers, uploadUserImage } from "../../../Service/userService";
import Swal from "sweetalert2";

export default function EditUniversity() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [university, setUniversity] = useState({
    id: 0,
    name: "",
    address: "",
    description: "",
    imageURL: "",
    students: [],
  });
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // UI states
  const [filterText, setFilterText] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // fetch data
  const fetchData = async () => {
    try {
      const data = await getUniversityById(id);
      setUniversity({
        id: data.id,
        name: data.name,
        address: data.address,
        description: data.description,
        imageURL: data.imageURL,
        students: data.students ? data.students.map((s) => s.id) : [],
      });

      const users = await getAllUsers();
      // normalize: ensure fields exist with the same names as your response sample
      setAllUsers(
        (users || []).map((u) => ({
          id: u.id,
          email: u.email,
          userName: u.userName || u.name || "",
          imageUrl: u.imageUrl || "",
          registerAt: u.registerAt,
          country: u.country?.nameCountry || u.country || "",
          universityId: u.universityId,
        }))
      );
    } catch (err) {
      console.error("❌ خطأ في جلب البيانات:", err);
      Swal.fire({
        icon: "error",
        title: "خطأ في جلب البيانات",
        text: "حصل خطأ أثناء تحميل بيانات الجامعة أو المستخدمين. حاول إعادة التحميل.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // preview local file
  useEffect(() => {
    if (!selectedImageFile) {
      setPreviewURL("");
      return;
    }
    const objUrl = URL.createObjectURL(selectedImageFile);
    setPreviewURL(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [selectedImageFile]);

  const visibleUsers = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((u) => {
      const name = (u.userName || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        String(u.id).includes(q) ||
        (u.country || "").toLowerCase().includes(q)
      );
    });
  }, [allUsers, filterText]);

  const selectedSet = useMemo(
    () => new Set(university.students || []),
    [university.students]
  );

  const toggleStudent = (userId) => {
    const curr = new Set(university.students || []);
    if (curr.has(userId)) curr.delete(userId);
    else curr.add(userId);
    setUniversity({ ...university, students: Array.from(curr) });
  };

  const handleSelectAllVisible = () => {
    const visibleIds = visibleUsers.map((u) => u.id);
    const curr = new Set(university.students || []);
    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => curr.has(id));

    if (allSelected) visibleIds.forEach((id) => curr.delete(id));
    else visibleIds.forEach((id) => curr.add(id));

    setUniversity({ ...university, students: Array.from(curr) });
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setSelectedImageFile(null);
      return;
    }
    setSelectedImageFile(file);
  };

  const removeSelectedImage = () => setSelectedImageFile(null);

  // format date for display (Arabic locale)
  const formatDate = (iso) => {
    try {
      if (!iso) return "";
      const d = new Date(iso);
      return d.toLocaleString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImageURL = university.imageURL || "";

      if (selectedImageFile) {
        setUploadingImage(true);
        Swal.fire({
          title: "⏳ جارٍ رفع الصورة...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        try {
          const uploaded = await uploadUserImage(
            selectedImageFile,
            university.imageURL || ""
          );
          finalImageURL = uploaded;
          Swal.close();
        } catch (uploadErr) {
          console.error("❌ خطأ في رفع الصورة:", uploadErr);
          Swal.close();
          Swal.fire({
            icon: "error",
            title: "فشل رفع الصورة",
            text: "تعذر رفع الصورة. تأكد من الاتصال أو حجم/نوع الملف وحاول مرة أخرى.",
          });
          setUploadingImage(false);
          setSaving(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      const payload = { ...university, imageURL: finalImageURL };
      await updateUniversity(payload);

      Swal.fire({
        icon: "success",
        title: "✅ تم تعديل الجامعة بنجاح",
        text: "تم حفظ بيانات الجامعة بنجاح",
        confirmButtonText: "رجوع لقائمة الجامعات",
        confirmButtonColor: "#2563eb",
      }).then(() => navigate("/react-app/admin/universities"));
    } catch (err) {
      console.error("❌ خطأ أثناء تعديل الجامعة:", err);
      Swal.fire({
        icon: "error",
        title: "❌ خطأ",
        text: "حدث خطأ أثناء حفظ البيانات! حاول مرة أخرى.",
        confirmButtonText: "حسنًا",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-10 text-gray-600 font-semibold">
        ⏳ جاري تحميل بيانات الجامعة...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
        ✏️ تعديل بيانات الجامعة
      </h2>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic info + image uploader */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">اسم الجامعة:</label>
              <input
                type="text"
                value={university.name}
                onChange={(e) =>
                  setUniversity({ ...university, name: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">العنوان:</label>
              <input
                type="text"
                value={university.address}
                onChange={(e) =>
                  setUniversity({ ...university, address: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">الوصف:</label>
              <textarea
                value={university.description}
                onChange={(e) =>
                  setUniversity({ ...university, description: e.target.value })
                }
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-40 h-40 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
              {previewURL ? (
                <img
                  src={previewURL}
                  alt="معاينة محلية"
                  className="w-full h-full object-cover"
                />
              ) : university.imageURL ? (
                <img
                  src={university.imageURL}
                  alt="معاينة الجامعة"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "";
                    e.currentTarget.alt = "فشل تحميل الصورة";
                  }}
                />
              ) : (
                <span className="text-gray-400 text-center px-2">
                  لا توجد صورة
                </span>
              )}
            </div>

            <div className="mt-3 w-full">
              <label className="block text-gray-700 mb-1">
                رفع صورة جديدة:
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-600"
              />
              {selectedImageFile && (
                <div className="flex items-center justify-between gap-2 mt-2">
                  <div className="text-sm text-gray-600">
                    {selectedImageFile.name} •{" "}
                    {(selectedImageFile.size / 1024).toFixed(0)} KB
                  </div>
                  <button
                    type="button"
                    onClick={removeSelectedImage}
                    className="text-sm text-red-600 hover:underline"
                  >
                    إزالة
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Users selector */}
        <div className="border border-gray-100 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="block text-gray-700">اختر الطلاب:</label>
              <span className="text-sm text-gray-500">
                ({university.students?.length || 0} محدد)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="ابحث بالاسم أو البريد أو المعرف..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={() => setFilterText("")}
                className="text-sm text-gray-600 hover:underline"
              >
                مسح
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="selectAllVisible"
                type="checkbox"
                checked={
                  visibleUsers.length > 0 &&
                  visibleUsers.every((u) => selectedSet.has(u.id))
                }
                onChange={handleSelectAllVisible}
                className="w-4 h-4"
              />
              <label
                htmlFor="selectAllVisible"
                className="text-sm text-gray-700"
              >
                تحديد الكل (المرئي)
              </label>
            </div>

            <div className="text-sm text-gray-500">
              {visibleUsers.length} نتيجة
            </div>
          </div>

          <div className="mt-3 max-h-72 overflow-auto">
            {visibleUsers.length === 0 ? (
              <div className="text-gray-500 text-sm p-3">
                لا يوجد مستخدمون مطابقون للبحث.
              </div>
            ) : (
              <ul className="space-y-2">
                {visibleUsers.map((u) => {
                  const isChecked = selectedSet.has(u.id);
                  // fallback initial: use first letter of userName or email local-part
                  const initial =
                    (u.userName && u.userName.trim().charAt(0)) ||
                    (u.email && u.email.split("@")[0].trim().charAt(0)) ||
                    "?";

                  return (
                    <li
                      key={u.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleStudent(u.id)}
                        className="w-4 h-4"
                      />

                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {u.imageUrl ? (
                            <img
                              src={u.imageUrl}
                              alt={u.userName || u.email || "avatar"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "";
                              }}
                            />
                          ) : (
                            <span className="text-sm text-gray-700 font-semibold">
                              {String(initial).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {u.userName || "غير معروف"}
                            </span>
                            <span className="text-xs text-gray-400">
                              #{u.id}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                            <span>{u.email}</span>
                            <span>•</span>
                            <span>{formatDate(u.registerAt)}</span>
                            {u.country ? (
                              <>
                                <span>•</span>
                                <span>{u.country}</span>
                              </>
                            ) : null}
                            {u.universityId ? (
                              <>
                                <span>•</span>
                                <span>جامعة: {u.universityId}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <p className="text-gray-500 text-xs mt-2">
            يمكنك البحث ثم اختيار الطلاب عبر العلامة، أو استخدام "تحديد الكل
            (المرئي)" لتحديد كل النتائج المعروضة.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between gap-3 mt-2">
          <button
            type="button"
            onClick={() => navigate("/react-app/admin/universities")}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            رجوع
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setUniversity({ ...university, students: [] })}
              className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg hover:bg-yellow-200"
            >
              مسح التحديد
            </button>

            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving || uploadingImage ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
