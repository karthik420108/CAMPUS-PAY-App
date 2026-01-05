import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

function Refund() {
  const { state } = useLocation();
  const { vendorId } = state || {};
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // Step 1: Gmail + Amount, Step 2: MPIN
  const [gmail, setGmail] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [mpin, setMpin] = useState("");
  const [availableAmount, setAvailableAmount] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");

  const isLight = theme === "light";

  // Theme styling
  const pageStyle = {
    minHeight: "100vh",
    background: isLight 
      ? "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
      : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    position: "relative",
    overflow: "hidden"
  };

  const cardStyle = {
    background: isLight 
      ? "rgba(255,255,255,0.95)"
      : "rgba(30,41,59,0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: isLight 
      ? "0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)"
      : "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)",
    border: isLight 
      ? "1px solid rgba(255,255,255,0.8)"
      : "1px solid rgba(255,255,255,0.1)",
    maxWidth: "480px",
    width: "100%",
    position: "relative",
    zIndex: 10
  };

  const inputStyle = {
    width: "100%",
    padding: "16px 20px",
    borderRadius: "16px",
    border: `2px solid ${isLight ? "rgba(148,163,184,0.3)" : "rgba(71,85,105,0.4)"}`,
    background: isLight 
      ? "rgba(255,255,255,0.8)"
      : "rgba(15,23,42,0.6)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    fontSize: "16px",
    color: isLight ? "#1e293b" : "#f1f5f9",
    outline: "none",
    transition: "all 0.3s ease",
    marginBottom: "20px",
    fontWeight: 500
  };

  const buttonStyle = {
    width: "100%",
    padding: "16px 24px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(120deg,#ef4444,#dc2626,#b91c1c)",
    backgroundSize: "220% 220%",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "16px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    boxShadow: "0 16px 40px rgba(239,68,68,0.4), 0 0 0 1px rgba(239,68,68,0.3)",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden"
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(120deg,#64748b,#475569,#334155)",
    boxShadow: "0 16px 40px rgba(100,116,139,0.3), 0 0 0 1px rgba(100,116,139,0.2)",
    marginTop: "12px"
  };

  // Fetch available amount from backend
  useEffect(() => {
    if (!vendorId) return;

    const fetchAmount = async () => {
      try {
        const res = await axios.post(
          `http://localhost:5000/amount/${vendorId}`
        );
        console.log(res);
        setAvailableAmount(res.data.totalAmount || 0);
      } catch (err) {
        console.error(err);
      }
    };
    console.log(vendorId);
    fetchAmount();
  }, [vendorId]);

  // Step 1: Validate Gmail and Refund Amount
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
    setStep(2); // Move to MPIN step
  };

  // Step 2: Submit MPIN
  const handleMpinSubmit = async (e) => {
    e.preventDefault();

    if (mpin.length !== 6 || !/^\d+$/.test(mpin)) {
      return setMessage("Enter valid 6-digit MPIN");
    }

    setLoading(true);
    setMessage("");
    
    const refundData = {
      vendorId, // matches backend
      amount: Number(refundAmount),
      mpin,
      email: gmail, // match the backend
    };
    
    console.log("Sending refund request:", refundData);
    
    try {
      // Frontend
      const response = await axios.post("http://localhost:5000/refund", refundData);
      console.log("Refund response:", response.data);

      navigate("/vendor-transaction", {state : {userId : vendorId , role : "vendor"}});
    } catch (err) {
      console.error("Refund error:", err.response?.data);
      setMessage(err.response?.data?.msg || "Refund failed");
    }
    setLoading(false);
  };

  // Forgot MPIN
  const forgotMpin = async () => {
    try {
      await axios.post("http://localhost:5000/send-mpin-otp", {
        userId: vendorId,
        role: "vendor",
      });
      navigate("/forgot-mpin", { state: { userId: vendorId, role: "vendor" } });
    } catch (err) {
      alert("Failed to send OTP");
      console.error(err);
    }
  };

  return (
    <div style={pageStyle}>
      {/* Background Orbs */}
      <motion.div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: isLight 
            ? "radial-gradient(circle at 30% 0%, #fca5a5, #ef4444, #dc2626)"
            : "radial-gradient(circle at 30% 0%, #fca5a5, #ef4444, #dc2626)",
          filter: "blur(80px)",
          opacity: 0.3,
          top: -100,
          right: -100,
          zIndex: 0,
          pointerEvents: "none"
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        style={cardStyle}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <motion.div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(120deg,#ef4444,#dc2626,#b91c1c)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "36px",
              boxShadow: "0 16px 40px rgba(239,68,68,0.3)"
            }}
            whileHover={{ scale: 1.05 }}
          >
            💰
          </motion.div>
          <h1 style={{ 
            fontSize: "28px", 
            fontWeight: 800, 
            margin: 0, 
            color: isLight ? "#1e293b" : "#f1f5f9",
            marginBottom: "8px"
          }}>
            Refund Money
          </h1>
          <p style={{ 
            margin: 0, 
            color: isLight ? "#64748b" : "#94a3b8",
            fontSize: "16px"
          }}>
            {step === 1 ? "Enter refund details" : "Verify with MPIN"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Available Amount Display */}
              <div style={{
                background: isLight 
                  ? "linear-gradient(120deg, #f0fdf4, #dcfce7)"
                  : "linear-gradient(120deg, #14532d, #166534)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "24px",
                textAlign: "center",
                border: isLight 
                  ? "1px solid rgba(34,197,94,0.2)"
                  : "1px solid rgba(34,197,94,0.3)"
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: "14px", 
                  color: isLight ? "#166534" : "#86efac",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em"
                }}>
                  Available Balance
                </p>
                <p style={{ 
                  margin: "8px 0 0", 
                  fontSize: "32px", 
                  fontWeight: 800,
                  color: isLight ? "#166534" : "#86efac"
                }}>
                  ₹{availableAmount}
                </p>
              </div>

              {/* Gmail Input */}
              <input
                type="email"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                placeholder="Enter customer's Gmail address"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = isLight ? "#ef4444" : "#f87171";
                  e.target.style.boxShadow = isLight
                    ? "0 0 0 3px rgba(239,68,68,0.1)"
                    : "0 0 0 3px rgba(248,113,113,0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isLight ? "rgba(148,163,184,0.3)" : "rgba(71,85,105,0.4)";
                  e.target.style.boxShadow = "none";
                }}
              />

              {/* Amount Input */}
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Enter refund amount"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = isLight ? "#ef4444" : "#f87171";
                  e.target.style.boxShadow = isLight
                    ? "0 0 0 3px rgba(239,68,68,0.1)"
                    : "0 0 0 3px rgba(248,113,113,0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isLight ? "rgba(148,163,184,0.3)" : "rgba(71,85,105,0.4)";
                  e.target.style.boxShadow = "none";
                }}
              />

              {/* Message Display */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      background: isLight ? "#fef2f2" : "#7f1d1d",
                      color: isLight ? "#dc2626" : "#fca5a5",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      marginBottom: "20px",
                      border: isLight 
                        ? "1px solid rgba(220,38,38,0.2)"
                        : "1px solid rgba(248,113,113,0.3)"
                    }}
                  >
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Next Button */}
              <motion.button
                onClick={handleNext}
                style={buttonStyle}
                whileHover={{ scale: 1.02, boxShadow: "0 20px 50px rgba(239,68,68,0.5)" }}
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
                Continue to MPIN →
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Summary */}
              <div style={{
                background: isLight ? "#f8fafc" : "#1e293b",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "24px",
                border: isLight 
                  ? "1px solid rgba(148,163,184,0.2)"
                  : "1px solid rgba(71,85,105,0.3)"
              }}>
                <h3 style={{ 
                  margin: "0 0 12px", 
                  fontSize: "16px", 
                  fontWeight: 600,
                  color: isLight ? "#1e293b" : "#f1f5f9"
                }}>
                  Refund Summary
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: isLight ? "#64748b" : "#94a3b8" }}>Email:</span>
                  <span style={{ color: isLight ? "#1e293b" : "#f1f5f9", fontWeight: 500 }}>{gmail}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: isLight ? "#64748b" : "#94a3b8" }}>Amount:</span>
                  <span style={{ color: "#ef4444", fontWeight: 700, fontSize: "18px" }}>₹{refundAmount}</span>
                </div>
              </div>

              {/* MPIN Input */}
              <input
                type="password"
                value={mpin}
                onChange={(e) => setMpin(e.target.value)}
                maxLength={6}
                placeholder="Enter 6-digit MPIN"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = isLight ? "#ef4444" : "#f87171";
                  e.target.style.boxShadow = isLight
                    ? "0 0 0 3px rgba(239,68,68,0.1)"
                    : "0 0 0 3px rgba(248,113,113,0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isLight ? "rgba(148,163,184,0.3)" : "rgba(71,85,105,0.4)";
                  e.target.style.boxShadow = "none";
                }}
              />

              {/* Message Display */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{
                      background: isLight ? "#fef2f2" : "#7f1d1d",
                      color: isLight ? "#dc2626" : "#fca5a5",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      marginBottom: "20px",
                      border: isLight 
                        ? "1px solid rgba(220,38,38,0.2)"
                        : "1px solid rgba(248,113,113,0.3)"
                    }}
                  >
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                onClick={handleMpinSubmit}
                disabled={loading}
                style={{
                  ...buttonStyle,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
                whileHover={!loading ? { scale: 1.02, boxShadow: "0 20px 50px rgba(239,68,68,0.5)" } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                animate={!loading ? {
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                } : {}}
                transition={{
                  duration: 3,
                  repeat: !loading ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                {loading ? "Processing..." : "Process Refund"}
              </motion.button>

              {/* Back Button */}
              <motion.button
                onClick={() => setStep(1)}
                style={secondaryButtonStyle}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ← Back to Details
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forgot MPIN */}
        {step === 2 && (
          <motion.div
            style={{ textAlign: "center", marginTop: "20px" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={forgotMpin}
              style={{
                background: "none",
                border: "none",
                color: isLight ? "#ef4444" : "#f87171",
                fontSize: "14px",
                cursor: "pointer",
                textDecoration: "underline",
                fontWeight: 500
              }}
            >
              Forgot MPIN?
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default Refund;
