import { useState , useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import axios from 'axios'

function TransactionDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [vendorName , setvendorName] = useState("");

  const txn = state?.txn;
  console.log('Transaction data:', txn);
  console.log('User data:', txn?.userId);
  console.log('First name:', txn?.userId?.firstName);
  console.log('Last name:', txn?.userId?.lastName);
  console.log('Email:', txn?.userId?.email);

  const [theme, setTheme] = useState("light"); // "light" | "dark"

  if (!txn) {
    return (
      <div style={{ padding: 20 }}>
        <p>Transaction data not found. Please go back.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }
  const txid = txn.txid;
  console.log("trnsa"+txid)
  useEffect(() => {
  const fetchVendor = async () => {
    if (!txid) return navigate(-1);

    try {
      const res = await axios.post("http://localhost:5000/vn", { txid });
      setvendorName(res.data)
    } catch (err) {
      console.error(err);
    }
  };

  fetchVendor();
}, [txid, navigate]);


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
      {/* Soft background orbs */}
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

      {/* Back Button */}
      <motion.button
        type="button"
        onClick={() => navigate(-1)}
        whileHover={{ scale: 1.02, boxShadow: "0 0 18px rgba(129,140,248,0.85)" }}
        whileTap={{ scale: 0.97 }}
        style={{
          position: "absolute",
          top: 30,
          left: 30,
          padding: "12px 18px",
          borderRadius: 14,
          border: "none",
          background: "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
          backgroundSize: "220% 220%",
          color: "#f9fafb",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: 14,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          zIndex: 100,
          boxShadow: "0 12px 32px rgba(59,130,246,0.4)",
        }}
      >
        <span style={{ fontSize: 18 }}>←</span>
        Back
      </motion.button>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: easingSoft }}
        style={{
          width: "100%",
          maxWidth: 650,
          borderRadius: 28,
          padding: "26px 22px 20px",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          color: textMain,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          position: "relative",
          overflow: "hidden",
          ...cardStyle,
        }}
      >
        {/* Theme toggle button */}
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
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
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

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: textSub }}>
            Transaction
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: textMain }}>Transaction Details</h2>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            borderRadius: 999,
            background: isLight
              ? "linear-gradient(90deg,transparent,#dbeafe,#93c5fd,transparent)"
              : "linear-gradient(90deg,transparent,#1e293b,#0f172a,transparent)",
            marginBottom: 8,
          }}
        />

        {/* Transaction Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* TXID */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
            <span style={{ fontWeight: 600, color: textSub, fontSize: 13 }}>TXID</span>
            <div
              style={{
                fontSize: 13,
                fontFamily: "monospace",
                color: textMain,
                wordBreak: "break-all",
                padding: "10px 14px",
                background: isLight ? "rgba(219,234,254,0.6)" : "rgba(30,64,175,0.2)",
                borderRadius: 12,
                border: `1px solid ${isLight ? "rgba(148,163,184,0.4)" : "rgba(51,65,85,0.6)"}`,
              }}
            >
              {txn.txid}
            </div>
          </div>

          {/* Amount */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: textSub, fontSize: 13 }}>Amount</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#059669" }}>₹{txn.amount}</div>
          </div>

          {/* Status */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: textSub, fontSize: 13 }}>Status</span>
            <div
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                background:
                  txn.status === "SUCCESS"
                    ? "linear-gradient(135deg, #dcfce7, #bbf7d0)"
                    : txn.status === "PENDING"
                    ? "linear-gradient(135deg, #fef3c7, #e0ab0cff)"
                    : "linear-gradient(135deg, #fee2e2, #fecaca)",
                color:
                  txn.status === "SUCCESS"
                    ? "#166534"
                    : txn.status === "PENDING"
                    ? "#92400e"
                    : "#991b1b",
                minWidth: 100,
                textAlign: "center",
              }}
            >
              {txn.status.toUpperCase()}
            </div>
          </div>

          {/* User */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
            <span style={{ fontWeight: 600, color: textSub, fontSize: 13 }}>User</span>
            <div style={{ fontSize: 15, color: textMain, fontWeight: 500 }}>
              {txn.userId?.firstName} {txn.userId?.lastName}
            </div>
          </div>

          {/* Email */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
            <span style={{ fontWeight: 600, color: textSub, fontSize: 13 }}>Email</span>
            <div style={{ fontSize: 15, color: textMain, fontWeight: 500 }}>
              {txn.userId?.collegeEmail || txn.userId?.email || txn.userId?.Email || "No Email"}
            </div>
          </div>

          {/* Vendor */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
            <span style={{ fontWeight: 600, color: textSub, fontSize: 13 }}>Vendor</span>
            <div style={{ fontSize: 15, color: textMain, fontWeight: 500 }}>{vendorName}</div>
          </div>

          {/* Created */}
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
            <span style={{ fontWeight: 600, color: textSub, fontSize: 13 }}>Created</span>
            <div style={{ fontSize: 14, color: textMain }}>{new Date(txn.createdAt).toLocaleString()}</div>
          </div>

          {/* Completed */}
          {txn.completedAt && (
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12 }}>
              <span style={{ fontWeight: 600, color: textSub, fontSize: 13 }}>Completed</span>
              <div style={{ fontSize: 14, color: textMain }}>{new Date(txn.completedAt).toLocaleString()}</div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default TransactionDetails;
