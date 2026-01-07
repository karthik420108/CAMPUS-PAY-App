import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header1 from "./Header1";
import SuspensionBanner from "./SuspensionBanner";
import { useVendorStatus } from "../hooks/useVendorStatus";
import Header from "./Header3";
import { useAlert } from "../context/AlertContext";

export default function RedeemForm() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { vendorId: userId } = state || {};
  const { showAlert } = useAlert();

  const [amount, setAmount] = useState("");
  const [mpin, setMpin] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
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
  
  // Use vendor status hook for real-time monitoring
  const { showSuspensionBanner } = useVendorStatus(userId);

  /* ---------------- FETCH BALANCE ---------------- */
  useEffect(() => {
    if (!userId) return;

    const fetchAmount = async () => {
      try {
        const res = await axios.post(`http://localhost:5000/amount/${userId}`);
        setTotalAmount(res.data.totalAmount || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAmount();
  }, [userId]);

  /* ---------------- HANDLERS ---------------- */
  const handleAmountSubmit = (e) => {
    e.preventDefault();
    const value = Number(amount);

    if (!value || value <= 0) return setMessage("Enter valid amount");
    if (value > totalAmount) return setMessage("Insufficient balance");

    setMessage("");
    setStep(2);
  };

  const handleMpinSubmit = async (e) => {
    e.preventDefault();

    if (mpin.length !== 6) {
      return setMessage("Enter valid 6-digit MPIN");
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/redeem/request", {
        userId,
        amount: Number(amount),
        mpin,
      });

      navigate("/redeem-history", {
        state: { vendorId: userId, role: "vendor" },
      });
    } catch (err) {
      setMessage(err.response?.data?.error || "Redeem failed");
    }
    setLoading(false);
  };

  const forgotMpin = async () => {
    try {
      await axios.post("http://localhost:5000/send-mpin-otp", {
        userId,
        role: "vendor",
      });
      navigate("/forgot-mpin", { state: { userId, role: "vendor" } });
    } catch {
      showAlert({
        type: "error",
        title: "OTP Failed",
        message: "Failed to send OTP"
      });
    }
  };

  const easingSoft = [0.16, 1, 0.3, 1];

  // ✨ EXACT RaiseComplaint THEME STYLES
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

  const errorColor = isLight ? "#b91c1c" : "#fecaca";

  return (
    <>
      <Header1 role="vendor" userId={userId} />
      <Header theme={theme} setTheme={setTheme} />
      <SuspensionBanner show={showSuspensionBanner} />

      <motion.div
        style={{
          minHeight: "100vh",
          padding: "32px 20px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          position: "relative",
          overflow: "hidden",
          ...pageStyle,
        }}
      >
        {/* ✨ Background Orbs */}
        <motion.div
          style={{
            position: "absolute",
            width: 230,
            height: 230,
            borderRadius: "50%",
            background: isLight
              ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)"
              : "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)",
            filter: "blur(40px)",
            opacity: 0.5,
            top: -40,
            left: -60,
            mixBlendMode: isLight ? "normal" : "screen",
            zIndex: 0,
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
            opacity: 0.45,
            bottom: -40,
            right: -40,
            mixBlendMode: isLight ? "normal" : "screen",
            zIndex: 0,
          }}
          animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ✨ Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: easingSoft }}
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 28,
            padding: "32px 28px 24px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: textMain,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "relative",
            overflow: "hidden",
            zIndex: 10,
            ...cardStyle,
          }}
        >
          {/* ✨ Top Accent */}
          <motion.div
            style={{
              position: "absolute",
              left: 28,
              right: 28,
              top: 12,
              height: 2,
              borderRadius: 999,
              background:
                "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
              opacity: 0.9,
            }}
            animate={{ x: [-8, 8, -8] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ✨ Title & Balance */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: easingSoft }}
          >
            <h3
              style={{
                fontSize: 24,
                letterSpacing: "0.05em",
                fontWeight: 700,
                color: textMain,
                margin: "0 0 12px 0",
              }}
            >
              Redeem
            </h3>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.12 }}
              style={{
                fontSize: 14,
              }}
            >
              Available Balance: <b style={{ fontSize: 18, color: "#16a34a" }}>₹{totalAmount}</b>
            </motion.p>
          </motion.div>

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
              margin: "0 4px 16px",
            }}
          />

          {/* ✨ STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleAmountSubmit}>
              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                type="number"
                placeholder="Enter redeem amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                whileFocus={{
                  boxShadow: `0 0 0 1px ${isLight ? "#60a5fa" : "#38bdf8"}`,
                  scale: 1.01,
                }}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  fontSize: 16,
                  outline: "none",
                  marginBottom: "20px",
                  color: textMain,
                  ...inputStyle,
                }}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: 16,
                  border: "none",
                  background: "linear-gradient(120deg,#2563eb,#3b82f6)",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: 14,
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
                }}
              >
                Next
              </motion.button>
            </form>
          )}

          {/* ✨ STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleMpinSubmit}>
              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                type="password"
                maxLength={6}
                placeholder="Enter 6-digit MPIN"
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
                whileFocus={{
                  boxShadow: `0 0 0 1px ${isLight ? "#60a5fa" : "#38bdf8"}`,
                  scale: 1.01,
                }}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 14,
                  fontSize: 18,
                  letterSpacing: "0.2em",
                  textAlign: "center",
                  outline: "none",
                  marginBottom: "20px",
                  color: textMain,
                  fontWeight: 600,
                  fontFamily: "monospace",
                  ...inputStyle,
                }}
              />
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: 16,
                  border: "none",
                  background: loading ? "#6b7280" : "linear-gradient(120deg,#16a34a,#22c55e)",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: 14,
                  cursor: loading ? "wait" : "pointer",
                  letterSpacing: "0.05em",
                  boxShadow: loading 
                    ? "0 8px 24px rgba(107,114,128,0.4)" 
                    : "0 8px 24px rgba(22,163,74,0.4)",
                }}
              >
                {loading ? "Processing..." : "Confirm Redeem"}
              </motion.button>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "16px",
                  gap: 12,
                }}
              >
                <motion.button
                  type="button"
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(148,163,184,0.6)",
                    background: "transparent",
                    color: textMain,
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  ← Back
                </motion.button>
                <motion.button
                  type="button"
                  onClick={forgotMpin}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(37,99,235,0.6)",
                    background: "transparent",
                    color: "#2563eb",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Forgot MPIN?
                </motion.button>
              </div>
            </form>
          )}

          {/* ✨ Error Message */}
          <AnimatePresence>
            {message && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: easingSoft }}
                style={{
                  marginTop: "20px",
                  color: errorColor,
                  fontSize: 13,
                  textAlign: "center",
                  fontWeight: 500,
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: isLight 
                    ? "rgba(248,113,113,0.1)" 
                    : "rgba(254,202,202,0.15)",
                  border: `1px solid ${errorColor}40`,
                }}
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}
