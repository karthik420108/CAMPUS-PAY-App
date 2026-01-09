import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SubAdminStatusChecker from "./SubAdminStatusChecker.jsx";
import { useAlert } from "../context/AlertContext";
import API_CONFIG from "../config/api";

function SubAdminStudents({ state }) {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // --- Original Logic State ---
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, frozen, kyc-pending
  const [searchTerm, setSearchTerm] = useState("");

  // --- Theme State ---
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(API_CONFIG.getUrl("/subadmin/students"));
      console.log("Students data:", res.data);
      res.data.forEach((student) => {
        console.log(
          `Student: ${student.firstName}, Frozen: ${student.isFrozen}`
        );
      });
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      showAlert({
        type: "error",
        title: "Loading Failed",
        message: "Failed to load students"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnfreeze = async (studentId) => {
    console.log("Unfreeze button clicked for student:", studentId);

    if (
      !window.confirm(
        "Are you sure you want to unfreeze this student?\n\n" +
          "This will:\n" +
          "• Unfreeze the student account\n" +
          "• Reset wallet balance to ₹0\n" +
          "• Clear all transaction history\n" +
          "• Delete all complaint history\n" +
          "• Reset registration date to today\n" +
          "• Keep KYC status unchanged\n\n" +
          "Student will start fresh but keep existing KYC verification!\n" +
          "This action cannot be undone!"
      )
    ) {
      return;
    }

    try {
      console.log("Sending unfreeze request for student:", studentId);
      const response = await axios.post(
        API_CONFIG.getUrl(`/subadmin/student/${studentId}/unfreeze`)
      );

      console.log("Unfreeze response:", response.data);
      showAlert({
        type: "success",
        title: "Student Unfrozen",
        message: response.data.message || "Student unfrozen successfully!"
      });
      fetchStudents();
    } catch (err) {
      console.error("Failed to unfreeze student:", err);
      if (err.response?.data?.message) {
        showAlert({
          type: "error",
          title: "Unfreeze Failed",
          message: err.response.data.message
        });
      } else {
        showAlert({
          type: "error",
          title: "Unfreeze Failed",
          message: "Failed to unfreeze student"
        });
      }
    }
  };

  const handleVerifyKYC = async (studentId, status) => {
    try {
      await axios.post(
        API_CONFIG.getUrl(`/subadmin/student/${studentId}/kyc`),
        { status }
      );
      showAlert({
        type: "success",
        title: "KYC Updated",
        message: `KYC ${status === "verified" ? "verified" : "rejected"}!`
      });
      fetchStudents();
    } catch (err) {
      console.error("Failed to update KYC:", err);
      showAlert({
        type: "error",
        title: "KYC Update Failed",
        message: "Failed to update KYC status"
      });
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      student.firstName?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower) ||
      student.collegeEmail?.toLowerCase().includes(searchLower) ||
      student._id?.toLowerCase().includes(searchLower);

    if (filter === "frozen") return student.isFrozen && matchesSearch;
    if (filter === "kyc-pending")
      return student.kyc?.status === "pending" && matchesSearch;
    return matchesSearch;
  });

  // --- STYLING CONSTANTS ---
  const isLight = theme === "light";
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

  const buttonBase = {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.1s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  };

  const subAdminId =
    state?.subAdminId || localStorage.getItem("subAdminId");

  if (loading) {
    return (
      <SubAdminStatusChecker subAdminId={subAdminId}>
        <div
          style={{
            ...pageStyle,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: textMain,
          }}
        >
          Loading students...
        </div>
      </SubAdminStatusChecker>
    );
  }

  return (
    <SubAdminStatusChecker subAdminId={subAdminId}>
      <motion.div
        style={{
          ...pageStyle,
          minHeight: "100vh",
          padding: "40px 16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated Background Orbs */}
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
          }}
          animate={{ x: [0, 40, -20, 0], y: [0, 18, -12, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: easingSoft }}
          style={{
            width: "100%",
            maxWidth: "1280px",
            borderRadius: 28,
            padding: "30px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            color: textMain,
            position: "relative",
            marginTop: "20px",
            ...cardStyle,
          }}
        >
          {/* Theme Toggle */}
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 6px",
              borderRadius: 999,
              border: `1px solid ${
                isLight ? "rgba(148,163,184,0.6)" : "rgba(148,163,184,0.4)"
              }`,
              background: isLight ? "#f9fafb" : "rgba(15,23,42,0.8)",
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: 11, color: textSub, paddingLeft: 4 }}>
              Mode
            </span>
            <button
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
                background: isLight
                  ? "linear-gradient(120deg,#020617,#0f172a)"
                  : "linear-gradient(120deg,#e5f2ff,#dbeafe)",
                color: isLight ? "#e5e7eb" : "#0f172a",
              }}
            >
              {isLight ? "Dark" : "Light"}
            </button>
          </div>

          {/* Header Section */}
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={() =>
                  navigate("/subadmin", {
                    state: {
                      role: "SubAdmin",
                      subAdminId:
                        state?.subAdminId ||
                        localStorage.getItem("subAdminId"),
                    },
                  })
                }
                style={{
                  ...buttonBase,
                  background: isLight ? "#10b981" : "#059669",
                  color: "white",
                  padding: "8px 12px",
                }}
              >
                ← Back
              </button>
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: 700,
                  color: textMain,
                }}
              >
                Students & KYC Management
              </h2>
            </div>

            {/* Controls: Search & Filters */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <input
                type="text"
                placeholder="Search by student name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: "280px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: `1px solid ${isLight ? "#cbd5e1" : "#475569"}`,
                  background: isLight ? "#fff" : "#0f172a",
                  color: textMain,
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setFilter("all")}
                  style={{
                    ...buttonBase,
                    background:
                      filter === "all"
                        ? "#4f46e5"
                        : isLight
                        ? "#e5e7eb"
                        : "#1e293b",
                    color:
                      filter === "all" ? "white" : isLight ? "#374151" : textSub,
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter("frozen")}
                  style={{
                    ...buttonBase,
                    background:
                      filter === "frozen"
                        ? "#4f46e5"
                        : isLight
                        ? "#e5e7eb"
                        : "#1e293b",
                    color:
                      filter === "frozen"
                        ? "white"
                        : isLight
                        ? "#374151"
                        : textSub,
                  }}
                >
                  Frozen
                </button>
                <button
                  onClick={() => setFilter("kyc-pending")}
                  style={{
                    ...buttonBase,
                    background:
                      filter === "kyc-pending"
                        ? "#4f46e5"
                        : isLight
                        ? "#e5e7eb"
                        : "#1e293b",
                    color:
                      filter === "kyc-pending"
                        ? "white"
                        : isLight
                        ? "#374151"
                        : textSub,
                  }}
                >
                  KYC Pending
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              height: 2,
              width: "100%",
              background:
                "linear-gradient(90deg,#0ea5e9,#38bdf8,#22c55e,#0f766e)",
              marginBottom: 30,
              opacity: 0.6,
              borderRadius: 999,
            }}
          />

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            {filteredStudents.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px",
                  background: isLight
                    ? "rgba(255,255,255,0.4)"
                    : "transparent",
                  borderRadius: "12px",
                  color: textSub,
                }}
              >
                No students found
              </div>
            ) : (
              <table
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: `2px solid ${
                        isLight ? "#e5e7eb" : "#334155"
                      }`,
                    }}
                  >
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: textSub,
                        textTransform: "uppercase",
                        fontSize: "12px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Student
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: textSub,
                        textTransform: "uppercase",
                        fontSize: "12px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Email
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: textSub,
                        textTransform: "uppercase",
                        fontSize: "12px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: textSub,
                        textTransform: "uppercase",
                        fontSize: "12px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      KYC Status
                    </th>
                    <th
                      style={{
                        padding: "16px",
                        textAlign: "left",
                        color: textSub,
                        textTransform: "uppercase",
                        fontSize: "12px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <motion.tr
                      key={student._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        borderBottom: `1px solid ${
                          isLight ? "#e5e7eb" : "rgba(255,255,255,0.05)"
                        }`,
                      }}
                    >
                      <td style={{ padding: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          {student.ImageUrl ? (
                            <img
                              src={student.ImageUrl}
                              alt={student.firstName}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: isLight ? "#e2e8f0" : "#334155",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: textSub,
                                fontWeight: "bold",
                              }}
                            >
                              {student.firstName?.[0]}
                            </div>
                          )}
                          <span
                            style={{
                              fontWeight: "600",
                              color: textMain,
                            }}
                          >
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "16px", color: textSub }}>
                        {student.collegeEmail}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            background: student.isFrozen
                              ? "rgba(239,68,68,0.2)"
                              : "rgba(34,197,94,0.2)",
                            color: student.isFrozen ? "#ef4444" : "#22c55e",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "700",
                            border: `1px solid ${
                              student.isFrozen
                                ? "rgba(239,68,68,0.3)"
                                : "rgba(34,197,94,0.3)"
                            }`,
                          }}
                        >
                          {student.isFrozen ? "Frozen" : "Active"}
                        </span>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span
                          style={{
                            padding: "4px 12px",
                            background:
                              student.kyc?.status === "verified"
                                ? "rgba(34,197,94,0.2)"
                                : student.kyc?.status === "rejected"
                                ? "rgba(239,68,68,0.2)"
                                : "rgba(245,158,11,0.2)",
                            color:
                              student.kyc?.status === "verified"
                                ? "#22c55e"
                                : student.kyc?.status === "rejected"
                                ? "#ef4444"
                                : "#f59e0b",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            border: `1px solid ${
                              student.kyc?.status === "verified"
                                ? "rgba(34,197,94,0.3)"
                                : student.kyc?.status === "rejected"
                                ? "rgba(239,68,68,0.3)"
                                : "rgba(245,158,11,0.3)"
                            }`,
                          }}
                        >
                          {student.kyc?.status || "N/A"}
                        </span>
                        {console.log(
                          `Student ${student.firstName} KYC:`,
                          student.kyc
                        )}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          {student.isFrozen && (
                            <button
                              onClick={() => handleUnfreeze(student._id)}
                              style={{
                                ...buttonBase,
                                background: "#10b981",
                                color: "white",
                              }}
                            >
                              Unfreeze
                            </button>
                          )}
                          {student.kyc?.status === "pending" &&
                            student.kyc?.imageUrl && (
                              <>
                                <button
                                  onClick={() =>
                                    window.open(student.kyc.imageUrl, "_blank")
                                  }
                                  style={{
                                    ...buttonBase,
                                    background: "#3b82f6",
                                    color: "white",
                                  }}
                                >
                                  View KYC
                                </button>
                                <button
                                  onClick={() =>
                                    handleVerifyKYC(student._id, "verified")
                                  }
                                  style={{
                                    ...buttonBase,
                                    background: "#10b981",
                                    color: "white",
                                  }}
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() =>
                                    handleVerifyKYC(student._id, "rejected")
                                  }
                                  style={{
                                    ...buttonBase,
                                    background: "#ef4444",
                                    color: "white",
                                  }}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          {student.kyc?.status === "rejected" &&
                            student.kyc?.imageUrl && (
                              <>
                                <button
                                  onClick={() =>
                                    window.open(student.kyc.imageUrl, "_blank")
                                  }
                                  style={{
                                    ...buttonBase,
                                    background: "#3b82f6",
                                    color: "white",
                                  }}
                                >
                                  View KYC
                                </button>
                                <button
                                  onClick={() =>
                                    handleVerifyKYC(student._id, "verified")
                                  }
                                  style={{
                                    ...buttonBase,
                                    background: "#10b981",
                                    color: "white",
                                  }}
                                >
                                  Re-verify
                                </button>
                              </>
                            )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </motion.div>
    </SubAdminStatusChecker>
  );
}

export default SubAdminStudents;
