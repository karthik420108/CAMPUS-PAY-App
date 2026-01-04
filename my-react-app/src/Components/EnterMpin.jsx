import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";

function EnterMpin() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [mpin, setMpin] = useState("");
  const [err, setErr] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [theme, setTheme] = useState("light");
  const isLight = theme === "light";

  if (!state) return <h2 style={{ textAlign: "center", marginTop: 40 }}>Invalid access</h2>;

  const { vendorId, amount, transactionId, userId, vName } = state;

  const showAlertOverlay = (message, type = "info") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  async function forgotMpin() {
    try {
      await axios.post("http://localhost:5000/send-mpin-otp", { userId });
      showAlertOverlay("OTP sent to institute email", "success");
      setTimeout(() => navigate("/forgot-mpin", { state: { userId } }), 1500);
    } catch {
      showAlertOverlay("Failed to send OTP", "error");
    }
  }

  async function confirmPayment() {
    try {
      setErr("");
      if (!mpin || mpin.length !== 6) {
        setErr("Enter a valid 6-digit MPIN");
        return;
      }

      const verify = await axios.post("http://localhost:5000/verify-upin", { userId, upin: mpin });
      if (!verify.data.valid) {
        setErr("Incorrect MPIN");
        return;
      }

      const balanceRes = await axios.post("http://localhost:5000/institute-balance");
      if (balanceRes.data.balance < amount) {
        await axios.post("http://localhost:5000/payment-mid", {
          userId, vendorId, amount: Number(amount), transactionId, Status: "FAILED",
        });
        setErr("Institute credits are insufficient");
        return;
      }

      await axios.post("http://localhost:5000/payment-mid", {
        userId, vendorId, amount: Number(amount), transactionId, Status: "SUCCESS",
      });

      const Datee = new Date().toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
      });

      showAlertOverlay("Payment Successful!", "success");
      setTimeout(() => {
        navigate("/payment-card", {
          state: { userId, vendorId, amount: Number(amount), txid: transactionId, Status: "SUCCESS", Datee, vName },
        });
      }, 1500);
    } catch (err) {
      setErr(err.response?.data?.message || "Payment failed");
    }
  }

  const pageStyle = isLight
    ? { backgroundColor: "#f3f4f6" }
    : {
        backgroundColor: "#020617",
        backgroundImage:
          "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.35), transparent 55%)," +
          "radial-gradient(circle at 100% 0%, rgba(56,189,248,0.3), transparent 55%)," +
          "radial-gradient(circle at 0% 100%, rgba(16,185,129,0.18), transparent 55%)," +
          "radial-gradient(circle at 100% 100%, rgba(37,99,235,0.32), transparent 55%)," +
          "linear-gradient(to right, rgba(15,23,42,0.9) 1px, transparent 1px)," +
          "linear-gradient(to bottom, rgba(15,23,42,0.9) 1px, transparent 1px)",
        backgroundSize: "cover, cover, cover, cover, 80px 80px, 80px 80px",
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
      {/* Orbs */}
      <motion.div style={{
          position: "absolute", width: 280, height: 280, borderRadius: "50%",
          background: isLight ? "radial-gradient(circle,#bfdbfe,#60a5fa,#1d4ed8)" :
                               "radial-gradient(circle,#3b82f6,#0ea5e9,#1d4ed8)",
          filter: "blur(60px)", opacity: 0.5, top: -100, left: -100
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
        transition={{ duration: 30, repeat: Infinity }}
      />
      <motion.div style={{
          position: "absolute", width: 260, height: 260, borderRadius: "50%",
          background: isLight ? "radial-gradient(circle,#bae6fd,#7dd3fc,#22c55e)" :
                               "radial-gradient(circle,#7dd3fc,#0ea5e9,#22c55e)",
          filter: "blur(50px)", opacity: 0.5, bottom: -100, right: -100
        }}
        animate={{ x: [0, -28, 12, 0], y: [0, -12, 20, 0] }}
        transition={{ duration: 28, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%", maxWidth: 480, borderRadius: 28, padding: "28px 24px 36px",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
          background: isLight
            ? "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(239,246,255,0.98))"
            : "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
          border: isLight ? "1px solid rgba(148,163,184,0.35)" : "1px solid rgba(148,163,184,0.45)",
          boxShadow: isLight
            ? "0 16px 38px rgba(15,23,42,0.18),0 0 0 1px rgba(148,163,184,0.28)"
            : "0 18px 55px rgba(15,23,42,0.85),0 0 0 1px rgba(30,64,175,0.65)",
          color: isLight ? "#0f172a" : "#e5e7eb", display: "flex", flexDirection: "column",
          gap: 24, alignItems: "center", textAlign: "center", position: "relative", overflow: "hidden"
        }}
      >
        {/* Accent line */}
        <motion.div style={{
          position: "absolute", left: 24, right: 24, top: 20, height: 2, borderRadius: 999,
          background: "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)", opacity: 0.9
        }}
        animate={{ x: [-10,10,-10] }}
        transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Theme toggle */}
        <div style={{
          position: "absolute", top: 34, right: 20, display: "flex", alignItems: "center",
          gap: 6, padding: "4px 6px", borderRadius: 999, border: "1px solid rgba(148,163,184,0.6)",
          background: isLight ? "#f9fafb" : "rgba(15,23,42,0.9)", zIndex: 5
        }}>
          <span style={{ color: "#6b7280", fontSize: 11 }}>Mode</span>
          <button
            onClick={() => setTheme(prev => prev==="light"?"dark":"light")}
            style={{
              border: "none", borderRadius: 999, padding: "3px 10px", cursor: "pointer",
              fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center",
              background: isLight ? "linear-gradient(120deg,#020617,#0f172a)" :
                                   "linear-gradient(120deg,#e5f2ff,#dbeafe)",
              color: isLight ? "#e5e7eb" : "#0f172a"
            }}
          >{isLight?"Dark":"Light"}</button>
        </div>

        <h2 style={{ marginTop: 50 }}>Enter MPIN</h2>
        <p>Paying ₹{Number(amount)} to {vName}</p>
        {err && <p style={{ color: "red" }}>{err}</p>}

        <input
          type="password" maxLength={6} value={mpin} placeholder="••••••"
          onChange={e => setMpin(e.target.value)}
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 14, border: "1px solid #94a3b8",
            fontSize: 18, textAlign: "center", outline: "none",
            background: isLight ? "#f9fafb" : "#1f2937", color: isLight ? "#0f172a" : "#f9fafb"
          }}
        />

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 18px rgba(59,130,246,0.85)" }}
          whileTap={{ scale: 0.97 }}
          onClick={confirmPayment}
          style={{
            width: "100%", padding: "12px 0", borderRadius: 14, border: "none",
            background: "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
            color: "#f9fafb", fontWeight: 600, fontSize: 15, cursor: "pointer"
          }}
        >
          Confirm
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 12px rgba(191,219,254,0.6)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(-1)}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 14, border: "1px solid #38bdf8",
            background: isLight ? "#f9fafb" : "#0f172a",
            color: isLight ? "#0f172a" : "#f9fafb", fontWeight: 500, fontSize: 15
          }}
        >
          Cancel
        </motion.button>

        <button
          onClick={forgotMpin}
          style={{ background: "transparent", color: "#3b82f6", border: "none", marginTop: 6 }}
        >
          Forgot MPIN?
        </button>
      </motion.div>

      {/* Alert Overlay */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center",
              alignItems: "center", zIndex: 9999
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: isLight ? "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(249,250,251,0.95))"
                                    : "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
                padding: "24px 32px", borderRadius: 16, border: "1px solid rgba(148,163,184,0.3)",
                boxShadow: "0 20px 60px rgba(15,23,42,0.15),0 0 0 1px rgba(148,163,184,0.2)",
                maxWidth: 400, textAlign: "center", color: isLight ? "#0f172a" : "#f9fafb"
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                {alertType === "success" && "✅"}
                {alertType === "error" && "❌"}
                {alertType === "warning" && "⚠️"}
                {alertType === "info" && "ℹ️"}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                {alertType === "success" && "Success"}
                {alertType === "error" && "Error"}
                {alertType === "warning" && "Warning"}
                {alertType === "info" && "Information"}
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5 }}>{alertMessage}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EnterMpin;
