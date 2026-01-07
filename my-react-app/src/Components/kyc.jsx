import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Header3 from "./Header3";
// Footer is removed from inside the main layout to match the clean look of RaiseComplaint
// If you really need Footer, you can add it back at the bottom, but usually these centered forms look better without it.

function Kyc({ role, Email }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [kycFile, setKycFile] = useState(null);
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

  useEffect(() => {
    if (!role) navigate("/role-select");
  }, [role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kycFile) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("role", role + "kyc");
      formData.append("kycImage", kycFile);
      formData.append("email", Email);

      const res = await axios.post(`http://localhost:5000/upload-kyc`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/mpin", { state: { kycData: res.data.kycData } });
    } catch (err) {
      console.error(err);
      setError("KYC upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const easingSoft = [0.16, 1, 0.3, 1];
  const isLight = theme === "light";

  // ---------- THEME-DEPENDENT STYLES ----------
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

  return (
    <>
      <Header3 theme={theme} setTheme={setTheme} />

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
        {/* soft background orbs */}
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

        {/* CARD */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: easingSoft }}
          style={{
            width: "100%",
            maxWidth: 500, // Slightly smaller width for a simple upload form
            borderRadius: 28,
            padding: "32px 28px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: textMain,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "relative",
            overflow: "hidden",
            ...cardStyle,
          }}
        >
          {/* Theme Toggle */}
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

          {/* Top Accent Line */}
          <motion.div
            style={{
              position: "absolute",
              left: 26,
              right: 26,
              top: 10,
              height: 2,
              borderRadius: 999,
              background:
                "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
              opacity: 0.9,
            }}
            animate={{ x: [-8, 8, -8] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: easingSoft }}
          >
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: textMain,
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              KYC Verification
            </h2>
            <p
              style={{
                fontSize: 14,
                color: textSub,
                textAlign: "center",
                margin: 0,
              }}
            >
              Your KYC will be verified within 48 hours.
            </p>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.45, ease: easingSoft }}
            style={{
              height: 1,
              width: "100%",
              borderRadius: 999,
              background: isLight
                ? "linear-gradient(90deg,transparent,#dbeafe,#93c5fd,transparent)"
                : "linear-gradient(90deg,transparent,#1e293b,#0f172a,transparent)",
            }}
          />

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35, ease: easingSoft }}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <label style={{ fontSize: 13, color: textMain, fontWeight: 500 }}>
              Upload Document
            </label>
            <motion.label
              whileHover={{
                scale: 1.01,
                borderColor: isLight ? "#3b82f6" : "#60a5fa",
                backgroundColor: isLight
                  ? "rgba(239,246,255,0.6)"
                  : "rgba(30,58,138,0.2)",
              }}
              whileTap={{ scale: 0.99 }}
              style={{
                cursor: "pointer",
                padding: "32px 20px",
                borderRadius: 16,
                border: `2px dashed ${
                  isLight ? "rgba(148,163,184,0.6)" : "rgba(75,85,99,0.6)"
                }`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                transition: "all 0.2s ease",
                background: isLight
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(15,23,42,0.4)",
              }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  fontSize: 32,
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
                }}
              >
                📂
              </motion.div>
              <div style={{ textAlign: "center" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 600,
                    color: textMain,
                    marginBottom: 2,
                  }}
                >
                  {kycFile ? kycFile.name : "Click to Upload"}
                </span>
                <span style={{ fontSize: 12, color: textSub }}>
                  {kycFile ? "File selected" : "ID Card, Passport, or License"}
                </span>
              </div>
              <input
                type="file"
                name="kycImage"
                accept="image/*"
                required
                onChange={(e) => setKycFile(e.target.files[0])}
                style={{ display: "none" }}
              />
            </motion.label>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                style={{
                  color: errorColor,
                  fontSize: 13,
                  textAlign: "center",
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={
              !loading
                ? {
                    scale: 1.02,
                    boxShadow: "0 0 18px rgba(129,140,248,0.85)",
                  }
                : {}
            }
            whileTap={!loading ? { scale: 0.97 } : {}}
            animate={
              loading
                ? { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
                : { backgroundPosition: "0% 50%" }
            }
            transition={{
              duration: loading ? 1.8 : 0.3,
              repeat: loading ? Infinity : 0,
              ease: "easeInOut",
            }}
            style={{
              marginTop: 8,
              padding: "12px 14px",
              borderRadius: 14,
              border: "none",
              background:
                "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
              backgroundSize: "220% 220%",
              color: "#f9fafb",
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
              fontSize: 15,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <span>Uploading</span>
                <motion.div style={{ display: "flex", gap: 3 }}>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.12,
                      }}
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        backgroundColor: "#f9fafb",
                      }}
                    />
                  ))}
                </motion.div>
              </>
            ) : (
              "Continue →"
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </>
  );
}

export default Kyc;
