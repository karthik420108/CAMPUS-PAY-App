import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import Header from "./Header3.jsx";
import Footer from "./Footer.jsx";
import API_CONFIG from "../config/api";

function ChangeMpin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {};

  const [step, setStep] = useState(1);
  const [oldMpin, setOldMpin] = useState("");
  const [newMpin, setNewMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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

  useEffect(() => {
    if (!userId) navigate("/");
  }, [userId, navigate]);

  // ===== THEME (same pattern as RaiseComplaint) =====
  const pageStyle = isLight
    ? {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        overflow: "hidden",
        position: "relative",
        background:
          "radial-gradient(circle at 0% 0%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 0%, #dbeafe 0, transparent 55%)," +
          "radial-gradient(circle at 0% 100%, #e0f2fe 0, transparent 55%)," +
          "radial-gradient(circle at 100% 100%, #d1fae5 0, transparent 55%)",
        backgroundColor: "#f3f4f6",
      }
    : {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        overflow: "hidden",
        position: "relative",
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
        borderRadius: 28,
        padding: "28px 24px 22px",
        width: "100%",
        maxWidth: 520,
        position: "relative",
        zIndex: 10,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }
    : {
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
        border: "1px solid rgba(148,163,184,0.45)",
        boxShadow:
          "0 18px 55px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
        borderRadius: 28,
        padding: "28px 24px 22px",
        width: "100%",
        maxWidth: 520,
        position: "relative",
        zIndex: 10,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      };

  const inputBase = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    fontSize: 15,
    outline: "none",
    transition: "all 0.25s ease",
    marginBottom: 16,
    fontWeight: 500,
  };

  const inputStyle = isLight
    ? {
        ...inputBase,
        border: "1px solid rgba(148,163,184,0.9)",
        background:
          "radial-gradient(circle at 0 0, rgba(219,234,254,0.9), transparent 70%), rgba(255,255,255,0.98)",
        boxShadow:
          "0 10px 24px rgba(15,23,42,0.10), inset 0 0 0 1px rgba(248,250,252,0.95)",
        color: textMain,
      }
    : {
        ...inputBase,
        border: "1px solid rgba(51,65,85,0.95)",
        background:
          "radial-gradient(circle at 0 0, rgba(30,64,175,0.38), transparent 70%), #020617",
        boxShadow:
          "0 12px 30px rgba(15,23,42,0.75), inset 0 0 0 1px rgba(15,23,42,0.9)",
        color: textMain,
      };

  const buttonBase = {
    width: "100%",
    padding: "12px 18px",
    borderRadius: 16,
    border: "none",
    fontWeight: 700,
    fontSize: 14,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  };

  const primaryButtonStyle = {
    ...buttonBase,
    background:
      "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
    backgroundSize: "220% 220%",
    color: "#f9fafb",
    boxShadow:
      "0 16px 40px rgba(59,130,246,0.35), 0 0 0 1px rgba(59,130,246,0.4)",
  };

  const secondaryButtonStyle = {
    ...buttonBase,
    marginTop: 10,
    background: isLight
      ? "linear-gradient(120deg,#64748b,#475569,#334155)"
      : "linear-gradient(120deg,#0f172a,#020617,#020617)",
    color: "#e5e7eb",
    boxShadow:
      "0 16px 40px rgba(100,116,139,0.3), 0 0 0 1px rgba(100,116,139,0.2)",
  };

  // ===== API handlers (unchanged) =====
  const handleVerifyOldMpin = async (e) => {
    e.preventDefault();

    if (oldMpin.length !== 6 || !/^\d+$/.test(oldMpin)) {
      setMessage("Please enter valid 6-digit MPIN");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        API_CONFIG.getUrl("/verify-old-mpin"),
        { userId, oldMpin }
      );

      if (response.data.success) {
        setMessage("");
        setStep(2);
      } else {
        setMessage(response.data.message || "Invalid MPIN");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewMpin = async (e) => {
    e.preventDefault();

    if (newMpin.length !== 6 || !/^\d+$/.test(newMpin)) {
      setMessage("New MPIN must be 6 digits");
      return;
    }

    if (newMpin !== confirmMpin) {
      setMessage("New MPIN and confirmation don't match");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(API_CONFIG.getUrl("/change-mpin"), {
        userId,
        newMpin,
      });

      if (response.data.success) {
        setSuccessMessage("MPIN changed successfully!");

        const userResponse = await axios.get(
          API_CONFIG.getUrl(`/user/${userId}`)
        );
        const userData = userResponse.data;

        setTimeout(() => {
          navigate("/login", {
            state: {
              username: userData.firstName,
              userId: userData._id,
              imageUrl: userData.ImageUrl,
              walletBalance: userData.walletBalance,
              instBalance: userData.instBalance || 0,
              isFrozen: userData.isFrozen || false,
              isSuspended: userData.isSuspended || false,
              userCreatedAt: userData.createdAt,
            },
          });
        }, 2000);
      } else {
        setMessage(response.data.message || "Failed to change MPIN");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to change MPIN");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotMpin = async () => {
    try {
      const response = await axios.post(API_CONFIG.getUrl("/send-mpin-otp"), {
        userId,
        role: "student",
      });
      
      // Show OTP in console for testing
      if (response.data.otp) {
        console.log(`🔢 MPIN OTP: ${response.data.otp}`);
        alert(`MPIN OTP: ${response.data.otp}`);
      }
      
      navigate("/forgot-mpin", { state: { userId, role: "student" , type : "u" } });
    } catch (error) {
      console.error("Error sending MPIN OTP:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to send OTP. Please try again.";
      alert(errorMessage);
    }
  };

  return (
    <>
      <Header theme={theme} setTheme={setTheme} />

      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        whileHover={{ scale: 1.02, boxShadow: "0 0 18px rgba(59,130,246,0.5)" }}
        whileTap={{ scale: 0.98 }}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "8px 14px",
          borderRadius: "14px",
          border: "none",
          background: "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
          color: "#f9fafb",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "14px",
          zIndex: 10,
        }}
      >
        ← Back
      </motion.button>

      <div style={pageStyle}>
        {/* orbs like RaiseComplaint */}
        <motion.div
          style={{
            position: "absolute",
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: isLight
              ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)"
              : "radial-gradient(circle at 30% 0%, #1d4ed8, #4f46e5, #020617)",
            filter: "blur(40px)",
            opacity: isLight ? 0.5 : 0.75,
            top: -40,
            left: -60,
            mixBlendMode: isLight ? "normal" : "screen",
            zIndex: 0,
            pointerEvents: "none",
          }}
          animate={{ x: [0, 30, -15, 0], y: [0, 18, -10, 0] }}
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
              : "radial-gradient(circle at 70% 80%, #22c55e, #0ea5e9, #020617)",
            filter: "blur(34px)",
            opacity: isLight ? 0.45 : 0.7,
            bottom: -40,
            right: -40,
            mixBlendMode: isLight ? "normal" : "screen",
            zIndex: 0,
            pointerEvents: "none",
          }}
          animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* card */}
        <motion.div
          style={cardStyle}
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: easingSoft }}
        >
          {/* theme toggle */}
          <div
            style={{
              position: "absolute",
              top: 14,
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

          {/* top accent */}
          <motion.div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
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
            style={{ textAlign: "center", marginTop: 16, marginBottom: 18 }}
          >
            <motion.div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background:
                  "linear-gradient(120deg,#8b5cf6,#7c3aed,#6d28d9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 32,
                boxShadow: "0 16px 40px rgba(139,92,246,0.3)",
              }}
              whileHover={{ scale: 1.05 }}
            >
              🔐
            </motion.div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                margin: 0,
                color: textMain,
                marginBottom: 6,
              }}
            >
              Change MPIN
            </h1>
            <p
              style={{
                margin: 0,
                color: textSub,
                fontSize: 14,
              }}
            >
              {step === 1 ? "Verify your current MPIN" : "Set your new MPIN"}
            </p>
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
              marginBottom: 10,
            }}
          />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.3, ease: easingSoft }}
              >
                <form onSubmit={handleVerifyOldMpin}>
                  <input
                    type="password"
                    value={oldMpin}
                    onChange={(e) => setOldMpin(e.target.value)}
                    placeholder="Enter current MPIN"
                    maxLength={6}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = isLight
                        ? "#8b5cf6"
                        : "#a78bfa";
                      e.target.style.boxShadow = isLight
                        ? "0 0 0 3px rgba(139,92,246,0.15)"
                        : "0 0 0 3px rgba(167,139,250,0.25)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isLight
                        ? "rgba(148,163,184,0.9)"
                        : "rgba(51,65,85,0.95)";
                      e.target.style.boxShadow = "none";
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleForgotMpin}
                    style={{
                      background: "none",
                      border: "none",
                      color: isLight ? "#8b5cf6" : "#a78bfa",
                      fontSize: 13,
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontWeight: 500,
                      marginBottom: 16,
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    Forgot MPIN?
                  </button>

                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: easingSoft }}
                        style={{
                          background: isLight ? "#fef2f2" : "#7f1d1d",
                          color: isLight ? "#dc2626" : "#fca5a5",
                          padding: "10px 14px",
                          borderRadius: 12,
                          fontSize: 13,
                          marginBottom: 16,
                          border: isLight
                            ? "1px solid rgba(220,38,38,0.2)"
                            : "1px solid rgba(248,113,113,0.3)",
                        }}
                      >
                        {message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...primaryButtonStyle,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                    whileHover={
                      !loading
                        ? {
                            scale: 1.02,
                            boxShadow:
                              "0 20px 50px rgba(59,130,246,0.55)",
                          }
                        : {}
                    }
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    animate={
                      !loading
                        ? {
                            backgroundPosition: [
                              "0% 50%",
                              "100% 50%",
                              "0% 50%",
                            ],
                          }
                        : {}
                    }
                    transition={{
                      duration: 3,
                      repeat: !loading ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  >
                    {loading ? "Verifying..." : "Verify MPIN"}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.3, ease: easingSoft }}
              >
                <form onSubmit={handleSetNewMpin}>
                  <input
                    type="password"
                    value={newMpin}
                    onChange={(e) => setNewMpin(e.target.value)}
                    placeholder="Enter new MPIN"
                    maxLength={6}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = isLight
                        ? "#8b5cf6"
                        : "#a78bfa";
                      e.target.style.boxShadow = isLight
                        ? "0 0 0 3px rgba(139,92,246,0.15)"
                        : "0 0 0 3px rgba(167,139,250,0.25)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isLight
                        ? "rgba(148,163,184,0.9)"
                        : "rgba(51,65,85,0.95)";
                      e.target.style.boxShadow = "none";
                    }}
                  />

                  <input
                    type="password"
                    value={confirmMpin}
                    onChange={(e) => setConfirmMpin(e.target.value)}
                    placeholder="Confirm new MPIN"
                    maxLength={6}
                    style={inputStyle}
                    onFocus={(e) => {
                      e.target.style.borderColor = isLight
                        ? "#8b5cf6"
                        : "#a78bfa";
                      e.target.style.boxShadow = isLight
                        ? "0 0 0 3px rgba(139,92,246,0.15)"
                        : "0 0 0 3px rgba(167,139,250,0.25)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = isLight
                        ? "rgba(148,163,184,0.9)"
                        : "rgba(51,65,85,0.95)";
                      e.target.style.boxShadow = "none";
                    }}
                  />

                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: easingSoft }}
                        style={{
                          background: isLight ? "#fef2f2" : "#7f1d1d",
                          color: isLight ? "#dc2626" : "#fca5a5",
                          padding: "10px 14px",
                          borderRadius: 12,
                          fontSize: 13,
                          marginBottom: 16,
                          border: isLight
                            ? "1px solid rgba(220,38,38,0.2)"
                            : "1px solid rgba(248,113,113,0.3)",
                        }}
                      >
                        {message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    style={{
                      ...primaryButtonStyle,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                    whileHover={
                      !loading
                        ? {
                            scale: 1.02,
                            boxShadow:
                              "0 20px 50px rgba(59,130,246,0.55)",
                          }
                        : {}
                    }
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    animate={
                      !loading
                        ? {
                            backgroundPosition: [
                              "0% 50%",
                              "100% 50%",
                              "0% 50%",
                            ],
                          }
                        : {}
                    }
                    transition={{
                      duration: 3,
                      repeat: !loading ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  >
                    {loading ? "Processing..." : "Change MPIN"}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setStep(1)}
                    style={secondaryButtonStyle}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ← Back
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* success banner (same as your version) */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: 20,
                right: 20,
                background:
                  "linear-gradient(120deg, #10b981, #059669, #047857)",
                color: "#ffffff",
                padding: "16px 24px",
                borderRadius: 16,
                boxShadow:
                  "0 16px 40px rgba(16,185,129,0.4), 0 0 0 1px rgba(16,185,129,0.3)",
                fontSize: 16,
                fontWeight: 600,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                gap: 12,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <span style={{ fontSize: 20 }}>✅</span>
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </>
  );
}

export default ChangeMpin;
