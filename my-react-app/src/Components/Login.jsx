import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Login.css";
import Header1 from "./Header1";
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import ScanPay from "./ScanPay";
import { motion, AnimatePresence } from "motion/react";
import Header from "./Header3"

dayjs.extend(isSameOrBefore);

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

import { buildChartData } from "./utils/buildChartData";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);

  const {
    username,
    userId,
    imageUrl,
    walletBalance,
    instBalance,
    isFrozen,
    isSuspended,
    userCreatedAt,
  } = location.state || {};

  const [ImageUrl, setImageUrl] = useState(imageUrl);
  const [Username, setUsername] = useState(username);
  const [frozen, setFrozen] = useState(isFrozen);
  const [suspended, setSuspended] = useState(isSuspended);
  const [wallBalance, setWallBalance] = useState(walletBalance);
  const [InstaBalance, setInstaBalance] = useState(instBalance);

  const [mode, setMode] = useState("day");
  const [transactions, setTransactions] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);

  // Theme with persistence - sync with global theme
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

  const today = dayjs().format("YYYY-MM-DD");
  const accountCreatedDate = userCreatedAt?.split("T")[0];

  useEffect(() => {
    if (!userId) {
      navigate("/");
      return;
    }
    axios
      .get(`http://localhost:5000/transactions/${userId}`)
      .then((res) => setTransactions(res.data))
      .catch(console.error);
  }, [userId, navigate]);
  useEffect(() => {
    if (!userId) return;

    const fetchUserStatus = () => {
      axios
        .get(`http://localhost:5000/user/${userId}`)
        .then((res) => {
          const userData = res.data;
          console.log(userId);
          setFrozen(userData.isFrozen);
          setSuspended(userData.isSuspended || false);
          setImageUrl(userData.ImageUrl || imageUrl);
          setUsername(userData.firstName || username);
          setWallBalance(userData.walletBalance || walletBalance);

          if (userData.isSuspended) {
            setShowEditProfile(false); // close popups

            // Redirect after 5 seconds if suspended
            setTimeout(() => {
              navigate("/", { replace: true });
            }, 8000);
          }
        })
        .catch(console.error);
    };

    // Call immediately once
    fetchUserStatus();

    // Then set interval every 5 seconds
    const intervalId = setInterval(fetchUserStatus, 5000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
    // Only depend on userId and navigate to avoid infinite loop
    // imageUrl, username, walletBalance are set inside this effect
  }, [userId, imageUrl , username , walletBalance ,  navigate]);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = () => {
      axios
        .get(`http://localhost:5000/notifications/${userId}`, {
          params: { role: "student" },
        })
        .then((res) => {
          const unread = res.data.some((n) => !n.read);
          setHasUnread(unread);
        })
        .catch(console.error);
    };

    // Call immediately once
    fetchNotifications();

    // Poll every 5 seconds
    const intervalId = setInterval(fetchNotifications, 7000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowEditProfile(false);
      }
    };
    if (showEditProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEditProfile]);

  // Handle click outside for settings popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettingsPopup && !event.target.closest('.settings-popup') && !event.target.closest('[data-settings-trigger]')) {
        setShowSettingsPopup(false);
      }
    };
    if (showSettingsPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSettingsPopup]);

  // Handle scanner event from bottom navigation
  useEffect(() => {
    const handleOpenScanner = () => {
      if (frozen) return;
      // Find and click the original scan button
      const scanCard = document.querySelector('.scan-card');
      if (scanCard && !scanCard.classList.contains('disabled')) {
        scanCard.click();
      }
    };

    window.addEventListener('openScanner', handleOpenScanner);
    return () => window.removeEventListener('openScanner', handleOpenScanner);
  }, [frozen]);

  const safeSetMode = (value) => {
    if (isFrozen) return;
    setMode(value);
    if (value !== "custom") {
      setFromDate("");
      setToDate("");
    } else {
      setFromDate(accountCreatedDate);
      setToDate(today);
    }
  };

  const dateLabel = useMemo(() => {
    const now = dayjs();
    if (mode === "day") return `Today: ${now.format("DD MMM YYYY")}`;
    if (mode === "week") {
      const start = now.subtract(6, "day");
      return `${start.format("DD MMM YYYY")} – ${now.format("DD MMM YYYY")}`;
    }
    if (mode === "custom" && fromDate && toDate) {
      const start = dayjs(fromDate);
      const end = dayjs(toDate);
      return start.isSame(end, "day")
        ? start.format("DD MMM YYYY")
        : `${start.format("DD MMM YYYY")} – ${end.format("DD MMM YYYY")}`;
    }
    return "";
  }, [mode, fromDate, toDate]);

  const todaySpent = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          (t.status === "SUCCESS" || t.status === "REFUND") &&
          dayjs(t.createdAt).isSame(dayjs(), "day")
      )
      .reduce((sum, t) => {
        if (t.status === "SUCCESS") return sum + t.amount;
        if (t.status === "REFUND") return sum - t.amount; // subtract refund
        return sum;
      }, 0);
  }, [transactions]);

  const chartData = useMemo(() => {
    const relevantTxns = transactions.filter(
      (t) => t.status === "SUCCESS" || t.status === "REFUND"
    );

    // when building chart data, subtract REFUND amounts
    return buildChartData({
      transactions: relevantTxns.map((t) => ({
        ...t,
        amount: t.status === "REFUND" ? -t.amount : t.amount,
      })),
      mode,
      fromDate,
      toDate,
    });
  }, [transactions, mode, fromDate, toDate]);

  const easingSoft = [0.16, 1, 0.3, 1];
  const isLight = theme === "light";

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

  const errorColor = isLight ? "#b91c1c" : "#fecaca";

  return (
    <>
      <Header1 role="student" userId={userId} isFrozen={isFrozen} />
      <Header theme={theme} setTheme={setTheme} />

      {/* Suspension Banner */}
      {suspended && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
            color: "white",
            padding: "16px 24px",
            margin: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(238, 90, 36, 0.3)",
            textAlign: "center",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "24px" }}>⚠️</div>
            <div>
              <strong>Account Suspended</strong>
              <br />
              Your account has been suspended by the admins/subadmins for fraud
              actions. You cannot login to your account. Contact admins.
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          position: "relative",
          ...pageStyle,
        }}
      >
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

        {/* 🔔 NOTIFICATIONS */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easingSoft }}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "16px 24px",
            zIndex: 10,
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
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
            onClick={() =>
              navigate("/notifications", {
                state: { Id: userId, role: "student" },
              })
            }
          >
            <span style={{ fontSize: "24px", color: textMain }}>🔔</span>
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

          {/* 🚪 LOGOUT BUTTON - Only for students */}
          <motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.98 }}
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
  onClick={() => navigate("/")}
>
  <span style={{ fontSize: "24px", color: "#ef4444" }}>🚪</span>
  <span
    style={{
      marginLeft: "8px",
      fontSize: "14px",
      fontWeight: 600,
      color: isLight ? "#b91c1c" : "#fecaca",
    }}
  >
    Logout..
  </span>
</motion.div>

        </motion.div>

        {/* MAIN CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: easingSoft }}
          style={{
            width: "100%",
            maxWidth: 900,
            margin: "0 auto",
            borderRadius: 28,
            padding: "60px 28px 32px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: textMain,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            position: "relative",
            ...cardStyle,
          }}
        >
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

          {/* PROFILE */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: easingSoft }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              padding: "24px",
              background: isLight
                ? "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,250,252,0.9))"
                : "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))",
              borderRadius: "20px",
              border: `1px solid ${
                isLight ? "rgba(209,213,219,0.6)" : "rgba(51,65,85,0.8)"
              }`,
              backdropFilter: "blur(12px)",
              position: "relative",
              zIndex: 20,
            }}
          >
            <motion.div
              ref={profileRef}
              style={{ position: "relative" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={ImageUrl || "/default-avatar.png"}
                alt="Profile"
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  cursor: "pointer",
                  filter: frozen ? "grayscale(100%) brightness(0.7)" : "none",
                  border: `3px solid ${isLight ? "#60a5fa" : "#38bdf8"}`,
                  boxShadow: `0 12px 32px ${
                    isLight ? "rgba(96,165,250,0.4)" : "rgba(56,189,248,0.6)"
                  }`,
                }}
                onClick={() => setShowEditProfile(!showEditProfile)}
              />

              <AnimatePresence>
                {showEditProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: easingSoft }}
                    style={{
                      position: "absolute",
                      top: "110%",
                      left: "0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      padding: "16px",
                      background: isLight
                        ? "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.99))"
                        : "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,41,59,0.99))",
                      borderRadius: "16px",
                      border: `1px solid ${
                        isLight ? "rgba(209,213,219,0.8)" : "rgba(51,65,85,0.9)"
                      }`,
                      boxShadow: `0 20px 48px ${
                        isLight ? "rgba(15,23,42,0.25)" : "rgba(15,23,42,0.75)"
                      }`,
                      zIndex: 50,
                      minWidth: "160px",
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        navigate("/viewv", {
                          state: {
                            vendorId: userId,
                            role: "student",
                          },
                        })
                      }
                      style={{
                        padding: "10px 16px",
                        border: "none",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                        color: "white",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "13px",
                        textAlign: "left",
                      }}
                    >
                      👁️ View Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        navigate("/edit-profile", {
                          state: { userId },
                        })
                      }
                      style={{
                        padding: "10px 16px",
                        border: "none",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "white",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "13px",
                        textAlign: "left",
                      }}
                    >
                      ✏️ Edit Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        navigate("/change-mpin", {
                          state: { userId },
                        })
                      }
                      style={{
                        padding: "10px 16px",
                        border: "none",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                        color: "white",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "13px",
                        textAlign: "left",
                      }}
                    >
                      🔐 Change MPIN
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "28px",
                  letterSpacing: "-0.02em",
                  fontWeight: 700,
                  color: textMain,
                }}
              >
                Welcome, {Username}
              </h2>
              {frozen && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    color: errorColor,
                    fontSize: "14px",
                    fontWeight: 500,
                    marginTop: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🧊 Account is frozen. Contact support.
                </motion.p>
              )}
            </div>
          </motion.div>

          {/* 💳 STATS ROW */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4, ease: easingSoft }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              zIndex: 1,
            }}
          >
            {/* Wallet Balance */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: "28px 24px",
                borderRadius: "20px",
                textAlign: "center",
                backdropFilter: "blur(12px)",
                background: isLight
                  ? "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.95))"
                  : "linear-gradient(145deg, rgba(15,23,42,0.92), rgba(30,41,59,0.95))",
                border: `1px solid ${
                  isLight ? "rgba(209,213,219,0.6)" : "rgba(51,65,85,0.8)"
                }`,
                boxShadow: `0 16px 40px ${
                  isLight ? "rgba(15,23,42,0.15)" : "rgba(15,23,42,0.5)"
                }`,
              }}
            >
              <p
                style={{
                  color: textSub,
                  fontSize: "14px",
                  margin: 0,
                  marginBottom: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.03em",
                }}
              >
                Total Spendings
              </p>
              {/* ✅ FIX: Added key={theme} to force re-render */}
              <h3
                key={`wallet-${theme}`}
                style={{
                  margin: 0,
                  fontSize: "32px",
                  fontWeight: 700,
                  background: isLight
                    ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                    : "linear-gradient(135deg, #60a5fa, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                ₹{wallBalance?.toLocaleString() || "0"}

              </h3>
            </motion.div>

            {/* Institute Balance */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: "28px 24px",
                borderRadius: "20px",
                textAlign: "center",
                backdropFilter: "blur(12px)",
                background: isLight
                  ? "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.95))"
                  : "linear-gradient(145deg, rgba(15,23,42,0.92), rgba(30,41,59,0.95))",
                border: `1px solid ${
                  isLight ? "rgba(209,213,219,0.6)" : "rgba(51,65,85,0.8)"
                }`,
                boxShadow: `0 16px 40px ${
                  isLight ? "rgba(15,23,42,0.15)" : "rgba(15,23,42,0.5)"
                }`,
              }}
            >
              <p
                style={{
                  color: textSub,
                  fontSize: "14px",
                  margin: 0,
                  marginBottom: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.03em",
                }}
              >
                Institute Balance
              </p>
              {/* ✅ FIX: Added key={theme} */}
              <h3
                key={`inst-${theme}`}
                style={{
                  margin: 0,
                  fontSize: "32px",
                  fontWeight: 700,
                  background: isLight
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, #34d399, #10b981)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                ₹{InstaBalance?.toLocaleString() || "0"}

              </h3>
            </motion.div>

            {/* Today Spent */}
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: "28px 24px",
                borderRadius: "20px",
                textAlign: "center",
                backdropFilter: "blur(12px)",
                background: isLight
                  ? "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.95))"
                  : "linear-gradient(145deg, rgba(15,23,42,0.92), rgba(30,41,59,0.95))",
                border: `1px solid ${
                  isLight ? "rgba(209,213,219,0.6)" : "rgba(51,65,85,0.8)"
                }`,
                boxShadow: `0 16px 40px ${
                  isLight ? "rgba(15,23,42,0.15)" : "rgba(15,23,42,0.5)"
                }`,
              }}
            >
              <p
                style={{
                  color: textSub,
                  fontSize: "14px",
                  margin: 0,
                  marginBottom: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.03em",
                }}
              >
                Today Spent
              </p>
              {/* ✅ FIX: Added key={theme} */}
              <h3
                key={`spent-${theme}`}
                style={{
                  margin: 0,
                  fontSize: "32px",
                  fontWeight: 700,
                  background: isLight
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "linear-gradient(135deg, #fbbf24, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                ₹{todaySpent?.toLocaleString() || "0"}
              </h3>
            </motion.div>
          </motion.div>

          <ScanPay userId={userId} f={frozen} />

          {/* 📱 MOBILE-STYLE DASHBOARD ACTIONS */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: easingSoft }}
            style={{
              background: isLight
                ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.98))"
                : "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(17,24,39,0.98))",
              padding: "24px",
              borderRadius: "20px",
              border: `1px solid ${
                isLight ? "rgba(209,213,219,0.7)" : "rgba(51,65,85,0.9)"
              }`,
              boxShadow: isLight
                ? "0 8px 32px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.1)"
                : "0 8px 32px rgba(15,23,42,0.4), 0 0 0 1px rgba(75,85,99,0.3)",
              marginBottom: "24px",
            }}
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
            }}>
              {/* 💳 TRANSACTIONS */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/History", { state: { userId, role: "student" } })}
                style={{
                  background: isLight
                    ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                    : "linear-gradient(145deg, #2563eb, #1e40af)",
                  padding: "20px",
                  borderRadius: "16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
                }}
              >
                <span style={{ fontSize: "28px" }}>💳</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Transactions</span>
              </motion.div>

              {/* 📝 COMPLAINTS */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/complaint-history", { state: { userId, role: "student", isFrozen } })}
                style={{
                  background: isLight
                    ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                    : "linear-gradient(145deg, #7c3aed, #6d28d9)",
                  padding: "20px",
                  borderRadius: "16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
                }}
              >
                <span style={{ fontSize: "28px" }}>📝</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Complaints</span>
              </motion.div>

              {/* 📄 GENERATE BILL */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/generate-bill", { state: { userId, isFrozen } })}
                style={{
                  background: isLight
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(145deg, #059669, #047857)",
                  padding: "20px",
                  borderRadius: "16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                }}
              >
                <span style={{ fontSize: "28px" }}>📄</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Generate Bill</span>
              </motion.div>

              {/* ❓ RAISE COMPLAINT */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/raise-complaint", { state: { userId, role: "student", isFrozen } })}
                style={{
                  background: isLight
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "linear-gradient(145deg, #d97706, #b45309)",
                  padding: "20px",
                  borderRadius: "16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
                }}
              >
                <span style={{ fontSize: "28px" }}>❓</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>Raise Complaint</span>
              </motion.div>
            </div>
          </motion.div>

          {/* CHART */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4, ease: easingSoft }}
            style={{
              background: isLight
                ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.98))"
                : "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(17,24,39,0.98))",
              padding: "32px",
              borderRadius: "24px",
              border: `1px solid ${
                isLight ? "rgba(209,213,219,0.7)" : "rgba(51,65,85,0.9)"
              }`,
              boxShadow: `0 20px 56px ${
                isLight ? "rgba(15,23,42,0.2)" : "rgba(15,23,42,0.7)"
              }`,
              backdropFilter: "blur(16px)",
            }}
          >
            {dateLabel && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: textSub,
                    marginBottom: "4px",
                  }}
                >
                  Spending Overview
                </div>
                <h3
                  style={{
                    fontSize: "22px",
                    letterSpacing: "-0.02em",
                    fontWeight: 700,
                    color: textMain,
                    margin: 0,
                  }}
                >
                  {dateLabel}
                </h3>
              </motion.div>
            )}

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
                marginBottom: "24px",
              }}
            />

            <motion.div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "28px",
                flexWrap: "wrap",
              }}
            >
              {["day", "week", "custom"].map((m) => (
                <motion.button
                  key={m}
                  disabled={frozen}
                  onClick={() => safeSetMode(m)}
                  whileHover={!frozen ? { scale: 1.02 } : {}}
                  whileTap={!frozen ? { scale: 0.98 } : {}}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "14px",
                    border: `1px solid ${
                      isLight ? "rgba(148,163,184,0.6)" : "rgba(75,85,99,0.7)"
                    }`,
                    background:
                      mode === m
                        ? isLight
                          ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                          : "linear-gradient(135deg, #60a5fa, #3b82f6)"
                        : isLight
                        ? "rgba(255,255,255,0.8)"
                        : "rgba(30,41,59,0.8)",
                    color: mode === m ? "#f9fafb" : textMain,
                    fontWeight: 600,
                    cursor: frozen ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    letterSpacing: "0.03em",
                    opacity: frozen ? 0.6 : 1,
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow:
                      mode === m
                        ? `0 8px 24px ${
                            isLight
                              ? "rgba(59,130,246,0.4)"
                              : "rgba(96,165,250,0.6)"
                          }`
                        : "none",
                  }}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </motion.button>
              ))}
            </motion.div>

            {mode === "custom" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: easingSoft }}
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "28px",
                  padding: "20px",
                  background: isLight
                    ? "linear-gradient(135deg, rgba(248,250,252,0.9), rgba(241,245,249,0.9))"
                    : "linear-gradient(145deg, rgba(30,41,59,0.9), rgba(17,24,39,0.9))",
                  borderRadius: "18px",
                  border: `1px solid ${
                    isLight ? "rgba(209,213,219,0.7)" : "rgba(51,65,85,0.8)"
                  }`,
                  backdropFilter: "blur(12px)",
                }}
              >
                <motion.div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "13px",
                      color: textMain,
                      fontWeight: 500,
                    }}
                  >
                    From
                  </label>
                  <input
                    type="date"
                    disabled={frozen}
                    min={accountCreatedDate}
                    max={today}
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setToDate("");
                    }}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: `1px solid ${
                        isLight ? "rgba(148,163,184,0.8)" : "rgba(75,85,99,0.8)"
                      }`,
                      background: isLight ? "white" : "#1e293b",
                      color: textMain,
                      fontSize: "15px",
                      fontWeight: 500,
                      outline: "none",
                      cursor: frozen ? "not-allowed" : "pointer",
                    }}
                  />
                </motion.div>
                <motion.div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "13px",
                      color: textMain,
                      fontWeight: 500,
                    }}
                  >
                    To
                  </label>
                  <input
                    type="date"
                    disabled={frozen}
                    min={fromDate || accountCreatedDate}
                    max={today}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      border: `1px solid ${
                        isLight ? "rgba(148,163,184,0.8)" : "rgba(75,85,99,0.8)"
                      }`,
                      background: isLight ? "white" : "#1e293b",
                      color: textMain,
                      fontSize: "15px",
                      fontWeight: 500,
                      outline: "none",
                      cursor: frozen ? "not-allowed" : "pointer",
                    }}
                  />
                </motion.div>
              </motion.div>
            )}

            <motion.div
              style={{
                width: "100%",
                height: 380,
                borderRadius: "20px",
                overflow: "hidden",
              }}
            >
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={
                      isLight ? "rgba(226,232,240,0.7)" : "rgba(51,65,85,0.5)"
                    }
                  />
                  <XAxis
                    dataKey="label"
                    tick={{
                      fill: textSub,
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  />
                  <YAxis
                    tick={{
                      fill: textSub,
                      fontSize: 13,
                      fontWeight: 500,
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  />
                  <ReferenceLine
                    y={0} // align to zero
                    stroke={isLight ? "#0f172a" : "#f9fafb"} // color based on theme
                    strokeWidth={3} // thickness
                  />

                  <Tooltip
                    contentStyle={{
                      background: isLight
                        ? "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.98))"
                        : "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.98))",
                      border: `1px solid ${
                        isLight ? "rgba(209,213,219,0.8)" : "rgba(51,65,85,0.9)"
                      }`,
                      borderRadius: "16px",
                      boxShadow: `0 20px 48px ${
                        isLight ? "rgba(15,23,42,0.25)" : "rgba(15,23,42,0.75)"
                      }`,
                      backdropFilter: "blur(16px)",
                      padding: "16px",
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    radius={[10, 10, 0, 0]}
                    fill={
                      isLight
                        ? "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)"
                        : "linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)"
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        </motion.div>

        The three buttons are now centered in the bar (left, middle, right), with only minimal position-related style changes and everything else untouched.
​

jsx
{/* 📱 BOTTOM NAVIGATION BAR - PhonePe/GPay Style */}
        <motion.div
          initial={{ y: 100, opacity: 10 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: easingSoft }}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: isLight
              ? "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.99))"
              : "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(17,24,39,0.99))",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: `1px solid ${
              isLight ? "rgba(209,213,219,0.8)" : "rgba(51,65,85,0.8)"
            }`,
            boxShadow: isLight
              ? "0 -4px 24px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.1)"
              : "0 -4px 24px rgba(15,23,42,0.4), 0 0 0 1px rgba(75,85,99,0.3)",
            zIndex: 1000,
            padding: "12px 20px 20px",
          }}
        >
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "480px",
            margin: "0 auto",
            position: "relative",
            height: "70px",
            gap: "45px",
          }}>
            
            {/* TRANSACTIONS BUTTON - LEFT */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/History", { state: { userId, role: "student" } })}
              style={{
                display: "flex",
                flexDirection: "column",
              
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
                padding: "8px 16px",
                borderRadius: "12px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isLight ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "24px" }}>💳</span>
              <span style={{ 
                fontSize: "11px", 
                fontWeight: "600", 
                color: isLight ? "#374151" : "#d1d5db" 
              }}>Transactions</span>
            </motion.div>


            {/* 📷 SCAN & PAY BUTTON - CENTER (PhonePe Style) */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (frozen) return;
                // Trigger scan functionality
                const scanEvent = new CustomEvent('openScanner');
                window.dispatchEvent(scanEvent);
              }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background: frozen
                  ? "linear-gradient(135deg, #9ca3af, #6b7280)"
                  : "linear-gradient(135deg, #4f46e5, #6366f1, #8b5cf6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                cursor: frozen ? "not-allowed" : "pointer",
                boxShadow: frozen
                  ? "0 4px 12px rgba(107,114,128,0.3)"
                  : "0 8px 24px rgba(79,70,229,0.4), 0 0 0 3px rgba(255,255,255,0.3)",
                border: frozen ? "none" : "2px solid rgba(255,255,255,0.8)",
                opacity: frozen ? 0.6 : 1,
                zIndex: 1001,
              }}
            >
              <span style={{ fontSize: "28px", color: "#fff" }}>📷</span>
              <span style={{ 
                fontSize: "8px", 
                fontWeight: "700", 
                color: "#fff",
                textAlign: "center",
                lineHeight: "1"
              }}>Scan</span>
            </motion.div>


            {/* ⚙️ SETTINGS BUTTON - RIGHT */}
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettingsPopup(!showSettingsPopup)}
              data-settings-trigger
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
                padding: "8px 16px",
                borderRadius: "12px",
                transition: "all 0.2s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = isLight ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
              }}
            >
              <span style={{ fontSize: "24px" }}>⚙️</span>
              <span style={{ 
                fontSize: "11px", 
                fontWeight: "600", 
                color: isLight ? "#374151" : "#d1d5db" 
              }}>Settings</span>
            </motion.div>
          </div>
        </motion.div>


        {/* ⚙️ SETTINGS POPUP */}
        <AnimatePresence>
          {showSettingsPopup && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: easingSoft }}
              className="settings-popup"
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: isLight
                  ? "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.99))"
                  : "linear-gradient(145deg, rgba(15,23,42,0.98), rgba(17,24,39,0.99))",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "16px",
                border: `1px solid ${
                  isLight ? "rgba(209,213,219,0.8)" : "rgba(51,65,85,0.8)"
                }`,
                boxShadow: isLight
                  ? "0 8px 32px rgba(15,23,42,0.12), 0 0 0 1px rgba(148,163,184,0.1)"
                  : "0 8px 32px rgba(15,23,42,0.4), 0 0 0 1px rgba(75,85,99,0.3)",
                padding: "8px",
                zIndex: 1001,
                minWidth: "180px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {/* 👁️ View Profile */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate("/viewv", {
                      state: {
                        vendorId: userId,
                        role: "student",
                      },
                    });
                    setShowSettingsPopup(false);
                  }}
                  style={{
                    padding: "12px 16px",
                    border: "none",
                    borderRadius: "12px",
                    background: "transparent",
                    color: isLight ? "#374151" : "#d1d5db",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontSize: "13px",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = isLight ? "rgba(59,130,246,0.1)" : "rgba(59,130,246,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  👁️ View Profile
                </motion.button>


                {/* ✏️ Edit Profile */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate("/edit-profile", { state: { userId } });
                    setShowSettingsPopup(false);
                  }}
                  style={{
                    padding: "12px 16px",
                    border: "none",
                    borderRadius: "12px",
                    background: "transparent",
                    color: isLight ? "#374151" : "#d1d5db",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontSize: "13px",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = isLight ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  ✏️ Edit Profile
                </motion.button>


                {/* 🔐 Change MPIN */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    navigate("/change-mpin", { state: { userId } });
                    setShowSettingsPopup(false);
                  }}
                  style={{
                    padding: "12px 16px",
                    border: "none",
                    borderRadius: "12px",
                    background: "transparent",
                    color: isLight ? "#374151" : "#d1d5db",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontSize: "13px",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = isLight ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                  }}
                >
                  🔐 Change MPIN
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* 📷 SCANNER OVERLAY - Hidden */}
        <div id="bottom-nav-scanner" style={{ display: "none" }}>
          <ScanPay userId={userId} f={frozen} />
        </div>
      </motion.div>
    </>
  );
}

export default Login;
