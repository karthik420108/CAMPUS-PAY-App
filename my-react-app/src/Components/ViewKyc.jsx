import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ViewKyc() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState("light");

  // Get KYC data from location state
  const kycUrl = location.state?.kycUrl;
  const vendorName = location.state?.vendorName;
  const complaintId = location.state?.complaintId;

  useEffect(() => {
    // Check system theme preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
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

  if (!kycUrl) {
    return (
      <div
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
          <h2 style={{ marginBottom: "20px" }}>No KYC Document Available</h2>
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
      </div>
    );
  }

  return (
    <div
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
            ← Back to KYC List
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "20px", fontWeight: 700 }}>
            📋 KYC Document Viewer
          </h1>
          {vendorName && (
            <p style={{ margin: 0, fontSize: "14px", color: textSub }}>
              Vendor: {vendorName}
            </p>
          )}
        </div>

        <div style={{ width: "150px" }} /> {/* Spacer for centering */}
      </div>

      {/* KYC Image Container */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: isLight 
              ? "rgba(255,255,255,0.9)" 
              : "rgba(15,23,42,0.9)",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: isLight 
              ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              : "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            border: `1px solid ${isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"}`,
            textAlign: "center",
          }}
        >
          <img
            src={kycUrl}
            alt="KYC Document"
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              borderRadius: "12px",
              border: `2px solid ${isLight ? "#e5e7eb" : "#334155"}`,
              boxShadow: isLight 
                ? "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                : "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
            }}
          />
          
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => window.open(kycUrl, '_blank')}
              style={{
                padding: "12px 24px",
                background: isLight ? "#3b82f6" : "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isLight ? "#2563eb" : "#1d4ed8";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = isLight ? "#3b82f6" : "#2563eb";
              }}
            >
              🔗 Open in New Tab
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div
          style={{
            background: isLight 
              ? "rgba(59, 130, 246, 0.1)" 
              : "rgba(59, 130, 246, 0.2)",
            borderRadius: "12px",
            padding: "20px",
            border: `1px solid ${isLight ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.3)"}`,
            maxWidth: "600px",
            textAlign: "center",
          }}
        >
          <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 700, color: textMain }}>
            📄 KYC Document Information
          </h3>
          <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: textSub, lineHeight: "1.5" }}>
            This is the official KYC (Know Your Customer) document submitted by the vendor. 
            Please verify the authenticity and completeness of the information provided.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginTop: "12px" }}>
            <div style={{ 
              padding: "8px 16px", 
              background: isLight ? "#f8fafc" : "#0f172a", 
              borderRadius: "8px", 
              fontSize: "12px", 
              color: textSub 
            }}>
              <strong>Vendor:</strong> {vendorName || "Unknown"}
            </div>
            <div style={{ 
              padding: "8px 16px", 
              background: isLight ? "#f8fafc" : "#0f172a", 
              borderRadius: "8px", 
              fontSize: "12px", 
              color: textSub 
            }}>
              <strong>Document:</strong> KYC Verification
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewKyc;
