import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

function ScreenshotViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState("light");
  const [imageError, setImageError] = useState(false);

  // Get screenshot URL from location state
  const screenshotUrl = location.state?.screenshotUrl;
  const complaintId = location.state?.complaintId;
  const studentName = location.state?.studentName;

  useEffect(() => {
    // Check system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const isLight = theme === "light";
  const textMain = isLight ? "#0f172a" : "#e5e7eb";
  const textSub = isLight ? "#6b7280" : "#94a3b8";

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

  if (!screenshotUrl) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          ...pageStyle,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: textMain,
        }}
      >
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2 style={{ marginBottom: "20px" }}>No Screenshot Available</h2>
          <button
            onClick={handleBack}
            style={{
              padding: "12px 24px",
              background: isLight ? "#3b82f6" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ← Go Back
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        ...pageStyle,
        minHeight: "100vh",
        padding: "20px",
        color: textMain,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          padding: "16px 24px",
          background: isLight 
            ? "rgba(255,255,255,0.8)" 
            : "rgba(15,23,42,0.8)",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
          border: `1px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`,
        }}
      >
        <div>
          <button
            onClick={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              background: isLight ? "#e2e8f0" : "#334155",
              color: textMain,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = isLight ? "#cbd5e1" : "#475569";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = isLight ? "#e2e8f0" : "#334155";
            }}
          >
            ← Back to Complaints
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: 700 }}>
            📸 Screenshot Viewer
          </h1>
          {complaintId && (
            <p style={{ margin: 0, fontSize: "14px", color: textSub }}>
              Complaint #{complaintId}
            </p>
          )}
          {studentName && (
            <p style={{ margin: 0, fontSize: "14px", color: textSub }}>
              From: {studentName}
            </p>
          )}
        </div>

        <div style={{ width: "150px" }} /> {/* Spacer for centering */}
      </div>

      {/* Image Container */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          minHeight: "calc(100vh - 140px)",
        }}
      >
        {!imageError ? (
          <img
            src={screenshotUrl}
            alt="Complaint screenshot"
            onError={handleImageError}
            style={{
              maxWidth: "100%",
              maxHeight: "calc(100vh - 160px)",
              borderRadius: "16px",
              boxShadow: isLight 
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                : "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
              border: `1px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`,
              objectFit: "contain",
            }}
          />
        ) : (
          <div
            style={{
              padding: "60px",
              background: isLight ? "#fee2e2" : "#7f1d1d",
              borderRadius: "16px",
              textAlign: "center",
              color: isLight ? "#dc2626" : "#ef4444",
            }}
          >
            <h3 style={{ marginBottom: "16px" }}>❌ Failed to Load Screenshot</h3>
            <p style={{ marginBottom: "20px" }}>The screenshot could not be loaded. It may have been moved or deleted.</p>
            <button
              onClick={handleBack}
              style={{
                padding: "12px 24px",
                background: isLight ? "#dc2626" : "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ← Go Back
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default ScreenshotViewer;
