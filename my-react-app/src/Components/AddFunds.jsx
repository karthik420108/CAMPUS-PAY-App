import axios from "axios";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header.jsx";
import API_CONFIG from "../config/api";

export default function AddFunds() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [am, setam] = useState("");
  
  // Theme state
  const [theme, setTheme] = useState("light");
  const isLight = theme === "light";

  useEffect(() => {
    if (!state || state.role !== "admin") {
      navigate("/"); // redirect if not admin
    }
    const fb = async () => {
      try {
        const res = await axios.post(API_CONFIG.getUrl("/institute-balance"));
        setam(res.data.balance);
      } catch (err) {
        console.error(err);
      }
    };
    fb();
  }, [state, navigate]);

  const fb = async () => {
    try {
      const res = await axios.post(API_CONFIG.getUrl("/institute-balance"));
      setam(res.data.balance);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(API_CONFIG.getUrl("/add-institute-funds"), {
        amount: Number(amount),
      });

      if (res.data.success) {
        setMessage(`Successfully added ₹${amount} to institute balance.`);
        setAmount("");
        fb(res.data.newBalance);
      } else {
        setMessage("Failed to add funds. Try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again later.");
    }

    setLoading(false);
  };

  // --- STYLING CONSTANTS ---
  const easingSoft = [0.16, 1, 0.3, 1];
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

  const cardStyle = isLight
    ? {
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }
    : {
        background: "rgba(30, 41, 59, 0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)",
      };

  const inputStyle = isLight 
    ? {
        background: "white",
        border: "1px solid #e2e8f0",
        color: textMain
      }
    : {
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid #334155",
        color: "white"
      };

  return (
    <div style={{ ...pageStyle, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      {/* Background Orbs */}
      <motion.div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: isLight
            ? "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa, #1d4ed8)"
            : "radial-gradient(circle at 30% 0%, #bfdbfe, #3b82f6, #1d4ed8)",
          filter: "blur(60px)",
          opacity: 0.4,
          top: -50,
          left: -50,
          zIndex: 0,
          pointerEvents: "none"
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div style={{ position: "relative", zIndex: 100 }}>
        <Header 
          title="Add Institute Funds" 
          userRole="admin" 
          userName="Admin" 
        />
      </div>

      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "60px 24px", position: "relative", zIndex: 1 }}>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easingSoft }}
          style={{
            ...cardStyle,
            borderRadius: "24px",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative" 
          }}
        >
          {/* Theme Switch */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 6px",
              borderRadius: 999,
              border: `1px solid ${isLight ? "rgba(148,163,184,0.4)" : "rgba(255,255,255,0.2)"}`,
              background: isLight ? "rgba(255,255,255,0.5)" : "rgba(15,23,42,0.5)",
              fontSize: 11,
            }}
          >
            <span style={{ color: textSub, paddingLeft: 4 }}>Mode</span>
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
                background: isLight
                  ? "linear-gradient(120deg,#020617,#0f172a)"
                  : "linear-gradient(120deg,#e5f2ff,#dbeafe)",
                color: isLight ? "#e5e7eb" : "#0f172a",
              }}
            >
              {isLight ? "Dark" : "Light"}
            </button>
          </div>

          <div style={{ 
            fontSize: "48px", 
            marginBottom: "16px",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
          }}>
            💰
          </div>

          <h2 style={{ 
            fontSize: "24px", 
            fontWeight: "700", 
            color: textMain, 
            marginBottom: "8px" 
          }}>
            Add Funds
          </h2>
          
          {/* CURRENT BALANCE DISPLAY: Updated for Big Values */}
          <div style={{ 
            fontSize: "14px", 
            color: textSub, 
            marginBottom: "32px",
            background: isLight ? "rgba(241, 245, 249, 0.8)" : "rgba(30, 41, 59, 0.8)",
            padding: "16px 24px",
            borderRadius: "20px", // Increased radius for better look on multi-line
            textAlign: "center",    // Force center alignment
            width: "100%",          // Ensure it spans full width to center effectively
            overflowWrap: "break-word", // Ensures huge numbers break to next line
            lineHeight: "1.5"
          }}>
             Current Balance: <span style={{ fontWeight: "700", color: "#10b981", fontSize: "16px" }}>₹{Number(am).toLocaleString()}</span>
          </div>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <label style={{ display: "block", marginBottom: "24px" }}>
              <span style={{ display: "block", fontSize: "14px", fontWeight: "500", color: textMain, marginBottom: "8px" }}>
                Amount to Add (₹)
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (e.g. 50000)"
                min="1"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "all 0.2s",
                  ...inputStyle
                }}
              />
            </label>

            <motion.button 
              type="submit" 
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              style={{ 
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "wait" : "pointer",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {loading ? (
                <>
                  <span>Processing</span>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{ width: "16px", height: "16px", border: "2px solid white", borderTop: "2px solid transparent", borderRadius: "50%" }}
                  />
                </>
              ) : (
                "Add Funds Now"
              )}
            </motion.button>
          </form>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ 
                  marginTop: "20px", 
                  padding: "12px", 
                  borderRadius: "8px", 
                  fontSize: "14px",
                  textAlign: "center",
                  width: "100%",
                  overflowWrap: "break-word", // Ensures success message wraps
                  backgroundColor: message.includes("Success") 
                    ? (isLight ? "#ecfdf5" : "rgba(6, 78, 59, 0.4)")
                    : (isLight ? "#fef2f2" : "rgba(127, 29, 29, 0.4)"),
                  color: message.includes("Success") 
                    ? "#059669" 
                    : "#dc2626",
                  border: `1px solid ${message.includes("Success") ? "#10b981" : "#ef4444"}`
                }}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
