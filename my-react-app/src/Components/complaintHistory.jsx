import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Header1 from "./Header1";
import Header from "./Header3"
function ComplaintHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, vendorId, role } = location.state || {};

  // Support both userId (for students) and vendorId (for vendors)
  const id = userId || vendorId;

  const [complaints, setComplaints] = useState([]);
  const [openCard, setOpenCard] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // Defaults to "active"
  const [complaintSearch, setComplaintSearch] = useState("");
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
  const [loading, setLoading] = useState(true);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [blockingMessage, setBlockingMessage] = useState("");

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userRes = await axios.get(`http://localhost:5000/user/${id}`);
        const { isFrozen, isSuspended } = userRes.data;

        setIsFrozen(isFrozen);
        setIsSuspended(isSuspended);

        
        if (isSuspended) {
          setBlockingMessage(
            "Your account is suspended. Redirecting to homepage..."
          );
          setTimeout(() => navigate("/", { state: { id } }), 2500);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserData();

    // Optional: real-time polling every 5s
    const interval = setInterval(fetchUserData, 5000);
    return () => clearInterval(interval);
  }, [id, navigate]);

  if (blockingMessage) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 18,
          fontWeight: 600,
          color: "#ef4444",
        }}
      >
        {blockingMessage}
      </div>
    );
  }

  if (!id) {
    navigate("/");
    return null;
  }

useEffect(() => {
  if (!id) return;

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/complaints/user/${id}`
      );

      const complaintsData = res.data.complaints || [];
      console.log(`📄 Fetched ${complaintsData.length} complaints for user ${id}:`);

      complaintsData.forEach((complaint, index) => {
        console.log(`\nComplaint #${index + 1} (ID: ${complaint.complaintId}):`);
        console.log(`  - Description: ${complaint.description}`);
        console.log(`  - Role: ${complaint.role}`);
        console.log(`  - Screenshot: ${complaint.screenshot || "None"}`);

        if (complaint.assignedAdmins && complaint.assignedAdmins.length > 0) {
          console.log(`  - Assigned Admins (${complaint.assignedAdmins.length}):`);
          complaint.assignedAdmins.forEach((admin, i) => {
            if (typeof admin === "object" && admin._id) {
              console.log(`      ${i + 1}. ${admin.name || "(no name)"} [ID: ${admin._id}]`);
            } else {
              console.log(`      ${i + 1}. Admin ID: ${admin}`);
            }
          });
        } else {
          console.log("  - Assigned Admins: None");
        }

        console.log(`  - Status: ${complaint.status || "Pending"}`);
        console.log(`  - Created At: ${complaint.createdAt}`);
      });

      setComplaints(complaintsData);
    } catch (error) {
      console.error("❌ Failed to fetch complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  fetchComplaints();

  // Poll every 5 seconds
  const interval = setInterval(fetchComplaints, 5000);

  // Cleanup on unmount
  return () => clearInterval(interval);
}, [id]);



  const isLight = theme === "light";

  // ---------- EXACT ENUM MATCHING ----------
  const activeComplaints = complaints.filter(
    (c) => (c.status || "").toLowerCase() === "active"
  );
  const resolvedComplaints = complaints.filter(
    (c) => (c.status || "").toLowerCase() === "resolved"
  );

  const handleViewScreenshot = (screenshotUrl, complaint) => {
    navigate("/screenshot-viewer", {
      state: {
        screenshotUrl: screenshotUrl,
        complaintId: complaint.complaintId,
        studentName: role === "student" ? "You" : complaint.studentName || "Unknown"
      }
    });
  };

  const currentComplaints =
    activeTab === "active" ? activeComplaints : resolvedComplaints;

  const trimmedSearch = complaintSearch.trim().toLowerCase();
  const visibleComplaints = trimmedSearch
    ? currentComplaints.filter((c) => {
        const id = String(c.complaintId || c._id || "").toLowerCase();
        return id.includes(trimmedSearch);
      })
    : currentComplaints;

  useEffect(() => {
    if (!openCard) return;
    const stillVisible = visibleComplaints.some((c) => c._id === openCard);
    if (!stillVisible) setOpenCard(null);
  }, [openCard, visibleComplaints]);

  // ---------- THEME-DEPENDENT STYLES (exact copy from RaiseComplaint) ----------
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
          "linear-gradient(145deg, rgba(255,255,255,0.97), rgba(239,246,255,0.99))",
        border: "1px solid rgba(148,163,184,0.4)",
        boxShadow:
          "0 18px 40px rgba(15,23,42,0.16), 0 0 0 1px rgba(148,163,184,0.25)",
      }
    : {
        background:
          "linear-gradient(145deg, rgba(15,23,42,0.88), rgba(15,23,42,0.98))",
        border: "1px solid rgba(148,163,184,0.45)",
        boxShadow:
          "0 20px 50px rgba(15,23,42,0.85), 0 0 0 1px rgba(30,64,175,0.65)",
      };

  const easingSoft = [0.16, 1, 0.3, 1];

  if (loading) {
    return (
      <motion.div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          ...pageStyle,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(59,130,246,0.3)",
            borderTop: "3px solid #3b82f6",
            borderRadius: "50%",
          }}
        />
      </motion.div>
    );
  }

  return (
    <>
      <Header1 userId={id} role={role} isFrozen={isFrozen} />
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
        {/* floating blobs */}
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

        {/* main card container */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: easingSoft }}
          style={{
            width: "100%",
            maxWidth: 850,
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
            ...cardStyle,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 14,
              border: "1px solid rgba(148,163,184,0.6)",
              background: isLight ? "rgba(255,255,255,0.7)" : "rgba(15,23,42,0.7)",
              zIndex: 6,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <input
              value={complaintSearch}
              onChange={(e) => setComplaintSearch(e.target.value)}
              placeholder="Search Complaint ID"
              style={{
                width: 210,
                border: "none",
                outline: "none",
                background: "transparent",
                color: textMain,
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            {complaintSearch.trim() !== "" && (
              <button
                type="button"
                onClick={() => setComplaintSearch("")}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 14,
                  lineHeight: 1,
                  color: textSub,
                  padding: 0,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* top accent */}
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

          {/* title */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: easingSoft }}
            style={{ textAlign: "center" }}
          >
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
                fontSize: 24,
                letterSpacing: "0.05em",
                fontWeight: 700,
                color: textMain,
                margin: 0,
              }}
            >
              Complaint History
            </h2>
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
              margin: "0 4px 8px",
            }}
          />

          {/* tabs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4, ease: easingSoft }}
            style={{ display: "flex", gap: 10, justifyContent: "center" }}
          >
            {[
              {
                key: "active",
                label: "Active",
                count: activeComplaints.length,
              },
              {
                key: "resolved",
                label: "Resolved",
                count: resolvedComplaints.length,
              },
            ].map(({ key, label, count }) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: "10px 22px",
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,0.4)",
                  background:
                    activeTab === key
                      ? "linear-gradient(120deg,#3b82f6,#0ea5e9)"
                      : isLight
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(15,23,42,0.7)",
                  color: activeTab === key ? "#f9fafb" : textMain,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  boxShadow:
                    activeTab === key
                      ? "0 8px 24px rgba(59,130,246,0.4)"
                      : "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                {label}
                {count > 0 && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      fontWeight: 500,
                      opacity: activeTab === key ? 0.9 : 0.7,
                    }}
                  >
                    ({count})
                  </span>
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* empty state */}
          {visibleComplaints.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: easingSoft }}
              style={{
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  width: 64,
                  height: 64,
                  margin: "0 auto 16px",
                  borderRadius: "50%",
                  background: isLight
                    ? "linear-gradient(120deg,#dbeafe,#93c5fd)"
                    : "linear-gradient(120deg,#1e40af,#3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 12px 32px rgba(59,130,246,0.2)",
                }}
              >
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: isLight ? "#3b82f6" : "#60a5fa",
                  }}
                >
                  {activeTab === "active" ? "📋" : "✅"}
                </span>
              </motion.div>
              <p
                style={{
                  color: textMain,
                  fontSize: 15,
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                {trimmedSearch
                  ? "No matching complaints"
                  : activeTab === "active"
                  ? "No active complaints"
                  : "No resolved complaints"}
              </p>
              <p style={{ color: textSub, fontSize: 13 }}>
                {trimmedSearch
                  ? "Try a different complaint id"
                  : activeTab === "active"
                  ? "Raise your first complaint using the form"
                  : "Resolved complaints will appear here"}
              </p>
            </motion.div>
          )}

          {/* ✅ ALL FUNCTIONALITY RESTORED */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {visibleComplaints.map((c, index) => {
              const isOpen = openCard === c._id;
              const statusColor =
                c.status?.toLowerCase() === "resolved" ? "#22c55e" : "#3b82f6";

              return (
                <motion.div
                  key={c._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.03,
                    duration: 0.4,
                    ease: easingSoft,
                  }}
                  whileHover={{
                    y: -3,
                    boxShadow:
                      "0 24px 60px rgba(15,23,42,0.20), 0 0 0 1px rgba(148,163,184,0.35)",
                  }}
                  onClick={() => setOpenCard(isOpen ? null : c._id)}
                  style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    cursor: "pointer",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    ...cardStyle,
                  }}
                >
                  {/* top accent */}
                  <motion.div
                    style={{
                      height: 2,
                      background:
                        "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
                      opacity: 0.9,
                    }}
                    animate={{ x: [-8, 8, -8] }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* header */}
                  <div
                    style={{
                      padding: "14px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: textSub,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          marginBottom: 2,
                        }}
                      >
                        Complaint ID
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: textMain,
                          wordBreak: "break-all",
                        }}
                      >
                        {c.complaintId}
                      </div>
                    </div>

                    <motion.span
                      animate={{
                        boxShadow: [
                          `0 0 0 0 ${statusColor}33`,
                          `0 0 0 10px ${statusColor}00`,
                        ],
                      }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        background: statusColor,
                        color: "#020617",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        minWidth: 88,
                        textAlign: "center",
                      }}
                    >
                      {c.status || "Unknown"}
                    </motion.span>
                  </div>

                  {/* divider */}
                  <div
                    style={{
                      height: 1,
                      background:
                        "linear-gradient(90deg,transparent,#e5e7eb,#e5e7eb,transparent)",
                      opacity: 0.9,
                    }}
                  />

                  {/* ✅ COLLAPSIBLE DETAILS - ALL FIELDS RESTORED */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                        transition={easingSoft}
                        style={{
                          padding: "12px 18px 16px",
                          borderTop: "1px solid rgba(226,232,240,0.9)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          fontSize: 13,
                          color: textMain,
                        }}
                      >
                        {/* ✅ DESCRIPTION */}
                        <p style={{ margin: 0, lineHeight: 1.5 }}>
                          <span
                            style={{
                              fontWeight: 600,
                              color: textMain,
                              marginRight: 6,
                            }}
                          >
                            Description:
                          </span>
                          {c.description || "—"}
                        </p>

                        {/* ✅ ADMINS */}
                       { role != "vendor" && <p style={{ margin: 0, lineHeight: 1.5 }}>
                          <span
                            style={{
                              fontWeight: 600,
                              color: textMain,
                              marginRight: 6,
                            }}
                          >
                            Assigned Admins:
                          </span>
                          {c.assignedAdmins && c.assignedAdmins.length > 0
                            ? c.assignedAdmins
                                .map((a) => {
                                  if (a.type === "Admin") {
                                    return a.email;
                                  } else if (a.type === "SubAdmin") {
                                    return a.name || a.email;
                                  }
                                  return a.email || a.name;
                                })
                                .filter(Boolean)
                                .join(", ")
                            : "—"}
                        </p>}

                        {/* ✅ DATE */}
                        <p style={{ margin: 0, lineHeight: 1.5 }}>
                          <span
                            style={{
                              fontWeight: 600,
                              color: textMain,
                              marginRight: 6,
                            }}
                          >
                            Date:
                          </span>
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleString()
                            : "—"}
                        </p>

                        {/* ✅ ADMIN RESPONSE */}
                        {c.response && (
                          <div
                            style={{
                              margin: "8px 0",
                              padding: "10px",
                              backgroundColor: isLight ? "#f0fdf4" : "#14532d",
                              borderRadius: "8px",
                              border: `1px solid ${
                                isLight ? "#bbf7d0" : "#22c55e"
                              }`,
                            }}
                          >
                            <p style={{ margin: 0, lineHeight: 1.5 }}>
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: isLight ? "#166534" : "#86efac",
                                  marginRight: 6,
                                  display: "block",
                                  marginBottom: 4,
                                }}
                              >
                                💬 Admin Response:
                              </span>
                              <span
                                style={{
                                  fontStyle: "italic",
                                  color: isLight ? "#15803d" : "#bbf7d0",
                                }}
                              >
                                {c.response}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* ✅ SCREENSHOT */}
                        {c.screenshot && (
                          <div style={{ marginTop: 8 }}>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewScreenshot(c.screenshot, c);
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                padding: "8px 16px",
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 600,
                                border: "none",
                                cursor: "pointer",
                                background:
                                  "linear-gradient(120deg,#86efac,#22c55e)",
                                color: "#020617",
                                boxShadow: "0 10px 24px rgba(22,163,74,0.35)",
                              }}
                            >
                              📸 View Screenshot
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default ComplaintHistory;