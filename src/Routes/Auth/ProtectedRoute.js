import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuthToken } from "../../store/authSlice";

export default function ProtectedRoute({ children }) {
  const token = useSelector(selectAuthToken);
  const location = useLocation();
  const isLoggedIn = Boolean(token);

  if (!isLoggedIn) {
    // حفظ المسار الحالي للعودة إليه بعد تسجيل الدخول
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

