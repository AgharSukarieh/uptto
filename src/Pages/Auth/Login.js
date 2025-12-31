
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "./AuthCard";
import LandingNav from "../../Components/LandingNav";
import Threads from "../../Components/Threads";
import Footer from "../../Components/Footer";
import logoPart from "../../assets/logo_part.png";
import "./login.css";

const navLinks = [
  { label: "استكشف", href: "#explore" },
  { label: "الأسئلة", href: "#questions" },
  { label: "المبرمج", href: "#coder" },
  { label: "تسجيل الدخول", to: "/login" },
];

const Login = () => {
  const navigate = useNavigate();

  const handleNavClick = useCallback(
    (event, link) => {
      if (link.to === "/login") {
        event.preventDefault();
        return;
      }

      if (link.href?.startsWith("#")) {
        event.preventDefault();
        navigate(`/${link.href}`);
      }
    },
    [navigate]
  );

  return (
    <div className="login-page">
      <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
        <Threads
          amplitude={1}
          distance={0}
          enableMouseInteraction={true}
          color={[0.7, 0.7, 0.7]}
        />
      </div>
      <header className="landing-header landing-header--auth">
        <LandingNav
          links={navLinks}
          onLinkClick={handleNavClick}
          logo={<img src={logoPart} alt="عرب كودرز" />}
        />
      </header>

      <main className="login-page__main">
        <div className="login-card-container">
          <AuthCard initialMode="login" showHeader={false} showFooter={false} />
        </div>
      </main>

      <Footer variant="auth" />
    </div>
  );
};

export default Login;