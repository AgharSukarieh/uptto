// Navbar.js
import React, { useContext, useState } from "react";
import { UserContext } from "./Hook/UserContext";
import { Link } from "react-router-dom";
import NotificationDropdown from "./Pages/Notification/NotificationDropdown";
import "./navbar.css";

const Navbar = ({ onLogout, setPage }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useContext(UserContext);

  return (
    <nav dir="rtl" className="navbar-container">
      <div className="navbar-wrapper">
        <div className="navbar-content">
          {/* Logo */}
          <div className="navbar-logo">
            <h1 className="navbar-title">عرب كود</h1>
            <span className="navbar-subtitle">منصّة المسابقات</span>
          </div>

          {/* Desktop Links */}
          <div className="navbar-desktop-links">
            <Link
              to={user ? `/Profile/${user.id}` : "/login"}
              className="navbar-link"
            >
              الملف الشخصي
            </Link>
            <Link to={"problems"} className="navbar-link">
              المسائل
            </Link>
            <Link to={"algorithms"} className="navbar-link">
              خوارزميات
            </Link>
            <Link to={"contests"} className="navbar-link">
              مسابقات
            </Link>
            <Link
              to={user ? "/notifications" : "/login"}
              className="navbar-link"
            >
              الإشعارات
            </Link>
            <Link to={"AddProblemProposal"} className="navbar-link">
              اقتراح مسألة
            </Link>
          </div>

          {/* Right Actions */}
          <div className="navbar-actions">
            {user && <NotificationDropdown />}

            {user ? (
              <>
                <span className="navbar-user-greeting">
                  أهلاً، {user.name}!
                </span>
                <button
                  onClick={onLogout}
                  className="navbar-btn navbar-btn-logout"
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <button
                onClick={() => setPage("login")}
                className="navbar-btn navbar-btn-login"
              >
                تسجيل الدخول
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="navbar-mobile-btn"
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="navbar-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="navbar-icon"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`navbar-mobile-menu ${
          menuOpen ? "navbar-mobile-menu-open" : ""
        }`}
      >
        <div className="navbar-mobile-links">
          <Link
            to={user ? `/Profile/${user.id}` : "/login"}
            className="navbar-mobile-link"
          >
            الملف الشخصي
          </Link>
          <Link to={"problems"} className="navbar-mobile-link">
            المسائل
          </Link>
          <Link to={"algorithms"} className="navbar-mobile-link">
            خوارزميات
          </Link>
          <Link to={"contests"} className="navbar-mobile-link">
            مسابقات
          </Link>
          <Link
            to={user ? "/notifications" : "/login"}
            className="navbar-mobile-link"
          >
            الإشعارات
          </Link>
          <Link to={"AddProblemProposal"} className="navbar-mobile-link">
            اقتراح مسألة
          </Link>
          <div className="navbar-mobile-divider" />
          {user ? (
            <button
              onClick={onLogout}
              className="navbar-mobile-link navbar-mobile-link-logout"
            >
              تسجيل الخروج
            </button>
          ) : (
            <button
              onClick={() => setPage("login")}
              className="navbar-mobile-link navbar-mobile-link-login"
            >
              تسجيل الدخول
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
