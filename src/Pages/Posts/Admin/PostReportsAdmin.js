import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPostReports, getPostById, deletePost } from "../../../Service/postService";

const PostReportsAdmin = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingPost, setLoadingPost] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getAllPostReports();
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      alert("فشل جلب الإبلاغات");
    } finally {
      setLoading(false);
    }
  };

  const handleReportClick = async (report) => {
    setSelectedReport(report);
    setLoadingPost(true);
    try {
      const post = await getPostById(report.postId);
      setSelectedPost(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      alert("فشل جلب معلومات المنشور");
    } finally {
      setLoadingPost(false);
    }
  };

  const handlePostClick = async (postId) => {
    setLoadingPost(true);
    try {
      const post = await getPostById(postId);
      setSelectedPost(post);
      // Find the report for this post
      const report = reports.find(r => r.postId === postId);
      setSelectedReport(report || null);
    } catch (error) {
      console.error("Error fetching post:", error);
      alert("فشل جلب معلومات المنشور");
    } finally {
      setLoadingPost(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنشور؟")) {
      return;
    }

    setDeletingPostId(postId);
    try {
      await deletePost(Number(postId));
      alert("تم حذف المنشور بنجاح");
      // Remove from reports list
      setReports(reports.filter(r => r.postId !== postId));
      setSelectedPost(null);
      setSelectedReport(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("فشل حذف المنشور");
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleEditPost = (postId) => {
    navigate(`/react-app/admin/AdminEditPost/${postId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    try {
      return new Date(dateString).toLocaleString("ar-EG");
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gray-900 p-4 md:p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">جاري تحميل الإبلاغات...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:bg-gray-900 p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">الإبلاغات عن المنشورات</h1>
              <p className="text-gray-700 dark:text-gray-400">إدارة الإبلاغات عن المنشورات ومراجعتها</p>
            </div>
            <button
              onClick={() => navigate("/react-app/admin/posts")}
              className="px-4 py-2 bg-black dark:bg-gray-700 text-white dark:text-gray-200 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition font-medium"
            >
              العودة للمنشورات
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports List */}
          <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-transparent dark:bg-gray-800">
              <h2 className="text-xl font-bold text-black dark:text-white">قائمة الإبلاغات ({reports.length})</h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto bg-transparent dark:bg-gray-800">
              {reports.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  لا توجد إبلاغات
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reports.map((report, index) => (
                    <div
                      key={index}
                      onClick={() => handleReportClick(report)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
                        selectedReport?.postId === report.postId ? "bg-indigo-50 dark:bg-indigo-900/30 border-r-4 border-indigo-500 dark:border-indigo-400" : "bg-transparent dark:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-600">
                          {report.url ? (
                            <img
                              src={report.url}
                              alt={report.userName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold">
                              {report.userName?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-black dark:text-white truncate">
                              {report.userName || "مستخدم"}
                            </h3>
                            <span className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                              إبلاغ
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-1">
                            {report.titlePost || "بدون عنوان"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {report.postId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Post Details */}
          <div className="bg-transparent dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-transparent dark:bg-gray-800">
              <h2 className="text-xl font-bold text-black dark:text-white">تفاصيل المنشور</h2>
            </div>
            <div className="p-6 bg-transparent dark:bg-gray-800">
              {loadingPost ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">جاري تحميل المنشور...</p>
                  </div>
                </div>
              ) : selectedPost ? (
                <div className="space-y-6">
                  {/* Post Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-600">
                      {selectedPost.imageURL ? (
                        <img
                          src={selectedPost.imageURL}
                          alt={selectedPost.userName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-lg">
                          {selectedPost.userName?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-black dark:text-white mb-1">
                        {selectedPost.userName || "مستخدم"}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(selectedPost.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Post Title */}
                  {selectedPost.title && (
                    <div>
                      <h4 className="text-xl font-bold text-black dark:text-white mb-2">
                        {selectedPost.title}
                      </h4>
                    </div>
                  )}

                  {/* Post Content */}
                  {selectedPost.content && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {selectedPost.content}
                      </p>
                    </div>
                  )}

                  {/* Post Images */}
                  {selectedPost.images && selectedPost.images.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-black dark:text-white mb-2">الصور:</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPost.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`صورة ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <span className="flex items-center gap-1">
                      <span>👍</span>
                      <span>{selectedPost.numberLike || 0}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{selectedPost.comments?.length || 0}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>👁️</span>
                      <span>{selectedPost.views || 0}</span>
                    </span>
                  </div>

                  {/* Report Info */}
                  {selectedReport && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h5 className="font-semibold text-red-800 dark:text-red-300 mb-2">معلومات الإبلاغ:</h5>
                      <p className="text-sm text-red-700 dark:text-red-400 mb-1">
                        تم الإبلاغ بواسطة: <strong className="font-bold">{selectedReport.userName}</strong>
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        البريد الإلكتروني: <span className="font-medium">{selectedReport.email}</span>
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleEditPost(selectedPost.id)}
                      className="flex-1 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition font-medium shadow-sm"
                    >
                      تعديل المنشور
                    </button>
                    <button
                      onClick={() => handleDeletePost(selectedPost.id)}
                      disabled={deletingPostId === selectedPost.id}
                      className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition font-medium disabled:opacity-50 shadow-sm"
                    >
                      {deletingPostId === selectedPost.id ? "جاري الحذف..." : "حذف المنشور"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>اختر إبلاغ أو منشور لعرض التفاصيل</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostReportsAdmin;

