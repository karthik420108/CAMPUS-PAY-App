import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "motion/react";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [vName, setVName] = useState("");
  const [theme, setTheme] = useState("light"); // light/dark mode
  const isLight = theme === "light";

  if (!location.state) {
    return (
      <h2
        style={{
          textAlign: "center",
          marginTop: 40,
          color: isLight ? "#0f172a" : "#e5e7eb",
        }}
      >
        Invalid access. Please scan QR again.
      </h2>
    );
  }

  const { vendorId, amount, transactionId, userId } = location.state || {};

  useEffect(() => {
    if (!vendorId) return;
    const fetchVendorName = async () => {
      try {
        const res = await axios.post("http://localhost:5000/vendor-name", { vendorId });
        setVName(res.data.vName);
      } catch (err) {
        console.error("Failed to fetch vendor name:", err);
      }
    };
    fetchVendorName();
  }, [vendorId]);

  // ---------- Background styles ----------
  const pageStyle = isLight
    ? {
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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        position: "relative",
        overflow: "hidden",
        ...pageStyle,
      }}
    >
      {/* Top Orb */}
      <motion.div
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: isLight
            ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)"
            : "radial-gradient(circle at 30% 0%, #3b82f6, #0ea5e9, #1d4ed8)",
          filter: "blur(60px)",
          opacity: 0.5,
          top: -100,
          left: -100,
          mixBlendMode: isLight ? "normal" : "screen",
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Bottom Orb */}
      <motion.div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: isLight
            ? "radial-gradient(circle at 70% 80%, #bae6fd, #7dd3fc, #22c55e)"
            : "radial-gradient(circle at 70% 80%, #7dd3fc, #0ea5e9, #22c55e)",
          filter: "blur(50px)",
          opacity: 0.5,
          bottom: -100,
          right: -100,
          mixBlendMode: isLight ? "normal" : "screen",
        }}
        animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Payment Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 28,
          padding: 28,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          background: isLight
            ? "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))"
            : "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
          border: isLight
            ? "1px solid rgba(148,163,184,0.35)"
            : "1px solid rgba(148,163,184,0.45)",
          boxShadow: isLight
            ? "0 16px 38px rgba(15,23,42,0.18), 0 0 0 1px rgba(148,163,184,0.28)"
            : "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
          color: isLight ? "#0f172a" : "#e5e7eb",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent Line */}
        <motion.div
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            top: 20,
            height: 2,
            borderRadius: 999,
            background:
              "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
            opacity: 0.9,
          }}
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Theme Toggle */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 4px",
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.6)",
            background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)",
            fontSize: 10,
            zIndex: 5,
          }}
        >
          <span style={{ color: "#6b7280", fontSize: 9 }}>Mode</span>
          <button
            type="button"
            onClick={() => setTheme(prev => (prev === "light" ? "dark" : "light"))}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "2px 8px",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 2,
              background: isLight
                ? "linear-gradient(120deg,#020617,#0f172a)"
                : "linear-gradient(120deg,#e5f2ff,#dbeafe)",
              color: isLight ? "#e5e7eb" : "#0f172a",
            }}
          >
            {isLight ? "Dark" : "Light"}
          </button>
        </div>

        <h1 style={{ marginBottom: 8, marginTop: 24 }}>Payment Page</h1>
        <h2>Vendor Name: {vName}</h2>
        <h2>Amount: ₹{Number(amount)}</h2>

        {/* Buttons */}
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 18px rgba(129,140,248,0.85)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() =>
            navigate("/enter-mpin", {
              state: { vendorId, amount, transactionId, userId, vName },
            })
          }
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
            color: "#f9fafb",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 15,
            textTransform: "uppercase",
          }}
        >
          Pay
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 12px rgba(191,219,254,0.6)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(-1)}
          style={{
            width: "100%",
            padding: "10px 0",
            borderRadius: 14,
            border: "1px solid",
            borderColor: isLight ? "#60a5fa" : "#38bdf8",
            background: isLight ? "#f9fafb" : "#0f172a",
            color: isLight ? "#0f172a" : "#f9fafb",
            fontWeight: 500,
            cursor: "pointer",
            fontSize: 15,
            marginTop: 6,
          }}
        >
          Cancel
        </motion.button>
      </motion.div>
    </div>
  );
}

export default Payment;
