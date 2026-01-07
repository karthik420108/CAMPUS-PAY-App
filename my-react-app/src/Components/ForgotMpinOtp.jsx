import Header from "./Header3.jsx";
import Footer from "./Footer.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAlert } from "../context/AlertContext";

function ForgotMpinOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, role } = location.state || {};
  const { showAlert } = useAlert();

  const [Err, setErr] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("appTheme") || "light";
  });

  // Listen for theme changes from header
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "appTheme") {
        setTheme(e.newValue || "light");
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    // Also check periodically for immediate updates
    const checkTheme = () => {
      const currentTheme = localStorage.getItem("appTheme");
      if (currentTheme !== theme) {
        setTheme(currentTheme || "light");
      }
    };
    
    const interval = setInterval(checkTheme, 100);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("appTheme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const isLight = theme === "light";

  useEffect(() => {
    if (!userId) navigate("/");
  }, [userId, navigate]);

  const handleChange = (idx, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[idx] = value;
      setOtp(newOtp);

      if (value && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
      if (!value && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setErr("Please enter 6-digit OTP");
      return;
    }

    try {
      await axios.post("http://localhost:5000/verify-mpin-otp", { userId, role, otp: otpValue });
      navigate("/reset-mpin", { state: { userId, role } });
    } catch (error) {
      setErr(error.response?.data?.message || "OTP verification failed");
    }
  };

  const handleResend = async () => {
    try {
      await axios.post("http://localhost:5000/resend-mpin-otp", { userId, role });
      showAlert({
        type: "success",
        title: "OTP Sent",
        message: "OTP resent to institute email"
      });
    } catch {
      showAlert({
        type: "error",
        title: "Resend Failed",
        message: "Failed to resend OTP"
      });
    }
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          background: isLight
            ? "radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 55%), radial-gradient(circle at 100% 0%, #dbeafe 0, transparent 55%)"
            : "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.35), transparent 55%), radial-gradient(circle at 100% 0%, rgba(56,189,248,0.30), transparent 55%)",
        }}
      >
        <form
          onSubmit={handleVerify}
          style={{
            width: "100%",
            maxWidth: 420,
            background: isLight ? "rgba(255,255,255,0.95)" : "rgba(15,23,42,0.9)",
            borderRadius: 24,
            padding: 36,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "relative",
            boxShadow: isLight
              ? "0 16px 38px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.28)"
              : "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: isLight ? "#0f172a" : "#e5e7eb",
          }}
        >
          {/* Accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 22,
              right: 22,
              height: 2,
              borderRadius: 999,
              background: "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
            }}
          />

          {/* Theme toggle */}
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 18,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 6px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.6)",
              background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)",
              fontSize: 11,
              zIndex: 5,
            }}
          >
            <span style={{ color: "#6b7280" }}>Mode</span>
            <button
              type="button"
              onClick={() => setTheme((p) => (p === "light" ? "dark" : "light"))}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "3px 10px",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                background: isLight
                  ? "linear-gradient(120deg,#020617,#0f172a)"
                  : "linear-gradient(120deg,#e5f2ff,#dbeafe)",
                color: isLight ? "#e5e7eb" : "#0f172a",
              }}
            >
              {isLight ? "Dark" : "Light"}
            </button>
          </div>

          <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            Reset MPIN
          </h2>

          {Err && <p style={{ color: "#b91c1c", textAlign: "center" }}>{Err}</p>}

          <label style={{ fontWeight: 500 }}>Enter OTP sent to institute mail</label>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 12 }}>
            {otp.map((val, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength="1"
                value={val}
                onChange={(e) => handleChange(idx, e.target.value)}
                style={{
                  width: 48,
                  height: 48,
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: 600,
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,0.7)",
                  outline: "none",
                  background: isLight ? "#fff" : "#0f172a",
                  color: isLight ? "#0f172a" : "#e5e7eb",
                }}
              />
            ))}
          </div>

          <p
            onClick={handleResend}
            style={{
              textAlign: "center",
              color: "#0ea5e9",
              fontWeight: 500,
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            Resend OTP
          </p>

          <button
            type="submit"
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
              color: "#f9fafb",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Verify
          </button>
        </form>
      </main>

      <Footer />
    </>
  );
}

export default ForgotMpinOtp;
