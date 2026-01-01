import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../Service/api";
import { getAllTags } from "../../../Service/TagServices";
import { uploadUserImage } from "../../../Service/userService";
import { getProblemById } from "../../../Service/ProblemService";
import Swal from "sweetalert2";
import { Editor } from "@tinymce/tinymce-react";

export default function EditProblem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);

  // TinyMCE API key (انسخ مفتاحك لو أردت)
  const TINYMCE_API_KEY = "ydbgd84essmlucuqp6di1jaz8o8m7murr9yj34z0en3lv9r5";

  const tinymceInit = {
    height: 300,
    menubar: true,
    plugins: [
      "advlist autolink lists link image charmap print preview anchor",
      "searchreplace visualblocks code fullscreen",
      "insertdatetime media table paste codesample",
    ],
    toolbar:
      "undo redo | formatselect | bold italic underline forecolor backcolor | " +
      "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
      "removeformat | link image media table | codesample fullscreen",
    branding: false,
    content_style:
      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
  };

  // جلب بيانات المسألة
  const fetchProblem = async () => {
    if (!id) {
      console.error("❌ Problem ID is missing");
      Swal.fire({
        icon: "error",
        title: "❌ خطأ",
        text: "معرف المسألة غير موجود",
        confirmButtonText: "حسنًا",
      });
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const problemId = Number(id);
      console.log("📤 Fetching problem with ID:", problemId);
      
      if (isNaN(problemId) || problemId <= 0) {
        throw new Error("معرف المسألة غير صحيح");
      }
      
      const data = await getProblemById(problemId);
      console.log("✅ Problem data received:", data);

      // توحيد اسم حقل الصورة بين imageURL و imageUrl إن وجد
      const imageURL = data.imageURL ?? data.imageUrl ?? "";

      // تحويل testCase من API إلى testCaseRequest أو إلى testCase إن استعملتم ذلك
      setProblem({
        ...data,
        imageURL,
        isDeleted: false,
        testCaseRequest: data.testCase || data.testCaseRequest || [],
        solution: data.solution ?? data.solutionText ?? "",
      });

      // تفعيل التاقات القديمة
      setSelectedTags((data.tags || []).map((t) => t.id));
    } catch (error) {
      console.error("❌ Error fetching problem:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        problemId: id,
      });
      
      const errorMessage = error.message || "حدث خطأ أثناء تحميل بيانات المسألة";
      Swal.fire({
        icon: "error",
        title: "❌ خطأ",
        text: errorMessage,
        confirmButtonText: "حسنًا",
        footer: error.response?.status ? `رمز الخطأ: ${error.response.status}` : "",
      });
      setProblem(null);
    } finally {
      setLoading(false);
    }
  };

  // جلب جميع الوسوم
  const fetchTags = async () => {
    try {
      const allTags = await getAllTags();
      setTags(allTags);
    } catch (error) {
      console.error("خطأ أثناء جلب الوسوم:", error);
    }
  };

  useEffect(() => {
    fetchProblem();
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">⏳ جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }
  
  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50" dir="rtl">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <p className="text-xl text-red-500 mb-4">❌ المسألة غير موجودة</p>
          <p className="text-gray-600 mb-4">معرف المسألة: {id}</p>
          <button
            onClick={() => {
              setProblem(null);
              fetchProblem();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // تحديث قيم بسيطة
  const handleChange = (name, value) => {
    setProblem((prev) => ({ ...prev, [name]: value }));
  };

  // تحديث محرر TinyMCE
  const handleEditorChange = (name, content) => {
    setProblem((prev) => ({ ...prev, [name]: content }));
  };

  // اختيار الوسوم
  const handleTagChange = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // تعديل Test Case
  const handleTestCaseChange = (index, field, value) => {
    const updated = [...(problem.testCaseRequest || [])];
    updated[index][field] = value;
    setProblem({ ...problem, testCaseRequest: updated });
  };

  // حذف Test Case
  const removeTestCase = (index) => {
    const updated = [...(problem.testCaseRequest || [])];
    updated.splice(index, 1);
    setProblem({ ...problem, testCaseRequest: updated });
  };

  // إضافة Test Case جديد
  const addTestCase = () => {
    const newTC = { id: 0, problemId: problem.id, input: "", expectedOutput: "", isSample: false };
    const updatedTCs = [...(problem.testCaseRequest || []), newTC];
    setProblem({ ...problem, testCaseRequest: updatedTCs });
  };

  // حفظ التعديلات
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageURL = problem.imageURL || "";

      if (imageFile) {
        imageURL = await uploadUserImage(imageFile);
      } else if (problem.isDeleted) {
        imageURL = "";
      }

      const payload = {
        id: problem.id,
        title: problem.title,
        descriptionProblem: problem.descriptionProblem,
        imageURL: imageURL,
        descriptionInput: problem.descriptionInput,
        descriptionOutput: problem.descriptionOutput,
        authorNotes: problem.authorNotes || "",
        difficulty: problem.difficulty,
        memory: Number(problem.memory) || 0,
        time: Number(problem.time) || 0,
        solution: problem.solution ?? "",
        testCases: (problem.testCaseRequest || []).map(tc => ({
          problemId: problem.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample === true
        })),
        tags: selectedTags
      };

      console.log("📤 Updating problem with ID:", problem.id);
      console.log("📤 Payload:", payload);
      
      const response = await api.put(`/api/problems/${problem.id}`, payload, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
      });
      console.log("✅ Update response:", response);

      Swal.fire({
        icon: "success",
        title: "✅ تم تحديث المسألة",
        text: "تم حفظ التعديلات بنجاح!",
        confirmButtonColor: "#007C89",
        timer: 3000
      }).then(() => navigate("/react-app/admin/Problem-List"));

    } catch (error) {
      console.error("❌ خطأ أثناء تحديث المسألة:", error);
      console.error("❌ تفاصيل الخطأ:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
        url: error?.config?.url,
        method: error?.config?.method,
      });
      
      let errorMessage = "حدث خطأ أثناء تحديث المسألة.";
      
      if (error?.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          const errors = Object.values(error.response.data.errors).flat();
          errorMessage = errors.join(", ");
        } else if (error.response.data.title) {
          errorMessage = `خطأ في العنوان: ${error.response.data.title}`;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      if (error?.response?.status === 401) {
        errorMessage = "غير مصرح لك. يرجى تسجيل الدخول مرة أخرى.";
      } else if (error?.response?.status === 403) {
        errorMessage = "ليس لديك صلاحية لتعديل هذه المسألة";
      } else if (error?.response?.status === 404) {
        errorMessage = "المسألة غير موجودة";
      } else if (error?.response?.status === 400) {
        errorMessage = errorMessage || "البيانات المرسلة غير صحيحة";
      }
      
      Swal.fire({
        icon: "error",
        title: "خطأ في تحديث المسألة",
        text: errorMessage,
        confirmButtonColor: "#007C89"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">تعديل المسألة</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* العنوان */}
        <div>
          <label className="block font-semibold mb-1">العنوان</label>
          <input
            type="text"
            value={problem.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full border p-2 rounded-md"
            required
          />
        </div>

        {/* وصف المسألة (TinyMCE) */}
        <div>
          <label className="block font-semibold mb-1">وصف المسألة</label>
          <Editor
            apiKey={TINYMCE_API_KEY}
            value={problem.descriptionProblem || ""}
            onEditorChange={(content) => handleEditorChange("descriptionProblem", content)}
            init={tinymceInit}
          />
        </div>

        {/* وصف الإدخال (TinyMCE) */}
        <div>
          <label className="block font-semibold mb-1">وصف الإدخال</label>
          <Editor
            apiKey={TINYMCE_API_KEY}
            value={problem.descriptionInput || ""}
            onEditorChange={(content) => handleEditorChange("descriptionInput", content)}
            init={tinymceInit}
          />
        </div>

        {/* وصف الإخراج (TinyMCE) */}
        <div>
          <label className="block font-semibold mb-1">وصف الإخراج</label>
          <Editor
            apiKey={TINYMCE_API_KEY}
            value={problem.descriptionOutput || ""}
            onEditorChange={(content) => handleEditorChange("descriptionOutput", content)}
            init={tinymceInit}
          />
        </div>

        {/* ملاحظات الكاتب (TinyMCE) */}
        <div>
          <label className="block font-semibold mb-1">ملاحظات الكاتب</label>
          <Editor
            apiKey={TINYMCE_API_KEY}
            value={problem.authorNotes || ""}
            onEditorChange={(content) => handleEditorChange("authorNotes", content)}
            init={tinymceInit}
          />
        </div>

        {/* الحقل: الحل (Solution) */}
        <div>
          <label className="block font-semibold mb-1">الحل (Solution)</label>
          <textarea
            value={problem.solution ?? ""}
            onChange={(e) => handleChange("solution", e.target.value)}
            placeholder="ألصق هنا كود الحل (مثلاً C++), أو اكتب شرح الحل..."
            rows={8}
            className="w-full border p-3 rounded-md font-mono text-sm"
          />
          <p className="text-sm text-gray-500 mt-1">
            يمكنك وضع كود الحل أو شرح الحل هنا؛ سيتم حفظه وإرساله مع بيانات المسألة.
          </p>
        </div>

        {/* الصعوبة، الذاكرة، الوقت */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">الصعوبة</label>
            <input
              type="text"
              value={problem.difficulty || ""}
              onChange={(e) => handleChange("difficulty", e.target.value)}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">الذاكرة (MB)</label>
            <input
              type="number"
              value={problem.memory ?? 0}
              onChange={(e) => handleChange("memory", Number(e.target.value))}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">الوقت (ms)</label>
            <input
              type="number"
              value={problem.time ?? 0}
              onChange={(e) => handleChange("time", Number(e.target.value))}
              className="w-full border p-2 rounded-md"
            />
          </div>
        </div>

        {/* رفع الصورة */}
        <div>
          <label className="block font-semibold mb-1">الصورة</label>
          {problem.imageURL && !imageFile && !problem.isDeleted && (
            <div className="mb-2">
              <img
                src={problem.imageURL}
                alt="Problem"
                className="w-48 h-48 object-contain border rounded mb-2"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => setProblem({ ...problem, isDeleted: true })}
                >
                  حذف الصورة
                </button>
                <button
                  type="button"
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => document.getElementById("imageInput").click()}
                >
                  استبدال الصورة
                </button>
              </div>
            </div>
          )}
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImageFile(e.target.files[0]);
                setProblem({ ...problem, isDeleted: false });
              }
            }}
            className="w-full border p-2 rounded-md"
          />
          {problem.isDeleted && !imageFile && (
            <p className="text-sm text-red-500 mt-1">تم حذف الصورة الحالية</p>
          )}
        </div>

        {/* الوسوم */}
        <div>
          <label className="block font-semibold mb-1">الوسوم</label>
          <div className="flex flex-wrap gap-3">
            {tags.map((t) => (
              <label
                key={t.id}
                className={`flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer
                  ${selectedTags.includes(t.id)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-700 border-gray-300"
                  }`}
              >
                <input
                  type="checkbox"
                  value={t.id}
                  checked={selectedTags.includes(t.id)}
                  onChange={() => handleTagChange(t.id)}
                  className="hidden"
                />
                {t.tagName}
              </label>
            ))}
          </div>
        </div>

        {/* Test Cases */}
        <div>
          <label className="block font-semibold mb-2">Test Cases</label>
          {(problem.testCaseRequest || []).map((tc, index) => (
            <div key={index} className="border p-3 rounded mb-2 space-y-2">
              <div>
                <label className="block text-sm">Input</label>
                <textarea
                  rows={2}
                  value={tc.input}
                  onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                  className="w-full border p-1 rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Expected Output</label>
                <textarea
                  rows={2}
                  value={tc.expectedOutput}
                  onChange={(e) => handleTestCaseChange(index, "expectedOutput", e.target.value)}
                  className="w-full border p-1 rounded"
                />
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-sm flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={tc.isSample === true}
                    onChange={(e) => handleTestCaseChange(index, "isSample", e.target.checked)}
                  />
                  Sample Test
                </label>
                <button
                  type="button"
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  onClick={() => removeTestCase(index)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addTestCase}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            إضافة Test Case
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </form>
    </div>
  );
}