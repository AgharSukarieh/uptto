import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { getAllUsers, deleteUser } from "../../../Service/userService";

const placeholderImg =
  "data:image/svg+xml;base64," +
  btoa(
    `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='1.5'><rect x='1.5' y='1.5' width='21' height='21' rx='3'/><circle cx='12' cy='8' r='3.5'/><path d='M3 20c2.5-3 7-4 9-4s6.5 1 9 4'/></svg>`
  );

// SVG Icons as components
const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 1a6 6 0 01-12 0m12 0a6 6 0 00-12 0"
    />
  </svg>
);

const UserPlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
);

const ChartLineIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const FileExcelIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const FilePdfIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
);

const FileWordIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const SyncIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

const UserCheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const UserTimesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
    />
  </svg>
);

const ChartBarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

const CrownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
);

const IdCardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
    />
  </svg>
);

const EnvelopeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const ArrowUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 10l7-7m0 0l7 7m-7-7v18"
    />
  </svg>
);

const ArrowDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 14l-7 7m0 0l-7-7m7 7V3"
    />
  </svg>
);

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "registerAt",
    direction: "desc",
  });

  const [imageMap, setImageMap] = useState({});
  const [navHeight, setNavHeight] = useState(0);
  const wrapperRef = useRef(null);

  // Statistics states
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newToday: 0,
    newThisWeek: 0,
    growthRate: 0,
    avgAge: 0,
    premiumUsers: 0,
    verifiedUsers: 0,
    activeToday: 0,
    activeThisWeek: 0,
  });

  // Responsive breakpoint
  useEffect(() => {
    const el = wrapperRef.current;
    const getWidth = () => (el ? el.clientWidth : window.innerWidth);
    const check = () => {
      // Responsive check
      getWidth();
    };

    check();
    let ro;
    if (el && window.ResizeObserver) {
      ro = new ResizeObserver(check);
      ro.observe(el);
    } else {
      window.addEventListener("resize", check);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", check);
    };
  }, []);

  // NAVBAR detection
  useEffect(() => {
    document.documentElement.style.setProperty("--app-nav-height", `0px`);
    let ro = null;
    let mo = null;
    let mounted = true;

    const selectors = [
      ".navbar",
      "#navbar",
      "nav",
      ".main-nav",
      ".top-nav",
      ".app-navbar",
    ];
    const findNavEl = () =>
      selectors.map((s) => document.querySelector(s)).find(Boolean);

    const isHiddenOrOutOfFlow = (el) => {
      if (!el) return true;
      try {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          el.getAttribute("aria-hidden") === "true"
        ) {
          return true;
        }
        if (rect.height <= 0 || rect.width <= 0) return true;
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) return true;
        return false;
      } catch (e) {
        return true;
      }
    };

    const isLikelyOverlayOrDrawer = (el) => {
      if (!el) return true;
      try {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        if (style.position === "fixed" || style.position === "absolute") {
          const largeThreshold = Math.max(window.innerHeight * 0.6, 200);
          if (rect.height > largeThreshold) return true;
          if (rect.top > 50) return true;
          return false;
        }
        return false;
      } catch (e) {
        return true;
      }
    };

    const measureAndSet = (el) => {
      if (!mounted || !el) return;
      requestAnimationFrame(() => {
        try {
          if (!mounted) return;
          const style = window.getComputedStyle(el);
          if (isHiddenOrOutOfFlow(el) || isLikelyOverlayOrDrawer(el)) {
            document.documentElement.style.setProperty(
              "--app-nav-height",
              `0px`
            );
            setNavHeight(0);
            return;
          }
          const rect = el.getBoundingClientRect();
          const marginBottom = parseFloat(style.marginBottom || "0") || 0;
          const measured = Math.round(Math.max(0, rect.height + marginBottom));
          const capped = Math.min(Math.max(measured, 0), 160);
          setNavHeight((prev) => {
            if (prev !== capped) {
              document.documentElement.style.setProperty(
                "--app-nav-height",
                `${capped}px`
              );
              return capped;
            }
            return prev;
          });
        } catch (e) {
          document.documentElement.style.setProperty("--app-nav-height", `0px`);
          setNavHeight(0);
        }
      });
    };

    const observeNav = (navEl) => {
      measureAndSet(navEl);
      if (window.ResizeObserver) {
        ro = new ResizeObserver(() => measureAndSet(navEl));
        ro.observe(navEl);
      }
    };

    const init = () => {
      const navEl = findNavEl();
      if (
        navEl &&
        !isHiddenOrOutOfFlow(navEl) &&
        !isLikelyOverlayOrDrawer(navEl)
      ) {
        observeNav(navEl);
        return;
      }
      mo = new MutationObserver(() => {
        const found = findNavEl();
        if (
          found &&
          !isHiddenOrOutOfFlow(found) &&
          !isLikelyOverlayOrDrawer(found)
        ) {
          observeNav(found);
          if (mo) {
            mo.disconnect();
            mo = null;
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });

      window.addEventListener(
        "load",
        () => {
          const afterLoad = findNavEl();
          if (afterLoad) measureAndSet(afterLoad);
        },
        { once: true }
      );
    };

    init();

    return () => {
      mounted = false;
      if (ro) ro.disconnect();
      if (mo) mo.disconnect();
    };
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
      calculateStatistics(data);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء جلب المستخدمين");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Calculate statistics
  const calculateStatistics = (userData) => {
    if (!userData || userData.length === 0) {
      setStats({
        total: 0,
        active: 0,
        inactive: 0,
        newToday: 0,
        newThisWeek: 0,
        growthRate: 0,
        avgAge: 0,
        premiumUsers: 0,
        verifiedUsers: 0,
        activeToday: 0,
        activeThisWeek: 0,
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    // عد المستخدمين الجدد اليوم
    const newToday = userData.filter((u) => {
      if (!u.registerAt) return false;
      const regDate = new Date(u.registerAt);
      regDate.setHours(0, 0, 0, 0);
      return regDate.getTime() === today.getTime();
    }).length;

    // عد المستخدمين الجدد هذا الأسبوع
    const newThisWeek = userData.filter((u) => {
      if (!u.registerAt) return false;
      const regDate = new Date(u.registerAt);
      return regDate >= oneWeekAgo && regDate <= today;
    }).length;

    // عد المستخدمين النشطين (حسب LastActive)
    const activeToday = userData.filter((u) => {
      if (!u.lastActive) return false;
      try {
        const lastActiveDate = new Date(u.lastActive);
        lastActiveDate.setHours(0, 0, 0, 0);
        return lastActiveDate.getTime() === today.getTime();
      } catch (e) {
        return false;
      }
    }).length;

    const activeThisWeek = userData.filter((u) => {
      if (!u.lastActive) return false;
      try {
        const lastActiveDate = new Date(u.lastActive);
        return lastActiveDate >= oneWeekAgo;
      } catch (e) {
        return false;
      }
    }).length;

    // عد المستخدمين النشطين
    const active = userData.filter((u) => u.isActive !== false).length;
    const inactive = userData.length - active;

    // عد المستخدمين المميزين
    const premiumUsers = userData.filter((u) => u.isPremium === true).length;

    // عد المستخدمين المتحققين
    const verifiedUsers = userData.filter(
      (u) => u.isVerified === true || u.emailConfirmed === true
    ).length;

    // حساب معدل النمو الشهري
    const lastMonthUsers = userData.filter((u) => {
      if (!u.registerAt) return false;
      const regDate = new Date(u.registerAt);
      return regDate >= oneMonthAgo && regDate < oneWeekAgo;
    }).length;
    const growthRate =
      userData.length > 0 && newThisWeek > 0
        ? ((newThisWeek / Math.max(lastMonthUsers, 1)) * 100).toFixed(1)
        : 0;

    // البحث عن الدولة الأكثر نشاطاً
    const countryMap = {};
    userData.forEach((u) => {
      if (u.country || u.countryId) {
        const country = u.country || u.countryId;
        countryMap[country] = (countryMap[country] || 0) + 1;
      }
    });

    let avgAge = 0;
    const usersWithAge = userData.filter((u) => u.age && u.age > 0);
    if (usersWithAge.length > 0) {
      avgAge = Math.round(
        usersWithAge.reduce((sum, u) => sum + u.age, 0) / usersWithAge.length
      );
    } else {
      avgAge = 25; // قيمة افتراضية
    }

    setStats({
      total: userData.length,
      active,
      inactive,
      newToday,
      newThisWeek,
      growthRate: parseFloat(growthRate),
      avgAge,
      premiumUsers,
      verifiedUsers,
      activeToday,
      activeThisWeek,
    });
  };

  // Filter and search users
  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.universityName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          user.country?.nameCountry
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== "all") {
      // في البيانات الحقيقية يمكن تصفيتهم حسب وجود universityId
      if (selectedRole === "university") {
        result = result.filter((user) => user.universityId);
      } else if (selectedRole === "general") {
        result = result.filter((user) => !user.universityId);
      }
    }

    if (activeTab === "active") {
      // جميع المستخدمين نشطين في البيانات الحقيقية
    } else if (activeTab === "inactive") {
      // لا يوجد مستخدمين غير نشطين
      result = [];
    } else if (activeTab === "premium") {
      // لا يوجد مستخدمين مميزين حتى الآن
      result = [];
    } else if (activeTab === "new") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter((user) => {
        try {
          return new Date(user.registerAt) >= weekAgo;
        } catch (e) {
          return false;
        }
      });
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (
          sortConfig.key === "registerAt" ||
          sortConfig.key === "lastActive"
        ) {
          try {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
          } catch (e) {
            return 0;
          }
        }

        if (aVal < bVal) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(result);
  }, [users, searchTerm, selectedRole, activeTab, sortConfig]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Preload images
  useEffect(() => {
    if (!users || users.length === 0) {
      setImageMap({});
      return;
    }

    let cancelled = false;
    const toDataURL = async (url) => {
      try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) throw new Error("fetch failed");
        const blob = await res.blob();
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        throw err;
      }
    };

    const loadAll = async () => {
      const map = {};
      for (const u of users) {
        if (u.imageUrl && u.imageUrl.trim()) {
          try {
            const dataUrl = await toDataURL(u.imageUrl);
            if (cancelled) return;
            map[u.id] = dataUrl;
          } catch (err) {
            console.warn("Failed to load image:", u.imageUrl);
            map[u.id] = placeholderImg;
          }
        } else {
          map[u.id] = placeholderImg;
        }
      }
      if (!cancelled) setImageMap(map);
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [users]);

  const handleDelete = async (user) => {
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

    if (result.isConfirmed) {
      try {
        await deleteUser(user.id);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        Swal.fire({
          title: "تم الحذف!",
          text: "تم حذف المستخدم بنجاح",
          icon: "success",
          confirmButtonColor: "#7c3aed",
        });
      } catch (err) {
        Swal.fire({
          title: "فشل الحذف",
          text: err.message || "حدث خطأ أثناء الحذف",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  // Chart data functions
  const getRegistrationTrendData = () => {
    return users
      .reduce((acc, user) => {
        const date = new Date(user.registerAt);
        if (isNaN(date)) return acc;
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        const found = acc.find((d) => d.date === key);
        if (found) found.count += 1;
        else acc.push({ date: key, count: 1 });
        return acc;
      }, [])
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-12);
  };

  const getUserActivityData = () => {
    // توزيع المستخدمين حسب الشهر
    const monthMap = {};
    const monthNames = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];

    users.forEach((u) => {
      if (u.registerAt) {
        try {
          const date = new Date(u.registerAt);
          const monthName = monthNames[date.getMonth()];
          monthMap[monthName] = (monthMap[monthName] || 0) + 1;
        } catch (e) {
          // تخطي المستخدمين ذوي التواريخ غير الصالحة
        }
      }
    });

    // تحويل إلى صيغة رسم البياني
    return Object.entries(monthMap).map(([month, count]) => ({
      name: month,
      value: count,
      color: [
        "#3b82f6",
        "#ef4444",
        "#10b981",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
        "#14b8a6",
        "#f97316",
        "#6366f1",
        "#84cc16",
        "#06b6d4",
        "#d946ef",
      ][monthNames.indexOf(month)],
    }));
  };

  const getCountryDistributionData = () => {
    const countryMap = {};
    users.forEach((u) => {
      if (u.country) {
        const country = u.country.nameCountry;
        countryMap[country] = (countryMap[country] || 0) + 1;
      }
    });

    // ترتيب الدول حسب عدد المستخدمين وأخذ أكثرها
    const sorted = Object.entries(countryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sorted.length === 0) {
      return [{ name: "بلا دولة محددة", users: stats.total }];
    }

    return sorted.map(([country, count]) => ({
      name: country,
      users: count,
    }));
  };

  // إحصائيات إضافية من البيانات
  const getAdditionalStats = () => {
    // مستخدمين من جامعات
    const universityUsers = users.filter((u) => u.universityId).length;

    // مستخدمين عاميين
    const generalUsers = users.filter((u) => !u.universityId).length;

    // الدولة الأكثر نشاطاً
    const countryMap = {};
    users.forEach((u) => {
      if (u.country?.nameCountry) {
        countryMap[u.country.nameCountry] =
          (countryMap[u.country.nameCountry] || 0) + 1;
      }
    });
    const topCountry =
      Object.entries(countryMap).length > 0
        ? Object.entries(countryMap).sort((a, b) => b[1] - a[1])[0]
        : null;

    // الشهر الأكثر نشاطاً
    const monthMap = {};
    const monthNames = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    users.forEach((u) => {
      if (u.registerAt) {
        try {
          const date = new Date(u.registerAt);
          const monthName = monthNames[date.getMonth()];
          monthMap[monthName] = (monthMap[monthName] || 0) + 1;
        } catch (e) {}
      }
    });
    const topMonth =
      Object.entries(monthMap).length > 0
        ? Object.entries(monthMap).sort((a, b) => b[1] - a[1])[0]
        : null;

    return {
      universityUsers,
      generalUsers,
      topCountry: topCountry ? topCountry[0] : "بدون بيانات",
      topCountryCount: topCountry ? topCountry[1] : 0,
      topMonth: topMonth ? topMonth[0] : "بدون بيانات",
      topMonthCount: topMonth ? topMonth[1] : 0,
    };
  };

  // رسم بياني لنشاط المستخدمين (آخر 7 أيام)
  const getUserActivityChartData = () => {
    const last7Days = [];
    const today = new Date();

    // إنشاء آخر 7 أيام
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayName = new Intl.DateTimeFormat("ar-EG", {
        weekday: "short",
      }).format(date);

      last7Days.push({
        day: dayName,
        date: date,
        activeUsers: 0,
        newUsers: 0,
      });
    }

    // حساب المستخدمين النشطين والجدد لكل يوم
    users.forEach((u) => {
      // نشاط المستخدم
      if (u.lastActive) {
        try {
          const lastActiveDate = new Date(u.lastActive);
          lastActiveDate.setHours(0, 0, 0, 0);

          const dayIndex = last7Days.findIndex(
            (d) => d.date.getTime() === lastActiveDate.getTime()
          );

          if (dayIndex !== -1) {
            last7Days[dayIndex].activeUsers += 1;
          }
        } catch (e) {}
      }

      // المستخدمين الجدد
      if (u.registerAt) {
        try {
          const registerDate = new Date(u.registerAt);
          registerDate.setHours(0, 0, 0, 0);

          const dayIndex = last7Days.findIndex(
            (d) => d.date.getTime() === registerDate.getTime()
          );

          if (dayIndex !== -1) {
            last7Days[dayIndex].newUsers += 1;
          }
        } catch (e) {}
      }
    });

    return last7Days.map((d) => ({
      day: d.day,
      نشطين: d.activeUsers,
      جدد: d.newUsers,
    }));
  };

  const formatShortDate = (d) => {
    if (!d || d === "0001-01-01T00:00:00") return "-";
    const date = new Date(d);
    if (isNaN(date)) return "-";
    return new Intl.DateTimeFormat("ar-EG", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // StatCard component
  const StatCard = ({ title, value, icon, change, color, iconColor }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <div className={`text-2xl ${iconColor}`}>{icon}</div>
        </div>
        <span
          className={`text-sm font-medium px-3 py-1 rounded-full ${
            change >= 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {change >= 0 ? (
            <ArrowUpIcon className="inline mr-1" />
          ) : (
            <ArrowDownIcon className="inline mr-1" />
          )}
          {Math.abs(change)}%
        </span>
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
      <p className="text-gray-500 font-medium">{title}</p>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center text-sm text-gray-400">
          <ChartLineIcon className="ml-2" />
          <span>مقارنة بالشهر الماضي</span>
        </div>
      </div>
    </div>
  );

  // DashboardCard component
  const DashboardCard = ({
    title,
    children,
    className = "",
    fullWidth = false,
  }) => (
    <div
      className={`bg-white rounded-2xl shadow-lg p-6 ${
        fullWidth ? "col-span-1 lg:col-span-2" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {title}
        </h3>
        <button className="text-purple-600 hover:text-purple-800 transition-colors">
          <SyncIcon />
        </button>
      </div>
      {children}
    </div>
  );

  // Tab configurations
  const tabs = [
    { id: "all", label: "الكل", icon: <UsersIcon />, count: stats.total },
    {
      id: "active",
      label: "نشط",
      icon: <UserCheckIcon />,
      count: stats.active,
    },
    {
      id: "new",
      label: "جدد",
      icon: <UserPlusIcon />,
      count: stats.newThisWeek,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-purple-700">
            جاري تحميل البيانات...
          </p>
          <p className="text-gray-500 mt-2">
            يتم الآن جلب أحدث المعلومات والإحصائيات
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">حدث خطأ</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUsers}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="min-h-screen"
      style={{
        minHeight: navHeight ? `calc(100vh - ${navHeight}px)` : "100vh",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl">
                  <div className="text-2xl text-white">
                    <UsersIcon />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                    لوحة تحكم المستخدمين
                  </h1>
                  <p className="text-gray-600 mt-1">
                    إدارة متكاملة وتحليل شامل لجميع المستخدمين
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                  <UserCheckIcon />
                  <span className="font-medium text-gray-700">
                    إجمالي المستخدمين:
                  </span>
                  <span className="font-bold text-purple-600">
                    {stats.total}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                  <UserPlusIcon />
                  <span className="font-medium text-gray-700">جدد اليوم:</span>
                  <span className="font-bold text-green-600">
                    {stats.newToday}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                // onClick={handleExportPDF}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <FilePdfIcon />
                PDF
              </button>
              <button
                // onClick={handleExportWord}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <FileWordIcon />
                Word
              </button>
              <button
                // onClick={handleExportExcel}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <FileExcelIcon />
                Excel
              </button>
              <button
                onClick={() => navigate("/react-app/admin/add-user")}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <UserPlusIcon />
                إضافة مستخدم
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="relative">
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="ابحث عن مستخدم بالاسم أو البريد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">الكل</option>
                  <option value="university">من جامعة</option>
                  <option value="general">مستخدمين عام</option>
                </select>

                <button className="px-5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  <FilterIcon />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        activeTab === tab.id
                          ? "bg-white text-purple-600"
                          : "bg-gray-300"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي المستخدمين"
            value={stats.total}
            icon={<UsersIcon />}
            change={stats.growthRate}
            color="bg-purple-100"
            iconColor="text-purple-600"
          />
          <StatCard
            title="جدد هذا الأسبوع"
            value={stats.newThisWeek}
            icon={<UserPlusIcon />}
            change={stats.growthRate}
            color="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatCard
            title="جدد اليوم"
            value={stats.newToday}
            icon={<CalendarIcon />}
            change={stats.newToday > 0 ? 100 : 0}
            color="bg-green-100"
            iconColor="text-green-600"
          />
          <StatCard
            title="معدل النمو الأسبوعي"
            value={`${stats.growthRate}%`}
            icon={<ChartBarIcon />}
            change={stats.growthRate}
            color="bg-yellow-100"
            iconColor="text-yellow-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DashboardCard title="📈 اتجاه التسجيلات الشهري">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getRegistrationTrendData()}>
                  <defs>
                    <linearGradient
                      id="colorRegistrations"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.9} />
                      <stop
                        offset="95%"
                        stopColor="#7C3AED"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#7C3AED"
                    strokeWidth={3}
                    fill="url(#colorRegistrations)"
                    fillOpacity={1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>

          <DashboardCard title="� توزيع المستخدمين حسب الشهر">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getUserActivityData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                    }}
                    formatter={(value) => [`${value} مستخدم`, "عدد"]}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                    {getUserActivityData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>

          <DashboardCard title="🌍 توزيع المستخدمين حسب الدولة">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getCountryDistributionData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                    }}
                  />
                  <Bar dataKey="users" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardCard>
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {/* مستخدمين من جامعات */}
          <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-blue-100 rounded-xl">
                <svg
                  className="text-blue-600 w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 6.253v13m0-13C6.596 6.253 2 10.849 2 16.253v4m10-17.747v13m0-13c5.404 0 10 4.596 10 10v4M4 20.253h16" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">من الجامعات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getAdditionalStats().universityUsers}
                </p>
              </div>
            </div>
          </div>

          {/* الدولة الأكثر نشاطاً */}
          <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-green-100 rounded-xl">
                <svg
                  className="text-green-600 w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">أعلى دولة</p>
                <p className="text-lg font-bold text-gray-900 truncate max-w-full">
                  {getAdditionalStats().topCountry}
                </p>
              </div>
            </div>
          </div>

          {/* الشهر الأكثر نشاطاً */}
          <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-orange-100 rounded-xl">
                <svg
                  className="text-orange-600 w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">أعلى شهر</p>
                <p className="text-lg font-bold text-gray-900">
                  {getAdditionalStats().topMonth}
                </p>
              </div>
            </div>
          </div>

          {/* نشطين اليوم */}
          <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-cyan-100 rounded-xl">
                <svg
                  className="text-cyan-600 w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">نشطين اليوم</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeToday}
                </p>
              </div>
            </div>
          </div>

          {/* نشطين هذا الأسبوع */}
          <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-teal-100 rounded-xl">
                <svg
                  className="text-teal-600 w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">نشطين بالأسبوع</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeThisWeek}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* نشاط المستخدمين - آخر 7 أيام */}
        <DashboardCard title="📊 نشاط المستخدمين - آخر 7 أيام" fullWidth>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getUserActivityChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                  }}
                />
                <Bar dataKey="نشطين" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                <Bar dataKey="جدد" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Users Table */}
        <DashboardCard
          title={`👥 قائمة المستخدمين (${filteredUsers.length})`}
          fullWidth
        >
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("userName")}
                      className="flex items-center gap-1"
                    >
                      المستخدم
                      {sortConfig.key === "userName" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    المعلومات
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("registerAt")}
                      className="flex items-center gap-1"
                    >
                      تاريخ التسجيل
                      {sortConfig.key === "registerAt" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("lastActive")}
                      className="flex items-center gap-1"
                    >
                      آخر نشاط
                      {sortConfig.key === "lastActive" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={
                              imageMap[user.id] ||
                              user.imageUrl ||
                              placeholderImg
                            }
                            alt={user.userName}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow"
                            onError={(e) => {
                              e.currentTarget.src = placeholderImg;
                            }}
                          />
                          {user.isPremium && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 text-white p-1 rounded-full">
                              <CrownIcon className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {user.userName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <EnvelopeIcon />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">
                          <IdCardIcon className="inline ml-1" />
                          ID: {user.id}
                        </div>
                        {user.universityName && (
                          <div className="text-sm text-gray-600 flex items-center">
                            🎓 {user.universityName}
                          </div>
                        )}
                        {user.country?.nameCountry && (
                          <div className="text-sm text-gray-600 flex items-center">
                            🌍 {user.country.nameCountry}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {formatShortDate(user.registerAt)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(user.registerAt).toLocaleTimeString(
                            "ar-EG"
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        {user.lastActive ? (
                          <>
                            <span className="text-sm font-medium text-gray-900">
                              {formatShortDate(user.lastActive)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(user.lastActive).toLocaleTimeString(
                                "ar-EG"
                              )}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">
                            غير متاح
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ نشط
                        </span>
                        {user.universityId && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🎓 من جامعة
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/react-app/admin/view-user/${user.id}`)
                          }
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="عرض"
                        >
                          <EyeIcon />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/react-app/admin/edit-user/${user.id}`)
                          }
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="تعديل"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="حذف"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-5xl mb-4">👤</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  لا يوجد مستخدمين
                </h3>
                <p className="text-gray-500">
                  لم يتم العثور على مستخدمين مطابقين للبحث
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              عرض <span className="font-medium">1-{filteredUsers.length}</span>{" "}
              من <span className="font-medium">{filteredUsers.length}</span>{" "}
              مستخدم
            </div>{" "}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default UsersPage;
