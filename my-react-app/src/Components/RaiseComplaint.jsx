import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Header1 from "./Header1";
import SuspensionBanner from "./SuspensionBanner";
import { useVendorStatus } from "../hooks/useVendorStatus";
import Header from "./Header3"

function RaiseComplaint() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId , role } = location.state || {};

  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFrozen, setIsFrozen] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [blockingMessage, setBlockingMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Use vendor status hook for real-time monitoring (only for vendors)
  const { showSuspensionBanner } = role === "vendor" ? useVendorStatus(userId) : { showSuspensionBanner: false };


  const [admins, setAdmins] = useState([]);
  const [selectedAdmins, setSelectedAdmins] = useState([]);

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

  if (!userId) {
    navigate("/");
    return null;
  }
  

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get("http://localhost:5000/admins");
        setAdmins(res.data);
      } catch (err) {
        console.error(err);
      }
      console.log("Role" +role)
    };
    fetchAdmins();
  }, [role]);

  const handleCardToggle = (id) => {
    setSelectedAdmins((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    // For vendors, auto-assign to all admins, no selection needed
    let adminsToAssign = selectedAdmins;
    if (role === "vendor") {
      // Get all admin IDs for vendor complaints
      adminsToAssign = admins.map(admin => admin._id);
    } else if (selectedAdmins.length === 0) {
      setError("Select at least one admin");
      return;
    }

    try {
      setLoading(true);
      setError("");
      

      let screenshotLink = null;
      if (screenshot) {
        const formData = new FormData();
        formData.append("role", role+"Complaints");
        formData.append("screenshot", screenshot);

        const imgRes = await axios.post(
          "http://localhost:5000/c-screenshot",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        screenshotLink = imgRes.data.imageUrl;
      }

      const complaintData = {
        userId,
        description,
        screenshot: screenshotLink,
        admins: adminsToAssign,
        role : role
      };

      const res = await axios.post(
        "http://localhost:5000/complaints",
        complaintData
      );

      navigate("/complaint-success", {
        state: { complaintId: res.data.complaintId },
      });
    } catch (err) {
      console.error(err);
      setError("Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };


  if(role != "vendor"){
    useEffect(() => {
  if (!userId) {
    navigate("/");
    return;
  }

  const fetchUserData = async () => {
    try {
      const userRes = await axios.get(`http://localhost:5000/user/${userId}`);
      const { isFrozen, isSuspended } = userRes.data;

      setIsFrozen(isFrozen);
      setIsSuspended(isSuspended);

      if (isSuspended) {
        setBlockingMessage("Your account is suspended. Redirecting to homepage...");
        setTimeout(() => navigate("/", { state: { userId } }), 2500);
        return;
      }

      // Allow frozen vendors to access complaint form
      // No blocking for frozen users

      // Fetch transactions only if not blocked
      const txnRes = await axios.get(`http://localhost:5000/transactions/${userId}`);
      setTransactions(txnRes.data);

    } catch (err) {
      console.error(err);
    }
  };

  fetchUserData();

  // Optional: real-time polling every 5s
  const interval = setInterval(fetchUserData, 5000);
  return () => clearInterval(interval);

}, [userId, navigate]);



  }

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

  const textareaStyle = isLight
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

  const adminsBoxStyle = isLight
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

  const errorColor = isLight ? "#b91c1c" : "#fecaca";

  if (blockingMessage) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: 18,
      fontWeight: 600,
      color: "#ef4444",
    }}>
      {blockingMessage}
    </div>
  );
}


  return (
    <>
      <Header1 userId={userId} role = {role} isFrozen={isFrozen} isOp={setSidebarOpen}/>
      <SuspensionBanner show={showSuspensionBanner} />

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
      <Header theme={theme} setTheme={setTheme} />
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

        {/* card */}
        <motion.form
          onSubmit={handleSubmit}
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
          {/* top accent */}
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
              marginBottom: 6,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: textSub,
                  marginBottom: 4,
                }}
              >
                Help Center
              </div>
              <h2
                style={{
                  fontSize: 22,
                  letterSpacing: "0.05em",
                  fontWeight: 700,
                  color: textMain,
                }}
              >
                Raise a Complaint
              </h2>
            </div>
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
              marginBottom: 2,
            }}
          />

          {/* description */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12, duration: 0.35, ease: easingSoft }}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <label style={{ fontSize: 13, color: textMain }}>
                Description
              </label>
              <span style={{ fontSize: 11, color: textSub }}>
                Clear steps help admins resolve faster
              </span>
            </div>
            <motion.textarea
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, when it happened, and what you expected instead."
              whileFocus={{
                boxShadow: `0 0 0 1px ${isLight ? "#60a5fa" : "#38bdf8"}`,
                scale: 1.01,
              }}
              style={{
                padding: "10px 12px",
                borderRadius: 14,
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                color: textMain,
                ...textareaStyle,
              }}
            />
          </motion.div>

          {/* screenshot */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18, duration: 0.35, ease: easingSoft }}
            style={{ display: "flex", flexDirection: "column", gap: 6 }}
          >
            <label style={{ fontSize: 13, color: textMain }}>
              Screenshot (optional)
            </label>
            <motion.label
              whileHover={{
                scale: 1.015,
                boxShadow: "0 0 18px rgba(191,219,254,0.8)",
                borderColor: isLight
                  ? "rgba(96,165,250,0.95)"
                  : "rgba(56,189,248,0.95)",
              }}
              whileTap={{ scale: 0.985 }}
              style={{
                cursor: "pointer",
                padding: "9px 12px",
                borderRadius: 14,
                border: `1px dashed ${
                  isLight ? "rgba(148,163,184,0.9)" : "rgba(75,85,99,0.95)"
                }`,
                fontSize: 13,
                color: textMain,
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: isLight
                  ? "linear-gradient(130deg, rgba(255,255,255,0.98), rgba(239,246,255,0.98))"
                  : "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(15,23,42,0.98))",
              }}
            >
              <motion.span
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  display: "inline-flex",
                  width: 24,
                  height: 24,
                  borderRadius: "999px",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "radial-gradient(circle, #bfdbfe, #60a5fa 55%, #38bdf8 90%)",
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: "0 0 12px rgba(191,219,254,0.95)",
                }}
              >
                +
              </motion.span>
              <span>
                {screenshot ? screenshot.name : "Attach a screenshot (optional)"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setScreenshot(e.target.files[0])}
                style={{ display: "none" }}
              />
            </motion.label>
          </motion.div>

          {/* admins */}
          {role !== "vendor" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.4, ease: easingSoft }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    color: textMain,
                  }}
                >
                  Select Admin(s)
                </label>
                <span style={{ fontSize: 11, color: textSub }}>
                  Tap card or checkbox
                </span>
              </div>
              <motion.div
                style={{
                  maxHeight: 210,
                  overflowY: "auto",
                  borderRadius: 16,
                  padding: "6px 8px",
                  ...adminsBoxStyle,
                }}
              >
                <AnimatePresence>
                  {admins.map((admin, index) => {
                    const isSelected = selectedAdmins.includes(admin._id);

                    const handleCheckboxChange = (e) => {
                      const checked = e.target.checked;
                      setSelectedAdmins((prev) =>
                        checked
                          ? [...prev, admin._id]
                          : prev.filter((id) => id !== admin._id)
                      );
                    };

                    return (
                      <motion.div
                        key={admin._id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 6 }}
                        transition={{
                          delay: 0.03 * index,
                          duration: 0.25,
                          ease: easingSoft,
                        }}
                        whileHover={{
                          background: isLight
                            ? "linear-gradient(90deg, rgba(219,234,254,0.98), rgba(191,219,254,0.98))"
                            : "linear-gradient(90deg, rgba(30,64,175,0.85), rgba(12,74,110,0.9))",
                          x: 2,
                        }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => handleCardToggle(admin._id)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "7px 4px",
                          borderBottom:
                            index !== admins.length - 1
                              ? "1px solid rgba(226,232,240,0.9)"
                              : "none",
                          borderRadius: 12,
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                          }}
                        >
                          <motion.div
                            layoutId={`admin-avatar-${admin._id}`}
                            animate={{
                              scale: isSelected ? 1.05 : 1,
                              boxShadow: isSelected
                                ? "0 0 10px rgba(96,165,250,0.9)"
                                : "0 0 0 rgba(0,0,0,0)",
                            }}
                            transition={{ duration: 0.2, ease: easingSoft }}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "999px",
                              background: isSelected
                                ? "radial-gradient(circle at 30% 0%, #60a5fa, #1d4ed8)"
                                : "radial-gradient(circle at 30% 0%, #bfdbfe, #60a5fa)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#0f172a",
                            }}
                          >
                            {admin.name?.[0]?.toUpperCase()}
                          </motion.div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 13.5, color: textMain }}>
                              {admin.name}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                color: textSub,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              Admin
                            </span>
                          </div>
                        </div>

                        <motion.input
                          type="checkbox"
                          value={admin._id}
                          checked={isSelected}
                          onChange={handleCheckboxChange}
                          onClick={(e) => e.stopPropagation()}
                          whileTap={{ scale: 0.94 }}
                          style={{
                            width: 17,
                            height: 17,
                            cursor: "pointer",
                            accentColor: "#3b82f6",
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}

          {/* Vendor notice */}
          {role === "vendor" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.4, ease: easingSoft }}
              style={{
                padding: "12px 16px",
                backgroundColor: isFrozen ? "#dbeafe" : (isLight ? "#fef3c7" : "#78350f"),
                borderRadius: 12,
                border: `1px solid ${isFrozen ? "#3b82f6" : (isLight ? "#fbbf24" : "#92400e")}`,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: isFrozen ? "#1d4ed8" : (isLight ? "#92400e" : "#fef3c7"), marginBottom: 4 }}>
                📋 Vendor Complaint
              </div>
              <div style={{ fontSize: 11, color: isFrozen ? "#1e40af" : (isLight ? "#78350f" : "#fef3c7"), lineHeight: 1.4 }}>
                {isFrozen 
                  ? "Your account is frozen, but you can still raise complaints for review."
                  : "Your complaint will be sent directly to the admin team for review"
                }
              </div>
            </motion.div>
          )}

          {/* error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25, ease: easingSoft }}
                style={{
                  color: errorColor,
                  fontSize: 13,
                  textAlign: "center",
                  fontWeight: 500,
                  marginTop: 2,
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* submit */}
          <motion.div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 6,
            }}
          >
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={
                !loading
                  ? {
                      scale: 1.02,
                      boxShadow: "0 0 18px rgba(129,140,248,0.85)",
                    }
                  : {}
              }
              whileTap={!loading ? { scale: 0.97 } : {}}
              animate={
                loading
                  ? { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
                  : { backgroundPosition: "0% 50%" }
              }
              transition={{
                duration: loading ? 1.8 : 0.3,
                repeat: loading ? Infinity : 0,
                ease: "easeInOut",
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                border: "none",
                background:
                  "linear-gradient(120deg,#3b82f6,#0ea5e9,#22c55e,#0f766e)",
                backgroundSize: "220% 220%",
                color: "#f9fafb",
                fontWeight: 600,
                cursor: loading ? "wait" : "pointer",
                fontSize: 14,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span>Submitting</span>
                  <motion.span style={{ display: "flex", gap: 3 }}>
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.12,
                        }}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: "999px",
                          backgroundColor: "#f9fafb",
                        }}
                      />
                    ))}
                  </motion.span>
                </>
              ) : (
                "Submit Complaint"
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </>
  );
}

export default RaiseComplaint;
