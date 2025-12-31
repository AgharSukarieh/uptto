import React, { useEffect, useState, useMemo } from "react";
import api from "../../../Service/api";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import {
  LineChart,
  Line as RechartsLine,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid as RechartsGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// تسجيل Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// accessibility للمودال
Modal.setAppElement("#root");

// تخصيص الألوان
const CHART_COLORS = {
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  pink: '#ec4899',
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#f59e0b',
  green: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  gray: '#6b7280'
};

const AllPostAdmin = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    numberLike: 0,
    NumberComment: 0,
    totalDownloads: 0,
    avgLikesPerPost: 0,
    avgCommentsPerPost: 0,
    postsPerUser: {},
    downloadsPerUser: {},
    likesPerUser: {},
    commentsPerUser: {},
    postsByCategory: {},
    engagementRate: 0,
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/posts");
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // إعادة حساب الإحصاءات كلما تغيّر posts
  useEffect(() => {
    const data = posts || [];
    const userSet = new Set();
    const postsPerUser = {};
    const downloadsPerUser = {};
    const likesPerUser = {};
    const commentsPerUser = {};
    const postsByCategory = {};
    let numberLike = 0;
    let NumberComment = 0;
    let totalDownloads = 0;

    data.forEach((post) => {
      if (!post) return;
      
      // إحصاءات المستخدمين
      userSet.add(post.userId || post.userName || "unknown");
      const name = post.userName || "مستخدم مجهول";
      
      postsPerUser[name] = (postsPerUser[name] || 0) + 1;
      downloadsPerUser[name] = (downloadsPerUser[name] || 0) + (post.downloadCount || 0);
      likesPerUser[name] = (likesPerUser[name] || 0) + (post.likesCount || 0);
      commentsPerUser[name] = (commentsPerUser[name] || 0) + (post.commentsCount || 0);
      
      // إحصاءات عامة
      numberLike += post.numberLike || 0;
      NumberComment += post.numberComment || 0;
      totalDownloads += post.downloadCount || 0;
      
      // إحصاءات التصنيفات
      if (post.postTags && post.postTags.length > 0) {
        post.postTags.forEach(tag => {
          const tagName = tag.tagName || "بدون تصنيف";
          postsByCategory[tagName] = (postsByCategory[tagName] || 0) + 1;
        });
      } else {
        const noCategory = "بدون تصنيف";
        postsByCategory[noCategory] = (postsByCategory[noCategory] || 0) + 1;
      }
    });

    // حساب معدل التفاعل (نسبة المشاركة)
    const totalInteractions = numberLike + NumberComment + totalDownloads;
    const engagementRate = data.length > 0 ? (totalInteractions / data.length).toFixed(1) : 0;

    setStats({
      totalPosts: data.length,
      totalUsers: userSet.size,
      numberLike,
      NumberComment,
      totalDownloads,
      avgLikesPerPost: data.length > 0 ? (numberLike / data.length).toFixed(1) : 0,
      avgCommentsPerPost: data.length > 0 ? (NumberComment / data.length).toFixed(1) : 0,
      postsPerUser,
      downloadsPerUser,
      likesPerUser,
      commentsPerUser,
      postsByCategory,
      engagementRate,
    });
  }, [posts]);

  // تصفية البوستات
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    
    // تصفية حسب البحث
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(post => 
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // تصفية حسب النوع
    if (activeFilter === "mostLiked") {
      filtered.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else if (activeFilter === "mostCommented") {
      filtered.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
    } else if (activeFilter === "recent") {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    
    return filtered;
  }, [posts, activeFilter, searchTerm]);

  // بيانات الرسم البياني للبوستات لكل مستخدم
  const postsPerUserChartData = useMemo(
    () => ({
      labels: Object.keys(stats.postsPerUser).slice(0, 10), // أول 10 مستخدمين فقط للوضوح
      datasets: [
        {
          label: "عدد البوستات",
          data: Object.values(stats.postsPerUser).slice(0, 10),
          backgroundColor: CHART_COLORS.indigo,
          borderRadius: 6,
        },
        {
          label: "عدد اللايكات",
          data: Object.values(stats.likesPerUser).slice(0, 10),
          backgroundColor: CHART_COLORS.pink,
          borderRadius: 6,
        }
      ],
    }),
    [stats.postsPerUser, stats.likesPerUser]
  );

  // بيانات الرسم البياني الدائري للتصنيفات
  const categoriesChartData = useMemo(() => {
    const labels = Object.keys(stats.postsByCategory);
    const data = Object.values(stats.postsByCategory);
    const backgroundColors = [
      CHART_COLORS.blue,
      CHART_COLORS.indigo,
      CHART_COLORS.purple,
      CHART_COLORS.pink,
      CHART_COLORS.red,
      CHART_COLORS.orange,
      CHART_COLORS.yellow,
      CHART_COLORS.green,
      CHART_COLORS.teal,
      CHART_COLORS.cyan,
    ];
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderWidth: 1,
          borderColor: '#fff',
        },
      ],
    };
  }, [stats.postsByCategory]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "top",
        labels: {
          font: {
            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            size: 12
          }
        }
      },
      title: { 
        display: true,
        text: 'توزيع النشاط حسب المستخدم',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: { 
        mode: "index", 
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12
      },
    },
    scales: {
      x: { 
        ticks: { 
          autoSkip: false,
          font: {
            size: 11
          }
        } 
      },
      y: { 
        beginAtZero: true, 
        ticks: {
          precision: 0
        }
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "right",
        labels: {
          font: {
            size: 11
          },
          padding: 15
        }
      },
      title: { 
        display: true,
        text: 'توزيع البوستات حسب التصنيف',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: { 
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12
      },
    },
  };

  const postsOverTimeData = useMemo(() => {
    const grouped = {};
    posts.forEach((post) => {
      const date = post?.createdAt ? new Date(post.createdAt) : new Date();
      const dateStr = date.toISOString().split('T')[0];
      grouped[dateStr] = (grouped[dateStr] || 0) + 1;
    });

    const sortedDates = Object.keys(grouped).sort();
    
    // إذا كانت البيانات كثيرة، نعرض فقط آخر 30 يوم
    const recentDates = sortedDates.slice(-30);
    
    return recentDates.map((date) => ({
      date,
      totalPosts: grouped[date],
      cumulative: recentDates.reduce((acc, d, idx) => {
        if (recentDates.indexOf(date) >= idx) {
          return acc + grouped[d];
        }
        return acc;
      }, 0)
    }));
  }, [posts]);

  const topUsers = useMemo(() => {
    const users = Object.keys(stats.postsPerUser).map(userName => ({
      name: userName,
      posts: stats.postsPerUser[userName] || 0,
      likes: stats.likesPerUser[userName] || 0,
      comments: stats.commentsPerUser[userName] || 0,
      downloads: stats.downloadsPerUser[userName] || 0,
    }));
    
    return users
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5);
  }, [stats]);

  const topPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      .slice(0, 5);
  }, [posts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleView = (postId) => {
    navigate(`/react-app/admin/AdminPostDetails/${postId}`);
  };

  const handleEdit = (postId) => {
    navigate(`/react-app/admin/AdminEditPost/${postId}`);
  };

  const confirmDelete = (postId) => {
    setPostToDelete(postId);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    try {
      
      await api.delete(`/api/posts/${postToDelete}`);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
      setShowConfirm(false);
      setPostToDelete(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* شريط العنوان */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة تحكم البوستات</h1>
              <p className="text-gray-600">إدارة كافة البوستات ومتابعة الإحصائيات والنشاطات</p>
            </div>
            <button
              onClick={() => navigate("/react-app/admin/post-reports")}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center gap-2 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              الإبلاغات
            </button>
          </div>
        </div>

        {/* بطاقات الإحصائيات الرئيسية */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي البوستات</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalPosts}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">متوسط {stats.avgLikesPerPost} لايك لكل بوست</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">ينشئون المحتوى في النظام</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي التفاعلات</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats.numberLike + stats.NumberComment + stats.totalDownloads}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
              </div>
            </div>
            <div className="flex justify-between text-xs mt-4">
              <span className="text-blue-600">{stats.numberLike} لايكات</span>
              <span className="text-green-600">{stats.NumberComment} تعليقات</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">معدل التفاعل</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.engagementRate}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">تفاعل لكل بوست</p>
          </div>
        </div>

        {/* الرسوم البيانية */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* رسم بياني شريطي للنشاط */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">النشاط حسب المستخدم</h3>
              <p className="text-sm text-gray-600">توزيع البوستات واللايكات للمستخدمين النشطين</p>
            </div>
            <div className="h-80">
              <Bar data={postsPerUserChartData} options={barOptions} />
            </div>
          </div>

          {/* رسم بياني دائري للتصنيفات */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">توزيع البوستات حسب التصنيف</h3>
              <p className="text-sm text-gray-600">نسبة المحتوى في كل تصنيف</p>
            </div>
            <div className="h-80">
              <Pie data={categoriesChartData} options={pieOptions} />
            </div>
          </div>
        </div>

        {/* رسم بياني خطي للنمو */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">نمو البوستات مع الوقت</h3>
            <p className="text-sm text-gray-600">تطور عدد البوستات خلال الفترة الماضية</p>
          </div>
          <div className="h-80">
            {postsOverTimeData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">لا توجد بيانات كافية للعرض</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={postsOverTimeData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <RechartsGrid stroke="#f0f0f0" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="totalPosts"
                    stroke={CHART_COLORS.indigo}
                    fill={CHART_COLORS.indigo}
                    fillOpacity={0.2}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="البوستات الجديدة"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke={CHART_COLORS.green}
                    fill={CHART_COLORS.green}
                    fillOpacity={0.1}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="المجموع التراكمي"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">اكثر المستخدمين تفاعلًا</h3>
            <div className="space-y-4">
              {topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-800' : index === 1 ? 'bg-gray-100 text-gray-800' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.posts} بوست</p>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>

          {/* أفضل البوستات تفاعلاً */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">أكثر البوستات تفاعلاً</h3>
            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <div key={post.id} className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">{post.title || "بدون عنوان"}</h4>
                      <p className="text-sm text-gray-600">{post.userName || "مستخدم مجهول"}</p>
                    </div>
                    <button
                      onClick={() => handleView(post.id)}
                      className="ml-2 px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      عرض
                    </button>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm">
                    <div className="flex items-center text-red-500">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {post.numberLike || 0}
                    </div>
                    <div className="flex items-center text-green-500">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {post.numberComment || 0}
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">إدارة البوستات</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن بوست..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              
              {/* أزرار التصفية */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 text-sm font-medium ${activeFilter === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setActiveFilter("mostLiked")}
                  className={`px-4 py-2 text-sm font-medium ${activeFilter === "mostLiked" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  الأكثر تفاعلاً
                </button>
                <button
                  onClick={() => setActiveFilter("recent")}
                  className={`px-4 py-2 text-sm font-medium ${activeFilter === "recent" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  الأحدث
                </button>
              </div>
            </div>
          </div>

          {/* شبكة البوستات */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">لا توجد بوستات</h3>
              <p className="text-gray-600">لم يتم العثور على بوستات تطابق بحثك</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* صورة المستخدم وتفاصيله */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center">
                      <button
                        onClick={() => navigate(`/react-app/admin/view-user/${post.userId}`)}
                        className="shrink-0"
                        aria-label={`عرض ملف ${post.userName}`}
                        title={`عرض ملف ${post.userName}`}
                      >
                        <img
                          src={post.imageURL || "/fallback-avatar.png"}
                          alt={post.userName || "User avatar"}
                          loading="lazy"
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                        />
                      </button>
                      <div className="ml-3 flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {post.title || "بدون عنوان"}
                        </h3>
                        <button
                          onClick={() => navigate(`/react-app/admin/view-user/${post.userId}`)}
                          className="text-sm text-blue-600 hover:underline truncate block"
                        >
                          {post.userName || "مستخدم مجهول"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* محتوى البوست */}
                  <div className="p-4">
                    <p className="text-gray-600 text-sm line-clamp-3 break-words mb-4">
                      {post.content ? post.content.replace(/<[^>]+>/g, "") : "لا يوجد محتوى"}
                    </p>

                    {/* التصنيفات */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(post.postTags || []).slice(0, 3).map((tag) => (
                        <span
                          key={tag.id || tag.tagName}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {tag.tagName}
                        </span>
                      ))}
                      {(post.postTags || []).length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{(post.postTags || []).length - 3}
                        </span>
                      )}
                    </div>

                    {/* إحصائيات البوست */}
                    <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                          </svg>
                          <span>{post.numberLike || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span>{post.numberComment || 0}</span>
                        </div>
                        
                      </div>
                      <span className="text-xs">
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString('ar-EG')
                          : "تاريخ غير معروف"}
                      </span>
                    </div>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(post.id)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          عرض
                        </button>
                      </div>
                      <button
                        onClick={() => confirmDelete(post.id)}
                        className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center"
                        aria-label={`حذف البوست ${post.title}`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* رسالة عند عدم وجود نتائج */}
          {filteredPosts.length === 0 && posts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">لم يتم العثور على بوستات تطابق بحثك</p>
            </div>
          )}
        </div>
      </div>

      {/* مودال تأكيد الحذف */}
      <Modal
        isOpen={showConfirm}
        onRequestClose={() => setShowConfirm(false)}
        contentLabel="تأكيد حذف البوست"
        className="bg-white p-6 rounded-2xl shadow-2xl max-w-md mx-auto mt-24 outline-none border border-gray-200"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center backdrop-blur-sm transition-opacity"
        shouldCloseOnOverlayClick={true}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">تأكيد الحذف</h2>
          <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذا البوست؟ هذا الإجراء لا يمكن التراجع عنه.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              نعم، احذف
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AllPostAdmin;