import { useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header3";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import API_CONFIG from "../config/api";

function GenerateQR() {
  const { state } = useLocation();
  const { vendorId } = state || {};
  const Navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [qrData, setQrData] = useState(null);
  const [qrId, setQrId] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gamount, setGamount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
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
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success"); // success, error, warning, info

  const timerRef = useRef(null);
  const pollRef = useRef(null);

  const easingSoft = [0.16, 1, 0.3, 1];
  const isLight = theme === "light";

  // Helper function to show alerts
  const showAlertOverlay = (message, type = "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // ---------- SAME THEME-DEPENDENT STYLES as RaiseComplaint ----------
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

  const inputStyle = isLight
    ? {
        background:
          "radial-gradient(circle at 0 0, rgba(219,234,254,0.9), transparent 70%), rgba(255,255,255,0.98)",
        border: "1px solid rgba(148,163,184,0.9)",
        boxShadow:
          "0 10px 24px rgba(15,23,42,0.10), inset 0 0 0 1px rgba(248,250,252,0.95)",
      }
    : {
        background:
          "radial-gradient(circle at 0 0, rgba(30,64,175,0.38), transparent 70%), #020617",
        border: "1px solid rgba(51,65,85,0.95)",
        boxShadow:
          "0 12px 30px rgba(15,23,42,0.75), inset 0 0 0 1px rgba(15,23,42,0.9)",
      };

  const qrBoxStyle = isLight
    ? {
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(239,246,255,0.98))",
        border: "1px solid rgba(209,213,219,0.9)",
        boxShadow: "inset 0 0 0 1px rgba(248,250,252,0.96)",
      }
    : {
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(15,23,42,1))",
        border: "1px solid rgba(30,64,175,0.8)",
        boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.95)",
      };

  // --------------------- QR LOGIC (unchanged) ---------------------
  const generateQR = async () => {
    if (!amount || amount <= 0) {
      showAlertOverlay("Enter valid amount", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(API_CONFIG.getUrl("/vendor/create-qr"), {
        vendorId,
        amount,
      });

      if (qrId) await cancelCurrentQR(qrId, false);

      setQrData(res.data.qrText);
      setGamount(res.data.amount);
      setQrId(res.data.qrId);
      setIsLocked(true);

      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);

      const expiryTime = new Date(res.data.expiresAt).getTime();

      timerRef.current = setInterval(() => {
        const diff = Math.floor((expiryTime - Date.now()) / 1000);
        if (diff <= 0) {
          clearInterval(timerRef.current);
          expireQR(res.data.qrId);
          setTimeLeft(0);
        } else {
          setTimeLeft(diff);
        }
      }, 1000);

      pollRef.current = setInterval(async () => {
        if (!res.data.qrId) return;
        try {
          const statusRes = await axios.get(API_CONFIG.getUrl(`/vendor/qr-status/${res.data.qrId}`));
          const status = statusRes.data.status;

          if (status === "SUCCESS") {
            clearInterval(timerRef.current);
            clearInterval(pollRef.current);
            showAlertOverlay("Payment Successful!", "success");
            resetQR(false);
          } else if (status === "EXPIRED" || status === "FAILED") {
            clearInterval(timerRef.current);
            clearInterval(pollRef.current);
            showAlertOverlay(`QR ${status}`, "warning");
            resetQR(false);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    } catch (err) {
      console.error("Generate QR error:", err);
      showAlertOverlay("Failed to generate QR", "error");
    } finally {
      setLoading(false);
    }
  };

  const cancelCurrentQR = async (currentQrId, resetAmount = true) => {
    if (!currentQrId) return;
    try {
      await axios.post(API_CONFIG.getUrl(`/vendor/cancel-qr/${currentQrId}`), { qrId: currentQrId });
      resetQR(resetAmount);
    } catch (err) {
      console.error("Cancel QR error:", err);
    }
  };

  const expireQR = async (currentQrId) => {
    if (!currentQrId) return;
    try {
      await axios.post(API_CONFIG.getUrl("/vendor/expire-qr"), { qrId: currentQrId });
    } catch (err) {
      console.error("Expire QR error:", err);
    } finally {
      resetQR(false);
    }
  };

  const resetQR = (resetAmount = true) => {
    setQrData(null);
    setQrId(null);
    setIsLocked(false);
    if (resetAmount) setAmount("");
    setTimeLeft(0);
    if (timerRef.current) clearInterval(timerRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  const handleGenerateAnother = async () => {
    if (qrId) await cancelCurrentQR(qrId, false);
    generateQR();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Header role="vendor" theme={theme} setTheme={setTheme} />
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
        {/* Back Button - Top Left, Theme Matching */}
        <motion.button
          onClick={() => Navigate(-1)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            position: "absolute",
            top: 28,
            left: 28,
            padding: "10px 16px",
            borderRadius: 16,
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            zIndex: 10,
            background: isLight
              ? "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.95))"
              : "linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.95))",
            color: textMain,
            boxShadow: isLight
              ? "0 8px 24px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.3)"
              : "0 10px 28px rgba(15,23,42,0.8), 0 0 0 1px rgba(30,64,175,0.4)",
            backdropFilter: "blur(12px)",
          }}
        >
          ← Back
        </motion.button>

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

        {/* MAIN CARD - same style as RaiseComplaint */}
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
            display: "flex",
            flexDirection: "column",
            gap: 24,
            position: "relative",
            overflow: "hidden",
            ...cardStyle,
          }}
        >
          {/* top accent line */}
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

          {/* header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: easingSoft }}
            style={{
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: textSub,
                marginBottom: 8,
              }}
            >
              Payment Gateway
            </div>
            <h2
              style={{
                fontSize: 28,
                letterSpacing: "0.05em",
                fontWeight: 800,
                color: textMain,
                margin: 0,
              }}
            >
              Generate QR Code
            </h2>
          </motion.div>

          {/* inner gradient line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.45, ease: easingSoft }}
            style={{
              height: 1,
              borderRadius: 999,
              background: isLight
                ? "linear-gradient(90deg,transparent,#dbeafe,#93c5fd,transparent)"
                : "linear-gradient(90deg,transparent,#1e293b,#0f172a,transparent)",
              marginBottom: 6,
            }}
          />

          {/* Amount Input */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4, ease: easingSoft }}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <label style={{ fontSize: 13, color: textMain, fontWeight: 600 }}>
              Enter Amount
            </label>
            <motion.input
              type="number"
              placeholder="Enter amount"
              value={amount}
              disabled={isLocked}
              onChange={(e) => setAmount(e.target.value)}
              whileFocus={{
                boxShadow: `0 0 0 1px ${isLight ? "#60a5fa" : "#38bdf8"}`,
                scale: 1.01,
              }}
              style={{
                padding: "14px 16px",
                borderRadius: 16,
                fontSize: 16,
                outline: "none",
                color: textMain,
                ...inputStyle,
              }}
            />
          </motion.div>
          
          {/* Generate Button or QR Display */}
          {!qrData ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.4, ease: easingSoft }}
            >
              <motion.button
                onClick={generateQR}
                disabled={loading}
                whileHover={
                  !loading
                    ? {
                        scale: 1.02,
                        boxShadow: "0 0 24px rgba(59,130,246,0.6)",
                      }
                    : {}
                }
                whileTap={!loading ? { scale: 0.97 } : {}}
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  borderRadius: 20,
                  border: "none",
                  background:
                    "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
                  backgroundSize: "220% 220%",
                  color: "#f9fafb",
                  fontWeight: 700,
                  cursor: loading ? "wait" : "pointer",
                  fontSize: 16,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 16px 40px rgba(59,130,246,0.4), 0 0 0 1px rgba(59,130,246,0.3)",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {loading ? "Generating..." : "Generate QR"}
              </motion.button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="qr-content"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: easingSoft }}
                style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}
              >
                {/* QR Box */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4, ease: easingSoft }}
                  style={{
                    padding: "32px 28px",
                    borderRadius: 24,
                    textAlign: "center",
                    ...qrBoxStyle,
                  }}
                >
                  <QRCode value={qrData} size={220} />
                </motion.div>

                {/* Amount & Timer */}
                <motion.div
                  style={{
                    textAlign: "center",
                    gap: 8,
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4, ease: easingSoft }}
                >
                  <p style={{ fontSize: 18, fontWeight: 700, color: textMain, margin: 0 }}>
                    Amount: ₹{gamount.toLocaleString()}
                  </p>
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: timeLeft < 60 ? "#ef4444" : textMain,
                      margin: 0,
                    }}
                  >
                    Expires in: {formatTime(timeLeft)}
                  </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  style={{
                    display: "flex",
                    gap: 12,
                    width: "100%",
                  }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4, ease: easingSoft }}
                >
                  <motion.button
                    onClick={handleGenerateAnother}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      borderRadius: 16,
                      border: "none",
                      background:
                        "linear-gradient(135deg,#3b82f6,#0ea5e9)",
                      color: "#f9fafb",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 14,
                      letterSpacing: "0.05em",
                    }}
                  >
                    🔄 New QR
                  </motion.button>
                  <motion.button
                    onClick={() => cancelCurrentQR(qrId)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      borderRadius: 16,
                      border: `1px solid ${isLight ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.6)"}`,
                      background: isLight
                        ? "rgba(248,113,113,0.1)"
                        : "rgba(127,29,29,0.4)",
                      color: isLight ? "#dc2626" : "#fecaca",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 14,
                      letterSpacing: "0.05em",
                    }}
                  >
                    ❌ Cancel
                  </motion.button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </motion.div>

      {/* Alert Overlay */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: isLight
                  ? "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(249,250,251,0.95))"
                  : "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(15,23,42,0.95))",
                padding: "24px 32px",
                borderRadius: "16px",
                border: isLight
                  ? "1px solid rgba(148,163,184,0.3)"
                  : "1px solid rgba(148,163,184,0.5)",
                boxShadow: isLight
                  ? "0 20px 60px rgba(15,23,42,0.15), 0 0 0 1px rgba(148,163,184,0.2)"
                  : "0 20px 60px rgba(15,23,42,0.4), 0 0 0 1px rgba(30,64,175,0.6)",
                maxWidth: "400px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "16px",
                }}
              >
                {alertType === "success" && "✅"}
                {alertType === "error" && "❌"}
                {alertType === "warning" && "⚠️"}
                {alertType === "info" && "ℹ️"}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: isLight ? "#1f2937" : "#f3f4f6",
                  marginBottom: "8px",
                }}
              >
                {alertType === "success" && "Success"}
                {alertType === "error" && "Error"}
                {alertType === "warning" && "Warning"}
                {alertType === "info" && "Information"}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: isLight ? "#6b7280" : "#9ca3af",
                  lineHeight: "1.5",
                }}
              >
                {alertMessage}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default GenerateQR;
