import Header from "./Header3";
import Footer from "./Footer";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import bgVideo from "./Campus_Pay_Seamless_Student_Transactions.mp4";

function Forgot() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("auto");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const isLight = theme === "light";
  const easingSoft = [0.16, 1, 0.3, 1];

  // Responsive scaling based on screen size
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate responsive scale
  const getResponsiveScale = () => {
    if (screenSize.width < 480) return 0.85; // Mobile
    if (screenSize.width < 768) return 0.9;  // Tablet
    if (screenSize.width < 1024) return 0.95; // Small desktop
    return 1; // Large desktop
  };

  const getResponsivePadding = () => {
    if (screenSize.width < 480) return "30px 16px 18px"; // Mobile
    if (screenSize.width < 768) return "38px 20px 20px"; // Tablet
    return "46px 22px 22px"; // Desktop
  };

  const getResponsiveMaxWidth = () => {
    if (screenSize.width < 480) return "95%"; // Mobile
    if (screenSize.width < 768) return "90%"; // Tablet
    return "420px"; // Desktop
  };

  const getResponsiveFontSize = (baseSize) => {
    const scale = getResponsiveScale();
    return Math.round(baseSize * scale);
  };

  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";
  const errorColor = isLight ? "#b91c1c" : "#fecaca";

  const cardStyle = isLight
    ? {
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))",
        border: "1px solid rgba(148,163,184,0.35)",
        boxShadow:
          "0 16px 38px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.28)",
      }
    : {
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
        border: "1px solid rgba(148,163,184,0.45)",
        boxShadow:
          "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
      };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    try {
      const payload = role === "auto" ? { email } : { email, role };
      const res = await axios.post("http://localhost:5000/forgot-otp", payload);
      setMessage(res.data.message);
      setError("");
      navigate("/forgot2", {
        state: {
          Email: res.data.studentEmail, // Use the actual student email from backend
          PEmail: res.data.parentEmail,
          role: res.data.role,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "User does not exist");
      setMessage("");
    }
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      <motion.div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -2,
          }}
        >
          <source src={bgVideo} type="video/mp4" />
        </video>

        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isLight
              ? "rgba(255,255,255,0.55)"
              : "linear-gradient(to bottom right, rgba(2,6,23,0.8), rgba(15,23,42,0.9))",
            zIndex: -1,
          }}
        />

        {/* Card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: getResponsiveScale() }}
          transition={{ duration: 0.55, ease: easingSoft }}
          style={{
            width: "100%",
            maxWidth: getResponsiveMaxWidth(),
            borderRadius: Math.round(28 * getResponsiveScale()),
            padding: getResponsivePadding(),
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: textMain,
            display: "flex",
            flexDirection: "column",
            gap: Math.round(14 * getResponsiveScale()),
            position: "relative",
            ...cardStyle,
          }}
        >
          {/* Theme toggle */}
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 18,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 6px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.6)",
              background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)",
              fontSize: 11,
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

          {/* Top accent line only */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.45, ease: easingSoft }}
            style={{
              height: 2,
              borderRadius: 999,
              background:
                "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
              marginBottom: 12,
            }}
          />

          {/* Heading */}
          <h2
            style={{
              textAlign: "center",
              fontSize: getResponsiveFontSize(22),
              letterSpacing: "0.05em",
              fontWeight: 700,
            }}
          >
            Forgot Password
          </h2>

          <p
            style={{
              textAlign: "center",
              fontSize: getResponsiveFontSize(13),
              color: textSub,
              marginBottom: Math.round(6 * getResponsiveScale()),
            }}
          >
            Enter your registered email to receive OTP
          </p>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              padding: `${Math.round(11 * getResponsiveScale())}px ${Math.round(14 * getResponsiveScale())}px`,
              borderRadius: Math.round(14 * getResponsiveScale()),
              border: "1px solid rgba(148,163,184,0.9)",
              background: isLight
                ? "rgba(255,255,255,0.98)"
                : "radial-gradient(circle at 0 0, rgba(30,64,175,0.35), transparent 70%), #020617",
              color: textMain,
              outline: "none",
              fontSize: getResponsiveFontSize(14),
            }}
          >
            <option value="auto">Auto Detect</option>
            <option value="student">Student</option>
            <option value="vendor">Vendor</option>
            <option value="admin">Admin</option>
            <option value="subadmin">SubAdmin</option>
          </select>

          {message && (
            <p style={{ 
              color: "#22c55e", 
              fontSize: getResponsiveFontSize(13), 
              textAlign: "center" 
            }}>
              {message}
            </p>
          )}

          {error && (
            <p
              style={{
                color: errorColor,
                fontSize: getResponsiveFontSize(13),
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <input
            type="email"
            placeholder="Registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: `${Math.round(11 * getResponsiveScale())}px ${Math.round(14 * getResponsiveScale())}px`,
              borderRadius: Math.round(14 * getResponsiveScale()),
              border: "1px solid rgba(148,163,184,0.9)",
              background: isLight
                ? "rgba(255,255,255,0.98)"
                : "radial-gradient(circle at 0 0, rgba(30,64,175,0.35), transparent 70%), #020617",
              color: textMain,
              outline: "none",
              fontSize: getResponsiveFontSize(14),
            }}
          />

          <button
            type="submit"
            style={{
              padding: `${Math.round(11 * getResponsiveScale())}px ${Math.round(14 * getResponsiveScale())}px`,
              borderRadius: Math.round(14 * getResponsiveScale()),
              border: "none",
              background:
                "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
              backgroundSize: "220% 220%",
              color: "#f9fafb",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: getResponsiveFontSize(14),
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Send OTP
          </button>
        </motion.form>
      </motion.div>

      <Footer />
    </>
  );
}

export default Forgot;
