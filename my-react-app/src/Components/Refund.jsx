import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import { useAlert } from "../context/AlertContext";

function Refund() {
  const { state } = useLocation();
  const { vendorId } = state || {};
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [step, setStep] = useState(1);
  const [gmail, setGmail] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [mpin, setMpin] = useState("");
  const [availableAmount, setAvailableAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");

  const isLight = theme === "light";
  const easingSoft = [0.16, 1, 0.3, 1];

  // fetch available amount
  useEffect(() => {
    if (!vendorId) return;

    const fetchAmount = async () => {
      try {
        const res = await axios.post(
          `http://localhost:5000/amount/${vendorId}`
        );
        setAvailableAmount(res.data.totalAmount || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAmount();
  }, [vendorId]);

  // theme styles (same pattern as other screens)
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

  // validation step 1
  const handleNext = () => {
    if (!gmail.includes("@")) {
      setMessage("Please enter a valid Gmail address.");
      return;
    }

    if (Number(refundAmount) <= 0) {
      setMessage("Refund amount must be greater than 0.");
      return;
    }

    if (Number(refundAmount) > availableAmount) {
      setMessage(
        `Refund amount cannot exceed available amount: ₹${availableAmount}`
      );
      return;
    }

    setMessage("");
    setStep(2);
  };

  // submit mpin
  const handleMpinSubmit = async (e) => {
    e.preventDefault();

    if (mpin.length !== 6 || !/^\d+$/.test(mpin)) {
      return setMessage("Enter valid 6-digit MPIN");
    }

    setLoading(true);
    setMessage("");
    try {
      await axios.post("http://localhost:5000/refund", {
        vendorId,
        amount: Number(refundAmount),
        mpin,
        email: gmail,
      });

      navigate("/vendor-transaction", {
        state: { userId: vendorId, role: "vendor" },
      });
    } catch (err) {
      setMessage(err.response?.data?.msg || "Redeem failed");
    }
    setLoading(false);
  };

  const forgotMpin = async () => {
    try {
      await axios.post("http://localhost:5000/send-mpin-otp", {
        userId: vendorId,
        role: "vendor",
      });
      navigate("/forgot-mpin", { state: { userId: vendorId, role: "vendor" } });
    } catch (err) {
      showAlert({
        type: "error",
        title: "OTP Failed",
        message: "Failed to send OTP"
      });
      console.error(err);
    }
  };

  return (
    <div style={pageStyle}>
      <button onClick = {()=>navigate(-1)}>Back</button>
      {/* orbs */}
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
        {/* mode toggle */}
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
                "linear-gradient(120deg,#0ea5e9,#22c55e,#16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: 32,
              boxShadow: "0 16px 40px rgba(34,197,94,0.3)",
            }}
            whileHover={{ scale: 1.05 }}
          >
            💸
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
            Refund Amount
          </h1>
          <p
            style={{
              margin: 0,
              color: textSub,
              fontSize: 14,
            }}
          >
            {step === 1
              ? "Enter refund details"
              : "Confirm refund with your MPIN"}
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

        {/* available amount */}
        <div
          style={{
            marginBottom: 16,
            fontSize: 14,
            color: textSub,
            textAlign: "center",
          }}
        >
          Available Amount:{" "}
          <span style={{ color: textMain, fontWeight: 700 }}>
            ₹{availableAmount}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.3, ease: easingSoft }}
            >
              <input
                type="email"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                placeholder="Enter your Gmail"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = isLight
                    ? "#0ea5e9"
                    : "#38bdf8";
                  e.target.style.boxShadow = isLight
                    ? "0 0 0 3px rgba(14,165,233,0.16)"
                    : "0 0 0 3px rgba(56,189,248,0.28)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isLight
                    ? "rgba(148,163,184,0.9)"
                    : "rgba(51,65,85,0.95)";
                  e.target.style.boxShadow = "none";
                }}
              />

              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Enter refund amount"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = isLight
                    ? "#22c55e"
                    : "#4ade80";
                  e.target.style.boxShadow = isLight
                    ? "0 0 0 3px rgba(34,197,94,0.18)"
                    : "0 0 0 3px rgba(74,222,128,0.28)";
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
                type="button"
                onClick={handleNext}
                style={primaryButtonStyle}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 20px 50px rgba(59,130,246,0.55)",
                }}
                whileTap={{ scale: 0.98 }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Next
              </motion.button>
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
              <input
                type="password"
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
                maxLength={6}
                placeholder="Enter 6-digit MPIN"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = isLight
                    ? "#8b5cf6"
                    : "#a78bfa";
                  e.target.style.boxShadow = isLight
                    ? "0 0 0 3px rgba(139,92,246,0.16)"
                    : "0 0 0 3px rgba(167,139,250,0.26)";
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
                onClick={handleMpinSubmit}
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
                        boxShadow: "0 20px 50px rgba(34,197,94,0.55)",
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
                {loading ? "Processing..." : "Submit"}
              </motion.button>

              <motion.button
                type="button"
                onClick={forgotMpin}
                style={secondaryButtonStyle}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Forgot MPIN?
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Refund;
