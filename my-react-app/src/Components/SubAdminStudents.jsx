import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SubAdminStatusChecker from "./SubAdminStatusChecker.jsx";

function SubAdminStudents({ state }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, frozen, kyc-pending
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/subadmin/students");
      console.log("Students data:", res.data);
      res.data.forEach(student => {
        console.log(`Student: ${student.firstName}, Frozen: ${student.isFrozen}`);
      });
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      alert("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfreeze = async (studentId) => {
    console.log("Unfreeze button clicked for student:", studentId);
    
    if (!window.confirm(
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
    )) {
      return;
    }
    
    try {
      console.log("Sending unfreeze request for student:", studentId);
      const response = await axios.post(
        `http://localhost:5000/subadmin/student/${studentId}/unfreeze`
      );
      
      console.log("Unfreeze response:", response.data);
      alert(response.data.message || "Student unfrozen successfully!");
      fetchStudents();
    } catch (err) {
      console.error("Failed to unfreeze student:", err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert("Failed to unfreeze student");
      }
    }
  };

  
  const handleVerifyKYC = async (studentId, status) => {
    try {
      await axios.post(
        `http://localhost:5000/subadmin/student/${studentId}/kyc`,
        { status }
      );
      alert(`KYC ${status === "verified" ? "verified" : "rejected"}!`);
      fetchStudents();
    } catch (err) {
      console.error("Failed to update KYC:", err);
      alert("Failed to update KYC status");
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
    if (filter === "kyc-pending") return student.kyc?.status === "pending" && matchesSearch;
    return matchesSearch;
  });

  if (loading) return (
    <SubAdminStatusChecker subAdminId={state?.subAdminId || localStorage.getItem('subAdminId')}>
      <p>Loading students...</p>
    </SubAdminStatusChecker>
  );

  const subAdminId = state?.subAdminId || localStorage.getItem('subAdminId');

  return (
    <SubAdminStatusChecker subAdminId={subAdminId}>
      <>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 16px" }}>
        <div
          style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={() => navigate("/subadmin", { state: { role: "SubAdmin", subAdminId: state?.subAdminId || localStorage.getItem('subAdminId') } })}
          style={{
            padding: "10px 15px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "45px",
            height: "45px",
            transition: "all 0.3s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#059669";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#10b981";
            e.target.style.transform = "translateY(0px)";
          }}
        >
          ←
        </button>
        
        <h2 style={{ margin: 0, color: "#1f2937", textAlign: "center", flex: 1 }}>Students & KYC Management</h2>
        
        {/* Search Bar */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "10px", 
          marginBottom: "20px",
          flex: 1,
          maxWidth: "400px"
        }}>
          <input
            type="text"
            placeholder="Search by student name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.3s ease"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#10b981";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
            }}
          />
        </div>
      </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "8px 16px",
              background: filter === "all" ? "#4f46e5" : "#e5e7eb",
              color: filter === "all" ? "white" : "#374151",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter("frozen")}
            style={{
              padding: "8px 16px",
              background: filter === "frozen" ? "#4f46e5" : "#e5e7eb",
              color: filter === "frozen" ? "white" : "#374151",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Frozen
          </button>
          <button
            onClick={() => setFilter("kyc-pending")}
            style={{
              padding: "8px 16px",
              background: filter === "kyc-pending" ? "#4f46e5" : "#e5e7eb",
              color: filter === "kyc-pending" ? "white" : "#374151",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            KYC Pending
          </button>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ color: "#6b7280", fontSize: "18px" }}>
            No students found
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ padding: "16px", textAlign: "left", color: "#374151" }}>
                  Student
                </th>
                <th style={{ padding: "16px", textAlign: "left", color: "#374151" }}>
                  Email
                </th>
                <th style={{ padding: "16px", textAlign: "left", color: "#374151" }}>
                  Status
                </th>
                <th style={{ padding: "16px", textAlign: "left", color: "#374151" }}>
                  KYC Status
                </th>
                <th style={{ padding: "16px", textAlign: "left", color: "#374151" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student._id}
                  style={{ borderBottom: "1px solid #e5e7eb" }}
                >
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {student.ImageUrl && (
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
                      )}
                      <span style={{ fontWeight: "500", color: "#1f2937" }}>
                        {student.firstName} {student.lastName}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "16px", color: "#6b7280" }}>
                    {student.collegeEmail}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        background: student.isFrozen ? "#ef4444" : "#10b981",
                        color: "white",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
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
                            ? "#10b981"
                            : student.kyc?.status === "rejected"
                            ? "#ef4444"
                            : "#f59e0b",
                        color: "white",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {student.kyc?.status?.toUpperCase() || "N/A"}
                    </span>
                    {console.log(`Student ${student.firstName} KYC:`, student.kyc)}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {student.isFrozen && (
                        <button
                          onClick={() => handleUnfreeze(student._id)}
                          style={{
                            padding: "6px 12px",
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          Unfreeze
                        </button>
                      )}
                      {student.kyc?.status === "pending" && student.kyc?.imageUrl && (
                        <>
                          <button
                            onClick={() => {
                              window.open(student.kyc.imageUrl, "_blank");
                            }}
                            style={{
                              padding: "6px 12px",
                              background: "#3b82f6",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            View KYC
                          </button>
                          <button
                            onClick={() => handleVerifyKYC(student._id, "verified")}
                            style={{
                              padding: "6px 12px",
                              background: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleVerifyKYC(student._id, "rejected")}
                            style={{
                              padding: "6px 12px",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {student.kyc?.status === "rejected" && student.kyc?.imageUrl && (
                        <>
                          <button
                            onClick={() => {
                              window.open(student.kyc.imageUrl, "_blank");
                            }}
                            style={{
                              padding: "6px 12px",
                              background: "#3b82f6",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            View KYC
                          </button>
                          <button
                            onClick={() => handleVerifyKYC(student._id, "verified")}
                            style={{
                              padding: "6px 12px",
                              background: "#10b981",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            Re-verify
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
    </SubAdminStatusChecker>
  );
}

export default SubAdminStudents;
