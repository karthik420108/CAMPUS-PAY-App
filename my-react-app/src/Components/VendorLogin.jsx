import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import Header1 from "./Header1";
import SuspensionBanner from "./SuspensionBanner";
import { useVendorStatus } from "../hooks/useVendorStatus";

function VendorLogin() {
  const { state } = useLocation();
  const { vendorId } = state || {};
  const navigate = useNavigate();

  const [vendorName, setVendorName] = useState("");
  const [balance, setBalance] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [showProfileOption, setShowProfileOption] = useState(false);
  const [theme, setTheme] = useState("light"); // "light" | "dark"
  const [hasUnread, setHasUnread] = useState(false);
  
  // Use vendor status hook for real-time monitoring
  const { isSuspended, isFrozen, showSuspensionBanner, setShowSuspensionBanner } = useVendorStatus(vendorId);

  const easingSoft = [0.16, 1, 0.3, 1];
  const isLight = theme === "light";

  if (!vendorId) {
    navigate("/");
    return null;
  }

  useEffect(() => {
    axios
      .post(`http://localhost:5000/vendor/${vendorId}`)
      .then((res) => {
        setVendorName(res.data.vendorName);
        setBalance(res.data.Wallet);
        setImageUrl(res.data.ImageUrl);
        
        // Close profile options if suspended
        if (res.data.isSuspended) {
          setShowProfileOption(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching vendor details:", err);
      });
  }, [vendorId]);

  // Notification fetching with real-time polling
  useEffect(() => {
    if (!vendorId) return;
    
    const fetchNotifications = () => {
      axios
        .get(`http://localhost:5000/notifications/${vendorId}`, {
          params: { role: "vendor" },
        })
        .then((res) => {
          const notifications = res.data;
          const unread = notifications.some((n) => !n.read);
          setHasUnread(unread);
        })
        .catch(console.error);
    };

    // Initial fetch
    fetchNotifications();

    // Set up polling for real-time updates
    const interval = setInterval(fetchNotifications, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [vendorId]);

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

  const balanceBoxStyle = isLight
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

  // ---------- navigation helpers ----------
  const goToGenerateQR = () => {
    navigate("/generate-qr", { state: { vendorId, vendorName } });
  };

  const goToEditProfile = () => {
    navigate("/vendor-edit-profile", { state: { vendorId } });
    setShowProfileOption(false);
  };

  const goToNotifications = () => {
    navigate("/notifications", { state: { Id: vendorId , role : "vendor"} });
    setShowProfileOption(false);
  };

  const goToViewProfile = () => {
    console.log(vendorId)
    navigate("/viewv", { state: { vendorId , role : "vendor"} });
    setShowProfileOption(false);
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <>
      <Header1 userId = {vendorId} role = "vendor" />
      <SuspensionBanner show={showSuspensionBanner} />

      {/* click-outside wrapper */}
      <div
        onClick={() => {
          if (showProfileOption) setShowProfileOption(false);
        }}
      >
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

          {/* NOTIFICATION BUTTON */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: easingSoft }}
            style={{
              position: "absolute",
              top: 32,
              right: 420,
              zIndex: 20,
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                navigate("/notifications", {
                  state: { Id: vendorId, role: "vendor" },
                })
              }
              style={{
                position: "relative",
                cursor: "pointer",
                padding: "12px 16px",
                borderRadius: "16px",
                background: isLight
                  ? "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))"
                  : "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))",
                backdropFilter: "blur(16px)",
                border: `1px solid ${
                  isLight ? "rgba(148,163,184,0.4)" : "rgba(75,85,99,0.6)"
                }`,
                boxShadow: `0 8px 24px ${
                  isLight ? "rgba(15,23,42,0.12)" : "rgba(15,23,42,0.6)"
                }`,
              }}
            >
              <span style={{ fontSize: "24px", color: isLight ? "#1f2937" : "#e5e7eb" }}>🔔</span>
              <AnimatePresence>
                {hasUnread && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "12px",
                      height: "12px",
                      background: "#ef4444",
                      borderRadius: "50%",
                      border: `2px solid ${isLight ? "#f8fafc" : "#0f172a"}`,
                      boxShadow: "0 0 0 3px rgba(239,68,68,0.3)",
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* PROFILE PILL + DROPDOWN */}
          <motion.div
            style={{
              position: "absolute",
              top: 32,
              right: 32,
              display: "flex",
              alignItems: "center",
              zIndex: 20,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: easingSoft }}
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileOption((v) => !v);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 18px",
                borderRadius: 999,
                background: isLight
                  ? "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(226,232,240,0.98))"
                  : "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,64,175,0.85))",
                boxShadow: "0 10px 26px rgba(15,23,42,0.30)",
                border: `1px solid ${
                  isLight ? "rgba(148,163,184,0.5)" : "rgba(37,99,235,0.7)"
                }`,
                cursor: "pointer",
                maxWidth: 420,
                minWidth: 320,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                  boxShadow: "0 6px 18px rgba(15,23,42,0.45)",
                  background:
                    "radial-gradient(circle at 30% 30%, #0f172a, #020617)",
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Vendor Avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#e5e7eb",
                      fontSize: 20,
                      fontWeight: 700,
                    }}
                  >
                    {vendorName[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: textMain,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {vendorName}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: textSub,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  ID: {vendorId}
                </span>
              </div>
            </motion.div>

            <AnimatePresence>
              {showProfileOption && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: easingSoft }}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: 70,
                    background: isLight ? "#ffffff" : "#020617",
                    borderRadius: 16,
                    boxShadow: "0 20px 40px rgba(15,23,42,0.35)",
                    border: `1px solid ${
                      isLight
                        ? "rgba(148,163,184,0.45)"
                        : "rgba(37,99,235,0.7)"
                    }`,
                    padding: 8,
                    minWidth: 220,
                    zIndex: 40,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={goToViewProfile}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      color: textMain,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    👤 View profile
                  </button>
                  <button
                    onClick={goToEditProfile}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      color: textMain,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    ✏️ Edit profile
                  </button>
                  <button
                    onClick={goToNotifications}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      color: textMain,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    🔔 Notifications from admin
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "none",
                      background: isLight
                        ? "rgba(248,113,113,0.1)"
                        : "rgba(127,29,29,0.6)",
                      color: isLight ? "#b91c1c" : "#fee2e2",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                  >
                    🚪 Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* MAIN CARD */}
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
              gap: 28,
              position: "relative",
              overflow: "hidden",
              ...cardStyle,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* theme toggle */}
            <div
              style={{
                position: "absolute",
                top: 20,
                right: 24,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
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
                  padding: "4px 12px",
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

            {/* top accent line (like RaiseComplaint) */}
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

            {/* header text */}
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
                Vendor Dashboard
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
                Welcome Back
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

            {/* balance */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4, ease: easingSoft }}
              style={{
                padding: "32px 24px",
                borderRadius: 24,
                textAlign: "center",
                ...balanceBoxStyle,
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 14,
                  color: textSub,
                  fontWeight: 500,
                  marginBottom: 12,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Wallet Balance
              </span>
              <motion.h3
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  color: textMain,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ₹ {balance.toLocaleString()}
              </motion.h3>
            </motion.div>

            {/* button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.4, ease: easingSoft }}
            >
              <motion.button
                onClick={goToGenerateQR}
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 24px rgba(59,130,246,0.6)",
                }}
                whileTap={{ scale: 0.97 }}
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
                  cursor: "pointer",
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
                Generate QR Code
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
       
      </div>
      <button onClick={()=>navigate("/refund", { state: { vendorId } })}>Refund Money</button>
    </>
  );
}

export default VendorLogin;
