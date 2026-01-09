import Header3 from "./Header3.jsx";
import Footer from "./Footer.jsx";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "motion/react";
import bgVideo from "./Campus_Pay_Seamless_Student_Transactions.mp4";
import API_CONFIG from "../config/api";

function Signup1({ setEmail, setPEmail, setPass, Email, PEmail, Pass, role }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
  const easingSoft = [0.16, 1, 0.3, 1];
  // 🔐 Strong password regex (ADDED)
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;



  useEffect(() => {
    if (role === "") {
      navigate("/role-select");
    }
  }, [role, navigate]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  const form = e.target;
  const password = form.password.value;
  const confirmPassword = form.confirm.value;
  const email = form.instituteEmail.value.trim();
  const pmail = role === "student" ? form.parentEmail.value.trim() : "";

  // ✅ Institute email domain validation (ADDED)
  if (role == "student" && !email.endsWith("@iiitdm.ac.in")) {
    setError("Institute Email must end with @iiitdm.ac.in");
    setLoading(false);
    return;
  }

  // ❌ Same email check (EXISTING – untouched)
  if (role === "student" && email === pmail) {
    setError("Institute Email and Personl Email cannot be the same.");
    setLoading(false);
    return;
  }

  // 🔐 Strong password validation (ADDED)
  if (!strongPasswordRegex.test(password)) {
    setError(
      "Password must be at least 8 characters and include uppercase, lowercase, number & special character."
    );
    setLoading(false);
    return;
  }

  // ❌ Password mismatch (EXISTING – untouched)
  if (password !== confirmPassword) {
    setError("Passwords do not match");
    setLoading(false);
    return;
  }

  setEmail(email);
  setPEmail(pmail);
  setPass(password);

  try {
    const response = await axios.post(API_CONFIG.getUrl("/send-otp"), {
      Email: email,
      PEmail: pmail,
      role,
    });
    
    navigate("/signup2");
  } catch (error) {
    console.error("Error sending OTP:", error);
    setError(error.response?.data?.message || "Failed to send OTP. Please try again.");
    setLoading(false);
  }
};


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

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background: isLight
          ? "radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 55%), radial-gradient(circle at 100% 0%, #dbeafe 0, transparent 55%), radial-gradient(circle at 0% 100%, #e0f2fe 0, transparent 55%), radial-gradient(circle at 100% 100%, #d1fae5 0, transparent 55%)"
          : "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.35), transparent 55%), radial-gradient(circle at 100% 0%, rgba(56,189,248,0.30), transparent 55%), radial-gradient(circle at 0% 100%, rgba(16,185,129,0.18), transparent 55%), radial-gradient(circle at 100% 100%, rgba(37,99,235,0.32), transparent 55%)"
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <Header3 theme={theme} setTheme={setTheme} />

      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            zIndex: 0,
            opacity: isLight ? 0.45 : 0.3,
          }}
        >
          <source src={bgVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Background Orbs */}
        <motion.div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: isLight
              ? "radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)"
              : "radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)",
            opacity: 0.5,
            mixBlendMode: isLight ? "normal" : "screen",
            zIndex: 1,
          }}
          animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: easingSoft }}
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 28,
            padding: "40px 22px 22px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: isLight ? "#0f172a" : "#e5e7eb",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            position: "relative",
            ...cardStyle,
          }}
        >
          {/* Top accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.45, ease: easingSoft }}
            style={{
              height: 2,
              borderRadius: 999,
              background:
                "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
              marginBottom: 20, // leave space for theme toggle
            }}
          />

          {/* Theme toggle below accent line */}
          <div
            style={{
              position: "absolute",
              top: 10,
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

          {/* Heading */}
          <h2
            style={{
              textAlign: "center",
              fontSize: 22,
              letterSpacing: "0.05em",
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Sign Up
          </h2>

          {/* Inputs */}
          <input
            type="email"
            name="instituteEmail"
            placeholder={role == "vendor"?"Enter Enail":" Institute Email"}
            required
            style={{
              padding: "11px 14px",
              borderRadius: 14,
              border: "1px solid rgba(148,163,184,0.9)",
              background: isLight ? "#ffffff" : "#0f172a",
              color: isLight ? "#0f172a" : "#e5e7eb",
              fontSize: 14,
              outline: "none",
            }}
          />

          {role === "student" && (
            <input
              type="email"
              name="parentEmail"
              placeholder="Personal Email"
              required
              style={{
                padding: "11px 14px",
                borderRadius: 14,
                border: "1px solid rgba(148,163,184,0.9)",
                background: isLight ? "#ffffff" : "#0f172a",
                color: isLight ? "#0f172a" : "#e5e7eb",
                fontSize: 14,
                outline: "none",
              }}
            />
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            style={{
              padding: "11px 14px",
              borderRadius: 14,
              border: "1px solid rgba(148,163,184,0.9)",
              background: isLight ? "#ffffff" : "#0f172a",
              color: isLight ? "#0f172a" : "#e5e7eb",
              fontSize: 14,
              outline: "none",
            }}
          />

          <input
            type="password"
            name="confirm"
            placeholder="Confirm Password"
            required
            style={{
              padding: "11px 14px",
              borderRadius: 14,
              border: "1px solid rgba(148,163,184,0.9)",
              background: isLight ? "#ffffff" : "#0f172a",
              color: isLight ? "#0f172a" : "#e5e7eb",
              fontSize: 14,
              outline: "none",
            }}
          />

          {error && (
            <p style={{ color: "#b91c1c", fontSize: 13, textAlign: "center" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "11px 14px",
              borderRadius: 14,
              border: "none",
              background:
                "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
              color: "#f9fafb",
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
              fontSize: 14,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              minWidth: "120px",
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #f9fafb",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Processing...
              </>
            ) : (
              "Next"
            )}
          </button>
        </motion.form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export default Signup1;
