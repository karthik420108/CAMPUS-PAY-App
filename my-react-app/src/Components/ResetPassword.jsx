import Header from "./Header3.jsx";
import Footer from "./Footer.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "motion/react";
import { useAlert } from "../context/AlertContext";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, role } = location.state || {};
  const { showAlert } = useAlert();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");
  const isLight = theme === "light";

  useEffect(() => {
    if (!email) navigate("/");
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/reset-password", {
        email,
        password,
        role,
      });

      showAlert({
        type: "success",
        title: "Password Reset",
        message: "Password reset successful"
      });
      navigate("/login");
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const pageStyle = isLight
    ? {
        background:
          "radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 0%, #dbeafe 0, transparent 55%)," +
          "radial-gradient(circle at 0% 100%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 100%, #d1fae5 0, transparent 55%)",
        backgroundColor: "#f3f4f6",
      }
    : {
        backgroundColor: "#020617",
        backgroundImage:
          "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.35), transparent 55%)," +
          "radial-gradient(circle at 100% 0%, rgba(56,189,248,0.30), transparent 55%)," +
          "radial-gradient(circle at 0% 100%, rgba(16,185,129,0.18), transparent 55%)," +
          "radial-gradient(circle at 100% 100%, rgba(37,99,235,0.32), transparent 55%)," +
          "linear-gradient(to right, rgba(15,23,42,0.9) 1px, transparent 1px)," +
          "linear-gradient(to bottom, rgba(15,23,42,0.9) 1px, transparent 1px)",
        backgroundSize: "cover, cover, cover, cover, 80px 80px, 80px 80px",
        backgroundPosition: "center, center, center, center, 0 0, 0 0",
      };

  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const cardStyle = isLight
    ? {
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))",
        border: "1px solid rgba(148,163,184,0.35)",
        boxShadow: "0 16px 38px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.28)",
      }
    : {
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
        border: "1px solid rgba(148,163,184,0.45)",
        boxShadow: "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
      };

  const errorColor = isLight ? "#b91c1c" : "#fecaca";

  return (
    <>
      <Header />
      <motion.div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
          overflow: "hidden",
          position: "relative",
          ...pageStyle,
        }}
      >
        {/* Background orbs */}
        <motion.div
          style={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: isLight
              ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)"
              : "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)",
            filter: "blur(40px)",
            opacity: 0.5,
            top: -40,
            left: -60,
            mixBlendMode: isLight ? "normal" : "screen",
          }}
          animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{
            position: "absolute",
            width: 210,
            height: 210,
            borderRadius: "50%",
            background: isLight
              ? "radial-gradient(circle at 70% 80%, #bae6fd, #7dd3fc, #22c55e)"
              : "radial-gradient(circle at 70% 80%, #7dd3fc, #0ea5e9, #22c55e)",
            filter: "blur(34px)",
            opacity: 0.5,
            bottom: -40,
            right: -40,
            mixBlendMode: isLight ? "normal" : "screen",
          }}
          animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Reset Password card */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: "100%",
            maxWidth: 500,
            borderRadius: 28,
            padding: "26px 22px 20px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: textMain,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            position: "relative",
            overflow: "hidden",
            ...cardStyle,
          }}
        >
          {/* Theme toggle */}
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 18,
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 5px",
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
              onClick={() =>
                setTheme((prev) => (prev === "light" ? "dark" : "light"))
              }
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

          <h2 style={{ fontSize: 22, fontWeight: 700, color: textMain }}>Reset Password</h2>
          {err && <p style={{ color: errorColor, fontSize: 13 }}>{err}</p>}

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "12px",
              borderRadius: 14,
              border: `1px solid ${isLight ? "#d1d5db" : "#374151"}`,
              outline: "none",
              background: isLight ? "#fff" : "#1e293b",
              color: textMain,
              fontSize: 14,
            }}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              padding: "12px",
              borderRadius: 14,
              border: `1px solid ${isLight ? "#d1d5db" : "#374151"}`,
              outline: "none",
              background: isLight ? "#fff" : "#1e293b",
              color: textMain,
              fontSize: 14,
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              borderRadius: 14,
              border: "none",
              fontWeight: 600,
              color: "#f9fafb",
              fontSize: 14,
              background: "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </motion.form>
      </motion.div>
      <Footer />
    </>
  );
}

export default ResetPassword;
