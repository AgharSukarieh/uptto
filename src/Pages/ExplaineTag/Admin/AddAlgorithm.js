// src/Pages/Problem/Admin/AddAlgorithm.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../Service/api"; // افترض أن هذا axios instance مع baseURL مضبوط
import { Editor } from "@tinymce/tinymce-react";
import { addAlgorithm as addAlgorithmService } from "../../../Service/algorithmService";

/**
 * ملاحظة مهمة:
 * 1) تأكد أن ملف Service/api يعرّف axios instance مع baseURL صحيح (مثال: http://arabcodetest.runasp.net)
 * 2) إذا استمر 404 عند /image/UploadImage جرّب فتح الـ URL النهائي في Postman لتتأكد الطريق صحيح.
 */

/* رفع الصورة thumbnail مع معالجة أخطاء واضحة */
const uploadUserImage = async (imageFile, currentImageURL = "") => {
  if (!imageFile) return currentImageURL;
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const res = await api.post("/uploads/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    // تحسن المسج لسهولة الديباغ
    console.error("uploadUserImage error:", err);
    // رمي الخطأ للأعلى حتى يتعامل handler الرئيسي معه ويعرض مودال
    throw err;
  }
};

/* رفع الفيديو */
const uploadVideoFile = async (file) => {
  if (!file) return "";
  const formData = new FormData();
  formData.append("video", file);
  try {
    const res = await api.post("/uploads/videos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    console.error("uploadVideoFile error:", err);
    throw err;
  }
};

export default function AddAlgorithm() {
  const { tagId } = useParams();
  const navigate = useNavigate();

  const [algorithm, setAlgorithm] = useState({
    title: "",
    overview: "",
    complexity: "",
    steps: "",
    start: "",
    end: "",
    tagId: Number(tagId) || 0,
    imageURL: "",
    shortDescription: "",
    exampleTags: [],
    youTubeLinks: [],
    videos: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [thumbnailPreviews, setThumbnailPreviews] = useState([]);
  const [exampleVideoPreviews, setExampleVideoPreviews] = useState([]);
  const [exampleThumbnailPreviews, setExampleThumbnailPreviews] = useState([]);
  const [modal, setModal] = useState({ show: false, message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const TINYMCE_API_KEY = "ydbgd84essmlucuqp6di1jaz8o8m7murr9yj34z0en3lv9r5";

  // تحديث tagId عند تغيير الرابط
  useEffect(() => {
    if (tagId) {
      setAlgorithm(prev => ({
        ...prev,
        tagId: Number(tagId) || 0
      }));
    }
  }, [tagId]);

  /* ======= IMPORTANT FIX: pass plugins as individual strings (NOT grouped with spaces) ======= */
  const tinymceInit = {
    height: 250,
    menubar: true,
    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "print",
      "preview",
      "anchor",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "media",
      "table",
      "paste",
      "codesample",
    ],
    toolbar:
      "undo redo | formatselect | bold italic underline | forecolor backcolor | " +
      "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
      "removeformat | link image media table | codesample fullscreen",
    branding: false,
    content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
  };

  // -------- Handlers --------
  const handleChange = (field, value) => setAlgorithm({ ...algorithm, [field]: value });

  const handleExampleChange = (index, field, value) => {
    const newExamples = [...algorithm.exampleTags];
    newExamples[index] = { ...newExamples[index], [field]: value };
    setAlgorithm({ ...algorithm, exampleTags: newExamples });
  };

  const handleYouTubeChange = (index, field, value) => {
    const newLinks = [...algorithm.youTubeLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setAlgorithm({ ...algorithm, youTubeLinks: newLinks });
  };

  const handleVideoChange = (index, field, value) => {
    const newVideos = [...algorithm.videos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    setAlgorithm({ ...algorithm, videos: newVideos });
  };

  // -------- Add / Remove --------
  const addExample = () => {
    setAlgorithm({
      ...algorithm,
      exampleTags: [
        ...algorithm.exampleTags,
        { id: 0, title: "", code: "", explanation: "", input: "", output: "", stepByStep: "", priority: 1, explaineTagId: 0, videos: [] },
      ],
    });
    setExampleVideoPreviews([...exampleVideoPreviews, []]);
    setExampleThumbnailPreviews([...exampleThumbnailPreviews, []]);
  };

  const removeExample = (index) => {
    const newExamples = [...algorithm.exampleTags];
    newExamples.splice(index, 1);
    setAlgorithm({ ...algorithm, exampleTags: newExamples });

    const vpre = [...exampleVideoPreviews];
    vpre.splice(index, 1);
    setExampleVideoPreviews(vpre);

    const tpre = [...exampleThumbnailPreviews];
    tpre.splice(index, 1);
    setExampleThumbnailPreviews(tpre);
  };

  const addYouTubeLink = () => {
    setAlgorithm({ ...algorithm, youTubeLinks: [...algorithm.youTubeLinks, { id: 0, title: "", url: "", description: "", explaineTagId: 0 }] });
  };

  const removeYouTubeLink = (index) => {
    const newLinks = [...algorithm.youTubeLinks];
    newLinks.splice(index, 1);
    setAlgorithm({ ...algorithm, youTubeLinks: newLinks });
  };

  const addVideo = () => {
    setAlgorithm({ ...algorithm, videos: [...algorithm.videos, { title: "", description: "", file: null, thumbnailFile: null, url: "", thumbnailUrl: "", explaineTagId: 0 }] });
    setVideoPreviews([...videoPreviews, ""]);
    setThumbnailPreviews([...thumbnailPreviews, ""]);
  };

  const removeVideo = (index) => {
    const newVideos = [...algorithm.videos];
    newVideos.splice(index, 1);
    setAlgorithm({ ...algorithm, videos: newVideos });

    const newPreviews = [...videoPreviews];
    newPreviews.splice(index, 1);
    setVideoPreviews(newPreviews);

    const newThumbs = [...thumbnailPreviews];
    newThumbs.splice(index, 1);
    setThumbnailPreviews(newThumbs);
  };

  // -------- Previews --------
  const handleVideoFileSelect = (index, file) => {
    const newVideos = [...algorithm.videos];
    newVideos[index] = { ...newVideos[index], file };
    setAlgorithm({ ...algorithm, videos: newVideos });

    const previewUrl = URL.createObjectURL(file);
    const newPreviews = [...videoPreviews];
    newPreviews[index] = previewUrl;
    setVideoPreviews(newPreviews);
  };

  const handleThumbnailSelect = (index, file) => {
    const newVideos = [...algorithm.videos];
    newVideos[index] = { ...newVideos[index], thumbnailFile: file };
    setAlgorithm({ ...algorithm, videos: newVideos });

    const previewUrl = URL.createObjectURL(file);
    const newThumbs = [...thumbnailPreviews];
    newThumbs[index] = previewUrl;
    setThumbnailPreviews(newThumbs);
  };

  // Example videos handlers (per example)
  const handleExampleVideoSelect = (exIndex, vidIndex, file) => {
    const newExamples = [...algorithm.exampleTags];
    if (!newExamples[exIndex].videos) newExamples[exIndex].videos = [];
    newExamples[exIndex].videos[vidIndex] = { ...(newExamples[exIndex].videos[vidIndex] || {}), file };
    setAlgorithm({ ...algorithm, exampleTags: newExamples });

    const newPreviews = [...exampleVideoPreviews];
    if (!newPreviews[exIndex]) newPreviews[exIndex] = [];
    newPreviews[exIndex][vidIndex] = URL.createObjectURL(file);
    setExampleVideoPreviews(newPreviews);
  };

  const handleExampleThumbnailSelect = (exIndex, vidIndex, file) => {
    const newExamples = [...algorithm.exampleTags];
    if (!newExamples[exIndex].videos) newExamples[exIndex].videos = [];
    newExamples[exIndex].videos[vidIndex] = { ...(newExamples[exIndex].videos[vidIndex] || {}), thumbnailFile: file };
    setAlgorithm({ ...algorithm, exampleTags: newExamples });

    const newThumbs = [...exampleThumbnailPreviews];
    if (!newThumbs[exIndex]) newThumbs[exIndex] = [];
    newThumbs[exIndex][vidIndex] = URL.createObjectURL(file);
    setExampleThumbnailPreviews(newThumbs);
  };

  const addExampleVideo = (exIndex) => {
    const newExamples = [...algorithm.exampleTags];
    if (!newExamples[exIndex].videos) newExamples[exIndex].videos = [];
    newExamples[exIndex].videos.push({ title: "", description: "", file: null, thumbnailFile: null, url: "", thumbnailUrl: "" });
    setAlgorithm({ ...algorithm, exampleTags: newExamples });

    const newVideoPreviews = [...exampleVideoPreviews];
    if (!newVideoPreviews[exIndex]) newVideoPreviews[exIndex] = [];
    newVideoPreviews[exIndex].push("");
    setExampleVideoPreviews(newVideoPreviews);

    const newThumbPreviews = [...exampleThumbnailPreviews];
    if (!newThumbPreviews[exIndex]) newThumbPreviews[exIndex] = [];
    newThumbPreviews[exIndex].push("");
    setExampleThumbnailPreviews(newThumbPreviews);
  };

  const removeExampleVideo = (exIndex, vidIndex) => {
    const newExamples = [...algorithm.exampleTags];
    newExamples[exIndex].videos.splice(vidIndex, 1);
    setAlgorithm({ ...algorithm, exampleTags: newExamples });

    const newVPre = [...exampleVideoPreviews];
    newVPre[exIndex].splice(vidIndex, 1);
    setExampleVideoPreviews(newVPre);

    const newTPre = [...exampleThumbnailPreviews];
    newTPre[exIndex].splice(vidIndex, 1);
    setExampleThumbnailPreviews(newTPre);
  };

  // -------- Submit (upload + API) --------
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setUploadProgress("جار رفع الفيديوهات...");

      // رفع الفيديوهات الرئيسية
      const videosWithUrl = await Promise.all(
        algorithm.videos.map(async (v) => {
          let uploadedVideoUrl = v.url || "";
          let uploadedThumbUrl = v.thumbnailUrl || "";

          if (v.file) {
            try {
              uploadedVideoUrl = await uploadVideoFile(v.file);
            } catch (err) {
              // إذا فشل رفع فيديو، أوقف العملية وأظهر رسالة واضحة
              setModal({ show: true, message: "فشل رفع أحد الفيديوهات. تأكد من المسارات وحاول لاحقاً.", type: "error" });
              throw err;
            }
          }

          if (v.thumbnailFile) {
            try {
              uploadedThumbUrl = await uploadUserImage(v.thumbnailFile, v.thumbnailUrl);
            } catch (err) {
              setModal({ show: true, message: "فشل رفع صورة مصغرة. تأكد من المسار وحاول لاحقاً.", type: "error" });
              throw err;
            }
          }

          return { ...v, url: uploadedVideoUrl, thumbnailUrl: uploadedThumbUrl, file: null, thumbnailFile: null };
        })
      );

      // رفع فيديوهات الأمثلة (ملاحظة: فيديوهات الأمثلة لا تُرسل في exampleTags حسب API)
      // لكن نحتفظ بها محلياً للعرض فقط
      setUploadProgress("جار رفع فيديوهات الأمثلة...");
      const exampleVideos = await Promise.all(
        algorithm.exampleTags.map(async (ex) => {
          // ملاحظة: فيديوهات الأمثلة (ex.videos) لا تُرسل في exampleTags حسب curl command
          // لكن نحتفظ بها محلياً للعرض فقط
          // إذا كان هناك فيديوهات، نرفعها لكن لا نرسلها في exampleTags
          
          // رفع فيديوهات الأمثلة إذا كانت موجودة (للاحتفاظ بها محلياً فقط)
          if (ex.videos && ex.videos.length > 0) {
            await Promise.all(
              ex.videos.map(async (v) => {
                if (v.file) {
                  try {
                    await uploadVideoFile(v.file);
                  } catch (err) {
                    console.warn("⚠️ [AddAlgorithm] Failed to upload example video:", err);
                    // لا نرمي الخطأ هنا لأن فيديوهات الأمثلة لا تُرسل في API
                  }
                }
                if (v.thumbnailFile) {
                  try {
                    await uploadUserImage(v.thumbnailFile, v.thumbnailUrl);
                  } catch (err) {
                    console.warn("⚠️ [AddAlgorithm] Failed to upload example video thumbnail:", err);
                    // لا نرمي الخطأ هنا لأن فيديوهات الأمثلة لا تُرسل في API
                  }
                }
              })
            );
          }
          
          // إرجاع example بدون videos (حسب curl command، exampleTags لا تحتوي على videos)
          const { videos, ...exampleWithoutVideos } = ex;
          return exampleWithoutVideos;
        })
      );

      // رفع الصورة الرئيسية أولاً
      let finalImageURL = algorithm.imageURL || "";
      if (imageFile) {
        setUploadProgress("جار رفع الصورة الرئيسية...");
        try {
          finalImageURL = await uploadUserImage(imageFile, algorithm.imageURL);
          console.log("✅ [AddAlgorithm] Image uploaded:", finalImageURL);
        } catch (err) {
          console.error("❌ [AddAlgorithm] Image upload failed:", err);
          setModal({ show: true, message: "فشل رفع الصورة الرئيسية: " + (err?.message || "خطأ غير معروف"), type: "error" });
          throw err;
        }
      }

      setUploadProgress("جار إضافة الخوارزمية...");
      
      // إعداد البيانات النهائية حسب API الجديد
      const finalAlgorithmData = {
        ...algorithm,
        imageURL: finalImageURL,
        videos: videosWithUrl,
        exampleTags: exampleVideos,
        // التأكد من أن exampleTags لا تحتوي على videos (فيديوهات الأمثلة لا تُرسل في exampleTags)
        exampleTags: exampleVideos.map(ex => ({
          title: ex.title || "",
          code: ex.code || "",
          explanation: ex.explanation || "",
          input: ex.input || "",
          output: ex.output || "",
          stepByStep: ex.stepByStep || "",
          priority: Number(ex.priority) || 0,
          explaineTagId: 0
        }))
      };

      console.log("📤 [AddAlgorithm] Final data to send:", JSON.stringify(finalAlgorithmData, null, 2));
      
      // استخدام addAlgorithmService من algorithmService
      await addAlgorithmService(finalAlgorithmData);

      setUploadProgress("");
      setModal({ show: true, message: "تم إضافة الخوارزمية بنجاح!", type: "success" });
    } catch (err) {
      console.error("❌ [AddAlgorithm] handleSubmit error:", err);
      console.error("❌ [AddAlgorithm] Error details:", err?.response?.data || err?.message);
      
      let errorMessage = "حدث خطأ أثناء الإضافة. تفقد الكونسول والـ Network.";
      
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
      
      // لو لم نضع مودال مسبقاً لأحد الأخطاء، نعرض مودال عام
      if (!modal.show) {
        setModal({ show: true, message: errorMessage, type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  // -------- UI --------
  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center space-y-4 shadow-lg">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-800 font-semibold">{uploadProgress}</p>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`bg-white rounded-lg p-6 w-96 shadow-lg border-l-4 ${modal.type === "success" ? "border-green-500" : "border-red-500"}`}>
            <p className="text-gray-800">{modal.message}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  const type = modal.type;
                  setModal({ ...modal, show: false });
                  if (type === "success") navigate(`/react-app/admin/Algorithm/${tagId}`);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                موافق
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">إضافة خوارزمية جديدة</h1>

      {/* Basic Fields */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <label className="font-semibold">العنوان</label>
        <input type="text" value={algorithm.title} onChange={(e) => handleChange("title", e.target.value)} className="w-full border p-3 rounded" />

        <label className="font-semibold">الوصف المختصر (مطلوب)</label>
        <textarea 
          value={algorithm.shortDescription || ""} 
          onChange={(e) => handleChange("shortDescription", e.target.value)} 
          className="w-full border p-3 rounded" 
          rows="3"
          placeholder="أدخل وصفاً مختصراً للخوارزمية..."
        />

        <label className="font-semibold">صورة الخوارزمية (مطلوب)</label>
        <div className="space-y-2">
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImageFile(file);
                const preview = URL.createObjectURL(file);
                setImagePreview(preview);
              }
            }}
            className="w-full border p-3 rounded"
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="max-w-xs max-h-48 rounded border" />
            </div>
          )}
        </div>

        <label className="font-semibold">نظرة عامة</label>
        <Editor apiKey={TINYMCE_API_KEY} value={algorithm.overview} onEditorChange={(content) => handleChange("overview", content)} init={tinymceInit} />

        <label className="font-semibold">التعقيد</label>
        <input type="text" value={algorithm.complexity} onChange={(e) => handleChange("complexity", e.target.value)} className="w-full border p-3 rounded" />

        <label className="font-semibold">الخطوات</label>
        <Editor apiKey={TINYMCE_API_KEY} value={algorithm.steps} onEditorChange={(content) => handleChange("steps", content)} init={tinymceInit} />

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="font-semibold">بداية الشرح</label>
            <Editor apiKey={TINYMCE_API_KEY} value={algorithm.start} onEditorChange={(content) => handleChange("start", content)} init={tinymceInit} />
          </div>
          <div className="flex-1">
            <label className="font-semibold">نهاية الشرح</label>
            <Editor apiKey={TINYMCE_API_KEY} value={algorithm.end} onEditorChange={(content) => handleChange("end", content)} init={tinymceInit} />
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-2xl font-semibold flex justify-between items-center border-b pb-1 mb-4">
          أمثلة
          <button onClick={addExample} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">إضافة مثال</button>
        </h2>

        {algorithm.exampleTags.map((example, exIndex) => (
          <div key={exIndex} className="border p-4 rounded my-2 bg-gray-50 space-y-2 relative">
            <button onClick={() => removeExample(exIndex)} className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">حذف</button>

            <label className="font-semibold">عنوان المثال</label>
            <input type="text" value={example.title} onChange={(e) => handleExampleChange(exIndex, "title", e.target.value)} className="w-full border p-2 rounded" />

            <label className="font-semibold">الكود</label>
            <textarea value={example.code} onChange={(e) => handleExampleChange(exIndex, "code", e.target.value)} className="w-full border p-2 rounded" />

            <label className="font-semibold">شرح خطوة بخطوة</label>
            <Editor apiKey={TINYMCE_API_KEY} value={example.stepByStep} onEditorChange={(content) => handleExampleChange(exIndex, "stepByStep", content)} init={tinymceInit} />

            <label className="font-semibold">الشرح العام</label>
            <Editor apiKey={TINYMCE_API_KEY} value={example.explanation} onEditorChange={(content) => handleExampleChange(exIndex, "explanation", content)} init={tinymceInit} />

            <label className="font-semibold">Input</label>
            <input type="text" value={example.input} onChange={(e) => handleExampleChange(exIndex, "input", e.target.value)} className="w-full border p-2 rounded" />

            <label className="font-semibold">Output</label>
            <input type="text" value={example.output} onChange={(e) => handleExampleChange(exIndex, "output", e.target.value)} className="w-full border p-2 rounded" />

            {/* Example Videos */}
            <div className="space-y-2 mt-2">
              <h3 className="font-semibold">فيديوهات المثال</h3>
              {(example.videos || []).map((ev, vidIndex) => (
                <div key={vidIndex} className="border p-2 rounded relative bg-white/30">
                  <button onClick={() => removeExampleVideo(exIndex, vidIndex)} className="absolute top-1 right-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">حذف</button>

                  <label>عنوان الفيديو</label>
                  <input type="text" value={ev.title} onChange={(e) => {
                    const newExamples = [...algorithm.exampleTags];
                    newExamples[exIndex].videos[vidIndex].title = e.target.value;
                    setAlgorithm({ ...algorithm, exampleTags: newExamples });
                  }} className="w-full border p-1 rounded" />

                  <label>وصف الفيديو</label>
                  <textarea value={ev.description} onChange={(e) => {
                    const newExamples = [...algorithm.exampleTags];
                    newExamples[exIndex].videos[vidIndex].description = e.target.value;
                    setAlgorithm({ ...algorithm, exampleTags: newExamples });
                  }} className="w-full border p-1 rounded" />

                  <label>رفع الفيديو</label>
                  <input type="file" accept="video/*" onChange={(e) => handleExampleVideoSelect(exIndex, vidIndex, e.target.files[0])} />
                  {exampleVideoPreviews[exIndex] && exampleVideoPreviews[exIndex][vidIndex] && (
                    <video src={exampleVideoPreviews[exIndex][vidIndex]} controls className="w-full mt-2 rounded" />
                  )}

                  <label className="mt-2">رفع صورة مصغرة</label>
                  <input type="file" accept="image/*" onChange={(e) => handleExampleThumbnailSelect(exIndex, vidIndex, e.target.files[0])} />
                  {exampleThumbnailPreviews[exIndex] && exampleThumbnailPreviews[exIndex][vidIndex] && (
                    <img src={exampleThumbnailPreviews[exIndex][vidIndex]} alt="thumb" className="w-32 mt-2 rounded" />
                  )}
                </div>
              ))}
              <button onClick={() => addExampleVideo(exIndex)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs mt-1">إضافة فيديو مثال</button>
            </div>
          </div>
        ))}
      </div>

      {/* YouTube Links */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-2xl font-semibold flex justify-between items-center border-b pb-1 mb-4">
          روابط يوتيوب
          <button onClick={addYouTubeLink} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">إضافة رابط</button>
        </h2>

        {algorithm.youTubeLinks.map((link, index) => (
          <div key={index} className="border p-4 rounded relative bg-gray-50">
            <button onClick={() => removeYouTubeLink(index)} className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">حذف</button>
            <label className="font-semibold">العنوان</label>
            <input type="text" value={link.title} onChange={(e) => handleYouTubeChange(index, "title", e.target.value)} className="w-full border p-2 rounded" />
            <label className="font-semibold">الرابط</label>
            <input type="text" value={link.url} onChange={(e) => handleYouTubeChange(index, "url", e.target.value)} className="w-full border p-2 rounded" />
            <label className="font-semibold">الوصف</label>
            <textarea value={link.description} onChange={(e) => handleYouTubeChange(index, "description", e.target.value)} className="w-full border p-2 rounded" />
          </div>
        ))}
      </div>

      {/* Videos */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-2xl font-semibold flex justify-between items-center border-b pb-1 mb-4">
          فيديوهات
          <button onClick={addVideo} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">إضافة فيديو</button>
        </h2>

        {algorithm.videos.map((v, index) => (
          <div key={index} className="border p-4 rounded relative bg-gray-50">
            <button onClick={() => removeVideo(index)} className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">حذف</button>

            <label className="font-semibold">عنوان الفيديو</label>
            <input type="text" value={v.title} onChange={(e) => handleVideoChange(index, "title", e.target.value)} className="w-full border p-2 rounded" />

            <label className="font-semibold">وصف الفيديو</label>
            <textarea value={v.description} onChange={(e) => handleVideoChange(index, "description", e.target.value)} className="w-full border p-2 rounded" />

            <label className="font-semibold">رفع الفيديو</label>
            <input type="file" accept="video/*" onChange={(e) => handleVideoFileSelect(index, e.target.files[0])} />
            {videoPreviews[index] && <video src={videoPreviews[index]} controls className="w-full mt-2 rounded" />}

            <label className="font-semibold mt-2">رفع الصورة المصغرة</label>
            <input type="file" accept="image/*" onChange={(e) => handleThumbnailSelect(index, e.target.files[0])} />
            {thumbnailPreviews[index] && <img src={thumbnailPreviews[index]} alt="thumb" className="w-32 mt-2 rounded" />}
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={loading} className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded mt-4 text-lg font-semibold">
        {loading ? "جاري المعالجة..." : "إضافة الخوارزمية"}
      </button>
    </div>
  );
}
