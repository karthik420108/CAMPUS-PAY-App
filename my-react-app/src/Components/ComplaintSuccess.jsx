import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import Header from "./Header3"
function ComplaintSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { complaintId } = location.state || {};

  const [theme, setTheme] = useState("light");

  if (!complaintId) {
    navigate("/");
    return null;
  }

  const isLight = theme === "light";

  // ---------- EXACT ComplaintHistory THEME STYLES ----------
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
  const textSub = isLight ? "#6b7280" : "#94a3b8";

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

  const easingSoft = [0.16, 1, 0.3, 1];

  return (

    
    <motion.div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        ...pageStyle,
      }}
    >
      {/* Background Orbs */}
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

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: easingSoft }}
        style={{
          width: "100%",
          maxWidth: 650,
          borderRadius: 28,
          padding: "40px 32px",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          color: textMain,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          position: "relative",
          overflow: "hidden",
          ...cardStyle,
        }}
      >
        {/* Top Accent Line */}
        <motion.div
          style={{
            position: "absolute",
            left: 26,
            right: 26,
            top: 10,
            height: 2,
            borderRadius: 999,
            background: "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
            opacity: 0.9,
          }}
          animate={{ x: [-8, 8, -8] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* BACK BUTTON - COMPLETE Top Left */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: easingSoft }}
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            position: "absolute",
            top: 20,
            left: 24,
            padding: "12px 18px",
            borderRadius: 16,
            border: "1px solid rgba(148,163,184,0.6)",
            background: isLight ? "rgba(255,255,255,0.95)" : "rgba(15,23,42,0.85)",
            color: textMain,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: 
              "0 8px 24px rgba(0,0,0,0.15), " +
              "0 4px 12px rgba(0,0,0,0.08), " +
              "inset 0 1px 0 rgba(255,255,255,0.2)",
            zIndex: 10,
            transition: "all 0.2s ease",
          }}
        >
          < Header/>
          <span style={{ fontSize: 16 }}>←</span>
          <span>Back</span>
        </motion.button>

        {/* Theme Toggle - Top Right */}
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 24,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
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
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "4px 12px",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: isLight
                ? "linear-gradient(120deg,#020617,#0f172a)"
                : "linear-gradient(120deg,#e5f2ff,#dbeafe)",
              color: isLight ? "#e5e7eb" : "#0f172a",
            }}
          >
            {isLight ? "Dark" : "Light"}
          </button>
        </div>

        {/* SUCCESS ICON */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: easingSoft }}
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #22c55e, #86efac)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 48px rgba(34, 197, 94, 0.4)",
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 44, lineHeight: 1 }}>🎉</span>
        </motion.div>

        {/* ORIGINAL h2 */}
        <motion.h2
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: easingSoft }}
          style={{
            fontSize: 28,
            letterSpacing: "0.05em",
            fontWeight: 800,
            color: textMain,
            margin: "0 0 16px 0",
            lineHeight: 1.2,
          }}
        >
          Complaint Submitted Successfully 🎉
        </motion.h2>

        {/* ORIGINAL p */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: easingSoft }}
          style={{
            fontSize: 13,
            color: textSub,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: "0 0 20px 0",
            fontWeight: 500,
          }}
        >
          Your Complaint ID
        </motion.p>

        {/* ORIGINAL h3 */}
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5, ease: easingSoft }}
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: textMain,
            letterSpacing: "-0.02em",
            wordBreak: "break-all",
            fontFamily: "monospace",
            background: isLight ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.3)",
            padding: "16px 24px",
            borderRadius: 16,
            border: `2px solid ${isLight ? "rgba(34,197,94,0.3)" : "rgba(34,197,94,0.5)"}`,
            margin: 0,
            boxShadow: "0 12px 32px rgba(34,197,94,0.2)",
          }}
        >
          {complaintId}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default ComplaintSuccess;
