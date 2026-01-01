import React, { useState, useEffect } from "react";
import { uploadUserImage } from "../../../Service/userService";
import { getAllTags } from "../../../Service/TagServices";
import { getAllContests } from "../../../Service/contestService";
import api from "../../../Service/api";
import { Editor } from "@tinymce/tinymce-react";
import Swal from "sweetalert2";
import {
  PlusCircle,
  Upload,
  Tag,
  FileText,
  Code2,
  Trophy,
} from "lucide-react";

export default function AddProblem() {
  const [problem, setProblem] = useState({
    title: "",
    descriptionProblem: "",
    imageURL: "",
    descriptionInput: "",
    descriptionOutput: "",
    authorNotes: "",
    difficulty: "",
    memory: 0,
    time: 0,
    contestId: null,
    testCase: [],
    tags: [],
    solution: "", // الحقل الجديد لحفظ حل المسألة (كود / شرح)
  });

  const [tags, setTags] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

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

  // جلب الوسوم والمسابقات عند التحميل
  useEffect(() => {
    const fetchData = async () => {
      const [allTags, allContests] = await Promise.all([
        getAllTags(),
        getAllContests(),
      ]);
      setTags(allTags);
      setContests(allContests);
    };
    fetchData();
  }, []);

  // تغيير الحقول
  const handleChange = (name, value) => {
    setProblem((prev) => ({ ...prev, [name]: value }));
  };

  // إضافة Test Case
  const addTestCase = () => {
    setProblem((prev) => ({
      ...prev,
      testCase: [
        ...prev.testCase,
        { problemId: 0, input: "", expectedOutput: "", isSample: false },
      ],
    }));
  };

  // تعديل Test Case
  const handleTestCaseChange = (index, field, value) => {
    const updated = [...problem.testCase];
    updated[index][field] = value;
    setProblem((prev) => ({ ...prev, testCase: updated }));
  };

  // الإرسال
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من الحقول المطلوبة
    if (!problem.title || !problem.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "حقل مطلوب",
        text: "الرجاء إدخال عنوان المسألة",
        confirmButtonColor: "#007C89"
      });
      return;
    }
    
    if (!problem.descriptionProblem || !problem.descriptionProblem.trim()) {
      Swal.fire({
        icon: "warning",
        title: "حقل مطلوب",
        text: "الرجاء إدخال وصف المسألة",
        confirmButtonColor: "#007C89"
      });
      return;
    }
    
    if (!problem.difficulty) {
      Swal.fire({
        icon: "warning",
        title: "حقل مطلوب",
        text: "الرجاء اختيار مستوى الصعوبة",
        confirmButtonColor: "#007C89"
      });
      return;
    }
    
    setLoading(true);
    try {
      let imageURL = "";
      if (imageFile) {
        imageURL = await uploadUserImage(imageFile);
      }

      // تنظيف البيانات قبل الإرسال
      const dataToSend = {
        title: problem.title.trim(),
        descriptionProblem: problem.descriptionProblem.trim(),
        descriptionInput: problem.descriptionInput?.trim() || "",
        descriptionOutput: problem.descriptionOutput?.trim() || "",
        authorNotes: problem.authorNotes?.trim() || "",
        difficulty: problem.difficulty,
        memory: parseInt(problem.memory) || 0,
        time: parseInt(problem.time) || 0,
        imageURL: imageURL || "",
        idUser: parseInt(localStorage.getItem("idUser")),
        contestId: problem.contestId ? parseInt(problem.contestId) : null,
        testCase: problem.testCase || [],
        tags: Array.isArray(problem.tags) ? problem.tags : [],
        solution: problem.solution?.trim() || "",
      };

      // ارسال الحقل الجديد "solution" ضمن بيانات المسألة
      console.log("📤 Sending problem data:", dataToSend);
      const response = await api.post("/api/problems", dataToSend, {
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
      });
      console.log("✅ Response:", response);
      
      Swal.fire({
        icon: "success",
        title: "تم إضافة المسألة بنجاح!",
        text: "تم إضافة المسألة بنجاح 🎉",
        confirmButtonColor: "#007C89",
        timer: 3000
      });

      setProblem({
        title: "",
        descriptionProblem: "",
        imageURL: "",
        descriptionInput: "",
        descriptionOutput: "",
        authorNotes: "",
        difficulty: "",
        memory: 0,
        time: 0,
        contestId: null,
        testCase: [],
        tags: [],
        solution: "", // إعادة تهيئة الحقل الجديد
      });
      setImageFile(null);
    } catch (error) {
      console.error("❌ خطأ أثناء الإرسال:", error);
      console.error("❌ تفاصيل الخطأ:", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.message,
      });
      
      let errorMessage = "حدث خطأ أثناء إضافة المسألة.";
      
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
      
      Swal.fire({
        icon: "error",
        title: "خطأ في إضافة المسألة",
        text: errorMessage,
        confirmButtonColor: "#007C89"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
        <PlusCircle /> إضافة مسألة جديدة
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* العنوان */}
        <div>
          <label className="font-semibold block mb-1">العنوان</label>
          <input
            type="text"
            name="title"
            value={problem.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            className="w-full border p-2 rounded-md"
          />
        </div>

        {/* وصف المسألة */}
        <div>
          <label className="font-semibold block mb-1">وصف المسألة</label>
          <Editor
            apiKey={TINYMCE_API_KEY}
            value={problem.descriptionProblem}
            onEditorChange={(content) =>
              handleChange("descriptionProblem", content)
            }
            init={tinymceInit}
          />
        </div>

        {/* رفع الصورة */}
        <div>
          <label className="font-semibold block mb-1 flex items-center gap-2">
            <Upload size={18} /> صورة المسألة
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="block border p-2 rounded-md w-full"
          />
        </div>

        {/* وصف الإدخال والإخراج */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold block mb-1">وصف الإدخال</label>
            <Editor
              apiKey={TINYMCE_API_KEY}
              value={problem.descriptionInput}
              onEditorChange={(content) =>
                handleChange("descriptionInput", content)
              }
              init={tinymceInit}
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">وصف الإخراج</label>
            <Editor
              apiKey={TINYMCE_API_KEY}
              value={problem.descriptionOutput}
              onEditorChange={(content) =>
                handleChange("descriptionOutput", content)
              }
              init={tinymceInit}
            />
          </div>
        </div>

        {/* ملاحظات الكاتب */}
        <div>
          <label className="font-semibold block mb-1">ملاحظات الكاتب</label>
          <Editor
            apiKey={TINYMCE_API_KEY}
            value={problem.authorNotes}
            onEditorChange={(content) => handleChange("authorNotes", content)}
            init={tinymceInit}
          />
        </div>

        {/* الحقل الجديد: الحل (نص/كود) */}
        <div>
          <label className="font-semibold block mb-1 flex items-center gap-2">
            <FileText size={18} /> الحل
          </label>
          {/* textarea بسيط لتسهيل وضع كود/شرح؛ يمكن استبداله بـ Editor إذا أردت */}
          <textarea
            value={problem.solution}
            onChange={(e) => handleChange("solution", e.target.value)}
            placeholder="ألصق هنا كود الحل C++"
            rows={8}
            className="w-full border p-3 rounded-md font-mono text-sm"
          />
          
        </div>

        {/* الصعوبة - الوقت - الذاكرة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold block mb-1">الصعوبة</label>
            <select
              name="difficulty"
              value={problem.difficulty}
              onChange={(e) => handleChange("difficulty", e.target.value)}
              className="w-full border p-2 rounded-md"
            >
              <option value="">اختر الصعوبة</option>
              <option value="سهل">سهل</option>
              <option value="متوسط">متوسط</option>
              <option value="صعب">صعب</option>
            </select>
          </div>
          <div>
            <label className="font-semibold block mb-1">الذاكرة (MB)</label>
            <input
              type="number"
              name="memory"
              value={problem.memory}
              onChange={(e) => handleChange("memory", e.target.value)}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1">الوقت (ms)</label>
            <input
              type="number"
              name="time"
              value={problem.time}
              onChange={(e) => handleChange("time", e.target.value)}
              className="w-full border p-2 rounded-md"
            />
          </div>
        </div>

        {/* المسابقة */}
        <div>
          <label className="font-semibold flex items-center gap-2 mb-1">
            <Trophy size={18} /> المسابقة التابعة (اختياري)
          </label>
          <select
            name="contestId"
            value={problem.contestId || ""}
            onChange={(e) => handleChange("contestId", e.target.value)}
            className="w-full border p-2 rounded-md"
          >
            <option value="">بدون مسابقة</option>
            {contests.map((contest) => (
              <option key={contest.id} value={contest.id}>
                {contest.name}
              </option>
            ))}
          </select>
        </div>

        {/* الوسوم */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <Tag size={18} /> الوسوم
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  setProblem((prev) => ({
                    ...prev,
                    tags: prev.tags.includes(t.id)
                      ? prev.tags.filter((x) => x !== t.id)
                      : [...prev.tags, t.id],
                  }))
                }
                className={`px-3 py-1.5 rounded-full border transition ${
                  problem.tags.includes(t.id)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 hover:bg-gray-200 border-gray-300"
                }`}
              >
                {t.tagName}
              </button>
            ))}
          </div>
        </div>

        {/* Test Cases */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <Code2 size={18} /> حالات الاختبار
          </h3>
          {problem.testCase.map((t, index) => (
            <div key={index} className="border rounded-md p-3 mb-3 space-y-2">
              <div>
                <label className="block text-sm font-semibold mb-1">Input</label>
                <textarea
                  value={t.input}
                  onChange={(e) =>
                    handleTestCaseChange(index, "input", e.target.value)
                  }
                  rows="2"
                  className="w-full border p-2 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Expected Output</label>
                <textarea
                  value={t.expectedOutput}
                  onChange={(e) =>
                    handleTestCaseChange(index, "expectedOutput", e.target.value)
                  }
                  rows="2"
                  className="w-full border p-2 rounded-md"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={t.isSample}
                  onChange={(e) =>
                    handleTestCaseChange(index, "isSample", e.target.checked)
                  }
                />
                <label className="text-sm font-medium">هل هي عينة؟</label>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addTestCase}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            + إضافة Test Case
          </button>
        </div>

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition font-semibold"
        >
          {loading ? "جاري الإرسال..." : <><FileText size={18} /> إضافة المسألة</>}
        </button>
      </form>
    </div>
  );
}