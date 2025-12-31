import React from "react";
import "./Footer.css";
import copyrightImg from "../assets/copyright.png";

/**
 * Footer Component - مكون الفوتير الشامل
 * 
 * @param {string} variant - نوع الفوتير: 'landing' | 'auth' | 'dashboard' | 'main'
 * @param {boolean} showFlag - إظهار العلم الأردني
 * @param {boolean} showLinks - إظهار روابط التنقل
 * @param {Array} customLinks - روابط مخصصة
 * @param {string} copyrightText - نص حقوق النشر المخصص
 */

const Footer = ({
  variant = "main", // 'landing' | 'auth' | 'dashboard' | 'main'
  showFlag = true,
  showLinks = true,
  customLinks = null,
  copyrightText = null,
  className = "",
}) => {
  // روابط الفوتير الافتراضية
  const defaultLinks = [
    { label: "المكافآت", href: "#rewards" },
    { label: "الوظائف", href: "#jobs" },
    { label: "مركز المساعدة", href: "#help-center" },
    { label: "الشروط", href: "#terms" },
    { label: "الطلب", href: "#request" },
  ];

  // روابط الفوتير الرئيسي (main-footer)
  const mainFooterLinks = [
    { label: "مركز المساعدة", href: "#help" },
    { label: "الوظائف", href: "#jobs" },
    { label: "المكافآت", href: "#rewards" },
    { label: "الطلاب", href: "#students" },
    { label: "الطلب", href: "#request" },
    { label: "الشروط", href: "#terms" },
  ];

  // تحديد الروابط حسب نوع الفوتير
  const links = customLinks || (variant === "main" ? mainFooterLinks : defaultLinks);

  // نص حقوق النشر الافتراضي
  const defaultCopyright = variant === "main" 
    ? "حقوق الطبع والنشر © 2024 عرب كوديرز"
    : "حقوق الابتكار والنشر © عرب كودرز";

  const copyright = copyrightText || defaultCopyright;

  // نص العلم الأردني
  const flagText = "🇯🇴 المملكة الأردنية الهاشمية";

  // معالجة النقر على الروابط
  const handleLinkClick = (e, href) => {
    // إذا كان الرابط hash link (#), لا نمنع السلوك الافتراضي
    if (href.startsWith("#")) {
      return;
    }
    // يمكن إضافة لوجيك إضافي هنا للروابط الخارجية
  };

  // Render حسب نوع الفوتير
  if (variant === "landing") {
    return (
      <footer className={`landing-footer ${className}`} aria-label="تذييل الصفحة">
        <div className="landing-footer__row">
          {showFlag && (
            <span className="landing-footer__text landing-footer__text--flag">
              {flagText}
            </span>
          )}
          {showLinks && (
            <ul className="landing-footer__nav" role="list">
              {links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} onClick={(e) => handleLinkClick(e, link.href)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <span className="landing-footer__text">{copyright}</span>
        </div>
      </footer>
    );
  }

  if (variant === "auth" || variant === "dashboard") {
    return (
      <footer className={`landing-footer--auth ${variant === "dashboard" ? "dashboard-home__footer" : ""} ${className}`}>
        <div className="landing-footer__row">
          {showFlag && (
            <span className="landing-footer__text landing-footer__text--flag">
              {flagText}
            </span>
          )}
          {showLinks && (
            <ul className="landing-footer__nav" role="list">
              {links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} onClick={(e) => handleLinkClick(e, link.href)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <span className="landing-footer__text">{copyright}</span>
        </div>
      </footer>
    );
  }

  // Main Footer (للـ AuthCard)
  return (
    <footer className={`main-footer ${className}`}>
      <div className="footer-content">
        {showLinks && (
          <div className="footer-links">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
        <div className="footer-info">
          <div className="copyright">
            <img 
              src={copyrightImg} 
              alt="Copyright" 
              className="copyright-icon" 
            />
            <span>{copyright}</span>
          </div>
          {showFlag && (
            <div className="country-flag">
              <span className="flag-icon">🇯🇴</span>
              <span>المملكة الأردنية الهاشمية</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

